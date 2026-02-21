import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { sendOTP, verifyOTP } from '../services/otp.service.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', asyncHandler(async (req, res) => {
  const result = await sendOTP(req.body.identifier);
  res.json(result);
}));
router.post('/verify-otp', asyncHandler(async (req, res) => {
  const result = await verifyOTP(req.body.identifier, req.body.otp);
  res.json(result);
}));

export default router;