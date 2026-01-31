"""
Spectral Cathedral: Interactive Visualization for S-FNO-UD
==========================================================

This module provides visualization tools for exploring the mathematical
structures underlying S-FNO-UD, following the "explorable explanations"
philosophy of Bret Victor and Bartosz Ciechanowski.

Components:
    1. Hodge Laplacian spectrum visualization
    2. Simplicial complex structure rendering
    3. Tropical degeneration animation
    4. Spectral bias evolution tracking
    5. Attention skeleton graph
    6. Persistent homology diagrams

Output Formats:
    - Static plots (matplotlib/seaborn)
    - Interactive HTML (plotly/bokeh)
    - React components (for web embedding)

Author: Council of Luminaries Visualization Team
Version: 1.0
"""

import numpy as np
from typing import List, Tuple, Optional, Dict
import json
from dataclasses import dataclass

# Try imports, gracefully handle missing dependencies
try:
    import torch
    from torch import Tensor
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False
    Tensor = None

try:
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    from matplotlib.collections import LineCollection, PatchCollection
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
# PART I: Data Structures for Visualization
# =============================================================================

@dataclass
class VisualizationConfig:
    """Configuration for visualizations."""
    
    # Figure dimensions
    figsize: Tuple[int, int] = (12, 8)
    dpi: int = 150
    
    # Colors (Cathedral-inspired palette)
    color_harmonic: str = '#FFD700'      # Gold for harmonic modes
    color_nonharmonic: str = '#4169E1'   # Royal blue for non-harmonic
    color_boundary: str = '#8B0000'      # Dark red for boundaries
    color_tropical: str = '#228B22'      # Forest green for tropical
    color_background: str = '#1a1a2e'    # Dark cathedral blue
    
    # Style
    style: str = 'dark'  # 'dark', 'light', 'paper'
    font_family: str = 'serif'
    
    # Animation
    fps: int = 30
    duration: float = 5.0


# =============================================================================
# PART II: Static Visualizations (Matplotlib)
# =============================================================================

class SpectralCathedralStatic:
    """Static visualizations using matplotlib."""
    
    def __init__(self, config: Optional[VisualizationConfig] = None):
        self.config = config or VisualizationConfig()
        
        if HAS_MATPLOTLIB:
            # Set style
            if self.config.style == 'dark':
                plt.style.use('dark_background')
            elif self.config.style == 'paper':
                plt.style.use('seaborn-paper')
    
    def plot_hodge_spectrum_cathedral(
        self,
        eigenvalues: np.ndarray,
        level: int = 0,
        title: str = "Hodge Laplacian Spectrum",
        save_path: Optional[str] = None
    ):
        """
        Plot Hodge spectrum as a cathedral-inspired visualization.
        
        Harmonic modes (λ=0) are shown as golden spires.
        Non-harmonic modes form the supporting structure.
        """
        if not HAS_MATPLOTLIB:
            print("matplotlib not available")
            return
        
        fig, ax = plt.subplots(figsize=self.config.figsize, dpi=self.config.dpi)
        
        n_modes = len(eigenvalues)
        x = np.arange(n_modes)
        
        # Identify harmonic modes
        harmonic_mask = eigenvalues < 1e-6
        n_harmonic = harmonic_mask.sum()
        
        # Create cathedral-style bars
        # Harmonic modes as tall golden spires
        ax.bar(
            x[harmonic_mask],
            np.ones(n_harmonic) * eigenvalues.max() * 1.5,
            color=self.config.color_harmonic,
            alpha=0.8,
            width=0.8,
            label=f'Harmonic (β_{level} = {n_harmonic})'
        )
        
        # Non-harmonic modes as blue pillars
        ax.bar(
            x[~harmonic_mask],
            eigenvalues[~harmonic_mask],
            color=self.config.color_nonharmonic,
            alpha=0.7,
            width=0.8,
            label='Non-harmonic'
        )
        
        # Add spectral gap annotation
        if (~harmonic_mask).any():
            spectral_gap = eigenvalues[~harmonic_mask].min()
            ax.axhline(
                y=spectral_gap,
                color=self.config.color_boundary,
                linestyle='--',
                label=f'Spectral gap γ_{level} = {spectral_gap:.3f}'
            )
        
        # Cathedral decorations
        ax.set_xlabel('Mode Index', fontsize=12, fontfamily=self.config.font_family)
        ax.set_ylabel('Eigenvalue λ', fontsize=12, fontfamily=self.config.font_family)
        ax.set_title(
            f'{title}\nLevel k = {level}',
            fontsize=14,
            fontfamily=self.config.font_family,
            fontweight='bold'
        )
        ax.legend(loc='upper right')
        ax.set_xlim(-0.5, n_modes - 0.5)
        ax.set_ylim(0, eigenvalues.max() * 1.7)
        
        # Grid like cathedral windows
        ax.grid(True, alpha=0.2, linestyle='-.')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=self.config.dpi, bbox_inches='tight')
        
        return fig, ax
    
    def plot_simplicial_complex_2d(
        self,
        vertices: np.ndarray,
        edges: List[Tuple[int, int]],
        triangles: Optional[List[Tuple[int, int, int]]] = None,
        vertex_values: Optional[np.ndarray] = None,
        title: str = "Simplicial Complex",
        save_path: Optional[str] = None
    ):
        """
        Plot a 2D simplicial complex with vertices, edges, and triangles.
        
        vertex_values can be eigenvector components for visualization.
        """
        if not HAS_MATPLOTLIB:
            print("matplotlib not available")
            return
        
        fig, ax = plt.subplots(figsize=self.config.figsize, dpi=self.config.dpi)
        
        # Draw triangles (2-simplices)
        if triangles:
            for tri in triangles:
                triangle = plt.Polygon(
                    vertices[list(tri)],
                    facecolor=self.config.color_tropical,
                    edgecolor='none',
                    alpha=0.3
                )
                ax.add_patch(triangle)
        
        # Draw edges (1-simplices)
        for edge in edges:
            ax.plot(
                [vertices[edge[0], 0], vertices[edge[1], 0]],
                [vertices[edge[0], 1], vertices[edge[1], 1]],
                color=self.config.color_nonharmonic,
                linewidth=2,
                alpha=0.7
            )
        
        # Draw vertices (0-simplices)
        if vertex_values is not None:
            # Color by eigenvector value
            scatter = ax.scatter(
                vertices[:, 0],
                vertices[:, 1],
                c=vertex_values,
                cmap='coolwarm',
                s=100,
                zorder=5,
                edgecolors='white',
                linewidths=1
            )
            plt.colorbar(scatter, ax=ax, label='Eigenvector Value')
        else:
            ax.scatter(
                vertices[:, 0],
                vertices[:, 1],
                c=self.config.color_harmonic,
                s=100,
                zorder=5,
                edgecolors='white',
                linewidths=1
            )
        
        ax.set_title(title, fontsize=14, fontfamily=self.config.font_family)
        ax.set_aspect('equal')
        ax.axis('off')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=self.config.dpi, bbox_inches='tight')
        
        return fig, ax
    
    def plot_tropical_degeneration(
        self,
        soft_attention: np.ndarray,
        hard_attention: np.ndarray,
        title: str = "Tropical Degeneration: Soft → Hard Attention",
        save_path: Optional[str] = None
    ):
        """
        Compare soft (standard) and hard (tropical) attention patterns.
        
        Following Theorem 3.2: lim_{t→0} softmax(x/t) = argmax(x)
        """
        if not HAS_MATPLOTLIB:
            print("matplotlib not available")
            return
        
        fig, axes = plt.subplots(1, 3, figsize=(15, 5), dpi=self.config.dpi)
        
        # Soft attention
        im1 = axes[0].imshow(
            soft_attention,
            cmap='viridis',
            aspect='auto'
        )
        axes[0].set_title('Soft Attention (T=1)', fontsize=12)
        axes[0].set_xlabel('Key')
        axes[0].set_ylabel('Query')
        plt.colorbar(im1, ax=axes[0])
        
        # Hard attention
        im2 = axes[1].imshow(
            hard_attention,
            cmap='viridis',
            aspect='auto'
        )
        axes[1].set_title('Hard Attention (T→0)', fontsize=12)
        axes[1].set_xlabel('Key')
        axes[1].set_ylabel('Query')
        plt.colorbar(im2, ax=axes[1])
        
        # Difference (what's lost)
        diff = soft_attention - hard_attention
        im3 = axes[2].imshow(
            diff,
            cmap='RdBu',
            aspect='auto',
            vmin=-np.abs(diff).max(),
            vmax=np.abs(diff).max()
        )
        axes[2].set_title('Tropical Loss (Soft - Hard)', fontsize=12)
        axes[2].set_xlabel('Key')
        axes[2].set_ylabel('Query')
        plt.colorbar(im3, ax=axes[2])
        
        fig.suptitle(title, fontsize=14, fontweight='bold')
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=self.config.dpi, bbox_inches='tight')
        
        return fig, axes
    
    def plot_spectral_bias_evolution(
        self,
        epochs: List[int],
        harmonic_rates: List[float],
        nonharmonic_rates: List[float],
        title: str = "Spectral Bias: Topological Priority",
        save_path: Optional[str] = None
    ):
        """
        Plot convergence rates for harmonic vs non-harmonic modes.
        
        Following Theorem 2.14: κ_i ∝ (λ_i + ε)^(-α)
        """
        if not HAS_MATPLOTLIB:
            print("matplotlib not available")
            return
        
        fig, ax = plt.subplots(figsize=self.config.figsize, dpi=self.config.dpi)
        
        ax.plot(
            epochs, harmonic_rates,
            color=self.config.color_harmonic,
            linewidth=2,
            marker='o',
            label='Harmonic (topological)'
        )
        ax.plot(
            epochs, nonharmonic_rates,
            color=self.config.color_nonharmonic,
            linewidth=2,
            marker='s',
            label='Non-harmonic (geometric)'
        )
        
        # Add ratio annotation
        if len(epochs) > 0 and harmonic_rates[-1] > 0 and nonharmonic_rates[-1] > 0:
            final_ratio = harmonic_rates[-1] / nonharmonic_rates[-1]
            ax.annotate(
                f'Final ratio: {final_ratio:.1f}×',
                xy=(epochs[-1], harmonic_rates[-1]),
                xytext=(epochs[-1] * 0.8, harmonic_rates[-1] * 1.2),
                fontsize=10,
                arrowprops=dict(arrowstyle='->', color='white')
            )
        
        ax.set_xlabel('Epoch', fontsize=12)
        ax.set_ylabel('Convergence Rate', fontsize=12)
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.legend()
        ax.grid(True, alpha=0.3)
        ax.set_yscale('log')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=self.config.dpi, bbox_inches='tight')
        
        return fig, ax
    
    def plot_persistent_homology(
        self,
        birth_death: List[Tuple[float, float]],
        dimension: int = 0,
        title: str = "Persistence Diagram",
        save_path: Optional[str] = None
    ):
        """
        Plot persistence diagram for attention homology.
        
        Following Theorem 3.14: Long bars = robust semantic structure.
        """
        if not HAS_MATPLOTLIB:
            print("matplotlib not available")
            return
        
        fig, axes = plt.subplots(1, 2, figsize=(12, 5), dpi=self.config.dpi)
        
        births = [bd[0] for bd in birth_death]
        deaths = [bd[1] for bd in birth_death]
        lifetimes = [d - b for b, d in birth_death]
        
        # Persistence diagram
        ax = axes[0]
        ax.scatter(
            births, deaths,
            c=lifetimes,
            cmap='plasma',
            s=50,
            alpha=0.7
        )
        
        # Diagonal
        max_val = max(max(deaths), 1.0)
        ax.plot([0, max_val], [0, max_val], 'k--', alpha=0.5)
        
        ax.set_xlabel('Birth')
        ax.set_ylabel('Death')
        ax.set_title(f'Persistence Diagram (H_{dimension})')
        ax.set_aspect('equal')
        
        # Barcode
        ax = axes[1]
        for i, (b, d) in enumerate(birth_death):
            ax.plot([b, d], [i, i], linewidth=2)
        
        ax.set_xlabel('Filtration Value')
        ax.set_ylabel('Feature Index')
        ax.set_title(f'Barcode (H_{dimension})')
        
        fig.suptitle(title, fontsize=14, fontweight='bold')
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=self.config.dpi, bbox_inches='tight')
        
        return fig, axes


# =============================================================================
# PART III: Interactive Visualizations (Plotly)
# =============================================================================

class SpectralCathedralInteractive:
    """Interactive visualizations using Plotly."""
    
    def __init__(self, config: Optional[VisualizationConfig] = None):
        self.config = config or VisualizationConfig()
    
    def create_spectrum_explorer(
        self,
        eigenvalues_by_level: Dict[int, np.ndarray],
        title: str = "Hodge Spectrum Explorer"
    ) -> Optional[str]:
        """
        Create interactive spectrum explorer with level selection.
        
        Returns HTML string for embedding.
        """
        if not HAS_PLOTLY:
            print("plotly not available")
            return None
        
        # Create figure with dropdown for level selection
        fig = go.Figure()
        
        # Add traces for each level
        buttons = []
        for level, eigenvalues in eigenvalues_by_level.items():
            n_harmonic = (eigenvalues < 1e-6).sum()
            
            visible = [False] * len(eigenvalues_by_level) * 2
            visible[level * 2] = True
            visible[level * 2 + 1] = True
            
            # Harmonic modes
            fig.add_trace(go.Bar(
                x=list(range(len(eigenvalues))),
                y=np.where(eigenvalues < 1e-6, eigenvalues.max() * 1.5, 0),
                name=f'Harmonic (k={level})',
                marker_color=self.config.color_harmonic,
                visible=(level == 0)
            ))
            
            # Non-harmonic modes
            fig.add_trace(go.Bar(
                x=list(range(len(eigenvalues))),
                y=np.where(eigenvalues >= 1e-6, eigenvalues, 0),
                name=f'Non-harmonic (k={level})',
                marker_color=self.config.color_nonharmonic,
                visible=(level == 0)
            ))
            
            buttons.append(dict(
                label=f'Level k={level} (β_{level}={n_harmonic})',
                method='update',
                args=[{'visible': visible}]
            ))
        
        # Add dropdown
        fig.update_layout(
            updatemenus=[dict(
                type='dropdown',
                direction='down',
                x=0.1,
                y=1.15,
                buttons=buttons
            )],
            title=title,
            xaxis_title='Mode Index',
            yaxis_title='Eigenvalue λ',
            barmode='overlay',
            template='plotly_dark' if self.config.style == 'dark' else 'plotly'
        )
        
        return fig.to_html(include_plotlyjs='cdn')
    
    def create_attention_flow_3d(
        self,
        attention_matrix: np.ndarray,
        positions: Optional[np.ndarray] = None,
        title: str = "Attention Flow (3D)"
    ) -> Optional[str]:
        """
        Create 3D visualization of attention flow.
        
        Nodes are positioned in 3D space, edges show attention weights.
        """
        if not HAS_PLOTLY:
            print("plotly not available")
            return None
        
        n = attention_matrix.shape[0]
        
        # Default positions: circle in xy-plane, layer in z
        if positions is None:
            theta = np.linspace(0, 2 * np.pi, n, endpoint=False)
            positions = np.column_stack([
                np.cos(theta),
                np.sin(theta),
                np.zeros(n)
            ])
        
        # Create edges
        edge_x, edge_y, edge_z = [], [], []
        edge_colors = []
        
        threshold = 0.1  # Only show significant attention
        for i in range(n):
            for j in range(n):
                if attention_matrix[i, j] > threshold:
                    edge_x.extend([positions[i, 0], positions[j, 0], None])
                    edge_y.extend([positions[i, 1], positions[j, 1], None])
                    edge_z.extend([positions[i, 2], positions[j, 2], None])
                    edge_colors.append(attention_matrix[i, j])
        
        # Create figure
        fig = go.Figure()
        
        # Add edges
        fig.add_trace(go.Scatter3d(
            x=edge_x, y=edge_y, z=edge_z,
            mode='lines',
            line=dict(color='rgba(100, 100, 255, 0.3)', width=1),
            hoverinfo='none'
        ))
        
        # Add nodes
        fig.add_trace(go.Scatter3d(
            x=positions[:, 0],
            y=positions[:, 1],
            z=positions[:, 2],
            mode='markers+text',
            marker=dict(
                size=10,
                color=attention_matrix.sum(axis=0),
                colorscale='Viridis',
                colorbar=dict(title='Total Attention')
            ),
            text=[f'Token {i}' for i in range(n)],
            hoverinfo='text'
        ))
        
        fig.update_layout(
            title=title,
            scene=dict(
                xaxis_title='X',
                yaxis_title='Y',
                zaxis_title='Layer'
            ),
            template='plotly_dark' if self.config.style == 'dark' else 'plotly'
        )
        
        return fig.to_html(include_plotlyjs='cdn')


# =============================================================================
# PART IV: React Component Generation
# =============================================================================

def generate_react_spectrum_component() -> str:
    """
    Generate a React component for interactive spectrum visualization.
    
    Uses D3.js for rendering within React.
    """
    return '''
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const SpectralCathedral = ({ eigenvalues, level = 0, width = 800, height = 500 }) => {
  const svgRef = useRef();
  const [selectedMode, setSelectedMode] = useState(null);
  
  useEffect(() => {
    if (!eigenvalues || eigenvalues.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const margin = { top: 40, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleBand()
      .domain(d3.range(eigenvalues.length))
      .range([0, innerWidth])
      .padding(0.1);
    
    const maxVal = Math.max(...eigenvalues) * 1.5;
    const yScale = d3.scaleLinear()
      .domain([0, maxVal])
      .range([innerHeight, 0]);
    
    // Identify harmonic modes
    const isHarmonic = eigenvalues.map(e => e < 1e-6);
    const nHarmonic = isHarmonic.filter(h => h).length;
    
    // Draw bars
    g.selectAll("rect")
      .data(eigenvalues)
      .enter()
      .append("rect")
      .attr("x", (d, i) => xScale(i))
      .attr("y", (d, i) => isHarmonic[i] ? yScale(maxVal) : yScale(d))
      .attr("width", xScale.bandwidth())
      .attr("height", (d, i) => isHarmonic[i] ? innerHeight : innerHeight - yScale(d))
      .attr("fill", (d, i) => isHarmonic[i] ? "#FFD700" : "#4169E1")
      .attr("opacity", 0.8)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 1);
        setSelectedMode({ index: eigenvalues.indexOf(d), value: d });
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.8);
        setSelectedMode(null);
      });
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickValues(
        d3.range(0, eigenvalues.length, Math.ceil(eigenvalues.length / 10))
      ));
    
    g.append("g")
      .call(d3.axisLeft(yScale));
    
    // Labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text(`Hodge Spectrum (Level ${level}, β_${level} = ${nHarmonic})`);
    
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .text("Mode Index");
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .text("Eigenvalue λ");
    
  }, [eigenvalues, level, width, height]);
  
  return (
    <div className="spectral-cathedral">
      <svg ref={svgRef} width={width} height={height} />
      {selectedMode && (
        <div className="tooltip">
          Mode {selectedMode.index}: λ = {selectedMode.value.toFixed(6)}
          {selectedMode.value < 1e-6 ? " (Harmonic)" : ""}
        </div>
      )}
    </div>
  );
};

export default SpectralCathedral;
'''


def generate_react_attention_component() -> str:
    """
    Generate a React component for attention visualization.
    """
    return '''
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const AttentionHeatmap = ({ 
  attention, 
  labels = null, 
  width = 600, 
  height = 600,
  tropical = false 
}) => {
  const svgRef = useRef();
  const [temperature, setTemperature] = useState(1.0);
  
  // Apply temperature scaling (for tropical degeneration)
  const scaledAttention = attention.map(row => {
    if (tropical || temperature < 0.1) {
      // Hard (tropical) attention: argmax
      const max = Math.max(...row);
      return row.map(v => v === max ? 1 : 0);
    } else {
      // Soft attention with temperature
      const exp = row.map(v => Math.exp(v / temperature));
      const sum = exp.reduce((a, b) => a + b, 0);
      return exp.map(v => v / sum);
    }
  });
  
  useEffect(() => {
    if (!attention || attention.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const n = attention.length;
    const cellSize = Math.min(width, height) / (n + 2);
    const margin = cellSize;
    
    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, 1]);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin},${margin})`);
    
    // Draw cells
    scaledAttention.forEach((row, i) => {
      row.forEach((val, j) => {
        g.append("rect")
          .attr("x", j * cellSize)
          .attr("y", i * cellSize)
          .attr("width", cellSize - 1)
          .attr("height", cellSize - 1)
          .attr("fill", colorScale(val))
          .attr("rx", 2);
      });
    });
    
    // Labels
    if (labels) {
      labels.forEach((label, i) => {
        // Row labels (Query)
        g.append("text")
          .attr("x", -5)
          .attr("y", i * cellSize + cellSize / 2)
          .attr("text-anchor", "end")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "10px")
          .text(label);
        
        // Column labels (Key)
        g.append("text")
          .attr("x", i * cellSize + cellSize / 2)
          .attr("y", -5)
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("transform", `rotate(-45, ${i * cellSize + cellSize / 2}, -5)`)
          .text(label);
      });
    }
    
  }, [scaledAttention, width, height]);
  
  return (
    <div className="attention-heatmap">
      <div className="controls">
        <label>
          Temperature (T → 0 = Tropical): {temperature.toFixed(2)}
          <input
            type="range"
            min="0.01"
            max="2"
            step="0.01"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
          />
        </label>
      </div>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};

export default AttentionHeatmap;
'''


# =============================================================================
# PART V: Export Functions
# =============================================================================

def export_visualization_suite(output_dir: str = './visualizations'):
    """
    Export all visualization components and styles.
    """
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    # Export React components
    with open(os.path.join(output_dir, 'SpectralCathedral.jsx'), 'w') as f:
        f.write(generate_react_spectrum_component())
    
    with open(os.path.join(output_dir, 'AttentionHeatmap.jsx'), 'w') as f:
        f.write(generate_react_attention_component())
    
    # Export CSS
    css = '''
.spectral-cathedral {
  font-family: 'Georgia', serif;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding: 20px;
  border-radius: 8px;
}

.spectral-cathedral svg {
  background: transparent;
}

.spectral-cathedral text {
  fill: #e0e0e0;
}

.spectral-cathedral .tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: #FFD700;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.attention-heatmap {
  font-family: 'Georgia', serif;
  background: #1a1a2e;
  padding: 20px;
  border-radius: 8px;
}

.attention-heatmap .controls {
  margin-bottom: 15px;
  color: #e0e0e0;
}

.attention-heatmap input[type="range"] {
  width: 200px;
  margin-left: 10px;
}
'''
    
    with open(os.path.join(output_dir, 'cathedral.css'), 'w') as f:
        f.write(css)
    
    print(f"Exported visualization suite to {output_dir}/")
    print("  - SpectralCathedral.jsx")
    print("  - AttentionHeatmap.jsx")
    print("  - cathedral.css")


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    print("Spectral Cathedral: Visualization Module")
    print("=" * 50)
    print()
    print("Components:")
    print("  1. SpectralCathedralStatic - Matplotlib visualizations")
    print("  2. SpectralCathedralInteractive - Plotly visualizations")
    print("  3. React components for web embedding")
    print()
    
    # Demo with synthetic data
    if HAS_MATPLOTLIB:
        print("Creating demo visualization...")
        
        # Synthetic Hodge spectrum
        eigenvalues = np.concatenate([
            np.zeros(3),  # 3 harmonic modes
            np.linspace(0.5, 5.0, 20)  # 20 non-harmonic
        ])
        
        viz = SpectralCathedralStatic()
        fig, ax = viz.plot_hodge_spectrum_cathedral(
            eigenvalues,
            level=0,
            save_path='demo_spectrum.png'
        )
        print("Saved: demo_spectrum.png")
    
    # Export React components
    export_visualization_suite('./viz_export')
