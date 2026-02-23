"""
fl_client.py
Local Hospital/Node implementation for DermaGnosis FL.
Trains on local SQLite data and sends weight tensors to fl_server.py.
Data never leaves the hospital node.
"""
import torch
import torch.nn as nn
import torch.optim as optim
import sqlite3
import json
from typing import Dict, List, Tuple
from modules.core.bayesian_inference import BayesianInferenceEngine, DiagnosticEvidence

# We mimic the server model structure locally
class LocalMelanomaModel(nn.Module):
    def __init__(self, input_dim=5):
        super(LocalMelanomaModel, self).__init__()
        self.fc1 = nn.Linear(input_dim, 16)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(16, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        return self.sigmoid(self.fc2(self.relu(self.fc1(x))))

class FLClient:
    """
    Local training client for a hospital node.
    Performs 'training' by calculating the loss between local ML model predictions 
    and ground truth labels derived from the local database.
    """
    def __init__(self, node_id: str, db_path: str = "dermagnosis.db"):
        self.node_id = node_id
        self.db_path = db_path
        self.local_model = LocalMelanomaModel()
        self.criterion = nn.BCELoss()
        self.optimizer = optim.SGD(self.local_model.parameters(), lr=0.01, momentum=0.9)
        self.bayesian = BayesianInferenceEngine()

    def _get_local_data(self) -> Tuple[torch.Tensor, torch.Tensor]:
        """Fetch and preprocess data from local SQLite database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT age, type, history, radiomics FROM patients")
        rows = cursor.fetchall()
        conn.close()

        inputs = []
        labels = []

        for row in rows:
            age, dx_type, history_text, radiomics_json = row
            try:
                rad = json.loads(radiomics_json)
                img_risk = rad.get("energy", 0) # Mock risk for simulation if needed
            except:
                img_risk = 0.5
                
            # Construct a noisy/simulated feature vector
            # [Age_norm, Skin_Type, ABCDE, CV_Risk, NLP_Risk]
            age_norm = min(1.0, age / 100.0)
            skin_type = 0.5  # placeholder
            abcde = 1.0 if "Irregular" in str(history_text) else 0.0
            cv = img_risk
            nlp = 1.0 if "melanoma" in str(history_text).lower() else 0.0
            
            inputs.append([age_norm, skin_type, abcde, cv, nlp])
            
            # Ground truth proxy (simplification for FL target)
            label = 1.0 if dx_type.lower() in ["melanoma", "bcc", "scc"] else 0.0
            labels.append([label])

        if not inputs:
            # Fallback mock data if DB empty
            inputs = [[0.5, 0.5, 0.5, 0.5, 0.5] for _ in range(10)]
            labels = [[0.0] for _ in range(10)]

        return torch.tensor(inputs, dtype=torch.float32), torch.tensor(labels, dtype=torch.float32)

    def train_locally(self, global_parameters: Dict[str, torch.Tensor], epochs: int = 5) -> Dict[str, torch.Tensor]:
        """
        Calculates gradients based on local DB records and updates local model,
        starting from the global consensus weights.
        """
        print(f"[{self.node_id}] Synchronizing with central cloud model tensors...")
        
        # Load global consensus
        self.local_model.load_state_dict(global_parameters)
        
        inputs, labels = self._get_local_data()
        
        print(f"[{self.node_id}] Starting Local Training (Epochs: {epochs}, N={len(inputs)} patients)...")
        
        self.local_model.train()
        for epoch in range(epochs):
            self.optimizer.zero_grad()
            outputs = self.local_model(inputs)
            loss = self.criterion(outputs, labels)
            loss.backward()
            self.optimizer.step()
            
        final_loss = loss.item()
        print(f"[{self.node_id}] Local training complete. Final Loss: {final_loss:.4f}")
        
        # Serialize only State Dict for transmission
        return self.local_model.state_dict()

if __name__ == "__main__":
    client = FLClient(node_id="Hospital_London_01")
    # Simulate receiving initial global weights
    global_init = LocalMelanomaModel().state_dict()
    
    # Train
    update_tensors = client.train_locally(global_init, epochs=20)
    
    print(f"[{client.node_id}] Ready to transmit weight delta to central cloud via secure channel.")
    # Show that weights are strictly tensors
    print(f"Type check on transmitted chunk: {type(update_tensors['fc1.weight'])}")
