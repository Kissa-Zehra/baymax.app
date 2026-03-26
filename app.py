"""
app.py — Baymax AI · Streamlit Frontend

Run with:  streamlit run app.py
"""
import time
import streamlit as st
from config import validate_keys, APP_TITLE
from tools.pdf_tool import extract_text_from_pdf
from crew import run_pipeline as build_crew

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title=APP_TITLE,
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    .stApp { background-color: #050810; }
    .main-title {
        font-size: 2.5rem;
        font-weight: 800;
        background: linear-gradient(90deg, #00d4ff, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0;
    }
    .section-card {
        background: #0c1120;
        border: 1px solid #1e2d4a;
        border-radius: 12px;
        padding: 20px;
        margin: 12px 0;
    }
    .agent-badge {
        display: inline-block;
        background: rgba(0,212,255,0.1);
        border: 1px solid rgba(0,212,255,0.3);
        color: #00d4ff;
        padding: 3px 10px;
        border-radius: 100px;
        font-size: 12px;
        margin-bottom: 8px;
    }
</style>
""", unsafe_allow_html=True)

# ── Sidebar ───────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## ⚙️ Configuration")

    missing = validate_keys()
    if missing:
        st.error(f"Missing API keys:\n" + "\n".join(f"• {k}" for k in missing))
        st.info("Add keys to your `.env` file and restart.")
    else:
        st.success("✅ All API keys loaded")

    st.divider()
    st.markdown("### 🤖 Agents")
    st.markdown("""
    - **Alex** — Resume Analyst
    - **Sam** — Interview Coach
    - **Zara** — Job Matcher
    - **Rahul** — Career Planner
    """)
    st.divider()
    st.markdown("### 📊 Stack")
    st.markdown("Groq · LangChain · CrewAI · ChromaDB · Streamlit")

# ── Main layout ───────────────────────────────────────────────────────────────
st.markdown('<div class="main-title">🤖 JobPrep AI</div>', unsafe_allow_html=True)
st.markdown("**Pakistan's First AI Interview & Career Coach Agent** — powered by Groq ⚡")
st.divider()

# ── Input section ─────────────────────────────────────────────────────────────
col1, col2 = st.columns([1, 1])

with col1:
    st.markdown("#### 📄 Upload Your Resume")
    resume_file = st.file_uploader(
        "Upload a PDF resume",
        type=["pdf"],
        help="Your resume will be analyzed by Alex the Resume Analyst",
    )

with col2:
    st.markdown("#### 🎯 Target Role")
    job_title = st.text_input(
        "What job are you targeting?",
        placeholder="e.g. Backend Engineer at a fintech startup",
    )

st.markdown("#### 💬 Interview Answers (Optional)")
candidate_answers = st.text_area(
    "Paste your answers to interview questions here (or leave blank to get questions generated)",
    height=120,
    placeholder="Q1 answer... Q2 answer...",
)

st.divider()

# ── Run button ────────────────────────────────────────────────────────────────
run_disabled = not resume_file or not job_title
if st.button(
    "🚀 Run JobPrep AI Analysis",
    disabled=run_disabled,
    use_container_width=True,
    type="primary",
):
    status_box = st.empty()
    progress = st.progress(0)
    start = time.time()
    resume_text = extract_text_from_pdf(resume_file)

    try:
        status_box.info("🔍 Alex is analyzing your resume...")
        progress.progress(10)

        results = build_crew(
            resume_text=resume_text,
            job_title=job_title,
            candidate_answers=candidate_answers,
        )
        progress.progress(100)
        status_box.empty()
        elapsed = time.time() - start
        st.success(f"✅ Analysis complete in {elapsed:.1f}s (Groq ⚡ is fast!)")
    except Exception as e:
        st.error(f"❌ Error: {str(e)}")
        st.stop()

    # ── Results tabs ───────────────────────────────────────────────────────────
    tab1, tab2, tab3, tab4 = st.tabs([
        "📋 Resume Analysis",
        "🎤 Interview Report",
        "💼 Job Matches",
        "🗺️ Career Roadmap",
    ])

    with tab1:
        st.markdown("#### Alex's Resume Analysis")
        st.markdown(results["resume_analysis"])

    with tab2:
        st.markdown("#### Sam's Interview Report")
        st.markdown(results["interview_report"])

    with tab3:
        st.markdown("#### Zara's Job Matches")
        st.markdown(results["job_matches"])

    with tab4:
        st.markdown("#### Rahul's Career Roadmap")
        st.markdown(results["career_roadmap"])

elif run_disabled:
    st.info("👆 Upload a resume and enter a job title to get started.")
