const mongoose = require("mongoose");

const entryLogSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:     { type: String, enum: ["entry", "breakfast", "lunch", "dinner"], required: true },
    scannedBy:{ type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin who scanned
    qrCode:   { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EntryLog", entryLogSchema);
