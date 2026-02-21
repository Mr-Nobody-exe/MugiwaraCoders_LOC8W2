const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role:     { type: String, enum: ["participant", "admin", "judge", "mentor"], default: "participant" },

    // Participant-specific
    team:       { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    verified:   { type: Boolean, default: false },
    college:    { type: String, default: "" },
    phone:      { type: String, default: "" },

    // QR codes (generated on registration)
    qrEntry:    { type: String, default: "" },
    qrBreakfast:{ type: String, default: "" },
    qrLunch:    { type: String, default: "" },
    qrDinner:   { type: String, default: "" },

    // Meal/entry usage flags
    entryUsed:     { type: Boolean, default: false },
    breakfastUsed: { type: Boolean, default: false },
    lunchUsed:     { type: Boolean, default: false },
    dinnerUsed:    { type: Boolean, default: false },
    checkedInAt:   { type: Date,    default: null },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Virtual avatar initials
userSchema.virtual("avatar").get(function () {
  return this.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
});

userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
