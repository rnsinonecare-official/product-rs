const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const foodRoutes = require("./routes/food");
const recipeRoutes = require("./routes/recipes");
const healthMetricsRoutes = require("./routes/health");
const aiRoutes = require("./routes/ai");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
// const tempIntakeRoutes = require('./routes/tempIntake'); // Removed - using Firestore directly

// Import middleware
const { errorHandler } = require("./middleware/errorHandler");
const { authMiddleware } = require("./middleware/auth");
const { adminAuth } = require("./middleware/adminAuth");

// Initialize Firebase Admin
require("./config/firebase");

// Initialize daily reset scheduler
const dailyResetScheduler = require("./services/dailyResetScheduler");

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "https://rainscareadmin.vercel.app",
    "http://localhost:3001",
    "http://192.168.70.214:3000",
    "http://192.168.70.214:3001",
    "http://192.168.70.214:3002",
    // Allow Vercel deployment URLs
    /\.vercel\.app$/,
    // Allow Vercel preview URLs
    /\.vercel\.app$/,
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Logging middleware
app.use(morgan("combined"));

// Health check endpoints
app.get("/health", async (req, res) => {
  try {
    // Test Firestore connectivity
    const admin = require("firebase-admin");
    const db = admin.firestore();

    // Perform a simple Firestore operation to test connectivity
    await db.collection("healthCheck").limit(1).get();

    res.status(200).json({
      status: "OK",
      message: "Rainscare Backend Server is running",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      firestore: "connected",
    });
  } catch (error) {
    console.error("Firestore health check failed:", error);
    res.status(200).json({
      status: "OK",
      message: "Rainscare Backend Server is running",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      firestore: "disconnected",
      warnings: ["Firestore connection test failed"],
    });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    // Test Firestore connectivity
    const admin = require("firebase-admin");
    const db = admin.firestore();

    // Perform a simple Firestore operation to test connectivity
    await db.collection("healthCheck").limit(1).get();

    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      services: {
        firebase: "connected",
        firestore: "connected",
        gemini: process.env.GEMINI_API_KEY ? "configured" : "not configured",
        edamam: process.env.EDAMAM_APP_ID ? "configured" : "not configured",
        spoonacular: process.env.SPOONACULAR_API_KEY
          ? "configured"
          : "not configured",
      },
    });
  } catch (error) {
    console.error("Firestore health check failed:", error);
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      services: {
        firebase: "connected",
        firestore: "disconnected",
        gemini: process.env.GEMINI_API_KEY ? "configured" : "not configured",
        edamam: process.env.EDAMAM_APP_ID ? "configured" : "not configured",
        spoonacular: process.env.SPOONACULAR_API_KEY
          ? "configured"
          : "not configured",
      },
      warnings: ["Firestore connection test failed"],
    });
  }
});

// API Routes
app.use("/api/auth", authRoutes);

// Admin auth endpoints (login/verify) should NOT require adminAuth middleware
const adminAuthRoutes = require("./routes/adminAuth");
app.use("/api", adminAuthRoutes);

// Other protected routes
app.use("/api/food", authMiddleware, foodRoutes);
app.use("/api/recipes", authMiddleware, recipeRoutes);
app.use("/api/health", authMiddleware, healthMetricsRoutes);
app.use("/api/ai", authMiddleware, aiRoutes);
app.use("/api/user", authMiddleware, userRoutes);

// Protect admin management endpoints with adminAuth middleware
app.use("/api/admin", adminAuth, adminRoutes);
// app.use('/api/temp-intake', authMiddleware, tempIntakeRoutes); // Removed - using Firestore directly



// Public endpoint for updates
app.get("/api/updates/active", async (req, res) => {
  try {
    const admin = require("firebase-admin");
    const db = admin.firestore();

    // First try to get all updates, then filter
    const snapshot = await db.collection("updates").get();

    const updates = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isActive === true) {
        updates.push({ id: doc.id, ...data });
      }
    });

    // Sort by createdAt desc and limit to 10
    updates.sort((a, b) => {
      const aTime = a.createdAt?.toDate
        ? a.createdAt.toDate()
        : new Date(a.createdAt || 0);
      const bTime = b.createdAt?.toDate
        ? b.createdAt.toDate()
        : new Date(b.createdAt || 0);
      return bTime - aTime;
    });

    res.json(updates.slice(0, 10));
  } catch (error) {
    console.error("Error fetching active updates:", error);
    // Return empty array instead of error to allow fallback to quotes
    res.json([]);
  }
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use(errorHandler);

// For Vercel serverless deployment
if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
  // Export the app for Vercel serverless functions
  module.exports = app;
} else {
  // Start server for local development
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Rainscare Backend Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📱 Mobile access: http://192.168.70.214:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);

    // Start daily reset scheduler (only in non-serverless environment)
    dailyResetScheduler.start();
  });
}

module.exports = app;
