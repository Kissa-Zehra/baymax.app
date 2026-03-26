"""
crew.py — Baymax AI multi-agent pipeline (LangGraph orchestration)

Runs 4 specialized AI agents in sequence:
  1. Resume Analyzer (Alex) — analyzes the PDF resume
  2. Interview Coach (Sam)  — generates questions / evaluates answers
  3. Job Search Agent (Zara)— finds matching job listings live
  4. Career Planner (Rahul) — builds 3/6/12-month roadmap

Each agent's output feeds context into the next.
"""
from agents.resume_agent import analyze_resume
from agents.interview_agent import generate_interview
from agents.job_search_agent import find_jobs
from agents.career_planner_agent import build_roadmap


def run_pipeline(
    resume_text: str,
    job_title: str,
    candidate_answers: str = "",
) -> dict:
    """
    Execute the full Baymax AI multi-agent pipeline.

    Args:
        resume_text:       Extracted plain text from the candidate's PDF resume
        job_title:         Target job title (e.g. "Backend Engineer at a fintech")
        candidate_answers: Optional interview answers to evaluate

    Returns:
        dict with keys: resume_analysis, interview_report, job_matches, career_roadmap
    """
    print("[1/4] Alex (Resume Analyzer) is working...")
    resume_analysis = analyze_resume(resume_text, job_title)

    print("[2/4] Sam (Interview Coach) is working...")
    interview_report = generate_interview(
        job_title=job_title,
        resume_summary=resume_analysis[:600],   # Pass condensed context
        candidate_answers=candidate_answers,
    )

    print("[3/4] Zara (Job Search) is working...")
    # Extract skill keywords from resume analysis (first 300 chars as proxy)
    job_matches = find_jobs(job_title, skills_summary=resume_analysis[:300])

    print("[4/4] Rahul (Career Planner) is working...")
    career_roadmap = build_roadmap(
        job_title=job_title,
        skills_gap=resume_analysis[:400],
    )

    print("[✓] Pipeline complete.")
    return {
        "resume_analysis":  resume_analysis,
        "interview_report": interview_report,
        "job_matches":      job_matches,
        "career_roadmap":   career_roadmap,
    }
