"""
modules/core/cv_nlp_pipeline.py
Unified extraction pipeline for multimodal medical data.
Ingests images and clinical notes, returning structured features for Bayesian inference.
"""
import numpy as np
from PIL import Image
from typing import Dict, Any, Tuple

try:
    from modules.core.image_pipeline import extract_feature_vector, score_image_risk
    from modules.core.nlp_processor import ClinicalNLPProcessor
except ImportError:
    # Fallback for direct execution
    from image_pipeline import extract_feature_vector, score_image_risk
    from nlp_processor import ClinicalNLPProcessor

class MultimodalPipeline:
    """
    Coordinates Computer Vision and NLP processors to generate 
    a unified risk profile for a patient.
    """
    def __init__(self):
        self.nlp_processor = ClinicalNLPProcessor()

    def process_patient_data(
        self, 
        pil_image: Image.Image, 
        clinical_note: str
    ) -> Dict[str, Any]:
        """
        Runs the full multimodal extraction loop.
        1. Computer Vision / Radiomics extractions.
        2. NLP clinical entity extraction from EHR notes.
        """
        # 1. Image Processing
        img_features = extract_feature_vector(pil_image)
        img_risk_score = score_image_risk(img_features)

        # 2. NLP Processing
        nlp_report = self.nlp_processor.process(clinical_note)

        # 3. Aggregated Result Structure
        return {
            "image_features": img_features,
            "image_risk_score": float(img_risk_score),
            "nlp_metrics": {
                "risk_keywords": nlp_report.risk_keywords_found,
                "n_risk": nlp_report.n_risk_terms,
                "n_benign": nlp_report.n_benign_terms,
                "ldh_high": nlp_report.ldh_high,
                "s100_high": nlp_report.s100_high,
                "history_confirmed": nlp_report.clinical_history_confirmed,
                "symptoms_present": nlp_report.symptoms_present,
                "summary": nlp_report.summary
            }
        }

if __name__ == "__main__":
    # Smoke test with dummy data
    print("Initializing Multimodal Pipeline Test...")
    pipeline = MultimodalPipeline()
    dummy_img = Image.new('RGB', (256, 256), color = (73, 109, 137))
    dummy_note = "Patient has history of melanoma. LDH is 280 U/L."
    
    results = pipeline.process_patient_data(dummy_img, dummy_note)
    print(f"Extraction Successful. Image Risk: {results['image_risk_score']:.4f}")
    print(f"NLP Summary: {results['nlp_metrics']['summary']}")
