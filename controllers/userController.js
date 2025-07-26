const admin = require("firebase-admin");
const { getDB } = require("../config/db");

// POST /api/users (auto-create user if not exists)
const createUser = async (req, res) => {
  const decodedUser = req.user; // from verifyToken middleware
  const { uid, email, name: firebaseName, picture } = decodedUser;
  const nameFromFrontend = req.body.name;
  const name = nameFromFrontend || firebaseName || "";

  if (!uid || !email) {
    return res.status(400).json({ message: "Invalid user data in token" });
  }

  try {
    const db = getDB();
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ uid });

    if (!existingUser) {
      await usersCollection.insertOne({
        uid,
        email,
        name,
        photo: picture || "",
        createdAt: new Date(),
      });

      return res.status(201).json({ message: "User created successfully" });
    } else {
      return res.status(200).json({ message: "User already exists" });
    }
  } catch (error) {
    console.error("Create user error:", error.message);
    return res.status(500).json({ message: "Failed to create user" });
  }
};

// POST /api/users/register
const registerUser = async (req, res) => {
  const { idToken, name: nameFromFrontend } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "ID token is required" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name: firebaseName, picture } = decodedToken;
    const name = nameFromFrontend || firebaseName || "";

    if (!uid || !email) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    const db = getDB();
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ uid });

    if (!existingUser) {
      await usersCollection.insertOne({
        uid,
        email,
        name,
        photo: picture || "",
        createdAt: new Date(),
      });
    }

    res.status(200).json({
      message: "User registered successfully",
      accessToken: idToken,
      email,
      name,
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(401).json({ message: "Invalid or expired Firebase token" });
  }
};

// POST /api/users/login
const loginUser = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "ID token is required" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name: firebaseName, picture } = decodedToken;

    const db = getDB();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ uid });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found, please register" });
    }

    res.status(200).json({
      message: "Login successful",
      accessToken: idToken,
      user: {
        uid,
        email,
        name: user.name || firebaseName || "",
        photo: user.photo || picture || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(401).json({ message: "Invalid or expired Firebase token" });
  }
};

// GET /api/users/profile/:email
const getUserProfile = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Email parameter is required" });
  }

  try {
    const db = getDB();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne(
      { email },
      { projection: { _id: 0, password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// PUT /api/users/profile/:email
const updateUserProfile = async (req, res) => {
  const { email } = req.params;
  const { name, photo } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email parameter is required" });
  }

  try {
    const db = getDB();
    const usersCollection = db.collection("users");

    const result = await usersCollection.updateOne(
      { email },
      { $set: { name, photo, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// GET /api/users/:email
const getUserByEmail = async (req, res) => {
  const email = decodeURIComponent(req.params.email);

  if (!email) {
    return res.status(400).json({ message: "Email parameter is required" });
  }

  try {
    const db = getDB();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user by email error:", error.message);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  createUser,
  getUserProfile,
  updateUserProfile,
  getUserByEmail,
};
