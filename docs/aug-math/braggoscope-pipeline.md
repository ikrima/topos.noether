# The Braggoscope Pipeline
## A Methodology for Knowledge Extraction from Technical Corpora

> **Core thesis:** Before you can stress-test an idea against existing knowledge, you need to be able to find the relevant existing knowledge in your own corpus — quickly, semantically, and without knowing in advance what keywords to use. This document codifies a pipeline for building that capability over large technical note collections.

---

## 1. The Problem This Solves

The Council of Luminaries methodology produces a map: "your idea probably lives near *condensed mathematics*, *fluid topology*, and *Noether currents*." That map is only useful if you can then open your corpus and find what you've already written — or collected — near those coordinates.

The problem: technical corpora (research notes, annotated papers, Obsidian vaults, engineering wikis) are almost impossible to search well with standard tools. Keyword search misses the document that uses different terminology for the same concept. Vector search alone misses the document that contains the precise API name or theorem reference you need. Tag-based search is only as good as the tagger's foresight, which is always incomplete.

The Braggoscope pipeline solves this with a **hybrid extraction-plus-search** approach: use an LLM to extract structured metadata from every document in your corpus — with explicit reasoning traces that improve extraction quality — then build a layered search index combining semantic similarity, keyword matching, and entity graphs. The result is a search system that finds the document about "memory allocation in the Binned2 allocator" whether your query is "Binned2," "UE4 memory management," "pool allocation," or "why does my game OOM at runtime."

**Origin of the name:** The methodology is adapted from [Braggoscope](https://braggoscope.com), Matt Webb's system for making 25 years of BBC *In Our Time* episodes searchable. The core technique — inline chain-of-thought extraction — was developed there for a messy humanities corpus. It generalizes cleanly to technical corpora with richer entity vocabularies.

---

## 2. The Core Technique: Inline Chain-of-Thought

Standard LLM extraction asks: "classify this document as X, Y, or Z." The model produces a label.

Inline chain-of-thought asks the model to produce a *reasoning trace first*, before the classification. Because LLM generation is autoregressive — each token is conditioned on all preceding tokens — forcing the reasoning trace before the label means the label is generated in the context of the model's own articulated reasoning. This produces measurably better classifications, especially on ambiguous or multi-domain documents.

**The schema ordering matters:**

```json
// Good: reasoning constrains classification
{
  "primary_domain_reasoning": "This document discusses FMallocBinned2, 
    a UE4-specific memory allocator. The content is implementation-level 
    engine programming, not general graphics...",
  "primary_domain": "ue4_engine"
}

// Less effective: classification before reasoning
{
  "primary_domain": "ue4_engine",
  "primary_domain_reasoning": "..."
}
```

This is not a minor optimization. For documents that sit at domain boundaries — a note about UE4's renderer that touches graphics research — the reasoning trace forces the model to work out *which aspect* is primary before committing. Without it, boundary documents are classified inconsistently across runs.

**Debugging benefit:** When extraction goes wrong, you can read the reasoning trace and immediately diagnose why. "The model classified this as graphics research because the reasoning says 'discusses PBR materials' — but the document is actually about the UE4 material editor UI, not rendering research." With the trace, the prompt fix is obvious. Without it, you only know the label is wrong.

---

## 3. Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Query Interface                         │
│         Hybrid search: semantic + BM25 + entity graph        │
│         Reciprocal Rank Fusion merges the three signals      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                         Index Layer                          │
│   Vector store (document + chunk embeddings)                 │
│   BM25 inverted index (full-text keyword matching)           │
│   Entity index (exact name lookup for APIs, commands, etc.)  │
│   Document graph (similarity edges + explicit links)         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                      Extraction Layer                        │
│   Step 1: extract    — structured metadata via LLM           │
│   Step 2: normalize  — entity deduplication                  │
│   Step 3: embed      — vector embeddings                     │
│   Step 4: graph      — similarity edges                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                     Source Corpus                            │
│   Markdown files, annotated PDFs, engineering notes          │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. The Extraction Schema

Design the schema around your corpus's entities. The schema below is tailored to a technical corpus spanning game engine internals, graphics programming, and systems development — but the *structure* generalizes to any domain.

```typescript
interface DocumentExtraction {
  
  // IDENTITY
  path: string;
  title: string;
  schema_version: string;  // Increment when you change the schema or prompt
  
  // CLASSIFICATION (inline-CoT: reasoning ALWAYS before value)
  primary_domain: {
    reasoning: string;
    // "Discusses FMallocBinned2, a UE4-specific allocator. Content is 
    //  implementation-level engine programming, not general graphics..."
    domain: "ue4_engine" | "graphics_research" | "systems" | 
            "mathematics" | "tooling" | "houdini" | "design";
    subdomain: string;  // e.g., "engine/memory", "math/topology"
  };

  // TOPICS (faceted taxonomy — reasoning before tags)
  topics: {
    reasoning: string;
    primary: string[];    // 3-5, most important first
    secondary: string[];  // relevant but not central
  };

  // ENTITIES (exact strings as they appear — no paraphrasing)
  entities: {
    apis: string[];           // ["FMallocBinned2", "FMemory::Malloc"]
    console_commands: string[]; // ["stat memory", "memreport -full"]
    tools: string[];          // ["RenderDoc", "Nsight Graphics"]
    modules: string[];        // ["Core", "Engine", "RHI"]
    techniques: string[];     // ["virtual texturing", "temporal AA"]
    math_objects: string[];   // ["Fréchet space", "étale cohomology"]
  };

  // GRAPH EDGES (explicit only — do not infer from topic similarity)
  explicit_links: {
    prerequisites: string[];   // What to read first
    related: string[];         // Same-domain related documents
    contrasts_with: string[];  // Documents making opposing claims
  };

  // SUMMARY (insight, not restatement of title)
  summary: string;
}
```

### Schema Design Principles

**One reasoning field per classification decision.** Don't share reasoning across fields. Each discrete classification gets its own `reasoning` field immediately before it.

**Entities are exact strings, not paraphrases.** Surface the exact string as it appears in the document. Normalization is a separate downstream step — don't ask the extraction LLM to normalize.

**Accept missing data.** Empty arrays are better than fabricated entities. Don't force completeness.

**Version your schema.** When you update schema or prompt, increment `schema_version`. Re-extract only documents processed under old versions.

---

## 5. The Extraction Prompt

```
You are extracting structured metadata from a technical document.
Your corpus is a personal knowledge base covering [YOUR DOMAIN].

Document path: {path}
Document content:
---
{content}
---

Extract the following fields in order. For each classification,
provide your reasoning BEFORE the value.

1. PRIMARY DOMAIN
   Reason about which domain this document primarily addresses.
   Then select the domain. Then select the subdomain (free text, specific).

2. TOPICS
   Reason about what this document addresses at the concept level.
   Primary topics (3-5, most important first).
   Secondary topics (relevant but not central).

3. ENTITIES
   Extract exact strings as they appear in the document.
   For each category, return the exact form used — do not normalize.
   If a category has no entries, return an empty array.
   Do NOT invent entities that are not explicitly named.

4. EXPLICIT LINKS
   Only include relationships explicitly stated or strongly implied.
   Do not infer relationships from topic similarity.

5. SUMMARY
   1-2 sentences. The key insight, not a restatement of the title.

Return JSON matching the schema. All reasoning fields must precede
the fields they inform.
```

### Iteration Strategy

The extraction prompt is the piece you will iterate on most. The correct workflow:

1. Run extraction on 20 randomly sampled documents.
2. Read every output file. Don't skim — read them.
3. Note failure patterns: entities missed, domains misclassified, reasoning that doesn't justify the classification.
4. Fix the prompt. Bump the schema version.
5. Re-run on the same 20 samples. Compare.
6. Repeat until the failure rate is acceptable.
7. Run on the full corpus.

Do not skip step 2. Failure modes in extraction prompts are almost always invisible until you read actual outputs carefully. You cannot predict them from first principles.

---

## 6. Entity Normalization

Extraction surfaces raw strings. The same entity will appear as "FMallocBinned2", "Binned2", "binned2 allocator", "the Binned2 allocator" — all the same thing, and they need to unify before indexing.

**Step 1: Rule-based normalization.** Write explicit rules for high-value entities you know will vary. Strip common prefixes/suffixes, lowercase for comparison. This handles 80% of variations for 20% of effort.

**Step 2: LLM-assisted normalization (optional).** Cluster extracted entities by embedding similarity, then ask the LLM: "are these the same entity?" Slower and more expensive — only invoke it for entities that rules didn't resolve.

**Output:** A canonical entity registry. Every extracted entity in every document maps to a canonical form. The search index uses canonical forms; display layer maps back to original strings for context.

---

## 7. Hybrid Search via Reciprocal Rank Fusion

Three signals, combined:

**Signal 1: Semantic (vector) search.** Good for conceptual queries where you don't know the right terminology. "How does memory pooling work."

**Signal 2: BM25 keyword search.** Good for exact terminology. "FMallocBinned2." Known-item search.

**Signal 3: Entity graph search.** Given a query containing an entity name, find all documents containing that canonical entity. Good for tracing usage of a specific API or technique across the corpus.

**Reciprocal Rank Fusion:**

```
score(doc) = Σ_{signal} 1 / (k + rank_in_signal(doc))
```

where k = 60 is standard. Robust to incomparable score scales — each signal contributes through rank, not raw score.

| Query type | Primary signal |
|---|---|
| "What is virtual texturing?" | Semantic |
| "FMallocBinned2 usage" | Entity |
| "stat memory console command" | BM25 |
| "What should I read before this?" | Graph (follow `prerequisites`) |

---

## 8. How This Connects to the Other Methodologies

The Braggoscope pipeline is the **grounding layer** for the Council of Luminaries.

A Council session produces a map: "your intuition probably lives near condensed mathematics and fluid topology." Without the pipeline, acting on that map means 45 minutes of manual searching with imperfect recall. The map's value decays rapidly because using it is expensive.

With the pipeline: take the 5-10 key terms from the Council map, run them through hybrid search, get your corpus's relevant documents in under 30 seconds. The Council tells you where to look; the pipeline shows you what's already there.

The canonical workflow:

```
Braggoscope  →  Surface relevant documents from your corpus
    ↓
Council      →  Stress-test your idea against the surfaced documents
    ↓
Victor/Ciec  →  Make the result accessible to others
    ↓
New documents produced  →  Feed back into Braggoscope index
```

The loop is self-reinforcing. Every essay you produce via the Victor/Ciechanowski methodology becomes a document in your corpus that the pipeline can surface in future Council sessions on related topics.

---

## 9. Known Failure Modes

**Over-extraction on long documents.** Long documents generate more entities not because they're more entity-rich, but because there are more tokens to pattern-match against. This biases search toward longer documents. Mitigation: chunk long documents, run extraction per chunk, merge; or cap entity list lengths in the schema.

**Temporal entity drift.** Terms you used in 2020 differ from terms you use now for the same concepts. The canonical entity registry doesn't handle this automatically. Schedule periodic re-normalization passes.

**The "everything is related" graph problem.** If the similarity threshold for the document graph is too low, the graph becomes dense and loses signal. Use a high threshold (0.85+ cosine similarity) for embedding-based edges. Entity-based edges are separate and can be denser.

**Schema over-fit to known documents.** You design the schema based on documents you've looked at. It will fail on types you haven't seen. Sign: extraction outputs that are mostly empty or obviously misclassified. Response: read those documents manually, identify what's different, extend the schema.

**The cold-start problem.** New documents don't have extraction metadata yet. If you add documents faster than you run extraction, your search index lags your corpus. Mitigation: run extraction on file-change events as a background process, or accept a lag with nightly batch jobs.

---

## 10. Practical Starting Point

**Step 0: Sample and read.** Pick 20 documents at random. Read them. Write down manually what domain, topics, and entities you would assign. This is your ground truth.

**Step 1: Write the schema.** Adapt to your corpus. Key question: what are the *unique vocabulary items* in your domain that generic semantic search will miss? Those become entity categories.

**Step 2: Write the extraction prompt.** Start minimal — domain, topics, one or two entity categories. Add complexity after the simple version works.

**Step 3: Run on your 20 samples.** Read every output. Compare to ground truth. Identify failure patterns.

**Step 4: Iterate.** Fix the most common failure. Re-run. Repeat until satisfactory.

**Step 5: Build the search index.** Only after extraction is reliable. The index is straightforward once the data is good.

**The extraction data quality is the entire pipeline.** Everything downstream is only as good as the structured metadata from the extraction step. Invest 80% of your time on extraction quality, 20% on the search layer.

---

## Appendix: Why Inline Chain-of-Thought Works

The mechanism: LLM outputs are generated token-by-token, each conditioned on all preceding tokens. If you ask for a label first, the model has only the document and schema as context. If you ask for reasoning first, the reasoning tokens narrow the probability distribution over labels — because reasonable labels must be consistent with stated reasoning.

This isn't a new insight (Wei et al., 2022 on chain-of-thought prompting). The Braggoscope contribution is embedding the chain-of-thought *inside the output schema* rather than as a separate reasoning step. This means:

- The reasoning is captured in the output (useful for debugging)
- It's structurally enforced by the schema definition (you can't forget it)
- It's available downstream (you can build a UI that shows why each document was classified as it was)

The debugging use case alone justifies the technique. At scale, you will get wrong classifications. You need to read the reasoning to understand why — not just observe that the label is wrong. The prompt fix becomes obvious when you can see the model's reasoning. Without it, you're debugging blindly.

---

*Version 1.0 — third document in the Augmented Intelligence methodology collection.*

*Companion documents: `council-of-luminaries.md`, `bret-victor-pedagogical-stack.md`*

*Reference implementation: [ikrima/gamedevguide](https://github.com/ikrima/gamedevguide)*
