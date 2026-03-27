import { useState } from "react";
import { Mic, MicOff, CheckCircle, AlertCircle, SkipForward, Square } from "lucide-react";
import { startInterview, replyInterview } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onSwitchTab: (tab: number) => void;
  jobTitle?: string;
  resumeSummary?: string;
}

type Phase = "setup" | "live" | "done";

interface TurnResult {
  question: string;
  answer: string;
  feedback: string;
  score: number;
}

const ScoreBadge = ({ score }: { score: number }) => {
  const color =
    score >= 8 ? "text-green-400 border-green-400/40 bg-green-400/10"
    : score >= 6 ? "text-yellow-400 border-yellow-400/40 bg-yellow-400/10"
    : "text-baymax-red border-baymax-red/40 bg-baymax-red/10";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {score}/10
    </span>
  );
};

const InterviewCoach = ({
  onSwitchTab,
  jobTitle = "",
  resumeSummary = "",
}: Props) => {
  const { toast } = useToast();
  const [userJobTitle, setUserJobTitle] = useState(jobTitle);
  const [phase, setPhase] = useState<Phase>("setup");

  // Session state
  const [sessionId, setSessionId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionNum, setQuestionNum] = useState(1);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [turns, setTurns] = useState<TurnResult[]>([]);

  // Loading flags
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const TOTAL_QUESTIONS = 8;

  // ── Start interview ────────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!userJobTitle.trim()) {
      toast({ title: "Job title required", description: "Enter the role you're interviewing for.", variant: "destructive" });
      return;
    }
    setStarting(true);
    try {
      const result = await startInterview(userJobTitle, resumeSummary);
      setSessionId(result.session_id);
      setCurrentQuestion(result.question);
      setQuestionNum(1);
      setTurns([]);
      setCurrentAnswer("");
      setPhase("live");
    } catch (err) {
      toast({ title: "Couldn't start interview", description: String(err), variant: "destructive" });
    } finally {
      setStarting(false);
    }
  };

  // ── Submit answer ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!currentAnswer.trim()) {
      toast({ title: "Answer required", description: "Please type your answer before submitting.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const result = await replyInterview(sessionId, currentAnswer, questionNum);

      const turn: TurnResult = {
        question: currentQuestion,
        answer: currentAnswer,
        feedback: result.feedback,
        score: result.score,
      };
      setTurns((prev) => [...prev, turn]);
      setCurrentAnswer("");

      if (result.is_done) {
        setPhase("done");
      } else {
        setCurrentQuestion(result.next_question);
        setQuestionNum((n) => n + 1);
      }
    } catch (err) {
      toast({ title: "Submission failed", description: String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setPhase("setup");
    setSessionId("");
    setCurrentQuestion("");
    setCurrentAnswer("");
    setTurns([]);
    setQuestionNum(1);
  };

  const avgScore = turns.length > 0
    ? Math.round((turns.reduce((s, t) => s + t.score, 0) / turns.length) * 10) / 10
    : 0;

  // ── Setup phase ────────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-8" style={{ animation: "staggerFadeIn 0.4s ease-out" }}>
        <div className="text-center space-y-2">
          <h3 className="font-syne font-bold text-xl text-foreground">Live Mock Interview with Sam</h3>
          <p className="text-sm text-muted-foreground">
            Sam asks you one question at a time, evaluates your answers, and gives instant feedback. 8 questions total.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={userJobTitle}
            onChange={(e) => setUserJobTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="e.g. Backend Engineer at a fintech"
            className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-baymax-red focus:outline-none transition-colors"
          />

          <div className="grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
            {[
              { icon: "🎯", label: "Role-tailored questions" },
              { icon: "⚡", label: "Instant AI feedback" },
              { icon: "📊", label: "Score per answer" },
            ].map(({ icon, label }) => (
              <div key={label} className="glass-card rounded-lg p-3" style={{ transform: "none" }}>
                <div className="text-xl mb-1">{icon}</div>
                <div>{label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={handleStart}
            disabled={starting}
            className="w-full bg-baymax-red text-foreground font-syne font-bold py-3 rounded-lg btn-red-glow transition-all disabled:opacity-50"
          >
            {starting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                Sam is getting ready...
              </span>
            ) : (
              "Start Interview with Sam →"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Done phase ─────────────────────────────────────────────────────────────
  if (phase === "done") {
    const grade =
      avgScore >= 8 ? "Excellent 🏆"
      : avgScore >= 6 ? "Good 👍"
      : "Keep Practicing 💪";

    return (
      <div className="space-y-6" style={{ animation: "staggerFadeIn 0.4s ease-out" }}>
        <div className="text-center space-y-3">
          <div className="text-6xl">{avgScore >= 8 ? "🏆" : avgScore >= 6 ? "👍" : "💪"}</div>
          <h3 className="font-syne font-bold text-2xl text-foreground">Interview Complete!</h3>
          <p className="text-4xl font-syne font-extrabold text-baymax-red">{avgScore}/10</p>
          <p className="text-muted-foreground">{grade}</p>
        </div>

        {/* Score breakdown */}
        <div className="glass-card rounded-xl p-5 space-y-3" style={{ transform: "none" }}>
          <p className="text-sm text-muted-foreground font-semibold">Score Breakdown</p>
          {turns.map((t, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xs text-muted-foreground font-mono-label pt-0.5 shrink-0">Q{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">{t.question}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.feedback}</p>
              </div>
              <ScoreBadge score={t.score} />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleReset}
            className="border border-baymax-red text-baymax-red font-syne font-bold px-6 py-3 rounded-lg hover:bg-baymax-red/10 transition-all"
          >
            Try Again
          </button>
          <button
            onClick={() => onSwitchTab(2)}
            className="bg-baymax-red text-foreground font-syne font-bold px-8 py-3 rounded-lg btn-red-glow transition-all"
          >
            Find Jobs for This Role →
          </button>
        </div>
      </div>
    );
  }

  // ── Live interview phase ───────────────────────────────────────────────────
  return (
    <div className="space-y-5" style={{ animation: "staggerFadeIn 0.3s ease-out" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="text-sm text-muted-foreground">Interviewing for: </span>
          <span className="text-sm text-foreground font-semibold">{userJobTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Progress dots */}
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < turns.length
                    ? "bg-baymax-red"
                    : i === turns.length
                    ? "bg-baymax-red/40 scale-125"
                    : "bg-border"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-mono-label">
            {questionNum}/{TOTAL_QUESTIONS}
          </span>
          <button
            onClick={() => setPhase("done")}
            title="End interview early"
            className="p-1.5 rounded border border-baymax-red/30 text-muted-foreground hover:text-foreground hover:border-baymax-red transition-all"
          >
            <Square size={12} />
          </button>
        </div>
      </div>

      {/* Live running score */}
      {turns.length > 0 && (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">Running avg:</span>
          <ScoreBadge score={avgScore} />
          <div className="flex gap-1">
            {turns.map((t, i) => (
              <div
                key={i}
                className={`w-1.5 h-5 rounded-sm ${
                  t.score >= 8 ? "bg-green-400" : t.score >= 6 ? "bg-yellow-400" : "bg-baymax-red"
                }`}
                title={`Q${i + 1}: ${t.score}/10`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sam's question bubble */}
      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center shrink-0">
            <svg viewBox="0 0 200 220" width="16" height="18">
              <ellipse cx="100" cy="145" rx="65" ry="70" fill="#111" />
              <circle cx="100" cy="65" r="40" fill="#111" />
              <ellipse cx="88" cy="58" rx="4" ry="5" fill="white" />
              <ellipse cx="112" cy="58" rx="4" ry="5" fill="white" />
            </svg>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">SAM ASKS</span>
        </div>
        <p className="text-foreground text-base leading-relaxed">{currentQuestion}</p>
      </div>

      {/* Previous turn feedback (most recent) */}
      {turns.length > 0 && (() => {
        const last = turns[turns.length - 1];
        const color =
          last.score >= 8 ? "#10b981" : last.score >= 6 ? "#f59e0b" : "#ef4444";
        return (
          <div
            className="rounded-lg p-4 space-y-1 text-sm"
            style={{
              borderLeft: `3px solid ${color}`,
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={13} style={{ color }} />
              <span className="font-semibold" style={{ color }}>
                Q{turns.length} Feedback — {last.score}/10
              </span>
            </div>
            <p className="text-muted-foreground">{last.feedback}</p>
          </div>
        );
      })()}

      {/* Answer input */}
      <div className="space-y-2">
        <textarea
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-baymax-red focus:outline-none transition-colors resize-none h-28"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-mono-label">
            {currentAnswer.split(/\s+/).filter(Boolean).length} words
          </span>
          <button
            onClick={handleSubmit}
            disabled={submitting || !currentAnswer.trim()}
            className="bg-baymax-red text-foreground font-syne font-bold px-6 py-2.5 rounded-lg btn-red-glow transition-all text-sm disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                Sam is thinking...
              </span>
            ) : (
              `Submit Answer →`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCoach;
