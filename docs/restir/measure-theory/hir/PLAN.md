# Project Plan: Geometry of ReSTIR/GRIS Series

This plan describes the stages undertaken to produce the **Geometry of ReSTIR/GRIS** visual essay series, from initial concept through delivery.  Each phase corresponds to a milestone with clearly defined tasks, inputs and outputs.

## Phase 0 – Define Scope and Goals

* Identify the central question: *How can the principles of ReSTIR and GRIS be recast as a geometric framework?*
* Decide that the series will be intuition‑first, gently introducing measure theory and differential geometry to graphics engineers.
* Specify the number of essays and their core themes: pushforward/pullback, residual transport, biomimetic intelligence, reservoir shape, curvature of reuse, bundle geometry, unified light transport and curvature‑guided sampling.
* Enumerate the required interactive components and the aesthetic style inspired by Bartosz Ciechanowski.

## Phase 1 – Research and Conceptualization

* The **Research Agent** surveys literature on ReSTIR, path sampling, measure theory, differential geometry and visual perception.
* Extract definitions and key formulas: pushforward, pullback, Lebesgue decomposition, commutator curvature, bundle connections.
* The **Narrative Agent** sketches early storyboards for each essay based on the extracted concepts.
* The **Project Manager** drafts a high‑level timeline and assigns responsibilities.

## Phase 2 – Detailed Design

* For each essay, define:
  * Section titles and succinct summaries.
  * Interactive modules required and their intended behaviour.
  * Mathematical expressions and pseudocode to be displayed.
* The **Math Agent** produces algorithmic templates for GRIS transport, residual computation and curvature estimation.
* The **Curvature Agent** specifies diagnostic metrics and gating functions.
* Draft the EDN intermediate representation to serve as the symbolic DSL for downstream transformations.

## Phase 3 – Implementation

* The **Front‑End Agent** builds stand‑alone HTML files with embedded CSS and JavaScript for each essay, following the warm paper aesthetic.  Each canvas element is uniquely identified and initialised with defensive guards.
* Implement interactive controls: sliders, toggles, diagrams and animation loops.
* Integrate the algorithmic logic provided by the Math and Curvature agents.
* Perform static checks for uniqueness of IDs, syntax errors and rendering glitches.

## Phase 4 – Packaging

* Assemble the essays into a coherent directory structure, adding a series guide with reading order, concept index and recommended routes for different audiences.
* Generate manifest files (`manifest.json`) and documentation (`README.md`, `series-outline.md`).
* Compress the project into a zip archive for distribution.
* Produce an EDN file (`essays.edn`) describing the logical structure of the essays for potential symbolic analysis and transformation.

## Phase 5 – Inversion and Metaprompt Generation

* Decompose the final HTML artifacts into the EDN intermediate representation (this project includes `essays.edn`).
* Write agentic artefacts (`AGENTS.md` and this `PLAN.md`) that record the roles and the plan used to construct the series.
* Derive a megaprompt that could instruct an agentic system to recreate these artefacts from scratch (see `MEGAPROMPT.md`).
* Package the inversion outputs into a new directory for delivery.
