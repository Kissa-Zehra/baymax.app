# 🏗️ Baymax AI System Architecture

Overview of the system design, data flow, and component interactions.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER (Streamlit UI)                      │
│         Upload Resume → Enter Job Title → View Results      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              CREW.PY (Orchestration Layer)                   │
│          Coordinates 4 agents in sequence                   │
└──────┬──────────────────┬──────────────────┬────────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ Alex Agent 1  │ │ Sam Agent 2   │ │ Zara Agent 3  │
│ Resume        │ │ Interview     │ │ Job Search    │
│ Analyzer      │ │ Coach         │ │              │
└───────────────┘ └───────────────┘ └───────────────┘
       │                  │                  │
       └──────────────────┴──────────────────┘
                  │
                  ▼
           ┌──────────────────┐
           │ Rahul Agent 4    │
           │ Career Planner   │
           └──────────────────┘
                  │
                  ▼
        ┌──────────────────────┐
        │ Final Report Output  │
        │ (PDF via n8n)        │
        └──────────────────────┘
```

---

## Component Architecture

### 1. Frontend Layer (Streamlit)

**File:** `app.py`

**Responsibilities:**

- 🎨 Web UI (file upload, input fields, results display)
- 📝 Form validation (resume PDF, job title)
- 🔐 API key validation
- 📊 Results visualization
- 💾 Session state management

**Data Flow:**

```
User uploads PDF → Extract text (pdf_tool.py) → Pass to crew.py
```

---

### 2. Orchestration Layer (CrewAI)

**File:** `crew.py`

**Responsibilities:**

- 🎯 Agent sequencing (runs 4 agents in order)
- 📦 Context passing (output of agent 1 → input of agent 2)
- 🔄 Error handling & fallbacks
- ⏱️ Timeout management

**Pipeline Order:**

```
Resume Analysis → Interview Questions → Job Matching → Career Roadmap
     (Alex)           (Sam)              (Zara)          (Rahul)
```

**Context Passing:**

```
Alex Output (resume gaps, skills)
    ↓
Sam uses resume summary for contextual interview questions
    ↓
Zara uses skill keywords to find matching jobs
    ↓
Rahul synthesizes gaps + interview performance + job demand
```

---

### 3. Agent Layer (LangChain)

#### Agent 1: Resume Analyzer (Alex)

**File:** `agents/resume_agent.py`

**Input:**

- `resume_text`: Extracted PDF resume
- `job_title`: Target job

**Process:**

1. Load ChatGroq LLM
2. Apply system prompt (Alex persona)
3. Compare resume against job description (semantic matching)
4. Score skill match (0-100)
5. Identify gaps and strengths

**Output:**

```json
{
  "skill_match_score": 75,
  "strengths": ["Python", "SQL", "REST APIs"],
  "gaps": ["System Design", "DevOps", "Cloud (AWS)"],
  "improvements": ["Build a system design project", "Learn Docker"],
  "rewritten_summary": "Experienced backend engineer..."
}
```

**Tech:**

- LangChain ChatGroq
- System prompt engineering
- Temperature: 0.3 (consistent, less creative)

---

#### Agent 2: Interview Coach (Sam)

**File:** `agents/interview_agent.py`

**Input:**

- `job_title`: Target position
- `resume_summary`: From Alex (condensed)
- `candidate_answers`: User's interview responses (optional)

**Process:**

1. Generate 10 interview questions
   - 5 technical (DSA, system design, role-specific)
   - 5 behavioral/HR (experience, motivation)
2. Adapt questions based on resume
3. Evaluate user answers if provided
4. Score responses (0-100)
5. Give detailed per-question feedback

**Output:**

```json
{
  "questions": [
    {
      "question": "Design an e-commerce system for 1M users",
      "expected_keywords": ["databases", "caching", "load balancing"],
      "difficulty": "hard"
    }
  ],
  "feedback": {
    "question_1": {
      "score": 7/10,
      "feedback": "Good system design thinking. Missing mention of..."
    }
  },
  "overall_score": 72,
  "areas_to_improve": ["System Design", "Communication"]
}
```

**Tech:**

- Multi-turn conversation history
- Stateful evaluation (remembers answers)
- Temperature: 0.5 (balanced creativity)

---

#### Agent 3: Job Search (Zara)

**File:** `agents/job_search_agent.py`

**Input:**

- `job_title`: Target position
- `skills_summary`: From Alex (keyword extraction)
- `location`: Pakistan (optional)

**Process:**

1. Call Serper API with refined search query
2. Extract job listings
3. Score each job by skill match
4. Filter for remote/Pakistan-based
5. Rank by relevance
6. Extract apply links

**Output:**

```json
{
  "jobs": [
    {
      "title": "Senior Backend Engineer",
      "company": "TechCorp Pakistan",
      "match_score": 85,
      "skills_match": ["Python", "Django", "PostgreSQL"],
      "missing_skills": ["Kubernetes"],
      "apply_link": "https://careers.techcorp.pk/...",
      "remote": true,
      "salary_range": "PKR 150K-200K"
    }
  ],
  "total_matches": 5
}
```

**Tech:**

- Serper API (real-time web search)
- Semantic ranking (compare job requirements vs resume)
- No temperature (deterministic)

---

#### Agent 4: Career Roadmap (Rahul)

**File:** `agents/career_planner_agent.py`

**Input:**

- `job_title`: Target position
- `resume_analysis`: From Alex
- `interview_feedback`: From Sam
- `job_market_demand`: From Zara

**Process:**

1. Identify top skill gaps (from Alex + Sam)
2. Check job market demand (from Zara)
3. Create 3-month roadmap
4. Recommend:
   - Courses (Udemy, Coursera)
   - Certifications (AWS, GCP)
   - GitHub projects
   - Networking activities
5. Set weekly milestones

**Output:**

```json
{
  "roadmap": {
    "month_1": {
      "focus": "System Design fundamentals",
      "courses": ["System Design Interview by Alex Xu"],
      "projects": ["Build a URL shortener"],
      "milestones": ["Complete course", "Deploy project", "2 practice interviews"]
    }
  },
  "critical_path": ["System Design", "DevOps basics", "Interview prep"],
  "estimated_weeks": 12
}
```

**Tech:**

- Multi-input synthesis
- Long-form reasoning
- Temperature: 0.6 (creative but structured)

---

## Data Flow Diagram

```
┌─────────────────────┐
│  User Upload PDF    │
│  + Job Title        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Extract Text PDF   │  ← pdf_tool.py
│  (PyPDF2)           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Agent 1: Resume Analyzer (Alex)        │
│  • ChatGroq LLM                         │
│  • System prompt (analyzer persona)     │
│  • Semantic comparison (resume vs job)  │
└──────────┬──────────────────────────────┘
           │
           ├─→ skill_match_score
           ├─→ strengths
           ├─→ gaps
           │
           ▼
┌─────────────────────────────────────────┐
│  Agent 2: Interview Coach (Sam)         │
│  • ChatGroq LLM                         │
│  • System prompt (interviewer persona)  │
│  • Adapt questions based on resume     │
└──────────┬──────────────────────────────┘
           │
           ├─→ 10 interview questions
           ├─→ per-question feedback
           │
           ▼
┌─────────────────────────────────────────┐
│  Agent 3: Job Search (Zara)             │
│  • Serper API call                      │
│  • Real-time job search                │
│  • Semantic ranking                    │
└──────────┬──────────────────────────────┘
           │
           ├─→ job_listings (ranked)
           ├─→ skill_matches
           │
           ▼
┌─────────────────────────────────────────┐
│  Agent 4: Career Planner (Rahul)        │
│  • Synthesize all outputs               │
│  • Generate roadmap                    │
│  • Recommend resources                 │
└──────────┬──────────────────────────────┘
           │
           └─→ Final report
              (to frontend)
```

---

## Tech Stack Details

### LLM Runtime: Groq

- **Why Groq?** Sub-second inference, perfect for real-time
- **Models used:**
  - `llama-3.3-70b-versatile` (analysis, default)
  - `mixtral-8x7b-32768` (fast responses)
- **API Calls:** ~4 per session (one per agent)
- **Cost:** Free tier available

### Agent Framework: LangChain

- **Why LangChain?** Tool calling, prompt templates, memory
- **Key features used:**
  - CustomPromptTemplate (system prompts)
  - ChatGroq integration
  - Tool definitions (for agent capabilities)
  - Message history (for multi-turn)

### Orchestration: CrewAI (Transitioning to LangGraph)

- **Why CrewAI?** Multi-agent coordination
- **Responsibilities:**
  - Sequential execution
  - Context passing between agents
  - Error handling

### RAG: ChromaDB + Sentence Transformers

- **Why RAG?** Semantic matching of resumes to jobs
- **Flow:**
  1. Convert resume text to embeddings
  2. Convert job description to embeddings
  3. Compare semantic similarity
  4. Score match percentage
- **Storage:** Persistent ChromaDB at `data/chroma_db/`

### Search: Serper API

- **Why Serper?** Real-time, accurate, Pakistan-aware
- **Features:**
  - Live job search
  - Ranking by relevance
  - Direct apply links

### Frontend: Streamlit

- **Why Streamlit?** Rapid prototyping, no frontend coding
- **Capabilities:**
  - File upload (PDF resume)
  - Text input (job title)
  - Display results (formatted text, tables)
  - Session management

---

## State Management

### Session State (Streamlit)

```python
# Stored in Streamlit session:
st.session_state.resume_text       # Extracted resume
st.session_state.job_title         # User input
st.session_state.analysis_results  # All agent outputs
st.session_state.current_step      # Progress tracking
```

### Agent Context Passing

```python
# Agent 1 output used by Agent 2:
resume_analysis = agent1_output
interview_qs = agent2(job_title, resume_analysis[:600])

# Similar for others:
job_matches = agent3(job_title, resume_analysis[:300])
roadmap = agent4(job_title, resume_analysis, interview_feedback, job_matches)
```

---

## Error Handling

**Three-tier error handling:**

1. **API Level:**
   - Groq API timeout → retry with faster model
   - Serper API fails → show cached results

2. **Agent Level:**
   - Invalid resume → show helpful error message
   - Missing API key → warn user before running

3. **Frontend Level:**
   - PDF parse fails → suggest re-uploading
   - Network error → show offline message

---

## Performance Characteristics

| Operation       | Time        | Cost             |
| --------------- | ----------- | ---------------- |
| PDF extraction  | <1s         | Free (local)     |
| Resume analysis | 2-5s        | Free (Groq)      |
| Interview gen   | 3-7s        | Free (Groq)      |
| Job search      | 2-4s        | Free (100/month) |
| Career roadmap  | 3-6s        | Free (Groq)      |
| **Total**       | **~15-20s** | **Free**         |

---

## Scalability & Future

### Current (MVP)

- Single-user, sequential processing
- Local ChromaDB
- No persistence between sessions

### Future (v2)

- Multi-user with user accounts
- Distributed job search (parallel agents)
- PostgreSQL for history
- Caching of common queries

### Ultimate (SaaS)

- Microservices per agent
- Kubernetes orchestration
- Load balancing
- Serverless functions

---

## Security Considerations

- 🔐 API keys in `.env` (never committed)
- 🔒 No user data stored (résumé only in memory)
- 🛡️ CORS enabled for web deployment
- ✅ Input validation on all fields

---

## References

- [LangChain Docs](https://docs.langchain.com)
- [CrewAI Docs](https://docs.crewai.com)
- [Groq API Docs](https://console.groq.com/docs)
- [ChromaDB Docs](https://docs.trychroma.com)
- [Streamlit Docs](https://docs.streamlit.io)
