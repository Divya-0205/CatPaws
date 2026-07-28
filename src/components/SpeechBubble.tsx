import type { ReactNode } from "react";

interface SpeechBubbleProps {
  children: ReactNode;
}

export default function SpeechBubble({ children }: SpeechBubbleProps) {
  return (
    <div className="cp-bubble-wrap">
      <style>{`
        .cp-bubble-wrap {
          animation: cp-pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
        }
        .cp-bubble {
          position: relative;
          background: #ffffff;
          border: 3px solid #3d2438;
          border-radius: 24px;
          padding: 18px 22px;
          max-width: 500px;
        }
        .cp-bubble::before {
          content: "";
          position: absolute;
          left: -18px;
          top: 38px;
          width: 0;
          height: 0;
          border-top: 12px solid transparent;
          border-bottom: 12px solid transparent;
          border-right: 18px solid #3d2438;
        }
        .cp-bubble::after {
          content: "";
          position: absolute;
          left: -14px;
          top: 40px;
          width: 0;
          height: 0;
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
          border-right: 15px solid #ffffff;
        }
        @keyframes cp-pop-in {
          0% { opacity: 0; transform: scale(0.7) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (max-width: 720px) {
          .cp-bubble::before, .cp-bubble::after { display: none; }
        }
      `}</style>
      <div className="cp-bubble">{children}</div>
    </div>
  );
}