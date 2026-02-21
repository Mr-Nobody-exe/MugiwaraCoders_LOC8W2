import Team from '../models/Team.js';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Event from '../models/Event.js';
import { uploadToCloudinary } from '../services/upload.service.js';
import { extractTextFromPPT, evaluatePPT } from '../services/ai.service.js';
import { computeWeightedScore, AI_WEIGHTS } from '../services/evaluation.service.js';
import Evaluation from '../models/Evaluation.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success, error, notFound } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

// @desc  Create a new team
// @route POST /api/teams
// @access Student
export const createTeam = asyncHandler(async (req, res) => {
  const { name, eventId, problemStatement } = req.body;

  // Check student isn't already in a team for this event
  const existingTeam = await Team.findOne({
    event: eventId,
    members: req.user._id,
  });
  if (existingTeam) {
    return res.status(409).json(error('You are already in a team for this event', 409));
  }

  const event = await Event.findById(eventId);
  if (!event || !event.isActive) {
    return res.status(404).json(notFound('Event not found or inactive'));
  }

  const team = await Team.create({
    name,
    event: eventId,
    leader: req.user._id,
    members: [req.user._id],
    problemStatement,
  });

  // Link team to user
  await User.findByIdAndUpdate(req.user._id, { teamId: team._id });

  logger.info(`Team created: ${team.name} for event ${eventId}`);
  res.status(201).json(success(team, 'Team created', 201));
});

// @desc  Get team by ID
// @route GET /api/teams/:id
// @access Protected
export const getTeamById = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate('members', 'name email verificationStatus')
    .populate('leader', 'name email')
    .populate('event', 'title deadlines');

  if (!team) return res.status(404).json(notFound('Team not found'));

  res.json(success(team, 'Team fetched'));
});

// @desc  Get the current student's team
// @route GET /api/teams/my
// @access Student
export const getMyTeam = asyncHandler(async (req, res) => {
  const team = await Team.findOne({ members: req.user._id })
    .populate('members', 'name email verificationStatus')
    .populate('leader', 'name email')
    .populate('event', 'title deadlines');

  if (!team) return res.status(404).json(notFound('You are not in any team'));

  res.json(success(team, 'Team fetched'));
});

// @desc  Join an existing team
// @route POST /api/teams/:id/join
// @access Student
export const joinTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id).populate('event');
  if (!team) return res.status(404).json(notFound('Team not found'));

  // Already a member
  if (team.members.includes(req.user._id)) {
    return res.status(409).json(error('You are already in this team', 409));
  }

  // Already in another team for this event
  const existingTeam = await Team.findOne({
    event: team.event._id,
    members: req.user._id,
  });
  if (existingTeam) {
    return res.status(409).json(error('You are already in a team for this event', 409));
  }

  // Team size limit
  if (team.members.length >= team.event.maxTeamSize) {
    return res.status(400).json(error(`Team is full (max ${team.event.maxTeamSize} members)`, 400));
  }

  team.members.push(req.user._id);
  await team.save();

  await User.findByIdAndUpdate(req.user._id, { teamId: team._id });

  res.json(success(team, 'Joined team successfully'));
});

// @desc  Upload Round 1 PPT and trigger AI evaluation
// @route POST /api/teams/:id/round1
// @access Student
export const uploadRound1PPT = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id).populate('event');
  if (!team) return res.status(404).json(notFound('Team not found'));

  // Only team members can upload
  if (!team.members.map(String).includes(String(req.user._id))) {
    return res.status(403).json(error('You are not a member of this team', 403));
  }

  // Check deadline
  const deadline = team.event?.deadlines?.round1Submission;
  if (deadline && new Date() > new Date(deadline)) {
    return res.status(400).json(error('Round 1 submission deadline has passed', 400));
  }

  if (!req.file) return res.status(400).json(error('PPT file is required', 400));

  // Upload to Cloudinary (use 'raw' for pptx)
  const uploadResult = await uploadToCloudinary(req.file.buffer, 'round1', 'raw');
  const pptUrl = uploadResult.secure_url;

  // Upsert submission
  const submission = await Submission.findOneAndUpdate(
    { team: team._id, round: 1 },
    { pptUrl, event: team.event._id, isLocked: false, submittedAt: new Date() },
    { upsert: true, new: true }
  );

  // Update team record
  team.round1PPTUrl = pptUrl;
  team.round1Status = 'submitted';
  await team.save();

  // Async AI evaluation (fire and forget — don't block the response)
  runAIEvaluation(team, submission).catch((err) =>
    logger.error(`AI evaluation failed for team ${team._id}: ${err.message}`)
  );

  logger.info(`Round 1 PPT uploaded for team ${team.name}`);
  res.json(success({ pptUrl, submissionId: submission._id }, 'Round 1 PPT submitted. AI evaluation in progress.'));
});

// Internal helper — runs after response is sent
const runAIEvaluation = async (team, submission) => {
  const extractedText = await extractTextFromPPT(null, submission.pptUrl);
  const { parsed: aiScores, raw } = await evaluatePPT(extractedText);

  if (!aiScores) {
    logger.warn(`AI returned unparseable response for team ${team._id}`);
    return;
  }

  const scoreMap = {
    innovation: aiScores.innovation?.score ?? 0,
    feasibility: aiScores.feasibility?.score ?? 0,
    presentation: aiScores.presentation?.score ?? 0,
    technicalDepth: aiScores.technicalDepth?.score ?? 0,
    impact: aiScores.impact?.score ?? 0,
  };

  const weightedTotal = computeWeightedScore(scoreMap, AI_WEIGHTS);

  await Evaluation.findOneAndUpdate(
    { team: team._id, round: 1 },
    {
      submission: submission._id,
      aiScores: scoreMap,
      weightedTotal,
      aiRawResponse: raw,
    },
    { upsert: true, new: true }
  );

  await Submission.findByIdAndUpdate(submission._id, { extractedText });
  await Team.findByIdAndUpdate(team._id, { round1Status: 'evaluated' });

  logger.info(`AI evaluation complete for team ${team._id}, score: ${weightedTotal}`);
};