import {useState} from "react";
import CatMascot from "./CatMascot";
import SpeechBubble from "./SpeechBubble";
import CodeModal from "../components/CodeModal";
import type { Review } from "../api/reviews";
import "./ReviewResultPanel.css";

function moodForScore(score: number | null): "happy" | "neutral" | "concerned" {
  if (score === null) return "happy";
  if (score >= 70) return "happy";
  if (score >= 40) return "neutral";
  return "concerned";
}

interface ReviewResultPanelProps {
  submitting: boolean;
  review: Review | null;
  onSaveCorrectedCode? : (review : Review) => Promise<void>|void;
}

export default function ReviewResultPanel({ submitting, review , onSaveCorrectedCode }: ReviewResultPanelProps) {
  const[Showcode, setShowCode] = useState(false);
  if (!submitting && !review) return null;

  const mood = submitting ? "reading" : moodForScore(review?.Score ?? null);



  return (
    <section className="cp-result card">
      <div className="cp-result-cat">
        <CatMascot size={130} mood={mood} />
      </div>
      <div className="cp-result-text">
        <SpeechBubble>
          {submitting ? (
            <p className="cp-result-loading">AQ is reading…</p>
          ) : (
            review && (
              <>
                <p className="cp-result-score">Score: {review.Score}/100</p>
                <p className="cp-result-feedback">{review.feedback}</p>
                {review.improvement.length > 0 && (
                  <ul className="cp-result-improvements">
                    {review.improvement.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
                {review.correctedCode &&( 
                  <button className = "btn btn-secondary cp-result-code-btn" onClick = {() => setShowCode(true)}>
                    ✨View corrected Code

                  </button>
                )
                }
              </>
            )
          )}
        </SpeechBubble>
      </div>
      {Showcode && review &&(
        <CodeModal 
        fileName = {review.fileName}
        code = {review.correctedCode}
        onClose = {() => setShowCode(false)}
        onSave = {onSaveCorrectedCode ? () => onSaveCorrectedCode(review): undefined}
        />
      )}
  
    
    </section>
  );
}