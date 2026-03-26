"""
agents/job_search_agent.py — Agent 3: Job Scraper & Match Agent (Zara)

Searches for jobs using Serper API + ranks against candidate skills via Groq.
"""
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage
from config import GROQ_API_KEY, GROQ_MODEL_FAST
from tools.search_tool import web_search

JOB_SYSTEM_PROMPT = """You are Zara, an AI Job Matching Specialist with deep knowledge of the Pakistani tech job market.
You know Rozee.pk, LinkedIn Pakistan, Mustakbil.com, and international remote job boards.

Given job search results and a candidate's skills, you:
1. Identify the best 5 job matches
2. For each job: company, role, key required skills, match percentage, and apply link
3. Explain WHY each job is a good match

Format each job as a clear card with all details. Be realistic about match percentages."""


def get_job_search_agent():
    """Return the ChatGroq LLM configured as the Job Search Agent."""
    return ChatGroq(
        api_key=GROQ_API_KEY,
        model=GROQ_MODEL_FAST,
        temperature=0.2,
    )


def find_jobs(job_title: str, skills_summary: str = "") -> str:
    """
    Search for jobs matching the target role and candidate skills.
    
    Args:
        job_title:      Target job title / role
        skills_summary: Candidate's key skills (from resume analysis)
    
    Returns:
        Formatted list of top 5 matched job opportunities.
    """
    # 1. Live search via Serper
    search_results = web_search(f"{job_title} jobs Pakistan 2024 2025 site:rozee.pk OR site:linkedin.com OR site:mustakbil.com", num_results=8)
    search_text = "\n".join(
        f"- {r.get('title', '')}: {r.get('snippet', '')} ({r.get('link', '')})"
        for r in search_results
        if "error" not in r
    ) or "No live search results available — provide general recommendations based on role."

    # 2. LLM ranks and formats the matches
    llm = get_job_search_agent()
    user_msg = (
        f"Candidate target role: '{job_title}'\n"
        f"Candidate skills: {skills_summary or 'Not specified'}\n\n"
        f"Live search results:\n{search_text}\n\n"
        "Please identify and rank the top 5 job matches."
    )
    messages = [
        SystemMessage(content=JOB_SYSTEM_PROMPT),
        {"role": "user", "content": user_msg},
    ]
    response = llm.invoke(messages)
    return response.content
