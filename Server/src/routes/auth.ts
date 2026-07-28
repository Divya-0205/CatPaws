import { Router } from "express";
import rateLimit from "express-rate-limit";
import { signup, login } from "../controllers/authController";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts per IP in that window
  message: { message: "Too many login attempts, please try again later." },
});

router.post("/signup", signup);
router.post("/login", authLimiter, login);

export default router;