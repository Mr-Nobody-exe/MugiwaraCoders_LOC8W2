import mongoose from 'mongoose';

const qrTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  token: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['entry', 'breakfast', 'lunch', 'dinner'],
    required: true,
  },
  isUsed: { type: Boolean, default: false },
  usedAt: { type: Date },
  expiresAt: { type: Date, required: true },
  qrImageUrl: { type: String },
}, { timestamps: true });

qrTokenSchema.index({ token: 1 });
qrTokenSchema.index({ user: 1, event: 1, type: 1 }, { unique: true });

const QRToken = mongoose.model('QRToken', qrTokenSchema);
export default QRToken;