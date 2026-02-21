// Central error handler — attach to app after all routes
const errorHandler = (err, req, res, next) => {
  console.error(`[error] ${err.message}`);

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    const msgs = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: msgs.join(", ") });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token" });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Server error",
  });
};

module.exports = errorHandler;
