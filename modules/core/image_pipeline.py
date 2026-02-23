"""
core/image_pipeline.py
Real image preprocessing: LoG, DoG, Hessian-LoG saddle-point detection, GLCM Radiomics.
Extracts a feature vector from a dermoscopic image for ML classification.
"""
import numpy as np
from PIL import Image
from skimage import filters, feature, color, exposure
from skimage.feature import graycomatrix, graycoprops
from skimage.filters import gaussian, laplace
from scipy import ndimage
import warnings
import torch
import torchvision.models as models
import torchvision.transforms as transforms
warnings.filterwarnings("ignore")

# Initialize EfficientNet
try:
    weights = models.EfficientNet_B0_Weights.DEFAULT
    efficientnet = models.efficientnet_b0(weights=weights)
    # Remove the classification head to get latent features
    efficientnet = torch.nn.Sequential(*list(efficientnet.children())[:-1])
    efficientnet.eval()
    
    preprocess_en = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
except Exception as e:
    efficientnet = None
    print(f"Warning: Could not load EfficientNet. Fallback to basic features. Err: {e}")


# ── Preprocessing ────────────────────────────────────────────────────────────
def load_image(pil_image: Image.Image, size: tuple = (256, 256)) -> np.ndarray:
    """Resize, convert to RGB, normalize to [0,1]."""
    img = pil_image.convert("RGB").resize(size)
    return np.array(img) / 255.0


def to_gray(img: np.ndarray) -> np.ndarray:
    if img.ndim == 3:
        return color.rgb2gray(img)
    return img


# ── Computer Vision Filters ───────────────────────────────────────────────────
def apply_log(gray: np.ndarray, sigma: float = 2.0) -> np.ndarray:
    """Laplacian of Gaussian — blob/edge detection."""
    return ndimage.gaussian_laplace(gray, sigma=sigma)


def apply_dog(gray: np.ndarray, sigma1: float = 1.0, sigma2: float = 3.0) -> np.ndarray:
    """Difference of Gaussians — multi-scale edge detection."""
    return gaussian(gray, sigma=sigma1) - gaussian(gray, sigma=sigma2)


def apply_hessian_log(gray: np.ndarray, sigma: float = 2.0) -> np.ndarray:
    """
    Hessian-LoG for saddle point / curvature detection (blob-like structures).
    Detects regions where the surface curvature changes (saddles), often 
    characteristic of atypical pigment networks.
    """
    Hxx = ndimage.gaussian_filter(gray, sigma, order=(2, 0))
    Hyy = ndimage.gaussian_filter(gray, sigma, order=(0, 2))
    Hxy = ndimage.gaussian_filter(gray, sigma, order=(1, 1))
    
    # Determinant of Hessian (DoH) - Blob detector
    doh = Hxx * Hyy - Hxy ** 2
    
    # Combine with LoG for localized curvature sensitivity
    log = apply_log(gray, sigma)
    return doh * log


def detect_roi(gray: np.ndarray) -> np.ndarray:
    """Detect Region of Interest using Otsu thresholding."""
    thresh = filters.threshold_otsu(gray)
    return gray > thresh


def find_saddle_points(hessian: np.ndarray, min_distance: int = 15) -> list:
    """Find local saddle regions from Hessian-LoG map."""
    # Normalize to [0,1]
    h_abs = np.abs(hessian)
    h_norm = (h_abs - h_abs.min()) / (h_abs.ptp() + 1e-8)
    # Find coordinates of top activations
    peaks = feature.peak_local_max(h_norm, min_distance=min_distance, num_peaks=10)
    return peaks.tolist()


# ── Radiomics — GLCM Feature Extraction ──────────────────────────────────────
def extract_glcm_features(gray: np.ndarray) -> dict:
    """
    Gray-Level Co-occurrence Matrix (GLCM) — extract texture features:
    Contrast, Dissimilarity, Homogeneity, Energy, Correlation, ASM.
    """
    # Convert to uint8 (0–255)
    gray_uint8 = (gray * 255).astype(np.uint8)
    # Reduce levels for GLCM
    gray_lvl = (gray_uint8 // 16).astype(np.uint8)  # 16 gray levels

    # Compute GLCM at 4 angles
    distances = [1, 3]
    angles = [0, np.pi/4, np.pi/2, 3*np.pi/4]
    glcm = graycomatrix(gray_lvl, distances=distances, angles=angles,
                         levels=16, symmetric=True, normed=True)

    features = {}
    for prop in ['contrast', 'dissimilarity', 'homogeneity', 'energy', 'correlation', 'ASM']:
        vals = graycoprops(glcm, prop)
        features[f'glcm_{prop}_mean'] = float(vals.mean())
        features[f'glcm_{prop}_std'] = float(vals.std())
    return features


def detect_blobs(gray: np.ndarray) -> dict:
    """Implement multi-scale blob detection using Laplacian of Gaussian (LoG)."""
    blobs = feature.blob_log(gray, max_sigma=30, num_sigma=10, threshold=.1)
    # The 3rd column is sigma, radius is approx sqrt(2) * sigma
    radii = blobs[:, 2] * np.sqrt(2) if len(blobs) > 0 else np.array([0])
    
    return {
        'blob_count': float(len(blobs)),
        'blob_mean_radius': float(np.mean(radii)) if len(radii) > 0 else 0.0,
        'blob_max_radius': float(np.max(radii)) if len(radii) > 0 else 0.0
    }

# ── Feature Vector ────────────────────────────────────────────────────────────
def extract_feature_vector(pil_image: Image.Image) -> dict:
    """
    Full pipeline: Load → Prefilter → CV filters → GLCM → EfficientNet → Feature vector.
    Returns a dict of ALL computed features.
    """
    try:
        img = load_image(pil_image)
        gray = to_gray(img)
    except Exception as e:
        print(f"Error loading image: {e}")
        return {}

    # Enhance contrast
    gray = exposure.equalize_adapthist(gray, clip_limit=0.03)

    # Apply CV filters
    log_map = apply_log(gray, sigma=2.0)
    dog_map = apply_dog(gray, sigma1=1.0, sigma2=3.0)
    hessian_log = apply_hessian_log(gray, sigma=2.0)
    roi = detect_roi(gray)
    blob_stats = detect_blobs(gray)

    # Compute image-level stats from filter responses
    features = {
        # LoG features
        'log_mean': float(log_map.mean()),
        'log_std': float(log_map.std()),
        'log_max': float(log_map.max()),
        'log_energy': float((log_map ** 2).mean()),

        # DoG features
        'dog_mean': float(dog_map.mean()),
        'dog_std': float(dog_map.std()),
        'dog_energy': float((dog_map ** 2).mean()),

        # Hessian-LoG saddle curvature
        'hessian_mean': float(hessian_log.mean()),
        'hessian_std': float(hessian_log.std()),
        'hessian_neg_ratio': float((hessian_log < 0).mean()),  # saddle proportion

        # ROI metrics
        'roi_coverage': float(roi.mean()),

        # Blob metrics
        'blob_count': blob_stats['blob_count'],
        'blob_mean_radius': blob_stats['blob_mean_radius'],
        'blob_max_radius': blob_stats['blob_max_radius'],

        # Raw image stats
        'brightness': float(gray.mean()),
        'brightness_std': float(gray.std()),

        # Color channel stats (RGB)
        'red_mean': float(img[:, :, 0].mean()),
        'green_mean': float(img[:, :, 1].mean()),
        'blue_mean': float(img[:, :, 2].mean()),
        'red_std': float(img[:, :, 0].std()),
        'color_asymmetry': float(abs(img[:, :, 0].mean() - img[:, :, 2].mean())),
    }

    # GLCM Radiomics
    features.update(extract_glcm_features(gray))

    # CNN Latent Features (EfficientNet-B0)
    if efficientnet is not None:
        try:
            # Re-convert to RGB image for PyTorch transforms
            img_rgb_pil = pil_image.convert('RGB')
            input_tensor = preprocess_en(img_rgb_pil)
            input_batch = input_tensor.unsqueeze(0)  # create a mini-batch as expected by the model

            if torch.cuda.is_available():
                input_batch = input_batch.to('cuda')
                efficientnet.to('cuda')

            with torch.no_grad():
                output = efficientnet(input_batch)
                # Output shape is typically [1, 1280, 7, 7] or similar before flattening.
                # Average pooling over spatial dimensions to get 1D feature vector per image.
                cnn_features = torch.nn.functional.adaptive_avg_pool2d(output, (1, 1)).flatten().cpu().numpy()
            
            # Select top 20 PCA-like principal components (simplified: just taking first 20 nodes to keep dimensionality low for DB serialization)
            for i in range(min(20, len(cnn_features))):
                features[f'cnn_feature_{i}'] = float(cnn_features[i])

        except Exception as e:
            print(f"Error extracting Deep Features: {e}")
            pass

    return features


def feature_vector_to_array(features: dict) -> np.ndarray:
    """Convert feature dict to numpy array for ML model input."""
    return np.array(list(features.values()), dtype=np.float32)


def score_image_risk(features: dict) -> float:
    """
    Heuristic risk scoring from image features (0–1).
    Based on known dermoscopic risk indicators:
    - High contrast = irregular color
    - Low homogeneity = irregular texture
    - High LoG energy = sharp irregular borders
    - Low GLCM correlation = no repeating pattern (malignant)
    """
    score = 0.0

    # Border irregularity (LoG energy → irregular border)
    score += min(features.get('log_energy', 0) * 80, 0.25)

    # Texture irregularity (low homogeneity → bad)
    homogeneity = features.get('glcm_homogeneity_mean', 0.5)
    score += (1 - homogeneity) * 0.2

    # Color variation (high std in red channel → multicolor)
    score += min(features.get('red_std', 0) * 1.5, 0.15)

    # Asymmetry via color channels differences
    score += min(features.get('color_asymmetry', 0) * 2.5, 0.15)

    # High DoG energy = suspicious edge complexity
    score += min(features.get('dog_energy', 0) * 60, 0.15)

    # Saddle point density (hessian negative ratio)
    score += min(features.get('hessian_neg_ratio', 0) * 0.12, 0.10)

    return min(score, 0.99)


def generate_filter_report(features: dict) -> list:
    """Generate human-readable interpretation of filter results."""
    report = []

    log_e = features.get('log_energy', 0)
    if log_e > 0.002:
        report.append(("LoG: Significant Edges Detected", "danger",
                        f"LoG energy={log_e:.5f} — Irregular lesion borders identified (high LoG energy). Possible indicator of malignancy."))
    else:
        report.append(("LoG: Smooth Borders", "success",
                        f"LoG energy={log_e:.5f} — Even, regular border characteristics detected."))

    hom = features.get('glcm_homogeneity_mean', 0)
    if hom < 0.4:
        report.append(("GLCM: Heterogeneous Texture", "danger",
                        f"Homogeneity={hom:.3f} — Non-homogeneous tumor texture (typical of melanoma)."))
    elif hom < 0.6:
        report.append(("GLCM: Moderate Heterogeneity", "warning",
                        f"Homogeneity={hom:.3f} — Moderate texture irregularity. Monitoring recommended."))
    else:
        report.append(("GLCM: Homogeneous Texture", "success",
                        f"Homogeneity={hom:.3f} — Smooth, uniform skin texture detected."))

    dog_e = features.get('dog_energy', 0)
    if dog_e > 0.003:
        report.append(("DoG: Complex Features", "warning",
                        f"DoG energy={dog_e:.5f} — Multiple edge/structure scales detected (suspicious blob-like structures)."))
    else:
        report.append(("DoG: Simple Structure", "success",
                        f"DoG energy={dog_e:.5f} — Single-scale structure (low morphological complexity)."))

    hess_neg = features.get('hessian_neg_ratio', 0)
    if hess_neg > 0.55:
        report.append(("Hessian-LoG: Saddle Points Found", "danger",
                        f"Saddle ratio={hess_neg:.3f} — Dense saddle points detected (atypical pigment network morphology)."))
    else:
        report.append(("Hessian-LoG: Normal Curvature", "success",
                        f"Saddle ratio={hess_neg:.3f} — Normal surface curvature characteristics."))

    return report
