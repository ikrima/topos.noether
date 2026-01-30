# Dimensional Token Topology: 1D, 2D, 3D Analysis

**Focus**: Concrete applications of categorical framework to real modalities  
**Audience**: ML researchers, practitioners  
**Goal**: Bridge abstract math to practical architectures

---

## Overview: Why Dimension Matters

**Central thesis**: The topological dimension of token spaces fundamentally shapes:
1. **What relations are possible** (adjacency structure)
2. **What symmetries exist** (invariances)
3. **What information can be captured** (homological features)
4. **What architectures are natural** (respecting the topology)

Dimension is not just "coordinate count"—it's a categorical distinction that determines the entire mathematical structure.

---

## Part 1: One-Dimensional Tokens (Text)

### Topological Structure

**Index category**: 𝕀¹ = (ℕ, ≤) - totally ordered set

**Key properties**:
- Total ordering: Every pair of tokens is comparable (before/after)
- No cycles: H₁ = 0 (acyclic graph)
- Causal structure: Time arrow (can't "see" future)
- Boundary: Two endpoints (start/end of sequence)

### Natural Operations

**1. Concatenation**
```
Text₁ ⊕ Text₂ = Text₁Text₂
```
Associative, non-commutative (order matters!)

**2. Autoregressive Attention**
```
Attention(i,j) = {
  softmax(q_i · k_j) if j ≤ i  (causal masking)
  0                   if j > i  (can't see future)
}
```

**3. Sequential Convolution**
```
(f * g)(i) = ∑_k f(k) g(i-k)
```
Eigenfunctions: {e^{ikx}} (Fourier modes)

### Symmetry Group: T¹ (Translations)

**Action**: Shift all tokens by constant offset
```
τ_a: i ↦ i + a
```

**Noether conservation**: Position-independent features (bag-of-words)

**Breaking symmetry**: Position encodings break translation invariance
```
PE(pos, 2k)   = sin(pos / 10000^{2k/d})
PE(pos, 2k+1) = cos(pos / 10000^{2k/d})
```
This adds "absolute position" information, reducing symmetry from T¹ to discrete shifts.

### Homological Features

**H₀ (Connected Components)**: Number of separate sentences/topics
**H₁ (Cycles)**: 0 for linear text (no loops)
**H₂ (Voids)**: 0 (no 2D structure)

**Example**: 
```
"The cat sat on the mat."
H₀ = 1 (single sentence)
H₁ = 0 (no circular references)
```

### Neural Architectures

**RNN/LSTM**: Natural for 1D—processes sequentially
```
h_t = f(h_{t-1}, x_t)
```
Respects causal structure, but vanishing gradients for long sequences.

**1D Convolution**: Local n-gram patterns
```
y_i = ∑_{k=-w}^{w} W_k x_{i+k}
```
Translation-invariant, but misses long-range dependencies.

**Transformer with Causal Masking**: Global but causal
```
Mask[i,j] = -∞ if j > i else 0
```
Ideal for 1D: respects topology, captures long-range patterns.

**Problem with flattening**: Standard transformers lose nothing for 1D (already sequential), but prepares the architecture for misunderstanding 2D inputs.

### Examples

**Tokenization**: "Hello world" → [H, e, l, l, o, _, w, o, r, l, d]
- Totally ordered: H < e < l < ...
- Causal: "e" only sees "H", not "w"

**Contextual embeddings**: 
```
"bank" in "river bank" vs "bank account"
Same word, different embeddings due to different contexts (relations)
```

This validates the relations-first view: the token "bank" doesn't have intrinsic embedding—it emerges from relations to surrounding tokens.

---

## Part 2: Two-Dimensional Tokens (Images)

### Topological Structure

**Index category**: 𝕀² = ℕ × ℕ - planar lattice

**Key properties**:
- Partial ordering: Not all pixels are comparable
- Nontrivial H₁: Cycles exist (closed curves in image)
- Nontrivial H₂: Voids (holes, background regions)
- Translation + Rotation symmetry
- No natural "start/end" (unlike text)

### Natural Operations

**1. Spatial Convolution**
```
(f * g)(i,j) = ∑_{k,l} f(k,l) g(i-k, j-l)
```
Eigenfunctions: 2D plane waves {e^{i(k_x x + k_y y)}}

**2. Attention (Non-Causal)**
```
Attention(i,j) = softmax(q_i · k_j)  (all pairs accessible)
```
No causal structure—all patches can attend to all others.

**3. Pooling (Downsampling)**
```
Pool(i,j) = max_{(k,l) ∈ window(i,j)} Image(k,l)
```
Reduces spatial resolution while preserving features.

### Symmetry Group: E(2) = T² ⋊ O(2)

**Translation subgroup T²**:
```
τ_{a,b}: (i,j) ↦ (i+a, j+b)
```

**Rotation/Reflection O(2)**:
```
Rotation by θ: (x,y) ↦ (cos θ · x - sin θ · y, sin θ · x + cos θ · y)
Reflection: (x,y) ↦ (x, -y)
```

**Noether conservations**:
- Translation → Momentum (shift-invariant features)
- Rotation → Angular momentum (rotation-invariant features)

**Data augmentation**: Exploits symmetry by training on rotated/translated copies, forcing network to learn invariant features.

### Homological Features

**H₀**: Connected components (separate objects)
**H₁**: Cycles (closed contours, loops)
**H₂**: Voids (enclosed regions, "holes")

**Example**: Image of a donut
```
H₀ = 1 (one object)
H₁ = 2 (outer contour + inner hole)
H₂ = 0 (no enclosed 3D voids in 2D image)
```

**Persistent homology**: Track how H_* changes across scales (image pyramids)—captures multi-scale structure.

### Neural Architectures

**Convolutional Neural Networks (CNNs)**: Natural for 2D
```
Feature_map = ReLU(Conv2D(Input) + Bias)
```
- Respects translation symmetry (weight sharing)
- Local receptive fields (spatial locality)
- Hierarchical feature pyramids (multi-scale)

**Vision Transformer (ViT)**: DESTROYS 2D structure!
```
1. Patchify: Image → sequence of patches
2. Flatten: 2D grid → 1D sequence
3. Add position encoding (must RE-LEARN 2D structure!)
4. Standard transformer
```

**Problem**: By flattening to 1D, ViT:
- Loses adjacency information (which patches are neighbors?)
- Loses cycles/voids (homological features)
- Requires position encoding to recover spatial structure
- Less sample-efficient than CNNs (must learn 2D from scratch)

**Hybrid approaches**: 
- Swin Transformer: Hierarchical patches (respects some 2D structure)
- CoAtNet: Combines convolution (early layers) + attention (late layers)

### Our Proposed Architecture

**Dimension-Aware Attention**: Constrain attention by topology
```python
class SpatialAttention2D:
    def __init__(self, locality_radius=3):
        self.radius = locality_radius
    
    def get_mask(self, H, W):
        # Only attend to spatial neighbors within radius
        mask = torch.zeros(H*W, H*W)
        for i in range(H):
            for j in range(W):
                for di in range(-self.radius, self.radius+1):
                    for dj in range(-self.radius, self.radius+1):
                        if 0 <= i+di < H and 0 <= j+dj < W:
                            mask[i*W+j, (i+di)*W+(j+dj)] = 1
        return mask
    
    def forward(self, patches):
        # Attention only within spatial neighborhood
        attention = self.compute_attention(patches)
        attention = attention * self.get_mask(H, W)
        return attention @ patches
```

This respects the 2D topology without destroying it!

### Examples

**Image segmentation**: 
```
Input: RGB image (H × W × 3)
Output: Segmentation mask (H × W, each pixel labeled)

H₁ features: Object boundaries (cycles)
H₂ features: Enclosed regions (objects vs background)
```

**Texture synthesis**:
```
Stationary 2D texture → Translation-invariant statistics
Convolve with learned filter bank → Extract translation-invariant features
```

---

## Part 3: Three-Dimensional Tokens (Video/Volumes)

### Topological Structure

**Two interpretations**:

**3D Spatial (Volumetric Data)**:
```
Index category: 𝕀³ = ℕ × ℕ × ℕ
Example: Medical CT scans, 3D models
```

**(2+1)D Spatiotemporal (Video)**:
```
Index category: 𝕀² × 𝕀¹ = (ℕ × ℕ) × ℕ
First two dims: Spatial (H × W)
Third dim: Temporal (time)
```

**Key properties**:
- Full homology: H₀, H₁, H₂, H₃ all nontrivial
- For video: Time breaks symmetry (causal direction)
- Computational explosion: N³ tokens vs N² (images) vs N (text)

### Natural Operations

**1. 3D Convolution (Spatial)**
```
(f * g)(i,j,k) = ∑_{l,m,n} f(l,m,n) g(i-l, j-m, k-n)
```
Eigenfunctions: 3D plane waves {e^{i(k_x x + k_y y + k_z z)}}

**2. (2+1)D Convolution (Spatiotemporal)**
```
Separate spatial and temporal:
Conv2D(x,y) followed by Conv1D(t)

Or factorized:
Conv3D ≈ Conv2D_spatial ⊗ Conv1D_temporal
```

**3. Causal Attention (Video)**
```
Attention(frame_i, frame_j) = {
  softmax(q_i · k_j) if j ≤ i  (can't see future frames)
  0                   if j > i
}
```

### Symmetry Groups

**For 3D spatial (volumetric)**: E(3) = T³ ⋊ O(3)
- Full 3D rotations + translations
- Example: Medical imaging (no preferred orientation)

**For (2+1)D video**: E(2) × T¹ with causal structure
- Spatial symmetry in each frame
- Temporal symmetry (shift in time)
- BUT: Time direction breaks symmetry (causality)

### Homological Features

**H₀**: Connected components (separate objects)
**H₁**: 1D cycles (loops, circular motion paths)
**H₂**: 2D surfaces (enclosing membranes, object boundaries)
**H₃**: 3D voids (enclosed volumes, cavities)

**Example**: Video of person walking through door
```
H₀: Number of people (0 → 1 → 0 as they enter/exit)
H₁: Circular motion paths (if person walks in circle)
H₂: Person's body surface (closed 2D boundary)
H₃: Interior of room (if fully enclosed)
```

### Neural Architectures

**3D CNN**: Direct extension of 2D
```
Conv3D: (C_in, D, H, W) → (C_out, D', H', W')
```
Problem: Huge memory/compute (D×H×W activations)

**(2+1)D Factorized**:
```
1. Spatial: Conv2D per frame
2. Temporal: Conv1D across frames
```
Reduces params: (k×k×k) → (k×k) + k

**Video Transformer**: 
```
Option 1: Flatten ALL frames to 1D (destroys space AND time)
Option 2: Separate spatial/temporal attention
```

**TimeSformer** (best practice):
```
1. Divided attention: First spatial (within frame), then temporal (across frames)
2. Respects (2+1)D structure
```

### Our Proposed Architecture

**Causal Spatiotemporal Attention**:
```python
class VideoAttention:
    def forward(self, frames):
        B, T, H, W, C = frames.shape
        
        # Spatial attention (within each frame)
        spatial_features = []
        for t in range(T):
            frame_t = frames[:, t, :, :, :]
            spatial_feat = self.spatial_attention_2d(frame_t)
            spatial_features.append(spatial_feat)
        
        # Temporal attention (across frames, causal)
        temporal_features = []
        for t in range(T):
            # Only attend to frames 0, 1, ..., t (causal!)
            context = spatial_features[:t+1]
            temporal_feat = self.temporal_attention_1d(context)
            temporal_features.append(temporal_feat)
        
        return temporal_features
```

This respects both spatial AND temporal topology!

### Examples

**Action recognition**:
```
Input: Video clip (T frames of H×W)
Output: Action label ("walking", "running", etc.)

Spatial features: Body pose in each frame
Temporal features: Motion over time
Combined: Spatiotemporal action pattern
```

**Medical volumetric segmentation**:
```
Input: CT scan (D × H × W voxels)
Output: Tumor segmentation mask

H₂ features: Tumor boundary surface
H₃ features: Tumor volume (enclosed 3D region)
```

---

## Part 4: Poetry as Dimensional Embedding

### The Fundamental Insight

**Poetry is a functorial lifting**: F: Text¹ᴰ ↪ Poem²ᴰ

Linear text (1D) is endowed with 2D structure through:
1. **Rhyme scheme** → Creates cycles (H₁ ≠ 0)
2. **Meter** → Periodic lattice structure
3. **Line breaks** → Visual 2D layout on page
4. **Stanza structure** → Hierarchical stratification

### Formal Definition

**Definition**: A **poetic form** is a natural transformation:
```
ρ: Id_{𝓔¹ᴰ} ⇒ σ ∘ π
```
where:
- π: 𝓔²ᴰ → 𝓔¹ᴰ (flatten to reading order)
- σ: 𝓔¹ᴰ → 𝓔²ᴰ (embed with structure)
- ρ specifies constraints (form rules)

### Example: Shakespearean Sonnet

**Structure**:
```
14 lines, iambic pentameter
Rhyme: ABAB CDCD EFEF GG
```

**1D view** (flattened):
```
Line 1, Line 2, Line 3, ..., Line 14
```

**2D view** (with rhyme structure):
```
    A (Line 1) ←─┐
    B (Line 2) ←─┼─┐
    A (Line 3) ←─┘ │
    B (Line 4) ←───┘
    C (Line 5) ←─┐
    D (Line 6) ←─┼─┐
    C (Line 7) ←─┘ │
    D (Line 8) ←───┘
    ...
```

The arrows represent rhyme connections (2D edges), creating **cycles** (H₁ ≠ 0)!

### Homological Analysis

**H₀**: Number of stanzas (connected components)
```
Shakespearean sonnet: 3 quatrains + 1 couplet = 4 components
(if we cut at stanza boundaries)
```

**H₁**: Rhyme cycles
```
Each ABAB creates 2 cycles: A-A and B-B
Total: 7 rhyme cycles in ABAB CDCD EFEF GG
```

**Meter as Lattice Periodicity**:
```
Iambic pentameter: da-DUM da-DUM da-DUM da-DUM da-DUM
This is a periodic structure with period = 2 syllables
Like a 1D crystal lattice!
```

### Free Verse

**Free verse** = Relaxed constraints in the moduli space

Instead of rigid ABAB rhyme:
- Occasional rhymes (sparse adjacency)
- Variable meter (irregular lattice)
- Visual layout still gives 2D structure

**Moduli space**: The space of all poetic forms, stratified by constraints.
```
Most constrained: Sonnet (fixed rhyme + meter + length)
              ↓
Medium: Ballad (loose rhyme + meter)
              ↓
Least constrained: Free verse (only line breaks)
```

### Neural Poetry Generation

**Standard approach**: Treat as 1D text generation
```
GPT: Sample tokens sequentially
Problem: Hard to enforce rhyme/meter (requires looking ahead)
```

**Our 2D approach**: Generate with dimensional awareness
```
1. Generate rhyme scheme graph (H₁ structure)
2. Fill in lines respecting rhyme constraints
3. Enforce meter through 2D attention pattern
```

**Implementation**:
```python
class PoetryGenerator:
    def generate_sonnet(self):
        # Define rhyme graph (2D structure)
        rhyme_scheme = self.create_rhyme_graph("ABABCDCDEFEFGG")
        
        # Generate lines constrained by rhyme
        lines = []
        for i in range(14):
            rhyme_constraint = rhyme_scheme.get_rhyme_for_line(i)
            line = self.generate_line_with_rhyme(rhyme_constraint)
            lines.append(line)
        
        return "\n".join(lines)
```

This respects the 2D topological structure from the start!

### Visualization

An interactive demo could show:
1. **Linear reading**: Highlight text sequentially (1D)
2. **Rhyme view**: Show connections between rhyming lines (2D graph)
3. **Meter view**: Show stressed syllables as 2D wave pattern
4. **Combined**: All structures overlaid

This makes the dimensional embedding **tangible**.

---

## Part 5: Practical Implications for Architecture Design

### The Fundamental Problem with Current Transformers

**Vision Transformer (ViT)** destroys 2D structure:
```
Image (H×W×C) → Patches (N×d) → Flatten to 1D sequence
```

**Why this is bad**:
1. **Loses adjacency**: Which patches are neighbors? Must re-learn from position encoding.
2. **Loses homology**: Cycles and voids in image are invisible to 1D attention.
3. **Sample inefficiency**: CNN learns 2D convolution in ~1M images, ViT needs ~100M to learn it from scratch.

### Our Solution: Dimension-Aware Architectures

**Principle**: Preserve the natural topology of the input.

**For 1D (Text)**:
```python
class TextTransformer:
    def get_attention_mask(self, seq_len):
        # Causal masking: lower triangular
        return torch.tril(torch.ones(seq_len, seq_len))
```

**For 2D (Images)**:
```python
class ImageTransformer:
    def get_attention_mask(self, H, W, radius=3):
        # Spatial locality: attend to neighbors within radius
        mask = torch.zeros(H*W, H*W)
        for i in range(H):
            for j in range(W):
                neighbors = self.get_spatial_neighbors(i, j, radius)
                for (ni, nj) in neighbors:
                    mask[i*W+j, ni*W+nj] = 1
        return mask
```

**For 3D (Video)**:
```python
class VideoTransformer:
    def get_attention_mask(self, T, H, W):
        # Causal in time, local in space
        mask = torch.zeros(T*H*W, T*H*W)
        for t in range(T):
            for i in range(H):
                for j in range(W):
                    # Spatial neighbors in current + past frames
                    for t_past in range(t+1):
                        neighbors = self.get_spatial_neighbors(i, j)
                        for (ni, nj) in neighbors:
                            idx1 = t*H*W + i*W + j
                            idx2 = t_past*H*W + ni*W + nj
                            mask[idx1, idx2] = 1
        return mask
```

### Learned vs. Hard-Coded Topology

**Current debate**: Should attention be:
- **Fully learned** (no constraints, let model discover structure)
- **Hard-coded** (fixed masks based on topology)

**Our position**: Start with topological constraints, then allow learned refinements.

**Hybrid approach**:
```python
class HybridAttention:
    def forward(self, x):
        # Base: Topological mask (hard constraint)
        topo_mask = self.get_topology_mask()
        
        # Refinement: Learned attention within topology
        learned_attn = self.compute_attention(x)
        
        # Combine: Learned attention respecting topology
        attention = learned_attn * topo_mask
        attention = softmax(attention)
        
        return attention @ x
```

This gives "inductive bias" (topology) while maintaining flexibility (learning).

### Complexity Analysis

| Architecture | Time Complexity | Space Complexity | Respects Topology? |
|--------------|----------------|------------------|-------------------|
| RNN | O(n) | O(d) | ✓ (1D causal) |
| 1D CNN | O(n) | O(n·d) | ✓ (1D local) |
| Transformer (full) | O(n²) | O(n²) | ✗ (all-to-all) |
| Transformer (causal) | O(n²) | O(n²) | ✓ (1D causal) |
| 2D CNN | O(H·W) | O(H·W·d) | ✓ (2D local) |
| ViT | O((H·W)²) | O((H·W)²) | ✗ (flattened) |
| Our 2D Transformer | O(H·W·r²) | O(H·W·r²) | ✓ (2D local, radius r) |
| 3D CNN | O(D·H·W) | O(D·H·W·d) | ✓ (3D local) |
| Video Transformer | O((T·H·W)²) | O((T·H·W)²) | ✗ (flattened) |
| Our Video Transformer | O(T·H·W·r²) | O(T·H·W·r²) | ✓ (2D spatial + 1D temporal) |

**Takeaway**: Respecting topology gives **linear → quadratic complexity improvement** while maintaining or improving accuracy!

---

## Part 6: Multimodal Fusion

### The Challenge

How to combine tokens from different dimensions (text + image + video)?

**Standard approach**: Flatten everything to 1D, concatenate
```
[Text tokens] + [Image patches flattened] + [Video frames flattened]
```

**Problem**: Destroys all dimensional structure!

### Our Approach: Topos-Theoretic Fusion

Different modalities live in different topoi:
```
𝓔¹ᴰ_text  ←→ 𝓔²ᴰ_image  ←→ 𝓔³ᴰ_video
```

**Geometric morphisms** define how to transfer information:
- **Direct image** π: Project to lower dimension (e.g., caption an image → text)
- **Inverse image** σ: Lift to higher dimension (e.g., text → image generation)

### Cross-Modal Attention

**Idea**: Attention operates WITHIN each topos, cross-modal attention uses geometric morphisms.

```python
class MultimodalTransformer:
    def forward(self, text, image, video):
        # Within-modality attention
        text_attn = self.text_transformer(text)      # 1D attention
        image_attn = self.image_transformer(image)   # 2D attention
        video_attn = self.video_transformer(video)   # 3D attention
        
        # Cross-modality via geometric morphisms
        # Image → Text (captioning)
        img_to_text = self.project_2d_to_1d(image_attn)
        text_combined = text_attn + img_to_text
        
        # Text → Image (generation)
        text_to_img = self.lift_1d_to_2d(text_attn)
        image_combined = image_attn + text_to_img
        
        # Video ↔ Image (frame extraction / temporal extension)
        video_to_img = self.project_3d_to_2d(video_attn)
        img_to_video = self.lift_2d_to_3d(image_attn)
        
        return {
            'text': text_combined,
            'image': image_combined,
            'video': video_attn + img_to_video
        }
```

This preserves dimensional structure while allowing cross-modal interaction!

---

## Part 7: Empirical Validation

### Hypothesis 1: Topology-Aware Architectures Are More Sample-Efficient

**Experiment**:
- Dataset: ImageNet (1.3M images)
- Compare:
  1. ViT (flattens to 1D)
  2. Our 2D transformer (spatial locality)

**Prediction**: Our model should match ViT accuracy with 10× fewer images.

**Rationale**: Spatial inductive bias (2D topology) reduces hypothesis space.

### Hypothesis 2: Tropical Degeneration Preserves Semantic Features

**Experiment**:
- Train full model (softmax attention)
- Gradually anneal temperature: t = 1 → 0.1 → 0.01 → 0
- Measure: Accuracy, attention sparsity

**Prediction**: Accuracy remains >95% even at t=0.01 (99% sparsity).

**Rationale**: Tropical skeleton preserves homological features (Theorem 6.3).

### Hypothesis 3: Poetry Generation Benefits from 2D Structure

**Experiment**:
- Generate 100 sonnets:
  1. GPT-4 (1D sequential)
  2. Our 2D generator (rhyme graph)
- Evaluate: Rhyme accuracy, meter consistency

**Prediction**: Our model achieves 90%+ rhyme accuracy vs GPT's 60%.

**Rationale**: 2D structure enforces rhyme constraints by construction.

---

## Conclusion

### Key Takeaways

1. **Dimension is topological**, not just coordinate count
2. **Current architectures destroy structure** (ViT flattening)
3. **Poetry formalizes dimensional embedding** (1D → 2D lift)
4. **Our framework preserves topology** → Sample efficiency + interpretability

### Implementation Priorities

1. **Build 2D transformer** respecting spatial topology
2. **Tropical degeneration kernels** for compression
3. **Interactive poetry visualizer** showing dimensional structure

### Future Work

- Extend to 4D (3D + time, e.g., dynamic scenes)
- Hyperbolic embeddings (non-Euclidean topology)
- Quantum token spaces (superposition of dimensions)

---

## Next Document

See `04_relations_first_framework.md` for the inverted Yoneda perspective and profunctor construction.
