import { useEffect, useState } from "react";
import { getProjectById, type Project } from "../api/project";
import { ApiError } from "../api/client";
import NewReview from "../pages/NewReview";
import ProjectFiles from "../pages/Projectfiles";
import ProjectAnalysis from "../pages/ProjectAnalysis";
import ProjectContextPanel from "../components/ProjectcontextPanel";
import "../Styles/Projectdetail.css";

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

type Tab = "review" | "files" | "analysis";

export default function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [tab, setTab] = useState<Tab>("review");
  const [error, setError] = useState<string | null>(null);
  const [filesRefreshKey, setFilesRefreshKey] = useState(0);

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function loadProject() {
    try {
      const data = await getProjectById(projectId);
      setProject(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load this project.");
    }
  }

  async function handleProjectChanged() {
    await loadProject();
    setFilesRefreshKey((k) => k + 1);
  }

  return (
    <div className="cp-pd-page">
      <button onClick={onBack} className="btn btn-ghost cp-pd-back">
        ← Back to projects
      </button>

      <header>
        <h1 className="cp-pd-title">{project?.name ?? "Loading…"}</h1>
        {project?.description && <p className="cp-pd-subtitle">{project.description}</p>}
      </header>

      <nav className="cp-pd-tabs">
        <button className={`cp-pd-tab ${tab === "review" ? "cp-pd-tab-active" : ""}`} onClick={() => setTab("review")}>
          New review
        </button>
        <button className={`cp-pd-tab ${tab === "files" ? "cp-pd-tab-active" : ""}`} onClick={() => setTab("files")}>
          Files
        </button>
        <button className={`cp-pd-tab ${tab === "analysis" ? "cp-pd-tab-active" : ""}`} onClick={() => setTab("analysis")}>
          Analysis
        </button>
      </nav>

      {error && <p className="error-text">{error}</p>}

      {project && <ProjectContextPanel project={project} onSaved={loadProject} />}

      {tab === "review" && <NewReview projectId={projectId} onProjectChanged={handleProjectChanged} />}
      {tab === "files" && <ProjectFiles projectId={projectId} refreshKey={filesRefreshKey} />}
      {tab === "analysis" && <ProjectAnalysis projectId={projectId} />}
    </div>
  );
}