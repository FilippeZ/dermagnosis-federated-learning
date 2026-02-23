# modules/core/__init__.py
from .image_pipeline import extract_feature_vector, score_image_risk, generate_filter_report
from .bayesian_network import BayesianMelanomaNetwork, PatientEvidence
from .fl_engine import FedAvgEngine
from .nlp_processor import ClinicalNLPProcessor
