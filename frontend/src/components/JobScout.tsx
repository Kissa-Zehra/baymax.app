import { useState, useEffect } from "react";
import { Bookmark, ExternalLink, AlertCircle, Search, ArrowRight } from "lucide-react";
import { searchJobsWithSkills } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

interface Props {
  jobTitle?: string;
  skillsSummary?: string;
  skillsList?: string[];
  userId?: string;
  onJobSearched?: (jobTitle: string) => void;
  onSwitchTab?: (tab: number) => void;
}

const filters = ["Remote", "Pakistan", "Full-time", "Internship", "Entry Level"];

const JobScout = ({
  jobTitle: initialJobTitle = "",
  skillsSummary = "",
  skillsList = [],
  userId = "default",
  onJobSearched,
  onSwitchTab,
}: Props) => {
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState(initialJobTitle || "Software Engineer");
  const [activeFilters, setActiveFilters] = useState<string[]>(["Pakistan"]);
  const [jobsContent, setJobsContent] = useState<string | null>(null);

  // Auto-run search when session has job title + skills loaded
  useEffect(() => {
    if (initialJobTitle && skillsList.length > 0 && !jobsContent) {
      handleSearch(initialJobTitle, skillsList);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialJobTitle]);

  const jobsApi = useApi<{ jobs: string }>();

  const toggleFilter = (f: string) => {
    setActiveFilters((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  };

  const handleSearch = async (titleOverride?: string, skillsOverride?: string[]) => {
    const title = titleOverride ?? jobTitle;
    const skills = skillsOverride ?? skillsList;
    if (!title.trim()) {
      toast({ title: "Job title required", description: "Enter a role to search for.", variant: "destructive" });
      return;
    }
    try {
      const filterContext = activeFilters.length > 0 ? ` (${activeFilters.join(", ")})` : "";
      const result = await jobsApi.execute(() =>
        searchJobsWithSkills(title + filterContext, skillsSummary, skills, userId)
      );
      setJobsContent(result.jobs);
      onJobSearched?.(title);
    } catch (err) {
      toast({ title: "Job search failed", description: String(err), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Skills info banner — shown when we have profile skills */}
      {skillsList.length > 0 && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.25)" }}
        >
          <span className="text-blue-400 text-base shrink-0">🎯</span>
          <div>
            <p className="text-blue-300 font-semibold text-xs mb-1">Personalised search — based on your resume profile</p>
            <p className="text-blue-400/80 text-xs leading-relaxed">
              {skillsList.slice(0, 8).join(" · ")}
              {skillsList.length > 8 && ` · +${skillsList.length - 8} more`}
            </p>
          </div>
        </div>
      )}

      {/* Search bar + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Software Engineer"
          className="bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-baymax-red focus:outline-none transition-colors flex-1 min-w-[200px]"
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
        />
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => toggleFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              activeFilters.includes(f) ? "bg-baymax-red border-baymax-red text-foreground" : "border-border text-muted-foreground hover:border-baymax-red"
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={() => handleSearch()}
          disabled={jobsApi.loading}
          className="bg-baymax-red text-foreground font-syne font-bold px-5 py-2.5 rounded-lg btn-red-glow transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          {jobsApi.loading ? (
            <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
          ) : (
            <Search size={14} />
          )}
          {jobsApi.loading ? "Searching..." : "Search Jobs"}
        </button>
      </div>

      {jobsApi.error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="text-red-400 mt-0.5 shrink-0" size={16} />
          <p className="text-sm text-red-300">{jobsApi.error}</p>
        </div>
      )}

      {/* Results */}
      {jobsContent ? (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="glass-card rounded-xl p-6" style={{ transform: "none" }}>
                <h4 className="font-syne font-bold text-sm text-foreground mb-4">
                  🔍 Zara's Job Matches — {jobTitle}
                </h4>
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{jobsContent}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="glass-card rounded-xl p-5 border-l-2 border-l-baymax-red" style={{ transform: "none" }}>
                <h4 className="font-syne font-bold text-sm text-foreground mb-2">⚡ Quick Links</h4>
                <div className="space-y-2">
                  {[
                    { name: "Rozee.pk", url: `https://www.rozee.pk/job/search/q/${encodeURIComponent(jobTitle)}` },
                    { name: "LinkedIn Jobs", url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobTitle)}&location=Pakistan` },
                    { name: "Mustakbil.com", url: `https://mustakbil.com/jobs?query=${encodeURIComponent(jobTitle)}` },
                  ].map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-baymax-red hover:underline"
                    >
                      {link.name} <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
              </div>
              <div className="glass-card rounded-xl p-5 border-l-2 border-l-green-500" style={{ transform: "none" }}>
                <h4 className="font-syne font-bold text-sm text-foreground mb-2">💡 Pro Tip</h4>
                <p className="text-sm text-muted-foreground">Companies in Pakistan are actively hiring. Tailor your resume for each application!</p>
              </div>
            </div>
          </div>

          {/* Proceed to Roadmap CTA */}
          {onSwitchTab && (
            <button
              onClick={() => onSwitchTab(4)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm"
              style={{
                background: "linear-gradient(135deg, #059669, #047857)",
                boxShadow: "0 4px 20px rgba(5,150,105,0.35)",
              }}
            >
              🗺️ Plan your career path <ArrowRight size={16} />
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">Enter a job title and click <span className="text-baymax-red font-bold">Search Jobs</span> to find live opportunities.</p>
          <p className="text-muted-foreground text-xs mt-2">Powered by Zara · Searches Rozee.pk, LinkedIn, Mustakbil &amp; more</p>
        </div>
      )}
    </div>
  );
};

export default JobScout;
