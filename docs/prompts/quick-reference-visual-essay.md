# Quick Reference: Interactive Math Essay Generator

## MINIMAL PROMPT (copy and customize)

```
Create an interactive visual essay that makes [MATHEMATICAL CONCEPT] tangible and explorable.

**The "aha moment":** [ONE SENTENCE: what should they understand?]
**Audience:** [WHO? what do they know?]
**Key misconception to address:** [WHAT DO PEOPLE GET WRONG?]

Follow the Bartosz Ciechanowski / Bret Victor style:
1. HOOK: Open with the complete concept working interactively—no explanation yet, pure wonder
2. WITNESS: Let readers discover every principle by manipulating parameters, not by reading
3. PROGRESSIVE: Each section solves ONE problem from the previous, building toward the insight
4. MATH LAST: Equations only after readers have discovered the relationship visually
5. SEMANTIC COLOR: Assign 3-5 colors to concepts, reference them consistently in prose

Generate a complete, working React + Tailwind component with:
- Sliders for continuous parameters, buttons for discrete states  
- recharts for 2D plots, SVG for custom graphics
- Dark theme, 60fps animations, responsive design
- Prose woven between interactive sections using "Notice that...", "Unfortunately this approach fails—witness below...", "Thankfully we can..."
```

---

## FILL-IN TEMPLATES

### Calculus Concept
```
**Concept:** [derivative/integral/limit/series...]
**The "aha moment":** [geometric/physical meaning]
**Audience:** Calculus students who understand [X] but not [Y]
**Key misconception:** They think [common error]
```

### Linear Algebra Concept
```
**Concept:** [eigenvalues/transformations/spaces...]
**The "aha moment":** [geometric interpretation]
**Audience:** Linear algebra students who can compute [X] but don't see [Y]
**Key misconception:** They think of matrices as [wrong mental model]
```

### Abstract Algebra / Topology
```
**Concept:** [group action/manifold/sheaf...]
**The "aha moment":** [concrete example that captures essence]
**Audience:** [grad students / advanced undergrads / researchers]
**Key misconception:** The formalism obscures [intuitive core]
```

---

## DESIGN CHECKLIST

Before sending, verify your prompt implies:

☐ **Interactive hook** - Something to drag/slide within 5 seconds  
☐ **Witness, don't tell** - Discovery through manipulation  
☐ **One insight per section** - Progressive complexity  
☐ **Equations emerge** - Math after intuition  
☐ **Semantic colors** - Consistent color = concept mapping  
☐ **Dark theme** - Focus on the mathematics  
☐ **60fps animations** - Smooth, responsive interactions  

---

## COMMON ENHANCEMENTS

Add these to your prompt as needed:

**For 3D concepts:** "Use Three.js with OrbitControls for 3D visualization."

**For comparison:** "Include side-by-side comparison showing [approach A] vs [approach B]."

**For rigorous math:** "Include a collapsible 'Mathematical Details' section with formal definitions."

**For longer essays:** "Structure as [N] major chapters, approximately [X] minutes of exploration each."

**For specific styling:** "Use [color palette]. Typography should feel [elegant/playful/technical]."

---

## INTERACTION PATTERNS QUICK GUIDE

| You want to show... | Use this pattern |
|---------------------|------------------|
| How something changes over time | Slider as timeline (scrub through) |
| Effect of a parameter | Slider controlling variable |
| 3D object structure | Drag-to-rotate canvas |
| Cause and effect | Click element → highlight consequence |
| Two approaches | Side-by-side with synchronized controls |
| Hidden details | Hover to reveal / progressive disclosure |

---

## PROSE PHRASES THAT WORK

**Openings:**
- "You can drag the [element] to see how..."
- "In the demonstration below, try..."
- "Before we explain anything, explore..."

**Transitions:**
- "Notice that as you [action]..."
- "Unfortunately, this approach fails—witness below..."
- "Thankfully, we can solve this by..."
- "There's something subtle hiding here..."

**Revelations:**
- "You may have already noticed that..."
- "This is precisely the [mathematical object]..."
- "What you've just discovered is called..."

---

*When in doubt: Can the reader WITNESS this claim by manipulating something? If not, add an interaction.*
