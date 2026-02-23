"""
fl_server.py
Central Aggregator for the DermaGnosis Federated Learning network.
Strictly aggregates model parameters (FedAvg) using PyTorch tensors; never receives raw clinical data.
Simulates a multi-cloud environment.
"""
import torch
import torch.nn as nn
from typing import List, Dict

class GlobalMelanomaModel(nn.Module):
    """A lightweight model to simulate collaborative training on clinical metadata."""
    def __init__(self, input_dim=5):
        super(GlobalMelanomaModel, self).__init__()
        self.fc1 = nn.Linear(input_dim, 16)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(16, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        return self.sigmoid(self.fc2(self.relu(self.fc1(x))))

class FLServer:
    """
    Central Coordinator for decentralized multi-cloud training using FedAvg.
    """
    def __init__(self, expected_clients: int = 5):
        self.expected_clients = expected_clients
        self.current_round = 0
        self.global_model = GlobalMelanomaModel()

    def aggregate_weights(self, client_state_dicts: List[Dict[str, torch.Tensor]]) -> Dict[str, torch.Tensor]:
        """
        Implementation of the FedAvg (Federated Averaging) algorithm.
        W_global = 1/K * sum(W_local)
        """
        print(f"[CLOUD HUB] [ROUND {self.current_round}] Aggregating weight tensors from {len(client_state_dicts)} nodes...")
        
        global_dict = self.global_model.state_dict()
        
        for k in global_dict.keys():
            # Stack all client tensors for this layer
            client_tensors = torch.stack([state_dict[k].float() for state_dict in client_state_dicts])
            # Average them
            global_dict[k] = client_tensors.mean(dim=0)
            
        self.global_model.load_state_dict(global_dict)
        self.current_round += 1
        return global_dict

    def broadcast_model(self) -> Dict[str, torch.Tensor]:
        """Send latest global model to all nodes."""
        return self.global_model.state_dict()

if __name__ == "__main__":
    # Simulation of a server lifecycle
    server = FLServer()
    print("--- DermaGnosis Federated Learning Server Initialized (Azure Central) ---")
    
    # Mock aggregation from Multi-Cloud Nodes
    # Usually these state_dicts would come over an encrypted gRPC/WebSocket channel
    mock_updates = []
    for cloud in ["AWS_Node_East", "GCP_Node_West", "Azure_Node_EU"]:
        print(f"[{cloud}] Simulating weight tensor transmission...")
        dummy_model = GlobalMelanomaModel()
        # Add some random noise to simulate local training divergence
        with torch.no_grad():
            for param in dummy_model.parameters():
                param.add_(torch.randn_like(param) * 0.05)
        mock_updates.append(dummy_model.state_dict())
        
    print()
    new_global_weights = server.aggregate_weights(mock_updates)
    print(f"[CLOUD HUB] Aggregation Complete. Round {server.current_round} finalized.")
    print("New Global Model Bias:", new_global_weights['fc2.bias'])
