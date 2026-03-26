# Quick Start Guide — Baymax AI

**TL;DR — Get running in 5 minutes:**

```bash
# 1. Clone & navigate
git clone https://github.com/yourusername/baymax-ai.git
cd baymax-ai

# 2. Setup (one command!)
make setup

# 3. Configure
cp .env.example .env
# Edit .env with your Groq & Serper API keys

# 4. Run
make run

# Done! Open http://localhost:8501
```

---

## Using Make Commands

```bash
make help          # See all available commands
make install       # Install dependencies
make run           # Run the app
make test-groq     # Test API key
make lint          # Check code quality
make format        # Auto-format code
make clean         # Clean temp files
make docker-build  # Build Docker image
```

---

## Without Make

```bash
# Manual setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env
streamlit run app.py
```

---

## Quick Troubleshooting

| Problem                | Solution                                              |
| ---------------------- | ----------------------------------------------------- |
| "Module not found"     | `pip install -r requirements.txt`                     |
| "GROQ_API_KEY not set" | Check `.env` has your actual key                      |
| App won't start        | `make clean` then `make run`                          |
| Slow responses         | Change `GROQ_MODEL` to `mixtral-8x7b-32768` in `.env` |

---

## Next Steps

1. ✅ Check [SETUP.md](SETUP.md) for detailed setup
2. ✅ Read [README.md](README.md) for project overview
3. ✅ See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
4. ✅ Explore [docs/](docs/) for architecture & agents

---

**Need help?** Open an issue or email support@baymaxai.pk
