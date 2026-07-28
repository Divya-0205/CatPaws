import type { ScoreHistoryEntry } from "../api/reviews";

interface ScoreChartProps {
  history: ScoreHistoryEntry[];
}

export default function ScoreChart({ history }: ScoreChartProps) {
  if (history.length === 0) {
    return (
      <p style={{ color: "var(--plum-soft)", fontSize: "0.9rem" }}>
        No reviews yet — submit some code and AQ's scores will show up here.
      </p>
    );
  }

  const width = 560;
  const height = 200;
  const padding = 32;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = history.map((entry, i) => {
    const x = history.length === 1 ? padding + innerWidth / 2 : padding + (i / (history.length - 1)) * innerWidth;
    const y = padding + innerHeight - (entry.Score / 100) * innerHeight;
    return { x, y, score: entry.Score };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Score history over time">
      <line x1={padding} y1={padding} x2={padding} y2={padding + innerHeight} stroke="var(--blush-pale)" strokeWidth="2" />
      <line
        x1={padding}
        y1={padding + innerHeight}
        x2={padding + innerWidth}
        y2={padding + innerHeight}
        stroke="var(--blush-pale)"
        strokeWidth="2"
      />
      <path d={linePath} fill="none" stroke="var(--lavender-deep)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="5" fill="var(--blush-deep)" stroke="var(--plum)" strokeWidth="2" />
      ))}
      <text x={padding - 8} y={padding + 4} textAnchor="end" fontSize="11" fill="var(--plum-soft)" fontFamily="var(--font-body)">
        100
      </text>
      <text x={padding - 8} y={padding + innerHeight + 4} textAnchor="end" fontSize="11" fill="var(--plum-soft)" fontFamily="var(--font-body)">
        0
      </text>
    </svg>
  );
}