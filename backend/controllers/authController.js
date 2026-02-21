const jwt      = require("jsonwebtoken");
const QRCode   = require("qrcode");
const User     = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({ token, user });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, college, phone } = req.body;

    // Only these roles can self-register
    const allowedRoles = ["participant", "judge", "mentor"];
    const assignedRole = allowedRoles.includes(role) ? role : "participant";

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, role: assignedRole, college, phone });

    // Generate QR codes for participants
    if (assignedRole === "participant") {
      const base = `HX2025-${user._id}`;
      user.qrEntry     = await QRCode.toDataURL(`${base}-ENTRY`);
      user.qrBreakfast = await QRCode.toDataURL(`${base}-BF`);
      user.qrLunch     = await QRCode.toDataURL(`${base}-LN`);
      user.qrDinner    = await QRCode.toDataURL(`${base}-DN`);
      await user.save();
    }

    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  // req.user is already populated by protect middleware
  const user = await User.findById(req.user._id).populate("team", "name track inviteCode status finalScore");
  res.json(user);
};

// POST /api/auth/logout  (client just drops the token, but we acknowledge)
exports.logout = (req, res) => {
  res.json({ message: "Logged out" });
};
