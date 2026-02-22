/**
 * utils/seed.js
 * Run: npm run seed
 *
 * Creates:
 * - 1 Admin
 * - 1 Mentor
 * - 8 Judges
 * - 60 Participants (with QR codes)
 * - 20 Teams (3 members each)
 *
 * Safe to re-run — skips existing users
 */

require("dotenv").config();
const mongoose = require("mongoose");
const QRCode   = require("qrcode");
const User     = require("../models/User");
const Team     = require("../models/Team");

const TRACKS = ["AI/ML", "Web3", "CleanTech"];

async function seed() {

  await mongoose.connect(process.env.MONGO_URI);
  console.log("[seed] MongoDB Connected");

  // ─────────────── JUDGES ───────────────

  const judgeDefaults = [
    { name: "Judge 1", email: "judge1@hackx.dev", password: "hackx123", role: "judge" },
    { name: "Judge 2", email: "judge2@hackx.dev", password: "hackx123", role: "judge" },
    { name: "Judge 3", email: "judge3@hackx.dev", password: "hackx123", role: "judge" },
    { name: "Judge 4", email: "judge4@hackx.dev", password: "hackx123", role: "judge" },
    { name: "Judge 5", email: "judge5@hackx.dev", password: "hackx123", role: "judge" },
    { name: "Judge 6", email: "judge6@hackx.dev", password: "hackx123", role: "judge" },
    { name: "Judge 7", email: "judge7@hackx.dev", password: "hackx123", role: "judge" },
    { name: "Judge 8", email: "judge8@hackx.dev", password: "hackx123", role: "judge" },
  ];

  // ─────────────── 60 PARTICIPANTS ───────────────

  const participantDefaults = Array.from({ length: 60 }, (_, i) => ({
    name: `Participant ${i + 1}`,
    email: `p${i + 1}@hackx.dev`,
    password: "hackx123",
    role: "participant"
  }));

  const defaults = [
    { name: "Admin User", email: "admin@hackx.dev", password: "hackx123", role: "admin" },
    { name: "Mentor Ananya", email: "mentor@hackx.dev", password: "hackx123", role: "mentor" },
    ...judgeDefaults,
    ...participantDefaults
  ];

  const created = {};

  // ─────────────── CREATE USERS ───────────────

  for (const d of defaults) {

    const existing = await User.findOne({ email: d.email });
    if (existing) {
      created[d.email] = existing;
      console.log(`[seed] skip ${d.email}`);
      continue;
    }

    const user = new User(d);

    if (d.role === "participant") {

      const base = `HX2025-${d.email}`;

      user.qrEntry     = await QRCode.toDataURL(`${base}-ENTRY`);
      user.qrBreakfast = await QRCode.toDataURL(`${base}-BF`);
      user.qrLunch     = await QRCode.toDataURL(`${base}-LN`);
      user.qrDinner    = await QRCode.toDataURL(`${base}-DN`);
      user.verified    = true;
    }

    await user.save();
    created[d.email] = user;
    console.log(`[seed] created ${d.role}: ${d.email}`);
  }

  // ─────────────── TEAM CREATION (3 PER TEAM) ───────────────

  const allParticipants = Object.values(created)
    .filter(u => u.role === "participant");

  let teamIndex = 1;

  for (let i = 0; i < allParticipants.length; i += 3) {

    const members = allParticipants.slice(i, i + 3);
    if (members.length === 0) continue;

    const teamName = `Team-${teamIndex}`;

    const existing = await Team.findOne({ name: teamName });
    if (existing) {
      console.log(`[seed] skip ${teamName}`);
      teamIndex++;
      continue;
    }

    const leader = members[0];

    const team = await Team.create({
      name: teamName,
      track: TRACKS[teamIndex % TRACKS.length],
      leader: leader._id,
      members: members.map(m => m._id),

      mapX: Math.floor(Math.random() * 1200),
      mapY: Math.floor(Math.random() * 800),

      color: "#ffffff",
      skinTones: ["#f1c27d"],
      shirtColors: ["#ffffff"],
      problemStatement: "LOC8W2",
    });

    for (const m of members) {
      await User.findByIdAndUpdate(m._id, { team: team._id });
    }

    console.log(`[seed] created ${teamName}`);
    teamIndex++;
  }

  console.log("\n[seed] DONE!\n");

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});