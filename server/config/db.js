import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log("sir the database is connected", conn.connection.host);
  } catch (error) {
    console.log("Error with MongoDB connection:", error);
    process.exit(1);
  }
};

export default connectDB;
