import CatMascot from "../components/CatMascot";
import SpeechBubble from "../components/SpeechBubble";

interface WelcomeProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function Welcome({ onGetStarted, onLogin }: WelcomeProps) {
  return (
    <div style={styles.page}>
      <style>{`
        .cp-paw-print { position: absolute; opacity: 0.12; pointer-events: none; }
        .cp-cta-primary:hover { background: #ee93aa; }
        .cp-cta-secondary:hover { background: #f4eefd; }
      `}</style>

      <PawPrint style={{ top: "8%", left: "6%", transform: "rotate(-18deg)" }} />
      <PawPrint style={{ bottom: "10%", right: "8%", transform: "rotate(14deg)" }} size={44} />
      <PawPrint style={{ top: "18%", right: "14%", transform: "rotate(30deg)" }} size={28} />

      <header style={styles.hero}>
        <div style={styles.catCol}>
          <CatMascot size={260} mood="happy" />
        </div>

        <div style={styles.textCol}>
          <SpeechBubble>
            <p style={styles.bubbleText}>
              Meow, I'm AQ! Your friendly AI code reviewer, with sharp eyes and soft paws.
            </p>
          </SpeechBubble>

          <h1 style={styles.headline}>Code review that doesn't bite</h1>
          <p style={styles.subhead}>
            Paste your code or a GitHub link, and AQ reads through it line by line — catching
            what to fix and cheering on what you got right.
          </p>

          <div style={styles.ctaRow}>
            <button className="cp-cta-primary" style={styles.primaryBtn} onClick={onGetStarted}>
              Get started
            </button>
            <button className="cp-cta-secondary" style={styles.secondaryBtn} onClick={onLogin}>
              I already have an account
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

function PawPrint({ style, size = 40 }: { style: React.CSSProperties; size?: number }) {
  return (
    <svg className="cp-paw-print" style={style} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <ellipse cx="50" cy="65" rx="26" ry="22" fill="#3d2438" />
      <ellipse cx="22" cy="35" rx="11" ry="14" fill="#3d2438" />
      <ellipse cx="48" cy="20" rx="11" ry="14" fill="#3d2438" />
      <ellipse cx="74" cy="35" rx="11" ry="14" fill="#3d2438" />
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem 1.5rem",
  },
  hero: {
    display: "flex",
    alignItems: "center",
    gap: "3rem",
    maxWidth: "980px",
    width: "100%",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  catCol: { flex: "0 0 auto" },
  textCol: { flex: "1 1 380px", maxWidth: "460px", display: "flex", flexDirection: "column", gap: "1.1rem" },
  bubbleText: { margin: 0, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "1rem", color: "var(--plum)", lineHeight: 1.5 },
  headline: {
    margin: 0,
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "clamp(2rem, 4vw, 2.75rem)",
    color: "var(--plum)",
    lineHeight: 1.1,
  },
  subhead: { margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "1.05rem", color: "var(--plum-soft)", lineHeight: 1.6 },
  ctaRow: { display: "flex", gap: "0.9rem", marginTop: "0.5rem", flexWrap: "wrap" },
  primaryBtn: {
    background: "linear-gradient(180deg,rgb(246, 140, 230) 0%,rgb(185, 127, 243) 100%)",
    color: "var(--plum)",
    border: "3px solid var(--plum)",
    borderRadius: "999px",
    padding: "0.8rem 1.7rem",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  secondaryBtn: {
    background:
    "linear-gradient(180deg,rgb(246, 140, 230) 0%,rgb(185, 127, 243) 100%)",
  color: "var(--plum)",
  border: "3px solid var(--lavender-deep)",
  borderRadius: "999px",
  padding: "0.8rem 1.7rem",
  fontSize: "1rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.25s ease",
  boxShadow: "0 4px 12px rgba(145, 111, 232, 0.08)",

  },
};
