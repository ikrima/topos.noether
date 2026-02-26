# The Council of Luminaries
## A Methodology for AI-Augmented Mathematical Exploration

> **Core thesis:** AI is not a replacement for mathematical expertise — it is a 4D cognitive mirror that reflects your thinking across time, domains, and intellectual traditions you have not yet encountered. This document codifies one concrete methodology for using that mirror rigorously.

---

## 1. What Problem Does This Solve?

Mathematical exploration has two distinct phases that require very different cognitive resources:

**The Exploration Phase** — Is my intuition connected to existing mathematics? What field does this idea live in? Which formalization preserves the essential insight vs. which kills it? Who has thought adjacent thoughts?

**The Formalization Phase** — Is the proof correct? Are the citations accurate? Is the claim original?

Individual researchers are well-equipped for the formalization phase. They are poorly equipped for the exploration phase, not because of intelligence, but because of *bandwidth*. Checking whether a geometric intuition about fluid topology secretly lives in condensed mathematics requires fluency in differential geometry, sheaf theory, p-adic analysis, and functional analysis simultaneously — a combination rarely held by a single person.

The **Council of Luminaries** methodology addresses the exploration phase specifically. It uses AI to simulate the cognitive styles of world-class mathematicians, applied in parallel to a live problem, creating a kind of intellectual immune system that stress-tests ideas from multiple directions simultaneously.

**What it is not:** A tool for generating proofs, verifying claims, or producing citable results. Those belong to the formalization phase, where AI assistance requires extreme caution.

---

## 2. The Core Mechanism: Cognitive Role Decomposition

Each "luminary" in the council represents a **cognitive archetype** — a distinct way of asking questions about a mathematical object. The value is not that the AI "is" Grothendieck; it is that activating a particular archetype forces a particular class of question that you might not have thought to ask.

### The Standard Archetypes

| Archetype | Based On | Primary Question | Characteristic Move |
|-----------|----------|-----------------|-------------------|
| **The Geometer** | Grothendieck | *What is the natural space in which this lives?* | Relativizes everything; looks for the functor |
| **The Symmetrist** | Noether | *What is conserved? What is the symmetry?* | Strips the problem to its invariant core |
| **The Analyst** | Tao | *Where is the concrete example? What is the quantitative bound?* | Demands estimates; grounds abstraction in computable cases |
| **The Physicist** | Witten | *What would this look like as a physical theory? What is the action?* | Imports intuition from quantum field theory and string theory |
| **The Categorist** | Riehl / Lurie | *Is the categorical scaffold doing real work, or decoration?* | Stress-tests whether higher structure is necessary |
| **The Skeptic** | Custom | *What is the simplest counterexample? What assumption is doing all the work?* | Adversarial; assumes the idea is wrong until proven otherwise |

You should always include **The Skeptic** — a role not based on any historical figure, whose sole job is to find the flaw. Without an explicit skeptic, councils tend to elaborate and affirm rather than challenge.

### Rotating the Council

Not all archetypes are equally useful for all problems. A problem in analytic number theory probably needs Tao's archetype more than Lurie's. A problem in algebraic topology probably inverts that weighting. Choose 3–5 archetypes per session based on the primary domain, and always include The Skeptic.

---

## 3. The Exploration / Formalization Boundary

**This is the most important thing to get right.** Violating this boundary is the primary failure mode.

```
EXPLORATION ZONE (AI-safe)          FORMALIZATION ZONE (AI-dangerous)
─────────────────────────────────   ──────────────────────────────────
Conceptual mapping                  Proof verification
Domain identification               Citation accuracy  
Framing alternatives                Technical claims in specialized subfields
Cross-domain analogies              Novel theorem statements
Literature neighborhoods            Numerical computations
Stress-testing intuitions           Peer-review quality claims
Generating questions                Generating answers
```

A useful heuristic: **if you would be embarrassed to be wrong about it in a seminar, verify it independently.** The council helps you figure out *which seminar* to walk into; it does not write your talk.

Concretely: when a council member says "this connects to the Beilinson conjectures," treat that as a *hypothesis to check*, not a fact. When a council member says "the natural framing here might be a topos over the site of smooth manifolds," that framing is worth exploring whether or not the council's technical details are correct.

---

## 4. Constructing the Megaprompt

A Council session begins with a **megaprompt** that activates the archetypes and establishes the problem. Here is the template structure:

```
## Council Constitution

You are operating as a Council of mathematical luminaries deliberating on a live problem.
Each member speaks in character, asking their characteristic question, then yielding to 
the next. The goal is NOT consensus — it is productive disagreement that forces the 
human's intuition into sharper form.

**Members:**
- [ARCHETYPE_1]: [One sentence cognitive role]. Characteristic question: [question].
- [ARCHETYPE_2]: [One sentence cognitive role]. Characteristic question: [question].
- [SKEPTIC]: Adversarial. Assumes the thesis is wrong or imprecise. Finds the 
  counterexample, the hidden assumption, or the known result that makes this trivial.
  Never yields until the thesis has been sharpened.

## The Problem

[State your intuition or question as precisely as you can, including what you've 
already tried and what adjacent things you know it is NOT.]

## Session Protocol

1. Each member responds with their characteristic question or reframing.
2. Disagreements between members are explicitly flagged and explored.
3. The Skeptic has veto power on any claim that is not clearly marked as a hypothesis.
4. At the end, produce: (a) 3 distinct precise formulations of the original intuition,
   (b) the most promising one with reasons, (c) 3 things to verify independently.
```

### Anti-Hallucination Mechanisms

Include these constraints explicitly in the megaprompt:

1. **Hypothesis marking:** Any specific theorem name, paper citation, or technical claim must be marked `[HYPOTHESIS: verify independently]`.
2. **Confidence gradation:** Council members should distinguish between "I am confident this is standard" vs. "I believe this is true but am not certain" vs. "this is a conjecture."
3. **Negative space:** Explicitly ask what the idea is *not* — what adjacent results it must be distinguished from.
4. **The Skeptic's veto:** If The Skeptic objects and no council member can answer the objection, the claim is suspended, not affirmed.

---

## 5. Session Workflow

### Before the Session

Write a **pre-session brief**: one paragraph describing your intuition, one paragraph on what you already know it connects to, one sentence on the single sharpest question you want answered. Do this *before* opening the megaprompt — it forces you to own the problem rather than outsourcing it.

### During the Session

- **Don't accept the first framing.** Ask the council to try again with a different one.
- **Push on disagreements.** When two archetypes give conflicting framings, that tension is information. Pursue it.
- **Ask for the counterexample.** Explicitly ask The Skeptic: "What is the simplest case where this breaks?"
- **Track the hypothesis list.** Keep a running list of `[HYPOTHESIS]` items that need independent verification.

### After the Session

The output of a good session is not answers — it is **a map**:
- 2–3 precise formulations of your idea
- A list of 5–10 things to verify independently
- 2–3 adjacent literature neighborhoods to explore
- The sharpest version of the objection your idea has not yet answered

Take this map to the library, to your colleagues, to the formalization tools. The council got you to the right door; you walk through it yourself.

---

## 6. Example: Primes as Basis Generators of the Reals

**Pre-session brief:** My intuition is that primes "generate" the reals in some multiplicative/spectral sense, not as a Hamel basis, but through completion and interference patterns. I know this is connected to adeles and the product formula. My sharpest question: is there a precise sense in which the zeta zeros are "overtones" of the primes, analogous to Fourier modes?

**Council constitution:** Grothendieck (geometric), Noether (invariant-theoretic), Tao (analytic), Skeptic.

**Session output (abbreviated):**

- *Grothendieck:* The natural home is the adele ring $\mathbb{A}_\mathbb{Q}$. Primes index places; the reals are one place among infinitely many. The product formula $\prod_p |x|_p \cdot |x|_\infty = 1$ is the global constraint. Framing the reals as "completion" is correct but undersells the symmetry — all completions are created equal.

- *Noether:* The conserved quantity is the adelic norm. The symmetry is the action of $\mathbb{Q}^\times$ on $\mathbb{A}_\mathbb{Q}$. Everything else follows from that.

- *Tao:* The explicit formula $\psi(x) = x - \sum_\rho \frac{x^\rho}{\rho} - \ldots$ is the concrete statement you want. Zeta zeros are literally the spectral frequencies of the prime distribution on the log-line. This is standard analytic number theory. The "overtones" analogy is correct and you should build on it. `[HYPOTHESIS: specific form of explicit formula — verify]`

- *Skeptic:* The claim that "primes generate the reals" in any strong sense is false — $\log 2$ and $\log 3$ are linearly independent over $\mathbb{Q}$ but the reals require uncountably many generators. What you actually have is that primes generate $\mathbb{Q}_{>0}$, and the reals arise as one completion. Be precise about which claim you're making.

**Result:** 4 distinct rigorous formulations produced; computational blueprint for visualizing prime-wave terrain; 8 items for independent verification; identified the adelic interpretation as the most structurally rich.

---

## 7. Known Failure Modes

| Failure Mode | Symptom | Mitigation |
|---|---|---|
| **Affirmation drift** | Council elaborates and validates without challenging | Always include The Skeptic; explicitly ask for counterexamples |
| **Hallucinated citations** | Council cites plausible-sounding but incorrect papers | Mark all citations as `[HYPOTHESIS]`; never cite council output directly |
| **Formalization creep** | Session drifts into proving claims rather than mapping terrain | Hard stop when you notice this; return to exploration framing |
| **Archetype collapse** | All council members sound the same | Increase archetype diversity; explicitly ask members to disagree with each other |
| **Overclaiming novelty** | Council confirms the idea is "genuinely new" | The council cannot assess novelty — that requires literature search |
| **Depth illusion** | Responses sound profound but are circular | Ask for the concrete example; demand the computable case |

---

## 8. The 4D Cognitive Mirror: A Note on What This Actually Is

The Council methodology is one application of a broader principle: **AI is a temporal and cross-domain cognitive prosthetic, not an oracle.**

When you use the Council, what you are actually doing is:

1. **Reflecting your intuition** back to you in multiple framings, some of which will feel more right than others — that feeling is information about your own thinking.

2. **Accessing the texture** of multiple mathematical traditions simultaneously, without requiring the years of immersion each tradition normally demands.

3. **Lowering the cost** of early-stage cross-domain exploration — the phase where most mathematical ideas die not because they're wrong, but because the person who had them couldn't afford the exploration cost.

What you are *not* doing is outsourcing the mathematics. The council's output is raw material for your thinking, not a replacement for it. The mathematician who uses this well will produce better mathematics than one who doesn't. The mathematician who confuses the map for the territory will produce worse mathematics and won't notice.

The most honest framing: the Council makes you a better interlocutor with the mathematical literature. The literature still has to do the work.

---

## 9. Relationship to Other Methodologies in This Collection

This document is the first in a series. The adjacent methodology documents are:

- **The Bret Victor / Bartosz Ciechanowski Pedagogical Stack** — once the Council produces a conceptual map, this methodology translates it into interactive, manipulable form. The Council finds what to explain; the pedagogical stack determines how.

- **The Braggoscope Pipeline** — a methodology for knowledge extraction and semantic search over large technical corpora. The Council identifies the conceptual neighborhood; Braggoscope finds the specific documents in that neighborhood.

These three methodologies form a loop: Braggoscope surfaces relevant existing work → the Council stress-tests your idea against it → the pedagogical stack makes the result accessible to others → repeat.

---

## Appendix: Starter Megaprompts

### A. General Mathematical Exploration

```
You are a Council of mathematical luminaries: Grothendieck (asks for the natural 
geometric home), Noether (asks what is conserved), Tao (demands a concrete example 
and quantitative bound), and The Skeptic (finds the flaw or the prior result that 
trivializes the claim). 

All specific theorem names and citations must be marked [HYPOTHESIS].
Members must disagree when they see things differently — consensus is not the goal.

My intuition: [YOUR INTUITION HERE]
What I already know: [WHAT YOU KNOW]
My sharpest question: [ONE QUESTION]

End with: (1) three precise formulations of my intuition, (2) the most promising 
one with reasons, (3) five things I should verify independently.
```

### B. Cross-Domain Connection Check

```
You are a Council including: [DOMAIN A EXPERT], [DOMAIN B EXPERT], The Skeptic.

I have an idea in [DOMAIN A] that I suspect connects to [DOMAIN B]:
[DESCRIBE THE IDEA AND THE SUSPECTED CONNECTION]

Grothendieck-style question: is there a functor? 
Noether-style question: is there a shared invariant?
Tao-style question: does the connection survive a concrete worked example?
Skeptic: what is the most likely reason this is a false analogy?

Mark all specific claims [HYPOTHESIS].
```

### C. Stress-Testing a Draft Argument

```
You are The Skeptic, assisted by [RELEVANT ARCHETYPE].

Here is an argument I am developing: [YOUR ARGUMENT]

The Skeptic's job: find every gap, every hidden assumption, every place where 
"it is clear that" is doing work it hasn't earned. List them in order of severity.

[RELEVANT ARCHETYPE]'s job: suggest how each identified weakness could be 
addressed, and identify which ones are fatal vs. which are fixable.

Do not affirm. Do not encourage. Find the problems.
```

---

*Version 1.0 — built using the Council methodology to document itself.*

*Companion documents: `bret-victor-pedagogical-stack.md`, `braggoscope-pipeline.md`*
