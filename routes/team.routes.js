import { Router } from 'express';
import {
  createTeam,
  getTeamById,
  joinTeam,
  getMyTeam,
  uploadRound1PPT,
} from '../controllers/team.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { uploadPPT } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(protect);

router.post('/', authorize('student'), createTeam);
router.get('/my', authorize('student'), getMyTeam);
router.get('/:id', getTeamById);
router.post('/:id/join', authorize('student'), joinTeam);
router.post(
  '/:id/round1',
  authorize('student'),
  uploadPPT.single('ppt'),
  uploadRound1PPT
);

export default router;