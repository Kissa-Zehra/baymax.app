# 📦 Baymax AI — Complete Project Structure

**Professional repository ready for team collaboration and hackathon submission.**

---

## 🎯 Project Overview

Baymax AI is a multi-agent AI career coaching platform for Pakistani CS students. Four specialized AI agents (Alex, Sam, Zara, Rahul) work together to analyze resumes, conduct mock interviews, find jobs, and build personalized career roadmaps.

**Built with:** Groq · LangChain · CrewAI · ChromaDB · Streamlit · Serper

---

## 📂 Directory Structure

```
baymax-ai/
│
├── 📋 Root Configuration Files
├── README.md              ← Start here! Project overview
├── QUICKSTART.md          ← 5-minute quick start
├── SETUP.md              ← Detailed setup & troubleshooting
├── CONTRIBUTING.md       ← Code style & contribution guide
├── CONTRIBUTORS.md       ← List of contributors
├── CHANGELOG.md          ← Version history
├── LICENSE               ← MIT License
│
├── 🔧 Development Files
├── Makefile              ← Convenient commands (make run, make help)
├── pyproject.toml        ← Package configuration & metadata
├── requirements.txt      ← Python dependencies
├── requirements-dev.txt  ← Dev tools (pytest, black, mypy, etc)
├── .editorconfig         ← Editor configuration (tabs, indents)
│
├── 🐳 Docker & Deployment
├── Dockerfile            ← Docker image definition
├── docker-compose.yml    ← Docker Compose setup
├── .dockerignore         ← Files to exclude from Docker
│
├── 🔐 Environment & Git
├── .env.example          ← Template for .env (commit this)
├── .env                  ← Your actual API keys (DO NOT commit)
├── .gitignore            ← Files to exclude from Git
│
├── 🤖 GitHub Collaboration
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml      ← Bug report form
│   │   └── feature_request.yml ← Feature request form
│   └── pull_request_template.md ← PR template
│
├── 🎯 Core Application
├── app.py                ← Streamlit web interface
├── crew.py               ← Multi-agent orchestration
├── config.py             ← Centralized configuration
├── test_groq.py          ← Quick API key test
│
├── 🧠 The Four Agents
├── agents/
│   ├── __init__.py
│   ├── resume_agent.py      ← Agent 1: Alex (Resume Analyzer)
│   ├── interview_agent.py   ← Agent 2: Sam (Interview Coach)
│   ├── job_search_agent.py  ← Agent 3: Zara (Job Matcher)
│   └── career_planner_agent.py  ← Agent 4: Rahul (Career Planner)
│
├── 🛠️ Tools & Utilities
├── tools/
│   ├── __init__.py
│   ├── pdf_tool.py         ← PDF resume extraction
│   └── search_tool.py      ← Serper API wrapper
│
├── 📚 RAG Pipeline
├── rag/
│   ├── __init__.py
│   └── pipeline.py         ← ChromaDB + embeddings
│
├── 📊 Data Storage
├── data/
│   ├── chroma_db/          ← Vector database (auto-created)
│   └── sample_jobs/        ← Sample job descriptions
│
└── 📖 Documentation
    └── docs/
        ├── ARCHITECTURE.md     ← System design & data flow
        ├── AGENTS.md           ← Detailed agent specifications
        └── API_INTEGRATION.md  ← API setup guides
```

---

## 🚀 Quick Start

### 1. Clone & Setup (2 minutes)

```bash
git clone https://github.com/yourusername/baymax-ai.git
cd baymax-ai
make setup  # or: python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

### 2. Configure (1 minute)

```bash
cp .env.example .env
# Edit .env with your API keys from:
# - Groq: https://console.groq.com (free, instant)
# - Serper: https://serper.dev (free 100 searches)
```

### 3. Run (30 seconds)

```bash
make run  # or: streamlit run app.py
```

Open **http://localhost:8501** in your browser.

---

## 📚 Documentation Map

| Document                                     | Purpose                            | Audience     |
| -------------------------------------------- | ---------------------------------- | ------------ |
| [README.md](README.md)                       | Project overview & feature summary | Everyone     |
| [QUICKSTART.md](QUICKSTART.md)               | 5-minute quick start               | New users    |
| [SETUP.md](SETUP.md)                         | Detailed setup & troubleshooting   | Setup issues |
| [CONTRIBUTING.md](CONTRIBUTING.md)           | Code style & contribution workflow | Contributors |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design & data flow          | Developers   |
| [docs/AGENTS.md](docs/AGENTS.md)             | Agent specifications & prompts     | AI engineers |

---

## 🔄 Development Workflow

### Using Make (Recommended)

```bash
make help          # See all commands
make install       # Install dependencies
make run           # Run app
make test-groq     # Test API
make lint          # Check code
make format        # Auto-format
make clean         # Clean temp files
```

### Without Make

```bash
# Manual commands
source venv/bin/activate
streamlit run app.py
python test_groq.py
pytest tests/
```

---

## 🤖 The Four Agents

| #   | Name      | File                             | Purpose                          |
| --- | --------- | -------------------------------- | -------------------------------- |
| 1   | **Alex**  | `agents/resume_agent.py`         | Resume analysis & skill matching |
| 2   | **Sam**   | `agents/interview_agent.py`      | Mock interviews & feedback       |
| 3   | **Zara**  | `agents/job_search_agent.py`     | Real job search (live web)       |
| 4   | **Rahul** | `agents/career_planner_agent.py` | 3-month career roadmap           |

---

## 🛠️ Tech Stack

### Core

- **Groq** — Ultra-fast LLM inference
- **LangChain** — Agent framework & tool calling
- **CrewAI** → **LangGraph** — Multi-agent orchestration

### Storage & Search

- **ChromaDB** — Vector database for RAG
- **Sentence Transformers** — Local embeddings
- **Serper API** — Real-time job search

### Frontend

- **Streamlit** — Web UI (no frontend coding needed)

### DevOps

- **Docker** — Containerization
- **Docker Compose** — Local development

---

## 🔐 Security Checklist

✅ **Before committing:**

- [ ] `.env` is in `.gitignore` (never commit API keys!)
- [ ] `.env.example` has placeholders only
- [ ] No hardcoded secrets in code
- [ ] `.git` folder not exposed

✅ **In production:**

- [ ] Use environment variables
- [ ] Store secrets in CI/CD pipeline
- [ ] Use `.env` files only locally

---

## 🎯 For Team Members

### Setting Up for Development

```bash
git clone [repo-url]
cd baymax-ai
make setup
cp .env.example .env
# Add your API keys to .env
make run
```

### Making Changes

```bash
git checkout -b feature/your-feature-name
# Make your changes
make format  # Auto-format code
make lint    # Check quality
git add .
git commit -m "feat: description of change"
git push origin feature/your-feature-name
# Create PR on GitHub
```

### Code Style

- Python: PEP 8 (4 spaces, max 100 chars)
- Commit messages: Conventional Commits
- Type hints required for all functions
- Docstrings required for public functions

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 🚀 Deployment Options

### Local Development

```bash
make run  # Streamlit on http://localhost:8501
```

### Docker Locally

```bash
make docker-build
make docker-run
# Opens http://localhost:8501
```

### Streamlit Cloud (Recommended)

1. Push to GitHub
2. Go to https://streamlit.io/cloud
3. Connect your GitHub repo
4. Add API keys as secrets
5. Click Deploy

### Cloud Deployment

- AWS: Use ECS + Fargate
- GCP: Use Cloud Run
- Azure: Use Container Instances
- Heroku: Works but slower

---

## 📊 Project Stats

- **4** specialized AI agents
- **3** external APIs (Groq, Serper, HuggingFace)
- **~100** lines per agent (well-structured)
- **15-20s** total pipeline execution time
- **100%** free API tier available
- **<1s** LLM inference (Groq is fast!)

---

## 🆘 Getting Help

### Documentation

- 📖 Start with [QUICKSTART.md](QUICKSTART.md)
- 🔧 Check [SETUP.md](SETUP.md) for troubleshooting
- 🏗️ See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for design

### Community

- 🐛 **Bug Report**: Open a GitHub Issue
- 💡 **Feature Request**: GitHub Issues
- 💬 **Questions**: GitHub Discussions
- 📧 **Email**: support@baymaxai.pk

### Common Issues

| Issue                  | Solution                                     |
| ---------------------- | -------------------------------------------- |
| "Module not found"     | `pip install -r requirements.txt`            |
| "GROQ_API_KEY not set" | Check `.env` has your actual key             |
| "Port 8501 in use"     | `streamlit run app.py -- --server.port 8502` |
| Slow responses         | Use `mixtral-8x7b-32768` instead of `llama`  |

---

## 📈 Project Roadmap

### MVP (Hackathon) ✅

- [x] Resume analyzer
- [x] Interview coach
- [x] Job search
- [x] Career roadmap
- [x] Streamlit UI

### v1.0 (1-2 months) 📅

- [ ] Urdu language support
- [ ] Multi-round interviews
- [ ] LinkedIn profile analyzer
- [ ] Cover letter generator
- [ ] User accounts

### v2.0+ (SaaS) 🚀

- [ ] Company-specific prep
- [ ] Salary benchmarking
- [ ] Recruiter dashboard
- [ ] WhatsApp bot
- [ ] University partnerships

---

## 🙏 Acknowledgments

Built for **AI Mustaqbil 2.0 Hackathon** celebrating Pakistan's AI talent.

- 🎁 [Groq](https://groq.com) for blazing-fast inference
- 🛠️ [LangChain](https://langchain.com) for agent framework
- 📊 [ChromaDB](https://chroma.com) for vector storage
- 🎨 [Streamlit](https://streamlit.io) for rapid prototyping
- 🔍 [Serper](https://serper.dev) for web search

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

We welcome all contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Code style guide
- Git workflow
- How to run tests
- How to submit PRs

---

**Ready to revolutionize career prep in Pakistan? Let's build together! 🚀**

Questions? Check the docs or open an issue on GitHub.
