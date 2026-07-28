import { apiFetch } from "./client";

export type ReviewSource = "upload" | "snippet" | "github";

export interface Review {
  _id: string;
  user: string;
  project: string;
  fileName?: string;
  source: ReviewSource;
  sourceRef?: string;
  code: string;
  correctedCode: string;
  Score: number;
  feedback: string;
  improvement: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScoreHistoryEntry {
  Score: number;
  createdAt: string;
}

interface CreateReviewPayload {
  projectId: string;
  fileName?: string;
  code?: string;
  githubUrl?: string;
  storedFileName?: string;
}

export function createReview(payload: CreateReviewPayload): Promise<{ message: string; review: Review }> {
  return apiFetch<{ message: string; review: Review }>("/review", { method: "POST", body: payload });
}

export function getReviewsByProject(projectId: string): Promise<Review[]> {
  return apiFetch<Review[]>(`/review/project/${projectId}`);
}

export function getScoreHistory(projectId: string): Promise<{ history: ScoreHistoryEntry[] }> {
  return apiFetch<{ history: ScoreHistoryEntry[] }>(`/review/history/${projectId}`);
}

export function deleteReview(reviewId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/review/${reviewId}`, { method: "DELETE" });
}