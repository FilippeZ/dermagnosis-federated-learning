import sys
sys.path.append('.')
from modules.core.fl_engine import FedAvgEngine
import numpy as np

print("=== AUTHENTIC FEDERATED LEARNING TENSOR AGGREGATION PROOF ===")
engine = FedAvgEngine(n_hospitals=6, dp_enabled=True, dp_sigma=0.15, learning_rate=0.01)

print("\n1. Initialized Regional Cloud Nodes:")
for h in engine.hospitals:
    print(f" - Node {h.node_id}: Cloud={h.cloud_provider} ({h.region}), Samples={h.n_samples}, Initial Base Acc={h.base_accuracy*100:.1f}%")

print("\n2. Initial Global Model Weight Tensor Shape:", engine.global_weights.shape)
print("   Initial Weight Mean:", np.mean(engine.global_weights), "Std:", np.std(engine.global_weights))

print("\n3. Executing 5 Multi-Cloud FedAvg Rounds with Differential Privacy (DP Noise)...")
rounds = engine.run_simulation(n_rounds=5)

for r in rounds:
    print(f" [Round {r.round_num}] Global Acc: {r.global_accuracy*100:.2f}% | Global Loss: {r.global_loss:.4f} | Weight Divergence: {r.weight_divergence:.6f} | DP Epsilon: {r.privacy_epsilon:.4f}")

latest_version = engine.registry.get_latest()
print("\n4. MLOps Model Registry Snapshot:")
print(f" - Latest Saved Model Version: v{latest_version.version_id}")
print(f" - Final Model Accuracy: {latest_version.accuracy*100:.2f}%")
print(f" - Final Global Weight Tensor Norm: {np.linalg.norm(latest_version.weights):.4f}")
