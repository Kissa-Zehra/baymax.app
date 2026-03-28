import { useState, useEffect, useRef } from "react";
import { AlertCircle, ExternalLink, Loader2, Send, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { generateRoadmapFull, getCertifications, chatWithRahul } from "@/lib/api";
import type { Certification, RahulChatResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Props {
  jobTitle?: string;
  skillsGap?: string[];
  currentSkills?: string[];
  interviewWeakAreas?: string;
  userId?: string;
  onRoadmapGenerated?: () => void;
}

type TaskType = "skills" | "projects" | "certifications" | "applications";
interface Task { text: string; type: TaskType; checked: boolean; }

type PanelTab = "roadmap" | "resources" | "chat" | "aid";

// ── Static Data ────────────────────────────────────────────────────────────────
const typeColors: Record<TaskType, { bg: string; border: string; text: string }> = {
  skills:       { bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.25)",  text: "#93c5fd" },
  projects:     { bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.25)",   text: "#86efac" },
  certifications:{ bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)", text: "#fcd34d" },
  applications: { bg: "rgba(229,62,62,0.08)",   border: "rgba(229,62,62,0.3)",   text: "#fca5a5" },
};

const defaultRoadmap = [
  {
    month: "Month 1", subtitle: "Build Foundation",
    tasks: [
      { text: "Complete DSA basics (Arrays, Linked Lists, Trees)", type: "skills" as TaskType, checked: false },
      { text: "Build portfolio project with React + FastAPI", type: "projects" as TaskType, checked: false },
      { text: "Set up LinkedIn & GitHub README", type: "applications" as TaskType, checked: false },
    ],
  },
  {
    month: "Month 2", subtitle: "Skill Up",
    tasks: [
      { text: "Docker + System Design course", type: "certifications" as TaskType, checked: false },
      { text: "Contribute to open source (2 PRs)", type: "projects" as TaskType, checked: false },
      { text: "Mock interviews × 5 sessions", type: "skills" as TaskType, checked: false },
    ],
  },
  {
    month: "Month 3", subtitle: "Apply & Land",
    tasks: [
      { text: "Apply to 20 companies on LinkedIn & Rozee.pk", type: "applications" as TaskType, checked: false },
      { text: "Follow-up and networking outreach", type: "applications" as TaskType, checked: false },
      { text: "Negotiate and accept offer 🎉", type: "applications" as TaskType, checked: false },
    ],
  },
];

// ── Markdown renderer (basic — handles headers, bullets, checkboxes) ────────────
function MarkdownBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-sm text-foreground leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) return (
          <h2 key={i} className="text-base font-bold text-foreground mt-4 mb-1 flex items-center gap-2">
            {line.replace("## ", "")}
          </h2>
        );
        if (line.startsWith("### ")) return (
          <h3 key={i} className="text-sm font-bold text-foreground/90 mt-3 mb-1">{line.replace("### ", "")}</h3>
        );
        if (line.startsWith("**") && line.endsWith("**")) return (
          <p key={i} className="font-semibold text-foreground/80 text-xs mt-2">{line.replace(/\*\*/g, "")}</p>
        );
        if (line.match(/^- \[ \]/)) return (
          <div key={i} className="flex items-start gap-2 ml-2">
            <div className="mt-0.5 w-3.5 h-3.5 rounded border border-border shrink-0" />
            <span className="text-foreground/80 text-xs">{line.replace(/^- \[ \] ?/, "")}</span>
          </div>
        );
        if (line.match(/^- \[x\]/i)) return (
          <div key={i} className="flex items-start gap-2 ml-2">
            <div className="mt-0.5 w-3.5 h-3.5 rounded border border-green-500 bg-green-500/20 shrink-0 flex items-center justify-center">
              <span className="text-green-400 text-[8px]">✓</span>
            </div>
            <span className="text-foreground/60 text-xs line-through">{line.replace(/^- \[x\] ?/i, "")}</span>
          </div>
        );
        if (line.startsWith("- ") || line.startsWith("* ")) return (
          <div key={i} className="flex items-start gap-2 ml-2">
            <span className="text-baymax-red mt-1 text-[8px] shrink-0">●</span>
            <span className="text-foreground/80 text-xs">{line.replace(/^[*-] /, "")}</span>
          </div>
        );
        if (line.startsWith("---")) return <hr key={i} className="border-border my-3" />;
        if (line.startsWith("> ")) return (
          <blockquote key={i} className="ml-2 pl-3 border-l-2 border-amber-500/40 text-amber-400/80 text-xs italic">
            {line.replace(/^> /, "")}
          </blockquote>
        );
        if (!line.trim()) return <div key={i} className="h-1" />;
        return <p key={i} className="text-foreground/80 text-xs">{line}</p>;
      })}
    </div>
  );
}

// ── Resource Card ──────────────────────────────────────────────────────────────
function ResourceCard({ r }: { r: { title: string; url: string; platform: string; duration: string; free: boolean; financial_aid?: boolean } }) {
  const platformColors: Record<string, string> = {
    YouTube: "#ef4444", Coursera: "#0056d2", Kaggle: "#20beff", "fast.ai": "#ff5733",
    Google: "#4285f4", freeCodeCamp: "#0a0a23", LeetCode: "#ffa116", NeetCode: "#3b82f6",
    GitHub: "#6e7681", Pramp: "#7c3aed",
  };
  const color = platformColors[r.platform] || "#6b7280";

  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 rounded-xl p-3 transition-all hover:scale-[1.01] group"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Platform badge */}
      <div
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
        style={{ background: color + "30", border: `1px solid ${color}40`, color }}
      >
        {r.platform.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground text-xs font-semibold leading-tight line-clamp-2 group-hover:text-baymax-red transition-colors">
          {r.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[10px] text-muted-foreground">{r.duration}</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: "#0d2818", color: "#4ade80", border: "1px solid #166534" }}
          >
            🆓 Free
          </span>
          {r.financial_aid && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: "#1e1b4b", color: "#a5b4fc", border: "1px solid #3730a3" }}
            >
              💳 Aid
            </span>
          )}
        </div>
      </div>
      <ExternalLink size={12} className="text-muted-foreground shrink-0 mt-0.5 group-hover:text-baymax-red" />
    </a>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const RoadmapPlanner = ({
  jobTitle: initialJobTitle = "",
  skillsGap = [],
  currentSkills = [],
  interviewWeakAreas = "",
  userId = "default",
  onRoadmapGenerated,
}: Props) => {
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState(initialJobTitle || "Software Engineer");
  const [aiRoadmap, setAiRoadmap] = useState<string | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PanelTab>("roadmap");
  const [checkboxRoadmap, setCheckboxRoadmap] = useState(() => {
    try {
      const saved = localStorage.getItem(`baymax-roadmap-${userId}`);
      return saved ? JSON.parse(saved) : defaultRoadmap;
    } catch { return defaultRoadmap; }
  });

  // ── Rahul Chat State ─────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string; resources?: RahulChatResponse["resources"] }>>([
    { role: "assistant", content: "Hey! I'm Rahul, your career mentor. I can answer questions about your roadmap, suggest resources, or help you apply for Coursera financial aid. What would you like to know? 💬" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Financial Aid State ──────────────────────────────────────────────────────
  const [aidData, setAidData] = useState<{ template: string; course: string } | null>(null);
  const [aidCopied, setAidCopied] = useState(false);
  const [showAidForm, setShowAidForm] = useState(false);
  const [aidCourse, setAidCourse] = useState("");

  // Sync job title from session
  useEffect(() => {
    if (initialJobTitle) setJobTitle(initialJobTitle);
  }, [initialJobTitle]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ── Generate Roadmap ─────────────────────────────────────────────────────────
  const generateAiRoadmap = async () => {
    if (!jobTitle.trim()) {
      toast({ title: "Job title required", description: "Enter your target role.", variant: "destructive" });
      return;
    }
    setRoadmapLoading(true);
    setRoadmapError(null);
    try {
      const result = await generateRoadmapFull(
        jobTitle,
        skillsGap.join(", "),
        currentSkills.join(", "),
        interviewWeakAreas,
      );
      setAiRoadmap(result.roadmap);
      onRoadmapGenerated?.();
      setActiveTab("roadmap");

      // Fetch certifications in parallel
      setCertsLoading(true);
      try {
        const certResult = await getCertifications(jobTitle, skillsGap, currentSkills);
        setCertifications(certResult.certifications);
      } catch { /* non-fatal */ }
      finally { setCertsLoading(false); }

    } catch (err) {
      setRoadmapError((err as Error).message);
      toast({ title: "Roadmap generation failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setRoadmapLoading(false);
    }
  };

  // ── Checklist ────────────────────────────────────────────────────────────────
  const toggleTask = (mi: number, ti: number) => {
    const updated = checkboxRoadmap.map((m: typeof defaultRoadmap[0], i: number) =>
      i === mi ? { ...m, tasks: m.tasks.map((t: Task, j: number) => j === ti ? { ...t, checked: !t.checked } : t) } : m
    );
    setCheckboxRoadmap(updated);
    try { localStorage.setItem(`baymax-roadmap-${userId}`, JSON.stringify(updated)); } catch { /* ignore */ }
  };

  const totalTasks = checkboxRoadmap.reduce((a: number, m: typeof defaultRoadmap[0]) => a + m.tasks.length, 0);
  const doneTasks = checkboxRoadmap.reduce((a: number, m: typeof defaultRoadmap[0]) => a + m.tasks.filter((t: Task) => t.checked).length, 0);
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // ── Chat ─────────────────────────────────────────────────────────────────────
  const sendChatMessage = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput("");
    const userTurn = { role: "user" as const, content: msg };
    setChatMessages(prev => [...prev, userTurn]);
    setChatLoading(true);

    try {
      const history = chatMessages.map(m => ({ role: m.role, content: m.content }));
      const res = await chatWithRahul(msg, history, jobTitle, skillsGap.join(", "));

      // Handle financial aid request
      if (res.show_aid && res.aid_template) {
        setAidData({ template: res.aid_template, course: res.aid_course });
        setActiveTab("aid");
      }

      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: res.reply,
        resources: res.resources.length > 0 ? res.resources : undefined,
      }]);
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: `⚠️ Rahul is temporarily unavailable: ${(err as Error).message}`,
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── Financial Aid ────────────────────────────────────────────────────────────
  const fetchAidTemplate = async () => {
    if (!aidCourse.trim()) return;
    try {
      const res = await chatWithRahul(
        `Give me a financial aid template for "${aidCourse}"`,
        [], jobTitle, skillsGap.join(", ")
      );
      if (res.aid_template) {
        setAidData({ template: res.aid_template, course: aidCourse });
      }
    } catch { /* non-fatal */ }
  };

  const copyAid = () => {
    if (!aidData) return;
    navigator.clipboard.writeText(aidData.template).catch(() => {});
    setAidCopied(true);
    setTimeout(() => setAidCopied(false), 2000);
  };

  // ── Tab definitions ──────────────────────────────────────────────────────────
  const tabs: Array<{ id: PanelTab; label: string; emoji: string; count?: number }> = [
    { id: "roadmap",    label: "Roadmap",    emoji: "🗺️" },
    { id: "resources",  label: "Resources",  emoji: "📚", count: certifications.length || undefined },
    { id: "chat",       label: "Rahul Chat", emoji: "💬" },
    { id: "aid",        label: "Financial Aid", emoji: "💳" },
  ];

  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-5">

      {/* Context banner */}
      {(skillsGap.length > 0 || interviewWeakAreas) && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)" }}
        >
          <span className="text-purple-400 text-base shrink-0">🎯</span>
          <div className="flex-1 min-w-0">
            <p className="text-purple-300 font-semibold text-xs mb-1">
              Personalised roadmap — built from your resume &amp; interview data
            </p>
            {skillsGap.length > 0 && (
              <p className="text-purple-400/80 text-xs">
                <span className="font-semibold">Skill gaps: </span>
                {skillsGap.slice(0, 6).join(" · ")}
                {skillsGap.length > 6 && ` +${skillsGap.length - 6} more`}
              </p>
            )}
            {interviewWeakAreas && (
              <p className="text-purple-400/80 text-xs mt-0.5">
                <span className="font-semibold">Interview weak areas: </span>
                {interviewWeakAreas}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Generate controls */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. ML Engineer"
          className="bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-baymax-red focus:outline-none transition-colors flex-1 min-w-[200px]"
          onKeyDown={(e) => { if (e.key === "Enter") generateAiRoadmap(); }}
        />
        <button
          onClick={generateAiRoadmap}
          disabled={roadmapLoading}
          className="bg-baymax-red text-foreground font-syne font-bold px-5 py-2.5 rounded-lg btn-red-glow transition-all disabled:opacity-50 text-sm flex items-center gap-2"
        >
          {roadmapLoading ? (
            <><Loader2 size={14} className="animate-spin" /> Generating...</>
          ) : "🗺️ Generate AI Roadmap"}
        </button>
      </div>

      {roadmapError && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="text-red-400 mt-0.5 shrink-0" size={16} />
          <p className="text-sm text-red-300">{roadmapError}</p>
        </div>
      )}

      {/* ── Tabbed Panels (shown if roadmap exists OR certifications loaded) ── */}
      {(aiRoadmap || certifications.length > 0) && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Tab bar */}
          <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0a0a0a" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "text-foreground border-b-2 border-baymax-red"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count && tab.count > 0 && (
                  <span className="bg-baymax-red text-foreground text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5" style={{ background: "#0c0c0c" }}>

            {/* ROADMAP TAB */}
            {activeTab === "roadmap" && aiRoadmap && (
              <div>
                <h4 className="font-syne font-bold text-base text-foreground mb-4">
                  📋 Rahul's Personalised Career Roadmap — {jobTitle}
                </h4>
                <MarkdownBlock text={aiRoadmap} />
              </div>
            )}

            {/* RESOURCES TAB */}
            {activeTab === "resources" && (
              <div className="space-y-5">
                {certsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 size={14} className="animate-spin" />
                    Finding the best free learning resources for your skill gaps...
                  </div>
                ) : certifications.length > 0 ? (
                  <>
                    <h3 className="font-syne font-bold text-sm text-foreground">
                      🎓 Verified Free Learning Resources
                    </h3>
                    <p className="text-xs text-muted-foreground -mt-3">
                      All links are manually curated — no hallucinated URLs.
                    </p>
                    <div className="grid gap-2">
                      {certifications.map((cert, i) => (
                        <ResourceCard
                          key={i}
                          r={{
                            title: cert.name,
                            url: cert.url,
                            platform: cert.issuer,
                            duration: cert.duration,
                            free: cert.cost.toLowerCase().includes("free"),
                            financial_aid: cert.cost.toLowerCase().includes("aid"),
                          }}
                        />
                      ))}
                    </div>
                    <div
                      className="rounded-lg p-3 text-xs text-amber-400/80"
                      style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}
                    >
                      💳 Some Coursera courses have <strong>Financial Aid</strong> available (100% free + certificate).
                      Ask Rahul in the Chat tab for a personalised application template!
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    <p>Generate your roadmap first to see personalised learning resources.</p>
                  </div>
                )}
              </div>
            )}

            {/* CHAT TAB */}
            {activeTab === "chat" && (
              <div className="flex flex-col gap-3">
                <h3 className="font-syne font-bold text-sm text-foreground">
                  💬 Chat with Rahul — Your Career Mentor
                </h3>
                <p className="text-xs text-muted-foreground -mt-2">
                  Ask about your roadmap, skill gaps, interview prep, or Coursera financial aid.
                </p>

                {/* Chat messages */}
                <div
                  className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                          msg.role === "user"
                            ? "text-white rounded-br-sm"
                            : "text-foreground rounded-bl-sm"
                        }`}
                        style={{
                          background: msg.role === "user"
                            ? "linear-gradient(135deg, #e53e3e, #c53030)"
                            : "rgba(255,255,255,0.05)",
                          border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <p className="leading-relaxed text-xs whitespace-pre-wrap">{msg.content}</p>
                        {msg.resources && msg.resources.length > 0 && (
                          <div className="mt-3 space-y-1.5 pt-3 border-t border-white/10">
                            <p className="text-[10px] text-muted-foreground font-semibold">✅ Verified Resources:</p>
                            {msg.resources.map((r, j) => (
                              <ResourceCard key={j} r={r} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div
                        className="rounded-2xl rounded-bl-sm px-4 py-3 text-sm"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          <Loader2 size={12} className="animate-spin" />
                          Rahul is thinking...
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                    placeholder="Ask Rahul anything about your career plan..."
                    className="flex-1 bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-baymax-red focus:outline-none transition-colors"
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-2.5 rounded-xl bg-baymax-red text-white disabled:opacity-40 transition-all"
                  >
                    <Send size={14} />
                  </button>
                </div>

                <p className="text-[10px] text-muted-foreground text-center">
                  ⚠️ AI guidance — always verify with a human career advisor.
                </p>
              </div>
            )}

            {/* FINANCIAL AID TAB */}
            {activeTab === "aid" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-syne font-bold text-sm text-foreground mb-1">
                    💳 Coursera Financial Aid Template Generator
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Pakistan applicants have high approval rates. Get full course access + certificate for free.
                    Approval typically takes 15 days.
                  </p>
                </div>

                {/* Quick guide */}
                <div
                  className="rounded-lg p-4 text-xs space-y-2"
                  style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}
                >
                  <p className="text-blue-300 font-semibold">📋 How to Apply</p>
                  <ol className="space-y-1 text-blue-400/80 list-decimal list-inside">
                    <li>Open the Coursera course page</li>
                    <li>Click <strong>"Enroll for Free"</strong></li>
                    <li>Look for <strong>"Financial Aid Available"</strong> link below</li>
                    <li>Fill the form with the template below</li>
                    <li>Wait ~15 days for approval email</li>
                  </ol>
                </div>

                {/* Course input */}
                <div
                  className={`transition-all overflow-hidden ${showAidForm ? "max-h-96" : "max-h-0"}`}
                >
                  <div className="space-y-2 pt-2">
                    <input
                      type="text"
                      value={aidCourse}
                      onChange={(e) => setAidCourse(e.target.value)}
                      placeholder='e.g. "Machine Learning Specialization" by Andrew Ng'
                      className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-baymax-red focus:outline-none"
                    />
                    <button
                      onClick={fetchAidTemplate}
                      disabled={!aidCourse.trim()}
                      className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-baymax-red disabled:opacity-40 transition-all"
                    >
                      Generate Template
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowAidForm(!showAidForm)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showAidForm ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {showAidForm ? "Hide form" : "Generate template for a specific course"}
                </button>

                {/* Template output */}
                {aidData && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">
                        📄 Financial Aid Letter{aidData.course ? ` — ${aidData.course}` : ""}
                      </p>
                      <button
                        onClick={copyAid}
                        className="flex items-center gap-1 text-xs text-baymax-red hover:underline"
                      >
                        {aidCopied ? <Check size={12} /> : <Copy size={12} />}
                        {aidCopied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <pre
                      className="rounded-xl p-4 text-xs text-foreground/80 leading-relaxed overflow-x-auto whitespace-pre-wrap"
                      style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace" }}
                    >
                      {aidData.template}
                    </pre>
                  </div>
                )}

                {!aidData && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <p>Ask Rahul in the Chat tab to generate a template, or use the form above.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Interactive Checklist ── */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-syne font-bold text-xl text-foreground">Your 90-Day Checklist</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Target: <span className="text-baymax-red">{jobTitle}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-muted-foreground">{doneTasks}/{totalTasks}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: pct >= 80 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#e53e3e",
                  }}
                />
              </div>
              <span className="text-xs font-bold" style={{ color: pct >= 80 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#e53e3e" }}>
                {pct}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {checkboxRoadmap.map((month: typeof defaultRoadmap[0], mi: number) => {
            const monthDone = month.tasks.filter((t: Task) => t.checked).length;
            const monthTotal = month.tasks.length;
            return (
              <div
                key={mi}
                className="rounded-xl p-5 transition-all"
                style={{
                  background: "#0f0f0f",
                  border: monthDone === monthTotal && monthTotal > 0
                    ? "1px solid rgba(34,197,94,0.3)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-baymax-red text-foreground px-2 py-0.5 rounded-full font-bold">
                      {month.month}
                    </span>
                    <span className="text-sm text-foreground font-syne font-bold">{month.subtitle}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{monthDone}/{monthTotal}</span>
                </div>
                <div className="space-y-3">
                  {month.tasks.map((task: Task, ti: number) => (
                    <label key={ti} className="flex items-start gap-3 cursor-pointer group">
                      <div
                        onClick={() => toggleTask(mi, ti)}
                        className="mt-0.5 w-4 h-4 rounded shrink-0 flex items-center justify-center transition-all"
                        style={{
                          background: task.checked ? "#22c55e20" : "transparent",
                          border: task.checked ? "1.5px solid #22c55e" : "1.5px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        {task.checked && <span className="text-green-400 text-[9px]">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-xs leading-snug transition-all ${
                            task.checked ? "line-through text-muted-foreground/50" : "text-foreground/80"
                          }`}
                        >
                          {task.text}
                        </span>
                        <span
                          className="inline-block ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full"
                          style={{
                            background: typeColors[task.type].bg,
                            border: `1px solid ${typeColors[task.type].border}`,
                            color: typeColors[task.type].text,
                          }}
                        >
                          {task.type}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoadmapPlanner;
