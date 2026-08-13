import { useEffect, useState } from "react";
import { getProjectById, type Project } from "../api/project";
import { getReviewsByProject, getScoreHistory, type Review, type ScoreHistoryEntry } from "../api/reviews";
import { ApiError } from "../api/client";
import ScoreChart from "../components/ScoreChart";
import "../Styles/ProjectAnalysis.css";

interface ProjectAnalysisProps {
  projectId: string;
}

// ---------- Language detection ----------
// We guess the language from the review's file extension. This is a very
// simple lookup table — it only covers the categories the analysis page
// needs to show.
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  cpp: "C++",
  cc: "C++",
  cxx: "C++",
  c: "C++",
  h: "C++",
  hpp: "C++",
  py: "Python",
  java: "Java",
  js: "JavaScript",
  jsx: "JavaScript",
  ts: "TypeScript",
  tsx: "TypeScript",
  html: "HTML/CSS",
  css: "HTML/CSS",
};

const LANGUAGE_CATEGORIES = ["C++", "Python", "Java", "JavaScript", "TypeScript", "HTML/CSS", "Other"];

function detectLanguage(fileName?: string): string {
  if (!fileName || !fileName.includes(".")) return "Other";
  const extension = fileName.split(".").pop()!.toLowerCase();
  return EXTENSION_TO_LANGUAGE[extension] || "Other";
}

// ---------- Common improvement areas ----------
// The AI gives back free-text suggestions (e.g. "Add input validation for
// the age field"), so two suggestions are almost never the exact same
// sentence. Instead of counting exact matches, we sort every suggestion
// into a small set of common categories based on keywords. This is a basic
// approach, but it's enough to spot patterns like "I keep getting told to
// add error handling."
const IMPROVEMENT_CATEGORIES: { label: string; keywords: string[] }[] = [
  { label: "Error handling", keywords: ["error", "exception", "try", "catch"] },
  { label: "Input validation", keywords: ["valid", "input", "null", "edge case"] },
  { label: "Naming", keywords: ["name", "naming", "rename"] },
  { label: "Code structure", keywords: ["function", "structure", "modular", "split", "break", "refactor"] },
  { label: "Comments & docs", keywords: ["comment", "documentation", "docstring"] },
  { label: "Performance", keywords: ["performance", "efficient", "optimi", "slow"] },
  { label: "Readability", keywords: ["readab", "formatting", "style", "indent"] },
];

interface ImprovementCount {
  label: string;
  count: number;
}

function getCommonImprovements(reviews: Review[]): ImprovementCount[] {
  // start every category at 0
  const counts = new Map<string, number>();
  for (const category of IMPROVEMENT_CATEGORIES) counts.set(category.label, 0);
  let otherCount = 0;

  for (const review of reviews) {
    for (const suggestion of review.improvement) {
      const text = suggestion.toLowerCase();
      const matchedCategory = IMPROVEMENT_CATEGORIES.find((category) =>
        category.keywords.some((keyword) => text.includes(keyword))
      );
      if (matchedCategory) {
        counts.set(matchedCategory.label, (counts.get(matchedCategory.label) || 0) + 1);
      } else {
        otherCount += 1;
      }
    }
  }

  const result: ImprovementCount[] = Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .filter((c) => c.count > 0);

  if (otherCount > 0) result.push({ label: "Other", count: otherCount });

  return result.sort((a, b) => b.count - a.count);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function ProjectAnalysis({ projectId }: ProjectAnalysisProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [history, setHistory] = useState<ScoreHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      // Reuse the same three API calls the other tabs already use —
      // no new backend endpoints needed for this page.
      const [projectData, reviewsData, historyData] = await Promise.all([
        getProjectById(projectId),
        getReviewsByProject(projectId),
        getScoreHistory(projectId),
      ]);
      setProject(projectData);
      setReviews(reviewsData);
      setHistory(historyData.history);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load analysis for this project.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="cp-muted">Loading analysis…</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!project) return null;

  // ---------- Overview numbers ----------
  const totalReviews = reviews.length;
  const totalFiles = project.files.length;
  const scores = reviews.map((r) => r.Score);
  const averageScore = scores.length ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;
  const highestScore = scores.length ? Math.max(...scores) : 0;
  const lowestScore = scores.length ? Math.min(...scores) : 0;

  // history is sorted oldest -> newest (that's how getScoreHistory returns it)
  const latestScore = history.length ? history[history.length - 1].Score : null;
  const improvement =
    history.length >= 2 ? history[history.length - 1].Score - history[0].Score : null;

  // ---------- Language breakdown ----------
  const languageCounts = new Map<string, number>();
  for (const category of LANGUAGE_CATEGORIES) languageCounts.set(category, 0);
  for (const review of reviews) {
    const language = detectLanguage(review.fileName);
    languageCounts.set(language, (languageCounts.get(language) || 0) + 1);
  }
  const maxLanguageCount = Math.max(1, ...Array.from(languageCounts.values()));

  // ---------- Review statistics ----------
  const uploadedReviews = reviews.filter((r) => r.source === "upload").length;
  const githubReviews = reviews.filter((r) => r.source === "github").length;
  const snippetReviews = reviews.filter((r) => r.source === "snippet").length;

  // ---------- Common improvements ----------
  const commonImprovements = getCommonImprovements(reviews);
  const maxImprovementCount = Math.max(1, ...commonImprovements.map((c) => c.count));

  // ---------- Recent reviews ----------
  const recentReviews = reviews.slice(0, 5); // getReviewsByProject already sorts newest first

  return (
    <div className="cp-analysis">
      {/* 1. Project overview */}
      <section className="cp-analysis-section card">
        <h2 className="cp-analysis-section-title">Project overview</h2>
        <p className="cp-analysis-project-name">{project.name}</p>
        {project.description && <p className="cp-muted">{project.description}</p>}
        {project.techStack && <p className="cp-analysis-tech">Tech stack: {project.techStack}</p>}

        <div className="cp-stat-grid">
          <div className="cp-stat-box">
            <span className="cp-stat-value">{totalReviews}</span>
            <span className="cp-stat-label">Total reviews</span>
          </div>
          <div className="cp-stat-box">
            <span className="cp-stat-value">{totalFiles}</span>
            <span className="cp-stat-label">Uploaded files</span>
          </div>
          <div className="cp-stat-box">
            <span className="cp-stat-value">{averageScore}</span>
            <span className="cp-stat-label">Average score</span>
          </div>
          <div className="cp-stat-box">
            <span className="cp-stat-value">{highestScore}</span>
            <span className="cp-stat-label">Highest score</span>
          </div>
          <div className="cp-stat-box">
            <span className="cp-stat-value">{lowestScore}</span>
            <span className="cp-stat-label">Lowest score</span>
          </div>
        </div>
      </section>

      {/* 2. Score analytics */}
      <section className="cp-analysis-section card">
        <h2 className="cp-analysis-section-title">Score analytics</h2>
        <ScoreChart history={history} />
        <div className="cp-stat-grid">
          <div className="cp-stat-box">
            <span className="cp-stat-value">{averageScore}</span>
            <span className="cp-stat-label">Average score</span>
          </div>
          <div className="cp-stat-box">
            <span className="cp-stat-value">{latestScore ?? "—"}</span>
            <span className="cp-stat-label">Latest score</span>
          </div>
          <div className="cp-stat-box">
            <span
              className={
                "cp-stat-value " +
                (improvement === null ? "" : improvement >= 0 ? "cp-stat-positive" : "cp-stat-negative")
              }
            >
              {improvement === null ? "—" : improvement >= 0 ? `+${improvement}` : improvement}
            </span>
            <span className="cp-stat-label">Improvement (first → latest)</span>
          </div>
        </div>
      </section>

      {/* 3. Language breakdown */}
      <section className="cp-analysis-section card">
        <h2 className="cp-analysis-section-title">Language breakdown</h2>
        {totalReviews === 0 ? (
          <p className="cp-muted">No reviews yet, so there's nothing to break down.</p>
        ) : (
          <div className="cp-bar-list">
            {LANGUAGE_CATEGORIES.map((language) => {
              const count = languageCounts.get(language) || 0;
              const widthPercent = (count / maxLanguageCount) * 100;
              return (
                <div className="cp-bar-row" key={language}>
                  <span className="cp-bar-label">{language}</span>
                  <div className="cp-bar-track">
                    <div className="cp-bar-fill" style={{ width: `${widthPercent}%` }} />
                  </div>
                  <span className="cp-bar-count">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Review statistics */}
      <section className="cp-analysis-section card">
        <h2 className="cp-analysis-section-title">Review statistics</h2>
        <div className="cp-stat-grid">
          <div className="cp-stat-box">
            <span className="cp-stat-value">{totalReviews}</span>
            <span className="cp-stat-label">Total AI reviews</span>
          </div>
          <div className="cp-stat-box">
            <span className="cp-stat-value">{uploadedReviews}</span>
            <span className="cp-stat-label">Uploaded file reviews</span>
          </div>
          <div className="cp-stat-box">
            <span className="cp-stat-value">{githubReviews}</span>
            <span className="cp-stat-label">GitHub reviews</span>
          </div>
          <div className="cp-stat-box">
            <span className="cp-stat-value">{snippetReviews}</span>
            <span className="cp-stat-label">Snippet reviews</span>
          </div>
        </div>
      </section>

      {/* 5. Common improvement areas */}
      <section className="cp-analysis-section card">
        <h2 className="cp-analysis-section-title">Common improvement areas</h2>
        <p className="cp-muted cp-analysis-note">
          Grouped by keyword from all of AQ's past suggestions on this project.
        </p>
        {commonImprovements.length === 0 ? (
          <p className="cp-muted">No suggestions recorded yet.</p>
        ) : (
          <div className="cp-bar-list">
            {commonImprovements.map((item) => (
              <div className="cp-bar-row" key={item.label}>
                <span className="cp-bar-label">{item.label}</span>
                <div className="cp-bar-track">
                  <div
                    className="cp-bar-fill cp-bar-fill-alt"
                    style={{ width: `${(item.count / maxImprovementCount) * 100}%` }}
                  />
                </div>
                <span className="cp-bar-count">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Recent reviews */}
      <section className="cp-analysis-section card">
        <h2 className="cp-analysis-section-title">Recent reviews</h2>
        {recentReviews.length === 0 ? (
          <p className="cp-muted">No reviews yet.</p>
        ) : (
          <ul className="cp-recent-list">
            {recentReviews.map((review) => (
              <li className="cp-recent-row" key={review._id}>
                <span className="cp-recent-name">{review.fileName || "Untitled"}</span>
                <span className="cp-recent-score">{review.Score}/100</span>
                <span className="cp-recent-date">{formatDate(review.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}