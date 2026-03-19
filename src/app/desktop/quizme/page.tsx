"use client";

import React, { useEffect, useState } from "react";
import { getVaultItems } from "@/app/actions/vault";
import { upgradeQuizQuestions } from "@/app/actions/summarizer";
import { Loader2 } from "lucide-react";

interface QuizQuestion {
  question: string;
  type: string;
  probabilityScore: number;
  difficulty: string;
  hint: string;
  choices?: string[];
  correctAnswer?: number;
}

interface Quiz {
  id: string;
  subject: string;
  title: string;
  questions: QuizQuestion[];
}

const S = {
  page: { height: "100%", display: "flex", flexDirection: "column" as const, background: "#c0c0c0", fontFamily: "'MS Sans Serif', sans-serif", fontSize: "11px", color: "#000", overflow: "hidden" },
  btn: (pressed = false): React.CSSProperties => ({
    height: "23px", minWidth: "75px", padding: "0 10px", background: "#c0c0c0",
    border: "2px solid", borderColor: pressed ? "#808080 #fff #fff #808080" : "#fff #808080 #808080 #fff",
    boxShadow: pressed ? "inset 1px 1px 0 #0a0a0a" : "none", fontFamily: "inherit", fontSize: "11px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
  }),
  sunken: { border: "2px solid", borderColor: "#808080 #fff #fff #808080", boxShadow: "inset 1px 1px 0 #0a0a0a" } as React.CSSProperties,
};

const LABELS = ["A", "B", "C", "D"];

export default function QuizMePage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [qIdx, setQIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  // For old questions without choices — self-grading fallback
  const [userAnswer, setUserAnswer] = useState("");
  const [selfGraded, setSelfGraded] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const items = await getVaultItems();
        const built: Quiz[] = (items || [])
          .filter((i: any) => i.examQuestions && (i.examQuestions as any[]).length > 0)
          .map((i: any) => ({
            id: i.id,
            subject: i.subject || "Unknown",
            title: i.title || i.subject || "Study Quiz",
            questions: i.examQuestions as QuizQuestion[],
          }));
        setQuizzes(built);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const currentQ = activeQuiz?.questions[qIdx];
  const hasChoices = currentQ?.choices && currentQ.choices.length > 0 && currentQ.correctAnswer !== undefined;
  const isTF = currentQ?.type === "true-false";

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === currentQ?.correctAnswer) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (activeQuiz && qIdx + 1 >= activeQuiz.questions.length) {
      setFinished(true);
    } else {
      setQIdx(q => q + 1);
      setAnswered(false);
      setSelected(null);
      setShowHint(false);
      setUserAnswer("");
      setSelfGraded(null);
    }
  };

  const resetQuiz = () => {
    setActiveQuiz(null);
    setQIdx(0);
    setScore(0);
    setFinished(false);
    setAnswered(false);
    setSelected(null);
    setShowHint(false);
    setUserAnswer("");
    setSelfGraded(null);
  };

  const getDifficultyColor = (d: string) => {
    if (d === "easy") return "#166534";
    if (d === "medium") return "#854d0e";
    return "#991b1b";
  };

  const getChoiceStyle = (idx: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
      border: "2px solid #808080", cursor: answered ? "default" : "pointer",
      background: "#fff", transition: "background 0.15s",
    };
    if (!answered) {
      return { ...base, ...(selected === idx ? { borderColor: "#000080", background: "#e8e8ff" } : {}) };
    }
    // After answering
    if (idx === currentQ?.correctAnswer) {
      return { ...base, borderColor: "#166534", background: "#dcfce7" };
    }
    if (idx === selected && idx !== currentQ?.correctAnswer) {
      return { ...base, borderColor: "#991b1b", background: "#fee2e2" };
    }
    return { ...base, opacity: 0.5 };
  };

  if (loading || upgrading) {
    return (
      <div style={{ ...S.page, alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Loader2 size={20} className="animate-spin" style={{ color: "#000080" }} />
        <span style={{ fontWeight: "bold" }}>{upgrading ? "Generating Quiz Choices..." : "Loading Quizzes..."}</span>
        {upgrading && <span style={{ fontSize: 10, color: "#595959" }}>AI is creating ABCD + True/False options</span>}
      </div>
    );
  }

  // ─── Quiz Selection ──────────────────────────────────────────────────────────
  if (!activeQuiz) {
    return (
      <div style={S.page}>
        <div style={{ padding: "8px 10px", borderBottom: "1px solid #808080", fontWeight: "bold" }}>
          ❓ QuizMe — Select a Quiz
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 10 }}>
          {quizzes.length === 0 ? (
            <div style={{ ...S.sunken, background: "#fff", padding: 16, textAlign: "center" }}>
              <p style={{ fontWeight: "bold", marginBottom: 6 }}>No Quizzes Available</p>
              <p style={{ fontSize: 10, color: "#595959" }}>Upload a PDF in StudyAI first. Your exam questions will automatically appear here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {quizzes.map(q => (
                <button
                  key={q.id}
                  onClick={async () => {
                    const needsUpgrade = q.questions.some(qq => !qq.choices || qq.choices.length === 0);
                    if (needsUpgrade) {
                      setUpgrading(true);
                      try {
                        const result = await upgradeQuizQuestions(q.id);
                        if (result.questions) {
                          const upgraded = { ...q, questions: result.questions };
                          setQuizzes(prev => prev.map(pq => pq.id === q.id ? upgraded : pq));
                          setActiveQuiz(upgraded);
                        } else {
                          setActiveQuiz(q); // fallback to self-grading
                        }
                      } catch {
                        setActiveQuiz(q);
                      }
                      setUpgrading(false);
                    } else {
                      setActiveQuiz(q);
                    }
                    setQIdx(0); setScore(0); setFinished(false); setAnswered(false); setSelected(null);
                  }}
                  style={{
                    ...S.sunken, background: "#fff", padding: "8px 12px", cursor: "pointer", textAlign: "left",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: 11 }}>{q.title}</div>
                    <div style={{ fontSize: 10, color: "#595959" }}>{q.subject}</div>
                  </div>
                  <span style={{ fontSize: 10, color: "#000080", fontWeight: "bold" }}>{q.questions.length} questions</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: "4px 8px", borderTop: "1px solid #808080", fontSize: 10, color: "#595959" }}>
          {quizzes.length} quiz(zes) available
        </div>
      </div>
    );
  }

  // ─── Finished Screen ─────────────────────────────────────────────────────────
  if (finished) {
    const pct = Math.round((score / activeQuiz.questions.length) * 100);
    const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";
    return (
      <div style={S.page}>
        <div style={{ padding: "8px 10px", borderBottom: "1px solid #808080", fontWeight: "bold" }}>
          ❓ QuizMe — Final Results
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 20 }}>
          <div style={{ fontSize: 32 }}>
            {pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "📖"}
          </div>
          <div style={{ fontSize: 16, fontWeight: "bold" }}>
            {pct >= 80 ? "Excellent Work!" : pct >= 50 ? "Not Bad, Keep Going!" : "Time to Review!"}
          </div>

          <div style={{ ...S.sunken, background: "#fff", padding: 20, textAlign: "center", minWidth: 220 }}>
            <div style={{ fontSize: 28, fontWeight: "bold", color: "#000080" }}>{score}/{activeQuiz.questions.length}</div>
            <div style={{ fontSize: 10, color: "#595959", marginTop: 4 }}>
              {pct}% Accuracy
            </div>
            <div style={{
              marginTop: 8, padding: "4px 16px", display: "inline-block", fontWeight: "bold", fontSize: 14,
              background: pct >= 70 ? "#dcfce7" : pct >= 50 ? "#fef9c3" : "#fee2e2",
              color: pct >= 70 ? "#166534" : pct >= 50 ? "#854d0e" : "#991b1b",
              border: "1px solid",
            }}>
              Grade: {grade}
            </div>
          </div>

          <div style={{ fontSize: 10, color: "#595959", marginTop: 4 }}>
            {activeQuiz.subject}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => {
              setQIdx(0); setScore(0); setFinished(false); setAnswered(false); setSelected(null); setShowHint(false); setUserAnswer(""); setSelfGraded(null);
            }} style={S.btn()}>
              🔄 Retry Quiz
            </button>
            <button onClick={resetQuiz} style={S.btn()}>
              ← All Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Active Question ─────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <div style={{ padding: "8px 10px", borderBottom: "1px solid #808080", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: "bold" }}>❓ {activeQuiz.title}</span>
        <button onClick={resetQuiz} style={S.btn()}>← Back</button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 10, gap: 6, overflow: "auto" }}>
        {/* Question Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#595959", fontWeight: "bold" }}>
            Question {qIdx + 1} of {activeQuiz.questions.length}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <span style={{
              fontSize: 9, padding: "1px 6px", background: isTF ? "#fffff0" : "#f0f0ff",
              border: "1px solid #ccc", fontWeight: "bold", textTransform: "uppercase"
            }}>
              {isTF ? "TRUE / FALSE" : currentQ?.type}
            </span>
            <span style={{ fontSize: 9, padding: "1px 6px", border: "1px solid #ccc", fontWeight: "bold", color: getDifficultyColor(currentQ?.difficulty || "") }}>
              {currentQ?.difficulty}
            </span>
          </div>
        </div>

        {/* Question Box */}
        <div style={{ ...S.sunken, background: "#fff", padding: 10 }}>
          <p style={{ fontSize: 12, fontWeight: "bold", lineHeight: "1.6" }}>{currentQ?.question}</p>
        </div>

        {/* Choices (MCQ or True/False) */}
        {hasChoices ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {currentQ!.choices!.map((choice, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(idx)}
                style={getChoiceStyle(idx)}
              >
                <span style={{
                  width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
                  background: answered && idx === currentQ?.correctAnswer ? "#166534" : answered && idx === selected ? "#991b1b" : "#e8e8e8",
                  color: answered && (idx === currentQ?.correctAnswer || idx === selected) ? "#fff" : "#000",
                  fontWeight: "bold", fontSize: 10, flexShrink: 0,
                }}>
                  {isTF ? (idx === 0 ? "T" : "F") : LABELS[idx]}
                </span>
                <span style={{ fontSize: 11, lineHeight: "1.4" }}>{choice}</span>
                {answered && idx === currentQ?.correctAnswer && (
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "#166534", fontWeight: "bold" }}>✓ Correct</span>
                )}
                {answered && idx === selected && idx !== currentQ?.correctAnswer && (
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "#991b1b", fontWeight: "bold" }}>✗ Wrong</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Fallback: Self-grading for old questions without choices */
          <div style={{ ...S.sunken, background: "#fff", padding: 10 }}>
            <label style={{ fontSize: 10, fontWeight: "bold", display: "block", marginBottom: 4 }}>Your Answer:</label>
            <textarea
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              disabled={selfGraded !== null}
              rows={3}
              style={{
                width: "100%", resize: "none", fontFamily: "inherit", fontSize: 11, padding: 6,
                ...S.sunken, background: selfGraded !== null ? "#f5f5f5" : "#fff",
              }}
              placeholder="Type your answer..."
            />
            {selfGraded === null && (
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <button onClick={() => { setSelfGraded("correct"); setScore(s => s + 1); setAnswered(true); }} style={S.btn()}>✅ I Got It</button>
                <button onClick={() => { setSelfGraded("wrong"); setShowHint(true); setAnswered(true); }} style={S.btn()}>❌ I Didn't</button>
              </div>
            )}
            {selfGraded && (
              <div style={{ marginTop: 6, padding: "4px 8px", fontSize: 10, fontWeight: "bold", background: selfGraded === "correct" ? "#dcfce7" : "#fee2e2", color: selfGraded === "correct" ? "#166534" : "#991b1b" }}>
                {selfGraded === "correct" ? "✅ Marked Correct" : "❌ Marked Wrong — review the hint"}
              </div>
            )}
          </div>
        )}

        {/* Hint */}
        {showHint && (
          <div style={{ background: "#fffff0", border: "1px solid #e0d870", padding: "6px 10px", fontSize: 10 }}>
            💡 <strong>Hint:</strong> {currentQ?.hint}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {!showHint && !answered && (
              <button onClick={() => setShowHint(true)} style={S.btn()}>💡 Hint</button>
            )}
            {answered && (
              <button onClick={nextQuestion} style={S.btn()}>
                {qIdx + 1 >= activeQuiz.questions.length ? "📊 See Results" : "Next →"}
              </button>
            )}
          </div>
          <span style={{ fontSize: 10, color: "#595959" }}>
            Score: {score}/{qIdx + (answered ? 1 : 0)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: "#808080", margin: "0 2px" }}>
        <div style={{ height: "100%", width: `${((qIdx + (answered ? 1 : 0)) / activeQuiz.questions.length) * 100}%`, background: "#000080", transition: "width 0.3s" }} />
      </div>
      <div style={{ padding: "4px 8px", borderTop: "1px solid #808080", fontSize: 10, color: "#595959" }}>
        {activeQuiz.subject} — {activeQuiz.questions.length} questions
      </div>
    </div>
  );
}
