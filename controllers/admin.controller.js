import QRToken from '../models/QRToken.js';
import Team from '../models/Team.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';

export const getAnalytics = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const [attendance, breakfastCount, lunchCount, dinnerCount, totalTeams] = await Promise.all([
    QRToken.countDocuments({ event: eventId, type: 'entry', isUsed: true }),
    QRToken.countDocuments({ event: eventId, type: 'breakfast', isUsed: true }),
    QRToken.countDocuments({ event: eventId, type: 'lunch', isUsed: true }),
    QRToken.countDocuments({ event: eventId, type: 'dinner', isUsed: true }),
    Team.countDocuments({ event: eventId }),
  ]);

  res.json(success({
    attendance,
    meals: { breakfast: breakfastCount, lunch: lunchCount, dinner: dinnerCount },
    totalTeams,
  }, 'Analytics fetched'));
});

export const getLeaderboard = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const teams = await Team.find({ event: eventId, totalScore: { $gt: 0 } })
    .sort({ totalScore: -1 })
    .populate('members', 'name email')
    .populate('leader', 'name email')
    .select('name totalScore rank problemStatement');

  res.json(success(teams, 'Leaderboard fetched'));
});