import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    if (!env.mongoUri) {
      throw new Error("MongoDB URI is not defined in env configuration.");
    }
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("==================================================");
    console.error("MongoDB Connection Error Details:", error);
    console.error("==================================================");
    throw error;
  }
};