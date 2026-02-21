const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const submissionSchema = new mongoose.Schema(
  {
    pptUrl:    { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    demoUrl:   { type: String, default: "" },
    round:     { type: Number, default: 1 },
  },
  { timestamps: true }
);

const teamSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, unique: true, trim: true },
    track:      { type: String, enum: ["AI/ML", "Web3", "CleanTech", "HealthTech", "EdTech"], required: true },
    inviteCode: { type: String, unique: true },
    status:     { type: String, enum: ["pending", "confirmed", "review", "disqualified"], default: "pending" },

    members:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    leader:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    mentor:     { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    problemStatement: { type: String, default: "" },
    submission:       submissionSchema,

    // Evaluation scores (filled by judges)
    scores: [
      {
        judge:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        innovation:   { type: Number, default: 0 },
        feasibility:  { type: Number, default: 0 },
        technical:    { type: Number, default: 0 },
        presentation: { type: Number, default: 0 },
        impact:       { type: Number, default: 0 },
        total:        { type: Number, default: 0 },
        notes:        { type: String, default: "" },
        savedAt:      { type: Date },
      },
    ],

    // Computed average across all judges
    finalScore: { type: Number, default: 0 },

    // World map position (set by admin or randomised)
    mapX: { type: Number, default: 300 },
    mapY: { type: Number, default: 300 },

    // Visual config (kept for world map)
    color:       { type: String, default: "#ffffff" },
    skinTones:   [String],
    shirtColors: [String],
  },
  { timestamps: true }
);

// Generate invite code before first save
teamSchema.pre("save", function (next) {
  if (!this.inviteCode) {
    this.inviteCode = `HX-${uuidv4().slice(0, 6).toUpperCase()}`;
  }
  next();
});

// Recompute finalScore whenever scores array is modified
teamSchema.methods.recalcScore = function () {
  if (!this.scores.length) { this.finalScore = 0; return; }
  const avg = this.scores.reduce((sum, s) => sum + s.total, 0) / this.scores.length;
  this.finalScore = Math.round(avg * 10) / 10;
};

module.exports = mongoose.model("Team", teamSchema);
