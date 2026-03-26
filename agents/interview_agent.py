"""
agents/interview_agent.py — Agent 2: Mock Interview Coach (Sam)

Uses LangChain ChatGroq with a specialized interviewer system prompt.
"""
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage
from config import GROQ_API_KEY, GROQ_MODEL

INTERVIEW_SYSTEM_PROMPT = """You are Sam, an Expert Technical Interview Coach.
You have helped 500+ candidates land roles at Google, Meta, and top Pakistani tech firms.
You adapt your questions to each candidate's background and deliver STAR-framework evaluations.

You cover:
- Technical / role-specific questions
- DSA & problem-solving questions
- Behavioural questions (STAR format)

When generating questions: provide 3 technical + 2 DSA + 2 behavioral questions with model answers.
When evaluating answers: score each 1-10 with specific, constructive feedback.
Format your response with clear section headers."""


def get_interview_agent():
    """Return the ChatGroq LLM configured as the Interview Coach."""
    return ChatGroq(
        api_key=GROQ_API_KEY,
        model=GROQ_MODEL,
        temperature=0.5,
    )


def generate_interview(job_title: str, resume_summary: str = "", candidate_answers: str = "") -> str:
    """
    Generate mock interview questions (and optionally evaluate answers).
    
    Args:
        job_title:         Target job title
        resume_summary:    Optional context from resume analysis
        candidate_answers: Optional answers to evaluate (if empty, generates questions + model answers)
    
    Returns:
        Interview questions with model answers, OR evaluation of provided answers.
    """
    llm = get_interview_agent()

    context = f"Resume context:\n{resume_summary}\n\n" if resume_summary else ""

    if candidate_answers:
        user_msg = (
            f"{context}Job role: '{job_title}'\n\n"
            f"Please evaluate these candidate answers:\n{candidate_answers}"
        )
    else:
        user_msg = (
            f"{context}Job role: '{job_title}'\n\n"
            "Generate a mock interview with questions and model answers."
        )

    messages = [
        SystemMessage(content=INTERVIEW_SYSTEM_PROMPT),
        {"role": "user", "content": user_msg},
    ]
    response = llm.invoke(messages)
    return response.content
