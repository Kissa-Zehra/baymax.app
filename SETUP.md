# 🛠️ Baymax AI Setup Guide

Complete step-by-step guide for getting Baymax AI up and running.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation (5 min)](#installation)
3. [API Keys Setup](#api-keys-setup)
4. [Verification & Testing](#verification--testing)
5. [Troubleshooting](#troubleshooting)
6. [Advanced Configuration](#advanced-configuration)

---

## System Requirements

**Minimum:**

- Python 3.10+ (check: `python --version`)
- Git (check: `git --version`)
- 2GB RAM (for embeddings model)
- ~500MB disk space

**Recommended:**

- Python 3.11+
- 4GB+ RAM
- MacOS/Linux (Windows works but WSL2 recommended)
- Active internet connection (for API calls)

**Verify Python:**

```bash
python --version  # Should show 3.10+
which python      # Should show path to correct Python
```

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/baymax-ai.git
cd baymax-ai
```

### Step 2: Create Virtual Environment

**Mac/Linux:**

```bash
python -m venv venv
source venv/bin/activate
```

**Windows (PowerShell):**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**

```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**Verify activation:**

- You should see `(venv)` at the start of your terminal prompt
- `which python` should show path ending with `venv/bin/python`

### Step 3: Install Dependencies

```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

**This installs:**

- `groq` + `langchain-groq` (LLM framework)
- `langchain` + `langgraph` (orchestration)
- `chromadb` + `sentence-transformers` (RAG & embeddings)
- `streamlit` (web UI)
- `requests` + `httpx` (HTTP)
- `pypdf2` + `pypdf` (PDF parsing)
- `python-dotenv` (env vars)

**Expected time:** 2-3 minutes

### Step 4: Create `.env` File

```bash
cp .env.example .env
```

Now open `.env` with your editor:

```
GROQ_API_KEY=paste_your_key_here
SERPER_API_KEY=paste_your_key_here
```

⚠️ **Never commit `.env` with real keys!** It's protected by `.gitignore`.

---

## API Keys Setup

### 1. Groq API Key (Required)

**Get Key in 2 minutes:**

1. Go to https://console.groq.com
2. Click "Sign Up" (free, no credit card)
3. Verify email
4. Go to API Keys page
5. Create new API key
6. Copy paste to `.env`

**Test immediately:**

```bash
python test_groq.py
```

Expected output:

```
Groq is working!
```

### 2. Serper API Key (Recommended for job search)

**Get Key in 1 minute:**

1. Go to https://serper.dev
2. Sign up (Google account quick)
3. Copy API key from dashboard
4. Paste to `.env` as `SERPER_API_KEY`

**Get 100 free searches** per month.

**Without Serper?**

- You can still use Baymax AI
- Job search agent will show a warning
- Other 3 agents work normally

---

## Verification & Testing

### Quick Test 1: Python Environment

```bash
python -c "import sys; print(f'Python {sys.version}')"
```

Should show Python 3.10+.

### Quick Test 2: Dependencies

```bash
python -c "import streamlit, langchain, chromadb; print('✅ All packages installed')"
```

### Quick Test 3: Groq API

```bash
python test_groq.py
```

Expected output:

```
✅ Groq is working!
```

If you get an error:

- Check `.env` has correct `GROQ_API_KEY`
- Verify no extra spaces around the key
- Try: `cat .env | grep GROQ`

### Quick Test 4: Launch App

```bash
streamlit run app.py
```

Expected output:

```
  You can now view your Streamlit app in your browser.

  Local URL: http://localhost:8501
  Network URL: http://192.168.x.x:8501
```

Open http://localhost:8501 in your browser.

---

## Troubleshooting

### Problem: "ModuleNotFoundError: No module named 'streamlit'"

**Solution:**

```bash
# Ensure venv is activated (you should see (venv) in prompt)
source venv/bin/activate  # Mac/Linux
# OR
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Problem: "GROQ_API_KEY not set"

**Solution:**

1. Check `.env` exists: `ls -la .env`
2. Check it has your key: `cat .env`
3. Make sure no extra spaces: `GROQ_API_KEY=key_here` (not `GROQ_API_KEY = key_here`)
4. Restart app: Ctrl+C then `streamlit run app.py`

### Problem: "Could not locate Chroma settings"

**Solution:**

```bash
# Create data directory
mkdir -p data/chroma_db

# App will auto-initialize ChromaDB on first run
streamlit run app.py
```

### Problem: PDF Upload Fails

**Solution:**

```bash
# Ensure PyPDF2 is installed
pip install PyPDF2 --upgrade

# Try a different PDF file
# Check PDF isn't corrupted: open it in your PDF reader first
```

### Problem: Slow API Responses

**Likely cause:** Using `llama-3.3-70b-versatile` (smarter but slower)

**Solution:**
In `.env`, change to faster model:

```
GROQ_MODEL=mixtral-8x7b-32768
```

Then restart app.

### Problem: "Connection refused" or "Network error"

**Likely cause:** Internet not available or firewall blocking

**Solution:**

```bash
# Test internet
curl https://api.groq.com/health

# If behind corporate firewall, ask IT for proxy settings
```

---

## Advanced Configuration

### Custom Groq Model

**Available models:**

```
# Smart (recommended for analysis)
llama-3.3-70b-versatile

# Fast (recommended for interviews)
mixtral-8x7b-32768

# Other options
gemma-7b-it
```

Set in `.env`:

```
GROQ_MODEL=your_model_name
```

### Custom Embeddings Model

**Available models:**

- `all-MiniLM-L6-v2` (default, fast, good quality)
- `all-mpnet-base-v2` (slower, better quality)
- `all-distilroberta-v1` (balanced)

Set in `.env`:

```
EMBEDDING_MODEL=all-mpnet-base-v2
```

First run will download model (~100MB).

### Debug Mode

Enable detailed logging:

```
DEBUG=true
```

This will print:

- LLM prompts
- API call details
- Agent state transitions

### ChromaDB Persistence

By default, stores in `./data/chroma_db/`.

To use different location:

```
CHROMA_PERSIST_DIR=/path/to/your/db
```

To reset ChromaDB:

```bash
rm -rf data/chroma_db/
# App will recreate on next run
```

---

## Docker Setup (Optional)

**If you don't want to manage venv:**

```bash
# Build image
docker build -t baymax-ai .

# Run container
docker run -p 8501:8501 \
  -e GROQ_API_KEY=your_key \
  -e SERPER_API_KEY=your_key \
  baymax-ai
```

Open http://localhost:8501.

---

## Production Deployment

### Streamlit Cloud (Free, Recommended)

1. Push code to GitHub
2. Go to https://streamlit.io/cloud
3. Connect GitHub repo
4. Add API keys as secrets
5. Deploy with one click

See [Streamlit Cloud docs](https://docs.streamlit.io/streamlit-cloud).

### AWS / Heroku / GCP

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for cloud setup guides.

---

## Next Steps

✅ Installation complete!

**What to do now:**

1. Try uploading a sample resume in the app
2. Run the mock interview
3. Check job search results
4. View your career roadmap

**Learn more:**

- [README.md](README.md) — Project overview
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — System design
- [docs/AGENTS.md](docs/AGENTS.md) — Agent specifications
- [CONTRIBUTING.md](CONTRIBUTING.md) — How to contribute

---

## Getting Help

- 📖 **Documentation**: Check [README.md](README.md) and docs/
- 🐛 **Bug Report**: Open issue on GitHub
- 💬 **Questions**: Post in GitHub Discussions
- 📧 **Email**: support@baymaxai.pk

---

**Ready to build your career with Baymax AI? Let's go! 🚀**
