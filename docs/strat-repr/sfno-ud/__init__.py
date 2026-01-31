"""
S-FNO-UD: Simplicial Fourier Neural Operator - Unified Design
==============================================================

A PyTorch implementation of the S-FNO architecture derived from the
Council of Luminaries Symposium on Simplicial Attention and the
Spectral Topology of Multimodal Cognition.

Mathematical Foundations (Days 1-6):
    Day 1: Yoneda Reversal - Relations → Objects → Topoi
    Day 2: Hodge Laplacian hierarchy and spectral decomposition
    Day 3: Tropical limits and combinatorial skeletons
    Day 4: Physical instantiation as TQFT
    Day 5: Observer theory and incompleteness boundaries
    Day 6: Unified Token Topos and experimental predictions

Key Theorems:
    - Theorem 2.14: Spectral bias κ_i ∝ (λ_i + ε)^(-α)
    - Theorem 2.15: Topological Priority - harmonic modes learned first
    - Theorem 3.5: Betti numbers preserved under tropicalization
    - Theorem 5.1: Attention Incompleteness Theorem

Usage:
    >>> from sfno_ud import SimplicialComplex, SFNO_UD
    >>> 
    >>> # Build simplicial complex from graph
    >>> complex = SimplicialComplex.from_graph(edge_index, num_nodes)
    >>> 
    >>> # Create S-FNO model
    >>> model = SFNO_UD(
    ...     in_dims=[8, 4, 2],
    ...     hidden_dims=[64, 32, 16],
    ...     out_dims=[10, 1, 1],
    ...     n_layers=4
    ... )
    >>> 
    >>> # Forward pass
    >>> outputs, intermediate = model(X, complex)

Author: Council of Luminaries Implementation Team
Version: 1.0.0
License: MIT
"""

__version__ = "1.0.0"
__author__ = "Council of Luminaries Implementation Team"

# Core components
from .sfno_ud import (
    SimplicialComplex,
    SpectralConvolution,
    BoundaryCoupling,
    SFNOLayer,
    SFNO_UD,
    SFNOLoss,
    compute_attention_skeleton,
    compute_spectral_bias,
    estimate_betti_numbers,
)

# Training utilities
from .training import (
    TrainingConfig,
    SFNOTrainer,
    UnifiedLoss,
    PredictionValidator,
    SimplicialDataset,
    collate_simplicial,
)

# Visualization
from .visualization import (
    VisualizationConfig,
    SpectralCathedralStatic,
    SpectralCathedralInteractive,
    export_visualization_suite,
)

__all__ = [
    # Version
    "__version__",
    
    # Core
    "SimplicialComplex",
    "SpectralConvolution",
    "BoundaryCoupling",
    "SFNOLayer",
    "SFNO_UD",
    "SFNOLoss",
    
    # Utilities
    "compute_attention_skeleton",
    "compute_spectral_bias",
    "estimate_betti_numbers",
    
    # Training
    "TrainingConfig",
    "SFNOTrainer",
    "UnifiedLoss",
    "PredictionValidator",
    "SimplicialDataset",
    "collate_simplicial",
    
    # Visualization
    "VisualizationConfig",
    "SpectralCathedralStatic",
    "SpectralCathedralInteractive",
    "export_visualization_suite",
]
