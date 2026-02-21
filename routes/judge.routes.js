import { Router } from 'express';
import {
  getAssignedTeams,
  submitJudgeScore,
  getLeaderboard,
  getTeamEvaluation,
} from '../controllers/judge.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

router.use(protect, authorize('judge'));

router.get('/teams', getAssignedTeams);
router.get('/leaderboard/:eventId', getLeaderboard);
router.get('/evaluation/:teamId', getTeamEvaluation);
router.post('/score/:teamId', submitJudgeScore);

export default router;