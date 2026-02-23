"""
modules/core/bayesian_inference.py
Transparent Bayesian Inference Engine for Melanoma Risk assessment.
Implements a Directed Acyclic Graph (DAG) using pgmpy with MAP estimation.
"""
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, Any, List

try:
    from pgmpy.models import BayesianNetwork
    from pgmpy.factors.discrete import TabularCPD
    from pgmpy.inference import VariableElimination
except ImportError:
    BayesianNetwork, TabularCPD, VariableElimination = None, None, None

@dataclass
class DiagnosticEvidence:
    """Unified evidence structure for the Bayesian Network."""
    # Patient Demographics
    age: int = 45
    skin_type: int = 2  # Fitzpatrick I-VI
    family_history: bool = False
    previous_melanoma: bool = False
    
    # Pathological Factors (ABCDE)
    asymmetry: bool = False
    border_irregular: bool = False
    color_variation: bool = False
    diameter_mm: float = 5.0
    evolution: bool = False
    
    # Multimodal Pipeline Outputs
    image_risk_score: float = 0.0  # From Radiomics Pipeline
    nlp_risk_vector: float = 0.0   # From NLP Pipeline [-1, 1]

class BayesianInferenceEngine:
    """
    XAI Bayesian Engine using pgmpy.
    Constructs a Directed Acyclic Graph (DAG) for Melanoma diagnosis.
    Calculates P(Cancer | Evidence) using MAP estimation.
    """
    def __init__(self):
        self.model = None
        self.inference = None
        self._build_dag()

    def _build_dag(self):
        if BayesianNetwork is None:
            print("Warning: pgmpy not installed. Inference will fallback to basic rules.")
            return

        # 1. Define Network Structure (DAG)
        # Nodes: Age, SkinType, ABCDE, CV_Risk, NLP_Risk -> Cancer
        self.model = BayesianNetwork([
            ('Age', 'Cancer'),
            ('SkinType', 'Cancer'),
            ('ABCDE', 'Cancer'),
            ('CV_Risk', 'Cancer'),
            ('NLP_Risk', 'Cancer')
        ])

        # 2. Define Conditional Probability Distributions (CPDs)
        # States: 0 = Low Risk / False, 1 = High Risk / True
        
        # Priors
        cpd_age = TabularCPD(variable='Age', variable_card=2, values=[[0.7], [0.3]]) # 30% are > 60
        cpd_skin = TabularCPD(variable='SkinType', variable_card=2, values=[[0.6], [0.4]]) # 40% are specific type
        cpd_abcde = TabularCPD(variable='ABCDE', variable_card=2, values=[[0.8], [0.2]])
        cpd_cv = TabularCPD(variable='CV_Risk', variable_card=2, values=[[0.85], [0.15]])
        cpd_nlp = TabularCPD(variable='NLP_Risk', variable_card=2, values=[[0.9], [0.1]])

        # Cancer CPD (Conditioned on Age, SkinType, ABCDE, CV_Risk, NLP_Risk)
        # Since full TabularCPD for 5 parents requires 2^5 = 32 columns, we use a simplified noisy-OR or linear approximation.
        # For true pgmpy completeness in this script, we generate a probability table that increases with the number of risk factors.
        
        cancer_probs_0 = [] # Prob(Cancer=0)
        cancer_probs_1 = [] # Prob(Cancer=1)
        
        # There are 32 combinations. Let's create a monotonic function to fill this.
        # Base risk: 0.01. Each factor adds a multiplier.
        weights = {'Age': 1.5, 'SkinType': 1.2, 'ABCDE': 3.0, 'CV_Risk': 4.5, 'NLP_Risk': 3.5}
        
        for i in range(32):
            # Binary string representation to get the state of each parent
            state = f"{i:05b}"
            age_st, skin_st, abcde_st, cv_st, nlp_st = [int(x) for x in state]
            
            # Simple additive risk model mapped to a probability
            risk_score = 0.01 # Base
            if age_st: risk_score += 0.05
            if skin_st: risk_score += 0.04
            if abcde_st: risk_score += 0.20
            if cv_st: risk_score += 0.40
            if nlp_st: risk_score += 0.30
            
            p_cancer = min(0.99, risk_score)
            cancer_probs_1.append(p_cancer)
            cancer_probs_0.append(1.0 - p_cancer)

        cpd_cancer = TabularCPD(
            variable='Cancer', variable_card=2, 
            values=[cancer_probs_0, cancer_probs_1],
            evidence=['Age', 'SkinType', 'ABCDE', 'CV_Risk', 'NLP_Risk'],
            evidence_card=[2, 2, 2, 2, 2]
        )

        self.model.add_cpds(cpd_age, cpd_skin, cpd_abcde, cpd_cv, cpd_nlp, cpd_cancer)
        
        # Verify model
        if self.model.check_model():
            self.inference = VariableElimination(self.model)

    def _discretize_evidence(self, ev: DiagnosticEvidence) -> Dict[str, int]:
        """Maps continuous/boolean evidence to discrete DAG states space (0 or 1)."""
        discrete_ev = {}
        
        discrete_ev['Age'] = 1 if ev.age > 60 else 0
        discrete_ev['SkinType'] = 1 if ev.skin_type <= 2 else 0
        
        # ABCDE Score
        abcde_count = sum([ev.asymmetry, ev.border_irregular, ev.color_variation, ev.diameter_mm > 6.0, ev.evolution])
        discrete_ev['ABCDE'] = 1 if abcde_count >= 2 else 0
        
        # CV Score
        discrete_ev['CV_Risk'] = 1 if ev.image_risk_score > 0.65 else 0
        
        # NLP Risk Flag
        discrete_ev['NLP_Risk'] = 1 if ev.nlp_risk_vector > 0.3 else 0
        
        return discrete_ev

    def infer(self, evidence: DiagnosticEvidence) -> Dict[str, Any]:
        """
        Compute Posterior Probability mapping evidence via Maximum A Posteriori (MAP).
        Returns Probability and Confidence Interval.
        """
        discrete_ev = self._discretize_evidence(evidence)
        contributions = [{"factor": k, "state": "High Risk" if v==1 else "Normal"} for k,v in discrete_ev.items()]

        if self.inference is None:
            # Fallback if pgmpy unavailable
            base_p = 0.05 + 0.15*discrete_ev['Age'] + 0.3*discrete_ev['CV_Risk'] + 0.2*discrete_ev['NLP_Risk'] + 0.3*discrete_ev['ABCDE']
            posterior_p = min(0.99, base_p)
        else:
            # MAP Estimation via Variable Elimination
            query_res = self.inference.query(variables=['Cancer'], evidence=discrete_ev)
            posterior_p = float(query_res.values[1]) # Prob(Cancer = 1)

        # Calculate a pseudo-confidence interval based on evidence density
        # More positive "extreme" evidence = tighter interval on the decision
        num_positive_factors = sum(discrete_ev.values())
        ci_spread = 0.20 - (num_positive_factors * 0.03) # Tighter CI with more evidence
        ci_spread = max(0.05, ci_spread)
        
        ci_lower = max(0.0, posterior_p - ci_spread)
        ci_upper = min(1.0, posterior_p + ci_spread)

        # Categorization
        if posterior_p > 0.70:
            risk_level = "CRITICAL"
            color = "#ff0011"
        elif posterior_p > 0.40:
            risk_level = "HIGH"
            color = "#ff9900"
        elif posterior_p > 0.15:
            risk_level = "MODERATE"
            color = "#ffdd00"
        else:
            risk_level = "LOW"
            color = "#00ff77"

        return {
            "posterior_probability": posterior_p,
            "confidence_interval": [float(ci_lower), float(ci_upper)],
            "risk_level": risk_level,
            "status_color": color,
            "explainability_data": contributions,
            "confidence": min(0.98, 0.5 + (num_positive_factors * 0.1))
        }

if __name__ == "__main__":
    # Internal Unit Test
    engine = BayesianInferenceEngine()
    test_evidence = DiagnosticEvidence(
        age=65, 
        evolution=True, 
        image_risk_score=0.78,
        nlp_risk_vector=0.8
    )
    result = engine.infer(test_evidence)
    print(f"Prob: {result['posterior_probability']:.4f} | CI: {result['confidence_interval']} | Risk: {result['risk_level']}")
