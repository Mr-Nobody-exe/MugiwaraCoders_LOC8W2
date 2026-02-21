import User from '../models/User.js';
import { uploadToCloudinary } from '../services/upload.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';

export const uploadVerification = asyncHandler(async (req, res) => {
  const files = req.files;
  const updates = {};

  if (files?.collegeId?.[0]) {
    const result = await uploadToCloudinary(files.collegeId[0].buffer, 'verifications');
    updates.collegeIdUrl = result.secure_url;
  }
  if (files?.selfie?.[0]) {
    const result = await uploadToCloudinary(files.selfie[0].buffer, 'verifications');
    updates.selfieUrl = result.secure_url;
  }
  if (req.body.maskedAadhaar) {
    updates.maskedAadhaar = req.body.maskedAadhaar;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json(success(user, 'Verification documents uploaded'));
});

export const reviewVerification = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status, note } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { verificationStatus: status, verificationNote: note },
    { new: true }
  );
  res.json(success(user, `Verification ${status}`));
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(success(req.user, 'Profile fetched'));
});