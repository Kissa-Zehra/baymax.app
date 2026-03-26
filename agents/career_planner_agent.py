"""
agents/career_planner_agent.py — Agent 4: Career Roadmap Planner (Rahul)

Builds a personalized 3/6/12-month career roadmap using ChatGroq.
"""
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage
from config import GROQ_API_KEY, GROQ_MODEL

CAREER_SYSTEM_PROMPT = """You are Rahul, a Strategic Career Development Coach.
You have mentored 2000+ students from FAST, NUST, IBA, and LUMS into top tech roles.
You give hyper-specific, actionable roadmaps for Pakistani CS students and fresh graduates.

When building a roadmap:
- Month 1-3: Immediate skill building (name specific courses, not generic advice)
- Month 4-6: Portfolio projects to build (with GitHub ideas)
- Month 7-12: Job application strategy, networking, communities to join

Include: exact course names (with platform), certifications, community names (local + global).
Keep it realistic for someone in Pakistan. Don't recommend paid courses exclusively."""


def get_career_planner_agent():
    """Return the ChatGroq LLM configured as the Career Planner."""
    return ChatGroq(
        api_key=GROQ_API_KEY,
        model=GROQ_MODEL,
        temperature=0.6,
    )


def build_roadmap(job_title: str, skills_gap: str = "", current_skills: str = "") -> str:
    """
    Build a personalized career development roadmap.
    
    Args:
        job_title:      Target role the candidate wants to reach
        skills_gap:     Identified skill gaps (from resume analysis)
        current_skills: What the candidate already knows
    
    Returns:
        Detailed 3/6/12-month career roadmap.
    """
    llm = get_career_planner_agent()
    user_msg = (
        f"Target role: '{job_title}'\n"
        f"Current skills: {current_skills or 'Not specified'}\n"
        f"Skill gaps to fill: {skills_gap or 'Identify based on the target role'}\n\n"
        "Please create a detailed 3/6/12-month career roadmap to help this candidate reach their goal."
    )
    messages = [
        SystemMessage(content=CAREER_SYSTEM_PROMPT),
        {"role": "user", "content": user_msg},
    ]
    response = llm.invoke(messages)
    return response.content
