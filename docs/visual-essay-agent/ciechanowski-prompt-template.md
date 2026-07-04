# The Ciechanowski Method: Interactive Visual Essay Prompt Template

## Synthesis of Bartosz Ciechanowski's Approach

After deep analysis of Bartosz Ciechanowski's body of work across topics ranging from mechanical watches to GPS systems, sound physics to Bézier curves, the following distillation captures the essence of his unique methodology.

---

## Core Philosophy

Bartosz operates on a fundamental belief: **understanding emerges from manipulation**. Every concept must be graspable—literally. The reader should never be a passive observer; they are always an active participant in their own enlightenment.

His work demonstrates that complex systems are never truly complex—they are simply many simple things working together. The art lies in revealing this truth progressively.

---

## The Prompt Template

Use the following template when requesting Claude to generate a Ciechanowski-style interactive visual essay:

```
# Interactive Visual Essay Request

## Topic
[Clearly state the subject to be explained]

## Target Understanding
[What should the reader deeply understand by the end?]

## Assumed Prior Knowledge
[What can you assume the reader already knows?]

---

# GENERATION INSTRUCTIONS

You are creating an interactive visual essay in the style of Bartosz Ciechanowski (ciechanow.ski). Follow these principles with absolute fidelity:

## 1. NARRATIVE ARCHITECTURE

### Opening Hook (The "Wow" Moment)
Begin with an immediately captivating interactive demonstration that:
- Shows the COMPLETE system in action before any explanation
- Is draggable/manipulable from the first second
- Creates genuine wonder ("How does this WORK?")
- Uses familiar everyday framing ("In the world of modern portable devices...")

### The Zoom Pattern
Structure the essay as a continuous zoom:
1. START at human scale (the complete thing working)
2. ZOOM IN to reveal hidden mechanisms
3. ZOOM OUT periodically to reconnect parts to the whole
4. END at human scale with new appreciation

### Progressive Complexity Chain
Each section must:
- Solve exactly ONE problem introduced by the previous section
- Use the phrase "Unfortunately, this won't really work—you can witness this..."
- Let the reader EXPERIENCE the failure before explaining why
- Introduce the solution as the natural next step

### Section Transitions
Use these transitional patterns:
- "Let's see what would happen if..."
- "This poses a challenge—"
- "Thankfully, we can solve this problem by..."
- "Before we continue, it may be worth pausing to..."
- "There is one additional clever bit that's been hiding in plain sight..."

## 2. INTERACTION DESIGN

### The Manipulation Principle
EVERY concept must have an interactive demonstration where:
- The reader directly manipulates the relevant variable
- Cause and effect are immediately visible
- The system responds in real-time (not after button press)
- Sliders control continuous variables; buttons control discrete states

### Persistent Color Coding
Establish a color vocabulary in the first section and maintain it religiously:
- Assign SPECIFIC colors to SPECIFIC concepts (e.g., **red arrow** for force, **blue** for pressure)
- Reference colors in prose using **bold colored terms**
- Colors must be visually distinctive and semantically meaningful
- Use the pattern: "The **mainspring** (shown in **yellow**) connects to..."

### Interaction Patterns (choose appropriate ones):
1. **Drag-to-rotate** - 3D objects the reader can examine from any angle
2. **Slider-as-time** - Scrub through a process frame by frame
3. **Slider-as-parameter** - Change a variable and see system response
4. **Click-to-highlight** - Select elements to see their influence visualized
5. **Side-by-side comparison** - Before/after, correct/incorrect
6. **Cutaway views** - Use slider to "peek inside" mechanisms
7. **Progress tracking** - Show advancement through a process visually

### The "Witness" Imperative
Never just TELL—always let them WITNESS:
- "You can witness this in the demonstration below..."
- "Let's see how these pieces work together..."
- "Notice that as you drag the slider..."
- "You may have realized that..."

## 3. MATHEMATICAL TREATMENT

### Formula Introduction Protocol
NEVER start with equations. Always follow this sequence:
1. Build intuition through physical/visual exploration
2. Identify the pattern verbally ("the further away, the weaker")
3. Show the relationship visually with plots/graphs
4. ONLY THEN introduce the formula
5. Connect formula terms back to visual elements

### Visual Equation Format
When formulas appear:
- Show intermediate steps with visual highlighting
- Use color coding matching the interactive elements
- Include small directional indicators (▲/▼) showing variable relationships
- Provide worked examples with sliders controlling the inputs

### The "Plug In" Verification
After presenting a formula, immediately:
- Provide interactive verification ("You can verify this: when t=0.5, the curve is...")
- Let reader manipulate inputs and see outputs match the formula

## 4. PROSE STYLE

### Voice Characteristics
- First person singular: "I'll explain...", "Let me show you..."
- Direct address: "You can drag...", "Notice that..."
- Conversational but precise: "While this may seem a bit complicated..."
- Gentle enthusiasm: "This is a real mechanical marvel"

### Technical Terms
- Introduce jargon AFTER building intuition
- Italicize on first use: "This process is called *trilateration*"
- Acknowledge complexity without apologizing: "The world of watchmaking is jargon-heavy, so..."
- Offer memory aids: "the names and parts will be **color-coded** for easy reference"

### Sentence Patterns
Use these frequently:
- "Notice that..." (calling attention to emergent behavior)
- "You may have realized that..." (validating reader insight)
- "Unfortunately, this has a fatal flaw..." (setting up next section)
- "Thankfully, we can..." (introducing solution)
- "Let's see what happens when..." (motivating exploration)
- "It may not be immediately clear, but..." (previewing insight)

### Paragraph Rhythm
- Short paragraphs (2-4 sentences typically)
- Every 2-3 paragraphs should be followed by an interactive demonstration
- Never more than one concept per paragraph
- Demonstrations should be REFERENCED in surrounding paragraphs

## 5. VISUAL DESIGN

### Color Palette Principles
- Dark background OR clean light background (commit fully)
- Limited palette (4-6 colors maximum)
- High contrast for interactive elements
- Muted tones for context, vivid tones for focus

### Typography
- Clean serif or sans-serif for body
- Generous line height
- Wide margins
- Bold for emphasis, never for decoration

### Layout Patterns
- Full-width interactive demonstrations
- Text in readable column width
- Demonstrations BREAK the text column to command attention
- Consistent spacing rhythm (section breaks larger than paragraph breaks)

### Animation Principles
- Smooth easing (ease-in-out, never linear for UI)
- Physics-based when simulating physics
- Pausable globally ("if you find animations distracting, you can globally pause...")
- State persists across scroll (returning to a demo shows last state)

## 6. ACCESSIBILITY & CONSIDERATION

### Reader Respect
- Offer unit system choice early (imperial/metric)
- Provide animation pause controls
- Acknowledge when simplifications are made
- Never condescend; assume intelligence, not knowledge

### Performance Consideration
- Mention "save power" as reason to pause animations
- Ensure demos work on touch devices
- Graceful degradation if WebGL unavailable

## 7. CLOSING PHILOSOPHY

### The Return to Wonder
End every essay by:
- Reconnecting to the everyday experience from the opening
- Reflecting on the ingenuity/beauty of what was explained
- Offering poetic appreciation for human achievement
- Suggesting paths for further exploration (with links)

### Final Paragraph Pattern
Example structure:
"In the [1970s], [mechanical watches] started to be [replaced by digital alternatives]. Despite [all these drawbacks], these devices show a *true* mastery of [engineering]. With creative use of [components], a [mechanical watch] rises from its dormant components to become truly alive."

---

## IMPLEMENTATION NOTES

When generating the actual code:

- Use Three.js for 3D (available via import)
- Use D3.js or Canvas for 2D graphics
- Smooth animation via requestAnimationFrame
- Touch and mouse event handling
- All demos should be self-contained single-file HTML

### Key Implementation Patterns:
```javascript
// Slider-controlled animation pattern
const [progress, setProgress] = useState(0);
useEffect(() => {
  // Derive all visual state from progress
  const position = lerp(startPos, endPos, progress);
  // Update visualization
}, [progress]);

// Drag-to-rotate pattern for 3D
const [rotation, setRotation] = useState({ x: 0, y: 0 });
// Use OrbitControls or custom drag handling

// Color-coding pattern
const COLORS = {
  mainspring: '#FFD93D',
  barrel: '#6BCB77',
  escapement: '#4D96FF',
  balance: '#FF6B6B'
};
```

---

## CHECKLIST BEFORE GENERATION

□ Do I start with a captivating, interactive "wow" moment?
□ Is every concept paired with a manipulation?
□ Do I zoom in progressively, revealing mechanisms?
□ Are colors persistent and semantically meaningful?
□ Do I let readers WITNESS failures before explaining solutions?
□ Is math introduced AFTER intuition is built?
□ Do I use direct address and conversational tone?
□ Does the essay end with philosophical reflection?
□ Are animations pausable?
□ Would Bartosz be proud of this?
```

---

## Example Application

Here's how you might use this template:

**Topic**: How does a bicycle stay upright?

**Target Understanding**: The reader should understand gyroscopic effects, trail geometry, and counter-steering, and appreciate why bicycle design is deceptively sophisticated.

**Assumed Prior Knowledge**: Basic physics intuition (forces, momentum), familiarity with riding a bicycle.

Then append the full GENERATION INSTRUCTIONS section above.

---

## Philosophical Postscript

What makes Bartosz's work transcendent is not merely technique—it is *care*. Every essay radiates the sense that someone spent months ensuring that YOU, the reader, would have the most lucid possible path to understanding. 

The interactives are not decorations; they are the understanding itself, made tangible.

When generating in this style, channel that same care. Ask: "Is this the clearest possible way to reveal this truth?" If not, rebuild until it is.

The goal is not to explain—it is to make explanation unnecessary by making the truth directly perceivable.
