 import "./CatMascot.css";

interface CatMascotProps {
  size?: number;
  mood?: "happy" | "neutral" | "concerned" | "reading";
}

const INK = "#6b5568";
const BLUSH = "#f9c9d6";
const BLUSH_DEEP = "#f2a0b4";
const LAVENDER = "#d9cff2";

export default function CatMascot({ size = 280, mood = "happy" }: CatMascotProps) {
  const isReading = mood === "reading";

  const mouth =
    mood === "concerned"
      ? { left: "M148 178 Q160 170 172 178", right: "" }
      : mood === "neutral" || isReading
        ? { left: "M148 182 L172 182", right: "" }
        : { left: "M160 176 Q160 184 148 188", right: "M160 176 Q160 184 172 188" };

  return (
    <svg
      className="cp-cat"
      width={size}
      height={size * 1.05}
      viewBox="0 0 320 340"
      role="img"
      aria-label={`AQ the cat mascot, feeling ${mood}`}
    >
      <path className="cp-tail" d="M245 255 C 285 240, 295 190, 265 165" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      <path d="M245 255 C 285 240, 295 190, 265 165" fill="none" stroke={BLUSH} strokeWidth="3" strokeLinecap="round" opacity="0.6" />

      <ellipse cx="160" cy="255" rx="95" ry="72" fill="#ffffff" stroke={INK} strokeWidth="4" />
      <ellipse cx="105" cy="315" rx="24" ry="16" fill="#ffffff" stroke={INK} strokeWidth="3.5" />

      <path d="M100 205 Q160 228 220 205" fill="none" stroke={BLUSH_DEEP} strokeWidth="14" strokeLinecap="round" />
      <path
        d="M160 214 c -8 -9 -22 -3 -22 8 c 0 10 14 18 22 24 c 8 -6 22 -14 22 -24 c 0 -11 -14 -17 -22 -8 Z"
        fill={LAVENDER}
        stroke={INK}
        strokeWidth="2.5"
      />

      {!isReading && (
        <g className="cp-paw">
          <ellipse cx="235" cy="205" rx="20" ry="26" fill="#ffffff" stroke={INK} strokeWidth="3.5" />
          <line x1="228" y1="198" x2="228" y2="212" stroke={BLUSH} strokeWidth="3" strokeLinecap="round" />
          <line x1="235" y1="196" x2="235" y2="212" stroke={BLUSH} strokeWidth="3" strokeLinecap="round" />
          <line x1="242" y1="198" x2="242" y2="212" stroke={BLUSH} strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      <path d="M95 95 L120 55 L142 100 Z" fill="#ffffff" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M105 90 L120 68 L134 92 Z" fill={BLUSH} />
      <path d="M225 95 L200 55 L178 100 Z" fill="#ffffff" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M215 90 L200 68 L186 92 Z" fill={BLUSH} />

      <ellipse cx="160" cy="140" rx="88" ry="78" fill="#ffffff" stroke={INK} strokeWidth="4" />

      <ellipse cx="120" cy="90" rx="14" ry="10" fill={BLUSH} opacity="0.55" />
      <ellipse cx="205" cy="105" rx="10" ry="16" fill={BLUSH} opacity="0.45" />

      <g stroke={INK} strokeWidth="2" strokeLinecap="round">
        <line x1="55" y1="140" x2="100" y2="135" />
        <line x1="52" y1="155" x2="100" y2="153" />
        <line x1="220" y1="135" x2="265" y2="140" />
        <line x1="220" y1="153" x2="268" y2="155" />
      </g>

      <circle cx="100" cy="165" r="15" fill={BLUSH} opacity="0.7" />
      <circle cx="220" cy="165" r="15" fill={BLUSH} opacity="0.7" />

      <g className={isReading ? "cp-eyes-reading" : "cp-eyes"}>
        <ellipse cx="128" cy="145" rx="15" ry="19" fill={INK} />
        <circle cx="132" cy="138" r="4" fill="#ffffff" />
        <ellipse cx="192" cy="145" rx="15" ry="19" fill={INK} />
        <circle cx="196" cy="138" r="4" fill="#ffffff" />
        <path d="M113 128 Q118 120 126 122" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M207 128 Q202 120 194 122" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      <path d="M154 168 L166 168 L160 176 Z" fill={BLUSH_DEEP} />
      <path d={mouth.left} stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      {mouth.right && <path d={mouth.right} stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />}

      {isReading && (
        <g className="cp-magnifier">
          <circle cx="200" cy="130" r="30" fill="rgba(217,207,242,0.25)" stroke={INK} strokeWidth="4" />
          <line x1="221" y1="151" x2="240" y2="170" stroke={INK} strokeWidth="6" strokeLinecap="round" />
          <circle cx="200" cy="130" r="30" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
          <ellipse cx="248" cy="180" rx="16" ry="21" fill="#ffffff" stroke={INK} strokeWidth="3" transform="rotate(35 248 180)" />
        </g>
      )}
    </svg>
  );
}