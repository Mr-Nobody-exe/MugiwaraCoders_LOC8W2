const User = require("../models/User");
const Team = require("../models/Team");

// GET /api/users  (admin)
exports.getAll = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter)
      .populate("team", "name track")
      .select("-password")
      .lean();
    res.json(users);
  } catch (err) { next(err); }
};

// GET /api/users/mentors
exports.getMentors = async (req, res, next) => {
  try {
    const mentors = await User.find({ role: "mentor" }).select("name email").lean();
    res.json(mentors);
  } catch (err) { next(err); }
};

// PATCH /api/users/:id/verify  (admin — flip verified flag)
exports.verify = async (req, res, next) => {
  try {
    const { verified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verified },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) { next(err); }
};

// POST /api/users/assign-mentor  (admin)
exports.assignMentor = async (req, res, next) => {
  try {
    const { teamId, mentorId } = req.body;
    const team = await Team.findByIdAndUpdate(teamId, { mentor: mentorId }, { new: true })
      .populate("mentor", "name email");
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (err) { next(err); }
};

// GET /api/users/dashboard-stats  (admin)
exports.dashboardStats = async (req, res, next) => {
  try {
    const [totalTeams, confirmed, pending, participants] = await Promise.all([
      Team.countDocuments(),
      Team.countDocuments({ status: "confirmed" }),
      Team.countDocuments({ status: "pending" }),
      User.countDocuments({ role: "participant" }),
    ]);
    res.json({ totalTeams, confirmed, pending, participants });
  } catch (err) { next(err); }
};
