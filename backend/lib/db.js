import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log("MongoDB URI not found in environment variables");
      console.log("Available env vars:", Object.keys(process.env).filter(key => key.includes('MONGO')));
      return;
    }
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connecting to MONGODB", error.message);
    process.exit(1);
  }
};
