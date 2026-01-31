"""
Spectral Cathedral: Interactive Visualizations for S-FNO-UD
============================================================

This module provides visualization tools for understanding and exploring
the mathematical structures underlying S-FNO-UD.

Visualizations include:
1. Hodge Laplacian spectrum and eigenvectors
2. Attention patterns as simplicial complexes
3. Tropical degeneration animation
4. Spectral bias during training
5. Incompleteness boundary visualization

Author: Council of Luminaries Visualization Team
"""

import torch
import numpy as np
from typing import List, Tuple, Dict, Optional
import json

# Check for optional visualization dependencies
try:
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    from mpl_toolkits.mplot3d import Axes3D
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False

try:
    import plotly.graph_objects as go
    import plotly.express as px
    from plotly.subplots import make_subplots
    HAS_PLOTLY = True
except ImportError:
    HAS_PLOTLY = False


# =============================================================================
# PART I: Hodge Spectrum Visualization
# =============================================================================

def plot_hodge_spectrum(
    complex,
    level: int = 0,
    show_gap: bool = True,
    title: str = None
):
    """
    Visualize the Hodge Laplacian spectrum at a given simplicial level.
    
    Shows eigenvalues with harmonic modes (β_k) highlighted.
    """
    if not HAS_MATPLOTLIB:
        raise ImportError("matplotlib required for this visualization")
    
    Lambda, U = complex.eigendecompositions[level]
    Lambda = Lambda.cpu().numpy()
    
    fig, ax = plt.subplots(figsize=(10, 4))
    
    # Plot eigenvalues
    colors = ['#e74c3c' if l < 1e-6 else '#3498db' for l in Lambda]
    bars = ax.bar(range(len(Lambda)), Lambda, color=colors, alpha=0.7)
    
    # Mark spectral gap
    if show_gap:
        nonzero = Lambda[Lambda > 1e-6]
        if len(nonzero) > 0:
            gap = nonzero.min()
            ax.axhline(y=gap, color='#27ae60', linestyle='--', linewidth=2,
                      label=f'Spectral gap γ_{level} = {gap:.4f}')
    
    # Labels
    ax.set_xlabel('Eigenvalue index', fontsize=12)
    ax.set_ylabel(f'λ (L_{level} eigenvalue)', fontsize=12)
    ax.set_title(title or f'Hodge Laplacian Spectrum (Level {level})', fontsize=14)
    
    # Legend
    harmonic_patch = mpatches.Patch(color='#e74c3c', label=f'Harmonic (β_{level} = {complex.betti_numbers[level]})')
    nonharm_patch = mpatches.Patch(color='#3498db', label='Non-harmonic')
    ax.legend(handles=[harmonic_patch, nonharm_patch] + 
              ([ax.get_lines()[0]] if show_gap else []))
    
    plt.tight_layout()
    return fig


def plot_eigenvector(
    complex,
    level: int = 0,
    mode: int = 0,
    title: str = None
):
    """
    Visualize a Hodge Laplacian eigenvector on the simplicial complex.
    
    For level 0 (vertices), shows node coloring.
    For level 1 (edges), shows edge coloring.
    """
    if not HAS_MATPLOTLIB:
        raise ImportError("matplotlib required for this visualization")
    
    Lambda, U = complex.eigendecompositions[level]
    Lambda = Lambda.cpu().numpy()
    U = U.cpu().numpy()
    
    eigenvector = U[:, mode]
    eigenvalue = Lambda[mode]
    
    fig, ax = plt.subplots(figsize=(8, 8))
    
    # Get vertex positions (layout)
    n_vertices = complex.n_simplices[0]
    angles = np.linspace(0, 2*np.pi, n_vertices, endpoint=False)
    pos = {i: (np.cos(a), np.sin(a)) for i, a in enumerate(angles)}
    
    if level == 0:
        # Vertex coloring
        vmin, vmax = eigenvector.min(), eigenvector.max()
        norm = plt.Normalize(vmin=vmin, vmax=vmax)
        colors = plt.cm.RdBu_r(norm(eigenvector))
        
        for i, (x, y) in pos.items():
            ax.scatter(x, y, c=[colors[i]], s=500, zorder=2)
            ax.annotate(str(i), (x, y), ha='center', va='center', 
                       fontsize=10, fontweight='bold')
        
        # Draw edges
        if len(complex.simplices) > 1:
            for edge in complex.simplices[1]:
                e = tuple(sorted(edge))
                x = [pos[e[0]][0], pos[e[1]][0]]
                y = [pos[e[0]][1], pos[e[1]][1]]
                ax.plot(x, y, 'k-', alpha=0.3, linewidth=1, zorder=1)
        
        sm = plt.cm.ScalarMappable(cmap='RdBu_r', norm=norm)
        plt.colorbar(sm, ax=ax, label='Eigenvector value')
        
    elif level == 1:
        # Edge coloring
        vmin, vmax = eigenvector.min(), eigenvector.max()
        norm = plt.Normalize(vmin=vmin, vmax=vmax)
        
        for i, edge in enumerate(complex.simplices[1]):
            e = tuple(sorted(edge))
            x = [pos[e[0]][0], pos[e[1]][0]]
            y = [pos[e[0]][1], pos[e[1]][1]]
            color = plt.cm.RdBu_r(norm(eigenvector[i]))
            ax.plot(x, y, c=color, linewidth=3, zorder=1)
        
        # Draw vertices
        for i, (x, y) in pos.items():
            ax.scatter(x, y, c='white', s=200, edgecolors='black', zorder=2)
            ax.annotate(str(i), (x, y), ha='center', va='center', fontsize=8)
        
        sm = plt.cm.ScalarMappable(cmap='RdBu_r', norm=norm)
        plt.colorbar(sm, ax=ax, label='Eigenvector value')
    
    ax.set_xlim(-1.5, 1.5)
    ax.set_ylim(-1.5, 1.5)
    ax.set_aspect('equal')
    ax.axis('off')
    
    mode_type = "Harmonic" if eigenvalue < 1e-6 else "Non-harmonic"
    ax.set_title(title or f'{mode_type} mode {mode} (λ = {eigenvalue:.4f})', fontsize=14)
    
    plt.tight_layout()
    return fig


# =============================================================================
# PART II: Training Dynamics Visualization
# =============================================================================

def plot_spectral_bias_evolution(
    history: Dict[str, List],
    title: str = "Spectral Bias During Training"
):
    """
    Visualize how harmonic vs non-harmonic components evolve during training.
    
    Validates Prediction 1: Harmonic modes should converge faster.
    """
    if not HAS_MATPLOTLIB:
        raise ImportError("matplotlib required for this visualization")
    
    fig, axes = plt.subplots(1, 3, figsize=(15, 4))
    
    # Plot 1: Energy evolution
    ax1 = axes[0]
    if 'harmonic_convergence' in history:
        ax1.plot(history['harmonic_convergence'], 'r-', linewidth=2, 
                label='Harmonic energy', alpha=0.8)
    if 'nonharmonic_convergence' in history:
        ax1.plot(history['nonharmonic_convergence'], 'b-', linewidth=2,
                label='Non-harmonic energy', alpha=0.8)
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Energy')
    ax1.set_title('Energy by Spectral Component')
    ax1.legend()
    ax1.set_yscale('log')
    
    # Plot 2: Loss curves
    ax2 = axes[1]
    if 'train_loss' in history:
        ax2.plot(history['train_loss'], 'b-', linewidth=2, label='Train loss')
    if 'val_loss' in history:
        # Interpolate val_loss to match train_loss length
        val_epochs = np.linspace(0, len(history['train_loss'])-1, len(history['val_loss']))
        ax2.plot(val_epochs, history['val_loss'], 'r--', linewidth=2, label='Val loss')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Loss')
    ax2.set_title('Training Progress')
    ax2.legend()
    
    # Plot 3: Convergence ratio
    ax3 = axes[2]
    if 'harmonic_convergence' in history and 'nonharmonic_convergence' in history:
        h = np.array(history['harmonic_convergence'])
        nh = np.array(history['nonharmonic_convergence'])
        ratio = nh / (h + 1e-10)
        ax3.plot(ratio, 'g-', linewidth=2)
        ax3.axhline(y=15, color='gray', linestyle='--', label='Predicted ratio (L=12)')
        ax3.set_xlabel('Epoch')
        ax3.set_ylabel('Non-harmonic / Harmonic')
        ax3.set_title('Spectral Bias Ratio')
        ax3.legend()
    
    fig.suptitle(title, fontsize=14, y=1.02)
    plt.tight_layout()
    return fig


def plot_fixed_point_analysis(
    spectral_radii: List[float],
    output_types: List[str],
    title: str = "Fixed Point Classification"
):
    """
    Visualize the relationship between Jacobian spectral radius and output type.
    
    Validates Prediction 5: ρ < 1 → repetitive, ρ > 1 → hallucinating, ρ ≈ 1 → creative.
    """
    if not HAS_MATPLOTLIB:
        raise ImportError("matplotlib required for this visualization")
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Color by output type
    colors = {'repetitive': '#e74c3c', 'hallucinating': '#9b59b6', 'creative': '#2ecc71'}
    
    for rho, out_type in zip(spectral_radii, output_types):
        ax.scatter(rho, np.random.uniform(-0.5, 0.5), 
                  c=colors.get(out_type, 'gray'), s=100, alpha=0.7)
    
    # Add boundary lines
    ax.axvline(x=0.95, color='gray', linestyle='--', alpha=0.5)
    ax.axvline(x=1.05, color='gray', linestyle='--', alpha=0.5)
    
    # Regions
    ax.axvspan(0, 0.95, alpha=0.1, color='#e74c3c', label='Stable (repetitive)')
    ax.axvspan(0.95, 1.05, alpha=0.1, color='#2ecc71', label='Neutral (creative)')
    ax.axvspan(1.05, max(spectral_radii) * 1.1, alpha=0.1, color='#9b59b6', label='Unstable (hallucinating)')
    
    # Legend
    handles = [mpatches.Patch(color=c, label=l) for l, c in colors.items()]
    ax.legend(handles=handles, loc='upper right')
    
    ax.set_xlabel('Jacobian Spectral Radius ρ', fontsize=12)
    ax.set_ylabel('Sample (jittered)', fontsize=12)
    ax.set_title(title, fontsize=14)
    ax.set_yticks([])
    
    plt.tight_layout()
    return fig


# =============================================================================
# PART III: Tropical Degeneration Visualization
# =============================================================================

def plot_tropical_degeneration(
    attention_matrix: torch.Tensor,
    temperatures: List[float] = [1.0, 0.5, 0.1, 0.01],
    title: str = "Tropical Degeneration of Attention"
):
    """
    Visualize how attention patterns change as temperature → 0 (tropical limit).
    
    Shows transition from soft attention to hard (argmax) attention.
    """
    if not HAS_MATPLOTLIB:
        raise ImportError("matplotlib required for this visualization")
    
    A = attention_matrix.cpu().numpy()
    n = A.shape[0]
    
    fig, axes = plt.subplots(1, len(temperatures), figsize=(4*len(temperatures), 4))
    
    for i, temp in enumerate(temperatures):
        ax = axes[i] if len(temperatures) > 1 else axes
        
        # Apply temperature scaling
        A_scaled = A / temp
        A_softmax = np.exp(A_scaled) / np.exp(A_scaled).sum(axis=-1, keepdims=True)
        
        im = ax.imshow(A_softmax, cmap='Blues', vmin=0, vmax=1)
        ax.set_title(f'T = {temp}', fontsize=12)
        ax.set_xlabel('Key')
        ax.set_ylabel('Query')
        
        if i == len(temperatures) - 1:
            plt.colorbar(im, ax=ax, label='Attention weight')
    
    # Mark the tropical limit
    axes[-1].set_title(f'T = {temperatures[-1]} (→ argmax)', fontsize=12)
    
    fig.suptitle(title, fontsize=14, y=1.02)
    plt.tight_layout()
    return fig


def plot_quantization_comparison(
    results: Dict[str, Dict[int, float]],
    title: str = "Quantization Comparison"
):
    """
    Compare linear vs log quantization accuracy across bit widths.
    
    Validates Prediction 2: Log quantization should outperform linear.
    """
    if not HAS_MATPLOTLIB:
        raise ImportError("matplotlib required for this visualization")
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    bits = sorted(results['linear'].keys())
    linear_acc = [results['linear'][b] for b in bits]
    log_acc = [results['log'][b] for b in bits]
    
    x = np.arange(len(bits))
    width = 0.35
    
    bars1 = ax.bar(x - width/2, linear_acc, width, label='Linear quantization', 
                   color='#3498db', alpha=0.8)
    bars2 = ax.bar(x + width/2, log_acc, width, label='Log quantization',
                   color='#e74c3c', alpha=0.8)
    
    # Full precision baseline
    if results['full_precision'] is not None:
        ax.axhline(y=results['full_precision'], color='gray', linestyle='--',
                  label=f'Full precision ({results["full_precision"]:.4f})')
    
    ax.set_xlabel('Bit width', fontsize=12)
    ax.set_ylabel('Accuracy', fontsize=12)
    ax.set_title(title, fontsize=14)
    ax.set_xticks(x)
    ax.set_xticklabels([f'{b}-bit' for b in bits])
    ax.legend()
    
    # Add advantage labels
    for i, (l, lg) in enumerate(zip(linear_acc, log_acc)):
        if lg > l:
            ax.annotate(f'+{(lg-l)*100:.1f}%', (x[i] + width/2, lg + 0.01),
                       ha='center', fontsize=9, color='#e74c3c')
    
    plt.tight_layout()
    return fig


# =============================================================================
# PART IV: Interactive Plotly Visualizations
# =============================================================================

def create_interactive_spectrum(complex, max_level: int = 2):
    """
    Create an interactive Plotly visualization of the Hodge spectrum hierarchy.
    """
    if not HAS_PLOTLY:
        raise ImportError("plotly required for this visualization")
    
    fig = make_subplots(
        rows=1, cols=min(max_level + 1, len(complex.eigendecompositions)),
        subplot_titles=[f'L_{k} Spectrum (β_{k}={complex.betti_numbers[k]})' 
                       for k in range(min(max_level + 1, len(complex.eigendecompositions)))]
    )
    
    for k in range(min(max_level + 1, len(complex.eigendecompositions))):
        Lambda, _ = complex.eigendecompositions[k]
        Lambda = Lambda.cpu().numpy()
        
        colors = ['red' if l < 1e-6 else 'blue' for l in Lambda]
        
        fig.add_trace(
            go.Bar(
                x=list(range(len(Lambda))),
                y=Lambda,
                marker_color=colors,
                name=f'Level {k}',
                hovertemplate='λ_%{x} = %{y:.4f}<extra></extra>'
            ),
            row=1, col=k+1
        )
    
    fig.update_layout(
        title='Hodge Laplacian Spectrum Hierarchy',
        showlegend=False,
        height=400
    )
    
    return fig


def create_interactive_complex(
    complex,
    features: Optional[torch.Tensor] = None,
    title: str = "Simplicial Complex"
):
    """
    Create an interactive 3D visualization of the simplicial complex.
    """
    if not HAS_PLOTLY:
        raise ImportError("plotly required for this visualization")
    
    n_vertices = complex.n_simplices[0]
    
    # Layout vertices in 3D (spectral layout using first 3 eigenvectors)
    if complex.n_simplices[0] > 3:
        Lambda, U = complex.eigendecompositions[0]
        # Use non-trivial eigenvectors for layout
        start_idx = complex.betti_numbers[0]  # Skip harmonic modes
        if U.shape[1] >= start_idx + 3:
            pos = U[:, start_idx:start_idx+3].cpu().numpy()
        else:
            # Fall back to circular layout
            angles = np.linspace(0, 2*np.pi, n_vertices, endpoint=False)
            pos = np.column_stack([np.cos(angles), np.sin(angles), np.zeros(n_vertices)])
    else:
        angles = np.linspace(0, 2*np.pi, n_vertices, endpoint=False)
        pos = np.column_stack([np.cos(angles), np.sin(angles), np.zeros(n_vertices)])
    
    fig = go.Figure()
    
    # Add edges
    if len(complex.simplices) > 1:
        edge_x, edge_y, edge_z = [], [], []
        for edge in complex.simplices[1]:
            e = tuple(sorted(edge))
            edge_x.extend([pos[e[0], 0], pos[e[1], 0], None])
            edge_y.extend([pos[e[0], 1], pos[e[1], 1], None])
            edge_z.extend([pos[e[0], 2], pos[e[1], 2], None])
        
        fig.add_trace(go.Scatter3d(
            x=edge_x, y=edge_y, z=edge_z,
            mode='lines',
            line=dict(color='gray', width=2),
            hoverinfo='none',
            name='Edges'
        ))
    
    # Add triangles (as mesh)
    if len(complex.simplices) > 2 and len(complex.simplices[2]) > 0:
        i_list, j_list, k_list = [], [], []
        for tri in complex.simplices[2]:
            t = tuple(sorted(tri))
            i_list.append(t[0])
            j_list.append(t[1])
            k_list.append(t[2])
        
        fig.add_trace(go.Mesh3d(
            x=pos[:, 0], y=pos[:, 1], z=pos[:, 2],
            i=i_list, j=j_list, k=k_list,
            opacity=0.3,
            color='lightblue',
            name='Triangles'
        ))
    
    # Add vertices
    vertex_colors = features[:, 0].cpu().numpy() if features is not None else np.arange(n_vertices)
    
    fig.add_trace(go.Scatter3d(
        x=pos[:, 0], y=pos[:, 1], z=pos[:, 2],
        mode='markers+text',
        marker=dict(
            size=10,
            color=vertex_colors,
            colorscale='Viridis',
            showscale=True if features is not None else False
        ),
        text=[str(i) for i in range(n_vertices)],
        textposition='top center',
        hovertemplate='Vertex %{text}<extra></extra>',
        name='Vertices'
    ))
    
    fig.update_layout(
        title=title,
        scene=dict(
            xaxis_title='X',
            yaxis_title='Y',
            zaxis_title='Z'
        ),
        height=600
    )
    
    return fig


# =============================================================================
# PART V: Export Functions
# =============================================================================

def export_visualization_data(
    complex,
    history: Optional[Dict] = None,
    output_path: str = 'visualization_data.json'
):
    """
    Export visualization data to JSON for use in web-based visualizations.
    """
    data = {
        'simplices': {
            f'level_{k}': [list(s) for s in complex.simplices[k]]
            for k in range(len(complex.simplices))
        },
        'betti_numbers': complex.betti_numbers,
        'spectra': {
            f'level_{k}': {
                'eigenvalues': complex.eigendecompositions[k][0].cpu().tolist(),
                'eigenvectors': complex.eigendecompositions[k][1].cpu().tolist()
            }
            for k in range(len(complex.eigendecompositions))
        }
    }
    
    if history is not None:
        data['training_history'] = {
            k: [float(v) if isinstance(v, (int, float, np.floating)) else v 
                for v in vals]
            for k, vals in history.items()
            if isinstance(vals, list)
        }
    
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Visualization data exported to {output_path}")
    return data


# =============================================================================
# PART VI: Demo
# =============================================================================

def demo_visualizations():
    """Run a demo of all visualizations."""
    print("=" * 60)
    print("SPECTRAL CATHEDRAL VISUALIZATION DEMO")
    print("=" * 60)
    
    # Create a sample complex
    from sfno_ud import SimplicialComplex
    import torch
    
    # Cycle graph (has β_1 = 1)
    n = 8
    edge_index = torch.tensor([
        list(range(n)) + list(range(1, n)) + [0],
        list(range(1, n)) + [0] + list(range(n))
    ])
    
    complex = SimplicialComplex.from_graph(edge_index, n, include_triangles=False)
    
    print(f"\nCreated cycle graph with {n} vertices")
    print(f"Betti numbers: {complex.betti_numbers}")
    
    if HAS_MATPLOTLIB:
        print("\n1. Plotting Hodge spectrum...")
        fig1 = plot_hodge_spectrum(complex, level=0)
        plt.savefig('hodge_spectrum.png', dpi=150, bbox_inches='tight')
        print("   Saved: hodge_spectrum.png")
        
        print("\n2. Plotting harmonic eigenvector...")
        fig2 = plot_eigenvector(complex, level=0, mode=0)
        plt.savefig('harmonic_mode.png', dpi=150, bbox_inches='tight')
        print("   Saved: harmonic_mode.png")
        
        print("\n3. Plotting non-harmonic eigenvector...")
        fig3 = plot_eigenvector(complex, level=0, mode=1)
        plt.savefig('nonharmonic_mode.png', dpi=150, bbox_inches='tight')
        print("   Saved: nonharmonic_mode.png")
        
        print("\n4. Plotting tropical degeneration...")
        A = torch.randn(n, n)
        fig4 = plot_tropical_degeneration(A)
        plt.savefig('tropical_degeneration.png', dpi=150, bbox_inches='tight')
        print("   Saved: tropical_degeneration.png")
        
        plt.close('all')
    else:
        print("\nMatplotlib not available. Skipping static visualizations.")
    
    if HAS_PLOTLY:
        print("\n5. Creating interactive spectrum...")
        fig5 = create_interactive_spectrum(complex)
        fig5.write_html('interactive_spectrum.html')
        print("   Saved: interactive_spectrum.html")
        
        print("\n6. Creating interactive complex...")
        fig6 = create_interactive_complex(complex)
        fig6.write_html('interactive_complex.html')
        print("   Saved: interactive_complex.html")
    else:
        print("\nPlotly not available. Skipping interactive visualizations.")
    
    print("\n7. Exporting visualization data...")
    export_visualization_data(complex, output_path='viz_data.json')
    
    print("\n" + "=" * 60)
    print("DEMO COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    demo_visualizations()
