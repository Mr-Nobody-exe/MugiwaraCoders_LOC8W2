import Submission from '../models/Submission.js';
import Team from '../models/Team.js';
import Event from '../models/Event.js';
import { uploadToCloudinary } from '../services/upload.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success, error, notFound } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

// @desc  Submit Round 2 (final) PPT + GitHub link
// @route POST /api/submissions/:teamId/round2
// @access Student
export const submitRound2 = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { githubLink, demoVideoUrl } = req.body;

  const team = await Team.findById(teamId).populate('event');
  if (!team) return res.status(404).json(notFound('Team not found'));

  // Only team members
  if (!team.members.map(String).includes(String(req.user._id))) {
    return res.status(403).json(error('You are not a member of this team', 403));
  }

  // Must be qualified from round 1
  if (!team.isQualified) {
    return res.status(403).json(error('Team is not qualified for Round 2', 403));
  }

  // Check deadline
  const deadline = team.event?.deadlines?.round2Submission;
  if (deadline && new Date() > new Date(deadline)) {
    return res.status(400).json(error('Round 2 submission deadline has passed', 400));
  }

  // Check if already locked
  const existing = await Submission.findOne({ team: teamId, round: 2 });
  if (existing?.isLocked) {
    return res.status(400).json(error('Submission is locked and cannot be updated', 400));
  }

  let pptUrl;
  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'round2', 'raw');
    pptUrl = uploadResult.secure_url;
  }

  const submission = await Submission.findOneAndUpdate(
    { team: teamId, round: 2 },
    {
      event: team.event._id,
      ...(pptUrl && { pptUrl }),
      ...(githubLink && { githubLink }),
      ...(demoVideoUrl && { demoVideoUrl }),
      submittedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  logger.info(`Round 2 submission updated for team ${teamId}`);
  res.json(success(submission, 'Round 2 submission saved'));
});

// @desc  Get all submissions for a team
// @route GET /api/submissions/:teamId
// @access Protected
export const getTeamSubmissions = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const submissions = await Submission.find({ team: teamId }).sort({ round: 1 });
  if (!submissions.length) return res.status(404).json(notFound('No submissions found for this team'));

  res.json(success(submissions, 'Submissions fetched'));
});

// @desc  Lock a submission (admin — prevent further edits)
// @route PATCH /api/submissions/:submissionId/lock
// @access Admin
export const lockSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findByIdAndUpdate(
    req.params.submissionId,
    { isLocked: true },
    { new: true }
  );

  if (!submission) return res.status(404).json(notFound('Submission not found'));

  logger.info(`Submission locked: ${submission._id}`);
  res.json(success(submission, 'Submission locked'));
});