"""
Page 8: Future Improvements & Perspectives — DNA, Telemedicine, Ethics.
"""
import streamlit as st


def render():
    st.markdown("""
    <h2 style="color:#00d4aa;font-weight:800;margin-bottom:.2rem;">🔮 Future Prospects & Research Directions</h2>
    <p style="color:#8ba4c7;margin-bottom:1.5rem;">
        The future of personalized oncology — Integrated DNA analysis, real-time telemedicine, 
        and the ethics of Human-AI collaborative diagnostics.
    </p>
    """, unsafe_allow_html=True)

    tab1, tab2, tab3 = st.tabs(["🧬 DNA & Molecular Profiling", "📡 Real-Time Telemedicine", "🤝 Ethics & Transparency"])

    # -- Tab 1: DNA & NGS -----------------------------------------------------
    with tab1:
        st.markdown("#### 🧬 DNA Analysis & Personalized Therapy via NGS + AI")
        st.markdown("""
        <div style="background:rgba(0,212,170,.07);border:1px solid rgba(0,212,170,.2);
                    border-radius:14px;padding:1.5rem;margin-bottom:1.5rem;">
            <p style="color:#c5d8f0;font-size:.9rem;line-height:1.85;margin:0;">
                Cancer is fundamentally a <strong style="color:#00d4aa;">genetic disease</strong> — 
                the result of cumulative DNA repair failures influenced by environmental factors. 
                The future lies in combining Next-Generation Sequencing (NGS) with 
                <strong style="color:#00d4aa;">Artificial Intelligence</strong> to create a unique 
                genomic profile for every patient.
            </p>
        </div>
        """, unsafe_allow_html=True)

        c1, c2 = st.columns(2)
        with c1:
            st.markdown("##### 🧪 Predictive Genomics")
            st.markdown("""
            - **BRAF V600E Mutation detection:** Guiding targeted therapies with high precision.
            - **Tumor Mutational Burden (TMB):** Predicting responsiveness to immunotherapy.
            - **Multi-omics Integration:** Combining DNA, RNA, and protein data for 360° tumor modeling.
            """)
        with c2:
            st.markdown("##### 📈 Personalized Treatment")
            st.markdown("""
            - **In-silico Drug Screening:** Testing chemical compounds against patient-specific digital twins.
            - **Toxicity Prediction:** Minimizing side effects through pharmacogenomics.
            - **Adaptive Dosing:** Real-time optimization of treatment intensity.
            """)

    # -- Tab 2: Telemedicine --------------------------------------------------
    with tab2:
        st.markdown("#### 📡 Real-Time Tele-Dermatology & Global Accessibility")
        st.markdown("""
        <div style="background:rgba(0,123,255,.07);border:1px solid rgba(0,123,255,.2);
                    border-radius:14px;padding:1.5rem;margin-bottom:1.5rem;">
            <p style="color:#c5d8f0;font-size:.9rem;line-height:1.85;margin:0;">
                Scaling specialist expertise to remote regions using <strong style="color:#007bff;">edge computing</strong> 
                and high-bandwidth satellite connectivity.
            </p>
        </div>
        """, unsafe_allow_html=True)

        cols = st.columns(3)
        features = [
            ("📱 Mobile Edge AI", "Real-time lesion pre-screening on smartphones with local inference.", "#00d4aa"),
            ("🥽 AR Assistance", "Augmented Reality overlays for primary care physicians during examinations.", "#007bff"),
            ("🌍 Global Network", "Decentralized expert consensus through low-latency collaboration tools.", "#7c3aed")
        ]
        for col, (title, desc, clr) in zip(cols, features):
            col.markdown(f"""
            <div style="background:rgba(10,22,40,.8);border-top:3px solid {clr};
                        border-radius:10px;padding:1rem;height:160px;">
                <strong style="color:{clr};font-size:.85rem;">{title}</strong>
                <p style="color:#8ba4c7;font-size:.75rem;margin-top:.4rem;">{desc}</p>
            </div>
            """, unsafe_allow_html=True)

    # -- Tab 3: Ethics --------------------------------------------------------
    with tab3:
        st.markdown("#### 🤝 Ethics, Transparency & Human Oversight")
        st.markdown("""
        <div style="background:rgba(124,58,237,.07);border:1px solid rgba(124,58,237,.2);
                    border-radius:14px;padding:1.5rem;margin-bottom:1.5rem;">
            <p style="color:#c5d8f0;font-size:.9rem;line-height:1.85;margin:0;">
                Ensuring <strong style="color:#7c3aed;">Explainable AI (XAI)</strong> and maintaining clinical 
                responsibility in the age of automated diagnostics.
            </p>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("""
        | Pillar | Strategy | Goal |
        | :--- | :--- | :--- |
        | **Explainability** | LIME / SHAP / Saliency Maps | Provide "reasons" for every AI prediction |
        | **Fairness** | Bias-aware training sets | Equal accuracy across all skin phototypes |
        | **Oversight** | Clinician-in-the-Loop | AI as a 'co-pilot', not a replacement |
        | **Data Autonomy** | Self-sovereign identity | Patients retain full control over data updates |
        """)

        st.info("""🎯 **Our Mission**: To bridge the gap between high-tech AI research and daily clinical 
                practice, ensuring technology empowers rather than marginalizes medical expertise.""")
