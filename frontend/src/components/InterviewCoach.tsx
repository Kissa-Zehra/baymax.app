import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Volume2, RotateCcw, Square, ChevronDown } from "lucide-react";
import { startInterview, replyInterview, transcribeAudio } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Props {
  onSwitchTab: (tab: number) => void;
  jobTitle?: string;
  resumeSummary?: string;
}

type Mode = "setup" | "speaking" | "listening" | "processing" | "done";

interface Turn {
  question: string;
  answer: string;
  feedback: string;
  score: number;
}

/* ─── Animated Orb ──────────────────────────────────────────────────────── */
const OrbStyles = `
  @keyframes orb-idle {
    0%, 100% {
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
      transform: scale(1);
      box-shadow: 0 0 40px 8px rgba(232,39,43,0.25), 0 0 80px 16px rgba(232,39,43,0.10);
    }
    50% {
      border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
      transform: scale(1.03);
      box-shadow: 0 0 50px 12px rgba(232,39,43,0.30), 0 0 100px 20px rgba(232,39,43,0.12);
    }
  }
  @keyframes orb-speaking {
    0%   { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: scale(1.00); }
    15%  { border-radius: 40% 60% 60% 40% / 40% 60% 40% 60%; transform: scale(1.08); }
    30%  { border-radius: 70% 30% 40% 60% / 50% 40% 60% 50%; transform: scale(1.04); }
    45%  { border-radius: 50% 50% 30% 70% / 60% 50% 50% 40%; transform: scale(1.10); }
    60%  { border-radius: 30% 70% 60% 40% / 40% 70% 30% 60%; transform: scale(1.06); }
    75%  { border-radius: 65% 35% 45% 55% / 55% 35% 65% 45%; transform: scale(1.09); }
    100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: scale(1.00); }
  }
  @keyframes orb-speaking-glow {
    0%, 100% {
      box-shadow: 0 0 60px 15px rgba(232,39,43,0.45), 0 0 120px 30px rgba(232,39,43,0.20), inset 0 0 40px rgba(255,80,80,0.15);
    }
    50% {
      box-shadow: 0 0 80px 25px rgba(232,39,43,0.60), 0 0 160px 50px rgba(232,39,43,0.25), inset 0 0 60px rgba(255,80,80,0.20);
    }
  }
  @keyframes orb-listening {
    0%, 100% {
      border-radius: 50%;
      transform: scale(1.00);
      box-shadow: 0 0 40px 10px rgba(16,185,129,0.35), 0 0 80px 20px rgba(16,185,129,0.15);
    }
    50% {
      border-radius: 50%;
      transform: scale(1.05);
      box-shadow: 0 0 60px 20px rgba(16,185,129,0.50), 0 0 120px 40px rgba(16,185,129,0.20);
    }
  }
  @keyframes orb-processing {
    0%, 100% {
      border-radius: 55% 45% 45% 55% / 55% 45% 55% 45%;
      transform: scale(1) rotate(0deg);
      box-shadow: 0 0 40px 10px rgba(251,191,36,0.35), 0 0 80px 20px rgba(251,191,36,0.15);
    }
    50% {
      border-radius: 45% 55% 55% 45% / 45% 55% 45% 55%;
      transform: scale(0.97) rotate(180deg);
      box-shadow: 0 0 60px 20px rgba(251,191,36,0.50), 0 0 120px 40px rgba(251,191,36,0.20);
    }
  }
  @keyframes ring-pulse {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.8); opacity: 0; }
  }
  @keyframes mic-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }
`;

const ORB_CONFIG = {
  idle:       { color: "from-[#E8272B]/70 via-red-900/50 to-black/70",        label: "Sam",         animStyle: "orb-idle 4s ease-in-out infinite" },
  speaking:   { color: "from-[#E8272B] via-orange-600/80 to-red-900/60",      label: "Sam speaking", animStyle: "orb-speaking 0.6s ease-in-out infinite, orb-speaking-glow 0.8s ease-in-out infinite" },
  listening:  { color: "from-emerald-400/80 via-green-600/60 to-teal-900/60", label: "Listening...", animStyle: "orb-listening 1s ease-in-out infinite" },
  processing: { color: "from-yellow-400/80 via-amber-600/60 to-orange-900/60",label: "Thinking...",  animStyle: "orb-processing 1.2s ease-in-out infinite" },
  done:       { color: "from-[#E8272B]/50 via-red-900/40 to-black/60",        label: "Done",         animStyle: "orb-idle 6s ease-in-out infinite" },
};

const AnimatedOrb = ({ mode }: { mode: Mode }) => {
  const cfg = mode === "done" ? ORB_CONFIG.idle : ORB_CONFIG[mode] ?? ORB_CONFIG.idle;
  const isListening = mode === "listening";
  const isSpeaking  = mode === "speaking";

  return (
    <div className="relative flex items-center justify-center w-56 h-56 mx-auto select-none">
      {/* Outer ambient ring — listening pulse */}
      {isListening && (
        <>
          <div className="absolute inset-0 rounded-full border border-emerald-400/40"
               style={{ animation: "ring-pulse 1.5s ease-out infinite" }} />
          <div className="absolute inset-0 rounded-full border border-emerald-400/25"
               style={{ animation: "ring-pulse 1.5s ease-out 0.5s infinite" }} />
        </>
      )}
      {/* Speaking rings */}
      {isSpeaking && (
        <>
          <div className="absolute inset-[-8px] rounded-full border border-baymax-red/35"
               style={{ animation: "ring-pulse 0.9s ease-out infinite" }} />
          <div className="absolute inset-[-8px] rounded-full border border-baymax-red/20"
               style={{ animation: "ring-pulse 0.9s ease-out 0.3s infinite" }} />
        </>
      )}
      {/* Main orb */}
      <div
        className={`w-44 h-44 bg-gradient-to-br ${cfg.color} cursor-default`}
        style={{ animation: cfg.animStyle, willChange: "border-radius, transform, box-shadow" }}
      >
        {/* Inner shine */}
        <div className="absolute inset-[20%_30%_50%_20%] rounded-full bg-white/10 blur-sm" />
      </div>
      {/* Baymax face */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
        <svg viewBox="0 0 200 100" width="64" height="32" className="drop-shadow-lg">
          <ellipse cx="60" cy="50" rx="18" ry={isSpeaking ? 22 : 16} fill="white"
                   style={{ transition: "ry 0.2s" }} />
          <ellipse cx="140" cy="50" rx="18" ry={isSpeaking ? 22 : 16} fill="white"
                   style={{ transition: "ry 0.2s" }} />
          <ellipse cx="60" cy="50" rx="9" ry={isSpeaking ? 13 : 9} fill="#1a1a1a"
                   style={{ transition: "ry 0.2s" }} />
          <ellipse cx="140" cy="50" rx="9" ry={isSpeaking ? 13 : 9} fill="#1a1a1a"
                   style={{ transition: "ry 0.2s" }} />
        </svg>
        {/* Mode label */}
        <span className="text-[10px] font-bold tracking-widest uppercase text-white/80 mt-1">
          {cfg.label}
        </span>
      </div>
    </div>
  );
};

/* ─── Waveform bar (for listening state) ───────────────────────────────── */
const WaveBar = ({ delay }: { delay: number }) => (
  <div
    className="w-1 bg-emerald-400 rounded-full"
    style={{
      height: "100%",
      animation: `mic-pulse ${0.5 + delay * 0.15}s ease-in-out infinite`,
      animationDelay: `${delay * 0.1}s`,
    }}
  />
);

/* ─── Main Component ────────────────────────────────────────────────────── */
const InterviewCoach = ({
  onSwitchTab,
  jobTitle = "",
  resumeSummary = "",
}: Props) => {
  const { toast } = useToast();

  /* State */
  const [userJobTitle, setUserJobTitle] = useState(jobTitle);
  const [mode, setMode] = useState<Mode>("setup");
  const [sessionId, setSessionId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionNum, setQuestionNum] = useState(1);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [textFallback, setTextFallback] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [useTextMode, setUseTextMode] = useState(false);

  /* Recorder refs */
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef   = useRef<Blob[]>([]);
  const streamRef        = useRef<MediaStream | null>(null);
  const transcriptRef    = useRef<HTMLDivElement>(null);

  const TOTAL = 8;

  /* Auto-scroll transcript */
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [turns, liveTranscript]);

  /* ── TTS: Sam speaks the question aloud ─────────────────────────────── */
  const speak = useCallback((text: string, onDone: () => void) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    // Pick a natural-sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.toLowerCase().includes("daniel") ||
      v.name.toLowerCase().includes("alex") ||
      v.name.toLowerCase().includes("google uk") ||
      v.lang === "en-GB"
    );
    if (preferred) utter.voice = preferred;
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    utter.onend = onDone;
    utter.onerror = onDone;
    window.speechSynthesis.speak(utter);
  }, []);

  /* ── Start recording from microphone ────────────────────────────────── */
  const startRecording = useCallback(async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start(200);
      setMode("listening");
    } catch {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access, or switch to text mode.",
        variant: "destructive",
      });
      setUseTextMode(true);
    }
  }, [toast]);

  /* ── Stop recording + transcribe + evaluate ─────────────────────────── */
  const stopAndEvaluate = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    setMode("processing");

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    streamRef.current?.getTracks().forEach((t) => t.stop());

    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

    let answerText = "";
    try {
      const { text } = await transcribeAudio(blob);
      answerText = text;
      setLiveTranscript(text);
    } catch {
      toast({ title: "Transcription failed", description: "Could not understand audio. Please try again.", variant: "destructive" });
      setMode("listening");
      await startRecording();
      return;
    }

    if (!answerText.trim()) {
      toast({ title: "No speech detected", description: "Speak closer to the mic or use text mode.", variant: "destructive" });
      setMode("listening");
      await startRecording();
      return;
    }

    await submitAnswer(answerText);
  }, [startRecording, toast]); // eslint-disable-line

  /* ── Submit answer + get next question from Sam ─────────────────────── */
  const submitAnswer = useCallback(async (answerText: string) => {
    setMode("processing");
    try {
      const result = await replyInterview(sessionId, answerText, questionNum);

      const turn: Turn = {
        question: currentQuestion,
        answer:   answerText,
        feedback: result.feedback,
        score:    result.score,
      };
      setTurns((prev) => [...prev, turn]);
      setLiveTranscript("");
      setTextFallback("");

      if (result.is_done || questionNum >= TOTAL) {
        window.speechSynthesis.cancel();
        setMode("done");
        return;
      }

      const nextQ = result.next_question;
      setCurrentQuestion(nextQ);
      setQuestionNum((n) => n + 1);

      // Sam speaks the next question, then auto-starts recording
      setMode("speaking");
      speak(nextQ, async () => {
        if (!useTextMode) await startRecording();
        else setMode("listening");
      });
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
      setMode("listening");
    }
  }, [sessionId, questionNum, currentQuestion, speak, startRecording, useTextMode, toast]);

  /* ── Start interview ─────────────────────────────────────────────────── */
  const handleStart = async () => {
    if (!userJobTitle.trim()) {
      toast({ title: "Job title required", variant: "destructive" });
      return;
    }
    setMode("processing");
    try {
      const result = await startInterview(userJobTitle, resumeSummary);
      setSessionId(result.session_id);
      setQuestionNum(1);
      setTurns([]);
      const q = result.question;
      setCurrentQuestion(q);

      setMode("speaking");
      speak(q, async () => {
        if (!useTextMode) await startRecording();
        else setMode("listening");
      });
    } catch (e) {
      toast({ title: "Could not start interview", description: String(e), variant: "destructive" });
      setMode("setup");
    }
  };

  /* ── Reset ──────────────────────────────────────────────────────────── */
  const handleReset = () => {
    window.speechSynthesis.cancel();
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setMode("setup");
    setSessionId("");
    setCurrentQuestion("");
    setQuestionNum(1);
    setTurns([]);
    setLiveTranscript("");
    setTextFallback("");
  };

  /* ── Text-mode submit ───────────────────────────────────────────────── */
  const handleTextSubmit = async () => {
    if (!textFallback.trim()) return;
    setMode("processing");
    await submitAnswer(textFallback);
  };

  const avgScore = turns.length
    ? Math.round((turns.reduce((s, t) => s + t.score, 0) / turns.length) * 10) / 10
    : 0;

  /* ─── SETUP SCREEN ─────────────────────────────────────────────────── */
  if (mode === "setup") {
    return (
      <div className="flex flex-col items-center gap-8 py-8" style={{ animation: "staggerFadeIn 0.4s ease-out" }}>
        <style>{OrbStyles}</style>
        <AnimatedOrb mode="setup" />
        <div className="text-center space-y-2 max-w-sm">
          <h3 className="font-syne font-bold text-xl text-foreground">1-on-1 Interview with Sam</h3>
          <p className="text-sm text-muted-foreground">
            Sam will ask questions out loud. You speak your answers — Groq Whisper transcribes them in real time.
          </p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <input
            type="text"
            value={userJobTitle}
            onChange={(e) => setUserJobTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="e.g. Backend Engineer at a fintech"
            className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-baymax-red focus:outline-none transition-colors"
          />

          {/* Mode toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none text-sm text-muted-foreground">
            <div
              onClick={() => setUseTextMode((v) => !v)}
              className={`w-10 h-5 rounded-full transition-colors relative ${useTextMode ? "bg-baymax-red" : "bg-border"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${useTextMode ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            {useTextMode ? "Text mode (type answers)" : "Voice mode (speak answers)"}
          </label>

          <button
            onClick={handleStart}
            className="w-full bg-baymax-red text-foreground font-syne font-bold py-3 rounded-lg btn-red-glow transition-all"
          >
            {useTextMode ? "Start Interview →" : "🎙️ Start Voice Interview →"}
          </button>
        </div>
      </div>
    );
  }

  /* ─── DONE SCREEN ──────────────────────────────────────────────────── */
  if (mode === "done") {
    const grade = avgScore >= 8 ? "Excellent 🏆" : avgScore >= 6 ? "Good 👍" : "Keep Practicing 💪";
    return (
      <div className="flex flex-col items-center gap-6 py-4" style={{ animation: "staggerFadeIn 0.4s ease-out" }}>
        <style>{OrbStyles}</style>
        <AnimatedOrb mode="done" />
        <div className="text-center space-y-1">
          <p className="font-syne font-extrabold text-4xl text-baymax-red">{avgScore}/10</p>
          <p className="text-foreground font-semibold">{grade}</p>
        </div>

        {/* Score breakdown */}
        <div className="w-full max-w-lg glass-card rounded-xl p-4 space-y-3 max-h-60 overflow-y-auto" style={{ transform: "none" }}>
          {turns.map((t, i) => {
            const c = t.score >= 8 ? "#10b981" : t.score >= 6 ? "#f59e0b" : "#ef4444";
            return (
              <div key={i} className="border-l-2 pl-3 space-y-0.5" style={{ borderColor: c }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Q{i + 1}</span>
                  <span className="text-xs font-bold" style={{ color: c }}>{t.score}/10</span>
                </div>
                <p className="text-xs text-foreground line-clamp-1">{t.question}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{t.feedback}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={handleReset}
            className="border border-baymax-red text-baymax-red font-syne font-bold px-6 py-3 rounded-lg hover:bg-baymax-red/10 transition-all">
            Try Again
          </button>
          <button onClick={() => onSwitchTab(2)}
            className="bg-baymax-red text-foreground font-syne font-bold px-6 py-3 rounded-lg btn-red-glow transition-all">
            Find Jobs →
          </button>
        </div>
      </div>
    );
  }

  /* ─── LIVE INTERVIEW SCREEN ─────────────────────────────────────────── */
  return (
    <div className="flex flex-col items-center gap-5" style={{ animation: "staggerFadeIn 0.3s ease-out" }}>
      <style>{OrbStyles}</style>

      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div className="flex gap-1 items-center">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${
              i < turns.length ? "bg-baymax-red w-5" : i === turns.length ? "bg-baymax-red/50 w-3" : "bg-border w-3"
            }`} />
          ))}
          <span className="text-xs text-muted-foreground ml-2 font-mono-label">
            {questionNum}/{TOTAL}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {avgScore > 0 && (
            <span className="text-xs text-muted-foreground">avg <span className="text-foreground font-bold">{avgScore}/10</span></span>
          )}
          <button onClick={handleReset}
            className="p-1.5 rounded border border-border text-muted-foreground hover:text-baymax-red hover:border-baymax-red transition-all"
            title="End interview">
            <Square size={12} />
          </button>
        </div>
      </div>

      {/* Orb */}
      <AnimatedOrb mode={mode} />

      {/* Current question */}
      <div className="w-full rounded-xl bg-card border border-border/60 p-4 text-center">
        <p className="text-foreground leading-relaxed text-sm">{currentQuestion}</p>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3 h-8">
        {mode === "listening" && (
          <>
            <div className="flex items-end gap-0.5 h-6">
              {[0,1,2,3,4,5,6].map((i) => <WaveBar key={i} delay={i} />)}
            </div>
            <span className="text-sm text-emerald-400 font-semibold">Listening...</span>
          </>
        )}
        {mode === "speaking" && (
          <>
            <Volume2 size={16} className="text-baymax-red animate-pulse" />
            <span className="text-sm text-baymax-red-light font-semibold">Sam is speaking...</span>
          </>
        )}
        {mode === "processing" && (
          <>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-yellow-400/40 border-t-yellow-400 animate-spin" />
            <span className="text-sm text-yellow-400 font-semibold">Processing...</span>
          </>
        )}
      </div>

      {/* Live transcript bubble */}
      {liveTranscript && mode !== "processing" && (
        <div className="w-full rounded-lg bg-secondary border border-border px-4 py-2 text-sm text-muted-foreground italic">
          " {liveTranscript} "
        </div>
      )}

      {/* Controls */}
      <div className="w-full space-y-3">
        {/* Voice mode */}
        {!useTextMode && mode === "listening" && (
          <button
            onClick={stopAndEvaluate}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white font-syne font-bold py-3 rounded-lg transition-all hover:bg-emerald-400"
          >
            <MicOff size={16} />
            Done Speaking — Submit Answer
          </button>
        )}

        {/* Text fallback always visible */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">
              {useTextMode ? "Type your answer:" : "Or type instead:"}
            </label>
            {!useTextMode && (
              <button onClick={() => setUseTextMode(true)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Switch to text mode
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <textarea
              value={textFallback}
              onChange={(e) => setTextFallback(e.target.value)}
              placeholder="Type your answer here..."
              className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-baymax-red focus:outline-none transition-colors resize-none h-16"
              disabled={mode === "processing" || mode === "speaking"}
            />
            <button
              onClick={handleTextSubmit}
              disabled={!textFallback.trim() || mode === "processing" || mode === "speaking"}
              className="bg-baymax-red text-foreground font-syne font-bold px-4 rounded-lg btn-red-glow transition-all disabled:opacity-40 text-sm"
            >
              Send →
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible transcript */}
      <div className="w-full">
        <button
          onClick={() => setShowTranscript((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown size={12} className={`transition-transform ${showTranscript ? "rotate-180" : ""}`} />
          {showTranscript ? "Hide" : "Show"} transcript ({turns.length} exchanges)
        </button>
        {showTranscript && (
          <div ref={transcriptRef} className="mt-2 max-h-48 overflow-y-auto space-y-3 pr-1">
            {turns.map((t, i) => {
              const c = t.score >= 8 ? "#10b981" : t.score >= 6 ? "#f59e0b" : "#ef4444";
              return (
                <div key={i} className="space-y-1.5 border-l-2 pl-3" style={{ borderColor: c }}>
                  <p className="text-xs text-muted-foreground"><span className="text-foreground font-semibold">Sam:</span> {t.question}</p>
                  <p className="text-xs text-muted-foreground"><span className="text-foreground font-semibold">You:</span> {t.answer}</p>
                  <p className="text-xs" style={{ color: c }}>
                    {t.score}/10 — {t.feedback}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewCoach;
