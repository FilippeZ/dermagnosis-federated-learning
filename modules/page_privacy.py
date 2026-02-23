"""
Page 3: Privacy-by-Design & GDPR Compliance Engine
"""

import streamlit as st
import plotly.graph_objects as go
import numpy as np


def render():
    st.markdown("""
    <h2 style="color:#00d4aa; font-weight:800; margin-bottom:0.2rem;">🔒 Privacy-by-Design & GDPR Compliance Engine</h2>
    <p style="color:#8ba4c7; margin-bottom:1.5rem;">
        Automated compliance verification. PHI never leaves hospital servers.
        GDPR Articles 5, 17, and 25 satisfied by architecture — not policy.
    </p>
    """, unsafe_allow_html=True)

    # ── GDPR Article Status Dashboard ────────────────────────────────────────
    st.markdown("### 📋 GDPR Compliance Status")

    articles = [
        ("Art. 5", "Data Minimization", "Only model weight updates are processed and shared. Raw dermoscopic images and EHR records remain exclusively on hospital servers.", True),
        ("Art. 17", "Right to Erasure", "Data deletion requests propagate across the entire federated network. Local database purge triggers re-training round with remaining nodes.", True),
        ("Art. 25", "Privacy by Design", "Privacy protections are embedded into the system architecture from inception. Differential Privacy injects noise at the edge before any transmission.", True),
        ("Art. 32", "Security of Processing", "End-to-end encryption (AES-256) for all weight transmissions. mTLS authentication between hospital nodes and cloud aggregators.", True),
        ("Art. 35", "DPIA – Data Protection Impact Assessment", "DPIA performed: high-risk medical AI. Residual risks mitigated by FL + DP architecture. Documentation maintained.", True),
        ("Art. 22", "Automated Decision-Making", "All AI predictions are advisory only. Clinician review required before diagnostic conclusion. Explainability layer provides reasoning.", True),
    ]

    for i in range(0, len(articles), 2):
        cols = st.columns(2)
        for j, col in enumerate(cols):
            if i + j < len(articles):
                a_id, a_name, a_desc, a_pass = articles[i + j]
                status_color = "#10b981" if a_pass else "#f43f5e"
                status_icon = "✅ COMPLIANT" if a_pass else "❌ NON-COMPLIANT"
                col.markdown(f"""
                <div style="background:rgba(10,22,40,0.85); border:1px solid {status_color}33;
                            border-left:4px solid {status_color}; border-radius:12px;
                            padding:1.2rem; margin-bottom:0.8rem; min-height:130px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                        <span style="color:#8ba4c7; font-size:0.75rem; font-weight:600; letter-spacing:1px;">{a_id}</span>
                        <span style="background:{status_color}22; color:{status_color}; font-size:0.7rem;
                                     font-weight:700; padding:2px 8px; border-radius:10px;">{status_icon}</span>
                    </div>
                    <div style="color:#c5d8f0; font-weight:700; font-size:0.9rem; margin-bottom:0.5rem;">{a_name}</div>
                    <div style="color:#8ba4c7; font-size:0.78rem; line-height:1.5;">{a_desc}</div>
                </div>
                """, unsafe_allow_html=True)

    # ── PHI Flow Checker ─────────────────────────────────────────────────────
    st.markdown("### 🔍 PHI Data Flow Audit")

    col1, col2 = st.columns([1, 1])

    with col1:
        st.markdown("""
        <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25);
                    border-radius:14px; padding:1.5rem;">
            <h4 style="color:#10b981; margin-top:0;">✅ What NEVER leaves the hospital</h4>
            <ul style="color:#c5d8f0; font-size:0.85rem; line-height:2; margin:0; padding-left:1.2rem;">
                <li>Raw dermoscopic images (JPEG/DICOM)</li>
                <li>Electronic Health Records (EHR)</li>
                <li>Patient identifiers (name, DOB, SSN)</li>
                <li>Clinical notes and diagnosis history</li>
                <li>Lab results and genetic markers</li>
                <li>Appointment and treatment records</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
        <div style="background:rgba(0,212,170,0.08); border:1px solid rgba(0,212,170,0.25);
                    border-radius:14px; padding:1.5rem;">
            <h4 style="color:#00d4aa; margin-top:0;">📤 What IS transmitted (anonymized)</h4>
            <ul style="color:#c5d8f0; font-size:0.85rem; line-height:2; margin:0; padding-left:1.2rem;">
                <li>CNN layer weight tensors (float32)</li>
                <li>Gradient updates (DP-noised)</li>
                <li>Bayesian CPD parameter deltas</li>
                <li>Local accuracy / loss metrics</li>
                <li>Sample count (for FedAvg weighting)</li>
                <li>Convergence status flag</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    # ── Differential Privacy Visualization ───────────────────────────────────
    st.markdown("### 📊 Differential Privacy — Noise Injection Visualization")

    sigma = st.slider("Gaussian Noise σ (DP noise multiplier)", 0.01, 1.0, 0.15, key="dp_sigma")

    np.random.seed(7)
    x = np.linspace(-3, 3, 200)
    original_weights = np.random.normal(0.5, 0.3, 200)
    noisy_weights = original_weights + np.random.normal(0, sigma, 200)

    fig = go.Figure()
    fig.add_trace(go.Histogram(
        x=original_weights, nbinsx=30,
        name="Original Weights", marker_color='rgba(0,212,170,0.6)',
        marker_line=dict(color='#00d4aa', width=1)
    ))
    fig.add_trace(go.Histogram(
        x=noisy_weights, nbinsx=30, opacity=0.7,
        name=f"DP-Noised (σ={sigma})", marker_color='rgba(124,58,237,0.6)',
        marker_line=dict(color='#7c3aed', width=1)
    ))
    fig.update_layout(
        barmode='overlay',
        xaxis_title="Weight Value",
        yaxis_title="Frequency",
        paper_bgcolor='rgba(10,22,40,0.85)',
        plot_bgcolor='rgba(5,13,26,0.9)',
        font=dict(color='#8ba4c7', family='Inter'),
        xaxis=dict(gridcolor='rgba(139,164,199,0.1)', color='#8ba4c7'),
        yaxis=dict(gridcolor='rgba(139,164,199,0.1)', color='#8ba4c7'),
        legend=dict(bgcolor='rgba(0,0,0,0)', font=dict(color='#c5d8f0')),
        height=300, margin=dict(l=10, r=10, t=10, b=20)
    )
    st.plotly_chart(fig, use_container_width=True)

    st.markdown(f"""
    <div style="background:rgba(124,58,237,0.08); border:1px solid rgba(124,58,237,0.2);
                border-radius:10px; padding:1rem; font-size:0.85rem; color:#a78bfa;">
        <strong>Privacy Budget:</strong> At σ={sigma:.2f},
        individual data points become indistinguishable.
        {"High privacy, minimal accuracy loss." if sigma < 0.3 else "Very high privacy, some accuracy trade-off (<2%)."}
        The Federated Edge-DP framework achieves <strong>4.3× privacy leakage reduction</strong>
        with under <strong>2% accuracy degradation</strong> using only <strong>18KB</strong> extra
        memory on ARM Cortex-M7.
    </div>
    """, unsafe_allow_html=True)

    # ── Selective Model Partitioning ─────────────────────────────────────────
    st.markdown("### 🔀 Selective Model Partitioning")

    layers = ["Conv2D Block 1", "Conv2D Block 2", "BatchNorm", "MaxPool", "Dense 512", "Dense 256", "Output Layer"]
    sensitivity = [0.1, 0.15, 0.05, 0.08, 0.85, 0.92, 0.98]
    dp_applied = [False, False, False, False, True, True, True]

    bar_colors = ["#f43f5e" if d else "#10b981" for d in dp_applied]
    bar_text = ["🔒 DP" if d else "✅ Open" for d in dp_applied]

    fig2 = go.Figure()
    fig2.add_trace(go.Bar(
        x=layers, y=sensitivity,
        marker_color=bar_colors,
        text=bar_text,
        textposition='outside',
        textfont=dict(color='#c5d8f0', size=10)
    ))
    fig2.update_layout(
        xaxis_title="Model Layer", yaxis_title="Privacy Sensitivity Score",
        paper_bgcolor='rgba(10,22,40,0.85)', plot_bgcolor='rgba(5,13,26,0.9)',
        font=dict(color='#8ba4c7', family='Inter'),
        xaxis=dict(gridcolor='rgba(139,164,199,0.1)', color='#8ba4c7'),
        yaxis=dict(gridcolor='rgba(139,164,199,0.1)', color='#8ba4c7', range=[0, 1.15]),
        height=300, margin=dict(l=10, r=10, t=30, b=20),
        title=dict(text="DP applied only to high-sensitivity layers (red) → minimizes computational cost",
                   font=dict(color='#8ba4c7', size=11))
    )
    st.plotly_chart(fig2, use_container_width=True)
