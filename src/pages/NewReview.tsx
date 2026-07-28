import { useRef, useState, type FormEvent } from "react";
import CatMascot from "../components/CatMascot";
import SpeechBubble from "../components/SpeechBubble";
import ReviewResultPanel from "../components/Reviewresultpanel";
import { useReviewFlow } from "../hooks/Usereviewflow";
import { addDocumentToProject, uploadFileToProject } from "../api/project";
import "../Styles/NewReview.css";
import type { Review } from "../api/reviews";

interface NewReviewProps {
  projectId: string;
  onProjectChanged: () => void;
}

export default function NewReview({
  projectId,
  onProjectChanged,
}: NewReviewProps) {

  const {
    submit,
    submitting,
    latestReview,
    error,
    setError,
  } = useReviewFlow(projectId, onProjectChanged);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);

  const [githubUrl, setGithubUrl] = useState("");

  const [snippetName, setSnippetName] = useState("");

  const [snippetCode, setSnippetCode] = useState("");

  async function handleFilePicked(
    e: FormEvent<HTMLInputElement>
  ) {

    const file = e.currentTarget.files?.[0];

    if (!file) return;

    setUploading(true);
    setError(null);

    try {

      const res = await uploadFileToProject(
        projectId,
        file
      );

      const uploaded =
        res.project.files[
          res.project.files.length - 1
        ];

      await onProjectChanged();

      await submit({
        storedFileName: uploaded.storedFileName,
        fileName: uploaded.originalName,
      });

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Upload failed."
      );

    } finally {

      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    }

  }

  async function handleGithubSubmit(
    e: FormEvent
  ) {

    e.preventDefault();

    if (!githubUrl.trim()) return;

    await submit({
      githubUrl,
    });

    setGithubUrl("");

  }

  async function handleSnippetSubmit(
    e: FormEvent
  ) {

    e.preventDefault();

    if (!snippetCode.trim()) return;

    await submit({
      code: snippetCode,
      fileName: snippetName || undefined,
    });

    setSnippetName("");
    setSnippetCode("");

  }

  const busy = submitting || uploading;

  async function handleSavecorrectedCode(review : Review){
    const name = review.fileName ? `${review.fileName}(AQ's fix)` : "AQ's corected Code";
    await addDocumentToProject(projectId, name, review.correctedCode);
    await onProjectChanged();
  }

  return (

    <div className="cp-newreview">

      <section className="cp-review-hero">

        <div className="cp-review-hero-left">

          <h1>
            AQ AI Code Review
          </h1>

          <p>
            Welcome back! Upload a source file,
            connect a GitHub repository, or paste
            a code snippet. AQ will inspect your
            code, assign a quality score, explain
            problems, and suggest improvements.
          </p>

          <div className="cp-review-tags">

            <span>AI Powered</span>

            <span>Detailed Feedback</span>

            <span>Best Practices</span>

          </div>

        </div>

        <div className="cp-review-hero-right">

          <div className="cp-floating-circle circle1"></div>

          <div className="cp-floating-circle circle2"></div>

          <div className="cp-cat-card">

            <CatMascot
              size={180}
              mood="happy"
            />

            <SpeechBubble>

              Hi! I'm <strong>AQ</strong>.

              <br /><br />

              Upload a file, connect GitHub,
              or paste a code snippet and
              I'll review your project for
              quality, bugs and improvements.

            </SpeechBubble>

          </div>

        </div>

      </section>

      <section className="cp-method-grid">
        <div className="cp-method-card">
            <div className="cp-method-icon">
                📄
                 </div>
                  <h2> Upload Source Files </h2>
                  <p>
            Upload any supported programming
            file and let AQ analyze it instantly.
          </p>
        <input
            ref={fileInputRef}
            type="file"
            disabled={busy}
            onChange={handleFilePicked}
            accept=".py,.cpp,.cc,.c,.h,.hpp,.java,.js,.jsx,.ts,.tsx,.go,.rb,.php,.cs,.rs,.swift,.kt,.scala,.sql,.html,.css,.json,.xml,.yaml,.yml,.md"
          />
          {uploading && (

            <div className="cp-loading-box">

              <CatMascot
                size={90}
                mood="reading"
              />
            <p>
                AQ is carefully reading your code...
              </p>
            </div>
             )}

        </div>

        <div className="cp-method-card">

          <div className="cp-method-icon">
            🔗
          </div>
        <h2 > 
            Review GitHub File
          </h2>

          <p>
            Paste a GitHub file URL and AQ
            will fetch and review it without
            downloading anything manually.
          </p>

          <form
            className="cp-method-form"
            onSubmit={handleGithubSubmit}
          >

            <input
              type="url"
              placeholder="https://github.com/..."
              value={githubUrl}
              disabled={busy}
              onChange={(e) =>
                setGithubUrl(
                  e.target.value
                )
              }
            />

            <button
              type="submit"
              className="cp-gradient-btn"
              disabled={
                busy ||
                !githubUrl.trim()
              }
            >
              Review GitHub
            </button>

          </form>

        </div>

      </section>

      <section className="cp-snippet-section">

        <div className="cp-snippet-header">

          <div>

            <h2>
              Paste Code Snippet
            </h2>

            <p>
              Don't have a file? Paste your
              code below and AQ will review
              it just the same.
            </p>

          </div>

        </div>

        <form
          className="cp-snippet-form"
          onSubmit={handleSnippetSubmit}
        >
                      <input
            type="text"
            placeholder="Filename (optional)"
            value={snippetName}
            disabled={busy}
            onChange={(e) =>
              setSnippetName(e.target.value)
            }
          />

          <textarea
            className="cp-snippet-editor"
            rows={14}
            placeholder={`Paste your code here...

Example:

def hello():
    print("Hello AQ!")`}
            value={snippetCode}
            disabled={busy}
            onChange={(e) =>
              setSnippetCode(
                e.target.value
              )
            }
          />

          <div className="cp-snippet-footer">

            <span className="cp-editor-info">

              AQ supports Python, C, C++, Java,
              JavaScript, TypeScript, Go, Rust,
              PHP, HTML, CSS and many more.

            </span>

            <button
              type="submit"
              className="cp-gradient-btn cp-large-btn"
              disabled={
                busy ||
                !snippetCode.trim()
              }
            >
              Review with AQ
            </button>

          </div>

        </form>

      </section>

      {error && (

        <div className="cp-error-box">

          {error}

        </div>

      )}

      <ReviewResultPanel
        submitting={submitting}
        review={latestReview}
        onSaveCorrectedCode={handleSavecorrectedCode}
      />
            <div className="cp-review-footer">

        <div className="cp-footer-card">

          <CatMascot
            size={80}
            mood={
              submitting
                ? "reading"
                : latestReview
                ? latestReview.Score >= 70
                  ? "happy"
                  : latestReview.Score >= 40
                  ? "neutral"
                  : "concerned"
                : "happy"
            }
          />

          <div>

            <h3>
              AQ is always ready to help.
            </h3>

            <p>
              Upload another file, paste more code,
              or review a GitHub file whenever you're ready.
            </p>

          </div>

        </div>

      </div>
          

    </div>
   

  );

}

