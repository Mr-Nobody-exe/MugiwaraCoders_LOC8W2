const Team = require("../models/Team");

const CRITERIA = ["innovation", "feasibility", "technical", "presentation", "impact"];
const WEIGHTS  = { innovation: 25, feasibility: 20, technical: 25, presentation: 15, impact: 15 };

// GET /api/eval/leaderboard
exports.leaderboard = async (req, res, next) => {
  try {
    const teams = await Team.find({ status: { $ne: "disqualified" } })
      .select("name track members finalScore status scores color mapX mapY skinTones shirtColors submission problemStatement")
      .populate("members", "name avatar")
      .populate("mentor",  "name")
      .sort({ finalScore: -1 })
      .lean();
    res.json(teams);
  } catch (err) { next(err); }
};

// GET /api/eval/submissions  (admin / judge)
exports.getSubmissions = async (req, res, next) => {
  try {
    const teams = await Team.find()
      .select("name track status submission scores finalScore members")
      .populate("members", "name avatar")
      .sort({ createdAt: 1 })
      .lean();
    res.json(teams);
  } catch (err) { next(err); }
};

// POST /api/eval/score/:teamId
exports.score = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const { notes = "", ...rawScores } = req.body;

    // Compute weighted total
    let total = 0;
    CRITERIA.forEach((k) => {
      const val = Math.min(10, Math.max(0, Number(rawScores[k]) || 0));
      rawScores[k] = val;
      total += (val * WEIGHTS[k]) / 10;
    });

    // Upsert: replace this judge's existing score or push new
    const existingIdx = team.scores.findIndex(
      (s) => s.judge.toString() === req.user._id.toString()
    );

    const scoreEntry = {
      judge: req.user._id,
      ...rawScores,
      total: Math.round(total * 10) / 10,
      notes,
      savedAt: new Date(),
    };

    if (existingIdx >= 0) {
      team.scores[existingIdx] = scoreEntry;
    } else {
      team.scores.push(scoreEntry);
    }

    team.recalcScore();
    await team.save();

    res.json({ team: team.name, total: scoreEntry.total, finalScore: team.finalScore });
  } catch (err) { next(err); }
};

// POST /api/eval/shortlist  (admin — set status = "confirmed" for array of ids)
exports.shortlist = async (req, res, next) => {
  try {
    const { ids } = req.body;
    await Team.updateMany({ _id: { $in: ids } },      { status: "confirmed" });
    await Team.updateMany({ _id: { $nin: ids }, status: "review" }, { status: "pending" });
    res.json({ message: `Shortlisted ${ids.length} teams` });
  } catch (err) { next(err); }
};
