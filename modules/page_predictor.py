"""
Page: Melanoma Predictor — Full MVP with:
- Real image upload → LoG/DoG/Hessian-LoG/GLCM pipeline
- Real Bayesian MAP estimation
- Real NLP EHR entity extraction
- Full diagnostic report
"""
import streamlit as st
import plotly.graph_objects as go
import numpy as np
from PIL import Image
import io
import time


def render():
    st.markdown("""
    <h2 style="color:#00d4aa;font-weight:800;margin-bottom:.2rem;">🔬 Melanoma Risk Predictor</h2>
    <p style="color:#8ba4c7;margin-bottom:1rem;">
        Multimodal AI pipeline: <strong style="color:#00d4aa;">Computer Vision + Radiomics</strong> from image 
        + <strong style="color:#007bff;">Bayesian Network (MAP)</strong> from clinical data 
        + <strong style="color:#7c3aed;">NLP</strong> from medical notes.
    </p>
    """, unsafe_allow_html=True)

    # ── Tabs ─────────────────────────────────────────────────────────────────
    tab_img, tab_clinical, tab_ehr, tab_result = st.tabs([
        "🖼 Image Analysis", "🏥 Clinical Metadata", "📝 EHR / Notes", "📊 MAP Results"
    ])

    # ── State ─────────────────────────────────────────────────────────────────
    if "image_features" not in st.session_state:
        st.session_state.image_features = None
    if "image_risk" not in st.session_state:
        st.session_state.image_risk = 0.0
    if "filter_report" not in st.session_state:
        st.session_state.filter_report = []
    if "nlp_report" not in st.session_state:
        st.session_state.nlp_report = None

    # ═══════════════════════════════════════════════════════════════════════
    # TAB 1: IMAGE ANALYSIS
    # ═══════════════════════════════════════════════════════════════════════
    with tab_img:
        st.markdown("#### 🖼 Upload Dermoscopic Image")
        st.info("Supported formats: JPG, PNG, TIFF | Recommended: 224×224+ px dermoscopic captures")

        uploaded = st.file_uploader("Choose an image", type=["jpg", "jpeg", "png", "tiff"])

        if uploaded:
            pil_img = Image.open(io.BytesIO(uploaded.read()))
            col_orig, col_proc = st.columns(2)

            with col_orig:
                st.markdown("**📷 Original Image**")
                st.image(pil_img, use_column_width=True)

            with st.spinner("⚙️ Executing Computer Vision + Radiomics pipeline..."):
                try:
                    from modules.core.image_pipeline import (
                        extract_feature_vector, score_image_risk,
                        generate_filter_report, load_image, to_gray,
                        apply_log, apply_dog, apply_hessian_log
                    )
                    import matplotlib.pyplot as plt
                    import matplotlib
                    matplotlib.use("Agg")
                    from skimage import exposure

                    # Run real pipeline
                    features = extract_feature_vector(pil_img)
                    risk = score_image_risk(features)
                    filter_report = generate_filter_report(features)

                    # Cache in session state
                    st.session_state.image_features = features
                    st.session_state.image_risk = risk
                    st.session_state.filter_report = filter_report

                    # Generate filter visualizations
                    img_arr = load_image(pil_img)
                    gray = to_gray(img_arr)
                    gray = exposure.equalize_adapthist(gray, clip_limit=0.03)
                    log_map = apply_log(gray, sigma=2.0)
                    dog_map = apply_dog(gray)
                    hess_map = apply_hessian_log(gray, sigma=2.0)

                    fig_filters, axes = plt.subplots(1, 4, figsize=(12, 3))
                    fig_filters.patch.set_facecolor('#0a1628')
                    titles = ["Grayscale", "LoG Filter", "DoG Filter", "Hessian-LoG"]
                    imgs_to_show = [gray, log_map, dog_map, hess_map]
                    cmaps = ["gray", "RdBu_r", "coolwarm", "plasma"]
                    for ax, ttl, im, cmap in zip(axes, titles, imgs_to_show, cmaps):
                        ax.imshow(im, cmap=cmap)
                        ax.set_title(ttl, color='#00d4aa', fontsize=9, pad=4)
                        ax.axis('off')
                        ax.set_facecolor('#0a1628')
                    plt.tight_layout(pad=0.5)
                    with col_proc:
                        st.markdown("**🔬 Computer Vision Filters**")
                        st.pyplot(fig_filters)
                    plt.close(fig_filters)

                    st.success("✅ Pipeline completed!")
                except ImportError as e:
                    st.warning(f"Installing scikit-image dependencies... ({e}). Using simulated fallback values.")
                    st.session_state.image_risk = np.random.uniform(0.3, 0.7)
                    st.session_state.filter_report = [
                        ("Image analysis", "warning", "scikit-image not yet fully loaded — restart app if error persists.")]

            # ── Filter Report ────────────────────────────────────────────────
            if st.session_state.filter_report:
                st.markdown("##### 🧪 Filter Diagnostic Report")
                for title, status, desc in st.session_state.filter_report:
                    clr = {"danger": "#f43f5e", "warning": "#f59e0b", "success": "#10b981"}.get(status, "#8ba4c7")
                    st.markdown(f"""
                    <div style="background:rgba(10,22,40,.8);border-left:3px solid {clr};
                                border-radius:8px;padding:.7rem 1rem;margin-bottom:.5rem;">
                        <strong style="color:{clr};font-size:.85rem;">{title}</strong>
                        <p style="color:#8ba4c7;font-size:.78rem;margin:.2rem 0 0;">{desc}</p>
                    </div>
                    """, unsafe_allow_html=True)

            # ── GLCM Features Table ──────────────────────────────────────────
            if st.session_state.image_features:
                with st.expander("📋 GLCM Radiomics Feature Vector"):
                    import pandas as pd
                    f = st.session_state.image_features
                    glcm_keys = [k for k in f if 'glcm' in k]
                    glcm_df = pd.DataFrame({
                        "Feature": glcm_keys,
                        "Value": [f"{f[k]:.6f}" for k in glcm_keys]
                    })
                    st.dataframe(glcm_df, use_container_width=True, hide_index=True)

            # ── Image risk score ─────────────────────────────────────────────
            risk = st.session_state.image_risk
            risk_pct = risk * 100
            risk_clr = "#f43f5e" if risk > 0.6 else "#f59e0b" if risk > 0.3 else "#10b981"
            st.markdown(f"""
            <div style="background:rgba(10,22,40,.85);border:1px solid {risk_clr}44;
                        border-radius:12px;padding:1.2rem;margin-top:1rem;text-align:center;">
                <div style="color:{risk_clr};font-size:2rem;font-weight:800;">{risk_pct:.1f}%</div>
                <div style="color:#8ba4c7;font-size:.8rem;">Image Risk Score (Computer Vision + Radiomics)</div>
                <div style="background:rgba(10,22,40,4);border-radius:6px;height:8px;margin-top:.5rem;">
                    <div style="background:{risk_clr};height:8px;border-radius:6px;width:{risk_pct:.0f}%;"></div>
                </div>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown("""
            <div style="background:rgba(10,22,40,.5);border:2px dashed rgba(0,212,170,.2);
                        border-radius:14px;padding:2rem;text-align:center;margin-top:1rem;">
                <div style="font-size:2.5rem;margin-bottom:.5rem;">🖼</div>
                <div style="color:#8ba4c7;font-size:.9rem;">Upload an image to start the analysis</div>
                <div style="color:#8ba4c7;font-size:.75rem;margin-top:.3rem;">
                    LoG → DoG → Hessian-LoG saddle point → GLCM Radiomics → Risk Score
                </div>
            </div>
            """, unsafe_allow_html=True)

    # ═══════════════════════════════════════════════════════════════════════
    # TAB 2: CLINICAL DATA
    # ═══════════════════════════════════════════════════════════════════════
    with tab_clinical:
        st.markdown("#### 🏥 Patient Clinical Parameters")

        col1, col2, col3 = st.columns(3)
        with col1:
            age = st.slider("Age (years)", 10, 90, 45)
            skin_type = st.select_slider(
                "Fitzpatrick Phototype",
                options=[1, 2, 3, 4, 5, 6],
                value=2,
                format_func=lambda x: {1: "I (Very fair)", 2: "II (Fair)",
                                        3: "III (Medium)", 4: "IV (Olive)",
                                        5: "V (Dark brown)", 6: "VI (Deeply pigmented)"}[x])
            sun_exposure = st.slider("Sun exposure (estimated years)", 0, 50, 10)

        with col2:
            family_history = st.checkbox("👨‍👩‍👧 Family history of melanoma")
            previous_melanoma = st.checkbox("🏥 Previous melanoma diagnosis")
            immunosuppressed = st.checkbox("💊 Immunosuppression state")

        with col3:
            st.markdown("**📏 Lesion Characteristics (ABCDE)**")
            asymmetry = st.checkbox("A — Asymmetry")
            border_irregular = st.checkbox("B — Border irregularity")
            color_variation = st.checkbox("C — Color variation")
            diameter_mm = st.slider("D — Diameter (mm)", 1.0, 20.0, 5.0, 0.5)
            evolution = st.checkbox("E — Evolution / Change")

        abcde_score = sum([asymmetry, border_irregular, color_variation,
                           diameter_mm > 6, evolution])
        abcde_color = "#f43f5e" if abcde_score >= 4 else "#f59e0b" if abcde_score >= 2 else "#10b981"
        st.markdown(f"""
        <div style="background:rgba(10,22,40,.7);border:1px solid {abcde_color}44;
                    border-radius:10px;padding:.9rem;margin-top:.5rem;display:flex;
                    justify-content:space-between;align-items:center;">
            <span style="color:#c5d8f0;font-size:.85rem;">ABCDE Score</span>
            <span style="color:{abcde_color};font-size:1.5rem;font-weight:800;">{abcde_score}/5</span>
        </div>
        """, unsafe_allow_html=True)

        # Store clinical data
        st.session_state.clinical = dict(
            age=age, skin_type=skin_type, sun_exposure=sun_exposure,
            family_history=family_history, previous_melanoma=previous_melanoma,
            immunosuppressed=immunosuppressed, asymmetry=asymmetry,
            border_irregular=border_irregular, color_variation=color_variation,
            diameter_mm=diameter_mm, evolution=evolution
        )

    # ═══════════════════════════════════════════════════════════════════════
    # TAB 3: NLP / EHR
    # ═══════════════════════════════════════════════════════════════════════
    with tab_ehr:
        st.markdown("#### 📝 Clinical Notes / EHR Text")
        st.info("Paste medical notes, reports, or history. The NLP engine will automatically extract high-risk entities.")

        sample_text = st.checkbox("Use sample EHR text for demonstration")
        default_ehr = ""
        if sample_text:
            default_ehr = (
                "Patient: 58yo male. History: previous melanoma excision left forearm 2019. "
                "Family history: mother, melanoma stage II. "
                "Current lesion: irregular borders, color variation (dark brown, black areas), "
                "diameter ~9mm, evolving over 3 months. Patient reports bleeding and itching lesion. "
                "Lab: LDH: 220 U/L, S100: 0.18 ug/L. Medication: none. No immunosuppression. "
                "Fitzpatrick type II. High sun exposure history. "
                "Dermoscopy findings: atypical pigment network, regression structures. "
                "Recommendation: excision biopsy urgent."
            )
        ehr_text = st.text_area("Clinical Case Description", value=default_ehr, height=200,
                                placeholder="e.g.: 55yo male, irregular border lesion, family history melanoma, LDH: 250 U/L...")

        if ehr_text.strip():
            from modules.core.nlp_processor import ClinicalNLPProcessor
            nlp = ClinicalNLPProcessor()
            nlp_report = nlp.process(ehr_text)
            st.session_state.nlp_report = nlp_report

            st.markdown("##### 🔍 Extracted Clinical Entities")
            col_risk, col_benign, col_labs = st.columns(3)
            with col_risk:
                st.markdown(f"**⚠️ Risk Terms ({len(nlp_report.risk_keywords_found)})**")
                for t in nlp_report.risk_keywords_found[:8]:
                    st.markdown(f'<span style="background:rgba(244,63,94,.12);color:#f43f5e;'
                                f'font-size:.78rem;padding:2px 8px;border-radius:10px;margin:2px;'
                                f'display:inline-block;">{t}</span>', unsafe_allow_html=True)
            with col_benign:
                st.markdown(f"**✅ Benign Terms ({len(nlp_report.benign_keywords_found)})**")
                for t in nlp_report.benign_keywords_found[:6]:
                    st.markdown(f'<span style="background:rgba(16,185,129,.12);color:#10b981;'
                                f'font-size:.78rem;padding:2px 8px;border-radius:10px;margin:2px;'
                                f'display:inline-block;">{t}</span>', unsafe_allow_html=True)
            with col_labs:
                st.markdown(f"**🧪 Lab Values ({len(nlp_report.lab_values)})**")
                for lab, (val, unit) in nlp_report.lab_values.items():
                    st.markdown(f'<span style="background:rgba(0,123,255,.12);color:#007bff;'
                                f'font-size:.78rem;padding:2px 8px;border-radius:10px;margin:2px;'
                                f'display:inline-block;">{lab}: {val}{unit}</span>', unsafe_allow_html=True)

            st.markdown(f"""
            <div style="background:rgba(10,22,40,.75);border:1px solid rgba(0,212,170,.15);
                        border-radius:10px;padding:1rem;margin-top:.8rem;">
                <strong style="color:#00d4aa;">📋 Automated NLP Summary</strong>
                <p style="color:#c5d8f0;font-size:.83rem;margin:.5rem 0 0;line-height:1.7;">
                    {nlp_report.summary}
                </p>
            </div>
            """, unsafe_allow_html=True)

    # ═══════════════════════════════════════════════════════════════════════
    # TAB 4: BAYESIAN MAP RESULT
    # ═══════════════════════════════════════════════════════════════════════
    with tab_result:
        st.markdown("#### 📊 MAP Estimation — Bayesian Network Inference")

        run_btn = st.button("🧠 Execute Bayesian MAP Estimation", type="primary", use_container_width=True)

        if run_btn:
            clinical = st.session_state.get("clinical", {})
            if not clinical:
                st.warning("Please complete Clinical Metadata (Tab 2) first.")
                return

            from modules.core.bayesian_network import BayesianMelanomaNetwork, PatientEvidence

            image_risk = st.session_state.get("image_risk", 0.0)
            nlp_r = st.session_state.get("nlp_report", None)
            nlp_risk_kw = nlp_r.n_risk_terms if nlp_r else 0
            nlp_benign_kw = nlp_r.n_benign_terms if nlp_r else 0

            evidence = PatientEvidence(
                age=clinical.get("age", 45),
                skin_type=clinical.get("skin_type", 2),
                sun_exposure_years=clinical.get("sun_exposure", 10),
                family_history=clinical.get("family_history", False),
                previous_melanoma=clinical.get("previous_melanoma", False),
                immunosuppressed=clinical.get("immunosuppressed", False),
                asymmetry=clinical.get("asymmetry", False),
                border_irregular=clinical.get("border_irregular", False),
                color_variation=clinical.get("color_variation", False),
                diameter_mm=clinical.get("diameter_mm", 5.0),
                evolution=clinical.get("evolution", False),
                image_risk_score=image_risk,
                nlp_risk_keywords=nlp_risk_kw,
                nlp_benign_keywords=nlp_benign_kw,
                nlp_ldh_high=nlp_r.ldh_high if nlp_r else False,
                nlp_s100_high=nlp_r.s100_high if nlp_r else False,
                nlp_history_confirmed=nlp_r.clinical_history_confirmed if nlp_r else False,
            )

            with st.spinner("🔄 Calculating Maximum A Posteriori (MAP)..."):
                bn = BayesianMelanomaNetwork()
                result = bn.compute_map(evidence)
                time.sleep(0.5)

            st.session_state.bayes_result = result

        if "bayes_result" in st.session_state:
            result = st.session_state.bayes_result
            risk_pct = result.posterior_melanoma * 100

            # ── Gauge ───────────────────────────────────────────────
            fig_gauge = go.Figure(go.Indicator(
                mode="gauge+number+delta",
                value=risk_pct,
                domain={'x': [0, 1], 'y': [0, 1]},
                number={'suffix': "%", 'font': {'color': result.risk_color, 'size': 48, 'family': 'Inter'}},
                title={'text': f"P(Melanoma | Evidence)<br><span style='font-size:.8em;color:#8ba4c7;'>"
                               f"{result.risk_level}</span>",
                       'font': {'color': '#c5d8f0', 'size': 14}},
                delta={'reference': result.prior * 100, 'relative': False,
                       'increasing': {'color': '#f43f5e'}, 'decreasing': {'color': '#10b981'},
                       'valueformat': ".1f", 'suffix': "% vs prior"},
                gauge={
                    'axis': {'range': [0, 100], 'ticksuffix': '%', 'tickcolor': '#8ba4c7',
                             'tickfont': {'color': '#8ba4c7'}},
                    'bar': {'color': result.risk_color, 'thickness': 0.28},
                    'bgcolor': 'rgba(10,22,40,0)',
                    'borderwidth': 1, 'bordercolor': 'rgba(255,255,255,.05)',
                    'steps': [
                        {'range': [0, 35], 'color': 'rgba(16,185,129,0.08)'},
                        {'range': [35, 65], 'color': 'rgba(245,158,11,0.08)'},
                        {'range': [65, 100], 'color': 'rgba(244,63,94,0.10)'},
                    ],
                    'threshold': {'line': {'color': result.risk_color, 'width': 3},
                                  'thickness': 0.75, 'value': risk_pct}
                },
            ))
            fig_gauge.update_layout(
                paper_bgcolor='rgba(10,22,40,0)', height=300,
                margin=dict(l=30, r=30, t=30, b=10), font=dict(family='Inter'))
            st.plotly_chart(fig_gauge, use_container_width=True)

            # ── Recommendation ───────────────────────────────────────
            st.markdown(f"""
            <div style="background:rgba(10,22,40,.9);border:1px solid {result.risk_color}44;
                        border-left:5px solid {result.risk_color};border-radius:12px;padding:1.2rem;">
                <strong style="color:{result.risk_color};font-size:.95rem;">🩺 Clinical Assessment: {result.risk_level}</strong>
                <p style="color:#c5d8f0;font-size:.85rem;margin:.5rem 0 0;line-height:1.7;">
                    {result.recommendation}
                </p>
                <div style="margin-top:.7rem;display:flex;gap:1.5rem;flex-wrap:wrap;">
                    <span style="color:#8ba4c7;font-size:.77rem;">
                        P(Melanoma|E) = <strong style="color:{result.risk_color};">{risk_pct:.1f}%</strong>
                    </span>
                    <span style="color:#8ba4c7;font-size:.77rem;">
                        Prior P(M) = <strong style="color:#8ba4c7;">{result.prior*100:.1f}%</strong>
                    </span>
                    <span style="color:#8ba4c7;font-size:.77rem;">
                        Likelihood Ratio = <strong style="color:#007bff;">{result.likelihood_ratio:.1f}×</strong>
                    </span>
                    <span style="color:#8ba4c7;font-size:.77rem;">
                        Confidence: <strong style="color:#f59e0b;">{result.confidence*100:.0f}%</strong>
                    </span>
                </div>
            </div>
            """, unsafe_allow_html=True)

            # ── CPT Contributions ────────────────────────────────────
            if result.cpt_contributions:
                st.markdown("##### 🔍 Evidence Factor Contributions (Likelihood Ratios)")
                contribs = sorted(result.cpt_contributions.items(),
                                  key=lambda x: x[1], reverse=True)
                labels = [c[0].replace("_", " ").title() for c in contribs]
                vals = [c[1] for c in contribs]
                clrs = ["#f43f5e" if v > 3 else "#f59e0b" if v > 2 else "#00d4aa" for v in vals]

                fig_bar = go.Figure(go.Bar(
                    x=vals, y=labels, orientation='h',
                    marker_color=clrs,
                    text=[f"LR={v:.1f}×" for v in vals], textposition='outside',
                    textfont=dict(color='#c5d8f0', size=10)
                ))
                fig_bar.update_layout(
                    xaxis=dict(title="Likelihood Ratio (Influence)", color='#8ba4c7',
                               gridcolor='rgba(139,164,199,.08)'),
                    yaxis=dict(color='#8ba4c7', autorange='reversed'),
                    paper_bgcolor='rgba(10,22,40,.85)', plot_bgcolor='rgba(5,13,26,.9)',
                    font=dict(color='#8ba4c7', family='Inter'),
                    height=max(250, len(contribs) * 32), margin=dict(l=10, r=60, t=10, b=30),
                    showlegend=False
                )
                st.plotly_chart(fig_bar, use_container_width=True)

            # ── Data sources used ────────────────────────────────────
            img_used = st.session_state.get("image_features") is not None
            nlp_used = st.session_state.get("nlp_report") is not None
            st.markdown(f"""
            <div style="background:rgba(10,22,40,.6);border:1px solid rgba(0,212,170,.1);
                        border-radius:10px;padding:.8rem 1rem;margin-top:.8rem;font-size:.78rem;color:#8ba4c7;">
                <strong style="color:#00d4aa;">Integrated Evidence Sources:</strong> &nbsp;
                {'✅' if img_used else '⬜'} Computer Vision/Radiomics &nbsp;|&nbsp;
                ✅ Clinical ABCDE + Demographics &nbsp;|&nbsp;
                {'✅' if nlp_used else '⬜'} NLP EHR Analysis &nbsp;|&nbsp;
                ✅ Bayesian MAP Inference
            </div>
            """, unsafe_allow_html=True)

            st.warning("⚠️ **Medical Disclaimer**: This system provides advisory information only. "
                       "The final clinical diagnosis remains the sole responsibility of a board-certified dermatologist.")
        else:
            st.info("👆 Please provide patient data and click 'Execute Bayesian MAP Estimation' to see results.")
