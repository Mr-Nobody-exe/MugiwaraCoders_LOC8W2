import asyncHandler from '../utils/asyncHandler.js';
import { generateQRsForStudent, validateQR } from '../services/qr.service.js';
import { success, error } from '../utils/apiResponse.js';

export const generateMyQRs = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  if (req.user.verificationStatus !== 'approved') {
    return res.status(403).json(error('Verification required to get QR codes', 403));
  }

  const qrs = await generateQRsForStudent(req.user._id, eventId);
  res.json(success(qrs, 'QR codes generated'));
});

export const scanQR = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const result = await validateQR(token);

  if (!result.valid) {
    req.io.to('admin_room').emit('qr:scan', { success: false, reason: result.reason, token });
    return res.status(400).json(error(result.reason, 400));
  }

  req.io.to('admin_room').emit('qr:scan', { success: true, data: result.data });
  res.json(success(result.data, 'QR validated successfully'));
});