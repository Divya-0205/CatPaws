import { useEffect, useState } from "react";
import ScoreChart from "../components/ScoreChart";
import ReviewResultPanel from "../components/Reviewresultpanel";
import CodeModal from "../components/CodeModal";
import { useReviewFlow } from "../hooks/Usereviewflow";
import {
  getProjectById,
  addDocumentToProject,
  deleteDocumentFromProject,
  deleteFileFromProject,
  type Project,
} from "../api/project";
import {
  getReviewsByProject,
  getScoreHistory,
  deleteReview,
  type Review,
  type ScoreHistoryEntry,
} from "../api/reviews";
import { ApiError } from "../api/client";
import "../Styles/ProjectFiles.css";

interface ProjectFilesProps {
  projectId: string;
  refreshKey: number;
}

const SOURCE_LABEL: Record<string, string> = {
  upload: "📁 Uploaded",
  snippet: "✂️ Snippet",
  github: "🔗 GitHub",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function ProjectFiles({ projectId, refreshKey }: ProjectFilesProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [history, setHistory] = useState<ScoreHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [viewingCorrected, setViewingCorrected] = useState<Review | null>(null);

  const { submit, submitting, latestReview, error } = useReviewFlow(projectId, loadAll);

  async function handleSaveCorrectedCode(review: Review) {
    const name = review.fileName ? `${review.fileName} (AQ's fix)` : "AQ's corrected code";
    await addDocumentToProject(projectId, name, review.correctedCode);
    await loadAll();
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, refreshKey]);

  async function loadAll() {
    setLoading(true);
    setLoadError(null);
    try {
      const [projectData, reviewsData, historyData] = await Promise.all([
        getProjectById(projectId),
        getReviewsByProject(projectId),
        getScoreHistory(projectId),
      ]);
      setProject(projectData);
      setReviews(reviewsData);
      setHistory(historyData.history);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Couldn't load this project's files.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteFile(storedFileName: string) {
    if (!confirm("Delete this file?")) return;
    await deleteFileFromProject(projectId, storedFileName);
    await loadAll();
  }

  async function handleDeleteDocument(documentId: string | undefined) {
    if (!documentId) return;
    if (!confirm("Delete this saved code?")) return;
    await deleteDocumentFromProject(projectId, documentId);
    await loadAll();
  }

  async function handleDeleteReview(reviewId: string) {
    if (!confirm("Delete this review?")) return;
    await deleteReview(reviewId);
    await loadAll();
  }

  if (loading) return <p className="cp-muted">Loading files…</p>;
  if (loadError) return <p className="error-text">{loadError}</p>;
  if (!project) return null;

  const hasNothingSaved = project.files.length === 0 && project.documents.length === 0;
  const correctedCodeReviews = reviews.filter((r) => r.correctedCode);

  return (
    <div className="cp-files">
      <section className="cp-files-section card">
        <h2 className="cp-files-section-title">Uploaded files</h2>
        {project.files.length === 0 ? (
          <p className="cp-muted">No files uploaded yet.</p>
        ) : (
          <ul className="cp-files-list">
            {project.files.map((file) => (
              <li key={file.storedFileName} className="cp-files-row">
                <span className="cp-files-icon">📄</span>
                <span className="cp-files-name">{file.originalName}</span>
                <span className="cp-files-meta">{formatSize(file.size)}</span>
                <button
                  className="btn btn-secondary cp-files-review-btn"
                  disabled={submitting}
                  onClick={() => submit({ storedFileName: file.storedFileName, fileName: file.originalName })}
                >
                  Review
                </button>
                <button
                  className="cp-files-delete-btn"
                  onClick={() => handleDeleteFile(file.storedFileName)}
                  aria-label={`Delete ${file.originalName}`}
                  type="button"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="cp-files-section card">
        <h2 className="cp-files-section-title">Saved code</h2>
        {project.documents.length === 0 ? (
          <p className="cp-muted">No code saved yet.</p>
        ) : (
          <ul className="cp-files-list">
            {project.documents.map((doc, i) => (
              <li key={doc._id ?? i} className="cp-files-row">
                <span className="cp-files-icon">✂️</span>
                <span className="cp-files-name">{doc.fileName}</span>
                <button
                  className="btn btn-secondary cp-files-review-btn"
                  disabled={submitting}
                  onClick={() => submit({ code: doc.code, fileName: doc.fileName })}
                >
                  Review
                </button>
                <button
                  className="cp-files-delete-btn"
                  onClick={() => handleDeleteDocument(doc._id)}
                  aria-label={`Delete ${doc.fileName}`}
                  type="button"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="cp-files-section card">
        <h2 className="cp-files-section-title">Corrected code</h2>
        {correctedCodeReviews.length === 0 ? (
          <p className="cp-muted">Run a review and AQ's fixes will show up here.</p>
        ) : (
          <ul className="cp-files-list">
            {correctedCodeReviews.map((r) => (
              <li key={r._id} className="cp-files-row">
                <span className="cp-files-icon">✨</span>
                <span className="cp-files-name">{r.fileName || "Untitled"}</span>
                <span className="cp-files-meta">{r.Score}/100</span>
                <button className="btn btn-secondary cp-files-review-btn" onClick={() => setViewingCorrected(r)}>
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {hasNothingSaved && (
        <p className="cp-muted">Nothing saved to this project yet — head to "New review" to add something.</p>
      )}

      {error && <p className="error-text">{error}</p>}
      <ReviewResultPanel submitting={submitting} review={latestReview} onSaveCorrectedCode={handleSaveCorrectedCode} />

      {viewingCorrected && (
        <CodeModal
          fileName={viewingCorrected.fileName}
          code={viewingCorrected.correctedCode}
          onClose={() => setViewingCorrected(null)}
        />
      )}

      <section className="cp-files-section card">
        <h2 className="cp-files-section-title">Score history</h2>
        <ScoreChart history={history} />
      </section>

      <section>
        <h2 className="cp-files-section-title">Past reviews</h2>
        {reviews.length === 0 ? (
          <p className="cp-muted">No reviews yet.</p>
        ) : (
          <div className="cp-files-review-list">
            {reviews.map((r) => {
              const isOpen = expandedReviewId === r._id;
              return (
                <div key={r._id} className="cp-review-card card">
                  <div className="cp-review-card-header">
                    <button className="cp-review-card-header-btn" onClick={() => setExpandedReviewId(isOpen ? null : r._id)}>
                      <span className="cp-review-source">{SOURCE_LABEL[r.source] ?? r.source}</span>
                      <span className="cp-review-filename">{r.fileName || "Untitled"}</span>
                      <span className="cp-review-score">{r.Score}/100</span>
                    </button>
                    <button
                      className="cp-files-delete-btn"
                      onClick={() => handleDeleteReview(r._id)}
                      aria-label="Delete review"
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                  {isOpen && (
                    <div className="cp-review-card-body">
                      <p className="cp-review-feedback">{r.feedback}</p>
                      {r.improvement.length > 0 && (
                        <ul className="cp-review-improvements">
                          {r.improvement.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}