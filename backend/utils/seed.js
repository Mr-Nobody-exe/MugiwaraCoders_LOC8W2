/**
 * utils/seed.js
 * Run: npm run seed
 * Creates default admin, judge, mentor, and 3 sample participant accounts.
 * Safe to re-run — skips existing documents.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const QRCode   = require("qrcode");
const User     = require("../models/User");
const Team     = require("../models/Team");

const TRACKS = ["AI/ML", "Web3", "CleanTech"];
const MAP_POS = [{ x: 220, y: 160 }, { x: 680, y: 120 }, { x: 420, y: 480 }];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("[seed] Connected");

  // ── Default accounts ──
  const defaults = [
    { name: "Admin User",    email: "admin@hackx.dev",   password: "hackx123", role: "admin"       },
    { name: "Judge One",     email: "judge@hackx.dev",   password: "hackx123", role: "judge"       },
    { name: "Mentor Ananya", email: "mentor@hackx.dev",  password: "hackx123", role: "mentor"      },
    { name: "Alice Sharma",  email: "alice@hackx.dev",   password: "hackx123", role: "participant" },
    { name: "Bob Patel",     email: "bob@hackx.dev",     password: "hackx123", role: "participant" },
    { name: "Carol Iyer",    email: "carol@hackx.dev",   password: "hackx123", role: "participant" },
  ];

  const created = {};

  for (const d of defaults) {
    const existing = await User.findOne({ email: d.email });
    if (existing) { created[d.email] = existing; console.log(`[seed] skip ${d.email}`); continue; }

    const user = new User(d);

    if (d.role === "participant") {
      const base = `HX2025-SEED-${d.name.split(" ")[0].toUpperCase()}`;
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

  // ── Sample teams ──
  const participants = [created["alice@hackx.dev"], created["bob@hackx.dev"], created["carol@hackx.dev"]];

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    if (!p || p.team) continue;

    const teamName = `SeedTeam${i + 1}`;
    const existing = await Team.findOne({ name: teamName });
    if (existing) { console.log(`[seed] skip team ${teamName}`); continue; }

    const team = await Team.create({
      name:    teamName,
      track:   TRACKS[i],
      leader:  p._id,
      members: [p._id],
      mapX:    MAP_POS[i].x,
      mapY:    MAP_POS[i].y,
      color:   "#ffffff",
      skinTones:   ["#f1c27d"],
      shirtColors: ["#ffffff"],
      problemStatement: "LOC8W2",
    });

    await User.findByIdAndUpdate(p._id, { team: team._id });
    console.log(`[seed] created team ${teamName} for ${p.email}`);
  }

  console.log("\n[seed] Done!\n");
  console.log("Default logins:");
  defaults.forEach(d => console.log(`  ${d.role.padEnd(12)} ${d.email.padEnd(22)} / ${d.password}`));

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
