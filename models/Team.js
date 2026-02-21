import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemStatement: { type: String },
  round1PPTUrl: { type: String },
  round1Status: {
    type: String,
    enum: ['not_submitted', 'submitted', 'evaluated'],
    default: 'not_submitted',
  },
  isQualified: { type: Boolean, default: false },
  totalScore: { type: Number, default: 0 },
  rank: { type: Number },
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);
export default Team;