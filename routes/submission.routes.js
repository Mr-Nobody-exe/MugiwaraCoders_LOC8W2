import { Router } from 'express';
import {
  submitRound2,
  getTeamSubmissions,
  lockSubmission,
} from '../controllers/submission.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { uploadPPT } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(protect);

router.post(
  '/:teamId/round2',
  authorize('student'),
  uploadPPT.single('ppt'),
  submitRound2
);
router.get('/:teamId', getTeamSubmissions);
router.patch('/:submissionId/lock', authorize('admin'), lockSubmission);

export default router;