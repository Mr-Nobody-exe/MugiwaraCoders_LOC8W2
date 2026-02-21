import mongoose from 'mongoose';

const problemStatementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  domain: { type: String },
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  venue: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  problemStatements: [problemStatementSchema],
  deadlines: {
    round1Submission: { type: Date },
    round2Submission: { type: Date },
    registrationClose: { type: Date },
  },
  judges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  meals: {
    breakfast: { type: Boolean, default: true },
    lunch: { type: Boolean, default: true },
    dinner: { type: Boolean, default: true },
  },
  isActive: { type: Boolean, default: true },
  maxTeamSize: { type: Number, default: 4 },
  minTeamSize: { type: Number, default: 2 },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
export default Event;