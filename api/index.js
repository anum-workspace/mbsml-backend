const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");

const connectDB = require("../src/config/db");

const authRoutes = require("../src/routes/authRoutes");
const postRoutes = require("../src/routes/postRoutes");
const commentRoutes = require("../src/routes/commentRoutes");
const adminRoutes = require("../src/routes/adminRoutes");
const uploadRoutes = require("../src/routes/uploadRoutes");
const searchRoutes = require("../src/routes/searchRoutes");
const userRoutes = require("../src/routes/userRoutes");
const publicRoutes = require("../src/routes/publicRoutes");

const app = express();

// IMPORTANT: connect DB safely (no crash)
await connectDB().catch((err) => {
  console.error("❌ DB connection failed:", err.message);
});

// CORS (temporary permissive for debugging)
app.use(
  cors({
    origin: function (origin, callback) {
      const allowed = ["https://mbsml.vercel.app", "http://localhost:5173"];

      if (!origin || allowed.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, true); // allow all for now (debug mode)
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Rate limiting
app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api", publicRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
