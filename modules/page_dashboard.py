"""
Page 1: Dashboard — Problem context, mission, 5-workflow overview.
Upgraded to Advanced MVP Command Center.
"""
import streamlit as st
import plotly.graph_objects as go
import numpy as np


def render():
    st.markdown("""
    <div style="background:linear-gradient(135deg,rgba(0,212,170,.10),rgba(0,123,255,.08));
                border:1px solid rgba(0,212,170,.2);border-radius:20px;padding:2.5rem 2rem;
                margin-bottom:2rem;text-align:center;">
        <div style="font-size:.8rem;letter-spacing:3px;color:#00d4aa;text-transform:uppercase;font-weight:600;margin-bottom:.5rem;">
            🧬 Federated Learning · Multimodal AI · GDPR Art. 25 · MDR Annex I
        </div>
        <h1 style="font-size:2.8rem;font-weight:900;margin:.3rem 0;
                   background:linear-gradient(135deg,#00d4aa,#007bff,#7c3aed);
                   -webkit-background-clip:text;-webkit-text-fill-color:transparent;">DermaGnosis</h1>
        <p style="font-size:1rem;color:#8ba4c7;max-width:720px;margin:.8rem auto 0;line-height:1.8;">
            Integrated architecture for <strong style="color:#00d4aa;">multimodal AI</strong>
            (Computer Vision + Radiomics + NLP + Bayesian Federated Learning)
            on multi-cloud infrastructure — <strong style="color:#f59e0b;">PHI never leaves the hospital</strong>.
        </p>
    </div>
    """, unsafe_allow_html=True)

    # ── System Health / Engine Status ────────────────────────────────────────
    st.markdown("### 🖥️ System Status (Advanced MVP Core)")
    
    col_status1, col_status2, col_status3, col_status4 = st.columns(4)
    
    engines = [
        (col_status1, "🖼 Image Pipeline", "LoG/DoG/GLCM Engine", "Active"),
        (col_status2, "🧠 Bayesian Network", "MAP Inference Engine", "Active"),
        (col_status3, "📝 NLP Processor", "Clinical Entity Extractor", "Active"),
        (col_status4, "📡 FL Coordinator", "FedAvg + DP Engine", "Waiting")
    ]
    
    for col, name, desc, status in engines:
        clr = "#00d4aa" if status == "Active" else "#7c3aed"
        col.markdown(f"""
        <div style="background:rgba(10,22,40,.8);border:1px solid {clr}33;border-radius:12px;padding:1rem;text-align:center;">
            <div style="color:{clr};font-size:.85rem;font-weight:700;margin-bottom:.3rem;">{name}</div>
            <div style="color:#8ba4c7;font-size:.7rem;margin-bottom:.5rem;">{desc}</div>
            <div style="background:{clr}22;color:{clr};font-size:.6rem;font-weight:800;padding:2px 8px;border-radius:10px;display:inline-block;">{status.upper()}</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── The Problem ──────────────────────────────────────────────────────────
    st.markdown("### ⚠️ The Problem: Delayed Cancer Diagnosis")
    st.markdown("""
    <div style="background:rgba(244,63,94,.07);border:1px solid rgba(244,63,94,.25);
                border-radius:14px;padding:1.5rem;margin-bottom:1.5rem;">
        <p style="color:#c5d8f0;font-size:.9rem;line-height:1.9;margin:0;">
            Cancer remains a <strong style="color:#f43f5e;">leading cause of mortality worldwide</strong> — 
            often detected only once it reaches metastatic stages, as early stages are frequently 
            <strong style="color:#f43f5e;">asymptomatic</strong> and difficult to identify even by specialists. 
            2020 statistics highlight the scale:
        </p>
    </div>
    """, unsafe_allow_html=True)

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("🫁 Lung Cancer", "1.8M", "new cases / year", delta_color="off")
    c2.metric("🎀 Breast Cancer", "2.3M", "new cases / year", delta_color="off")
    c3.metric("🩺 Skin Melanoma", "324K", "new cases / year", delta_color="off")
    c4.metric("💊 5-Year Survival", ">92%", "if detected early", delta_color="off")

    st.markdown("<br>", unsafe_allow_html=True)

    # ── The Solution ─────────────────────────────────────────────────────────
    st.markdown("### 💡 The Solution: Multimodal AI + Federated Learning")
    col_l, col_r = st.columns([1, 1], gap="large")

    with col_l:
        ai_items = [
            ("🧠", "#00d4aa", "CNN / Deep Learning",
             "Autonomous melanoma detection from dermoscopic images via Computer Vision & Radiomics (GLCM, LoG, DoG, Hessian-LoG)."),
            ("🕸", "#007bff", "Bayesian Networks + MAP",
             "Uncertainty management under clinical conditions. Integration of prior clinical knowledge with new patient data for progression prediction."),
            ("📝", "#7c3aed", "NLP — Electronic Health Records",
             "Clinical entity extraction (diseases, drugs, lab results) from EHR & medical notes."),
            ("🔗", "#f59e0b", "Federated Learning",
             "Distributed training. PHI remains local — only model parameters are transmitted via secure APIs."),
        ]
        html = '<div style="background:rgba(10,22,40,.85);border:1px solid rgba(0,212,170,.15);border-radius:16px;padding:1.5rem;">'
        for icon, clr, title, desc in ai_items:
            html += f"""
            <div style="display:flex;align-items:flex-start;gap:.8rem;margin-bottom:1rem;">
                <span style="font-size:1.2rem;flex-shrink:0;">{icon}</span>
                <div>
                    <strong style="color:{clr};font-size:.88rem;">{title}</strong>
                    <p style="color:#8ba4c7;font-size:.78rem;margin:.2rem 0 0;line-height:1.5;">{desc}</p>
                </div>
            </div>"""
        html += '</div>'
        st.markdown(html, unsafe_allow_html=True)

    with col_r:
        categories = ["GDPR Compliance", "Diagnostic Accuracy", "Privacy", "Generalizability", "Clinical Readiness", "MDR"]
        fig = go.Figure()
        fig.add_trace(go.Scatterpolar(
            r=[98, 86, 95, 92, 88, 90, 98], theta=categories + [categories[0]],
            fill='toself', name='DermaGnosis FL', line_color='#00d4aa', fillcolor='rgba(0,212,170,.12)'))
        fig.add_trace(go.Scatterpolar(
            r=[30, 89, 25, 78, 72, 45, 30], theta=categories + [categories[0]],
            fill='toself', name='Centralized Model', line_color='#f43f5e', fillcolor='rgba(244,63,94,.08)'))
        fig.update_layout(
            polar=dict(bgcolor='rgba(10,22,40,.6)',
                radialaxis=dict(visible=True, range=[0, 100], color='#8ba4c7', gridcolor='rgba(139,164,199,.08)'),
                angularaxis=dict(color='#8ba4c7', gridcolor='rgba(139,164,199,.08)')),
            legend=dict(font=dict(color='#c5d8f0', size=11), bgcolor='rgba(0,0,0,0)'),
            paper_bgcolor='rgba(10,22,40,.85)', margin=dict(l=20, r=20, t=30, b=10), height=340,
            title=dict(text="FL vs Centralized Model — Multidimensional Comparison", font=dict(color='#00d4aa', size=11))
        )
        st.plotly_chart(fig, use_container_width=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── 5 Workflows ──────────────────────────────────────────────────────────
    st.markdown("### 🔀 The 5 Workflows of Proposed Architecture")
    workflows = [
        ("1", "CNN Pipeline", "#00d4aa", "🖼",
         "LoG/DoG/Hessian-LoG → Saddle Points → GLCM Radiomics → CNN Training → Melanoma Classification"),
        ("2", "NLP Pipeline", "#007bff", "📝",
         "EHR Collection → Text Cleaning & Embeddings → Entity Extraction → Patient Profiling"),
        ("3", "Local DB + FL", "#7c3aed", "🏥",
         "CNN + NLP Data → Encrypted Local DB → Local Bayesian Network → MAP Estimation"),
        ("4", "Multi-Cloud", "#f59e0b", "☁️",
         "Central Cloud → Intermediate Clouds (per hospital group) → Weight Aggregation → Global Model"),
        ("5", "API & FIFO Queues", "#10b981", "⚙️",
         "Secure API Calls + FIFO Queues per Source + Horizontal Scalability for High Data Volumes"),
    ]
    w_cols = st.columns(5)
    for col, (num, title, clr, icon, desc) in zip(w_cols, workflows):
        col.markdown(f"""
        <div style="background:rgba(10,22,40,.85);border:1px solid {clr}33;
                    border-top:3px solid {clr};border-radius:12px;padding:1rem;
                    text-align:center;min-height:215px;">
            <div style="font-size:1.7rem;margin-bottom:.3rem;">{icon}</div>
            <div style="background:{clr}22;color:{clr};font-size:.62rem;font-weight:700;
                        letter-spacing:1px;padding:2px 8px;border-radius:10px;margin-bottom:.5rem;
                        display:inline-block;">WF {num}</div>
            <div style="color:{clr};font-weight:700;font-size:.8rem;margin-bottom:.5rem;">{title}</div>
            <div style="color:#8ba4c7;font-size:.72rem;line-height:1.5;">{desc}</div>
        </div>
        """, unsafe_allow_html=True)
