const { client } = require("../config/db");

// Create a new admission
exports.createAdmission = async (req, res) => {
  try {
    const db = client.db("AdmitEase");
    const admissionsCollection = db.collection("admissions");

    const { name, subject, email, phone, address, dob, college, collegeId } =
      req.body;

    // Check for required fields
    if (!name || !subject || !email || !phone || !address || !dob || !college) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const admissionData = {
      name,
      subject,
      email,
      phone,
      address,
      dob,
      college,
      collegeId: collegeId || null,
      createdAt: new Date(),
    };

    const result = await admissionsCollection.insertOne(admissionData);

    res.status(201).json({
      message: "Admission submitted successfully",
      admissionId: result.insertedId,
    });
  } catch (error) {
    console.error("Error submitting admission:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all admissions OR filter by email
exports.getAllAdmissions = async (req, res) => {
  try {
    const db = client.db("AdmitEase");
    const admissionsCollection = db.collection("admissions");

    const { email } = req.query;
    const query = email ? { email } : {};

    const admissions = await admissionsCollection.find(query).toArray();
    res.json(admissions);
  } catch (error) {
    console.error("Error fetching admissions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
