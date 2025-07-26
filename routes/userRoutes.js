const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  createUser,
  getUserByEmail,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");

router.post("/", verifyToken, createUser);
router.get("/profile/:email", verifyToken, getUserProfile);
router.put("/profile/:email", verifyToken, updateUserProfile);
router.get("/:email", verifyToken, getUserByEmail); // <-- LAST

module.exports = router;
