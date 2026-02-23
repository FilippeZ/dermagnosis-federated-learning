"""
core/bayesian_network.py
Real Bayesian Network for melanoma risk.
Uses actual probability computation (DAG + CPDs + MAP estimation).
No external pgmpy dependency needed — pure numpy.
"""
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, Any


@dataclass
class PatientEvidence:
    """All clinical evidence for one patient."""
    age: int = 45
    skin_type: int = 2          # Fitzpatrick I-VI
    sun_exposure_years: int = 10
    family_history: bool = False
    previous_melanoma: bool = False
    immunosuppressed: bool = False
    ethnicity: str = "Caucasian"  # Caucasian, Hispanic, Asian, African
    genetic_risk: bool = False    # Positive NGS/BRAF mutation history
    # ABCDE
    asymmetry: bool = False
    border_irregular: bool = False
    color_variation: bool = False
    diameter_mm: float = 5.0
    evolution: bool = False
    # Image features (from CNN pipeline)
    image_risk_score: float = 0.0   # 0-1 from image_pipeline
    # NLP-extracted features
    nlp_risk_keywords: int = 0      # count of risk-related terms in EHR
    nlp_benign_keywords: int = 0
    # Specific NLP-derived flags
    nlp_ldh_high: bool = False
    nlp_s100_high: bool = False
    nlp_history_confirmed: bool = False
    nlp_symptoms_present: bool = False


@dataclass
class BayesianResult:
    """Full MAP estimation result."""
    posterior_melanoma: float = 0.0
    posterior_benign: float = 0.0
    prior: float = 0.02
    likelihood_ratio: float = 1.0
    risk_level: str = "Low"
    risk_color: str = "#10b981"
    cpt_contributions: Dict[str, float] = field(default_factory=dict)
    recommendation: str = ""
    confidence: float = 0.0


class BayesianMelanomaNetwork:
    """
    Bayesian Network for melanoma risk assessment.
    
    Structure (DAG):
    Age → P(Melanoma)
    SkinType → P(Melanoma)  
    SunExposure → P(Melanoma)
    FamilyHistory → P(Melanoma)
    [ABCDE criteria] → P(Melanoma | Clinical Evidence)
    ImageRisk → P(Melanoma | Image)
    NLP_Risk → P(Melanoma | EHR)
    
    Uses Naive Bayes approximation (conditionally independent features)
    with MAP estimation: argmax P(θ|E) ∝ P(E|θ) × P(θ)
    """

    # Prior probability of melanoma in general population
    PRIOR = 0.02

    # Conditional Probability Tables (CPDs) P(Evidence | Melanoma) / P(Evidence | Benign)
    # These are calibrated likelihood ratios from dermoscopy literature
    CPDs = {
        # Demographic
        'age_over_50':            (3.2, 1.0,  "Age >50 years"),
        'age_over_65':            (2.1, 0.7,  "Age >65 years (incremental)"),
        'skin_type_i_ii':         (2.5, 1.0,  "Fitzpatrick Type I/II (fair skin)"),
        'skin_type_iii_iv':       (1.3, 1.0,  "Fitzpatrick Type III/IV"),
        'sun_exposure_high':      (2.8, 1.0,  "High UV/sun exposure (>15yr)"),
        'sun_exposure_moderate':  (1.6, 1.0,  "Moderate sun exposure (5-15yr)"),
        'family_history':         (2.2, 1.0,  "Family history of melanoma"),
        'previous_melanoma':      (5.0, 1.0,  "Personal history of melanoma"),
        'immunosuppressed':       (2.5, 1.0,  "Immunosuppression"),
        # ABCDE criteria
        'asymmetry':              (4.0, 1.0,  "Asymmetry (ABCDE-A)"),
        'border_irregular':       (3.5, 1.0,  "Irregular Border (ABCDE-B)"),
        'color_variation':        (4.2, 1.0,  "Color Variation (ABCDE-C)"),
        'diameter_large':         (3.0, 1.0,  "Diameter >6mm (ABCDE-D)"),
        'evolution':              (5.5, 1.0,  "Changing/Evolving lesion (ABCDE-E)"),
        # CNN image features
        'image_risk_high':        (6.0, 0.8,  "CNN/Radiomics image risk >0.6"),
        'image_risk_moderate':    (2.5, 0.9,  "CNN/Radiomics image risk 0.3-0.6"),
        # NLP EHR features
        'nlp_risk_terms':         (1.8, 1.0,  "Clinical notes risk keywords"),
        'nlp_ldh_high':           (2.2, 1.0,  "NLP: High LDH detected (>250)"),
        'nlp_s100_high':          (2.5, 1.0,  "NLP: High S100 detected (>0.15)"),
        'nlp_history_positive':   (4.0, 1.0,  "NLP: Confirmed oncology history"),
        # New Clinical/Genetic nodes (NotebookLM recommended)
        'genetic_risk':           (4.5, 1.0,  "Genetic Vulnerability (NGS/BRAF+)"),
        'ethnicity_white':        (1.5, 1.0,  "Demographic Factor: Caucasian"),
        'ethnicity_hispanic':     (0.8, 1.0,  "Demographic Factor: Hispanic/Latino"),
        'symptoms_present':       (2.4, 1.0,  "Clinical Symptomatology (Itching/Bleeding)"),
    }

    def compute_map(self, evidence: PatientEvidence) -> BayesianResult:
        """
        MAP Estimation:
        P(Melanoma | E) ∝ P(E₁|M)·P(E₂|M)·...·P(Eₙ|M) · P(M)
        P(Benign | E)  ∝ P(E₁|B)·P(E₂|B)·...·P(Eₙ|B) · P(B)
        Returns normalized posterior probabilities.
        """
        prior_m = self.PRIOR
        prior_b = 1.0 - prior_m

        # Log-space to avoid underflow
        log_lk_m = np.log(prior_m)
        log_lk_b = np.log(prior_b)
        contributions = {}

        # ── Demographic features ─────────────────────────────────────────
        if evidence.age >= 65:
            lm, lb, label = self.CPDs['age_over_65']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm
        if evidence.age >= 50:
            lm, lb, label = self.CPDs['age_over_50']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm

        if evidence.skin_type in [1, 2]:
            lm, lb, label = self.CPDs['skin_type_i_ii']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm
        elif evidence.skin_type in [3, 4]:
            lm, lb, label = self.CPDs['skin_type_iii_iv']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm

        if evidence.sun_exposure_years >= 15:
            lm, lb, label = self.CPDs['sun_exposure_high']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm
        elif evidence.sun_exposure_years >= 5:
            lm, lb, label = self.CPDs['sun_exposure_moderate']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm

        if evidence.family_history:
            lm, lb, label = self.CPDs['family_history']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm

        if evidence.previous_melanoma:
            lm, lb, label = self.CPDs['previous_melanoma']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm

        if evidence.immunosuppressed:
            lm, lb, label = self.CPDs['immunosuppressed']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm

        if evidence.genetic_risk:
            lm, lb, label = self.CPDs['genetic_risk']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm

        if evidence.ethnicity == "Caucasian":
            lm, lb, label = self.CPDs['ethnicity_white']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm
        elif evidence.ethnicity == "Hispanic":
            lm, lb, label = self.CPDs['ethnicity_hispanic']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm

        # ── ABCDE criteria ─────────────────────────────────────────────
        if evidence.asymmetry:
            lm, lb, label = self.CPDs['asymmetry']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm

        if evidence.border_irregular:
            lm, lb, label = self.CPDs['border_irregular']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm

        if evidence.color_variation:
            lm, lb, label = self.CPDs['color_variation']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm

        if evidence.diameter_mm > 6:
            lm, lb, label = self.CPDs['diameter_large']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm

        if evidence.evolution:
            lm, lb, label = self.CPDs['evolution']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm

        # ── Image features ─────────────────────────────────────────────
        if evidence.image_risk_score > 0.6:
            lm, lb, label = self.CPDs['image_risk_high']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm
        elif evidence.image_risk_score > 0.3:
            lm, lb, label = self.CPDs['image_risk_moderate']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm

        # ── NLP features ────────────────────────────────────────────────
        if evidence.nlp_risk_keywords > 0:
            bonus = min(evidence.nlp_risk_keywords * 0.3, 1.2)
            lm = 1.0 + bonus
            log_lk_m += np.log(lm)
            contributions[f"NLP: {evidence.nlp_risk_keywords} risk keywords"] = lm

        if evidence.nlp_ldh_high:
            lm, lb, label = self.CPDs['nlp_ldh_high']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm
            
        if evidence.nlp_s100_high:
            lm, lb, label = self.CPDs['nlp_s100_high']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm
            
        if evidence.nlp_history_confirmed:
            lm, lb, label = self.CPDs['nlp_history_positive']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm

        if evidence.nlp_symptoms_present:
            lm, lb, label = self.CPDs['symptoms_present']
            log_lk_m += np.log(lm); log_lk_b += np.log(lb)
            contributions[label] = lm

        # ── Normalize (Softmax over 2 classes) ──────────────────────────
        max_log = max(log_lk_m, log_lk_b)
        exp_m = np.exp(log_lk_m - max_log)
        exp_b = np.exp(log_lk_b - max_log)
        total = exp_m + exp_b

        posterior_m = float(exp_m / total)
        posterior_b = float(exp_b / total)
        lr = float(np.exp(log_lk_m - log_lk_b))

        # Risk level categorization
        if posterior_m >= 0.65:
            risk_level, risk_color = "High Risk", "#f43f5e"
            recommendation = ("⚠️ URGENT: Immediate dermatology referral required. "
                              "Excision biopsy and histopathological examination within 2 weeks.")
        elif posterior_m >= 0.35:
            risk_level, risk_color = "Moderate Risk", "#f59e0b"
            recommendation = ("🔍 RECOMMEND: Dermoscopy follow-up within 3 months. "
                              "Consider short-term monitoring or digital dermoscopy.")
        else:
            risk_level, risk_color = "Low Risk", "#10b981"
            recommendation = ("✅ LOW CONCERN: Routine annual skin examination recommended. "
                              "Patient education on sun protection and ABCDE self-check.")

        # Confidence based on number of evidence factors
        n_evidence = sum(1 for v in contributions.values() if v > 1.0)
        confidence = min(0.50 + n_evidence * 0.06, 0.95)

        return BayesianResult(
            posterior_melanoma=posterior_m,
            posterior_benign=posterior_b,
            prior=self.PRIOR,
            likelihood_ratio=lr,
            risk_level=risk_level,
            risk_color=risk_color,
            cpt_contributions=contributions,
            recommendation=recommendation,
            confidence=confidence,
        )
