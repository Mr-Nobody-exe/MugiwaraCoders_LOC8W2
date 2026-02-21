require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const connectDB    = require("./config/db");
const errorHandler = require("./middleware/error");

// Route files
const authRoutes  = require("./routes/auth");
const teamRoutes  = require("./routes/teams");
const evalRoutes  = require("./routes/eval");
const qrRoutes    = require("./routes/qr");
const userRoutes  = require("./routes/users");

connectDB();

const app = express();

// ── Middleware ──
app.use(cors({
  origin:      process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));  // 5mb for QR data URLs

// ── Health check ──
app.get("/api/health", (_, res) => res.json({ status: "ok", ts: new Date() }));

// ── Routes ──
app.use("/api/auth",  authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/eval",  evalRoutes);
app.use("/api/qr",    qrRoutes);
app.use("/api/users", userRoutes);

// ── Error handler (must be last) ──
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[server] Running on port ${PORT}`));
