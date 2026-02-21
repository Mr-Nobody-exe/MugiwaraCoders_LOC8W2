import Team from '../models/Team.js';
import Evaluation from '../models/Evaluation.js';
import Submission from '../models/Submission.js';
import Event from '../models/Event.js';
import {
  computeWeightedScore,
  computeFinalScore,
  JUDGE_WEIGHTS,
} from '../services/evaluation.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success, error, notFound } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

// @desc  Get teams assigned to this judge (via their event)
// @route GET /api/judge/teams
// @access Judge
export const getAssignedTeams = asyncHandler(async (req, res) => {
  // Find events where this judge is assigned
  const events = await Event.find({ judges: req.user._id, isActive: true }).select('_id title');
  if (!events.length) return res.status(404).json(notFound('No events assigned to you'));

  const eventIds = events.map((e) => e._id);

  const teams = await Team.find({
    event: { $in: eventIds },
    isQualified: true,              // Only Round 2 qualified teams
  })
    .populate('members', 'name email')
    .populate('leader', 'name email')
    .populate('event', 'title');

  res.json(success({ events, teams }, 'Assigned teams fetched'));
});

// @desc  Submit judge scores for a team
// @route POST /api/judge/score/:teamId
// @access Judge
export const submitJudgeScore = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { innovation, execution, presentation, scalability, overallImpression, comments } = req.body;

  // Validate all scores are present
  const requiredFields = ['innovation', 'execution', 'presentation', 'scalability', 'overallImpression'];
  const missing = requiredFields.filter((f) => req.body[f] === undefined);
  if (missing.length) {
    return res.status(400).json(error(`Missing scores: ${missing.join(', ')}`, 400));
  }

  const team = await Team.findById(teamId);
  if (!team) return res.status(404).json(notFound('Team not found'));

  if (!team.isQualified) {
    return res.status(403).json(error('Team is not in Round 2', 403));
  }

  const judgeScores = { innovation, execution, presentation, scalability, overallImpression };
  const judgeWeightedScore = computeWeightedScore(judgeScores, JUDGE_WEIGHTS);

  // Get AI evaluation for this team to blend scores
  const existingEval = await Evaluation.findOne({ team: teamId, round: 1 });
  const aiWeightedScore = existingEval?.weightedTotal ?? 0;

  const finalScore = computeFinalScore(aiWeightedScore, judgeWeightedScore);

  // Upsert judge evaluation for round 2
  const evaluation = await Evaluation.findOneAndUpdate(
    { team: teamId, round: 2, judge: req.user._id },
    {
      judgeScores,
      judgeComments: comments,
      weightedTotal: judgeWeightedScore,
    },
    { upsert: true, new: true }
  );

  // Update team's total score and trigger re-ranking
  await Team.findByIdAndUpdate(teamId, { totalScore: finalScore });
  await recalculateRanks(team.event);

  // Emit real-time leaderboard update
  req.io.to(`event:${team.event}`).emit('leaderboard:update', {
    teamId,
    finalScore,
  });

  logger.info(`Judge ${req.user._id} scored team ${teamId}: ${judgeWeightedScore} (final: ${finalScore})`);
  res.json(success({ evaluation, finalScore }, 'Scores submitted'));
});

// @desc  Get leaderboard for an event
// @route GET /api/judge/leaderboard/:eventId
// @access Judge
export const getLeaderboard = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const teams = await Team.find({ event: eventId, totalScore: { $gt: 0 } })
    .sort({ totalScore: -1 })
    .populate('members', 'name email')
    .populate('leader', 'name email')
    .select('name totalScore rank problemStatement isQualified');

  res.json(success(teams, 'Leaderboard fetched'));
});

// @desc  Get full evaluation detail for a team
// @route GET /api/judge/evaluation/:teamId
// @access Judge
export const getTeamEvaluation = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const [round1Eval, round2Eval, submissions] = await Promise.all([
    Evaluation.findOne({ team: teamId, round: 1 }),
    Evaluation.findOne({ team: teamId, round: 2, judge: req.user._id }),
    Submission.find({ team: teamId }).sort({ round: 1 }),
  ]);

  res.json(success({ round1Eval, round2Eval, submissions }, 'Evaluation details fetched'));
});

// Internal helper — recalculate and persist ranks for all teams in an event
const recalculateRanks = async (eventId) => {
  const teams = await Team.find({ event: eventId, totalScore: { $gt: 0 } })
    .sort({ totalScore: -1 })
    .select('_id');

  const bulkOps = teams.map((team, index) => ({
    updateOne: {
      filter: { _id: team._id },
      update: { rank: index + 1 },
    },
  }));

  if (bulkOps.length) await Team.bulkWrite(bulkOps);
};