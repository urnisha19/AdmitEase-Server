const { client } = require("../config/db");

exports.getAllReviews = async (req, res) => {
  try {
    const db = client.db("AdmitEase");
    const reviewsCollection = db.collection("reviews");

    const reviews = await reviewsCollection.find({}).toArray();
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createReview = async (req, res) => {
  try {
    const db = client.db("AdmitEase");
    const reviewsCollection = db.collection("reviews");

    const { collegeName, candidateName, reviewText, rating, date } = req.body;

    if (!collegeName || !candidateName || !reviewText || !rating) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const reviewData = {
      collegeName,
      candidateName,
      reviewText,
      rating,
      date: date || new Date().toISOString(),
    };

    const result = await reviewsCollection.insertOne(reviewData);
    res.status(201).json(reviewData);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
