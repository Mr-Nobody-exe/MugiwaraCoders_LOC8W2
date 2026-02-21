import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  round: { type: Number, enum: [1, 2], required: true },
  pptUrl: { type: String },
  githubLink: { type: String },
  demoVideoUrl: { type: String },
  extractedText: { type: String },
  isLocked: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// One submission per team per round
submissionSchema.index({ team: 1, round: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;