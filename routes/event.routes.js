import { Router } from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  addProblemStatement,
  assignJudge,
  toggleEventStatus,
} from '../controllers/event.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

// Public
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Admin only
router.use(protect, authorize('admin'));
router.post('/', createEvent);
router.patch('/:id', updateEvent);
router.patch('/:id/status', toggleEventStatus);
router.post('/:id/problem-statements', addProblemStatement);
router.post('/:id/judges', assignJudge);

export default router;