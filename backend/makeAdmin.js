import mongoose from "mongoose";
import User from "./models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Replace with your email
    const email = "admin@example.com";
    
    const user = await User.findOneAndUpdate(
      { email },
      { role: "admin" },
      { new: true }
    );

    if (user) {
      console.log(`User ${email} is now an admin!`);
    } else {
      console.log(`User with email ${email} not found`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

makeAdmin();