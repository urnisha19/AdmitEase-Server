const express = require("express");
const router = express.Router();
const admissionController = require("../controllers/admissionController");

router.post("/", admissionController.createAdmission);
// Add GET route for all admissions
router.get("/", admissionController.getAllAdmissions);

module.exports = router;