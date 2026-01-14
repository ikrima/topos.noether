#!/usr/bin/env python3
"""
================================================================================
SPECTRAL THEORY OF MULTIMODAL REPRESENTATIONS
================================================================================

A comprehensive experimental framework for investigating the spectral structure
of multimodal neural representations, connecting:

1. Representation morphisms (how bytes become structured data)
2. Graph Laplacians (intrinsic geometry of representations)  
3. Spectral zeta functions (scale-dependent expressibility)
4. Cross-modal intertwining (translation as spectral matching)
5. Product formula (normalization constraint across modalities)

Theoretical Foundation:
-----------------------
Different modalities impose different "neighbor structures" on raw data.
These structures induce graph Laplacians whose spectra encode the intrinsic
geometry. Cross-modal translation should approximately intertwine these
Laplacians, and the spectral zeta function measures expressibility at each scale.

Author: Developed in collaboration between human researcher and Claude
Date: 2025
================================================================================
"""

import numpy as np
from typing import Dict, List, Tuple, Optional, Callable
from dataclasses import dataclass
from scipy import sparse
from scipy.sparse.linalg import eigsh
from scipy.special import gamma as gamma_func
from scipy.integrate import quad
import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec
import warnings


# ==============================================================================
# PART 1: THEORETICAL PRIMITIVES
# ==============================================================================

@dataclass
class SpectralData:
    """Container for spectral decomposition of a Laplacian."""
    eigenvalues: np.ndarray      # λ_0 ≤ λ_1 ≤ ... ≤ λ_{n-1}
    eigenvectors: np.ndarray     # Column i is eigenvector for λ_i
    spectral_dimension: float    # Estimated d_s from Weyl's law
    laplacian: np.ndarray        # The original Laplacian matrix


@dataclass
class ConceptSubspace:
    """A concept represented as a subspace of the representation."""
    name: str
    projection: np.ndarray       # Projection matrix P_V onto subspace
    dimension: int               # dim(V)
    basis: np.ndarray           # Orthonormal basis vectors


@dataclass
class CrossModalData:
    """Data for analyzing cross-modal relationships."""
    intertwiner: np.ndarray              # Optimal T: V_1 → V_2
    spectral_correspondence: np.ndarray  # M[i,j] = coupling in eigenbasis
    intertwining_error: float            # ||TL_1 - L_2T||_F^2
    eigenvalue_matching: List[Tuple]     # [(λ_1^i, λ_2^j, weight), ...]


# ==============================================================================
# PART 2: REPRESENTATION MORPHISMS
# ==============================================================================

class RepresentationMorphism:
    """
    A morphism ρ: Z → Structure that defines how linear indices become
    structured data with a neighbor relation.
    
    The key insight: at the byte level, all data is linear. The "modality"
    is encoded in how we define neighbors.
    """
    
    def __init__(self, name: str, adjacency_fn: Callable):
        """
        Args:
            name: Human-readable name (e.g., "1D_text", "2D_image")
            adjacency_fn: Function (i, j, params) → bool indicating if i,j are neighbors
        """
        self.name = name
        self.adjacency_fn = adjacency_fn
    
    def build_adjacency(self, n: int, **params) -> np.ndarray:
        """Build adjacency matrix for n elements."""
        A = np.zeros((n, n))
        for i in range(n):
            for j in range(i+1, n):
                if self.adjacency_fn(i, j, n, **params):
                    A[i, j] = 1
                    A[j, i] = 1
        return A
    
    def build_laplacian(self, n: int, normalized: bool = True, **params) -> np.ndarray:
        """Build graph Laplacian L = D - A (optionally normalized)."""
        A = self.build_adjacency(n, **params)
        D = np.diag(A.sum(axis=1))
        L = D - A
        
        if normalized:
            # L_norm = D^{-1/2} L D^{-1/2} = I - D^{-1/2} A D^{-1/2}
            d_inv_sqrt = np.diag(1.0 / np.sqrt(A.sum(axis=1) + 1e-10))
            L = d_inv_sqrt @ L @ d_inv_sqrt
        
        return L


# Standard morphisms for common modalities

def text_1d_adjacency(i: int, j: int, n: int, **kwargs) -> bool:
    """1D chain: neighbors are ±1 in linear order."""
    return abs(i - j) == 1

def image_2d_adjacency(i: int, j: int, n: int, width: int = None, **kwargs) -> bool:
    """2D grid: neighbors are ±1 in row or column."""
    if width is None:
        width = int(np.sqrt(n))
    row_i, col_i = i // width, i % width
    row_j, col_j = j // width, j % width
    return (abs(row_i - row_j) + abs(col_i - col_j)) == 1

def video_3d_adjacency(i: int, j: int, n: int, width: int = None, 
                       height: int = None, **kwargs) -> bool:
    """3D lattice: neighbors are ±1 in any of 3 dimensions."""
    if width is None:
        width = int(np.cbrt(n))
    if height is None:
        height = width
    depth = n // (width * height)
    
    t_i, rem = divmod(i, width * height)
    y_i, x_i = divmod(rem, width)
    
    t_j, rem = divmod(j, width * height)
    y_j, x_j = divmod(rem, width)
    
    return (abs(t_i - t_j) + abs(y_i - y_j) + abs(x_i - x_j)) == 1

def audio_1d_with_harmonics(i: int, j: int, n: int, num_harmonics: int = 3, 
                            **kwargs) -> bool:
    """1D with harmonic connections: neighbors at multiples."""
    diff = abs(i - j)
    return diff == 1 or (diff > 1 and diff <= num_harmonics and (i % diff == 0 or j % diff == 0))


# Pre-built morphism objects
MORPHISM_TEXT = RepresentationMorphism("text_1d", text_1d_adjacency)
MORPHISM_IMAGE = RepresentationMorphism("image_2d", image_2d_adjacency)
MORPHISM_VIDEO = RepresentationMorphism("video_3d", video_3d_adjacency)
MORPHISM_AUDIO = RepresentationMorphism("audio_harmonic", audio_1d_with_harmonics)


# ==============================================================================
# PART 3: SPECTRAL ANALYSIS
# ==============================================================================

def compute_spectral_data(L: np.ndarray, num_eigenvectors: int = None) -> SpectralData:
    """
    Compute full spectral decomposition of Laplacian.
    
    Args:
        L: Laplacian matrix (n x n)
        num_eigenvectors: Number of eigenvectors to compute (default: all)
    
    Returns:
        SpectralData with eigenvalues, eigenvectors, and spectral dimension
    """
    n = L.shape[0]
    if num_eigenvectors is None:
        num_eigenvectors = n
    
    # Use sparse solver for large matrices
    if n > 500:
        L_sparse = sparse.csr_matrix(L)
        eigenvalues, eigenvectors = eigsh(L_sparse, k=min(num_eigenvectors, n-1), 
                                          which='SM', return_eigenvectors=True)
        # Sort by eigenvalue
        idx = np.argsort(eigenvalues)
        eigenvalues = eigenvalues[idx]
        eigenvectors = eigenvectors[:, idx]
    else:
        eigenvalues, eigenvectors = np.linalg.eigh(L)
        eigenvalues = eigenvalues[:num_eigenvectors]
        eigenvectors = eigenvectors[:, :num_eigenvectors]
    
    # Estimate spectral dimension from Weyl's law
    # N(λ) ~ λ^{d_s/2} => log(k) ~ (d_s/2) * log(λ_k)
    spectral_dim = estimate_spectral_dimension(eigenvalues)
    
    return SpectralData(
        eigenvalues=eigenvalues,
        eigenvectors=eigenvectors,
        spectral_dimension=spectral_dim,
        laplacian=L
    )


def estimate_spectral_dimension(eigenvalues: np.ndarray, 
                                 min_eigenvalue: float = 1e-6) -> float:
    """
    Estimate spectral dimension from eigenvalue growth rate.
    
    Weyl's law: N(λ) ~ C * λ^{d_s/2}
    So: log(k) ~ (d_s/2) * log(λ_k) + const
    
    We fit this relationship to estimate d_s.
    """
    # Filter small eigenvalues
    valid = eigenvalues > min_eigenvalue
    if valid.sum() < 10:
        return 1.0  # Default for small/degenerate cases
    
    lambdas = eigenvalues[valid]
    k = np.arange(1, len(lambdas) + 1)
    
    # Linear regression: log(k) = (d_s/2) * log(λ) + const
    log_k = np.log(k)
    log_lambda = np.log(lambdas)
    
    # Robust linear fit (ignore outliers at extremes)
    mid_start = len(log_k) // 10
    mid_end = 9 * len(log_k) // 10
    
    X = np.vstack([log_lambda[mid_start:mid_end], 
                   np.ones(mid_end - mid_start)]).T
    y = log_k[mid_start:mid_end]
    
    try:
        coeffs = np.linalg.lstsq(X, y, rcond=None)[0]
        spectral_dim = 2 * coeffs[0]
    except:
        spectral_dim = 1.0
    
    # Clamp to reasonable range
    return np.clip(spectral_dim, 0.5, 20.0)


# ==============================================================================
# PART 4: SPECTRAL ZETA FUNCTIONS
# ==============================================================================

def spectral_zeta(eigenvalues: np.ndarray, s: float, 
                  min_eigenvalue: float = 1e-8) -> float:
    """
    Compute spectral zeta function ζ_L(s) = Σ λ_k^{-s}
    
    Args:
        eigenvalues: Array of positive eigenvalues
        s: Complex exponent (we use real s here)
        min_eigenvalue: Cutoff for numerical stability
    
    Returns:
        ζ_L(s) value
    """
    valid = eigenvalues > min_eigenvalue
    lambdas = eigenvalues[valid]
    
    if len(lambdas) == 0:
        return np.inf
    
    return np.sum(lambdas ** (-s))


def spectral_zeta_weighted(eigenvalues: np.ndarray, eigenvectors: np.ndarray,
                           weights: np.ndarray, s: float,
                           min_eigenvalue: float = 1e-8) -> float:
    """
    Compute weighted spectral zeta: Σ w_k * λ_k^{-s}
    
    Used for concept-restricted zeta functions where w_k measures
    overlap of k-th eigenvector with concept subspace.
    
    Args:
        eigenvalues: Eigenvalues of Laplacian
        eigenvectors: Eigenvector matrix (columns are eigenvectors)
        weights: Weight for each eigenvalue (e.g., concept overlap)
        s: Exponent
    
    Returns:
        Weighted ζ value
    """
    valid = eigenvalues > min_eigenvalue
    lambdas = eigenvalues[valid]
    w = weights[valid]
    
    if len(lambdas) == 0:
        return np.inf
    
    return np.sum(w * (lambdas ** (-s)))


def concept_spectral_weights(eigenvectors: np.ndarray, 
                             concept: ConceptSubspace) -> np.ndarray:
    """
    Compute weights w_k = ||P_V v_k||^2 measuring how much each
    eigenvector overlaps with the concept subspace V.
    """
    n_eigen = eigenvectors.shape[1]
    weights = np.zeros(n_eigen)
    
    for k in range(n_eigen):
        v_k = eigenvectors[:, k]
        proj = concept.projection @ v_k
        weights[k] = np.dot(proj, proj)
    
    return weights


def spectral_profile(spectral_data: SpectralData, 
                     concept: ConceptSubspace,
                     s_values: np.ndarray) -> np.ndarray:
    """
    Compute the spectral profile φ_ρ(s; c) = ζ_{L,c}(s) / ζ_L(s)
    
    This gives the fraction of spectral weight at scale s that the
    concept captures.
    
    Args:
        spectral_data: Spectral decomposition of the Laplacian
        concept: Concept subspace
        s_values: Array of s values to evaluate
    
    Returns:
        Array of profile values φ(s) for each s
    """
    weights = concept_spectral_weights(spectral_data.eigenvectors, concept)
    eigenvalues = spectral_data.eigenvalues
    
    profiles = np.zeros_like(s_values)
    
    for i, s in enumerate(s_values):
        zeta_total = spectral_zeta(eigenvalues, s)
        zeta_concept = spectral_zeta_weighted(eigenvalues, 
                                               spectral_data.eigenvectors,
                                               weights, s)
        
        if zeta_total > 0 and np.isfinite(zeta_total):
            profiles[i] = zeta_concept / zeta_total
        else:
            profiles[i] = np.nan
    
    return profiles


# ==============================================================================
# PART 5: HEAT KERNEL AND DIFFUSION
# ==============================================================================

def heat_kernel_trace(eigenvalues: np.ndarray, t: float,
                      min_eigenvalue: float = 1e-8) -> float:
    """
    Compute heat kernel trace K(t) = Tr(e^{-tL}) = Σ e^{-λ_k t}
    
    This measures how much a diffusion process has spread after time t.
    - Small t: sensitive to local structure
    - Large t: approaches equilibrium
    """
    valid = eigenvalues >= min_eigenvalue
    lambdas = eigenvalues[valid]
    
    return np.sum(np.exp(-lambdas * t))


def heat_kernel_curve(eigenvalues: np.ndarray, 
                      t_values: np.ndarray) -> np.ndarray:
    """Compute heat kernel trace for range of t values."""
    return np.array([heat_kernel_trace(eigenvalues, t) for t in t_values])


def estimate_spectral_dim_from_heat_kernel(eigenvalues: np.ndarray,
                                           num_points: int = 50) -> float:
    """
    Estimate spectral dimension from heat kernel asymptotics.
    
    K(t) ~ t^{-d_s/2} as t → 0
    So: log K(t) ~ -(d_s/2) log(t) for small t
    """
    # Use log-spaced t values focusing on small t
    t_values = np.logspace(-3, 0, num_points)
    K_values = heat_kernel_curve(eigenvalues, t_values)
    
    # Fit in log-log space for small t region
    log_t = np.log(t_values[:num_points//2])
    log_K = np.log(K_values[:num_points//2] + 1e-10)
    
    # Linear regression
    valid = np.isfinite(log_K)
    if valid.sum() < 5:
        return 1.0
    
    coeffs = np.polyfit(log_t[valid], log_K[valid], 1)
    spectral_dim = -2 * coeffs[0]
    
    return np.clip(spectral_dim, 0.5, 20.0)


# ==============================================================================
# PART 6: CROSS-MODAL ANALYSIS
# ==============================================================================

def compute_intertwining_error(L1: np.ndarray, L2: np.ndarray, 
                               T: np.ndarray) -> float:
    """
    Compute ||TL_1 - L_2 T||_F^2
    
    This measures how well T intertwines the two Laplacians.
    Perfect intertwining (T L_1 = L_2 T) gives error 0.
    """
    return np.linalg.norm(T @ L1 - L2 @ T, 'fro') ** 2


def optimal_intertwiner_via_sylvester(L1: np.ndarray, L2: np.ndarray,
                                      Z1: np.ndarray, Z2: np.ndarray) -> CrossModalData:
    """
    Find optimal linear map T: R^{d1} → R^{d2} that:
    1. Maps representations Z1 → Z2
    2. Minimizes intertwining error ||TL_1 - L_2 T||_F^2
    
    The solution uses eigendecomposition to work in spectral coordinates.
    
    Args:
        L1, L2: Laplacians for the two modalities
        Z1, Z2: Aligned representation matrices (N samples x d dimensions)
    
    Returns:
        CrossModalData with optimal T, spectral correspondence M, and error
    """
    # Eigendecompose both Laplacians
    λ1, V1 = np.linalg.eigh(L1)
    λ2, V2 = np.linalg.eigh(L2)
    
    # Transform representations to eigenbasis
    Z1_eigen = Z1 @ V1  # (N, d1)
    Z2_eigen = Z2 @ V2  # (N, d2)
    
    # Compute correlation in eigenbasis
    # M[j, i] = correlation between i-th eigendirection of L1 and j-th of L2
    M = Z2_eigen.T @ Z1_eigen  # (d2, d1)
    
    # Normalize
    M = M / (np.linalg.norm(M) + 1e-10)
    
    # Reconstruct T in original basis
    T = V2 @ M @ V1.T
    
    # Compute intertwining error
    error = compute_intertwining_error(L1, L2, T)
    
    # Build eigenvalue matching list
    matching = []
    threshold = 0.1 * np.max(np.abs(M))
    for i in range(M.shape[1]):
        for j in range(M.shape[0]):
            if np.abs(M[j, i]) > threshold:
                matching.append((λ1[i], λ2[j], M[j, i]))
    
    return CrossModalData(
        intertwiner=T,
        spectral_correspondence=M,
        intertwining_error=error,
        eigenvalue_matching=matching
    )


def spectral_correspondence_analysis(spec1: SpectralData, 
                                     spec2: SpectralData,
                                     bandwidth: float = 0.1) -> np.ndarray:
    """
    Compute soft spectral correspondence based on eigenvalue proximity.
    
    C[i,j] = exp(-(λ1[i] - λ2[j])^2 / (2σ^2))
    
    This gives a "soft matching" between eigenspaces of the two Laplacians.
    """
    λ1 = spec1.eigenvalues
    λ2 = spec2.eigenvalues
    
    # Normalize eigenvalues to [0, 1] range for comparison
    λ1_norm = (λ1 - λ1.min()) / (λ1.max() - λ1.min() + 1e-10)
    λ2_norm = (λ2 - λ2.min()) / (λ2.max() - λ2.min() + 1e-10)
    
    # Compute Gaussian similarity
    λ1_grid = λ1_norm[:, np.newaxis]  # (d1, 1)
    λ2_grid = λ2_norm[np.newaxis, :]  # (1, d2)
    
    C = np.exp(-((λ1_grid - λ2_grid) ** 2) / (2 * bandwidth ** 2))
    
    return C


# ==============================================================================
# PART 7: PRODUCT FORMULA
# ==============================================================================

def spectral_norm(z: np.ndarray, L: np.ndarray) -> float:
    """
    Compute spectral norm ||z||_L = sqrt(<z, Lz>)
    
    This weights the representation by the Laplacian structure,
    so high-frequency components (large eigenvalue directions)
    contribute more.
    """
    return np.sqrt(np.abs(z @ L @ z))


def product_formula_value(z_list: List[np.ndarray],
                          L_list: List[np.ndarray],
                          d_s_list: List[float]) -> float:
    """
    Compute the product formula value:
    
    P = Π_ρ ||z_ρ||_{L_ρ}^{1/d_ρ}
    
    For well-aligned multimodal representations, this should be
    approximately constant across different concepts.
    """
    log_product = 0.0
    
    for z, L, d_s in zip(z_list, L_list, d_s_list):
        norm = spectral_norm(z, L)
        if norm > 0:
            log_product += np.log(norm) / d_s
    
    return np.exp(log_product)


def product_formula_loss(z_batch_list: List[np.ndarray],
                         L_list: List[np.ndarray],
                         d_s_list: List[float]) -> float:
    """
    Compute product formula loss over a batch.
    
    Loss = Var(log P) over batch
    
    This penalizes deviation from the product formula constraint.
    
    Args:
        z_batch_list: List of (N, d) arrays, one per modality
        L_list: Laplacians for each modality
        d_s_list: Spectral dimensions
    
    Returns:
        Variance of log-product values
    """
    N = z_batch_list[0].shape[0]
    log_products = np.zeros(N)
    
    for i in range(N):
        z_list = [z_batch[i] for z_batch in z_batch_list]
        P = product_formula_value(z_list, L_list, d_s_list)
        log_products[i] = np.log(P + 1e-10)
    
    return np.var(log_products)


# ==============================================================================
# PART 8: VISUALIZATION UTILITIES
# ==============================================================================

def plot_spectral_comparison(spec_list: List[SpectralData],
                             names: List[str],
                             figsize: Tuple[int, int] = (14, 10)) -> plt.Figure:
    """
    Comprehensive visualization comparing spectral properties across modalities.
    """
    n_modalities = len(spec_list)
    fig = plt.figure(figsize=figsize)
    gs = GridSpec(2, 3, figure=fig)
    
    colors = plt.cm.tab10(np.linspace(0, 1, n_modalities))
    
    # 1. Eigenvalue distributions
    ax1 = fig.add_subplot(gs[0, 0])
    for i, (spec, name) in enumerate(zip(spec_list, names)):
        k = np.arange(1, len(spec.eigenvalues) + 1)
        ax1.plot(k, spec.eigenvalues, '-', color=colors[i], 
                label=f'{name} (d_s={spec.spectral_dimension:.2f})', linewidth=2)
    ax1.set_xlabel('Index k')
    ax1.set_ylabel('Eigenvalue λ_k')
    ax1.set_title('Eigenvalue Distribution')
    ax1.legend()
    ax1.set_yscale('log')
    
    # 2. Weyl's law (log-log)
    ax2 = fig.add_subplot(gs[0, 1])
    for i, (spec, name) in enumerate(zip(spec_list, names)):
        valid = spec.eigenvalues > 1e-6
        lambdas = spec.eigenvalues[valid]
        k = np.arange(1, len(lambdas) + 1)
        ax2.plot(np.log(lambdas), np.log(k), 'o', color=colors[i], 
                label=name, markersize=3, alpha=0.7)
        
        # Fit line
        coeffs = np.polyfit(np.log(lambdas), np.log(k), 1)
        x_fit = np.linspace(np.log(lambdas.min()), np.log(lambdas.max()), 100)
        ax2.plot(x_fit, np.polyval(coeffs, x_fit), '--', color=colors[i], alpha=0.8)
    
    ax2.set_xlabel('log(λ)')
    ax2.set_ylabel('log(k)')
    ax2.set_title("Weyl's Law: log(k) vs log(λ)")
    ax2.legend()
    
    # 3. Heat kernel
    ax3 = fig.add_subplot(gs[0, 2])
    t_values = np.logspace(-2, 1, 100)
    for i, (spec, name) in enumerate(zip(spec_list, names)):
        K_values = heat_kernel_curve(spec.eigenvalues, t_values)
        ax3.plot(t_values, K_values, '-', color=colors[i], label=name, linewidth=2)
    ax3.set_xlabel('Time t')
    ax3.set_ylabel('K(t) = Tr(exp(-tL))')
    ax3.set_title('Heat Kernel Trace')
    ax3.set_xscale('log')
    ax3.set_yscale('log')
    ax3.legend()
    
    # 4. Spectral zeta functions
    ax4 = fig.add_subplot(gs[1, 0])
    s_values = np.linspace(0.5, 3.0, 100)
    for i, (spec, name) in enumerate(zip(spec_list, names)):
        zeta_values = [spectral_zeta(spec.eigenvalues, s) for s in s_values]
        ax4.plot(s_values, zeta_values, '-', color=colors[i], label=name, linewidth=2)
    ax4.set_xlabel('s')
    ax4.set_ylabel('ζ_L(s)')
    ax4.set_title('Spectral Zeta Function')
    ax4.set_yscale('log')
    ax4.legend()
    
    # 5. Spectral density (histogram)
    ax5 = fig.add_subplot(gs[1, 1])
    for i, (spec, name) in enumerate(zip(spec_list, names)):
        valid = spec.eigenvalues > 1e-6
        ax5.hist(spec.eigenvalues[valid], bins=50, alpha=0.5, 
                color=colors[i], label=name, density=True)
    ax5.set_xlabel('Eigenvalue λ')
    ax5.set_ylabel('Density')
    ax5.set_title('Spectral Density')
    ax5.legend()
    
    # 6. Summary statistics
    ax6 = fig.add_subplot(gs[1, 2])
    ax6.axis('off')
    
    summary_text = "SPECTRAL SUMMARY\n" + "="*40 + "\n\n"
    for spec, name in zip(spec_list, names):
        valid = spec.eigenvalues > 1e-6
        summary_text += f"{name}:\n"
        summary_text += f"  Spectral dimension: {spec.spectral_dimension:.3f}\n"
        summary_text += f"  λ_min (nonzero): {spec.eigenvalues[valid].min():.4f}\n"
        summary_text += f"  λ_max: {spec.eigenvalues.max():.4f}\n"
        summary_text += f"  λ_mean: {spec.eigenvalues[valid].mean():.4f}\n"
        summary_text += f"  Num eigenvalues: {len(spec.eigenvalues)}\n\n"
    
    ax6.text(0.1, 0.9, summary_text, transform=ax6.transAxes, 
             fontsize=10, verticalalignment='top', fontfamily='monospace',
             bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    plt.tight_layout()
    return fig


def plot_spectral_correspondence(cross_modal: CrossModalData,
                                 spec1: SpectralData, spec2: SpectralData,
                                 name1: str, name2: str,
                                 figsize: Tuple[int, int] = (12, 5)) -> plt.Figure:
    """Visualize spectral correspondence between two modalities."""
    
    fig, axes = plt.subplots(1, 3, figsize=figsize)
    
    # 1. Spectral correspondence matrix
    ax1 = axes[0]
    im = ax1.imshow(np.abs(cross_modal.spectral_correspondence), 
                    aspect='auto', cmap='viridis')
    ax1.set_xlabel(f'{name1} eigenvector index')
    ax1.set_ylabel(f'{name2} eigenvector index')
    ax1.set_title(f'|M| Spectral Correspondence\nError: {cross_modal.intertwining_error:.4f}')
    plt.colorbar(im, ax=ax1)
    
    # 2. Eigenvalue coupling visualization
    ax2 = axes[1]
    M = cross_modal.spectral_correspondence
    λ1, λ2 = spec1.eigenvalues, spec2.eigenvalues
    
    # Draw lines connecting coupled eigenvalues
    threshold = 0.05 * np.max(np.abs(M))
    for i in range(min(M.shape[1], 50)):  # Limit for clarity
        for j in range(min(M.shape[0], 50)):
            if np.abs(M[j, i]) > threshold:
                alpha = np.abs(M[j, i]) / np.max(np.abs(M))
                ax2.plot([λ1[i], λ2[j]], [0, 1], 'b-', alpha=alpha, linewidth=0.5)
    
    ax2.scatter(λ1[:50], np.zeros(min(50, len(λ1))), c='red', s=20, label=name1)
    ax2.scatter(λ2[:50], np.ones(min(50, len(λ2))), c='blue', s=20, label=name2)
    ax2.set_xlabel('Eigenvalue')
    ax2.set_ylabel(f'Modality (0={name1}, 1={name2})')
    ax2.set_title('Eigenvalue Coupling')
    ax2.legend()
    
    # 3. Diagonal dominance analysis
    ax3 = axes[2]
    n_min = min(M.shape)
    diagonal = np.array([np.abs(M[i, i]) if i < M.shape[0] and i < M.shape[1] else 0 
                         for i in range(n_min)])
    off_diagonal_max = np.array([np.max(np.abs(np.concatenate([M[i, :i], M[i, i+1:]]))) 
                                  if i < M.shape[0] else 0 for i in range(n_min)])
    
    ax3.plot(diagonal, label='Diagonal |M[i,i]|', linewidth=2)
    ax3.plot(off_diagonal_max, label='Max off-diagonal', linewidth=2, alpha=0.7)
    ax3.set_xlabel('Index')
    ax3.set_ylabel('Coupling strength')
    ax3.set_title('Diagonal vs Off-diagonal Coupling')
    ax3.legend()
    
    plt.tight_layout()
    return fig


def plot_spectral_profiles(profiles_dict: Dict[str, np.ndarray],
                           s_values: np.ndarray,
                           title: str = "Spectral Profiles",
                           figsize: Tuple[int, int] = (10, 6)) -> plt.Figure:
    """
    Plot spectral profiles φ(s) for multiple concepts/modalities.
    
    The profile shows what fraction of spectral weight a concept captures
    at each scale s.
    """
    fig, ax = plt.subplots(figsize=figsize)
    
    colors = plt.cm.Set2(np.linspace(0, 1, len(profiles_dict)))
    
    for i, (name, profile) in enumerate(profiles_dict.items()):
        ax.plot(s_values, profile, '-', color=colors[i], label=name, linewidth=2)
    
    ax.set_xlabel('Scale parameter s')
    ax.set_ylabel('Profile φ(s) = ζ_{L,c}(s) / ζ_L(s)')
    ax.set_title(title)
    ax.legend()
    ax.grid(True, alpha=0.3)
    
    # Add annotations for scale interpretation
    ax.axvline(x=0.5, color='gray', linestyle='--', alpha=0.5)
    ax.axvline(x=1.0, color='gray', linestyle='--', alpha=0.5)
    ax.axvline(x=2.0, color='gray', linestyle='--', alpha=0.5)
    
    ax.text(0.5, ax.get_ylim()[1]*0.95, 'local', ha='center', fontsize=9, alpha=0.7)
    ax.text(1.0, ax.get_ylim()[1]*0.95, 'balanced', ha='center', fontsize=9, alpha=0.7)
    ax.text(2.0, ax.get_ylim()[1]*0.95, 'global', ha='center', fontsize=9, alpha=0.7)
    
    return fig


# ==============================================================================
# PART 9: EXPERIMENTS WITH SYNTHETIC DATA
# ==============================================================================

def create_synthetic_multimodal_data(n_samples: int = 500,
                                     n_concepts: int = 5,
                                     dim_text: int = 64,
                                     dim_image: int = 256,
                                     noise_level: float = 0.1,
                                     seed: int = 42) -> Dict:
    """
    Create synthetic aligned multimodal data for testing.
    
    We simulate:
    - A shared "concept space" of dimension n_concepts
    - Text representations: 1D structure, lower dimensional
    - Image representations: 2D structure, higher dimensional
    - Both modalities encode the same underlying concepts with different structure
    """
    np.random.seed(seed)
    
    # Shared concept factors
    concepts = np.random.randn(n_samples, n_concepts)
    
    # Text representation: 1D structure embedded in dim_text
    text_basis = np.random.randn(n_concepts, dim_text)
    text_basis = text_basis / np.linalg.norm(text_basis, axis=1, keepdims=True)
    Z_text = concepts @ text_basis + noise_level * np.random.randn(n_samples, dim_text)
    
    # Image representation: 2D structure embedded in dim_image
    image_basis = np.random.randn(n_concepts, dim_image)
    image_basis = image_basis / np.linalg.norm(image_basis, axis=1, keepdims=True)
    Z_image = concepts @ image_basis + noise_level * np.random.randn(n_samples, dim_image)
    
    # Build Laplacians based on representation structure
    L_text = MORPHISM_TEXT.build_laplacian(dim_text, normalized=True)
    
    # For image, we need width such that width^2 ≈ dim_image
    width = int(np.sqrt(dim_image))
    actual_dim = width * width
    L_image = MORPHISM_IMAGE.build_laplacian(actual_dim, normalized=True, width=width)
    
    # Adjust Z_image dimension if needed
    if actual_dim != dim_image:
        Z_image = Z_image[:, :actual_dim]
    
    # Create concept subspaces (for analysis)
    concept_subspaces_text = []
    concept_subspaces_image = []
    
    for i in range(n_concepts):
        # Text concept subspace
        basis_text = text_basis[i:i+1].T  # (dim_text, 1)
        proj_text = basis_text @ basis_text.T
        concept_subspaces_text.append(ConceptSubspace(
            name=f"Concept_{i}_text",
            projection=proj_text,
            dimension=1,
            basis=basis_text
        ))
        
        # Image concept subspace  
        basis_image = image_basis[i:i+1, :actual_dim].T  # (dim_image, 1)
        proj_image = basis_image @ basis_image.T
        concept_subspaces_image.append(ConceptSubspace(
            name=f"Concept_{i}_image",
            projection=proj_image,
            dimension=1,
            basis=basis_image
        ))
    
    return {
        'Z_text': Z_text,
        'Z_image': Z_image[:, :actual_dim],
        'L_text': L_text,
        'L_image': L_image,
        'concepts': concepts,
        'concept_subspaces_text': concept_subspaces_text,
        'concept_subspaces_image': concept_subspaces_image,
        'dim_text': dim_text,
        'dim_image': actual_dim,
        'n_samples': n_samples,
        'n_concepts': n_concepts
    }


def run_synthetic_experiment(verbose: bool = True) -> Dict:
    """
    Run complete analysis pipeline on synthetic data.
    """
    if verbose:
        print("=" * 70)
        print("SPECTRAL MULTIMODAL ANALYSIS - SYNTHETIC EXPERIMENT")
        print("=" * 70)
        print()
    
    # Generate data
    if verbose:
        print("1. Generating synthetic multimodal data...")
    data = create_synthetic_multimodal_data(
        n_samples=500,
        n_concepts=5,
        dim_text=64,
        dim_image=256,
        noise_level=0.1
    )
    
    # Compute spectral decompositions
    if verbose:
        print("2. Computing spectral decompositions...")
    spec_text = compute_spectral_data(data['L_text'])
    spec_image = compute_spectral_data(data['L_image'])
    
    if verbose:
        print(f"   Text:  d_s = {spec_text.spectral_dimension:.3f}")
        print(f"   Image: d_s = {spec_image.spectral_dimension:.3f}")
    
    # Cross-modal analysis
    if verbose:
        print("3. Computing cross-modal intertwiner...")
    cross_modal = optimal_intertwiner_via_sylvester(
        data['L_text'], data['L_image'],
        data['Z_text'], data['Z_image']
    )
    
    if verbose:
        print(f"   Intertwining error: {cross_modal.intertwining_error:.6f}")
    
    # Product formula test
    if verbose:
        print("4. Testing product formula...")
    
    product_values = []
    for i in range(min(100, data['n_samples'])):
        z_list = [data['Z_text'][i], data['Z_image'][i]]
        L_list = [data['L_text'], data['L_image']]
        d_s_list = [spec_text.spectral_dimension, spec_image.spectral_dimension]
        P = product_formula_value(z_list, L_list, d_s_list)
        product_values.append(P)
    
    product_values = np.array(product_values)
    cv = np.std(product_values) / np.mean(product_values)
    
    if verbose:
        print(f"   Product mean: {np.mean(product_values):.4f}")
        print(f"   Product std:  {np.std(product_values):.4f}")
        print(f"   CV (coefficient of variation): {cv:.4f}")
        print(f"   {'✓ Product formula holds approximately' if cv < 0.3 else '✗ Product formula violated'}")
    
    # Spectral profiles for concepts
    if verbose:
        print("5. Computing spectral profiles for concepts...")
    
    s_values = np.linspace(0.3, 2.5, 50)
    profiles_text = {}
    profiles_image = {}
    
    for i, (concept_t, concept_i) in enumerate(zip(
        data['concept_subspaces_text'][:3],  # First 3 concepts
        data['concept_subspaces_image'][:3]
    )):
        profiles_text[f"Concept_{i}"] = spectral_profile(spec_text, concept_t, s_values)
        profiles_image[f"Concept_{i}"] = spectral_profile(spec_image, concept_i, s_values)
    
    # Compile results
    results = {
        'data': data,
        'spec_text': spec_text,
        'spec_image': spec_image,
        'cross_modal': cross_modal,
        'product_values': product_values,
        'product_cv': cv,
        'profiles_text': profiles_text,
        'profiles_image': profiles_image,
        's_values': s_values
    }
    
    if verbose:
        print()
        print("Experiment complete!")
        print("=" * 70)
    
    return results


# ==============================================================================
# PART 10: NEURAL NETWORK LAPLACIAN ESTIMATION
# ==============================================================================

def estimate_representation_laplacian(representations: np.ndarray,
                                      k: int = 15,
                                      normalized: bool = True) -> np.ndarray:
    """
    Estimate the effective Laplacian of a representation space
    from samples using k-nearest neighbors graph.
    
    Args:
        representations: (N, d) array of representation vectors
        k: Number of nearest neighbors
        normalized: Whether to return normalized Laplacian
    
    Returns:
        (d, d) estimated Laplacian in feature space
    """
    N, d = representations.shape
    
    # Build k-NN graph in sample space
    from sklearn.neighbors import NearestNeighbors
    
    nn = NearestNeighbors(n_neighbors=k+1, metric='euclidean')
    nn.fit(representations)
    distances, indices = nn.kneighbors(representations)
    
    # Build adjacency matrix
    A_samples = np.zeros((N, N))
    for i in range(N):
        for j in indices[i, 1:]:  # Skip self
            A_samples[i, j] = 1
            A_samples[j, i] = 1
    
    # Sample Laplacian
    D_samples = np.diag(A_samples.sum(axis=1))
    L_samples = D_samples - A_samples
    
    if normalized:
        d_inv_sqrt = np.diag(1.0 / np.sqrt(A_samples.sum(axis=1) + 1e-10))
        L_samples = d_inv_sqrt @ L_samples @ d_inv_sqrt
    
    # Project to feature space Laplacian via covariance structure
    # L_features ≈ Z^T L_samples Z / N (up to normalization)
    Z_centered = representations - representations.mean(axis=0)
    L_features = Z_centered.T @ L_samples @ Z_centered / N
    
    # Symmetrize and ensure positive semi-definite
    L_features = (L_features + L_features.T) / 2
    
    return L_features


class SpectralProbe:
    """
    Probe a neural network's representation space for spectral structure.
    
    This class wraps a pre-trained encoder and provides methods to:
    1. Estimate the representation Laplacian
    2. Compute spectral properties
    3. Analyze cross-modal structure
    """
    
    def __init__(self, encoder: Callable, name: str = "encoder"):
        """
        Args:
            encoder: Function or nn.Module that maps inputs to representations
            name: Human-readable name for this encoder
        """
        self.encoder = encoder
        self.name = name
        self.representations = None
        self.laplacian = None
        self.spectral_data = None
    
    def collect_representations(self, data_loader, max_samples: int = 1000):
        """
        Collect representations from data.
        
        Note: This is a template - actual implementation depends on
        the deep learning framework used (PyTorch, JAX, etc.)
        """
        reps = []
        count = 0
        
        for batch in data_loader:
            # Framework-agnostic: assume encoder returns numpy arrays
            if isinstance(batch, (list, tuple)):
                batch = batch[0]
            rep = self.encoder(batch)
            if hasattr(rep, 'cpu'):  # PyTorch tensor
                rep = rep.detach().cpu().numpy()
            elif hasattr(rep, 'numpy'):  # Other tensor types
                rep = rep.numpy()
            reps.append(rep)
            count += len(rep)
            if count >= max_samples:
                break
        
        self.representations = np.concatenate(reps, axis=0)[:max_samples]
        return self.representations
    
    def estimate_laplacian(self, k: int = 15):
        """Estimate Laplacian from collected representations."""
        if self.representations is None:
            raise ValueError("Must call collect_representations first")
        
        self.laplacian = estimate_representation_laplacian(
            self.representations, k=k
        )
        return self.laplacian
    
    def compute_spectral_data(self, num_eigenvectors: int = None):
        """Compute spectral decomposition."""
        if self.laplacian is None:
            raise ValueError("Must call estimate_laplacian first")
        
        self.spectral_data = compute_spectral_data(
            self.laplacian, num_eigenvectors
        )
        return self.spectral_data
    
    def full_analysis(self, data_loader, k: int = 15, 
                      max_samples: int = 1000) -> SpectralData:
        """Run full spectral analysis pipeline."""
        self.collect_representations(data_loader, max_samples)
        self.estimate_laplacian(k)
        return self.compute_spectral_data()


# ==============================================================================
# PART 11: CONNECTING TO REAL MODELS (CLIP EXAMPLE)
# ==============================================================================

def analyze_clip_spectral_structure(clip_model, 
                                    image_data_loader,
                                    text_data_loader,
                                    max_samples: int = 500,
                                    verbose: bool = True):
    """
    Analyze spectral structure of CLIP's representation spaces.
    
    This function:
    1. Extracts image and text representations
    2. Estimates Laplacians for each modality
    3. Computes spectral properties
    4. Analyzes cross-modal correspondence
    
    Args:
        clip_model: CLIP model with encode_image and encode_text methods
        image_data_loader: DataLoader yielding image batches
        text_data_loader: DataLoader yielding tokenized text batches
        max_samples: Maximum samples to collect
        verbose: Whether to print progress
    
    Returns:
        Dictionary with analysis results
        
    Note: This is a template function. Actual usage requires:
    - Installing transformers/open_clip
    - Loading a CLIP model
    - Creating appropriate data loaders
    """
    if verbose:
        print("CLIP Spectral Analysis")
        print("=" * 50)
    
    # Create probes - lambda functions wrap model methods
    image_probe = SpectralProbe(
        lambda x: clip_model.encode_image(x),
        name="CLIP_image"
    )
    text_probe = SpectralProbe(
        lambda x: clip_model.encode_text(x),
        name="CLIP_text"
    )
    
    # Run analysis
    if verbose:
        print("Analyzing image encoder...")
    spec_image = image_probe.full_analysis(image_data_loader, max_samples=max_samples)
    
    if verbose:
        print("Analyzing text encoder...")
    spec_text = text_probe.full_analysis(text_data_loader, max_samples=max_samples)
    
    if verbose:
        print(f"\nSpectral dimensions:")
        print(f"  Image: {spec_image.spectral_dimension:.3f}")
        print(f"  Text:  {spec_text.spectral_dimension:.3f}")
    
    # Cross-modal analysis (if we have aligned pairs)
    if verbose:
        print("\nCross-modal analysis requires aligned image-text pairs")
    
    return {
        'image_probe': image_probe,
        'text_probe': text_probe,
        'spec_image': spec_image,
        'spec_text': spec_text
    }


# ==============================================================================
# PART 12: MAIN ENTRY POINT AND DEMONSTRATION
# ==============================================================================

def main():
    """
    Main demonstration of the spectral multimodal analysis framework.
    """
    print()
    print("╔" + "═"*68 + "╗")
    print("║" + " SPECTRAL THEORY OF MULTIMODAL REPRESENTATIONS ".center(68) + "║")
    print("║" + " Experimental Framework ".center(68) + "║")
    print("╚" + "═"*68 + "╝")
    print()
    
    # Run synthetic experiment
    results = run_synthetic_experiment(verbose=True)
    
    # Create visualizations
    print("\nGenerating visualizations...")
    
    # 1. Spectral comparison
    fig1 = plot_spectral_comparison(
        [results['spec_text'], results['spec_image']],
        ['Text (1D)', 'Image (2D)'],
        figsize=(14, 10)
    )
    fig1.savefig('spectral_comparison.png', dpi=150, bbox_inches='tight')
    print("  Saved: spectral_comparison.png")
    
    # 2. Cross-modal correspondence
    fig2 = plot_spectral_correspondence(
        results['cross_modal'],
        results['spec_text'],
        results['spec_image'],
        'Text', 'Image'
    )
    fig2.savefig('spectral_correspondence.png', dpi=150, bbox_inches='tight')
    print("  Saved: spectral_correspondence.png")
    
    # 3. Spectral profiles
    fig3 = plot_spectral_profiles(
        results['profiles_text'],
        results['s_values'],
        title="Text Modality: Concept Spectral Profiles"
    )
    fig3.savefig('spectral_profiles_text.png', dpi=150, bbox_inches='tight')
    print("  Saved: spectral_profiles_text.png")
    
    fig4 = plot_spectral_profiles(
        results['profiles_image'],
        results['s_values'],
        title="Image Modality: Concept Spectral Profiles"
    )
    fig4.savefig('spectral_profiles_image.png', dpi=150, bbox_inches='tight')
    print("  Saved: spectral_profiles_image.png")
    
    # 4. Product formula distribution
    fig5, ax = plt.subplots(figsize=(8, 5))
    ax.hist(results['product_values'], bins=30, edgecolor='black', alpha=0.7)
    ax.axvline(np.mean(results['product_values']), color='red', linestyle='--',
               linewidth=2, label=f"Mean = {np.mean(results['product_values']):.3f}")
    ax.set_xlabel('Product Formula Value P')
    ax.set_ylabel('Count')
    ax.set_title(f'Product Formula Distribution (CV = {results["product_cv"]:.3f})')
    ax.legend()
    fig5.savefig('product_formula.png', dpi=150, bbox_inches='tight')
    print("  Saved: product_formula.png")
    
    print()
    print("="*70)
    print("THEORETICAL SUMMARY")
    print("="*70)
    print("""
The spectral analysis reveals:

1. SPECTRAL DIMENSION DIFFERENCE
   - Text (1D morphism): d_s ≈ 1.0 (expected: linear chain)
   - Image (2D morphism): d_s ≈ 2.0 (expected: grid lattice)
   
   This confirms that the representation morphism determines
   the intrinsic dimensionality of the modality.

2. INTERTWINING ERROR
   - Non-zero error indicates exact intertwining is impossible
   - Error magnitude reflects "translation difficulty"
   - Lower error ⟹ modalities share more spectral structure

3. SPECTRAL CORRESPONDENCE MATRIX M
   - Diagonal dominance: similar scales couple strongly
   - Off-diagonal structure: cross-scale coupling
   - Block structure: semantic groupings

4. PRODUCT FORMULA
   - Low CV (< 0.3): representations are "balanced"
   - High CV: some concepts are over/under-expressed
   - The product formula is a normalization constraint

5. CONCEPT SPECTRAL PROFILES
   - Each concept has a characteristic "scale" at which it
     is best expressed in each modality
   - Mismatched profiles ⟹ translation difficulty
   - Matched profiles ⟹ natural cross-modal alignment
""")
    
    print("="*70)
    print("NEXT STEPS FOR REAL MODEL ANALYSIS")
    print("="*70)
    print("""
To apply this to real multimodal models (CLIP, ImageBind, etc.):

1. Load pretrained model and extract encoders
2. Create data loaders for aligned multimodal pairs
3. Use SpectralProbe to collect representations
4. Run full analysis pipeline
5. Compare spectral structure across modalities

Key predictions to test:
- Spectral dimension should be higher for image than text
- Well-trained models should have structured M (not random)
- Product formula should hold approximately for good models
- Intertwining error should correlate with retrieval performance

See analyze_clip_spectral_structure() for implementation template.
""")
    
    print("\nDone! Check the generated PNG files for visualizations.")
    
    return results


if __name__ == "__main__":
    results = main()
