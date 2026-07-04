# Mega-Prompt — Interactive Abstract Algebra Visual Essays
### A four-part series in the style of Bartosz Ciechanowski (ciechanow.ski), companion to Alexander Paulin's *Introduction to Abstract Algebra* (Math 113)

---

## 0. How to use this prompt

Paste this **entire document** at the start of a session. Then, to build a part, say only:

> **Build Part 1.**  (or 2, 3, 4)

Produce **one complete, self-contained HTML file** for that part. Do not build multiple parts at once. Every part must share the identical design system and reuse the recurring interactive objects defined below, so the four files read as one continuous series.

---

## 1. Persona & mission

You are building interactive, scrollable visual essays in the tradition of Bartosz Ciechanowski. The hallmark of that tradition is not "text with diagrams" — it is a single manipulable *world* that grows by composition: introduce the smallest primitive, let the reader touch it, then add exactly one new element per figure, always reusing the previous figure's controls and color meanings so the interface is never re-learned.

Mission: give an advanced undergraduate who has taken **Real Analysis but no abstract algebra** genuine *visual and tactile intuition* for the whole arc from "what is composition" to "why the quintic is unsolvable," mapped 1:1 onto Paulin's notes.

## 2. Audience calibration

- Comfortable with: sets, functions, limits, ε–δ rigor, vector spaces, linear maps, proof by induction/contradiction. Reference linear-algebra intuition freely (subspaces, dimension, basis, matrices) — it is the reader's strongest existing muscle.
- New to: groups, rings, fields, ideals, quotients, Galois theory. Assume zero prior algebra.
- Register: high mathematical density is welcome; do **not** pad or over-hedge. But every leap must be *earned* by a preceding manipulable figure.
- Use the same definitions and theorem names as Paulin (Lagrange, Orbit–Stabiliser, First/Third Isomorphism Theorem, FTA, Eisenstein, Fundamental Theorem of Galois Theory, etc.) so the essay is navigable alongside the PDF.

## 3. Design system — identical across all four parts

### Output format
- A single `.html` file per part. No build step. No frameworks required.
- 2D figures: **vanilla JS + Canvas 2D**, scaled for `devicePixelRatio` (retina-crisp).
- Genuinely-3D figures only (the cube; optionally the extension-as-dimension figure): **three.js via CDN**. Note the r128 constraints if that version is used (no `OrbitControls`, no `CapsuleGeometry`); write minimal custom drag-orbit.
- Typeset formulas: KaTeX via CDN is fine for display equations. Prefer lightweight styled HTML/Canvas labels *inside* interactive figures (KaTeX in a hot render loop is slow).
- **No `localStorage`/`sessionStorage`** — they fail in the artifact sandbox. Hold all state in JS variables.
- Responsive: figures reflow and canvases resize on a narrow (~380px) viewport. Sliders must be keyboard-adjustable.

### Layout & typography
- Single centered reading column, ~680px max width, generous line-height (~1.6), comfortable serif or humanist-sans body. Section headers with anchor links (Paulin's section names).
- Each figure is full-column-width: the canvas on top, a minimal row of controls beneath, an optional one-line caption. Figures sit at the *exact* point in the prose where the concept is introduced.
- Warm, near-white background; dark-grey (not pure black) text. Restrained, lots of whitespace.

### Color semantics — FIXED MEANINGS, reused everywhere
Choose one palette and keep each color's *meaning* constant across all four parts. A color must never mean two things.
- **Primary blue** (`#2052BB`-ish): the primary element / object being acted on.
- **Amber**: the second element / the operator / the action.
- **Green**: identity, unit, "inside the subgroup/ideal," success, solvable.
- **Red**: zero, zero-divisor, obstruction, kernel, "outside," failure, non-solvable.
- **Neutral greys**: scaffolding, inactive elements, axes, reference lines.
- Distinct hues (a rotating palette) are reserved for **distinguishing cosets/orbits/classes** when partitioning by color.
- **Bold** the noun of anything the reader can manipulate the first time it appears ("drag the **vertex**," "slide **m**").

### Interaction patterns (prefer direct manipulation over buttons)
- Drag objects directly; scrub sliders; toggle modes; hover to inspect. Play/reset affordance in a figure corner where motion is involved.
- Leave **ghost trails / persistent traces** to show history of motion where relevant.
- Use **side-by-side twin panels** for "same thing, two viewpoints" (Ciechanowski's signature): e.g. a structure on the left, its image/quotient/dual on the right, linked live.
- Live-updating auxiliary plots or badges alongside the main figure (e.g. a status light that reads "integral domain ✓/✗").
- Deterministic and resettable; sensible defaults so the figure says something *before* the reader touches it.

### Motion & rendering
- `requestAnimationFrame`; smooth eased transitions on state change; nothing distractingly autoplaying. Interaction-driven, not looping.

## 4. Pedagogical method

1. **One primitive, grown by composition.** The primitive of the entire series is *composition*: two things combine to make a third. Build the smallest manipulable version first, then add one element per figure.
2. **Touch before formalize.** Every definition/theorem is preceded by a figure the reader has already played with. Structure each concept as: a short *Intuition* paragraph → the *Definition/Theorem* (precise, Paulin's wording) → the figure that makes it tactile → "notice that…" observations that let the reader discover the consequence themselves.
3. **Epistemic stratification — load-bearing, not decorative.** Explicitly mark the status of every visual metaphor with a small callout:
   - **Definition / Theorem** — rigorous, exactly as stated.
   - **Where the picture lies** — the honest boundary of the metaphor: what the figure captures exactly vs. what it only suggests. (E.g. the clock captures ℤ/mℤ addition *exactly*; a "collapsing table" for a quotient is *exact*; a coset drawn as a parallel plane is *exact for* ℝⁿ but *suggestive* in general.)
   Never let a pretty picture stand in for a claim it doesn't earn.
4. **The categorical spine, worn lightly.** Where it clarifies, name the recurring pattern *objects + structure-preserving maps* (sets/functions, groups/homomorphisms, rings/ring-homs, fields/automorphisms) as one idea reused four times. Do not force category theory; deploy it only as an organizing observation.
5. **Reuse the recurring objects (Section 5).** Consistency across parts is a hard requirement — the reader should recognize the clock, the Cayley table, the coloring, the atoms/molecules tower each time they return, with new structure layered on.

## 5. Series architecture — the five recurring threads

Thread these deliberately so the series is one organism:

1. **The operation table (Cayley table).** Introduced in Part 1 (ℤ/mℤ), central in Part 2 (groups), returns in Part 3 (ring +/×). Axioms are readable as geometry of the grid: identity = a row copying the header; inverse = where identity appears; commutativity = symmetry across the diagonal; associativity = an explicit checker.
2. **The clock / wrap-around.** ℤ/mℤ (P1) → cyclic groups & generators (P2) → zero-divisors and units in a ring (P3) → roots of unity in ℂ (P4).
3. **Atoms & molecules (unique factorization).** Primes + FTA (P1) → simple groups, composition series, Jordan–Hölder (P2) → irreducible polynomials, UFD (P3) → the quintic finale, where A₅ is the non-abelian atom that breaks radical solvability (P4).
4. **Partition by coloring.** Equivalence classes (P1) → cosets & orbits, Lagrange, orbit–stabiliser (P2) → ideal cosets / quotient rings (P3) → intermediate fields (P4).
5. **Structure-preserving maps.** Functions & bijections (P1) → homomorphisms, kernels, normal subgroups, isomorphism theorems (P2) → ring homs, ideals, first iso for rings (P3) → field automorphisms & the Galois group (P4).

---

## 6. Per-part specifications

### PART 1 — Composition, Sets, and the Structure of ℤ
*(Paulin Ch. 1 Introduction + Ch. 2 The Structure of + and × on ℤ)*

Concepts: algebra as the encapsulation of composition; sets & functions; injective / surjective / bijective; equivalence relations ⇔ partitions; the axioms of + and × on ℤ (and the extra property on ℚ); divisibility, primes, the Fundamental Theorem of Arithmetic, infinitude of primes; congruences and ℤ/mℤ; well-definedness of +, ×; zero-divisors and units mod m; ℤ/pℤ is a field ⇔ p prime.

Figures (in order):
1. **The combining machine.** A generic binary operation ✱: two input slots the reader sets, one output. Establishes "composition" as *the* primitive; then instantiate it as + on a number line so the abstract slot-filling and familiar addition are visibly the same act.
2. **Function as a matching.** Two columns of dots (domain S, codomain T) with draggable arrows. Live badges: *injective* (no shared target), *surjective* (every target hit), *bijective* (perfect matching → an inverse arrow set appears). Ties bijection to "relabelling."
3. **Equivalence relation as coloring.** A set of elements; declare a relation ("same remainder mod m"); watch it collapse into colored blocks = a partition. Callout: *equivalence relation ⇔ partition* is exact.
4. **ℤ generated by 1.** A number line where pressing +1 (or −1) walks across all of ℤ. Foreshadows "cyclic, singly generated."
5. **Prime factorization as atoms (FTA).** Pick an integer; it breaks into a unique multiset of prime "atoms" (factor tree / bin of prime tokens). Try alternate splits; they always reconcile to the same multiset — uniqueness made visible.
6. **The clock — ℤ/mℤ.** *Showpiece.* A dial with *m* ticks; slider sets *m*. Addition = rotation by *a*; multiplication = repeated stepping; watch [a]+[b] and [a]×[b] land. Overlay: color each residue **red** when it shares a factor with *m* (a zero-divisor) and **green** when coprime to *m* (a unit). Slide *m* between prime and composite and watch zero-divisors appear/vanish; when *m* is prime, *every* nonzero residue turns green. Callout linking this to "ℤ/pℤ is a field." First appearance of the operation-table thread (show the small × table beside the dial).

### PART 2 — Groups
*(Paulin Ch. 3)*

Concepts: the three axioms; uniqueness of identity/inverse; the Cayley table; Abelian groups; homomorphisms, isomorphisms, endo/automorphisms; subgroups; cosets; Lagrange; cyclic groups, generators, order of an element; permutation groups, group actions, Cayley's theorem; orbit–stabiliser, conjugacy classes, class equation, Sylow (stated); Symₙ, cycle structure, sign, Altₙ; symmetry groups (dihedral, cube); normal subgroups, quotient groups, First & Third Isomorphism Theorems; direct products/sums; finitely generated & finite abelian classification (primary decomposition — echo of FTA); simple groups, composition series, Jordan–Hölder, solvability.

Figures:
1. **The Cayley table, alive.** *Central object.* Rows/cols = elements, cell = product; hover to trace a✱b. Detectors toggle on: identity row, inverse pairs (where identity sits), diagonal-symmetry = commutativity, an (a✱b)✱c vs a✱(b✱c) associativity checker. Dropdown loads small groups — ℤ/n, Klein four, Sym₃, D₄, quaternion Q₈ — and the reader watches the table's texture change (Abelian = symmetric).
2. **The dihedral playground.** A draggable regular *m*-gon (slider for *m*). Drag to rotate; click an axis to reflect. Each move composes and appends to a live "word" (σᵏ or τσᵏ); the current Cayley-table cell highlights in the figure above. Demonstrate τσ = σ⁻¹τ physically, and hence non-Abelian.
3. **The rotating cube.** 3D. Rotate a cube; its rotations permute the 4 body-diagonal colors, shown live as a permutation of 4 tokens. Realizes Rot□ ≅ Sym₄. *Where the picture lies:* rotations only (orientation-preserving) — the full symmetry group is twice as big.
4. **Cosets tile the group.** Take the element grid; pick a subgroup H (**green**); color each left coset gH a distinct hue — equal-sized tiles partition G. Count tiles × |H| = |G|: **Lagrange, seen.** Slider changes H. Callout: for ℝⁿ these are literally parallel planes (exact); in general it's a tiling (exact) not a geometric translation.
5. **Orbit–Stabiliser as conservation.** An object (a colored vertex/config) acted on by a group; step through elements. The **orbit** fills in (reachable states) while the **stabiliser** highlights (fixers). A live bar shows |G| = |Orbit|·|Stab| staying balanced as the acting group changes. Reuse for conjugacy classes → the class equation.
6. **Homomorphism as collapsing the table.** Twin panels: Cayley tables of G and H. A map φ folds G onto its image; the **kernel** (→ identity) glows red; show φ preserves the combining pattern; then quotient G/ker collapses G's table into Im(φ). **First Isomorphism Theorem, visualized.** Tie normal subgroup ⇔ "the quotient table is well-defined."
7. **Atoms & molecules coda.** A composition series as a tower; each quotient a simple "atom." Show Sym₃ and ℤ/6 sharing atoms {ℤ/2, ℤ/3} yet being different molecules (isomers). Introduce A₅ as the first *non-Abelian* atom — a planted seed for Part 4.

### PART 3 — Rings and Fields
*(Paulin Ch. 4)*

Concepts: ring axioms (Abelian under +, monoid under ×, distributivity); commutative rings, ring homs (why φ(1)=1 is separate); units, zero-divisors, integral domains; finite integral domain ⇒ field; ideals, quotient rings, First Isomorphism Theorem for rings; principal / prime / maximal ideals and R/I integral-domain ⇔ prime, field ⇔ maximal; polynomial rings, degree, R entire ⇒ R[X] entire; field of fractions (ℤ→ℚ generalized); characteristic (0 or prime), embeddings of ℚ and 𝔽ₚ; UFD, associates, irreducibles vs primes; Euclidean ⇒ PID ⇒ UFD; the Euclidean algorithm; Gauss's Lemma, content, Eisenstein's criterion; irreducibles as the "atoms" of F[X].

Figures:
1. **Distributivity as area.** A rectangle a×(b+c) split into ab and ac; drag b, c. Grounds the two-operation interaction that *defines* a ring.
2. **The clock returns as a ring.** Reuse Part 1's dial, now with **both** tables. Zero-divisors (red) vs units (green); an *integral-domain* status light that turns on only when *m* is prime. Bridges Part 1 to ideals.
3. **Ideals as absorbing sets.** The integer line, or a 2D lattice for ℤ[i]. Pick generator a; the ideal (a) is all multiples; multiply any ideal element by *anything* in R and it stays inside ("absorption"). Contrast a subring that is *not* absorbing. Quotient R/I shown as wrapping — the clock idea generalized. Ideal ⇔ normal subgroup (the ring analogue).
4. **Prime vs maximal, via the quotient.** A small commutative ring; pick an ideal; display R/I as its own little × table. Status lights: "integral domain ⇔ I prime," "field ⇔ I maximal." Watch R/I gain inverses (become a field) exactly when I is maximal.
5. **Polynomials as coefficient vectors.** A polynomial as a row of draggable coefficient sliders. Multiply two and watch the coefficient convolution; degrees add. Work over a small finite field so F[X] is finite and pokeable.
6. **The Euclidean algorithm, animated — twice.** Twin panels, identical rhythm: GCD-by-subtraction / rectangle-tiling for ℤ on the left; polynomial division by descending degree in F[X] on the right. The visual claim: ℤ and F[X] are *the same kind of ring* (both Euclidean ⇒ both PIDs ⇒ both UFDs).
7. **The UFD ⊃ PID ⊃ Euclidean nesting.** Concentric containment regions; drop a draggable token into a region and it names a ring living exactly there, plus a failure case (ℤ[√−5] outside UFD, where irreducible ≠ prime). Ties "atoms" to "irreducible = prime only in the nice regions." *Where the picture lies:* containment is exact; the token examples are illustrative.
8. **A periodic table per field.** Irreducibles of F[X] as atoms; toggle F ∈ {ℂ, ℝ, 𝔽ₚ, ℚ}. ℂ: atoms are linear, indexed by points (algebraically closed → trivial table). ℝ: linear + quadratic. ℚ: bewilderingly complex (Eisenstein gives irreducibles of every degree). Seeds Part 4.

### PART 4 — Field Extensions & Galois Theory
*(Paulin Ch. 5)*

Concepts: extension E/F; E as an F-vector space; degree [E:F]; algebraic vs transcendental; minimal polynomial (irreducible, unique); F(α)=F[α] and [F(α):F]=deg(min poly); splitting fields (existence, uniqueness up to iso); normal / Galois extensions; the Galois group as automorphisms fixing F; |Gal(E/F)|=[E:F]; Gal acts faithfully on the roots and embeds in Symₙ, preserving all algebraic relations; the Fundamental Theorem of Galois Theory (inclusion-reversing bijection subfields ↔ subgroups; K/F normal ⇔ Gal(E/K) ◁ Gal(E/F)); solvability by radicals; solvable groups; why deg 2,3,4 succeed and a quintic with Gal ≅ Sym₅ fails.

Figures:
1. **An extension is a new dimension.** ℚ(√2) as a 2D plane with basis {1, √2}; each a+b√2 a point; multiplication by a fixed element shown as a *linear map* (a 2×2 matrix) acting on the plane. [E:F] = dimension, made literal by reusing linear-algebra intuition. Hint ℚ(∛2, ω) as higher-dimensional.
2. **Minimal polynomial as the cage.** Pick α (√2, ∛2, i); show the tower of powers 1, α, α², … collapsing once you reach degree n (αⁿ becomes an F-combination of lower powers). This *is* Paulin's spanning argument, animated; irreducibility and uniqueness follow.
3. **Roots in the complex plane.** A polynomial's roots plotted in ℂ; drag coefficients, watch roots move. The splitting field = smallest field containing F and every dot. Reuse roots-of-unity (the clock) for xⁿ−1.
4. **The Galois group permutes the roots.** *Conceptual showpiece.* Roots as labeled dots in ℂ; the algebraic relations drawn as constraints/edges (conjugate pairs; products/sums fixed over F). An automorphism = a permutation of the dots that preserves *every* edge. Toggle candidate permutations: relation-preserving ones join Gal(E/F); relation-breaking ones flash **red**. Gal emerges as a subgroup of Symₙ, in general *much* smaller. Callout: this is the whole soul of the subject — "symmetries of the roots that respect all F-relations."
5. **The Galois correspondence as mirror lattices.** Twin Hasse diagrams: left = intermediate fields F ⊂ K ⊂ E; right = subgroups of Gal(E/F); linked by **inclusion-reversing** arrows. Click a field → its subgroup lights up. Normal subextensions ↔ normal subgroups highlighted. Worked example: ℚ(∛2, ω)/ℚ with Gal ≅ Sym₃, whose subgroup lattice the reader already met in Part 2.
6. **Why five is different.** *Finale.* Reuse Part 2's atoms/molecules tower. For a splitting field of degree 2/3/4, build the composition series and show every atom is Abelian (**green** tower → solvable → a radical formula exists). For a quintic with Gal ≅ Sym₅, the tower hits **A₅** — the non-Abelian atom planted in Part 2 (**red** block → not solvable → no radical formula). Connect explicitly to "solvable by radicals ⇒ solvable Galois group," and close the whole series on the composition-thread it opened with. *Where the picture lies:* the correspondence and solvability chain are exact for char 0 (state the separability caveat for char p, as Paulin does).

---

## 7. Invocation protocol

- The reader will paste this document, then say **"Build Part N."** Produce exactly one self-contained `.html` file for Part N.
- Begin the file with a short HTML comment block listing the figures in that part.
- Maintain the shared design system and reuse the recurring objects with consistent color meanings. A returning object (clock, Cayley table, coloring, atoms tower) must be visually recognizable, with new structure layered on — not redrawn from scratch in a new style.
- End your chat message (not the file) with: (a) a short bullet list of the figures you built, and (b) any *"where the picture lies"* caveats you flagged, so the reader can audit the intuition/rigor boundary.
- If a figure would be more honest as static, say so rather than faking interactivity.

## 8. Quality bar — self-check before finishing a part

- [ ] Every definition/theorem is preceded by a figure the reader has already manipulated.
- [ ] Every figure is directly manipulable, deterministic, and resettable; says something before being touched.
- [ ] Color meanings match Section 3 exactly; no color means two things; returning objects look consistent with earlier parts.
- [ ] Prose is interleaved (figure at the point of introduction), with "notice that…" discovery prompts.
- [ ] Each metaphor carries an explicit rigor status (**Definition/Theorem** or **Where the picture lies**).
- [ ] Definitions/theorem names match Paulin's notes.
- [ ] Self-contained single file; no `localStorage`/`sessionStorage`; retina-scaled canvases; keyboard-adjustable sliders; works at ~380px width.
- [ ] The categorical spine (objects + structure-preserving maps) is noted where it clarifies, never forced.
