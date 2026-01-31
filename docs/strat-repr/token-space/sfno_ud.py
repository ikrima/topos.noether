"""
Simplicial Fourier Neural Operator - Unified Design (S-FNO-UD)
==============================================================

Implementation following the Council of Luminaries Symposium Specifications.

This module implements the complete S-FNO-UD architecture as derived in Days 1-6
of the symposium on Simplicial Attention and the Spectral Topology of Multimodal Cognition.

Key Components:
    1. Hodge Laplacian computation at each simplicial level
    2. Spectral convolution via truncated eigendecomposition
    3. Boundary coupling between simplicial levels
    4. Incompleteness regularization for observer-aware learning
    5. Optional adelic (prime-stratified) branches

Mathematical Foundation:
    - Theorem 4.1: S-FNO layer acts as L_θ(X)_k = σ(S_k(X_k) + B_k(X) + R_k(X_k))
    - Theorem 2.14: NTK eigenvalues satisfy κ_i ∝ (λ_i + ε)^(-α)
    - Theorem 3.5: Betti numbers preserved under tropical degeneration

Author: Council of Luminaries Implementation Team
Version: 1.0
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch import Tensor
from typing import List, Tuple, Optional, Dict
import numpy as np
from scipy import sparse
from scipy.sparse.linalg import eigsh
import warnings


# =============================================================================
# PART I: Simplicial Complex Data Structures
# =============================================================================

class SimplicialComplex:
    """
    Represents an abstract simplicial complex with precomputed Hodge Laplacians.
    
    Following Definition 1.1 from Day 1: An abstract simplicial complex K on 
    vertex set V is a collection of finite subsets closed under taking subsets.
    
    Attributes:
        simplices: List of lists, where simplices[k] contains all k-simplices
        boundary_matrices: List of boundary operator matrices B_k
        hodge_laplacians: List of Hodge Laplacian matrices L_k
        eigendecompositions: List of (eigenvalues, eigenvectors) tuples
    """
    
    def __init__(
        self,
        simplices: List[List[Tuple[int, ...]]],
        max_spectral_modes: int = 64,
        device: str = 'cpu'
    ):
        """
        Initialize simplicial complex with precomputed spectral data.
        
        Args:
            simplices: List where simplices[k] is list of k-simplices (as tuples)
            max_spectral_modes: Maximum number of eigenmodes to compute
            device: PyTorch device
        """
        self.simplices = simplices
        self.max_k = len(simplices) - 1
        self.device = device
        self.max_modes = max_spectral_modes
        
        # Number of simplices at each level
        self.n_simplices = [len(s) for s in simplices]
        
        # Compute boundary matrices (Definition 1.9 from Day 1)
        self.boundary_matrices = self._compute_boundary_matrices()
        
        # Compute Hodge Laplacians (Definition 2.2 from Day 2)
        self.hodge_laplacians = self._compute_hodge_laplacians()
        
        # Compute truncated eigendecompositions (Section V, Day 2)
        self.eigendecompositions = self._compute_eigendecompositions()
        
        # Compute Betti numbers (Theorem 2.2: dim ker(L_k) = β_k)
        self.betti_numbers = self._compute_betti_numbers()
    
    def _compute_boundary_matrices(self) -> List[Tensor]:
        """
        Compute boundary operator matrices B_k: C_k → C_{k-1}.
        
        The boundary of a k-simplex [v_0, ..., v_k] is:
        ∂_k([v_0, ..., v_k]) = Σ_i (-1)^i [v_0, ..., v̂_i, ..., v_k]
        """
        boundaries = [None]  # B_0 doesn't exist (no -1 simplices)
        
        for k in range(1, self.max_k + 1):
            if self.n_simplices[k] == 0 or self.n_simplices[k-1] == 0:
                boundaries.append(torch.zeros(
                    self.n_simplices[k-1], self.n_simplices[k],
                    device=self.device
                ))
                continue
            
            # Build sparse boundary matrix
            rows, cols, vals = [], [], []
            
            # Create index maps for (k-1)-simplices
            simplex_to_idx = {tuple(sorted(s)): i 
                            for i, s in enumerate(self.simplices[k-1])}
            
            for j, sigma in enumerate(self.simplices[k]):
                sigma = tuple(sorted(sigma))
                for i, v in enumerate(sigma):
                    # Face obtained by removing vertex v
                    face = tuple(x for x in sigma if x != v)
                    if face in simplex_to_idx:
                        rows.append(simplex_to_idx[face])
                        cols.append(j)
                        vals.append((-1) ** i)
            
            if rows:
                B_k = torch.sparse_coo_tensor(
                    torch.tensor([rows, cols], device=self.device),
                    torch.tensor(vals, dtype=torch.float32, device=self.device),
                    (self.n_simplices[k-1], self.n_simplices[k])
                ).to_dense()
            else:
                B_k = torch.zeros(
                    self.n_simplices[k-1], self.n_simplices[k],
                    device=self.device
                )
            
            boundaries.append(B_k)
        
        # Add B_{d+1} as zero matrix for consistency
        boundaries.append(torch.zeros(
            self.n_simplices[self.max_k], 0,
            device=self.device
        ))
        
        return boundaries
    
    def _compute_hodge_laplacians(self) -> List[Tensor]:
        """
        Compute Hodge Laplacian L_k = B_k^T B_k + B_{k+1} B_{k+1}^T.
        
        Following Definition 2.2 from Day 2.
        """
        laplacians = []
        
        for k in range(self.max_k + 1):
            n_k = self.n_simplices[k]
            
            if n_k == 0:
                laplacians.append(torch.zeros(0, 0, device=self.device))
                continue
            
            # L_k = B_k^T B_k + B_{k+1} B_{k+1}^T
            L_k = torch.zeros(n_k, n_k, device=self.device)
            
            # Add B_k^T B_k term (from below)
            if k > 0 and self.boundary_matrices[k] is not None:
                B_k = self.boundary_matrices[k]
                L_k += B_k.T @ B_k
            
            # Add B_{k+1} B_{k+1}^T term (from above)
            if k < self.max_k and self.boundary_matrices[k+1] is not None:
                B_kp1 = self.boundary_matrices[k+1]
                L_k += B_kp1 @ B_kp1.T
            
            laplacians.append(L_k)
        
        return laplacians
    
    def _compute_eigendecompositions(self) -> List[Tuple[Tensor, Tensor]]:
        """
        Compute truncated eigendecomposition of each Hodge Laplacian.
        
        Returns (eigenvalues, eigenvectors) for spectral convolution.
        """
        decompositions = []
        
        for k, L_k in enumerate(self.hodge_laplacians):
            n_k = L_k.shape[0]
            
            if n_k == 0:
                decompositions.append((
                    torch.zeros(0, device=self.device),
                    torch.zeros(0, 0, device=self.device)
                ))
                continue
            
            # Number of modes to compute
            n_modes = min(self.max_modes, n_k)
            
            # Use scipy for eigendecomposition (more stable for sparse)
            L_np = L_k.cpu().numpy()
            
            if n_modes < n_k - 1:
                # Truncated eigendecomposition
                try:
                    eigenvalues, eigenvectors = eigsh(
                        L_np, k=n_modes, which='SM', 
                        tol=1e-6, maxiter=1000
                    )
                except:
                    # Fall back to full decomposition
                    eigenvalues, eigenvectors = np.linalg.eigh(L_np)
                    eigenvalues = eigenvalues[:n_modes]
                    eigenvectors = eigenvectors[:, :n_modes]
            else:
                # Full decomposition
                eigenvalues, eigenvectors = np.linalg.eigh(L_np)
            
            # Sort by eigenvalue (ascending)
            idx = np.argsort(eigenvalues)
            eigenvalues = eigenvalues[idx]
            eigenvectors = eigenvectors[:, idx]
            
            # Convert to tensors
            Lambda_k = torch.tensor(eigenvalues, dtype=torch.float32, device=self.device)
            U_k = torch.tensor(eigenvectors, dtype=torch.float32, device=self.device)
            
            decompositions.append((Lambda_k, U_k))
        
        return decompositions
    
    def _compute_betti_numbers(self, tol: float = 1e-6) -> List[int]:
        """
        Compute Betti numbers as dimensions of Hodge Laplacian kernels.
        
        By Theorem 2.2: β_k = dim ker(L_k)
        """
        betti = []
        for k, (Lambda_k, _) in enumerate(self.eigendecompositions):
            if Lambda_k.numel() == 0:
                betti.append(0)
            else:
                # Count near-zero eigenvalues
                betti.append(int((Lambda_k.abs() < tol).sum().item()))
        return betti
    
    @classmethod
    def from_graph(cls, edge_index: Tensor, num_nodes: int, 
                   include_triangles: bool = True, **kwargs) -> 'SimplicialComplex':
        """
        Construct simplicial complex from graph edge index.
        
        Args:
            edge_index: [2, E] tensor of edges
            num_nodes: Number of nodes
            include_triangles: Whether to include 2-simplices (triangles)
        """
        # 0-simplices: vertices
        vertices = [(i,) for i in range(num_nodes)]
        
        # 1-simplices: edges (undirected)
        edges_set = set()
        for i in range(edge_index.shape[1]):
            u, v = edge_index[0, i].item(), edge_index[1, i].item()
            if u != v:  # No self-loops
                edges_set.add(tuple(sorted([u, v])))
        edges = list(edges_set)
        
        simplices = [vertices, edges]
        
        # 2-simplices: triangles (if requested)
        if include_triangles:
            # Build adjacency for triangle detection
            adj = {i: set() for i in range(num_nodes)}
            for e in edges:
                adj[e[0]].add(e[1])
                adj[e[1]].add(e[0])
            
            triangles = set()
            for u in range(num_nodes):
                for v in adj[u]:
                    for w in adj[u] & adj[v]:
                        if u < v < w:
                            triangles.add((u, v, w))
            
            simplices.append(list(triangles))
        
        return cls(simplices, **kwargs)
    
    @classmethod
    def from_sequence(cls, length: int, window_size: int = 3, **kwargs) -> 'SimplicialComplex':
        """
        Construct simplicial complex from a sequence (for text/time series).
        
        Creates a path graph with optional higher-order structure from sliding windows.
        """
        # 0-simplices: positions
        vertices = [(i,) for i in range(length)]
        
        # 1-simplices: consecutive pairs
        edges = [(i, i+1) for i in range(length - 1)]
        
        simplices = [vertices, edges]
        
        # 2-simplices: sliding window triangles
        if window_size >= 3 and length >= 3:
            triangles = [(i, i+1, i+2) for i in range(length - 2)]
            simplices.append(triangles)
        
        return cls(simplices, **kwargs)


# =============================================================================
# PART II: Spectral Convolution Layer
# =============================================================================

class SpectralConvolution(nn.Module):
    """
    Spectral convolution on k-forms using the Hodge eigenbasis.
    
    Implements: S_k(X) = U_k · g_θ(Λ_k) · U_k^T · X
    
    Following Section V of Day 2 and the S-FNO specification from Day 4.
    """
    
    def __init__(
        self,
        in_features: int,
        out_features: int,
        n_modes: int,
        filter_type: str = 'mlp'
    ):
        """
        Args:
            in_features: Input feature dimension
            out_features: Output feature dimension
            n_modes: Number of spectral modes
            filter_type: 'mlp' for learned filter, 'polynomial' for Chebyshev
        """
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.n_modes = n_modes
        self.filter_type = filter_type
        
        if filter_type == 'mlp':
            # Learnable spectral filter: g_θ(λ) as diagonal matrix
            # Shape: [n_modes, in_features, out_features]
            self.spectral_filter = nn.Parameter(
                torch.randn(n_modes, in_features, out_features) * 0.02
            )
        elif filter_type == 'polynomial':
            # Chebyshev polynomial filter
            self.poly_order = 5
            self.poly_coeffs = nn.Parameter(
                torch.randn(self.poly_order, in_features, out_features) * 0.02
            )
        else:
            raise ValueError(f"Unknown filter type: {filter_type}")
    
    def forward(
        self, 
        X: Tensor, 
        U: Tensor, 
        Lambda: Tensor
    ) -> Tensor:
        """
        Apply spectral convolution.
        
        Args:
            X: Input features [batch, n_simplices, in_features]
            U: Eigenvector matrix [n_simplices, n_modes]
            Lambda: Eigenvalues [n_modes]
            
        Returns:
            Output features [batch, n_simplices, out_features]
        """
        batch_size, n_simplices, _ = X.shape
        n_modes = min(self.n_modes, U.shape[1])
        
        # Transform to spectral domain: X_spec = U^T X
        # [batch, n_modes, in_features]
        U_truncated = U[:, :n_modes]
        X_spectral = torch.einsum('nm,bni->bmi', U_truncated.T, X)
        
        if self.filter_type == 'mlp':
            # Apply learned spectral filter
            # g_θ(Λ) is diagonal, applied mode-wise
            filter_truncated = self.spectral_filter[:n_modes]
            X_filtered = torch.einsum('mio,bmi->bmo', filter_truncated, X_spectral)
        else:
            # Chebyshev polynomial filter
            Lambda_normalized = Lambda[:n_modes] / (Lambda[:n_modes].max() + 1e-6)
            filter_response = torch.zeros(n_modes, self.in_features, self.out_features,
                                         device=X.device)
            T_prev = torch.ones(n_modes, device=X.device)
            T_curr = Lambda_normalized
            
            filter_response += self.poly_coeffs[0].unsqueeze(0) * T_prev.unsqueeze(-1).unsqueeze(-1)
            if self.poly_order > 1:
                filter_response += self.poly_coeffs[1].unsqueeze(0) * T_curr.unsqueeze(-1).unsqueeze(-1)
            
            for i in range(2, self.poly_order):
                T_next = 2 * Lambda_normalized * T_curr - T_prev
                filter_response += self.poly_coeffs[i].unsqueeze(0) * T_next.unsqueeze(-1).unsqueeze(-1)
                T_prev, T_curr = T_curr, T_next
            
            X_filtered = torch.einsum('mio,bmi->bmo', filter_response, X_spectral)
        
        # Transform back to spatial domain: Y = U X_filtered
        # [batch, n_simplices, out_features]
        Y = torch.einsum('nm,bmo->bno', U_truncated, X_filtered)
        
        return Y


# =============================================================================
# PART III: Boundary Coupling Layer
# =============================================================================

class BoundaryCoupling(nn.Module):
    """
    Couples information between simplicial levels via boundary operators.
    
    Implements: B_k(X) = β_k · B_{k+1} · W_↓ · X_{k+1} + γ_k · B_k^T · W_↑ · X_{k-1}
    
    Following the S-FNO specification from Day 4.
    """
    
    def __init__(
        self,
        dim_k: int,           # Features at level k
        dim_k_minus_1: int,   # Features at level k-1
        dim_k_plus_1: int,    # Features at level k+1
        has_level_below: bool = True,
        has_level_above: bool = True
    ):
        super().__init__()
        self.dim_k = dim_k
        self.has_below = has_level_below
        self.has_above = has_level_above
        
        # Projection from k+1 to k (boundary: information from above)
        if has_level_above and dim_k_plus_1 > 0:
            self.W_down = nn.Linear(dim_k_plus_1, dim_k, bias=False)
            self.beta = nn.Parameter(torch.tensor(0.1))
        
        # Projection from k-1 to k (coboundary: information from below)
        if has_level_below and dim_k_minus_1 > 0:
            self.W_up = nn.Linear(dim_k_minus_1, dim_k, bias=False)
            self.gamma = nn.Parameter(torch.tensor(0.1))
    
    def forward(
        self,
        X_k: Tensor,
        X_k_minus_1: Optional[Tensor],
        X_k_plus_1: Optional[Tensor],
        B_k: Optional[Tensor],      # [n_{k-1}, n_k]
        B_k_plus_1: Optional[Tensor] # [n_k, n_{k+1}]
    ) -> Tensor:
        """
        Compute boundary coupling.
        
        Args:
            X_k: Features at level k [batch, n_k, dim_k]
            X_k_minus_1: Features at level k-1 [batch, n_{k-1}, dim_{k-1}]
            X_k_plus_1: Features at level k+1 [batch, n_{k+1}, dim_{k+1}]
            B_k: Boundary matrix k
            B_k_plus_1: Boundary matrix k+1
            
        Returns:
            Coupled features [batch, n_k, dim_k]
        """
        batch_size = X_k.shape[0]
        output = torch.zeros_like(X_k)
        
        # Information from above: B_{k+1} · W_↓ · X_{k+1}
        if (self.has_above and X_k_plus_1 is not None and 
            B_k_plus_1 is not None and X_k_plus_1.shape[1] > 0):
            # Project features
            X_down = self.W_down(X_k_plus_1)  # [batch, n_{k+1}, dim_k]
            # Apply boundary: aggregate from faces
            # B_{k+1}: [n_k, n_{k+1}]
            coupled_down = torch.einsum('ij,bji->bi', B_k_plus_1, X_down.transpose(1, 2))
            output += self.beta * coupled_down.unsqueeze(-1).expand(-1, -1, self.dim_k)
        
        # Information from below: B_k^T · W_↑ · X_{k-1}
        if (self.has_below and X_k_minus_1 is not None and 
            B_k is not None and X_k_minus_1.shape[1] > 0):
            # Project features
            X_up = self.W_up(X_k_minus_1)  # [batch, n_{k-1}, dim_k]
            # Apply coboundary: aggregate to cofaces
            # B_k^T: [n_k, n_{k-1}]
            coupled_up = torch.einsum('ij,bji->bi', B_k.T, X_up.transpose(1, 2))
            output += self.gamma * coupled_up.unsqueeze(-1).expand(-1, -1, self.dim_k)
        
        return output


# =============================================================================
# PART IV: S-FNO Layer
# =============================================================================

class SFNOLayer(nn.Module):
    """
    Single S-FNO layer operating on all simplicial levels.
    
    Implements: L_θ(X)_k = σ(α_k · S_k(X_k) + B_k(X) + W_res · X_k)
    
    Following the complete specification from Day 4.
    """
    
    def __init__(
        self,
        dims: List[int],           # Feature dimensions at each level [d_0, d_1, ...]
        n_modes: List[int],        # Spectral modes at each level
        dropout: float = 0.1,
        activation: str = 'gelu'
    ):
        super().__init__()
        self.dims = dims
        self.max_k = len(dims) - 1
        
        # Spectral convolutions at each level
        self.spectral_convs = nn.ModuleList([
            SpectralConvolution(dims[k], dims[k], n_modes[k])
            for k in range(self.max_k + 1)
        ])
        
        # Mixing coefficients (learnable)
        self.alpha = nn.ParameterList([
            nn.Parameter(torch.tensor(1.0))
            for _ in range(self.max_k + 1)
        ])
        
        # Boundary coupling at each level
        self.boundary_couplings = nn.ModuleList()
        for k in range(self.max_k + 1):
            dim_below = dims[k-1] if k > 0 else 0
            dim_above = dims[k+1] if k < self.max_k else 0
            self.boundary_couplings.append(
                BoundaryCoupling(
                    dims[k], dim_below, dim_above,
                    has_level_below=(k > 0),
                    has_level_above=(k < self.max_k)
                )
            )
        
        # Residual connections
        self.residuals = nn.ModuleList([
            nn.Linear(dims[k], dims[k], bias=False)
            for k in range(self.max_k + 1)
        ])
        
        # Normalization and dropout
        self.norms = nn.ModuleList([
            nn.LayerNorm(dims[k])
            for k in range(self.max_k + 1)
        ])
        self.dropout = nn.Dropout(dropout)
        
        # Activation
        self.activation = F.gelu if activation == 'gelu' else F.relu
    
    def forward(
        self,
        X: List[Tensor],
        complex: SimplicialComplex
    ) -> List[Tensor]:
        """
        Apply S-FNO layer.
        
        Args:
            X: List of feature tensors [X_0, X_1, ..., X_k]
               where X_k has shape [batch, n_k, d_k]
            complex: SimplicialComplex with precomputed spectral data
            
        Returns:
            List of output feature tensors
        """
        outputs = []
        
        for k in range(self.max_k + 1):
            X_k = X[k]
            batch_size, n_k, d_k = X_k.shape
            
            # Skip if no simplices at this level
            if n_k == 0:
                outputs.append(X_k)
                continue
            
            # Get spectral data
            Lambda_k, U_k = complex.eigendecompositions[k]
            
            # 1. Spectral convolution
            S_k = self.spectral_convs[k](X_k, U_k, Lambda_k)
            S_k = self.alpha[k] * S_k
            
            # 2. Boundary coupling
            X_below = X[k-1] if k > 0 else None
            X_above = X[k+1] if k < self.max_k else None
            B_k = complex.boundary_matrices[k] if k > 0 else None
            B_kp1 = complex.boundary_matrices[k+1] if k < self.max_k else None
            
            B_coupled = self.boundary_couplings[k](
                X_k, X_below, X_above, B_k, B_kp1
            )
            
            # 3. Residual
            R_k = self.residuals[k](X_k)
            
            # 4. Combine and activate
            Y_k = S_k + B_coupled + R_k
            Y_k = self.norms[k](Y_k)
            Y_k = self.activation(Y_k)
            Y_k = self.dropout(Y_k)
            
            outputs.append(Y_k)
        
        return outputs


# =============================================================================
# PART V: Complete S-FNO-UD Network
# =============================================================================

class SFNO_UD(nn.Module):
    """
    Simplicial Fourier Neural Operator - Unified Design.
    
    The complete architecture following Day 6 synthesis:
    
    G_Θ = P_out ∘ L_θ_L ∘ ... ∘ L_θ_1 ∘ P_in
    
    With optional:
    - Adelic branches (prime-stratified processing)
    - Incompleteness regularization
    - Tropical mode (hard attention)
    """
    
    def __init__(
        self,
        in_dims: List[int],        # Input dimensions at each level
        hidden_dims: List[int],    # Hidden dimensions at each level
        out_dims: List[int],       # Output dimensions at each level
        n_layers: int = 4,
        n_modes: Optional[List[int]] = None,  # Spectral modes per level
        dropout: float = 0.1,
        use_adelic: bool = False,
        primes: List[int] = [2, 3, 5],
        tropical_mode: bool = False
    ):
        """
        Initialize S-FNO-UD.
        
        Args:
            in_dims: Input feature dimensions [d_0^in, d_1^in, ...]
            hidden_dims: Hidden feature dimensions
            out_dims: Output feature dimensions
            n_layers: Number of S-FNO layers
            n_modes: Spectral modes at each level (default: 64)
            dropout: Dropout probability
            use_adelic: Whether to use adelic (prime-stratified) branches
            primes: List of primes for adelic mode
            tropical_mode: Whether to use hard (tropical) attention
        """
        super().__init__()
        
        self.max_k = len(in_dims) - 1
        self.n_layers = n_layers
        self.use_adelic = use_adelic
        self.tropical_mode = tropical_mode
        
        # Default spectral modes
        if n_modes is None:
            n_modes = [64] * (self.max_k + 1)
        
        # Input projection
        self.input_projs = nn.ModuleList([
            nn.Linear(in_dims[k], hidden_dims[k])
            for k in range(self.max_k + 1)
        ])
        
        # S-FNO layers
        self.layers = nn.ModuleList([
            SFNOLayer(hidden_dims, n_modes, dropout)
            for _ in range(n_layers)
        ])
        
        # Output projection
        self.output_projs = nn.ModuleList([
            nn.Linear(hidden_dims[k], out_dims[k])
            for k in range(self.max_k + 1)
        ])
        
        # Adelic branches (optional)
        if use_adelic:
            self.adelic_branches = nn.ModuleDict({
                str(p): nn.ModuleList([
                    SFNOLayer(hidden_dims, n_modes, dropout)
                    for _ in range(n_layers // 2)
                ])
                for p in primes
            })
            self.primes = primes
            
            # Fiber product layer (binding)
            self.binding_layer = nn.Linear(
                hidden_dims[0] * (1 + len(primes)),
                hidden_dims[0]
            )
    
    def forward(
        self,
        X: List[Tensor],
        complex: SimplicialComplex,
        return_intermediate: bool = False
    ) -> Tuple[List[Tensor], Optional[Dict]]:
        """
        Forward pass through S-FNO-UD.
        
        Args:
            X: List of input features [X_0, X_1, ...] 
            complex: SimplicialComplex with spectral data
            return_intermediate: Whether to return intermediate representations
            
        Returns:
            outputs: List of output features
            intermediate: Dict of intermediate values (if requested)
        """
        intermediate = {} if return_intermediate else None
        
        # Input projection
        H = [self.input_projs[k](X[k]) for k in range(self.max_k + 1)]
        
        if return_intermediate:
            intermediate['input'] = [h.clone() for h in H]
        
        # Main S-FNO layers
        for l, layer in enumerate(self.layers):
            H = layer(H, complex)
            
            if return_intermediate:
                intermediate[f'layer_{l}'] = [h.clone() for h in H]
        
        # Adelic processing (optional)
        if self.use_adelic:
            adelic_outputs = {}
            for p in self.primes:
                H_p = [h.clone() for h in H]
                for adelic_layer in self.adelic_branches[str(p)]:
                    H_p = adelic_layer(H_p, complex)
                adelic_outputs[p] = H_p
            
            # Fiber product binding (combine archimedean + p-adic branches)
            # For simplicity, concatenate and project at level 0
            H_combined = torch.cat(
                [H[0]] + [adelic_outputs[p][0] for p in self.primes],
                dim=-1
            )
            H[0] = self.binding_layer(H_combined)
            
            if return_intermediate:
                intermediate['adelic'] = adelic_outputs
        
        # Output projection
        outputs = [self.output_projs[k](H[k]) for k in range(self.max_k + 1)]
        
        # Tropical mode: apply hard attention at output
        if self.tropical_mode:
            outputs = [self._tropicalize(o) for o in outputs]
        
        return outputs, intermediate
    
    def _tropicalize(self, X: Tensor) -> Tensor:
        """Apply tropical (hard) attention: softmax → argmax."""
        # For output, apply argmax along feature dimension
        idx = X.argmax(dim=-1, keepdim=True)
        return torch.zeros_like(X).scatter_(-1, idx, 1.0) * X.max(dim=-1, keepdim=True)[0]


# =============================================================================
# PART VI: Loss Functions
# =============================================================================

class SFNOLoss(nn.Module):
    """
    Unified loss function for S-FNO-UD.
    
    L_unified = L_task + α·L_spectral + β·L_boundary + γ·L_incompleteness
    
    Following the Day 6 specification.
    """
    
    def __init__(
        self,
        alpha_spectral: float = 0.1,
        beta_boundary: float = 0.1,
        gamma_incompleteness: float = 0.01
    ):
        super().__init__()
        self.alpha = alpha_spectral
        self.beta = beta_boundary
        self.gamma = gamma_incompleteness
    
    def forward(
        self,
        predictions: List[Tensor],
        targets: List[Tensor],
        complex: SimplicialComplex,
        model: SFNO_UD,
        intermediate: Optional[Dict] = None
    ) -> Tuple[Tensor, Dict[str, Tensor]]:
        """
        Compute unified loss.
        
        Returns:
            total_loss: Scalar loss
            loss_components: Dict of individual loss terms
        """
        losses = {}
        
        # Task loss (cross-entropy or MSE depending on task)
        task_loss = 0.0
        for k, (pred, target) in enumerate(zip(predictions, targets)):
            if pred.numel() > 0 and target.numel() > 0:
                if target.dtype == torch.long:
                    task_loss += F.cross_entropy(
                        pred.view(-1, pred.shape[-1]),
                        target.view(-1)
                    )
                else:
                    task_loss += F.mse_loss(pred, target)
        losses['task'] = task_loss
        
        # Spectral regularization: encourage smooth spectral filters
        spectral_loss = 0.0
        for layer in model.layers:
            for spec_conv in layer.spectral_convs:
                if hasattr(spec_conv, 'spectral_filter'):
                    # Penalize rapid variation in spectral filter
                    filt = spec_conv.spectral_filter
                    if filt.shape[0] > 1:
                        diff = filt[1:] - filt[:-1]
                        spectral_loss += (diff ** 2).mean()
        losses['spectral'] = spectral_loss
        
        # Boundary consistency: ∂∘∂ = 0 should be preserved
        boundary_loss = 0.0
        if intermediate is not None and 'layer_0' in intermediate:
            for k in range(1, len(predictions)):
                if k < len(complex.boundary_matrices) - 1:
                    B_k = complex.boundary_matrices[k]
                    B_kp1 = complex.boundary_matrices[k+1]
                    if B_k is not None and B_kp1 is not None:
                        # Check ∂_k ∘ ∂_{k+1} ≈ 0
                        composition = B_k @ B_kp1
                        boundary_loss += (composition ** 2).mean()
        losses['boundary'] = boundary_loss
        
        # Incompleteness penalty: penalize variance on boundary
        incompleteness_loss = 0.0
        for k, pred in enumerate(predictions):
            if pred.numel() > 0:
                # Variance across the "boundary" (here: edge of feature space)
                var = pred.var(dim=1).mean()
                betti_weight = complex.betti_numbers[k] if k < len(complex.betti_numbers) else 1
                incompleteness_loss += betti_weight * var
        losses['incompleteness'] = incompleteness_loss
        
        # Total loss
        total_loss = (
            losses['task'] + 
            self.alpha * losses['spectral'] +
            self.beta * losses['boundary'] +
            self.gamma * losses['incompleteness']
        )
        
        return total_loss, losses


# =============================================================================
# PART VII: Utility Functions
# =============================================================================

def compute_attention_skeleton(
    attention_matrix: Tensor,
    threshold: float = 0.1
) -> Tensor:
    """
    Compute the tropical (hard) attention skeleton.
    
    Following Definition 3.10 from Day 3:
    Skel(A) = {(i,j) : A_ij = max_k A_ik}
    """
    max_attention = attention_matrix.max(dim=-1, keepdim=True)[0]
    skeleton = (attention_matrix >= max_attention - threshold).float()
    return skeleton


def compute_spectral_bias(
    model: SFNO_UD,
    complex: SimplicialComplex,
    level: int = 0
) -> Tensor:
    """
    Estimate the spectral bias κ_i ∝ λ_i^(-α).
    
    Following Theorem 2.14 from Day 2.
    """
    Lambda, U = complex.eigendecompositions[level]
    
    # Estimate α from the spectral filter
    with torch.no_grad():
        layer = model.layers[0]
        if hasattr(layer.spectral_convs[level], 'spectral_filter'):
            filt = layer.spectral_convs[level].spectral_filter
            # Compute effective kernel eigenvalue
            kappa = (filt ** 2).sum(dim=(1, 2))
            return kappa
    
    return torch.ones_like(Lambda)


def estimate_betti_numbers(
    hodge_laplacian: Tensor,
    tol: float = 1e-6
) -> int:
    """
    Estimate Betti number as dimension of Laplacian kernel.
    
    By Theorem 2.2: β_k = dim ker(L_k)
    """
    eigenvalues = torch.linalg.eigvalsh(hodge_laplacian)
    return int((eigenvalues.abs() < tol).sum().item())


# =============================================================================
# PART VIII: Example Usage
# =============================================================================

if __name__ == "__main__":
    # Example: Graph classification with S-FNO
    print("=" * 60)
    print("S-FNO-UD Example: Graph Classification")
    print("=" * 60)
    
    # Create a simple graph
    num_nodes = 10
    edge_index = torch.tensor([
        [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 0, 9],
        [1, 0, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8, 9, 0]
    ])
    
    # Build simplicial complex
    print("\n1. Building simplicial complex...")
    complex = SimplicialComplex.from_graph(
        edge_index, num_nodes,
        include_triangles=True,
        max_spectral_modes=32
    )
    
    print(f"   Simplices: {[len(s) for s in complex.simplices]}")
    print(f"   Betti numbers: {complex.betti_numbers}")
    
    # Create model
    print("\n2. Creating S-FNO-UD model...")
    model = SFNO_UD(
        in_dims=[8, 4, 2],      # Features per simplex level
        hidden_dims=[32, 16, 8],
        out_dims=[2, 1, 1],     # Classification output
        n_layers=3,
        n_modes=[32, 16, 8]
    )
    
    total_params = sum(p.numel() for p in model.parameters())
    print(f"   Total parameters: {total_params:,}")
    
    # Create dummy input
    print("\n3. Forward pass...")
    batch_size = 4
    X = [
        torch.randn(batch_size, complex.n_simplices[k], dim)
        for k, dim in enumerate([8, 4, 2])
    ]
    
    outputs, intermediate = model(X, complex, return_intermediate=True)
    
    print(f"   Input shapes: {[x.shape for x in X]}")
    print(f"   Output shapes: {[o.shape for o in outputs]}")
    
    # Compute loss
    print("\n4. Computing loss...")
    targets = [
        torch.randint(0, 2, (batch_size, complex.n_simplices[0])),
        torch.randn(batch_size, complex.n_simplices[1], 1),
        torch.randn(batch_size, complex.n_simplices[2], 1)
    ]
    
    loss_fn = SFNOLoss()
    total_loss, loss_components = loss_fn(outputs, targets, complex, model, intermediate)
    
    print(f"   Total loss: {total_loss.item():.4f}")
    for name, value in loss_components.items():
        print(f"   {name}: {value.item():.4f}")
    
    # Verify spectral properties
    print("\n5. Verifying spectral properties...")
    Lambda_0, U_0 = complex.eigendecompositions[0]
    print(f"   Level 0 eigenvalues (first 5): {Lambda_0[:5].tolist()}")
    print(f"   Spectral gap γ_0: {Lambda_0[Lambda_0 > 1e-6].min().item():.4f}")
    
    # Verify Hodge decomposition
    L_0 = complex.hodge_laplacians[0]
    print(f"   ||L_0 - U Λ U^T||: {torch.norm(L_0 - U_0 @ torch.diag(Lambda_0) @ U_0.T).item():.6f}")
    
    print("\n" + "=" * 60)
    print("S-FNO-UD Example Complete")
    print("=" * 60)
