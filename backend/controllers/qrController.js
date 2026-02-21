const User     = require("../models/User");
const EntryLog = require("../models/EntryLog");

// GET /api/qr/my  — participant gets their own QR data URLs
exports.getMyQR = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("qrEntry qrBreakfast qrLunch qrDinner entryUsed breakfastUsed lunchUsed dinnerUsed checkedInAt");
    res.json({
      entry:     { dataUrl: user.qrEntry,     used: user.entryUsed,     checkedInAt: user.checkedInAt },
      breakfast: { dataUrl: user.qrBreakfast, used: user.breakfastUsed, time: "7:30 AM – 9:00 AM"   },
      lunch:     { dataUrl: user.qrLunch,     used: user.lunchUsed,     time: "12:30 PM – 2:00 PM"  },
      dinner:    { dataUrl: user.qrDinner,    used: user.dinnerUsed,    time: "7:00 PM – 8:30 PM"   },
    });
  } catch (err) { next(err); }
};

// POST /api/qr/scan-entry  (admin)
// body: { userId }  — we pass userId because QR dataURLs encode userId
exports.scanEntry = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.entryUsed) return res.status(400).json({ message: "Entry QR already used" });

    user.entryUsed   = true;
    user.checkedInAt = new Date();
    await user.save();

    await EntryLog.create({ user: user._id, type: "entry", scannedBy: req.user._id, qrCode: user.qrEntry });

    res.json({ message: `✓ Entry granted for ${user.name}`, user: { name: user.name, team: user.team } });
  } catch (err) { next(err); }
};

// POST /api/qr/scan-meal  (admin)
// body: { userId, meal: "breakfast"|"lunch"|"dinner" }
exports.scanMeal = async (req, res, next) => {
  try {
    const { userId, meal } = req.body;
    const allowed = ["breakfast", "lunch", "dinner"];
    if (!allowed.includes(meal)) return res.status(400).json({ message: "Invalid meal type" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const usedField = `${meal}Used`;
    if (user[usedField]) return res.status(400).json({ message: `${meal} already claimed` });

    user[usedField] = true;
    await user.save();

    await EntryLog.create({ user: user._id, type: meal, scannedBy: req.user._id });

    res.json({ message: `✓ ${meal} recorded for ${user.name}` });
  } catch (err) { next(err); }
};

// GET /api/qr/meal-stats  (admin)
exports.getMealStats = async (req, res, next) => {
  try {
    const [checkedIn, bf, ln, dn] = await Promise.all([
      User.countDocuments({ role: "participant", entryUsed: true }),
      User.countDocuments({ role: "participant", breakfastUsed: true }),
      User.countDocuments({ role: "participant", lunchUsed: true }),
      User.countDocuments({ role: "participant", dinnerUsed: true }),
    ]);
    res.json({ checkedIn, breakfast: bf, lunch: ln, dinner: dn });
  } catch (err) { next(err); }
};

// GET /api/qr/entry-log  (admin)
exports.getEntryLog = async (req, res, next) => {
  try {
    const logs = await EntryLog.find()
      .populate("user",      "name team")
      .populate("scannedBy", "name")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    // Group per user for the table view
    const byUser = {};
    logs.forEach((log) => {
      const uid = log.user._id.toString();
      if (!byUser[uid]) {
        byUser[uid] = {
          _id:   uid,
          name:  log.user.name,
          team:  log.user.team,
          entry: null,
          breakfast: false,
          lunch:     false,
          dinner:    false,
        };
      }
      if (log.type === "entry")     byUser[uid].entry     = log.createdAt;
      if (log.type === "breakfast") byUser[uid].breakfast = true;
      if (log.type === "lunch")     byUser[uid].lunch     = true;
      if (log.type === "dinner")    byUser[uid].dinner    = true;
    });

    res.json(Object.values(byUser));
  } catch (err) { next(err); }
};
