import { Request, Response } from "express";
import User from "../Models/User";
import jwt from "jsonwebtoken";

// Signup
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, username, email, password, collegeName } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Check if user already exists by email or username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or username already in use" });
    }

    const user = new User({ name, username, email, password, collegeName });
    await user.save(); // Password hashed via Mongoose pre-save hook

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        collegeName: user.collegeName,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Signup failed" });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { loginIdentifier, email, password } = req.body;
    const identifier = loginIdentifier || email; // Flexible: supports email or username

    if (!identifier || !password) {
      return res.status(400).json({ message: "Please provide email/username and password" });
    }

    // Find user by email OR username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is missing");
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      secret,
      { expiresIn: "7d" }
    );

    // Return token along with user data
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};