import { Response } from "express";
import fs from "fs";
import Project from "../Models/Project";
import { AuthRequest } from "../middleware/authMiddleware";

// Create a new project
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    const project = new Project({
      user: userId,
      name,
      description,
      documents: [],
      files: [],
      githubLinks: [],
    });
    await project.save();

    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({ message: "Error creating project" });
  }
};

// Get all projects for the logged-in user
export const getuserProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const projects = await Project.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching user projects" });
  }
};

// Get a single project by ID (must belong to the logged-in user)
export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({ _id: projectId, user: req.userId });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching project" });
  }
};

// Update a project's editable details: name, description, and AI context
// (projectGoal, techStack, additionalContext). Only the fields sent in the
// request body get changed — anything left out stays as it was.
export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, description, projectGoal, techStack, additionalContext } = req.body;

    const project = await Project.findOne({ _id: projectId, user: req.userId });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (projectGoal !== undefined) project.projectGoal = projectGoal;
    if (techStack !== undefined) project.techStack = techStack;
    if (additionalContext !== undefined) project.additionalContext = additionalContext;

    await project.save();
    return res.status(200).json({ message: "Project updated", project });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update project" });
  }
};

// Add a pasted code snippet to a project (existing behavior, unchanged)
export const addDocumentToProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { fileName, code } = req.body;

    const project = await Project.findOne({ _id: projectId, user: req.userId });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.documents.push({ fileName, code, addedAt: new Date() });
    await project.save();

    return res.status(201).json({ message: "Document added", project });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to add document" });
  }
};

// Delete a saved snippet/document from a project
export const deleteDocumentFromProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, documentId } = req.params;

    const project = await Project.findOne({ _id: projectId, user: req.userId });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const before = project.documents.length;
    project.documents = project.documents.filter((doc: any) => doc._id.toString() !== documentId);

    if (project.documents.length === before) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    await project.save();
    return res.status(200).json({ message: "Snippet deleted", project });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete snippet" });
  }
};

// Handle a real file upload (multer has already saved the file to /uploads by the time this runs)
export const uploadFileToProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file was uploaded" });
    }

    const project = await Project.findOne({ _id: projectId, user: req.userId });
    if (!project) {
      // Clean up the orphaned file on disk since we're not keeping it
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ message: "Project not found" });
    }

    project.files.push({
      originalName: req.file.originalname,
      storedFileName: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
    });
    await project.save();

    return res.status(201).json({ message: "File uploaded", project });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to upload file" });
  }
};

// Delete an uploaded file from a project (removes both the DB entry and the file on disk)
export const deleteFileFromProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, storedFileName } = req.params;

    const project = await Project.findOne({ _id: projectId, user: req.userId });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const fileEntry = project.files.find((f) => f.storedFileName === storedFileName);
    if (!fileEntry) {
      return res.status(404).json({ message: "File not found" });
    }

    fs.unlink(fileEntry.filePath, () => {}); // best-effort disk cleanup
    project.files = project.files.filter((f) => f.storedFileName !== storedFileName);
    await project.save();

    return res.status(200).json({ message: "File deleted", project });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete file" });
  }
};

// Save a GitHub link to a project (so it shows up alongside files/snippets for later re-review)
export const addGithubLinkToProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "A GitHub URL is required" });
    }

    const project = await Project.findOne({ _id: projectId, user: req.userId });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.githubLinks.push({ url, addedAt: new Date() });
    await project.save();

    return res.status(201).json({ message: "GitHub link saved", project });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to save GitHub link" });
  }
};

// Delete a project (must belong to the logged-in user)
export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOneAndDelete({ _id: projectId, user: req.userId });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Clean up any uploaded files on disk so they don't pile up orphaned
    for (const file of project.files) {
      fs.unlink(file.filePath, () => {});
    }

    return res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete project" });
  }
};