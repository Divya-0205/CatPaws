import { Response } from "express";
import fs from "fs";
import Review from "../Models/Review";
import Project from "../Models/Project";
import { generateCodeReview } from "../services/aiService";
import { fetchGitHubFileContent } from "../services/githubService";
import { AuthRequest } from "../middleware/authMiddleware";

export const createReview = async (req: AuthRequest, res: Response) => {
  console.log("createReview called");
  try {
    const userId = req.userId;
    const { projectId, fileName, code, githubUrl, storedFileName } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    if (!code && !githubUrl && !storedFileName) {
      return res.status(400).json({ message: "Provide code, a githubUrl, or a storedFileName" });
    }

    let finalCode = code;
    let source: "upload" | "snippet" | "github" = "snippet";
    let sourceRef: string | undefined;
    let finalFileName = fileName;

    if (!finalCode && storedFileName) {
      const project = await Project.findOne({ _id: projectId, user: userId });
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const fileEntry = project.files.find((f) => f.storedFileName === storedFileName);
      if (!fileEntry) {
        return res.status(404).json({ message: "That file wasn't found on this project" });
      }
      finalCode = fs.readFileSync(fileEntry.filePath, "utf-8");
      finalFileName = finalFileName || fileEntry.originalName;
      source = "upload";
      sourceRef = storedFileName;
    } else if (!finalCode && githubUrl) {
      console.log("Fetching code from GitHub:", githubUrl);
      finalCode = await fetchGitHubFileContent(githubUrl);
      source = "github";
      sourceRef = githubUrl;
    }

    // Fetch just the project's AI-context fields (if it has any). This is a
    // small separate query so the existing storedFileName lookup above isn't
    // touched. If the project has no context yet, generateCodeReview just
    // falls back to its normal prompt.
    const projectContext = await Project.findOne({ _id: projectId, user: userId }).select(
      "projectGoal techStack additionalContext"
    );

    console.log("Calling generateCodeReview");
    const aiResult = await generateCodeReview(finalCode, {
      projectGoal: projectContext?.projectGoal,
      techStack: projectContext?.techStack,
      additionalContext: projectContext?.additionalContext,
    });
    console.log("AI result score:", aiResult.score);

    const review = new Review({
      user: userId,
      project: projectId,
      fileName: finalFileName,
      source,
      sourceRef,
      code: finalCode,
      correctedCode: aiResult.correctedCode,
      Score: aiResult.score,
      feedback: aiResult.feedback,
      improvement: aiResult.improvements,
    });

    await review.save();
    console.log("Review saved successfully");

    return res.status(201).json({ message: "Review generated and saved", review });
  } catch (error: any) {
    console.error("createReview error:", error);

    if (error.status === 429) {
      return res.status(429).json({
        message: "AI service is temporarily rate-limited. Please try again in a moment.",
      });
    }

    if (error.message?.includes("exceeds maximum length")) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message?.includes("GitHub")) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Failed to generate review" });
  }
};

export const getReviewsByUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const reviews = await Review.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

export const getReviewsByProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { projectId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const reviews = await Review.find({ user: userId, project: projectId }).sort({ createdAt: -1 });
    return res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

export const getScoreHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { projectId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const reviews = await Review.find({ user: userId, project: projectId })
      .select("Score createdAt")
      .sort({ createdAt: 1 });

    return res.status(200).json({ history: reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch score history" });
  }
};

// Delete a single review. Score history is derived live from Review documents,
// so removing one here automatically removes it from the chart too — nothing
// else on the project (files, snippets, other reviews) is touched.
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { reviewId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete review" });
  }
};