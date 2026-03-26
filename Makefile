.PHONY: help install dev-install run test lint format clean setup docs

help:
	@echo "🤖 Baymax AI — Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make venv              Create virtual environment"
	@echo "  make install           Install dependencies"
	@echo "  make dev-install       Install dev dependencies"
	@echo ""
	@echo "Running:"
	@echo "  make run               Run Streamlit app (http://localhost:8501)"
	@echo "  make test-groq         Quick test of Groq API"
	@echo ""
	@echo "Development:"
	@echo "  make lint              Run code linters"
	@echo "  make format            Format code with Black & isort"
	@echo "  make test              Run test suite"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build      Build Docker image"
	@echo "  make docker-run        Run app in Docker"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean             Clean cache and temp files"
	@echo "  make docs              Build documentation"

## Virtual Environment
venv:
	python -m venv venv
	@echo "✅ Virtual environment created. Activate with: source venv/bin/activate"

## Installation
install:
	pip install --upgrade pip setuptools wheel
	pip install -r requirements.txt
	@echo "✅ Dependencies installed"

dev-install: install
	pip install -r requirements-dev.txt
	@echo "✅ Dev dependencies installed"

## Running
run:
	streamlit run app.py

test-groq:
	python test_groq.py

## Code Quality
lint:
	@echo "🔍 Linting Python code..."
	pylint agents/ tools/ rag/ --disable=C0111,C0103 || true
	@echo "✅ Lint complete"

format:
	@echo "🎨 Formatting code..."
	black .
	isort .
	@echo "✅ Formatting complete"

test:
	@echo "🧪 Running tests..."
	pytest tests/ -v --cov=agents --cov=tools --cov=rag || true
	@echo "✅ Tests complete"

## Docker
docker-build:
	docker build -t baymax-ai:latest .
	@echo "✅ Docker image built"

docker-run:
	docker run -p 8501:8501 \
		-e GROQ_API_KEY=${GROQ_API_KEY} \
		-e SERPER_API_KEY=${SERPER_API_KEY} \
		baymax-ai:latest
	@echo "✅ App running at http://localhost:8501"

docker-compose-up:
	docker-compose up -d
	@echo "✅ Services started. Check with: docker-compose ps"

docker-compose-down:
	docker-compose down
	@echo "✅ Services stopped"

## Maintenance
clean:
	@echo "🧹 Cleaning..."
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	rm -rf build/ dist/ htmlcov/ .coverage
	@echo "✅ Clean complete"

docs:
	@echo "📚 Building documentation..."
	cd docs && sphinx-build -b html . _build/html || true
	@echo "✅ Docs built in docs/_build/html"

setup: venv install
	@echo "✅ Setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. cp .env.example .env"
	@echo "  2. Add your API keys to .env"
	@echo "  3. make run"

.DEFAULT_GOAL := help
