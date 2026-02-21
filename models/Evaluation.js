import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  round: { type: Number, enum: [1, 2], required: true },
  aiScores: {
    innovation: { type: Number, min: 0, max: 10 },
    feasibility: { type: Number, min: 0, max: 10 },
    presentation: { type: Number, min: 0, max: 10 },
    technicalDepth: { type: Number, min: 0, max: 10 },
    impact: { type: Number, min: 0, max: 10 },
  },
  judgeScores: {
    innovation: { type: Number, min: 0, max: 10 },
    execution: { type: Number, min: 0, max: 10 },
    presentation: { type: Number, min: 0, max: 10 },
    scalability: { type: Number, min: 0, max: 10 },
    overallImpression: { type: Number, min: 0, max: 10 },
  },
  judgeComments: { type: String },
  weightedTotal: { type: Number },
  aiRawResponse: { type: String },
}, { timestamps: true });

const Evaluation = mongoose.model('Evaluation', evaluationSchema);
export default Evaluation;