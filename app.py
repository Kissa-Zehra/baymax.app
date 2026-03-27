"""
app.py — Baymax AI · Streamlit Frontend

Run with:  streamlit run app.py
"""
import time
import streamlit as st
from config import validate_keys, APP_TITLE
from tools.pdf_tool import extract_text_from_pdf
from crew import run_pipeline as build_crew
from agents.interview_agent import start_interview, evaluate_answer, transcribe_audio

# Optional: voice recording (degrade gracefully if not installed)
try:
    from audiorecorder import audiorecorder as _audiorecorder
    VOICE_ENABLED = True
except ImportError:
    VOICE_ENABLED = False

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
    .sam-bubble {
        background: linear-gradient(135deg, #1e2d4a 0%, #0c1120 100%);
        border: 1px solid rgba(0,212,255,0.3);
        border-radius: 16px;
        padding: 20px 24px;
        margin-bottom: 20px;
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
    st.markdown("Groq · LangChain · ChromaDB · Streamlit")


# ── Live Interview Tab ────────────────────────────────────────────────────────
def render_interview_tab(job_title: str, resume_summary: str):
    """
    Renders Sam's multi-turn live interview experience inside tab2.
    Session state keys are prefixed with 'iv_' to avoid collisions.
    """
    # ── Init session state ────────────────────────────────────────────────────
    for key, default in {
        "iv_history": [],
        "iv_started": False,
        "iv_question_num": 0,
        "iv_current_q": "",
        "iv_scores": [],
        "iv_done": False,
    }.items():
        if key not in st.session_state:
            st.session_state[key] = default

    st.markdown("## 🎤 Live Mock Interview with Sam")
    st.markdown(f"*Role: **{job_title}***")

    if not VOICE_ENABLED:
        st.caption("ℹ️ Voice input unavailable — install `streamlit-audiorecorder` to enable microphone recording.")

    col_main, col_tracker = st.columns([2, 1])

    with col_tracker:
        # ── Score tracker ─────────────────────────────────────────────────────
        st.markdown("### 📊 Your Progress")
        if st.session_state["iv_scores"]:
            avg = sum(st.session_state["iv_scores"]) / len(st.session_state["iv_scores"])
            st.metric("Average Score", f"{avg:.1f}/10")
            st.markdown(f"**Questions done:** {st.session_state['iv_question_num'] - 1} / 8")
            scores = st.session_state["iv_scores"]
            score_rows = "\n".join(
                f"Q{i+1}: {'🟢' if s >= 7 else '🟡' if s >= 5 else '🔴'} {s}/10"
                for i, s in enumerate(scores)
            )
            st.text(score_rows)
        else:
            st.caption("Scores will appear after each answer.")

        st.divider()
        if st.button("🔄 Reset Interview", use_container_width=True):
            for key in ["iv_history", "iv_started", "iv_question_num", "iv_current_q", "iv_scores", "iv_done"]:
                st.session_state.pop(key, None)
            st.rerun()

    with col_main:
        # ── Phase: Not started ────────────────────────────────────────────────
        if not st.session_state["iv_started"]:
            st.markdown("""
            **How it works:**
            1. Click Start — Sam will ask you a question
            2. Type (or record) your answer
            3. Submit — get instant feedback + score
            4. Repeat for 8 questions
            5. See your final score summary
            """)
            if st.button("🚀 Start Interview with Sam →", type="primary", use_container_width=True):
                with st.spinner("Sam is getting ready for you..."):
                    try:
                        result = start_interview(job_title, resume_summary)
                        q = result.get("question", result.get("follow_up_or_next", "Tell me about yourself."))
                        st.session_state["iv_current_q"] = q
                        st.session_state["iv_started"] = True
                        st.session_state["iv_question_num"] = 1
                        st.session_state["iv_history"].append({"role": "assistant", "content": q})
                    except Exception as e:
                        st.error(f"Sam couldn't start the interview: {e}")
                st.rerun()

        # ── Phase: Done ───────────────────────────────────────────────────────
        elif st.session_state["iv_done"]:
            scores = st.session_state["iv_scores"]
            avg = sum(scores) / len(scores) if scores else 0
            grade = "Excellent 🏆" if avg >= 8 else "Good 👍" if avg >= 6 else "Keep Practicing 💪"

            st.markdown(
                f"""
                <div style="text-align:center; padding:30px 0;">
                    <div style="font-size:3rem;">{'🏆' if avg >= 8 else '👍' if avg >= 6 else '💪'}</div>
                    <h2>Interview Complete!</h2>
                    <h3 style="color:#00d4ff;">Final Score: {avg:.1f}/10 — {grade}</h3>
                </div>
                """,
                unsafe_allow_html=True,
            )

            if st.button("🔄 Try Another Round", use_container_width=True):
                for key in ["iv_history", "iv_started", "iv_question_num", "iv_current_q", "iv_scores", "iv_done"]:
                    st.session_state.pop(key, None)
                st.rerun()

        # ── Phase: Active interview ───────────────────────────────────────────
        else:
            # Progress bar
            q_num = st.session_state["iv_question_num"]
            st.progress(min(q_num / 8, 1.0), text=f"Question {q_num} of 8")

            # Sam's question bubble
            st.markdown(
                f"""
                <div class="sam-bubble">
                    <div style="color:#00d4ff; font-size:0.75rem; font-weight:600; margin-bottom:8px;">🤖 SAM ASKS</div>
                    <p style="font-size:1.1em; margin:0; line-height:1.6;">{st.session_state['iv_current_q']}</p>
                </div>
                """,
                unsafe_allow_html=True,
            )

            # Voice recording (optional)
            audio_bytes = None
            if VOICE_ENABLED:
                st.markdown("**🎙️ Record your answer:**")
                audio = _audiorecorder("🔴 Record", "⏹️ Stop")
                if len(audio) > 0:
                    audio_bytes = audio.export().read()
                    st.success("Audio captured — click Submit to transcribe & send.")

            # Text answer
            text_answer = st.text_area(
                "Your answer:" if not VOICE_ENABLED else "Or type instead:",
                placeholder="Type your answer here...",
                height=120,
                key=f"answer_q{q_num}",
            )

            if st.button("✅ Submit Answer", type="primary", use_container_width=True):
                final_answer = text_answer

                # Transcribe voice if captured
                if audio_bytes:
                    with st.spinner("🎙️ Transcribing..."):
                        try:
                            final_answer = transcribe_audio(audio_bytes)
                            st.success(f"🎙️ Heard: *{final_answer}*")
                        except Exception as e:
                            st.warning(f"Transcription failed, using typed answer. ({e})")

                if not final_answer.strip():
                    st.warning("Please type or record an answer first.")
                else:
                    st.session_state["iv_history"].append({"role": "user", "content": final_answer})

                    with st.spinner("Sam is thinking..."):
                        try:
                            result = evaluate_answer(
                                job_title=job_title,
                                conversation_history=st.session_state["iv_history"],
                                latest_answer=final_answer,
                                question_num=q_num,
                                total_questions=8,
                            )
                            feedback = result.get("feedback", "Good answer!")
                            score = result.get("score", 7)
                            next_q = result.get("follow_up_or_next", "")

                            st.session_state["iv_scores"].append(score)
                            st.session_state["iv_question_num"] += 1
                            st.session_state["iv_history"].append(
                                {"role": "assistant", "content": f"Feedback: {feedback}\n\nNext: {next_q}"}
                            )

                            # Score feedback
                            color = "#10b981" if score >= 7 else "#f59e0b" if score >= 5 else "#ef4444"
                            st.markdown(
                                f"""
                                <div style="border-left:4px solid {color}; padding:12px 16px; margin:16px 0; background:rgba(255,255,255,0.03); border-radius:0 8px 8px 0;">
                                    <div style="color:{color}; font-weight:700; margin-bottom:4px;">Score: {score}/10</div>
                                    <div style="color:#ccc;">{feedback}</div>
                                </div>
                                """,
                                unsafe_allow_html=True,
                            )

                            # Check if done
                            if q_num >= 8 or not next_q:
                                st.session_state["iv_done"] = True
                            else:
                                st.session_state["iv_current_q"] = next_q

                        except Exception as e:
                            st.error(f"Sam encountered an error: {e}")

                    st.rerun()


# ── Main layout ───────────────────────────────────────────────────────────────
st.markdown('<div class="main-title">🤖 Baymax AI</div>', unsafe_allow_html=True)
st.markdown("**Pakistan's First AI Interview & Career Coach** — powered by Groq ⚡")
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
    "🚀 Run Baymax AI Analysis",
    disabled=run_disabled,
    use_container_width=True,
    type="primary",
):
    status_box = st.empty()
    progress_bar = st.progress(0)
    start = time.time()
    resume_text = extract_text_from_pdf(resume_file)

    def on_progress(pct: int, msg: str):
        status_box.info(msg)
        progress_bar.progress(pct)

    try:
        results = build_crew(
            resume_text=resume_text,
            job_title=job_title,
            candidate_answers=candidate_answers,
            on_progress=on_progress,
        )
        progress_bar.progress(100)
        status_box.empty()
        elapsed = time.time() - start
        st.success(f"✅ Analysis complete in {elapsed:.1f}s (Groq ⚡ is fast!)")

        # Show any pipeline errors/warnings
        if results.get("errors"):
            for err in results["errors"]:
                st.warning(err)

    except Exception as e:
        st.error(f"❌ Error: {str(e)}")
        st.stop()

    # ── Results tabs ───────────────────────────────────────────────────────────
    tab1, tab2, tab3, tab4 = st.tabs([
        "📋 Resume Analysis",
        "🎤 Live Interview",
        "💼 Job Matches",
        "🗺️ Career Roadmap",
    ])

    with tab1:
        st.markdown("#### Alex's Resume Analysis")
        st.markdown(results["resume_analysis"])

    with tab2:
        # Multi-turn live interview with Sam
        resume_summary = results.get("resume_analysis", "")[:600]
        render_interview_tab(job_title, resume_summary)

    with tab3:
        st.markdown("#### Zara's Job Matches")
        st.markdown(results["job_matches"])

    with tab4:
        st.markdown("#### Rahul's Career Roadmap")
        st.markdown(results["career_roadmap"])

elif run_disabled:
    st.info("👆 Upload a resume and enter a job title to get started.")
