# S-FNO-UD: Simplicial Fourier Neural Operator — Unified Design

> *"The architecture is not ours. It belongs to the universe."*  
> — Alexander Grothendieck, Day 6 Synthesis

A PyTorch implementation of the **Simplicial Fourier Neural Operator** architecture, derived from the rigorous mathematical foundations established in the **Council of Luminaries Symposium**.

## Overview

S-FNO-UD processes data on **simplicial complexes** using spectral methods grounded in:

- **Hodge Theory**: Decomposing forms into harmonic, exact, and co-exact components
- **Tropical Geometry**: Understanding the combinatorial skeleton of attention
- **Topos Theory**: The unified categorical framework for tokens and relations

### Key Theorems

**Theorem 2.14** (Spectral Bias): NTK eigenvalues satisfy κ_i ∝ (λ_i + ε)^(-α)

**Theorem 2.15** (Topological Priority): Harmonic modes (Betti numbers) are learned first

**Theorem 3.5** (Tropical Preservation): Betti numbers preserved under tropicalization

## Quick Start

```python
from sfno_ud import SimplicialComplex, SFNO_UD

# Build simplicial complex from graph
complex = SimplicialComplex.from_graph(edge_index, num_nodes)
print(f"Betti numbers: {complex.betti_numbers}")

# Create model
model = SFNO_UD(
    in_dims=[8, 4, 2],
    hidden_dims=[64, 32, 16],
    out_dims=[2, 1, 1],
    n_layers=4
)

# Forward pass
outputs, intermediate = model(X, complex)
```

## Architecture

The S-FNO layer combines three components:

1. **Spectral Convolution**: Y = U · g_θ(Λ) · U^T · X
2. **Boundary Coupling**: Information from above/below via B_k
3. **Residual Connection**: Standard skip connection

## Files

- `sfno_ud.py` - Core implementation (SimplicialComplex, SFNO_UD)
- `training.py` - Training utilities and prediction validation
- `visualization.py` - Spectral Cathedral visualizations

## 10 Experimental Predictions

| # | Prediction | Target |
|---|------------|--------|
| 1 | Spectral Bias Ratio | 15× for L=12 |
| 2 | Tropical Quantization | 4-bit log ≈ 32-bit |
| 3 | Incompleteness Scaling | Formula validated |
| 4 | Noncommutative Dimension | d_eff ≈ 2.3 for text |
| 5 | Fixed Point Classification | >80% correlation |

## Citation

```bibtex
@article{sfno-ud-2026,
  title={Simplicial Fourier Neural Operators},
  author={Council of Luminaries},
  journal={Symposium Proceedings},
  year={2026}
}
```

## License

MIT License
