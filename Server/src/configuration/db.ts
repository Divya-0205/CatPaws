import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI ?? process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI or MONGODB_URI is not configured");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected");
  } catch (error) {
  console.error("❌ MongoDB Connection Failed");
  console.error(error);
  process.exit(1);
}
};

export default connectDB;
