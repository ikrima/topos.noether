# Megaprompt: Generate the Geometry of ReSTIR/GRIS Series

You are an orchestrator of a multi‑agent system designed to produce a comprehensive visual essay series that recasts modern reservoir‑based rendering algorithms (ReSTIR/GRIS) through the lens of measure theory and differential geometry.  Your goal is to synthesise research, craft a compelling narrative, implement interactive demonstrations and package the result for distribution.  Follow these instructions:

1. **Define the Agents**
   * Create a document (`AGENTS.md`) listing the abstract agents needed for the project.  For each agent specify its responsibilities, inputs and outputs.  At a minimum include: Research Agent, Narrative Agent, Front‑End Agent, Math Agent, Curvature Agent and Project Manager.

2. **Write a Project Plan**
   * Produce a markdown document (`PLAN.md`) that outlines the entire project lifecycle.  Include phases for defining scope, researching and conceptualising the subject matter, designing the essays and their interactive components, implementing the HTML/CSS/JS artefacts, packaging the deliverables, and performing an inversion of the final results into an intermediate representation.
   * Ensure the plan delineates responsibilities across agents and identifies key milestones.

3. **Conceive the Essay Series**
   * Decide on a sequence of at least eight essays, each with a distinct theme that gradually builds from intuition to formalism:
     - Pushforward & Pullback: visualise the duality between moving samples and moving test functions.
     - Residual Measure Transport: sample the mismatch between prediction and evidence.
     - Biomimetic Reservoir Intelligence: link ReSTIR to biological vision and attention.
     - The Shape of a Reservoir: treat a reservoir as an empirical measure with shape, entropy and anisotropy.
     - Curvature of Reuse: reveal instability when temporal and spatial transport do not commute.
     - A Pixel Is Not a Point: describe the screen–time bundle with path‑space fibres above each pixel.
     - The Geometry of Light Transport: unify the rendering equation, reservoirs, GRIS transport, pushforwards, pullbacks, residuals and curvature.
     - Curvature‑Guided Sampling: propose a practical control loop where variance becomes geometry.

4. **Design the Interactive Essays**
   * For each essay, sketch section titles and provide succinct explanatory text.
   * Specify interactive modules such as animations, sliders, toggles and diagrams.  Describe what they should do and what concepts they illustrate.
   * The overall aesthetic should evoke Bartosz Ciechanowski’s hand‑crafted visual essays: warm backgrounds, clear typography and intuitive controls.

5. **Implement the Artefacts**
   * Produce stand‑alone HTML files with embedded CSS and JavaScript for each essay.  Ensure there are no external dependencies.  Each interactive element must be initialised defensively; canvas elements must have unique identifiers.
   * Include pseudocode panels where appropriate to bridge the conceptual material and practical implementation.

6. **Generate the EDN Intermediate Representation**
   * After the HTML files are created, parse their hierarchical structure into an EDN document (`essays.edn`).  Represent each essay as a map with its title, filename, a sequence of sections, and within each section a list of paragraphs or interactive modules with descriptive metadata.  This structured representation will serve as a high‑level intermediate representation for future symbolic transformations.

7. **Package the Project**
   * Arrange the essays, the series guide, the EDN file and the agentic artefacts into a coherent directory structure.  Provide manifest files and a README.  Compress the directory into a zip archive ready for distribution.

8. **Perform the Inversion**
   * From the final HTML artefacts, regenerate the EDN representation.  Use this to create or update `AGENTS.md` and `PLAN.md` as needed, ensuring fidelity between the plan and the produced series.

9. **Deliver**
   * Provide the zipped repository along with the individual artefacts and the EDN file.  Ensure all instructions, plans and data are internally consistent and comprehensible to new readers.

Use clear, concise prose and well‑structured code.  The resulting series should be both a didactic exposition of advanced rendering concepts and a demonstration of a multi‑agent system’s capacity to coordinate research, narrative and technical implementation.