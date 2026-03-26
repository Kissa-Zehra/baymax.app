# Contributing to Baymax AI 🤖

We love your input! Contributing to Baymax AI helps make Pakistan's AI career ecosystem stronger. Here's how to get involved.

---

## Code of Conduct

- ✅ Be respectful and inclusive
- ✅ Assume good intent
- ✅ Welcome diverse perspectives
- ✅ Focus on constructive feedback

---

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/yourusername/baymax-ai.git
cd baymax-ai
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# Examples:
# feature/urdu-language-support
# feature/linkedin-analyzer
# fix/resume-parsing-bug
```

### 3. Set Up Development Environment

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Dev tools
```

### 4. Create `.env` from `.env.example`

```bash
cp .env.example .env
# Add your API keys to .env
```

---

## Development Workflow

### Before You Start

- 📝 Check [Issues](https://github.com/yourusername/baymax-ai/issues) for open tasks
- 💬 Comment on an issue to claim it
- 🐛 For bugs: describe steps to reproduce
- ✨ For features: describe the use case

### While You Code

```bash
# Make your changes
# Test locally:
streamlit run app.py

# Run quick tests:
python test_groq.py

# Check code style:
python -m pylint agents/ tools/ rag/
```

### Code Style Guide

#### Python Style

- Follow **PEP 8** (4-space indentation)
- Use **type hints** for function arguments
  ```python
  def analyze_resume(resume_text: str, job_title: str) -> dict:
      """Process resume against job description."""
  ```
- Write **docstrings** (Google style)
  ```python
  def get_resume_agent():
      """
      Return the ChatGroq LLM configured as the Resume Analyzer agent.

      Returns:
          ChatGroq: Configured LLM instance
      """
  ```
- Max line length: **100 characters**

#### Naming Conventions

- Variables: `snake_case` (e.g., `resume_text`)
- Classes: `PascalCase` (e.g., `ResumeAnalyzer`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `GROQ_API_KEY`)
- Private methods: `_leading_underscore` (e.g., `_process_resume()`)

#### Comments & Documentation

```python
# ── Use dash separators for section headers ────────────────
# Clear, one-line comments for "why", not "what"
# Multi-line docstrings with """ """
```

---

## Git Workflow

### Commit Messages

Follow **Conventional Commits**:

```
type(scope): description

optional body

optional footer
```

**Types:**

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code formatting
- `refactor:` Code restructure
- `perf:` Performance improvement
- `test:` Adding tests
- `chore:` Maintenance

**Examples:**

```bash
git commit -m "feat(agents): add Zara job search agent"
git commit -m "fix(resume): handle multipage PDFs correctly"
git commit -m "docs: add QuickStart section to README"
git commit -m "refactor(config): move API keys to config.py"
```

### Pushing & Pull Requests

```bash
git add .
git commit -m "feat(agent): description"
git push origin feature/your-feature-name
```

Then on GitHub:

1. Create a **Pull Request** (PR)
2. Fill the PR template
3. Wait for code review
4. Address feedback
5. Merge once approved

**PR Title Format:**

```
[scope] Short description

Example:
[agents] Add career roadmap planner (Rahul - Agent 4)
[docs] Add API integration guide
[fix] Handle empty resume gracefully
```

---

## Testing

### Manual Testing

```bash
# Test the full pipeline
streamlit run app.py
# Upload a sample resume, enter job title, verify all agents run

# Test individual agents
python -c "from agents.resume_agent import analyze_resume; print(analyze_resume('...'))"

# Test API keys
python test_groq.py
```

### Adding Tests (Future)

When we add pytest:

```bash
pytest tests/
pytest tests/agents/test_resume_agent.py -v
```

---

## Common Tasks

### Adding a New Agent

```
1. Create agents/new_agent_name.py
2. Define system prompt
3. Implement agent function
4. Add to crew.py orchestration
5. Test in app.py
6. Update docs/AGENTS.md
```

**Example structure:**

```python
"""agents/new_agent.py — Agent Name description"""
from langchain_groq import ChatGroq
from config import GROQ_API_KEY, GROQ_MODEL

NEW_AGENT_SYSTEM_PROMPT = """You are [Agent name]..."""

def get_new_agent_llm():
    return ChatGroq(
        api_key=GROQ_API_KEY,
        model=GROQ_MODEL,
        temperature=0.3,
    )

def your_agent_function(input_param: str) -> str:
    """Process input and return result."""
    llm = get_new_agent_llm()
    # Implementation here
```

### Adding a New Tool

```
1. Create tools/new_tool.py
2. Implement tool function with docstring
3. Add to appropriate agent
4. Test the tool
5. Document in docs/
```

### Updating Documentation

```bash
# Edit markdown files in /docs or root
# Use clear headings and code blocks
# Include examples where possible
# Test links to ensure they work
```

---

## Troubleshooting During Development

### API Key Issues

```
Error: "GROQ_API_KEY not set"
→ cp .env.example .env
→ Add your actual key to .env
→ Restart the Streamlit app
```

### Import Errors

```
Error: "ModuleNotFoundError: No module named 'langchain_groq'"
→ pip install -r requirements.txt
→ Verify you're in the virtual environment: source venv/bin/activate
```

### ChromaDB Issues

```
Error: "chroma_db path not found"
→ Let it auto-create: app will create data/chroma_db/ on first run
→ Or manually: mkdir -p data/chroma_db
```

### Streamlit Cache Issues

```
Error: App not reflecting code changes
→ Press 'R' in Streamlit UI to rerun
→ Or restart: Ctrl+C then streamlit run app.py
```

---

## Review Process

### What We Look For

✅ **Code Quality**

- Follows style guide
- Type hints present
- Docstrings clear
- No hardcoded values

✅ **Functionality**

- Feature works as described
- Tested on multiple inputs
- No breaking changes to existing code

✅ **Documentation**

- README updated if needed
- Inline comments explain "why"
- Docstrings present

✅ **Performance**

- No obvious inefficiencies
- Reasonable API call usage
- Handles errors gracefully

### Review Checklist (For Reviewers)

- [ ] Code follows style guide
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No conflicts with main
- [ ] Performance acceptable

---

## Getting Help

### Questions?

- 📖 Check [SETUP.md](SETUP.md) first
- 💬 Open a [GitHub Discussion](https://github.com/yourusername/baymax-ai/discussions)
- 📧 Email: dev@baymaxai.pk

### Found a Bug?

1. Search existing issues
2. Open a new issue with:
   - Current behavior
   - Expected behavior
   - Steps to reproduce
   - Environment info (Python version, OS)

---

## Recognition 🌟

All contributors are will be:

- Listed in [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Thanked in release notes
- Featured in project README

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thanks for contributing to Baymax AI! Together, we're building the future of AI-powered career development in Pakistan. 🚀**
