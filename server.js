const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { connectDB } = require("./config/db");
const serverless = require("serverless-http");

dotenv.config();

const app = express();

// Initialize Firebase Admin
const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Consider making this dynamic or permissive for production
    credentials: true,
  })
);
app.use(express.json());

// Routes and DB connection wrapped in an async function
async function initApp() {
  try {
    await connectDB();

    // Load routes
    const admissionRoutes = require("./routes/admissionRoutes");
    const reviewRoutes = require("./routes/reviewRoutes");
    const userRoutes = require("./routes/userRoutes");

    // Use routes
    app.use("/api/admissions", admissionRoutes);
    app.use("/api/reviews", reviewRoutes);
    app.use("/api/users", userRoutes);

    // Serve static files uploads
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    // Root route check
    app.get("/", (req, res) => res.send("✅ AdmitEase server is running!"));
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    // No process.exit here because serverless function shouldn't kill itself
  }
}

// Call the async init function (you can also await this in serverless but this is fine)
initApp();

// Export the express app and the serverless handler
const handler = serverless(app);
module.exports = { app, handler };
