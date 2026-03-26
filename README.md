# 🤖 Baymax AI — Multi-Agent Career Platform for CS Students

**Pakistan's First AI-Powered Career Coaching Platform**

Baymax AI is a multi-agent AI system that acts as a personal career team for Pakistani CS students and fresh graduates. Upload your resume and a job title—four specialized AI agents go to work autonomously, analyzing your profile, coaching you through interviews, finding real jobs, and building a personalized career roadmap.

[![Built with Groq](https://img.shields.io/badge/Built%20with-Groq-00d4ff?style=flat-square)](https://groq.com)
[![Built with LangChain](https://img.shields.io/badge/Built%20with-LangChain-3776ab?style=flat-square)](https://github.com/langchain-ai/langchain)
[![Built with CrewAI](https://img.shields.io/badge/Built%20with-CrewAI-FF6B35?style=flat-square)](https://github.com/joaomdmoura/crewai)
[![Built with Streamlit](https://img.shields.io/badge/Built%20with-Streamlit-FF4B4B?style=flat-square)](https://streamlit.io)

---

## 🎯 What Problem Does Baymax AI Solve?

**The Problem:**

- 🎓 30+ million CS students graduate in South Asia annually
- 📊 60%+ youth unemployment despite technical skills
- 🚫 Zero AI tools specifically designed for Pakistani job market

**The Solution:**
Baymax AI is the first AI platform purpose-built for Pakistani CS students. Instead of generic career advice, you get four specialized AI agents analyzing YOUR resume, coaching YOU for interviews, finding jobs IN YOUR MARKET, and building YOUR roadmap.

---

## 🧠 The Four Agents — Meet Your Career Team

### 1. **Alex** — Resume Analyzer

- Analyzes your PDF resume against target job descriptions
- Scores skill match (0-100)
- Identifies 5 key strengths & 5 critical gaps
- Rewrites weak bullet points in ATS-friendly format
- Tech: RAG with ChromaDB + semantic matching

### 2. **Sam** — Interview Coach

- Generates full mock interviews (technical + HR questions)
- Adapts questions based on your performance
- Evaluates each answer with detailed feedback
- Tracks improvement across session
- Tech: LangChain agents + multi-turn conversation memory

### 3. **Zara** — Job Search Agent

- Searches live job market (Serper API)
- Ranks jobs by skill match with YOUR resume
- Filters for remote/Pakistan-based roles
- Provides direct apply links
- Tech: Real-time web search + semantic ranking

### 4. **Rahul** — Career Roadmap Planner

- Synthesizes resume gaps + interview feedback + job demand
- Builds personalized 3-month roadmap
- Recommends courses, certifications, GitHub projects
- Provides weekly milestones
- Tech: Multi-agent orchestration with LangGraph

---

## 🚀 Quick Start (5 minutes)

### Prerequisites

```bash
python --version  # Must be Python 3.10+
git --version
```

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/baymax-ai.git
cd baymax-ai
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure API Keys

```bash
cp .env.example .env
# Then open .env and add your keys:
```

**Get Your API Keys (2 minutes, all free):**

| Service    | Get Key                                      | Purpose               |
| ---------- | -------------------------------------------- | --------------------- |
| **Groq**   | [console.groq.com](https://console.groq.com) | LLM (instant, no CC)  |
| **Serper** | [serper.dev](https://serper.dev)             | Job search (100 free) |

### 5. Launch the App

```bash
streamlit run app.py
```

Open **http://localhost:8501** in your browser.

### 6. Quick Test (Verify Setup)

```bash
python test_groq.py
```

If you see "Groq is working!" → You're good to go! ✅

---

## 📁 Project Structure

```
baymax-ai/
│
├── 📄 app.py                    # Streamlit web interface
├── 📄 crew.py                   # Multi-agent pipeline orchestration
├── 📄 config.py                 # Centralized config & env vars
├── 📄 test_groq.py              # Quick API key verification
├── 📄 requirements.txt           # Python dependencies
├── 📄 .env.example              # Template for configuration
├── 📄 README.md                 # This file
├── 📄 CONTRIBUTING.md           # Team contribution guidelines
├── 📄 SETUP.md                  # Detailed setup instructions
│
├── agents/                      # 🧠 The Four Agents
│   ├── resume_agent.py          # Alex: Resume Analyzer
│   ├── interview_agent.py       # Sam: Interview Coach
│   ├── job_search_agent.py      # Zara: Job Search
│   └── career_planner_agent.py  # Rahul: Roadmap Planner
│
├── tools/                       # 🛠️ Utilities & Tools
│   ├── pdf_tool.py              # PDF resume extraction
│   └── search_tool.py           # Serper API wrapper
│
├── rag/                         # 📚 RAG Pipeline
│   └── pipeline.py              # ChromaDB + embeddings
│
├── data/                        # 📊 Data & Storage
│   ├── chroma_db/               # Vector database (auto-created)
│   └── sample_jobs/             # Drop job PDFs here
│
└── docs/                        # 📖 Documentation
    ├── ARCHITECTURE.md          # System design & flow
    ├── AGENTS.md                # Detailed agent specs
    └── API_INTEGRATION.md       # API setup guide
```

---

## 🏗️ Tech Stack

| Layer             | Technology             | Purpose                         |
| ----------------- | ---------------------- | ------------------------------- |
| **LLM**           | Groq (llama-3.3-70b)   | Ultra-fast inference            |
| **Agents**        | LangChain + LangGraph  | Tool calling & state management |
| **Orchestration** | CrewAI                 | Multi-agent coordination        |
| **RAG**           | ChromaDB + HuggingFace | Semantic resume matching        |
| **Search**        | Serper API             | Real-time job listings          |
| **Frontend**      | Streamlit              | Web UI                          |
| **Backend**       | FastAPI (optional)     | REST API                        |

---

## 💻 For Team Members: Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:

- ✅ Code style guide
- ✅ Git workflow (feature branches)
- ✅ Testing requirements
- ✅ Code review process
- ✅ Commit message standards

**Quick contribution checklist:**

```bash
git checkout -b feature/your-feature-name
# Make changes
pip install -r requirements-dev.txt  # Dev tools
python -m pytest tests/               # Run tests
git add .
git commit -m "feat: description of change"
git push origin feature/your-feature-name
# Create PR on GitHub
```

---

## 🧪 Testing

```bash
# Test Groq API key
python test_groq.py

# Run agent individually
python -c "from agents.resume_agent import analyze_resume; print(analyze_resume('Sample resume text', 'Backend Engineer'))"
```

---

## 📚 Documentation

| Document                                     | Purpose                          |
| -------------------------------------------- | -------------------------------- |
| [SETUP.md](SETUP.md)                         | Detailed setup & troubleshooting |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design & data flow        |
| [docs/AGENTS.md](docs/AGENTS.md)             | Agent specifications & prompts   |
| [CONTRIBUTING.md](CONTRIBUTING.md)           | Code style & Git workflow        |

---

## 🔐 Security & Best Practices

⚠️ **Never commit `.env` with real API keys!**

- ✅ `.env.example` is committed (template only)
- ✅ `.env` is in `.gitignore` (local only)
- ✅ Use environment variables in production

---

## 🚀 Deployment Roadmap

### Phase 1: MVP (Hackathon)

- ✅ Resume analysis vs job descriptions
- ✅ Mock interview with per-answer feedback
- ✅ Live job search (top 5 matches)
- ✅ Career roadmap (3-month plan)
- ✅ Streamlit UI
- 🔄 Demo deployment

### Phase 2: v1.0 (Post-hackathon, 1-2 months)

- 🔲 Urdu language support
- 🔲 Multi-round interviews (technical, HR, system design)
- 🔲 LinkedIn profile analyzer
- 🔲 Cover letter generator
- 🔲 ATS compatibility checker
- 🔲 User accounts & session history

### Phase 3: v2.0+ (SaaS, 3-6 months)

- 🔲 Company-specific interview prep
- 🔲 Salary benchmarking (Pakistan market)
- 🔲 Recruiter dashboard
- 🔲 WhatsApp bot interface
- 🔲 University partnerships

---

## 🤝 Contributing

We welcome contributions! To get started:

1. **Fork the repo** on GitHub
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make changes** and test locally
4. **Submit a Pull Request** with a clear description

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📧 Support & Questions

- 💬 **Issues**: [GitHub Issues](https://github.com/yourusername/baymax-ai/issues)
- 📧 **Email**: support@baymaxai.pk
- 🐦 **Twitter**: [@BaymaxAI](https://twitter.com/baymaxai)

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

Built for the **AI Mustaqbil 2.0 Hackathon** celebrating Pakistan's AI talent.

- Groq team for blazing-fast inference
- LangChain for agent framework
- Streamlit for rapid prototyping
- Our cohort for the coffee talks ☕

---

## 📊 Stats

- **4** specialized AI agents
- **1** multi-agent orchestration
- **100%** free API tier available
- **<1s** response time (Groq inference)
- **∞** scalability (serverless deployment ready)

---

**Ready to revolutionize career prep in Pakistan? Let's build! 🚀**

Join us on GitHub: [github.com/yourusername/baymax-ai](https://github.com/yourusername/baymax-ai)

---

## 🌐 Deploy to Streamlit Cloud

1. Push this repo to GitHub
2. Go to [share.streamlit.io](https://share.streamlit.io)
3. Connect your repo, set `app.py` as the entry point
4. Add your API keys under **Secrets** (same as `.env` format)
5. Deploy → get a public URL in 2 minutes

---

## 📚 Resources

- [Groq Docs](https://console.groq.com/docs)
- [CrewAI Docs](https://docs.crewai.com)
- [LangChain Docs](https://python.langchain.com)
- [ChromaDB Docs](https://docs.trychroma.com)
- [Streamlit Docs](https://docs.streamlit.io)
