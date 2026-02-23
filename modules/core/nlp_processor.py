"""
core/nlp_processor.py
Real NLP clinical entity extraction from EHR text.
No heavy ML libraries — uses regex + medical lexicon for MVP.
"""
import re
from dataclasses import dataclass, field
from typing import List, Dict, Tuple
import numpy as np
import warnings

warnings.filterwarnings("ignore")

try:
    from transformers import pipeline
    # Load a biomedical NER pipeline (BioBERT based)
    ner_pipeline = pipeline("ner", model="d4data/biomedical-ner-all", aggregation_strategy="simple")
except Exception as e:
    ner_pipeline = None
    print(f"Warning: Could not load HuggingFace NER pipeline. Falling back to regex-only. Err: {e}")


# ── Medical Lexicons ──────────────────────────────────────────────────────────
MELANOMA_RISK_TERMS = [
    "melanoma", "malignant", "carcinoma", "squamous", "basal cell",
    "atypical", "dysplastic", "irregular", "asymmetric", "ulcerated",
    "metastatic", "biopsy", "excision", "suspicious", "lesion growth",
    "color change", "bleeding lesion", "itching lesion", "BRAF mutation",
    "sentinel lymph", "stage", "dermoscopy finding", "sun damage",
    "actinic keratosis", "lentigo maligna",
]

MELANOMA_PROTECTIVE_TERMS = [
    "benign", "seborrheic keratosis", "dermatofibroma", "angioma",
    "regular borders", "homogeneous", "stable lesion", "no change",
    "routine checkup", "normal skin",
]

CANCER_HISTORY_TERMS = [
    "personal history of cancer", "melanoma history", "previous cancer",
    "family history melanoma", "mother melanoma", "father melanoma",
    "sibling melanoma", "prior excision",
]

DRUG_TERMS = [
    "pembrolizumab", "nivolumab", "ipilimumab", "dabrafenib", "trametinib",
    "vemurafenib", "immunotherapy", "checkpoint inhibitor", "targeted therapy",
    "chemotherapy", "radiation",
]

IMMUNOSUPPRESSION_TERMS = [
    "immunosuppressed", "hiv", "aids", "organ transplant", "cyclosporin",
    "tacrolimus", "methotrexate", "azathioprine", "corticosteroid",
]

SYMPTOM_TERMS = [
    "itching", "pruritus", "bleeding", "hemorrhage", "burning", 
    "painful", "tender", "rapid growth", "sudden change", "ulcerated",
]

LAB_PATTERN = re.compile(
    r'(LDH|S100|MIA|WBC|CRP|ESR|hemoglobin|platelet|creatinine|ALT|AST)\s*[:\=]?\s*([\d\.]+)\s*([a-zA-Z/]+)?',
    re.IGNORECASE
)

DATE_PATTERN = re.compile(
    r'\b(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}|\w+ \d{4})\b'
)


@dataclass
class ClinicalEntity:
    entity_type: str   # RISK_TERM, BENIGN_TERM, LAB_VALUE, DRUG, IMMUNOSUPPRESSION, HISTORY
    text: str
    value: str = ""
    unit: str = ""
    risk_weight: float = 0.0


@dataclass
class NLPReport:
    raw_text: str
    entities: List[ClinicalEntity] = field(default_factory=list)
    risk_keywords_found: List[str] = field(default_factory=list)
    benign_keywords_found: List[str] = field(default_factory=list)
    symptoms_found: List[str] = field(default_factory=list)
    lab_values: Dict[str, Tuple[float, str]] = field(default_factory=dict)
    drugs_found: List[str] = field(default_factory=list)
    immunosuppression: bool = False
    cancer_history: bool = False
    symptoms_present: bool = False
    
    # High-risk flags for Bayesian linkage
    ldh_high: bool = False             # > 250 U/L
    s100_high: bool = False            # > 0.15 ug/L
    clinical_history_confirmed: bool = False  # previous melanoma or family history
    
    summary: str = ""
    risk_score_contribution: float = 0.0
    benign_score_contribution: float = 0.0
    n_risk_terms: int = 0
    n_benign_terms: int = 0
    
    # Normalized Risk Vector [-1, 1] for Bayesian / ML mapping
    risk_vector: float = 0.0


class ClinicalNLPProcessor:
    """Extract clinical entities from EHR notes using BioBERT NER + Regex."""

    def process(self, text: str) -> NLPReport:
        report = NLPReport(raw_text=text)
        text_lower = text.lower()
        
        # 1. HuggingFace NER Extraction (if available)
        if ner_pipeline is not None and len(text.strip()) > 0:
            try:
                ner_results = ner_pipeline(text)
                for ent in ner_results:
                    ent_group = ent.get('entity_group', '')
                    word = ent.get('word', '').lower()
                    if ent_group in ['Diagnostic_procedure', 'Disease_disorder', 'Sign_symptom']:
                        if word in MELANOMA_RISK_TERMS or "melanoma" in word:
                            report.risk_keywords_found.append(word)
                            report.entities.append(ClinicalEntity(entity_type="RISK_TERM", text=word, risk_weight=1.0))
                    elif ent_group == 'Medication':
                        report.drugs_found.append(word)
                        report.entities.append(ClinicalEntity(entity_type="DRUG", text=word))
            except Exception as e:
                print(f"NER extraction failed: {e}")

        # 2. Add Regex/Lexicon fallbacks and specifics
        # ── Risk Terms ────────────────────────────────────────────────────────
        for term in MELANOMA_RISK_TERMS:
            if term.lower() in text_lower and term.lower() not in report.risk_keywords_found:
                report.risk_keywords_found.append(term)
                report.entities.append(ClinicalEntity(
                    entity_type="RISK_TERM", text=term, risk_weight=1.0))

        # ── Benign Terms ──────────────────────────────────────────────────────
        for term in MELANOMA_PROTECTIVE_TERMS:
            if term.lower() in text_lower:
                report.benign_keywords_found.append(term)
                report.entities.append(ClinicalEntity(
                    entity_type="BENIGN_TERM", text=term, risk_weight=-1.0))

        # ── Lab Values ────────────────────────────────────────────────────────
        for m in LAB_PATTERN.finditer(text):
            lab_name = m.group(1).upper()
            try:
                lab_value = float(m.group(2))
                lab_unit = m.group(3) or ""
            except (ValueError, AttributeError):
                continue
            report.lab_values[lab_name] = (lab_value, lab_unit)
            
            # Check thresholds (Biomarkers)
            if lab_name == "LDH" and lab_value > 250:
                report.ldh_high = True
                report.entities.append(ClinicalEntity(entity_type="BIOMARKER_HIGH", text="LDH", value=str(lab_value), risk_weight=1.5))
            if lab_name == "S100" and lab_value > 0.15:
                report.s100_high = True
                report.entities.append(ClinicalEntity(entity_type="BIOMARKER_HIGH", text="S100", value=str(lab_value), risk_weight=1.5))
                
            report.entities.append(ClinicalEntity(
                entity_type="LAB_VALUE", text=lab_name, value=str(lab_value), unit=lab_unit))

        # ── Drugs / Immunotherapy ─────────────────────────────────────────────
        for term in DRUG_TERMS:
            if term.lower() in text_lower and term.lower() not in report.drugs_found:
                report.drugs_found.append(term)
                report.entities.append(ClinicalEntity(entity_type="DRUG", text=term, risk_weight=0.5))

        # ── Immunosuppression ─────────────────────────────────────────────────
        for term in IMMUNOSUPPRESSION_TERMS:
            if term.lower() in text_lower:
                report.immunosuppression = True
                report.entities.append(ClinicalEntity(
                    entity_type="IMMUNOSUPPRESSION", text=term, risk_weight=1.5))
                break

        # ── Cancer History ────────────────────────────────────────────────────
        for term in CANCER_HISTORY_TERMS:
            if term.lower() in text_lower:
                report.cancer_history = True
                report.clinical_history_confirmed = True
                report.entities.append(ClinicalEntity(
                    entity_type="HISTORY", text=term, risk_weight=2.0))
                break

        # ── Symptoms ──────────────────────────────────────────────────────────
        for term in SYMPTOM_TERMS:
            if term.lower() in text_lower:
                report.symptoms_present = True
                report.symptoms_found.append(term)
                report.entities.append(ClinicalEntity(
                    entity_type="SYMPTOM", text=term, risk_weight=0.8))

        # ── Scores and Mapping ────────────────────────────────────────────────
        report.n_risk_terms = len(report.risk_keywords_found)
        report.n_benign_terms = len(report.benign_keywords_found)
        
        # Calculate raw risk
        raw_risk = sum(e.risk_weight for e in report.entities)
        
        # Map to Risk Vector [-1, 1] using tanh for smooth bounding
        report.risk_vector = float(np.tanh(raw_risk / 3.0)) 

        # ── Auto-Summary ──────────────────────────────────────────────────────
        report.summary = self._generate_summary(report)
        return report

    def _generate_summary(self, r: NLPReport) -> str:
        parts = []
        if r.risk_keywords_found:
            terms = ", ".join(list(set(r.risk_keywords_found))[:4])
            parts.append(f"**Risk terms identified**: {terms}{'...' if len(r.risk_keywords_found) > 4 else ''}.")
        if r.benign_keywords_found:
            terms = ", ".join(list(set(r.benign_keywords_found))[:3])
            parts.append(f"**Reassuring terms**: {terms}.")
        if r.symptoms_found:
            terms = ", ".join(list(set(r.symptoms_found))[:3])
            parts.append(f"**Notable Symptoms**: {terms}.")
        if r.lab_values:
            lab_str = ", ".join(f"{k}={v[0]}{v[1]}" for k, v in list(r.lab_values.items())[:4])
            parts.append(f"**Lab values extracted**: {lab_str}.")
        if r.drugs_found:
            parts.append(f"**Medications**: {', '.join(list(set(r.drugs_found))[:3])}.")
        if r.immunosuppression:
            parts.append("⚠️ **Immunosuppression detected** — elevated risk.")
        if r.cancer_history:
            parts.append("⚠️ **Oncology history retrieved** — significant risk factor.")
        
        parts.append(f"**Calculated NLP Risk Vector**: {r.risk_vector:.2f}")
        
        if not parts:
            parts.append("No specific clinical risk markers identified in the provided text.")
        return " ".join(parts)
