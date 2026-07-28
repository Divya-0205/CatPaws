import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import connectDB from "./configuration/db";
import reviewRouter from "./routes/review";
import authRouter from "./routes/auth";
import projectRouter from "./routes/project";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically (e.g. http://localhost:3000/uploads/169999-index.ts)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Home Route
app.get("/", (_req, res) => {
  res.send("TypeScript backend is running.");
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/review", reviewRouter);

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server live on port ${PORT}`);
});