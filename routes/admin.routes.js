import { Router } from 'express';
import { getAnalytics, getLeaderboard } from '../controllers/admin.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/analytics/:eventId', getAnalytics);
router.get('/leaderboard/:eventId', getLeaderboard);

export default router;