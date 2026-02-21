import { Router } from 'express';
import { generateMyQRs, scanQR } from '../controllers/qr.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

router.post('/generate/:eventId', protect, authorize('student'), generateMyQRs);
router.post('/scan', protect, authorize('admin'), scanQR);

export default router;