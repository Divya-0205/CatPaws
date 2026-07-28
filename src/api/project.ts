import { apiFetch, getToken } from "./client";

const API_BASE = "http://localhost:3000/api";

export interface ProjectDocument {
  _id?: string;
  fileName: string;
  code: string;
  addedAt: string;
}

export interface ProjectFile {
  originalName: string;
  storedFileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface ProjectGithubLink {
  url: string;
  addedAt: string;
}

export interface Project {
  _id: string;
  user: string;
  name: string;
  description?: string;
  documents: ProjectDocument[];
  files: ProjectFile[];
  githubLinks: ProjectGithubLink[];
  createdAt: string;
  updatedAt: string;
}

export function getUserProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/projects/user");
}

export function createProject(name: string, description?: string): Promise<Project> {
  return apiFetch<Project>("/projects", { method: "POST", body: { name, description } });
}

export function getProjectById(projectId: string): Promise<Project> {
  return apiFetch<Project>(`/projects/${projectId}`);
}

export function deleteProject(projectId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/projects/${projectId}`, { method: "DELETE" });
}

export function addDocumentToProject(
  projectId: string,
  fileName: string,
  code: string
): Promise<{ message: string; project: Project }> {
  return apiFetch<{ message: string; project: Project }>(`/projects/${projectId}/documents`, {
    method: "POST",
    body: { fileName, code },
  });
}

export function deleteDocumentFromProject(projectId: string, documentId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/projects/${projectId}/documents/${documentId}`, {
    method: "DELETE",
  });
}

export function deleteFileFromProject(projectId: string, storedFileName: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/projects/${projectId}/files/${storedFileName}`, {
    method: "DELETE",
  });
}

export function addGithubLinkToProject(
  projectId: string,
  url: string
): Promise<{ message: string; project: Project }> {
  return apiFetch<{ message: string; project: Project }>(`/projects/${projectId}/github`, {
    method: "POST",
    body: { url },
  });
}

// File uploads need multipart/form-data, so this bypasses the JSON-only apiFetch helper
export async function uploadFileToProject(
  projectId: string,
  file: File
): Promise<{ message: string; project: Project }> {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}/projects/${projectId}/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Upload failed");
  }

  return data;
}