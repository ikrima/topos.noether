# Agents

This document enumerates the abstract agents that collaborated to produce the **Geometry of ReSTIR/GRIS** visual essay series.  The agents are not real individuals but distinct reasoning roles that together delivered research synthesis, narrative design and interactive front‑end implementation.

## Research Agent

*Responsibilities*: Survey the literature on ReSTIR, GRIS, measure theory and differential geometry.  Extract core concepts like pushforward, pullback, reservoirs, residuals and curvature.  Provide precise definitions and ensure mathematical integrity across the series.

*Inputs*: Papers, blog posts, SIGGRAPH talks, cognitive science research.

*Outputs*: Clean technical formulations, definitions, and diagrams capturing the essence of each concept.  Supplies references for the narrative agent to translate into reader‑friendly prose.

## Narrative Agent

*Responsibilities*: Craft the overarching story arc of the series.  Decide how to order the essays so that intuition precedes formality.  Write clear section headings and explanatory text.  Weave analogies to biology and perception without sacrificing technical accuracy.

*Inputs*: Conceptual structures and mathematical notes from the research agent.

*Outputs*: Essay outlines, section descriptions, narrative transitions and micro‑stories that motivate each interactive.

## Front‑End Agent

*Responsibilities*: Design and implement the interactive visualisations.  Emulate Bartosz Ciechanowski’s warm aesthetic: paper‑like backgrounds, unobtrusive controls and crisp SVG diagrams.  Ensure every canvas has a unique identifier and defensive setup logic.

*Inputs*: Wireframes and descriptions from the narrative agent; functional requirements from the math and curvature agents.

*Outputs*: Stand‑alone HTML/CSS/JavaScript files for each essay, with tuned animations and responsive layouts.

## Math Agent

*Responsibilities*: Translate mathematical operations into computational diagrams.  Ensure that pushforward animations respect the definition of measure transport and that pullback demonstrations compose test functions correctly.  Derive pseudocode for GRIS and curvature computations.

*Inputs*: Definitions from the research agent.

*Outputs*: Algorithmic outlines, pseudocode blocks and parameter formulas for controllers.

## Curvature Agent

*Responsibilities*: Develop the concept of curvature of reuse.  Define commutators, design diagnostic metrics and show how noncommuting transports manifest as rendering artifacts.  Specify how curvature interacts with residuals to gate reuse and allocate samples.

*Inputs*: Notes from the research agent and conceptual hooks from the narrative agent.

*Outputs*: Interactive commutator experiments, curvature heatmaps and reuse trust functions.

## Project Manager

*Responsibilities*: Coordinate the activities of the above agents.  Maintain the overall project timeline, manage dependencies between essays, and ensure consistent terminology and style.  Oversee packaging of the final series, EDN generation and inversion process.

*Inputs*: Milestones and deliverables from all agents.

*Outputs*: Project plan, manifest files, series guide and final zipped repository.
