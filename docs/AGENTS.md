# 🤖 Baymax AI Agents — Detailed Specifications

Meet your four-agent career coaching team.

---

## Overview Table

| Agent | Name      | File                      | Role            | Key Tech                |
| ----- | --------- | ------------------------- | --------------- | ----------------------- |
| 1️⃣    | **Alex**  | `resume_agent.py`         | Resume Analyzer | RAG + Semantic matching |
| 2️⃣    | **Sam**   | `interview_agent.py`      | Interview Coach | Multi-turn conversation |
| 3️⃣    | **Zara**  | `job_search_agent.py`     | Job Matcher     | Web search + ranking    |
| 4️⃣    | **Rahul** | `career_planner_agent.py` | Roadmap Planner | Synthesis + planning    |

---

## Agent 1: Alex — Resume Analyzer

### Purpose

Analyzes your resume against a target job description and identifies specific skill gaps, strengths, and areas for improvement.

### Inputs

```python
def analyze_resume(
    resume_text: str,      # Extracted from PDF
    job_title: str         # e.g., "Backend Engineer at Fintech"
) -> str:
```

### System Prompt (1000+ tokens)

```
You are Alex, a Senior Resume Analyst & Career Strategist.
You have 10+ years of experience reviewing resumes for top Pakistani
and international tech companies.

You know exactly what hiring managers look for.

When given a resume and target job title, provide:
1. Skill match score (0-100) - how well this profile fits the job
2. Top 5 strengths in the resume
3. Top 5 missing skills / keyword gaps
4. 3 specific, actionable improvement suggestions
5. A re-written professional summary (2-3 sentences, ATS-friendly)

Be honest, specific, and constructive.
Format your response with clear headers.
```

### Output Format

```
Skill Match Score: 72/100

🟢 Top 5 Strengths:
• Python (3 years production)
• REST API design & FastAPI
• PostgreSQL & database modeling
• Git & CI/CD pipelines
• Agile/Scrum methodologies

🔴 Top 5 Missing Skills:
• System Design & architecture at scale
• Kubernetes & container orchestration
• AWS services (EC2, RDS, S3)
• Microservices architecture
• Load testing & performance optimization

💡 Improvement Suggestions:
1. Complete a system design course (Educative or Alex Xu)
2. Build a microservice project (2-3 services, Docker)
3. Study AWS fundamentals (free tier available)

✅ Improved Summary:
"Experienced backend engineer with 3+ years building scalable APIs
in Python. Proven expertise in database optimization and CI/CD.
Eager to master system design and AWS for enterprise-scale systems."
```

### Key Features

- **Semantic Matching:** Uses ChromaDB to compare resume against job description embeddings
- **Scoring:** 0-100 scale based on skill overlap
- **Actionable:** Provides specific, implementable improvements
- **ATS-Friendly:** Recommends keyword optimization

### Model Configuration

```python
ChatGroq(
    api_key=GROQ_API_KEY,
    model="llama-3.3-70b-versatile",  # Smarter
    temperature=0.3  # Consistent, less creative
)
```

### Performance

- **Time:** 2-5 seconds
- **API Calls:** 1 (to Groq)
- **Cost:** Free

---

## Agent 2: Sam — Interview Coach

### Purpose

Generates a full mock interview (technical + behavioral questions), evaluates your answers, and adapts based on performance.

### Inputs

```python
def generate_interview(
    job_title: str,           # Target position
    resume_summary: str,      # From Agent 1 (condensed)
    candidate_answers: str    # Optional: your responses to evaluate
) -> dict:
```

### System Prompt

```
You are Sam, an Elite Interview Coach & Hiring Expert.
You've conducted 1000+ interviews for FAANG companies and Pakistani startups.

You prepare candidates for success.

When asked:
1. Generate 10 interview questions (5 technical, 5 behavioral)
2. Tailor questions to the resume background provided
3. If candidate answers are provided, evaluate each one
4. Score each answer (0-10)
5. Give specific, encouraging feedback
6. Remember previous answers and adapt later questions

Technical questions should include:
• Data structures & algorithms (for software roles)
• System design (for senior roles)
• Role-specific technical skills

Behavioral questions should cover:
• Past projects & impact
• Teamwork & communication
• Problem-solving approach
• Motivation for the role

Be encouraging but honest.
Simulate a real interview (some tension, not too easy).
```

### Output Format

```json
{
  "questions": [
    {
      "question_number": 1,
      "question": "Tell me about a backend project where you optimized performance. What was the bottleneck?",
      "category": "behavioral",
      "difficulty": "medium",
      "expected_keywords": ["profiling", "caching", "indexing", "measurement"],
      "tips": "Use the STAR method (Situation, Task, Action, Result)"
    },
    {
      "question_number": 2,
      "question": "Design a rate limiter for an API.",
      "category": "technical_system_design",
      "difficulty": "hard",
      "expected_keywords": ["token bucket", "sliding window", "distributed", "Redis"],
      "tips": "Start with single-host, then scale to distributed"
    }
  ],

  "feedback": {
    "question_1": {
      "score": 8,
      "feedback": "Excellent use of STAR. You clearly explained the problem and impact. Next time, add metrics (% improvement, latency reduction).",
      "strengths": ["Clear communication", "Quantified impact"],
      "areas_to_improve": ["Add more specific metrics"]
    }
  },

  "overall_score": 72,
  "overall_feedback": "Strong communication and problem-solving. Work on system design depth.",
  "strengths": ["Communication", "Project experience", "Problem-solving"],
  "areas_to_improve": ["System design", "Trade-off analysis", "Scale awareness"]
}
```

### Key Features

- **Adaptive:** Adjusts difficulty based on answers
- **Personalized:** Uses resume to tailor questions
- **Scoring:** Per-question + overall score
- **Feedback:** Specific, actionable suggestions
- **Memory:** Remembers answers across the session

### Model Configuration

```python
ChatGroq(
    api_key=GROQ_API_KEY,
    model="llama-3.3-70b-versatile",
    temperature=0.5  # Balanced (realistic interview tone)
)
```

### Performance

- **Time:** 3-7 seconds
- **API Calls:** 1 (to Groq)
- **Cost:** Free

---

## Agent 3: Zara — Job Search Agent

### Purpose

Searches the live web for real job openings matching your skills and location. Ranks them by relevance.

### Inputs

```python
def find_jobs(
    job_title: str,           # Target position
    skills_summary: str,      # From Agent 1 (keywords)
    location: str = "Pakistan"
) -> list[dict]:
```

### System Prompt

```
You are Zara, a recruiter with deep knowledge of the Pakistan tech job market.
You know the best startups, MNCs, and companies hiring.

When given a job title and skills:
1. Search the web using the provided tool
2. Find real job openings matching the profile
3. Score each job by skill match (0-100)
4. Identify which of the candidate's skills match
5. Flag any critical missing skills
6. Rank by match score
7. Provide direct apply links
8. Include salary info if available

Prioritize:
• Pakistan-based companies (Daraz, TechAstro, FastBrains, etc.)
• Remote-friendly roles
• Companies with good culture (from research)
• Recent postings (within 30 days)

Format clearly with apply links.
```

### Output Format

```json
{
  "search_query": "Backend Engineer Python Pakistan remote",
  "total_results": 47,
  "top_matches": [
    {
      "rank": 1,
      "job_title": "Senior Backend Engineer",
      "company": "Daraz (Pakistan)",
      "match_score": 92,
      "location": "Karachi, Pakistan (Remote available)",
      "skills_match": [
        "Python ✓",
        "REST APIs ✓",
        "PostgreSQL ✓",
        "System Design ✓"
      ],
      "missing_skills": [
        "Kubernetes (preferred)",
        "AWS Lambda (preferred)"
      ],
      "salary_range": "PKR 150K-200K/month",
      "apply_link": "https://careers.daraz.pk/...",
      "posted_date": "2 days ago",
      "description_snippet": "Build scalable APIs serving 100M+ users..."
    },
    {
      "rank": 2,
      "job_title": "Backend Engineer",
      "company": "TechAstro",
      "match_score": 87,
      ...
    }
  ]
}
```

### Key Features

- **Real-time:** Search live with Serper API
- **Ranked:** Sorted by skill match
- **Pakistan-aware:** Prioritizes local market + remote
- **Apply Links:** Direct to company careers page
- **Salary Info:** When available

### Tech Stack

```python
# Uses Serper API for real-time search
# Semantic ranking based on resume skills
# No LLM involved (deterministic)
```

### Performance

- **Time:** 2-4 seconds
- **API Calls:** 1 (to Serper)
- **Cost:** Free (100/month free tier)

---

## Agent 4: Rahul — Career Roadmap Planner

### Purpose

Takes all insights from other agents and creates a personalized, actionable 3-month career roadmap.

### Inputs

```python
def build_roadmap(
    job_title: str,
    resume_analysis: str,     # From Agent 1
    interview_feedback: str,  # From Agent 2
    job_matches: list[dict]   # From Agent 3
) -> dict:
```

### System Prompt

```
You are Rahul, a Career Coach & Growth Strategist.
You've helped 200+ people land their dream jobs.

Your job: Create a realistic, motivating 3-month roadmap.

Given:
1. Resume analysis (skills + gaps)
2. Interview performance (strengths + weak areas)
3. Job market demand (from live job search)

Create a roadmap that includes:
1. Critical path (must-learn skills first)
2. Week-by-week milestones
3. Specific courses (Udemy, Coursera, YouTube)
4. GitHub projects (to build portfolio)
5. Certifications (if relevant)
6. Networking tips
7. Interview prep strategy

Be:
• Realistic (12 weeks, 10-15 hours/week effort)
• Motivating (celebrate small wins)
• Specific (actual course links when possible)
• Flexible (suggest alternatives)

Format as Month 1, Month 2, Month 3 with weekly milestones.
```

### Output Format

```json
{
  "target_role": "Senior Backend Engineer",
  "current_level": "Mid-level Backend Engineer",
  "gap": "System Design + Cloud AWS + Leadership",
  "estimated_weeks": 12,
  "effort_per_week": "12-15 hours",

  "critical_path": [
    "System Design fundamentals",
    "AWS services & architecture",
    "Microservices patterns",
    "Leadership & mentoring"
  ],

  "month_1": {
    "theme": "System Design Mastery",
    "focus": "Learn to design large-scale systems",

    "week_1": {
      "topic": "System Design Basics",
      "course": "Designing Data-Intensive Applications by Martin Kleppmann",
      "project": "Design a URL shortener (single host)",
      "milestones": ["Read ch.1-3", "Understand trade-offs"],
      "effort_hours": 12
    },

    "week_2": {
      "topic": "Distributed Systems",
      "course": "System Design Interview by Alex Xu (YouTube + paid course)",
      "project": "Rate limiter (distributed)",
      "milestones": ["Learn sharding", "CAP theorem"],
      "effort_hours": 14
    },

    "week_3": {
      "topic": "Advanced Caching & Databases",
      "course": "Redis & Cache strategies",
      "project": "Add Redis caching to your URL shortener",
      "milestones": ["Cache invalidation", "Performance testing"],
      "effort_hours": 12
    },

    "week_4": {
      "topic": "Interview Prep",
      "course": "Mock interviews",
      "project": "Practice 3 system design questions",
      "milestones": ["Record yourself", "Get feedback"],
      "effort_hours": 10
    }
  },

  "month_2": {
    "theme": "AWS & Cloud Architecture",
    "focus": "Master AWS for production systems",
    "weeks": [...]
  },

  "month_3": {
    "theme": "Leadership & Final Preparation",
    "focus": "Soft skills + final interview polish",
    "weeks": [...]
  },

  "key_resources": [
    {
      "type": "course",
      "name": "Designing Data-Intensive Applications",
      "link": "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491902141/",
      "duration": "20 hours",
      "cost": "₨2,500-3,000"
    },
    {
      "type": "course",
      "name": "System Design Interview",
      "instructor": "Alex Xu",
      "link": "https://www.educative.io/courses/grokking-the-system-design-interview",
      "duration": "15 hours",
      "cost": "₨1,500-2,000"
    }
  ],

  "github_projects": [
    {
      "project": "Distributed URL Shortener",
      "tech": ["Python", "FastAPI", "Redis", "PostgreSQL"],
      "difficulty": "medium",
      "why": "Demonstrates system design thinking"
    },
    {
      "project": "Microservice E-commerce",
      "tech": ["Python", "FastAPI", "Docker", "Kubernetes", "AWS"],
      "difficulty": "hard",
      "why": "Portfolio showstopper"
    }
  ],

  "certifications": [
    {
      "name": "AWS Solutions Architect Associate",
      "difficulty": "medium",
      "timeline": "6-8 weeks",
      "why": "Industry standard, salary boost"
    }
  ],

  "interview_prep_strategy": {
    "month_1": "Learn fundamentals",
    "month_2": "Practice questions under time pressure",
    "month_3": "Do mock interviews with real people"
  },

  "weekly_checklist": [
    "[ ] Complete assigned readings",
    "[ ] Build project milestone",
    "[ ] Do 1 mock interview question",
    "[ ] Network (reach out to 1 person)",
    "[ ] Reflect & adjust"
  ]
}
```

### Key Features

- **Personalized:** Based on gaps + market demand
- **Realistic:** 12-week timeline, 10-15 hrs/week
- **Specific:** Actual courses, projects, resources
- **Motivating:** Weekly wins + milestones
- **Actionable:** Start next Monday

### Model Configuration

```python
ChatGroq(
    api_key=GROQ_API_KEY,
    model="llama-3.3-70b-versatile",
    temperature=0.6  # Creative but structured
)
```

### Performance

- **Time:** 3-6 seconds
- **API Calls:** 1 (to Groq)
- **Cost:** Free

---

## How Agents Work Together

### Data Flow

```
User Resume + Job Title
        ↓
    Alex (Agent 1)
    Resume Analysis
        ↓
    Sam (Agent 2)
    Interview Questions
        ↓  ↓
    Zara + Rahul (Agents 3 & 4)
    Job Matches + Roadmap
        ↓
    Final Report (PDF)
```

### Example: Full Pipeline

```
User: "I'm a Python developer, want to be a backend engineer at a fintech"
Resume: "3 years Python, REST APIs, PostgreSQL, no system design"
Job Title: "Senior Backend Engineer at FinTech"

→ Alex analyzes: "You're 72% match. Missing: system design, DevOps, AWS"
→ Sam generates: "10 questions focused on system design + fintech knowledge"
→ Zara finds: "5 fintech roles in Pakistan, all need AWS + system design"
→ Rahul plans: "3-month roadmap: system design (month 1) → AWS (month 2) → leadership (month 3)"

Result: Clear path to the job in 12 weeks.
```

---

## Agent Customization

Each agent can be customized:

### Change System Prompt

Edit the agent's file and modify `SYSTEM_PROMPT` constant.

### Change Model

In `config.py`:

```python
GROQ_MODEL = "mixtral-8x7b-32768"  # Faster
```

### Change Temperature

```python
ChatGroq(temperature=0.7)  # More creative
ChatGroq(temperature=0.2)  # More consistent
```

### Add Tools

Agents can access tools via LangChain:

```python
from langchain.tools import Tool
# Define custom tools
# Agent can call them during reasoning
```

---

## Testing Agents Individually

```bash
# Test Agent 1 (Resume)
python -c "
from agents.resume_agent import analyze_resume
result = analyze_resume('Python, 3 years experience', 'Backend Engineer')
print(result)
"

# Test Agent 2 (Interview)
python -c "
from agents.interview_agent import generate_interview
result = generate_interview('Backend Engineer', 'Python dev, 3 years')
print(result)
"

# Test Agent 3 (Job Search)
python -c "
from agents.job_search_agent import find_jobs
result = find_jobs('Backend Engineer', 'Python SQL')
print(result)
"

# Test Agent 4 (Roadmap)
python -c "
from agents.career_planner_agent import build_roadmap
result = build_roadmap('Backend Engineer', 'resume analysis', 'interview feedback', [])
print(result)
"
```

---

## Performance Tuning

### For Speed (< 10s total)

```python
GROQ_MODEL = "mixtral-8x7b-32768"  # Faster
temperature = 0.3  # Less thinking
max_tokens = 500  # Shorter answers
```

### For Quality (< 20s total)

```python
GROQ_MODEL = "llama-3.3-70b-versatile"  # Smarter
temperature = 0.7  # More thorough
max_tokens = 2000  # Detailed answers
```

---

See [ARCHITECTURE.md](ARCHITECTURE.md) for system-level details.
