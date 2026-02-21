import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  phone: { type: String },
  role: {
    type: String,
    enum: ['student', 'admin', 'judge'],
    default: 'student',
  },

  // College verification
  collegeIdUrl: { type: String },
  selfieUrl: { type: String },
  maskedAadhaar: { type: String },      // e.g. "XXXX-XXXX-3456"
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  verificationNote: { type: String },

  // OTP (mock-ready)
  otp: { type: String },
  otpExpiry: { type: Date },

  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;