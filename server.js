const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { connectDB } = require("./config/db");
const admin = require("firebase-admin");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Firebase initialization
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG_JSON);
// Fix private_key newlines
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://admitease.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());

// Start server after DB connection
connectDB()
  .then(() => {
    // Routes
    const admissionRoutes = require("./routes/admissionRoutes");
    const reviewRoutes = require("./routes/reviewRoutes");
    const userRoutes = require("./routes/userRoutes");

    app.use("/api/admissions", admissionRoutes);
    app.use("/api/reviews", reviewRoutes);
    app.use("/api/users", userRoutes);
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    app.get("/", (req, res) => res.send("✅ AdmitEase server is running!"));

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  });
