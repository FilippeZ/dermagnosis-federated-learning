"""
Page 5: System Architecture — The exact 5-workflow architecture from the PDF.
WF1: CNN Pipeline (LoG/DoG/Hessian-LoG → GLCM Radiomics → CNN)
WF2: NLP Pipeline (EHR → embeddings → entities → patient profile)
WF3: Unified Local DB + Federated Learning (Bayesian Network + MAP)
WF4: Multi-cloud hierarchy (central → intermediate → hospital groups → convergence)
WF5: API + FIFO Queues + horizontal scalability
"""
import streamlit as st
import plotly.graph_objects as go
import numpy as np


def render():
    st.markdown("""
    <h2 style="color:#00d4aa;font-weight:800;margin-bottom:.2rem;">🏗 System Architecture — 5 Integrated Workflows</h2>
    <p style="color:#8ba4c7;margin-bottom:1.5rem;">
        The proposed architecture integrates <strong style="color:#00d4aa;">multimodal data</strong>
        to address the biological complexity of tumor progression. 
        Five distinct workflows operating across a distributed multi-cloud structure.
    </p>
    """, unsafe_allow_html=True)

    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "🖼 WF1: CNN", "📝 WF2: NLP", "🏥 WF3: Local DBs & FL",
        "☁️ WF4: Multi-Cloud", "⚙️ WF5: API & FIFO", "🌐 System Structure"
    ])

    # ── WF1: CNN Pipeline ──────────────────────────────────────────────────
    with tab1:
        st.markdown("#### 🖼 Workflow 1: CNN Development Pipeline")
        st.markdown("""
        <div style="background:rgba(0,212,170,.06);border:1px solid rgba(0,212,170,.2);
                    border-radius:12px;padding:1.2rem;margin-bottom:1.2rem;">
            <p style="color:#c5d8f0;font-size:.88rem;line-height:1.8;margin:0;">
                Handles <strong style="color:#00d4aa;">medical image processing</strong>
                for autonomous melanoma detection via three phases: 
                Computer Vision → Radiomics → CNN Training.
            </p>
        </div>
        """, unsafe_allow_html=True)

        steps = [
            ("Phase 1", "Computer Vision Filters", "#00d4aa",
             ["LoG Filter (Laplacian of Gaussian): border and edge detection",
              "DoG Filter (Difference of Gaussian): blob-like structure identification",
              "Hessian-LoG Filter: saddle point detection for atypical networks",
              "Region of Interest (ROI) segmentation for suspicious lesions"]),
            ("Phase 2", "Radiomics — GLCM Texture Analysis", "#10b981",
             ["GLCM (Gray-Level Co-occurrence Matrix): quantitative texture extraction",
              "Contrast: measures local intensity variation",
              "Homogeneity: measures closeness of GLCM distribution to diagonal",
              "Correlation: linear dependence between neighboring pixel values"]),
            ("Phase 3", "CNN Training & Classification", "#007bff",
             ["Deep CNN training on Radiomics + Computer Vision features",
              "Architecture: Conv2D → BatchNorm → MaxPool → Dense → Softmax",
              "Automated evaluation and classification of skin lesions",
              "Output: P(Melanoma | Image) for every dermoscopic capture"]),
        ]
        for phase, title, clr, items in steps:
            c1, c2 = st.columns([1, 8])
            c1.markdown(f'<div style="background:{clr}22;color:{clr};font-weight:800;'
                        f'font-size:.7rem;padding:6px 4px;border-radius:8px;text-align:center;'
                        f'margin-top:.3rem;letter-spacing:.5px;">{phase}</div>', unsafe_allow_html=True)
            c2.markdown(f"""
            <div style="background:rgba(10,22,40,.85);border:1px solid {clr}33;
                        border-left:3px solid {clr};border-radius:10px;padding:1rem;margin-bottom:.5rem;">
                <strong style="color:{clr};font-size:.9rem;">{title}</strong>
                <ul style="color:#8ba4c7;font-size:.81rem;margin:.5rem 0 0;padding-left:1.2rem;line-height:1.75;">
                    {"".join(f"<li>{it}</li>" for it in items)}
                </ul>
            </div>
            """, unsafe_allow_html=True)

        # CNN layers visual
        st.markdown("##### 🧠 CNN Architecture Layers")
        layers = [("INPUT\n224×224×3","#8ba4c7"), ("Conv2D 32\n+ReLU","#00d4aa"),
                  ("BatchNorm","#10b981"), ("MaxPool 2×2","#007bff"), ("Conv2D 64","#00d4aa"),
                  ("BatchNorm","#10b981"), ("MaxPool 2×2","#007bff"), ("Conv2D 128","#00d4aa"),
                  ("GlobalAvgPool","#007bff"), ("Dense 512\n+Dropout","#7c3aed"),
                  ("Dense 256\n+Dropout","#7c3aed"), ("Softmax\n(2 classes)","#f43f5e")]
        cols = st.columns(len(layers))
        for col, (name, clr) in zip(cols, layers):
            top, *rest = name.split("\n")
            col.markdown(f"""
            <div style="background:rgba(10,22,40,.85);border:1px solid {clr}33;
                        border-top:3px solid {clr};border-radius:8px;padding:.5rem .2rem;
                        text-align:center;min-height:100px;">
                <div style="color:{clr};font-size:.62rem;font-weight:700;">{top}</div>
                <div style="color:#8ba4c7;font-size:.55rem;">{"<br>".join(rest)}</div>
            </div>""", unsafe_allow_html=True)

    # ── WF2: NLP Pipeline ──────────────────────────────────────────────────
    with tab2:
        st.markdown("#### 📝 Workflow 2: NLP Model Development Pipeline")
        st.markdown("""
        <div style="background:rgba(0,123,255,.06);border:1px solid rgba(0,123,255,.2);
                    border-radius:12px;padding:1.2rem;margin-bottom:1.2rem;">
            <p style="color:#c5d8f0;font-size:.88rem;line-height:1.8;margin:0;">
                The NLP model <strong style="color:#007bff;">manages clinical text</strong> 
                from Electronic Health Records (EHR), extracts clinical entities, 
                and synthesizes a complete personalized diagnostic profile for each patient.
            </p>
        </div>
        """, unsafe_allow_html=True)

        nlp_steps = [
            ("Step 1", "EHR Data Collection", "#007bff",
             "Medical reports, clinical notes, lab results, and medication history — harvested from EHR systems (FHIR R4 compatible)."),
            ("Step 2", "Cleaning & Tokenization", "#10b981",
             "Noise removal, normalization of medical terminology, and conversion of plain text into structured tokens."),
            ("Step 3", "Vectorization — Medical Embeddings", "#7c3aed",
             "Text conversion into dense vectors via transformer models (e.g., BioBERT, ClinicalBERT) for context understanding."),
            ("Step 4", "Named Entity Recognition (NER)", "#f59e0b",
             "Extraction of: Diseases, Medications, Dosages, Lab results, Allergies, and Family History."),
            ("Step 5", "Patient Profile Synthesis", "#00d4aa",
             "Creation of a comprehensive patient clinical profile, combined with CNN outputs for multimodal diagnosis."),
        ]
        for step, title, clr, desc in nlp_steps:
            st.markdown(f"""
            <div style="display:flex;align-items:flex-start;gap:1rem;margin-bottom:.8rem;
                        background:rgba(10,22,40,.6);border:1px solid {clr}22;
                        border-radius:10px;padding:.9rem 1rem;">
                <div style="background:{clr}22;color:{clr};font-weight:800;font-size:.72rem;
                            padding:4px 8px;border-radius:8px;flex-shrink:0;white-space:nowrap;">{step}</div>
                <div>
                    <strong style="color:{clr};font-size:.88rem;">{title}</strong>
                    <p style="color:#8ba4c7;font-size:.8rem;margin:.3rem 0 0;line-height:1.55;">{desc}</p>
                </div>
            </div>
            """, unsafe_allow_html=True)

    # ── WF3: Unified Local DB + FL ─────────────────────────────────────────
    with tab3:
        st.markdown("#### 🏥 Workflow 3: Unified Local Databases & Federated Learning")
        c1, c2 = st.columns([1, 1])
        with c1:
            st.markdown("""
            <div style="background:rgba(124,58,237,.06);border:1px solid rgba(124,58,237,.2);
                        border-radius:12px;padding:1.2rem;">
                <h5 style="color:#7c3aed;margin:0 0 .8rem;">🗄 Unified Local Database</h5>
                <ul style="color:#c5d8f0;font-size:.82rem;line-height:1.9;margin:0;padding-left:1.2rem;">
                    <li>Integration of CNN (images) + NLP (text) datasets locally</li>
                    <li>AES-256 local database encryption</li>
                    <li>Access restricted to authorized medical personnel</li>
                    <li>PHI remains exclusively on-premises (Hospital Intranet)</li>
                </ul>
            </div>
            """, unsafe_allow_html=True)
            st.markdown("<br>", unsafe_allow_html=True)
            st.markdown("""
            <div style="background:rgba(0,212,170,.06);border:1px solid rgba(0,212,170,.2);
                        border-radius:12px;padding:1.2rem;">
                <h5 style="color:#00d4aa;margin:0 0 .8rem;">🕸 Local Bayesian Network Training</h5>
                <ul style="color:#c5d8f0;font-size:.82rem;line-height:1.9;margin:0;padding-left:1.2rem;">
                    <li>Each hospital trains a local Bayesian Network</li>
                    <li>Calibration of DAG nodes and CPDs with local patient cohorts</li>
                    <li>Real-time parameter updates based on clinical evidence</li>
                    <li>MAP Estimation: argmax P(θ|data) ∝ P(data|θ) × P(θ)</li>
                    <li>Cloud Transmission: <strong style="color:#f59e0b;">Weight Parameters ONLY</strong>, never raw PHI</li>
                </ul>
            </div>
            """, unsafe_allow_html=True)
        with c2:
            # Bayesian Network DAG visualization
            node_x = [0.5, 0.2, 0.8, 0.2, 0.5, 0.8, 0.5]
            node_y = [0.9, 0.7, 0.7, 0.5, 0.5, 0.5, 0.2]
            node_labels = ["P(Cancer)", "P(Image|C)", "P(EHR|C)", "P(CNN|Img)", "P(MAP est.)", "P(NLP|EHR)", "Diagnosis"]
            node_colors = ["#f43f5e", "#00d4aa", "#007bff", "#00d4aa", "#f59e0b", "#007bff", "#7c3aed"]
            edges = [(0,1),(0,2),(1,3),(2,5),(3,4),(5,4),(4,6)]
            ex, ey = [], []
            for s, d in edges:
                ex += [node_x[s], node_x[d], None]
                ey += [node_y[s], node_y[d], None]
            fig = go.Figure()
            fig.add_trace(go.Scatter(x=ex, y=ey, mode='lines',
                line=dict(color='rgba(0,212,170,.4)', width=2), hoverinfo='skip', showlegend=False))
            fig.add_trace(go.Scatter(x=node_x, y=node_y, mode='markers+text',
                marker=dict(size=30, color=node_colors, line=dict(color='white', width=1)),
                text=node_labels, textposition='bottom center',
                textfont=dict(color='#c5d8f0', size=9), hoverinfo='text', showlegend=False))
            fig.update_layout(
                paper_bgcolor='rgba(10,22,40,.85)', plot_bgcolor='rgba(5,13,26,.9)',
                xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                height=350, margin=dict(l=10, r=10, t=30, b=10),
                title=dict(text="Bayesian Network DAG — Local Training Engine", font=dict(color='#00d4aa', size=12))
            )
            st.plotly_chart(fig, use_container_width=True)

    # ── WF4: Multi-Cloud ───────────────────────────────────────────────────
    with tab4:
        st.markdown("#### ☁️ Workflow 4: Hierarchical Multi-Cloud Architecture")
        st.markdown("""
        <div style="background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.2);
                    border-radius:12px;padding:1.2rem;margin-bottom:1.2rem;">
            <p style="color:#c5d8f0;font-size:.88rem;line-height:1.8;margin:0;">
                Global model training is executed <strong style="color:#f59e0b;">hierarchically and securely</strong> in the cloud. 
                Zero raw clinical data ever transits outside hospital firewalls.
            </p>
        </div>
        """, unsafe_allow_html=True)

        # Hierarchical topology
        nx = [0.5, 0.2, 0.8, 0.1, 0.3, 0.7, 0.9]
        ny = [0.88, 0.60, 0.60, 0.20, 0.20, 0.20, 0.20]
        labels = ["🌐 Central Cloud\n(Global Model)", "☁️ Region A Cloud\n(Intermediate)",
                  "☁️ Region B Cloud\n(Intermediate)", "🏥 Hosp. A", "🏥 Hosp. B", "🏥 Hosp. C", "🏥 Hosp. D"]
        colors = ["#7c3aed", "#f59e0b", "#f59e0b", "#00d4aa", "#00d4aa", "#00d4aa", "#00d4aa"]
        sizes = [55, 40, 40, 28, 28, 28, 28]
        edges = [(0,1),(0,2),(1,3),(1,4),(2,5),(2,6)]
        ex, ey = [], []
        for s, d in edges:
            ex += [nx[s], nx[d], None]; ey += [ny[s], ny[d], None]

        fig2 = go.Figure()
        fig2.add_trace(go.Scatter(x=ex, y=ey, mode='lines',
            line=dict(color='rgba(245,158,11,.35)', width=2.5, dash='dot'),
            hoverinfo='skip', showlegend=False))
        fig2.add_trace(go.Scatter(x=nx, y=ny, mode='markers+text',
            marker=dict(size=sizes, color=colors, opacity=.9, line=dict(color='rgba(255,255,255,.15)', width=1)),
            text=[l.split('\n')[0] for l in labels], textposition='bottom center',
            textfont=dict(color='#c5d8f0', size=10), hovertext=labels, hoverinfo='text', showlegend=False))
        # Annotation: only params, not PHI
        for i in range(3, 7):
            fig2.add_annotation(x=(nx[i]+nx[(i-3)//2+1])/2, y=(ny[i]+ny[(i-3)//2+1])/2,
                text="params only →", showarrow=False, font=dict(color='#00d4aa', size=8))

        fig2.update_layout(
            paper_bgcolor='rgba(10,22,40,.85)', plot_bgcolor='rgba(5,13,26,.9)',
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False, range=[-0.05, 1.05]),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False, range=[-0.05, 1.0]),
            height=420, margin=dict(l=20, r=20, t=30, b=20),
            title=dict(text="Multi-Cloud Hierarchy — Parameters Up, Global Model Down", font=dict(color='#f59e0b', size=12))
        )
        st.plotly_chart(fig2, use_container_width=True)

        cloud_steps = [
            ("1", "#7c3aed", "Central Cloud — Initialization",
             "Initializes the Bayesian Network and distributes base weights to intermediate region providers."),
            ("2", "#f59e0b", "Intermediate Clouds — Group Aggregation",
             "Each regional provider manages a local hospital group, collecting and partial-averaging node parameters."),
            ("3", "#00d4aa", "Hospital Nodes — Local Training",
             "Edge devices perform local epochs and send ONLY updated parameter sets (no PHI)."),
            ("4", "#007bff", "Central Cloud — Global Fusion",
             "Full FedAvg fusion. Convergence achieved when global loss delta falls below threshold."),
            ("5", "#10b981", "Global Model Redistribution",
             "Updated weights return to all edge local databases. Training cycle repeats."),
        ]
        for num, clr, title, desc in cloud_steps:
            st.markdown(f"""
            <div style="display:flex;align-items:flex-start;gap:1rem;margin-bottom:.7rem;
                        background:rgba(10,22,40,.6);border:1px solid {clr}22;border-radius:10px;padding:.8rem 1rem;">
                <div style="background:{clr}22;color:{clr};font-weight:800;font-size:.85rem;
                            width:26px;height:26px;border-radius:50%;display:flex;align-items:center;
                            justify-content:center;flex-shrink:0;">{num}</div>
                <div><strong style="color:{clr};font-size:.88rem;">{title}</strong>
                    <p style="color:#8ba4c7;font-size:.8rem;margin:.2rem 0 0;line-height:1.5;">{desc}</p></div>
            </div>
            """, unsafe_allow_html=True)

    # ── WF5: API & FIFO ────────────────────────────────────────────────────
    with tab5:
        st.markdown("#### ⚙️ Workflow 5: Communication Engine — API & FIFO Queues")
        c1, c2, c3 = st.columns(3)
        comp = [
            (c1, "🔗 Secure API Endpoints", "#00d4aa",
             ["Encrypted HTTPS tunnel between nodes", "mTLS mutual authentication", "JWT-based authorization",
              "Request rate limiting & signing", "Comprehensive transmission auditing"]),
            (c2, "📋 FIFO Queues — Data Stream", "#007bff",
             ["Dedicated FIFO queues per source node", "Hospital → Regional Cloud queue",
              "Regional → Central Cloud queue", "Guaranteed sequential processing",
              "Mitigation of race conditions in FedAvg"]),
            (c3, "📈 Horizontal Scalability", "#f59e0b",
             ["Elastic workload distribution", "Auto-scaling cloud infrastructure",
              "Hot-adding new hospital nodes", "High-throughput data volume handling",
              "Load balancing across region providers"]),
        ]
        for col, title, clr, items in comp:
            col.markdown(f"""
            <div style="background:rgba(10,22,40,.85);border:1px solid {clr}33;
                        border-top:3px solid {clr};border-radius:12px;padding:1.2rem;min-height:260px;">
                <h5 style="color:{clr};margin:0 0 .8rem;font-size:.9rem;">{title}</h5>
                <ul style="color:#8ba4c7;font-size:.8rem;line-height:1.85;margin:0;padding-left:1.1rem;">
                    {"".join(f"<li>{it}</li>" for it in items)}
                </ul>
            </div>
            """, unsafe_allow_html=True)

    # ── WF6: Full System View ──────────────────────────────────────────────
    with tab6:
        st.markdown("#### 🌐 Complete Architecture — End-to-End Data Flow")
        flow = [
            ("🖼 Dermoscopic Images", "→", "#00d4aa"),
            ("📝 EHR / Clinical Records", "→", "#007bff"),
            ("🧠 CNN + NLP Engines", "→", "#7c3aed"),
            ("🗄 Encrypted Local DB", "→", "#f59e0b"),
            ("🕸 Bayesian MAP Estimation", "→", "#10b981"),
            ("☁️ Parameters → Multi-Cloud", "→", "#f59e0b"),
            ("🌐 Central Cloud (FedAvg)", "→", "#7c3aed"),
            ("🔄 Global Model ← Edge", "✓", "#00d4aa"),
        ]
        for i in range(0, len(flow), 4):
            cols = st.columns(4)
            for col, (label, arrow, clr) in zip(cols, flow[i:i+4]):
                col.markdown(f"""
                <div style="background:rgba(10,22,40,.85);border:1px solid {clr}33;
                            border-radius:10px;padding:.9rem;text-align:center;margin-bottom:.5rem;">
                    <div style="color:{clr};font-size:.8rem;font-weight:600;">{label}</div>
                    <div style="color:{clr};font-size:1.2rem;margin-top:.3rem;">{arrow}</div>
                </div>
                """, unsafe_allow_html=True)

        st.markdown("""
        <div style="background:rgba(0,212,170,.06);border:1px solid rgba(0,212,170,.2);
                    border-radius:12px;padding:1.2rem;margin-top:1rem;font-size:.85rem;color:#c5d8f0;line-height:1.8;">
            <strong style="color:#00d4aa;">🎯 Final Outcome:</strong>
            Real-time <strong style="color:#00d4aa;">Melanoma Risk Prediction</strong> using global collaborative intelligence 
            while satisfying <strong style="color:#00d4aa;">GDPR Art. 25</strong> (Privacy by Design). 
            Clinical decision support powered by decentralized medical data.
        </div>
        """, unsafe_allow_html=True)
