import { Router } from "express";
import {
  createProject,
  getuserProjects,
  getProjectById,
  addDocumentToProject,
  deleteDocumentFromProject,
  uploadFileToProject,
  deleteFileFromProject,
  addGithubLinkToProject,
  deleteProject,
} from "../controllers/projectController";
import { protect } from "../middleware/authMiddleware";
import { upload } from "../middleware/Upload";

const router = Router();

router.post("/", protect, createProject);
router.get("/user", protect, getuserProjects);
router.get("/:projectId", protect, getProjectById);
router.post("/:projectId/documents", protect, addDocumentToProject);
router.delete("/:projectId/documents/:documentId", protect, deleteDocumentFromProject);
router.post("/:projectId/upload", protect, upload.single("file"), uploadFileToProject);
router.delete("/:projectId/files/:storedFileName", protect, deleteFileFromProject);
router.post("/:projectId/github", protect, addGithubLinkToProject);
router.delete("/:projectId", protect, deleteProject);

export default router;