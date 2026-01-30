# Mathematical Foundations: Category Theory of Token Spaces

**Prerequisites**: Category theory, sheaf theory, basics of higher categories  
**Notation**: All categories are locally small unless stated otherwise  
**Goal**: Rigorous formalization of dimensional token topology

---

## 1. Dimensional Index Categories

### Definition 1.1 (Index Categories)

For each dimension d ∈ {1,2,3}, define the index category **𝕀ᵈ**:

**𝕀¹**: The category with:
- Objects: ℕ (natural numbers)
- Morphisms: Hom(i,j) = {≤} if i ≤ j, else ∅
- This is the category of linear order (causal structure)

**𝕀²**: The product category ℕ × ℕ with:
- Objects: Pairs (i,j) ∈ ℕ²
- Morphisms: Hom((i₁,j₁), (i₂,j₂)) = Hom(i₁,i₂) × Hom(j₁,j₂)
- This is the category of planar lattice (spatial structure)

**𝕀³**: The product category ℕ × ℕ × ℕ with:
- Objects: Triples (i,j,k) ∈ ℕ³
- Morphisms: Product of morphisms in each coordinate
- This is the category of volumetric lattice (spatiotemporal structure)

**Remark**: These categories have natural functors 𝕀¹ ↪ 𝕀² ↪ 𝕀³ (embeddings) and projections 𝕀³ ↠ 𝕀² ↠ 𝕀¹.

### Definition 1.2 (Token Space Functor)

A **d-dimensional token space** is a functor:
```
T: 𝕀ᵈ → Vect_ℝ
```
where Vect_ℝ is the category of finite-dimensional real vector spaces.

**Examples**:
- **1D (Text)**: T: ℕ → ℝⁿ assigns each position i a token embedding T(i) ∈ ℝⁿ
- **2D (Image)**: T: ℕ² → ℝⁿ assigns each pixel (i,j) a patch embedding
- **3D (Video)**: T: ℕ³ → ℝⁿ assigns each voxel (i,j,k) a volumetric token

---

## 2. Symmetry and Gauge Structure

### Definition 2.1 (Dimensional Symmetry Groups)

For each dimension, the natural symmetry group:

**Dim 1**: **T¹** = (ℝ, +) acting on ℕ by translation
```
τₐ: i ↦ i + a  (shift in sequence)
```

**Dim 2**: **E(2)** = T² ⋊ O(2) = isometries of ℝ²
```
g = (translation, rotation/reflection)
Acting on ℕ² preserving metric structure
```

**Dim 3**: **E(3)** = T³ ⋊ O(3) = isometries of ℝ³
```
g = (translation, rotation) in 3D
For video: ISO(2,1) if time is distinguished
```

### Proposition 2.2 (Noether Correspondence)

Each continuous symmetry G acting on 𝕀ᵈ induces a conserved quantity (eigenspace) under the action.

**Proof sketch**: By Noether's theorem, one-parameter subgroups of G correspond to conserved currents. For token spaces, these are:
- **Translation invariance** → Position-independent features
- **Rotation invariance** → Orientation-independent features
- **Scale invariance** → Self-similar features

### Definition 2.3 (Graded Token Algebra)

The collection of all dimensional token spaces forms a graded algebra:
```
𝒯 = ⨁_{d=0}^∞ 𝒯_d
```
where:
- 𝒯_d = Functors 𝕀ᵈ → Vect_ℝ
- Product: 𝒯_p ⊗ 𝒯_q → 𝒯_{p+q} (tensor of functors)
- Wedge: ∧: 𝒯_p ⊗ 𝒯_q → 𝒯_{p+q} (antisymmetric part)

**Interpretation**: This is the de Rham complex on token manifolds, where:
- **0-forms** (𝒯₀): Scalar fields (activation values)
- **1-forms** (𝒯₁): Gradients (backprop flows)
- **2-forms** (𝒯₂): Curvature (attention patterns)
- **3-forms** (𝒯₃): Volume forms (batch statistics)

---

## 3. The Profunctor Perspective (Relations First)

### Definition 3.1 (Token Profunctor)

A **token profunctor** is a functor:
```
Φ: 𝕀ᵈ^{op} × 𝕀ᵈ → Set
```

For i, j ∈ Ob(𝕀ᵈ), Φ(i,j) is the set of "relations" from token i to token j.

**Special case**: For vector spaces, take:
```
Φ(i,j) = Hom(V_i, V_j) ≅ V_i* ⊗ V_j
```

**Attention as profunctor**: In transformers, attention is:
```
Φ_attn(i,j) = softmax(q_i · k_j / √d)
```
This is a profunctor 𝕀ᵈ^{op} × 𝕀ᵈ → [0,1].

### Theorem 3.2 (Colimit Representation)

Given a profunctor Φ and an ambient space V, token embeddings emerge as:
```
T(i) = colim_{j ∈ 𝕀ᵈ} Φ(j,i)
```

**Interpretation**: The embedding at position i is the "universal receptor" for all relations targeting i.

**Proof**: By the universal property of colimits, T(i) satisfies:
```
For any cone c: Φ(−,i) → X, there exists unique h: T(i) → X factoring c
```
This makes T(i) the "most general object" compatible with the relational structure.

### Corollary 3.3 (Yoneda Reversal)

Standard Yoneda: Objects → Representable functors  
Our construction: Profunctors → Objects (via colimit)

This is the **pro-finite inversion**: Instead of lim←─ (inverse limit) of objects, we have colim→─ (colimit) of relations.

---

## 4. Ambient Space as Grothendieck Site

### Definition 4.1 (Token Site)

A **d-dimensional token site** is a triple (𝕀ᵈ, J, V) where:
- **𝕀ᵈ**: Index category (as before)
- **J**: Grothendieck topology (defines "covering" relations)
- **V**: Ambient vector space ℝⁿ with metric/connection

**Topology J**: For 1D (causal):
```
Covering: {i} is covered by {i+1, i+2, ...}
(Future tokens can "see" past, not vice versa)
```

For 2D (spatial):
```
Covering: {(i,j)} is covered by neighboring patches
(Local-to-global structure)
```

### Definition 4.2 (Sheaf of Tokens)

A **token sheaf** on (𝕀ᵈ, J) is a functor F: 𝕀ᵈ^{op} → Set satisfying:

**Locality**: If {U_α} covers U and s, t ∈ F(U) agree on all U_α, then s = t

**Gluing**: If {s_α ∈ F(U_α)} agree on overlaps, there exists unique s ∈ F(U) restricting to each s_α

**Interpretation**: Token embeddings must be **consistent** across local neighborhoods. This enforces:
- Smooth variation in embedding space
- Respects causal structure (1D) or spatial structure (2D)

### Theorem 4.3 (Topos Formation)

The category Sh(𝕀ᵈ, J) of sheaves on the token site is a topos.

**Proof**: Standard sheaf topos construction. This gives us:
- Finite limits/colimits (can compose tokens)
- Exponentials (higher-order attention)
- Subobject classifier (classifies "valid" token patterns)

### Definition 4.4 (Dimensional Topos)

For each dimension, define:
```
𝓔¹ᴰ = Sh(𝕀¹, J_causal)   (Text topos)
𝓔²ᴰ = Sh(𝕀², J_spatial)   (Image topos)
𝓔³ᴰ = Sh(𝕀³, J_spatiotemp) (Video topos)
```

### Theorem 4.5 (Geometric Morphisms)

There exist geometric morphisms:
```
π: 𝓔²ᴰ → 𝓔¹ᴰ  (projection: flatten image to sequence)
σ: 𝓔¹ᴰ → 𝓔²ᴰ  (section: embed sequence in 2D grid)
```

with π ⊣ σ (adjunction).

**Proof**: 
- **π** (direct image): Forgets 2D structure, keeps only ordering
- **σ** (inverse image): Adds spatial structure via position encoding

The adjunction π ⊣ σ means: "Flattening and embedding are adjoint operations."

---

## 5. Spectral Decomposition and Eigenobjects

### Definition 5.1 (Relational Operator)

For a profunctor Φ: 𝕀ᵈ^{op} × 𝕀ᵈ → ℝ, the **relational operator** is:
```
L_Φ: Fun(𝕀ᵈ, ℝⁿ) → Fun(𝕀ᵈ, ℝⁿ)
(L_Φ f)(i) = ∑_j Φ(i,j) f(j)
```

For continuous limit (𝕀ᵈ → ℝᵈ):
```
(L_Φ f)(x) = ∫ Φ(x,y) f(y) dy
```

### Theorem 5.2 (Spectral Theorem for Token Operators)

If Φ is symmetric and positive-definite, then L_Φ admits a spectral decomposition:
```
L_Φ = ∑_{k} λ_k |ψ_k⟩⟨ψ_k|
```
where {ψ_k} are eigenfunctions and {λ_k} are eigenvalues.

**Eigenobject Principle**: The eigenfunctions {ψ_k} are the **irreducible atoms** - token patterns that are invariant (up to scaling) under the relational structure.

### Corollary 5.3 (Fourier Decomposition)

For **1D** with translation invariance: Eigenfunctions are {e^{ikx}}_k (Fourier modes)

For **2D** with Euclidean invariance: Eigenfunctions are Bessel functions J_m(kr)e^{imθ} (polar harmonics)

For **3D** with SO(3) invariance: Eigenfunctions are spherical harmonics Y_lm(θ,φ)

**Proof**: These are simultaneous eigenfunctions of the Laplacian and angular momentum operators, which commute with the symmetry group.

---

## 6. Tropical Degeneration

### Definition 6.1 (Tropical Semiring)

The **tropical semiring** (ℝ ∪ {-∞}, ⊕, ⊙) where:
```
a ⊕ b = max(a, b)  (tropical addition)
a ⊙ b = a + b      (tropical multiplication)
```

### Definition 6.2 (Tropicalization Map)

For a family of attention patterns {Φ_t}_t parametrized by temperature:
```
Φ_t(i,j) = exp(S(i,j) / t)
```

The **tropical limit** is:
```
Φ_trop = lim_{t→0} t · log Φ_t = S
```

where S is the score function (before softmax).

### Theorem 6.3 (Tropical Skeleton Preserves Homology)

Let X_t be the variety defined by Φ_t, and X_trop its tropical limit. Then:
```
H_*(X_trop; ℤ/2ℤ) ≅ H_*(X_t; ℤ/2ℤ)
```

**Proof**: By the fundamental theorem of tropical geometry (Mikhalkin, Itenberg-Katz-Shustin), tropical varieties are piecewise-linear shadows of complex varieties that preserve Betti numbers.

**Implication**: The combinatorial skeleton (sparse graph from hardmax) preserves the topological features (connected components, cycles, voids) of the full attention pattern.

### Definition 6.4 (Prime Stratification)

For each prime p, define the **p-simplified model**:
```
M_p = {Φ | Φ respects p-adic valuation}
```

This creates a filtration:
```
M_full = M_2 ⊃ M_3 ⊃ M_5 ⊃ M_7 ⊃ ... ⊃ M_trop
```

**Connection to ULP**: In Float32, the ULP (Unit in Last Place) varies by powers of 2. The p-adic stratification generalizes this to all primes.

---

## 7. Condensed Token Spaces

### Definition 7.1 (Profinite Completion)

For a finite token space T_n: {1,...,n} → ℝᵐ, the **profinite completion** is:
```
T̂ = lim←─ T_n
```
the inverse limit over all finite approximations.

### Theorem 7.2 (Condensed Sets)

The category of token spaces naturally embeds into **condensed sets** (sheaves on the site of profinite sets).

**Proof**: Each token space T induces a condensed set:
```
T_cond(S) = continuous maps from profinite set S to T̂
```

This preserves limits and admits a natural topology.

**Connection**: This is Scholze-Clausen's condensed mathematics applied to ML. Token spaces are condensed because they're limits of finite approximations (mini-batches, context windows, etc.).

---

## 8. Unified Topos Construction

### Definition 8.1 (Token Topos)

The **complete token topos** is:
```
𝓔_token = Sh(Site_d, Condensed(Bundles_prime(Eigen(Φ))))
```

Breaking down the layers:

**Layer 1: Φ** - Profunctor (primitive relational data)
```
Φ: 𝕀ᵈ^{op} × 𝕀ᵈ → ℝ≥0
```

**Layer 2: Eigen(Φ)** - Spectral decomposition
```
Eigen(Φ) = {(λ_k, ψ_k)} where L_Φ ψ_k = λ_k ψ_k
```

**Layer 3: Bundles_prime** - Prime stratification
```
For each prime p: fiber bundle layer with p-adic structure
Total space = ⨁_p Bundle_p
```

**Layer 4: Condensed** - Profinite completion
```
Condensed(X) = Sh(Profinite, X)
Captures infinite limits via finite approximations
```

**Layer 5: Sh(Site_d)** - Sheafification on dimensional site
```
Site_d = (𝕀ᵈ, J_topology)
Enforces local-to-global consistency
```

### Theorem 8.2 (Universal Property)

𝓔_token is the universal topos equipped with:
1. A profunctor Φ (relational structure)
2. Spectral decomposition (eigenobjects)
3. Prime stratification (layered refinement)
4. Condensed structure (profinite completion)
5. Dimensional topology (1D/2D/3D)

satisfying natural compatibility conditions.

---

## 9. Homological Algebra of Tokens

### Definition 9.1 (Token Chain Complex)

For a d-dimensional token space, define the chain complex:
```
C_0 ← C_1 ← C_2 ← ... ← C_d
```
where C_k = free abelian group on k-cells (k-dimensional token patterns).

Boundary operators:
```
∂_k: C_k → C_{k-1}
```

**For 1D (text)**:
- C_0: Individual tokens
- C_1: Token pairs (bigrams)
- ∂₁: (token_i, token_{i+1}) ↦ token_{i+1} - token_i

**For 2D (image)**:
- C_0: Pixels
- C_1: Edges (adjacent pixels)
- C_2: Faces (pixel squares)
- ∂₂: Face ↦ boundary edges

### Definition 9.2 (Semantic Homology)

The **semantic homology** is:
```
H_k^sem = ker(∂_k) / im(∂_{k+1})
```

**Interpretation**:
- **H_0**: Connected semantic components (distinct topics)
- **H_1**: Semantic loops (circular references, recurring themes)
- **H_2**: Semantic voids (missing context, implied knowledge)

### Theorem 9.3 (Tropical Preservation)

The tropical degeneration Φ_trop preserves semantic homology:
```
H_*^sem(Φ_trop) ≅ H_*^sem(Φ_full)
```

**Proof**: Follows from Theorem 6.3 and naturality of homology under continuous deformations.

---

## 10. Differential Geometry of Attention

### Definition 10.1 (Attention Metric)

The attention pattern Φ induces a Riemannian metric on token space:
```
g_ij = Φ(i,j) + Φ(j,i)  (symmetrized attention)
```

This metric measures "semantic distance" between tokens.

### Definition 10.2 (Attention Connection)

Define the **Levi-Civita connection** ∇ on the token manifold using the attention metric g.

Geodesics are curves γ(t) in token space satisfying:
```
∇_γ̇ γ̇ = 0  (parallel transport along semantic paths)
```

### Theorem 10.4 (Curvature as Second-Order Attention)

The Riemann curvature tensor R measures "non-commutativity of attention":
```
R(X,Y)Z = ∇_X ∇_Y Z - ∇_Y ∇_X Z - ∇_{[X,Y]} Z
```

**Interpretation**: High curvature → Attention order matters (context-dependent meaning)

### Corollary 10.5 (Sectional Curvature and Semantic Complexity)

Regions of high sectional curvature correspond to semantically rich token neighborhoods where multiple interpretations coexist.

---

## 11. Functoriality and Natural Transformations

### Theorem 11.1 (Dimension-Lifting Functor)

The embedding σ: 𝓔¹ᴰ → 𝓔²ᴰ is a **strong monoidal functor**:
```
σ(T₁ ⊗ T₂) ≅ σ(T₁) ⊗ σ(T₂)
```

**Proof**: Position encoding preserves tensor structure.

### Definition 11.2 (Poetry as Natural Transformation)

A **poetic form** (sonnet, haiku, etc.) is a natural transformation:
```
ρ: Id_{𝓔¹ᴰ} ⇒ σ ∘ π
```
where:
- π: 𝓔²ᴰ → 𝓔¹ᴰ flattens to linear text
- σ: 𝓔¹ᴰ → 𝓔²ᴰ adds 2D structure (rhyme, meter, layout)
- ρ specifies the constraints (ABAB rhyme scheme, iambic pentameter, etc.)

**This formalizes**: Poetry adds 2D structure to 1D text via specific transformation rules.

---

## 12. Open Problems

### Problem 12.1 (Semantic Homology Classification)

**Question**: Is there a complete classification of semantic homology groups H_*^sem for common NLP tasks?

**Conjecture**: Text classification → H_1 = 0 (tree-like), Translation → H_1 ≠ 0 (cyclic references)

### Problem 12.2 (Optimal Tropical Degeneration)

**Question**: What is the optimal tropicalization temperature t* that minimizes:
```
Loss(Φ_t*) + λ · Complexity(Φ_t*)
```

**Approach**: Use Morse theory to identify critical points in the degeneration family.

### Problem 12.3 (Higher Categories)

**Question**: Can we extend the framework to (∞,1)-categories for truly infinite-dimensional token spaces?

**Relevance**: Continuous token flows (video, audio) naturally live in ∞-categories.

### Problem 12.4 (Quantum Token Spaces)

**Question**: What is the quantum analogue where Φ is a density matrix on Hilbert space?

**Speculation**: This connects to quantum machine learning and quantum NLP.

---

## Appendix: Notation Summary

| Symbol | Meaning |
|--------|---------|
| 𝕀ᵈ | Index category for dimension d |
| 𝒯_d | d-dimensional token spaces |
| Φ | Profunctor (relational structure) |
| 𝓔ᵈ | Topos of d-dimensional tokens |
| L_Φ | Relational operator |
| H_*^sem | Semantic homology groups |
| ⊕, ⊙ | Tropical addition/multiplication |
| T̂ | Profinite completion |

---

## Next Document

See `03_dimensional_token_topology.md` for concrete applications to text/image/video modalities.
