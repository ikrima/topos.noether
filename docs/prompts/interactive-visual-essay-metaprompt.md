# Interactive Mathematical Visual Essay Generator

## Purpose

This prompt transforms abstract mathematical concepts into beautiful, interactive visual essays in the tradition of Bret Victor, Bartosz Ciechanowski, and Steven Wittens. Simply describe your mathematical concept and desired audience—Claude will generate a complete, working interactive essay.

---

## THE PROMPT

Copy everything below this line and paste it into Claude, replacing the `[PLACEHOLDERS]` with your specific content:

---

```
You are an expert creator of interactive mathematical visual essays in the tradition of Bret Victor ("Explorable Explanations"), Bartosz Ciechanowski (ciechanow.ski), and Steven Wittens (acko.net). Your mission is to transform abstract mathematical concepts into immediately tangible, manipulable experiences.

## MY MATHEMATICAL CONCEPT

**Topic:** [DESCRIBE YOUR MATHEMATICAL CONCEPT - e.g., "The fundamental theorem of calculus", "How eigenvalues reveal matrix structure", "The topology of the Möbius strip"]

**Core insight I want to convey:** [WHAT'S THE "AHA MOMENT"? - e.g., "Integration and differentiation are inverse operations", "Eigenvalues are the natural frequencies of a linear transformation"]

**Target audience:** [WHO IS THIS FOR? - e.g., "Calculus students seeing integrals for the first time", "Graduate students learning spectral theory", "Curious adults with high school math"]

**Prerequisite knowledge:** [WHAT DO THEY ALREADY KNOW? - e.g., "They understand derivatives but haven't seen integrals", "They know linear algebra basics"]

---

## ESSAY ARCHITECTURE

Follow this structure precisely:

### 1. THE HOOK (First 30 seconds)
- Open with the COMPLETE concept working, fully interactive
- No explanation yet—pure wonder and manipulation
- The reader should think: "Wow, how does this WORK?"
- Let them drag, slide, rotate immediately
- Example: Before explaining eigenvalues, show a matrix transforming vectors with draggable inputs—some vectors change length but not direction (these are eigenvectors). Let them discover this pattern.

### 2. THE ZOOM PATTERN
Structure the essay as a continuous zoom:
1. START at human scale (the complete thing working)
2. ZOOM IN to reveal the simplest component
3. BUILD UP component by component
4. ZOOM OUT periodically to reconnect parts to the whole
5. END at human scale with new appreciation

### 3. PROGRESSIVE COMPLEXITY CHAIN
Each section must:
- Solve exactly ONE problem introduced by the previous section
- Let the reader WITNESS the problem before explaining it
- Use the pattern: "Unfortunately, this approach has a fatal flaw—you can witness this in the demonstration below..."
- Then introduce the solution as the natural next step: "Thankfully, we can solve this by..."

### 4. MATHEMATICS LAST, NOT FIRST
Follow this sequence for every concept:
1. Build VISUAL INTUITION through manipulation
2. Identify PATTERNS verbally ("Notice that as you drag the slider...")
3. Show RELATIONSHIPS graphically (animate the connection)
4. ONLY THEN show the formula (emerging from the visualization)
5. The equation should feel INEVITABLE, not imposed

### 5. CLOSING
- Return to the opening demonstration with new understanding
- Add a philosophical reflection on what we've discovered
- Optional: hint at deeper connections or next explorations

---

## INTERACTION DESIGN PRINCIPLES

### The Manipulation Principle
EVERY concept must have an interactive demonstration where:
- The reader DIRECTLY manipulates the relevant variable
- Cause and effect are IMMEDIATELY visible
- The system responds in REAL-TIME (not after button press)
- Sliders control continuous variables; buttons control discrete states

### Interaction Patterns (use the appropriate ones):

| Pattern | Use When | Implementation |
|---------|----------|----------------|
| **Drag-to-rotate** | 3D objects to examine | "Drag to change viewing angle" |
| **Slider-as-time** | Temporal processes | Scrub through a process frame-by-frame |
| **Slider-as-parameter** | Variable exploration | Adjust and see system response |
| **Click-to-highlight** | Showing influence | Click an element to see its effect |
| **Side-by-side** | Before/after comparison | Left: one approach, Right: another |
| **Hover-to-reveal** | Additional information | Hover for definitions or values |

### The "Witness" Imperative
NEVER just tell—always let them WITNESS:
- ✗ "The derivative of sin(x) is cos(x)"  
- ✓ "Drag the point along sin(x) and watch the slope indicator. Notice how it traces out another familiar curve..."

---

## VISUAL DESIGN REQUIREMENTS

### Color Coding
Assign SPECIFIC colors to SPECIFIC concepts and maintain them RELIGIOUSLY:
- Choose 3-5 semantically meaningful colors
- Reference colors in prose using **bold colored terms**
- Example: "The **velocity vector** (shown in **blue**) is always tangent to the **trajectory** (shown in **amber**)..."

### Typography
- Use distinctive, beautiful fonts (NOT Inter, Arial, Roboto)
- Mathematical equations should feel integrated, not bolted-on
- Large, readable text with generous spacing

### Layout
- Dark, immersive interface that focuses attention on the mathematics
- Visualization takes center stage (at least 60% of viewport)
- Controls positioned to not obstruct the view
- Smooth, purposeful animations (60fps)

### Anti-Patterns to AVOID
- ❌ Centered everything
- ❌ Purple gradients on white
- ❌ Generic card layouts
- ❌ Equations before intuition
- ❌ Static images where interaction is possible
- ❌ Explaining without demonstrating

---

## PROSE STYLE

### Opening Hooks
- "In the world of [everyday context], it may be hard to believe that..."
- "You can drag the [object] to explore how..."
- "Over the course of this essay, you'll discover..."

### Transitions
- "Let's see what happens when..."
- "Unfortunately, this approach has a fatal flaw—you can witness this below..."
- "Thankfully, we can solve this with..."
- "Before we continue, it's worth pausing to notice..."
- "There's one clever bit hiding in plain sight..."

### Observations
- "Notice that as you [action], the [element] [behavior]..."
- "You may have realized that..."
- "It may not be immediately clear, but..."

### Technical Terms
- "This process is called *[term]*—[brief plain explanation]"
- "The [jargon], which is simply [plain explanation]..."

### Tone
- Warm, curious, inviting
- First person plural: "we," "let's," "our"
- Present tense for immediacy
- Never condescending

---

## TECHNICAL IMPLEMENTATION

Generate a COMPLETE, WORKING React component using:

### Core Stack
- React with hooks (useState, useEffect, useRef, useCallback, useMemo)
- Tailwind CSS for styling
- recharts for 2D data visualization
- SVG for custom vector graphics
- Canvas for performance-critical animations

### Code Quality
- TypeScript-style annotations in comments
- Clean, readable, well-organized code
- Responsive design (works on mobile and desktop)
- Smooth 60fps animations
- Memoize expensive computations

### Structure Template
```jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ... } from 'recharts';

const InteractiveEssay = () => {
  // State for interactive parameters
  const [parameter, setParameter] = useState(initialValue);
  
  // Computed values that respond to parameter changes
  const computedData = useMemo(() => {
    // Mathematical computations here
  }, [parameter]);
  
  // Sections of the essay
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Opening Hook: Full working system */}
      <section className="mb-16">
        <InteractiveHook parameter={parameter} onChange={setParameter} />
      </section>
      
      {/* Progressive sections with narrative */}
      <section className="mb-16">
        <Narrative>...</Narrative>
        <InteractiveDemo />
      </section>
      
      {/* Mathematical formalism (only after intuition built) */}
      <section className="mb-16">
        <EquationReveal data={computedData} />
      </section>
      
      {/* Closing reflection */}
      <section>
        <PhilosophicalClose />
      </section>
    </div>
  );
};

export default InteractiveEssay;
```

---

## IMPORTANT REMINDERS

1. **Interaction is NON-NEGOTIABLE.** Every major concept needs a manipulable demonstration. If the reader can't touch it, it's not an explorable explanation.

2. **Equations emerge from exploration.** The reader should discover the mathematical relationship through interaction BEFORE seeing the formula.

3. **Color is vocabulary.** Choose semantic colors and use them consistently. Reference them in the prose.

4. **Progressive disclosure.** Start simple. Each section adds exactly one layer of complexity. Never overwhelm.

5. **60fps or nothing.** Sluggish interactions break the illusion. Use requestAnimationFrame, memoization, and efficient re-renders.

6. **Test by witnessing.** For every claim you make in prose, ask: "Can the reader witness this in a demonstration?" If not, add one.

---

Now generate my interactive visual essay. Create a complete, working React component that I can use immediately as a Claude artifact.
```

---

## HOW TO USE THIS PROMPT

### Step 1: Copy the entire prompt above
### Step 2: Replace the placeholders:
   - `[DESCRIBE YOUR MATHEMATICAL CONCEPT]`
   - `[WHAT'S THE "AHA MOMENT"?]`
   - `[WHO IS THIS FOR?]`
   - `[WHAT DO THEY ALREADY KNOW?]`

### Step 3: Paste into Claude and send

### Step 4: Claude will generate a complete interactive essay as a React artifact

### Step 5: Click "Preview" to interact with your essay immediately

---

## EXAMPLE FILLED-IN PROMPTS

### Example 1: The Chain Rule

```
**Topic:** The chain rule in calculus

**Core insight I want to convey:** When you compose functions, the rates of change multiply—like gears in a machine where each gear's speed compounds the previous one.

**Target audience:** Calculus students who understand basic derivatives but are struggling with the chain rule.

**Prerequisite knowledge:** They know how to find derivatives of basic functions (polynomials, sin, cos, exp) but get confused when functions are nested.
```

### Example 2: Eigenvectors

```
**Topic:** What eigenvectors really mean geometrically

**Core insight I want to convey:** Eigenvectors are the "natural directions" of a linear transformation—the directions where the transformation just stretches or shrinks, never rotates.

**Target audience:** Linear algebra students who can compute eigenvalues but don't understand what they mean.

**Prerequisite knowledge:** Matrix multiplication, linear transformations as geometric operations.
```

### Example 3: The Fourier Transform

```
**Topic:** Why the Fourier transform works

**Core insight I want to convey:** Any signal can be built from spinning circles, and the Fourier transform just tells us how fast each circle spins and how big it is.

**Target audience:** Engineering students or curious adults with some calculus background.

**Prerequisite knowledge:** Familiarity with sine/cosine, basic integration, complex numbers are helpful but not required.
```

---

## TIPS FOR MATHEMATICIANS

1. **Start with ONE key insight.** Don't try to cover everything. What's the single most important thing you want them to understand?

2. **Think about the failure mode.** What misconception do students commonly have? Design the opening hook to make that misconception visible before you correct it.

3. **Choose parameters wisely.** What variables, when changed, most dramatically reveal the mathematical structure? Those become your sliders.

4. **Draw before you describe.** Sketch what the visualization should look like on paper first. What changes when you drag? What stays fixed?

5. **Listen for "notice that..."** Every time you'd say "notice that" in a lecture, that's a cue for an interactive moment.

---

## TROUBLESHOOTING

**"The generated essay is too long/short"**
Add to your prompt: "The essay should have approximately [N] major sections, taking roughly [X] minutes to explore."

**"I want 3D visualizations"**
Add to your prompt: "Use Three.js for 3D rendering. Include draggable camera controls."

**"The math is too simple/advanced"**
Be more specific about prerequisite knowledge and target audience. Include specific topics they should/shouldn't know.

**"I want specific styling"**
Add to your prompt: "Use a [light/dark] theme with [specific color palette]. The aesthetic should feel like [reference]."

---

*This metaprompt synthesized from best practices in explorable explanations, interactive visualization design, and mathematical pedagogy.*
