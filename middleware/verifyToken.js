const admin = require("firebase-admin");

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("Authorization header:", req.headers.authorization);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach decoded user info to request
    next();
  } catch (error) {
    console.error("Firebase token verification failed:", error.message);
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = verifyToken;
