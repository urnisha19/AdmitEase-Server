const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { connectDB } = require("./config/db");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Initialize Firebase Admin
const admin = require("firebase-admin");
const serviceAccount = require("GOOGLE_APPLICATION_CREDENTIALS");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Connect to MongoDB then start server
connectDB()
  .then(() => {
    // Load routes
    const admissionRoutes = require("./routes/admissionRoutes");
    const reviewRoutes = require("./routes/reviewRoutes");
    const userRoutes = require("./routes/userRoutes");

    // Use routes
    app.use("/api/admissions", admissionRoutes);
    app.use("/api/reviews", reviewRoutes);
    app.use("/api/users", userRoutes);

    // For Static files uploads
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    // check or root route
    app.get("/", (req, res) => res.send("✅ AdmitEase server is running!"));

    // Start the server
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  });
