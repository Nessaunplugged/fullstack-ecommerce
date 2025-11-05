import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://agarevanessa7_db_user:Z4Yu9yrZIcK7XRIW@cluster0.ynupktv.mongodb.net/ecommerce_db?retryWrites=true&w=majority&appName=Cluster0';
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connecting to MONGODB", error.message);
    process.exit(1);
  }
};
