"""
DermaGnosis — Main App Entry Point
Imports from 'modules/' (NOT 'pages/') to avoid Streamlit's auto-page-detection.
"""
import streamlit as st
import os

st.set_page_config(
    page_title="DermaGnosis | Federated AI for Melanoma Detection",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded",
)

css_path = os.path.join(os.path.dirname(__file__), "assets", "style.css")
if os.path.exists(css_path):
    with open(css_path) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

with st.sidebar:
    st.markdown("""
    <div style="text-align:center;padding:1rem 0 1.5rem;">
        <div style="font-size:3rem;">🧬</div>
        <h1 style="color:#00d4aa;font-size:1.4rem;font-weight:800;margin:.3rem 0 .1rem;">DermaGnosis</h1>
        <p style="color:#8ba4c7;font-size:.72rem;margin:0;letter-spacing:1.5px;text-transform:uppercase;">
            Federated AI · Privacy-by-Design
        </p>
    </div>
    <hr style="border-color:rgba(0,212,170,.15);margin-bottom:1rem;">
    """, unsafe_allow_html=True)

    pages = {
        "🏠 Dashboard": "dashboard",
        "🔗 FL Simulation": "fl_simulation",
        "🔒 Privacy & GDPR": "privacy_compliance",
        "🔬 Melanoma Predictor": "melanoma_predictor",
        "🏗 System Architecture (5 WF)": "architecture",
        "📊 Evaluation & Methodology": "performance",
        "⚖️ Regulatory Framework": "regulatory",
        "🔮 Future Prospects": "future",
    }

    if "page" not in st.session_state:
        st.session_state.page = "dashboard"

    for label, key in pages.items():
        active = st.session_state.page == key
        if st.button(label, use_container_width=True,
                     type="primary" if active else "secondary", key=f"nav_{key}"):
            st.session_state.page = key
            st.rerun()

    st.markdown("""
    <hr style="border-color:rgba(0,212,170,.15);margin-top:1rem;">
    <div style="font-size:.68rem;color:#8ba4c7;text-align:center;padding-top:.5rem;">
        <b style="color:#00d4aa;">v2.0.0</b> · GDPR Compliant · MDR Annex I<br>
        5-Workflow Multimodal Architecture<br><br>
        <span style="opacity:.6;">© 2026 DermaGnosis Platform</span>
    </div>
    """, unsafe_allow_html=True)

page = st.session_state.get("page", "dashboard")

if page == "dashboard":
    from modules import page_dashboard; page_dashboard.render()
elif page == "fl_simulation":
    from modules import page_fl_simulation; page_fl_simulation.render()
elif page == "privacy_compliance":
    from modules import page_privacy; page_privacy.render()
elif page == "melanoma_predictor":
    from modules import page_predictor; page_predictor.render()
elif page == "architecture":
    from modules import page_architecture; page_architecture.render()
elif page == "performance":
    from modules import page_performance; page_performance.render()
elif page == "regulatory":
    from modules import page_regulatory; page_regulatory.render()
elif page == "future":
    from modules import page_future; page_future.render()
