import { Router } from "express";
import {
  createReview,
  getReviewsByUser,
  getReviewsByProject,
  getScoreHistory,
  deleteReview,
} from "../controllers/reviewController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/", protect, createReview);
router.get("/user", protect, getReviewsByUser);
router.get("/project/:projectId", protect, getReviewsByProject);
router.get("/history/:projectId", protect, getScoreHistory);
router.delete("/:reviewId", protect, deleteReview);

export default router;