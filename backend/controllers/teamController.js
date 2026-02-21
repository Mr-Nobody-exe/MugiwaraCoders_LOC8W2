const Team = require("../models/Team");
const User = require("../models/User");

const TEAM_COLORS = [
  "#ffffff","#cccccc","#aaaaaa","#888888","#666666",
  "#444444","#e0e0e0","#b0b0b0",
];
const MAP_POSITIONS = [
  { x: 220, y: 160 }, { x: 680, y: 120 }, { x: 420, y: 480 },
  { x: 820, y: 500 }, { x: 560, y: 280 }, { x: 160, y: 420 },
  { x: 840, y: 270 }, { x: 340, y: 280 }, { x: 500, y: 400 },
  { x: 700, y: 380 }, { x: 260, y: 320 }, { x: 620, y: 440 },
];

// GET /api/teams
exports.getAll = async (req, res, next) => {
  try {
    const teams = await Team.find({ status: { $ne: "disqualified" } })
      .populate("members", "name email avatar")
      .populate("mentor",  "name email")
      .populate("leader",  "name email")
      .lean();
    res.json(teams);
  } catch (err) { next(err); }
};

// GET /api/teams/:id
exports.getById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("members", "name email avatar college")
      .populate("mentor",  "name email")
      .populate("leader",  "name email");
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (err) { next(err); }
};

// POST /api/teams  (participant only)
exports.create = async (req, res, next) => {
  try {
    const { name, track } = req.body;
    if (req.user.team) return res.status(400).json({ message: "You are already in a team" });

    const count = await Team.countDocuments();
    const pos   = MAP_POSITIONS[count % MAP_POSITIONS.length];
    const color = TEAM_COLORS[count % TEAM_COLORS.length];

    const team = await Team.create({
      name, track,
      leader:  req.user._id,
      members: [req.user._id],
      mapX: pos.x, mapY: pos.y,
      color,
      skinTones:   ["#f1c27d","#c68642","#8d5524","#e0ac69"],
      shirtColors: [color, color, color, color],
    });

    await User.findByIdAndUpdate(req.user._id, { team: team._id });

    const populated = await team.populate("members", "name email avatar");
    res.status(201).json(populated);
  } catch (err) { next(err); }
};

// POST /api/teams/join
exports.join = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (req.user.team) return res.status(400).json({ message: "Already in a team" });

    const team = await Team.findOne({ inviteCode: code.toUpperCase() });
    if (!team) return res.status(404).json({ message: "Invalid invite code" });
    if (team.members.length >= 4) return res.status(400).json({ message: "Team is full (max 4)" });

    team.members.push(req.user._id);
    await team.save();
    await User.findByIdAndUpdate(req.user._id, { team: team._id });

    const populated = await team.populate("members", "name email avatar");
    res.json(populated);
  } catch (err) { next(err); }
};

// POST /api/teams/:id/leave
exports.leave = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.members = team.members.filter((m) => m.toString() !== req.user._id.toString());
    if (team.leader.toString() === req.user._id.toString() && team.members.length > 0) {
      team.leader = team.members[0];
    }
    await team.save();
    await User.findByIdAndUpdate(req.user._id, { team: null });

    res.json({ message: "Left team" });
  } catch (err) { next(err); }
};

// POST /api/teams/:id/submit
exports.submit = async (req, res, next) => {
  try {
    const { pptUrl, githubUrl, demoUrl, problemStatement } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Only team members can submit
    if (!team.members.map(String).includes(req.user._id.toString()))
      return res.status(403).json({ message: "Not a member of this team" });

    team.submission      = { pptUrl, githubUrl, demoUrl };
    team.problemStatement = problemStatement || team.problemStatement;
    if (pptUrl || githubUrl) team.status = "review";
    await team.save();

    res.json(team);
  } catch (err) { next(err); }
};

// PATCH /api/teams/:id  (admin — update status, mentor, map pos)
exports.update = async (req, res, next) => {
  try {
    const allowed = ["status", "mentor", "mapX", "mapY", "problemStatement"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const team = await Team.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate("members", "name email avatar")
      .populate("mentor",  "name email");
    if (!team) return res.status(404).json({ message: "Team not found" });

    res.json(team);
  } catch (err) { next(err); }
};
