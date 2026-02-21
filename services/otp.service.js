import User from '../models/User.js';
import logger from '../utils/logger.js';

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES) || 10;

// Generate a 6-digit numeric OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// @desc  Generate and store OTP for a user (mock — logs to console instead of sending SMS/email)
export const sendOTP = async (identifier) => {
  // identifier = email or phone
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  });

  if (!user) return { success: false, message: 'User not found' };

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save({ validateBeforeSave: false });

  // MOCK: In production replace this with an actual SMS/email provider
  // e.g. Twilio, AWS SNS, Nodemailer
  logger.info(`[OTP MOCK] OTP for ${identifier}: ${otp} (expires in ${OTP_EXPIRY_MINUTES} min)`);

  return {
    success: true,
    message: `OTP sent to ${identifier}`,
    // Return OTP in dev mode only — remove in production
    ...(process.env.NODE_ENV === 'development' && { otp }),
  };
};

// @desc  Verify OTP and clear it on success
export const verifyOTP = async (identifier, otp) => {
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  });

  if (!user) return { success: false, message: 'User not found' };
  if (!user.otp || !user.otpExpiry) return { success: false, message: 'No OTP requested' };

  if (new Date() > new Date(user.otpExpiry)) {
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return { success: false, message: 'OTP has expired' };
  }

  if (user.otp !== otp) return { success: false, message: 'Invalid OTP' };

  // Clear OTP after successful verification
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  return { success: true, message: 'OTP verified', userId: user._id };
};