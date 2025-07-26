const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

let db; // Store DB instance

async function connectDB() {
  try {
    await client.connect();
    db = client.db("AdmitEase");
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌Failed to connect to MongoDB", error);
  }
}

function getDB() {
  if (!db) {
    throw new Error("❌DB not initialized. Call connectDB first.");
  }
  return db;
}

module.exports = { client, connectDB, getDB };
