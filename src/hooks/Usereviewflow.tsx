import { useState } from "react";
import { createReview, type Review } from "../api/reviews";
import { ApiError } from "../api/client";

interface SubmitOptions {
  fileName?: string;
  code?: string;
  githubUrl?: string;
  storedFileName?: string;
}

export function useReviewFlow(projectId: string, onDone?: () => void) {
  const [submitting, setSubmitting] = useState(false);
  const [latestReview, setLatestReview] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(options: SubmitOptions) {
    setError(null);
    setSubmitting(true);
    try {
      const res = await createReview({ projectId, ...options });
      setLatestReview(res.review);
      if (onDone) await onDone();
      return res.review;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "AQ couldn't review that just now. Try again.");
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  return { submit, submitting, latestReview, error, setError };
}