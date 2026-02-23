"""
Page: FL Simulation — Real FedAvg engine with live progress visualization.
Uses modules/core/fl_engine.py for actual weight averaging simulation.
"""
import streamlit as st
import plotly.graph_objects as go
import numpy as np
import time


def render():
    st.markdown("""
    <h2 style="color:#00d4aa;font-weight:800;margin-bottom:.2rem;">🔗 Federated Learning Simulation</h2>
    <p style="color:#8ba4c7;margin-bottom:1rem;">
        Simulation of a real <strong style="color:#00d4aa;">FedAvg</strong> engine with hospital nodes, 
        heterogeneous data, and optional <strong style="color:#7c3aed;">Differential Privacy</strong> 
        (Gaussian noise injection before parameter transmission).
    </p>
    """, unsafe_allow_html=True)

    # ── Configuration ─────────────────────────────────────────────────────────
    with st.expander("⚙️ Simulation Parameters", expanded=True):
        col1, col2, col3 = st.columns(3)
        with col1:
            n_hospitals = st.slider("🏥 Number of Hospital Nodes", 2, 12, 5)
            n_rounds = st.slider("🔄 Communication Rounds", 5, 30, 15)
        with col2:
            dp_enabled = st.checkbox("🔒 Differential Privacy (Gaussian Noise)")
            dp_sigma = st.slider("σ (DP Noise Std)", 0.01, 1.0, 0.1, 0.01,
                                  disabled=not dp_enabled)
        with col3:
            lr = st.slider("Learning Rate", 0.001, 0.1, 0.01, 0.001)
            local_epochs = st.slider("Local Epochs / Round", 1, 10, 3)
            show_nodes = st.checkbox("Show per-node accuracy", value=True)

    run_btn = st.button("▶️ Execute FL Simulation", type="primary", use_container_width=True)

    if run_btn:
        from modules.core.fl_engine import FedAvgEngine

        engine = FedAvgEngine(
            n_hospitals=n_hospitals,
            dp_enabled=dp_enabled,
            dp_sigma=dp_sigma,
            learning_rate=lr,
        )

        # ── Live Progress ────────────────────────────────────────────────────
        st.markdown("##### 📡 Live FL Training Progress")
        progress_bar = st.progress(0)
        status_md = st.empty()
        chart_placeholder = st.empty()

        acc_history = []
        loss_history = []
        div_history = []
        node_histories = {f"Hospital-{chr(65+i)}": [] for i in range(n_hospitals)}

        for round_num in range(1, n_rounds + 1):
            result = engine.run_round(round_num)
            acc_history.append(result.global_accuracy * 100)
            loss_history.append(result.global_loss)
            div_history.append(result.weight_divergence)

            for node_id, acc in result.node_accuracies.items():
                if node_id in node_histories:
                    node_histories[node_id].append(acc * 100)

            progress_bar.progress(round_num / n_rounds)
            status_md.markdown(f"""
            <div style="background:rgba(10,22,40,.7);border:1px solid rgba(0,212,170,.15);
                        border-radius:8px;padding:.6rem 1rem;font-size:.82rem;color:#8ba4c7;">
                Round <strong style="color:#00d4aa;">{round_num}/{n_rounds}</strong> &nbsp;|&nbsp;
                Global Acc: <strong style="color:#00d4aa;">{result.global_accuracy*100:.2f}%</strong> &nbsp;|&nbsp;
                Loss: <strong style="color:#f43f5e;">{result.global_loss:.4f}</strong> &nbsp;|&nbsp;
                Divergence: <strong style="color:#f59e0b;">{result.weight_divergence:.4f}</strong>
                {f'&nbsp;|&nbsp; ε = <strong style="color:#7c3aed;">{result.privacy_epsilon:.2f}</strong>' if dp_enabled else ''}
            </div>
            """, unsafe_allow_html=True)

            # Live chart update
            rounds_so_far = list(range(1, round_num + 1))
            fig = go.Figure()
            # Global accuracy
            fig.add_trace(go.Scatter(
                x=rounds_so_far, y=acc_history, mode='lines+markers', name='Global Accuracy',
                line=dict(color='#00d4aa', width=3),
                marker=dict(size=6, color='#00d4aa')))

            # Per-node lines
            if show_nodes:
                colors = ['#007bff', '#f59e0b', '#f43f5e', '#7c3aed', '#10b981',
                          '#ff6b35', '#a78bfa', '#34d399', '#fb7185', '#60a5fa',
                          '#fcd34d', '#6ee7b7']
                for i, (node_id, hist) in enumerate(node_histories.items()):
                    if hist:
                        fig.add_trace(go.Scatter(
                            x=rounds_so_far[:len(hist)], y=hist, mode='lines',
                            name=node_id, line=dict(color=colors[i % len(colors)], width=1.2, dash='dot'),
                            opacity=0.65))

            fig.update_layout(
                xaxis=dict(title="Communication Round", color='#8ba4c7',
                           gridcolor='rgba(139,164,199,.08)'),
                yaxis=dict(title="Accuracy (%)", range=[40, 101], color='#8ba4c7',
                           gridcolor='rgba(139,164,199,.08)'),
                paper_bgcolor='rgba(10,22,40,.85)', plot_bgcolor='rgba(5,13,26,.9)',
                font=dict(color='#8ba4c7', family='Inter'),
                legend=dict(bgcolor='rgba(0,0,0,0)', font=dict(size=9)),
                height=380, margin=dict(l=50, r=20, t=20, b=40),
                title=dict(text="FedAvg Convergence — Accuracy per Round",
                           font=dict(color='#00d4aa', size=11))
            )
            chart_placeholder.plotly_chart(fig, use_container_width=True)

            if result.converged and round_num > 10:
                st.success(f"✅ Convergence achieved at round {round_num}!")
                break
            time.sleep(0.05)

        # ── Summary ──────────────────────────────────────────────────────────
        summary = engine.get_summary()
        st.markdown("##### 📊 Simulation Outcomes")
        cols = st.columns(4 if dp_enabled else 3)
        cols[0].metric("🎯 Final Accuracy", f"{summary['final_accuracy']*100:.2f}%")
        cols[1].metric("🏆 Best Accuracy", f"{summary['best_accuracy']*100:.2f}%",
                        f"Round {summary['best_round']}")
        cols[2].metric("🏥 Total Samples",
                        f"{summary['total_samples']:,}",
                        f"{n_hospitals} hospital nodes")
        if dp_enabled and len(cols) > 3:
            eps = summary.get('final_epsilon', 0)
            cols[3].metric("🔒 DP Epsilon (ε)", f"{eps:.2f}")

        # ── Weight Divergence + Loss ─────────────────────────────────────────
        col_div, col_loss = st.columns(2)
        rounds_x = list(range(1, len(div_history) + 1))

        with col_div:
            fig_div = go.Figure(go.Scatter(
                x=rounds_x, y=div_history, mode='lines+markers',
                line=dict(color='#f59e0b', width=2.5),
                marker=dict(size=5), fill='tozeroy', fillcolor='rgba(245,158,11,.06)'))
            fig_div.update_layout(
                xaxis=dict(title="Round", color='#8ba4c7', gridcolor='rgba(139,164,199,.08)'),
                yaxis=dict(title="Weight Divergence (L2)", color='#8ba4c7',
                           gridcolor='rgba(139,164,199,.08)'),
                paper_bgcolor='rgba(10,22,40,.85)', plot_bgcolor='rgba(5,13,26,.9)',
                font=dict(color='#8ba4c7', family='Inter'), height=250,
                margin=dict(l=50, r=10, t=30, b=40),
                title=dict(text="Weight Divergence across Nodes", font=dict(color='#f59e0b', size=11))
            )
            st.plotly_chart(fig_div, use_container_width=True)

        with col_loss:
            fig_loss = go.Figure(go.Scatter(
                x=rounds_x, y=loss_history, mode='lines+markers',
                line=dict(color='#f43f5e', width=2.5),
                marker=dict(size=5), fill='tozeroy', fillcolor='rgba(244,63,94,.06)'))
            fig_loss.update_layout(
                xaxis=dict(title="Round", color='#8ba4c7', gridcolor='rgba(139,164,199,.08)'),
                yaxis=dict(title="Global Loss", color='#8ba4c7',
                           gridcolor='rgba(139,164,199,.08)'),
                paper_bgcolor='rgba(10,22,40,.85)', plot_bgcolor='rgba(5,13,26,.9)',
                font=dict(color='#8ba4c7', family='Inter'), height=250,
                margin=dict(l=50, r=10, t=30, b=40),
                title=dict(text="Global Model Loss (1 - Accuracy)", font=dict(color='#f43f5e', size=11))
            )
            st.plotly_chart(fig_loss, use_container_width=True)

        # ── Hospital Profile ─────────────────────────────────────────────────
        with st.expander("🏥 Hospital Node Profiles"):
            import pandas as pd
            hospital_data = {
                "Node ID": [h.node_id for h in engine.hospitals],
                "Samples": [h.n_samples for h in engine.hospitals],
                "Participation Rounds": [h.rounds_participated for h in engine.hospitals],
                "Latest Loss": [f"{h.last_loss:.4f}" for h in engine.hospitals],
                "Weighted Contribution": [f"{h.n_samples / sum(h2.n_samples for h2 in engine.hospitals):.1%}"
                                          for h in engine.hospitals],
                "Differential Privacy": ["✅ Enabled" if dp_enabled else "❌ Disabled"] * len(engine.hospitals),
            }
            st.dataframe(pd.DataFrame(hospital_data), use_container_width=True, hide_index=True)

        # ── FedAvg formula ───────────────────────────────────────────────────
        st.markdown("""
        <div style="background:rgba(10,22,40,.75);border:1px solid rgba(0,212,170,.15);
                    border-radius:12px;padding:1.2rem;margin-top:.5rem;">
            <strong style="color:#00d4aa;">FedAvg Algorithm Formulation:</strong>
            <p style="font-family:monospace;color:#c5d8f0;font-size:.85rem;margin:.5rem 0 0;line-height:2;">
                W<sub>global</sub>(t+1) = Σ <sub>k=1..K</sub> (n<sub>k</sub>/N) × W<sub>k</sub>(t+1)
                <br>
                W<sub>k</sub>(t+1) = W<sub>global</sub>(t) − η × ∇L<sub>k</sub>(W<sub>global</sub>(t))
                <br>
                <span style="color:#7c3aed;">[DP] W<sub>k,private</sub> = W<sub>k</sub> + 𝒩(0, σ²·Δf²)</span>
            </p>
        </div>
        """, unsafe_allow_html=True)
