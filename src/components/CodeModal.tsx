import { useState } from "react";
import "./CodeModal.css";

interface CodeModalProps {
  fileName?: string;
  code: string;
  onClose: () => void;
  onSave?: () => Promise<void> | void;
}

export default function CodeModal({ fileName, code, onClose, onSave }: CodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave() {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div className="cp-modal card" onClick={(e) => e.stopPropagation()}>
        <div className="cp-modal-header">
          <h3 className="cp-modal-title">✨ AQ's corrected code{fileName ? ` — ${fileName}` : ""}</h3>
          <button className="cp-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <pre className="cp-modal-code">
          <code>{code}</code>
        </pre>

        <div className="cp-modal-actions">
          <button className="btn btn-secondary" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy code"}
          </button>
          {onSave && (
            <button className="btn btn-accent" onClick={handleSave} disabled={saving || saved}>
              {saved ? "Saved to project" : saving ? "Saving…" : "Save this version"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}