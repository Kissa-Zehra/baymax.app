"""
interview_agent.py — Sam: Live multi-turn Interview Coach
Supports both text (batch) and turn-by-turn (voice) modes.
"""

from groq import Groq
from config import GROQ_API_KEY
import json

client = Groq(api_key=GROQ_API_KEY)

INTERVIEW_SYSTEM = """You are Sam, a warm but rigorous technical interviewer at a top Pakistan tech company.
Your personality: Professional, encouraging, but realistic. You push candidates to think deeper.

RULES:
1. Ask ONE question at a time
2. Listen carefully to the answer
3. Probe with ONE follow-up if answer is shallow
4. After 3 exchanges on a topic, move to the next
5. Mix: 60% technical, 40% behavioral/HR
6. Keep questions concise (max 2 sentences)
7. Never reveal that you are an AI model — stay in character as Sam

SAFETY:
If a candidate seems distressed, acknowledge with empathy before continuing.
Never ask for real personal data (phone, home address, financial info).

When evaluating an answer, respond in JSON:
{
    "type": "feedback_and_next",
    "feedback": "brief feedback on their answer",
    "score": 7,
    "follow_up_or_next": "Your next question here"
}

When starting, respond in JSON:
{
    "type": "first_question",
    "question": "Tell me about yourself and why you're interested in [job_title]"
}
"""

def start_interview(job_title: str, resume_summary: str) -> dict:
    """Start a new interview session. Returns first question."""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": INTERVIEW_SYSTEM},
            {
                "role": "user", 
                "content": f"Start a technical + HR interview for:\nJob Title: {job_title}\nCandidate Background (from resume): {resume_summary}\nGenerate the opening and first question."
            }
        ],
        temperature=0.7,
        max_tokens=300,
    )
    content = response.choices[0].message.content
    try:
        return json.loads(content)
    except:
        return {"type": "first_question", "question": content}

def evaluate_answer(
    job_title: str, 
    conversation_history: list, 
    latest_answer: str, 
    question_num: int, 
    total_questions: int = 8,
) -> dict:
    """Evaluate one answer and get the next question."""
    # Build messages from conversation history
    messages = [{"role": "system", "content": INTERVIEW_SYSTEM}]
    messages.extend(conversation_history)
    
    prompt_content = f'Candidate\'s answer: "{latest_answer}"\nThis is question {question_num} of {total_questions}.\n'
    if question_num >= total_questions:
        prompt_content += "Generate final summary instead of next question since this is the last."
    else:
        prompt_content += "Evaluate and ask the next question."
        
    messages.append({
        "role": "user", 
        "content": prompt_content
    })
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.7,
        max_tokens=400,
    )
    content = response.choices[0].message.content
    try:
        return json.loads(content)
    except:
        return {
            "type": "feedback_and_next", 
            "feedback": content, 
            "score": 7, 
            "follow_up_or_next": "Next question..."
        }

def transcribe_audio(audio_bytes: bytes) -> str:
    """Transcribe audio using Groq Whisper."""
    transcription = client.audio.transcriptions.create(
        file=("audio.wav", audio_bytes, "audio/wav"),
        model="whisper-large-v3",
        language="en",
    )
    return transcription.text

def generate_interview(job_title: str, resume_summary: str, candidate_answers: str = "") -> str:
    """Backward-compatible batch mode for pipeline integration."""
    user_prompt = f"Generate a complete 8-question interview for {job_title}.\nResume: {resume_summary}\n"
    if candidate_answers:
        user_prompt += f"Candidate answers to evaluate: {candidate_answers}\n"
    else:
        user_prompt += "Generate questions only.\n"
    
    user_prompt += "Include: 4 technical, 2 behavioral, 1 DSA, 1 system design. End with a score out of 100 and overall feedback."

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": INTERVIEW_SYSTEM},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7,
        max_tokens=1200,
    )
    return response.choices[0].message.content