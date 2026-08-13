import { useEffect, useState, type FormEvent } from "react";
import "./Dashboard.css";

import CatMascot from "../../components/CatMascot";
import { useAuth } from "../../context/AuthContext";
import {
  createProject,
  getUserProjects,
  deleteProject,
  type Project,
} from "../../api/project";
import { ApiError } from "../../api/client";

interface DashboardProps {
  onOpenProject: (projectId: string) => void;
}

export default function Dashboard({
  onOpenProject,
}: DashboardProps) {
  const { user, logout } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    setError(null);

    try {
      const data = await getUserProjects();
      setProjects(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't load your projects."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) return;

    setCreating(true);

    try {
      await createProject(
        name,
        description || undefined
      );

      setName("");
      setDescription("");
      setShowForm(false);

      await loadProjects();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't create the project."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(
    e: React.MouseEvent,
    projectId: string
  ) {
    e.stopPropagation();

    if (
      !confirm(
        "Delete this project? This can't be undone."
      )
    )
      return;

    try {
      await deleteProject(projectId);
      await loadProjects();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't delete the project."
      );
    }
  }

  return (
    <div className="dashboard-page">

      <header className="dashboard-header">

        <div className="dashboard-header-left">

          <CatMascot
            size={56}
            mood="happy"
          />

          <div>
            <h1 className="dashboard-title">
              Hey{" "}
              {user?.name?.split(" ")[0] ??
                "there"}
            </h1>

            <p className="dashboard-subtitle">
              {projects.length} project{projects.length === 1 ? "" : "s"} ready for review.
            </p>
          </div>

        </div>

        <button
          onClick={logout}
          className="logout-btn"
        >
          Log out
        </button>

      </header>

      <div className="dashboard-toolbar">

        <h2 className="section-title">
          Your projects
        </h2>

        <button
          className="new-project-btn"
          onClick={() =>
            setShowForm((v) => !v)
          }
        >
          {showForm
            ? "Cancel"
            : "New project"}
        </button>

      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="project-form"
        >
          <input
            className="project-input"
            placeholder="Project name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />

          <input
            className="project-input"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />

          <button
            type="submit"
            disabled={creating}
            className="create-btn"
          >
            {creating
              ? "Creating..."
              : "Create"}
          </button>
        </form>
      )}

      {error && (
        <p className="dashboard-error">
          {error}
        </p>
      )}

      {loading ? (
        <p className="dashboard-muted">
          Loading your projects...
        </p>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <p className="dashboard-muted">
            No projects yet. Start one and AQ
            will be ready to review.
          </p>
        </div>
      ) : (
        <div className="project-grid">

          {projects.map((project) => (
            <button
              key={project._id}
              className="project-card"
              onClick={() => onOpenProject(project._id)}
            >
              <div className="card-top">

                <div className="project-folder">
                  📁
                </div>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={(e) =>
                    handleDelete(e, project._id)
                  }
                >
                  ✕
                </button>

              </div>

              <h3 className="project-name">
                {project.name}
              </h3>

              <p className="project-description">
                {project.description || "No description yet."}
              </p>

              <div className="project-footer">

                <span className="project-files">
                  📄 {project.documents.length} file
                  {project.documents.length === 1 ? "" : "s"}
                </span>

                <span className="open-project">
                  Open →
                </span>

              </div>
            </button>
          ))}

        </div>
      )}

    </div>
  );
}