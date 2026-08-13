import { useState } from "react";
import { updateProject, type Project } from "../api/project";
import "./ProjectContextPanel.css";

interface ProjectContextPanelProps {
  project: Project;
  onSaved: () => void; // parent re-fetches the project after a successful save
}

/**
 * A small panel where the user can edit the project's name/description,
 * and tell AQ a bit more about the project (its goal, tech stack, and any
 * extra notes). This extra info gets sent to the AI on the backend so
 * future reviews can be more relevant to what the project is actually for.
 *
 * When not editing, it just shows a short summary. Clicking "Edit" swaps
 * to a simple form with plain <input>/<textarea> fields.
 */
export default function ProjectContextPanel({ project, onSaved }: ProjectContextPanelProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields — start empty, get filled in when the user clicks Edit
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [projectGoal, setProjectGoal] = useState(project.projectGoal || "");
  const [techStack, setTechStack] = useState(project.techStack || "");
  const [additionalContext, setAdditionalContext] = useState(project.additionalContext || "");

  function startEditing() {
    // Make sure the form always starts from the latest saved values
    setName(project.name);
    setDescription(project.description || "");
    setProjectGoal(project.projectGoal || "");
    setTechStack(project.techStack || "");
    setAdditionalContext(project.additionalContext || "");
    setError(null);
    setEditing(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("Project name can't be empty.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateProject(project._id, {
        name,
        description,
        projectGoal,
        techStack,
        additionalContext,
      });
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save project details.");
    } finally {
      setSaving(false);
    }
  }

  // ---------- View mode (not editing) ----------
  if (!editing) {
    const hasContext = project.projectGoal || project.techStack || project.additionalContext;

    return (
      <div className="cp-context-panel card">
        <div className="cp-context-header">
          <h2 className="cp-context-title">AI Context</h2>
          <button className="cp-context-btn cp-context-btn-secondary" onClick={startEditing}>
            Edit
          </button>
        </div>

        {hasContext ? (
          <div className="cp-context-summary">
            {project.projectGoal && (
              <p>
                <strong>Goal:</strong> {project.projectGoal}
              </p>
            )}
            {project.techStack && (
              <p>
                <strong>Tech stack:</strong> {project.techStack}
              </p>
            )}
            {project.additionalContext && (
              <p>
                <strong>Notes:</strong> {project.additionalContext}
              </p>
            )}
          </div>
        ) : (
          <p className="cp-context-empty">
            No extra context yet. Add your project's goal and tech stack so AQ can give you more
            relevant reviews.
          </p>
        )}
      </div>
    );
  }

  // ---------- Edit mode ----------
  return (
    <div className="cp-context-panel card">
      <h2 className="cp-context-title">Edit project details</h2>

      <label className="cp-context-field">
        Project name
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="cp-context-field">
        Description
        <input value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <label className="cp-context-field">
        Project goal
        <input
          placeholder="e.g. A to-do list app for college students"
          value={projectGoal}
          onChange={(e) => setProjectGoal(e.target.value)}
        />
      </label>

      <label className="cp-context-field">
        Tech stack
        <input
          placeholder="e.g. React, Node.js, MongoDB"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
        />
      </label>

      <label className="cp-context-field">
        Additional notes (optional)
        <textarea
          rows={3}
          placeholder="Anything else AQ should know before reviewing your code"
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
        />
      </label>

      {error && <p className="error-text">{error}</p>}

      <div className="cp-context-actions">
        <button
          className="cp-context-btn cp-context-btn-secondary"
          onClick={() => setEditing(false)}
          disabled={saving}
        >
          Cancel
        </button>
        <button className="cp-context-btn cp-context-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}