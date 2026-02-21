import { Router } from 'express';
import { uploadVerification, reviewVerification, getMe } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';

const router = Router();

router.get('/me', protect, getMe);
router.post(
  '/verify/upload',
  protect,
  uploadImage.fields([{ name: 'collegeId', maxCount: 1 }, { name: 'selfie', maxCount: 1 }]),
  uploadVerification
);
router.get('/verify/pending', protect, authorize('admin'), reviewVerification);
router.patch('/verify/:userId', protect, authorize('admin'), reviewVerification);

export default router;