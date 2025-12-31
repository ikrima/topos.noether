---
name: interactive-visual-essay
description: Create long-form interactive visual essays that synthesize multiple source articles into explorable experiences. Use this skill when asked to create visual explanations, interactive essays, explorable explanations, or when synthesizing blog posts/articles into interactive web experiences. Channels the design philosophies of Bret Victor (direct manipulation), Steven Wittens (mathematical beauty), and Bartosz Ciechanowski (scroll-driven narratives). Outputs single-file HTML SPAs targeting modern browsers (ES2022+, CSS nesting, WebGPU where beneficial).
---

# Interactive Visual Essay Skill

Create publication-quality interactive essays that synthesize source material into explorable experiences. Target modern browsers only—use cutting-edge features freely.

## Workflow

### Phase 1: Source Analysis

1. Fetch all source URLs using `web_fetch`
2. Extract core theses, key examples, memorable quotes
3. Identify conceptual connections between sources
4. Note visual/interactive opportunities in the content

### Phase 2: Deep Synthesis ("Ultra Think")

Before writing any code, articulate:

```
CORE SYNTHESIS
- What is each source saying?
- How do they connect/contrast?
- What emerges from their combination?

VISUAL OPPORTUNITIES  
- Which concepts become clearer through interaction?
- What parameters can users manipulate?
- Where does animation reveal hidden structure?
- What LIBRARY would make this significantly easier?

STRUCTURAL DESIGN
- What is the scroll-driven narrative arc?
- How does complexity build progressively?
- What are the "aha moment" interactions?
```

### Phase 3: Implementation

Generate a single-file HTML SPA with:
- Modern CSS (nesting, :has(), @container, subgrid)
- Modern JS (ES2022+, top-level await, optional chaining)
- CDN-loaded libraries where they provide significant value
- Google Fonts for typography
- SVG or Canvas/WebGL/WebGPU depending on needs
- Progressive disclosure via scroll

## Recommended Libraries

Load via CDN. Use libraries that genuinely reduce boilerplate—especially for UI state management, which is the biggest pain point in vanilla JS interactive essays.

### Tier 1: Almost Always Use

**Alpine.js** — Reactive UI without framework overhead (~17KB)
```html
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
```
Use for: Toggle states, tabs, show/hide logic, slider bindings, any reactive UI. Eliminates 80% of UI boilerplate.

```html
<!-- Mode toggle in 5 lines instead of 30 -->
<div x-data="{ mode: 'intuition' }">
  <button @click="mode = 'intuition'" :class="{ active: mode === 'intuition' }">Intuition</button>
  <button @click="mode = 'rigor'" :class="{ active: mode === 'rigor' }">Rigor</button>
  <div x-show="mode === 'intuition'" x-transition>...</div>
  <div x-show="mode === 'rigor'" x-transition>...</div>
</div>

<!-- Slider with live binding -->
<div x-data="{ n: 5 }">
  <input type="range" x-model="n" min="1" max="20">
  <span x-text="n"></span>
  <div x-effect="updateVisualization(n)"></div>
</div>
```

**GSAP + ScrollTrigger** — Professional scroll-driven animation (~60KB)
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
```
Use for: Pinned sections, scrubbed animations, scroll-triggered reveals, complex timelines. ScrollTrigger is essential for Ciechanowski-style scroll narratives.

**D3.js** — Custom data visualization (~90KB modular)
```html
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
```
Use for: Scales, axes, force simulations, geographic projections, custom bindingsany visualization that isn't a standard chart. The foundation of serious data viz.

### Tier 2: When You Need Them

**Three.js** — 3D graphics (~150KB)
```html
<script src="https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.min.js"></script>
```
Use for: 3D mathematical surfaces, particle systems, spatial reasoning, shader effects. The only serious option for browser 3D.

**use.gpu** — WebGPU-accelerated reactive rendering
```html
<script type="importmap">
{ "imports": { "use-gpu": "https://cdn.jsdelivr.net/npm/use-gpu@latest/dist/index.js" } }
</script>
```
Use for: Millions of data points, GPU-computed visualizations, Steven Wittens-style mathematical beauty. See references/usegpu-patterns.md. Requires WebGPU (Chrome 113+, Edge 113+).

**Lenis** — Premium smooth scrolling (~10KB)
```html
<script src="https://cdn.jsdelivr.net/npm/lenis@1.0.42/dist/lenis.min.js"></script>
```
Use for: Buttery smooth inertial scrolling. Makes scroll-driven narratives feel premium. Native `scroll-behavior: smooth` is janky by comparison.

```javascript
const lenis = new Lenis();
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
// Integrate with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
```

**KaTeX** — Fast math rendering (~90KB)
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
```
Use for: Beautiful mathematical formulas. 10x faster than MathJax.

### Tier 3: Specialized

**Matter.js** — 2D physics (~80KB)
```html
<script src="https://cdn.jsdelivr.net/npm/matter-js@0.19.0/build/matter.min.js"></script>
```
Use for: Tactile drag interactions, realistic motion, collision detection. Makes abstract concepts physically manipulable.

**Chart.js** — Quick standard charts (~60KB)
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
```
Use for: When you need a standard bar/line/pie chart fast and D3 is overkill. Good defaults, limited customization.

**Tippy.js** — Tooltips done right (~15KB)
```html
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2"></script>
<script src="https://cdn.jsdelivr.net/npm/tippy.js@6"></script>
```
Use for: Tooltips, popovers, contextual information. Handles positioning edge cases you don't want to write.

**Prism.js** — Code syntax highlighting (~20KB)
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css">
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
```
Use for: Displaying code snippets with syntax highlighting in technical essays.

### Decision Matrix

| Need | Library | Why Not Alternatives |
|------|---------|---------------------|
| UI state (toggles, tabs) | Alpine.js | Vanilla JS is 5x more code |
| Scroll animations | GSAP ScrollTrigger | CSS scroll-driven animations have poor support |
| Custom data viz | D3.js | Unmatched bindingsChart.js too limited |
| Standard charts | Chart.js or D3 | Plotly is 3MB (too heavy) |
| 3D graphics | Three.js | Only real option |
| High-perf GPU viz | use.gpu | WebGPU-native, reactive |
| Smooth scroll | Lenis | Native smooth-scroll is janky |
| Physics | Matter.js | Best 2D physics for browsers |
| Math formulas | KaTeX | MathJax is 10x slower |

### Don't Use Libraries For

- Simple one-off DOM updates (use `querySelector`)
- Basic CSS transitions (use native CSS)
- Fetch requests (use native `fetch`)
- Heavy frameworks (no React, Vue, Angularuse Alpine.js instead)

## Design Philosophy

### Bret Victor Principles
- **Direct manipulation**: Users drag, adjust, explore—not just read
- **Immediate feedback**: Every interaction shows instant results
- **Multiple representations**: Same concept shown visually, symbolically, numerically
- **Reduce hidden state**: Make the invisible visible

### Steven Wittens Principles  
- **Mathematical elegance**: Beauty as epistemological signal
- **Smooth 60fps**: Animation quality matters—use GSAP or requestAnimationFrame
- **The "wow" factor**: Create moments that make users lean in (Three.js shaders, use.gpu)
- **Geometric honesty**: Visual structure reflects mathematical structure

### Bartosz Ciechanowski Principles
- **Scroll-driven narrative**: Understanding builds through vertical journey (GSAP ScrollTrigger)
- **Interaction before formalization**: Play first, equations second
- **Long-form depth**: Comprehensive coverage, not summaries
- **Every equation visualized**: No symbol without geometric meaning (D3 + KaTeX)

## Implementation Patterns

### Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Essay Title]</title>
  
  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
  
  <!-- Libraries -->
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
  
  <style>
    /* Modern CSS with nesting */
    .card {
      background: white;
      border-radius: 24px;
      
      &:hover { transform: translateY(-4px); }
      & h2 { color: var(--accent); }
    }
  </style>
</head>
<body>
  <!-- Alpine.js handles all UI state -->
  <div x-data="essayState()">
    <!-- Progress bar bound to scroll -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: scrollProgress + '%' }"></div>
    </div>
    
    <!-- Mode toggles -->
    <div class="mode-switcher">
      <button @click="mode = 'intuition'" :class="{ active: mode === 'intuition' }">Intuition</button>
      <button @click="mode = 'rigor'" :class="{ active: mode === 'rigor' }">Rigor</button>
    </div>
    
    <!-- Content sections with transitions -->
    <section x-show="mode === 'intuition'" x-transition.duration.300ms>
      ...
    </section>
  </div>
  
  <script>
    // Alpine.js state
    document.addEventListener('alpine:init', () => {
      Alpine.data('essayState', () => ({
        mode: 'intuition',
        scrollProgress: 0,
        sliderValue: 50,
        
        init() {
          // GSAP ScrollTrigger setup
          gsap.registerPlugin(ScrollTrigger);
          
          ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: self => this.scrollProgress = self.progress * 100
          });
        }
      }));
    });
  </script>
</body>
</html>
```

### Alpine.js Patterns

**Slider with Live Visualization:**
```html
<div x-data="{ n: 5 }" x-init="$watch('n', val => updateViz(val))">
  <input type="range" x-model="n" min="1" max="20">
  <span x-text="'n = ' + n"></span>
  <svg id="viz"><!-- D3 updates this --></svg>
</div>
```

**Step Navigation:**
```html
<div x-data="{ step: 0, steps: ['Base Case', 'Hypothesis', 'Induction', 'QED'] }">
  <div class="step-nav">
    <template x-for="(s, i) in steps">
      <button @click="step = i" :class="{ active: step === i }" x-text="i + 1"></button>
    </template>
  </div>
  <div class="step-content">
    <h3 x-text="steps[step]"></h3>
  </div>
</div>
```

**Accordion Sections:**
```html
<div x-data="{ open: null }">
  <template x-for="(section, i) in sections">
    <div class="accordion">
      <button @click="open = open === i ? null : i" x-text="section.title"></button>
      <div x-show="open === i" x-collapse>
        <p x-text="section.content"></p>
      </div>
    </div>
  </template>
</div>
```

### Typography Stack

```css
/* Display/Headers: Elegant serif */
font-family: 'Crimson Pro', 'Georgia', serif;

/* Body text: Clean sans-serif */
font-family: 'DM Sans', sans-serif;

/* Code/Math: Monospace */
font-family: 'JetBrains Mono', monospace;
```

### Color Systems

```css
:root {
  --stage-1: #E8A838;  /* intuitive/warm */
  --stage-2: #4A6FA5;  /* rigorous/cool */
  --stage-3: #6B8E6B;  /* synthesis/balanced */
  --text-primary: #1a1a2e;
  --text-secondary: #4a4a6a;
  --text-muted: #8a8aaa;
}
```

### GSAP ScrollTrigger Patterns

```javascript
// Fade in sections as they enter viewport
gsap.utils.toArray('.reveal').forEach(el => {
  gsap.from(el, {
    y: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    }
  });
});

// Pin a visualization while scrolling through explanations
ScrollTrigger.create({
  trigger: '.visualization-container',
  start: 'top top',
  end: '+=2000',
  pin: true,
  onUpdate: self => updateVisualization(self.progress)
});

// Scrub animation tied to scroll position
gsap.to('.progress-indicator', {
  width: '100%',
  ease: 'none',
  scrollTrigger: {
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true
  }
});
```

### D3 Visualization Patterns

```javascript
// Responsive SVG with scales
const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3.select('#chart')
  .append('svg')
  .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

// Animated transitions
svg.selectAll('circle')
  .data(newData)
  .join(
    enter => enter.append('circle')
      .attr('cx', d => x(d.x))
      .attr('cy', height)
      .attr('r', 0)
      .call(enter => enter.transition().duration(750)
        .attr('cy', d => y(d.y))
        .attr('r', 5)),
    update => update.call(update => update.transition().duration(750)
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))),
    exit => exit.call(exit => exit.transition().duration(750)
      .attr('r', 0)
      .remove())
  );
```

### Three.js Quick Setup

```javascript
// Minimal Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Responsive resize
new ResizeObserver(() => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}).observe(container);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  // Update objects
  renderer.render(scene, camera);
}
animate();
```

### Matter.js Physics

```javascript
// Create engine and world
const engine = Matter.Engine.create();
const world = engine.world;
const render = Matter.Render.create({
  element: container,
  engine: engine,
  options: { wireframes: false, background: 'transparent' }
});

// Add bodies
const ball = Matter.Bodies.circle(200, 100, 30, { restitution: 0.8 });
const ground = Matter.Bodies.rectangle(300, 580, 600, 40, { isStatic: true });
Matter.Composite.add(world, [ball, ground]);

// Mouse interaction
const mouse = Matter.Mouse.create(render.canvas);
const mouseConstraint = Matter.MouseConstraint.create(engine, { mouse });
Matter.Composite.add(world, mouseConstraint);

Matter.Render.run(render);
Matter.Runner.run(Matter.Runner.create(), engine);
```

## Quality Checklist

Before delivering:

- [ ] All sources properly synthesized (not just summarized)
- [ ] At least 3 interactive elements with direct manipulation
- [ ] Library choices justified (D3 for data, Three.js for 3D, GSAP for animation, etc.)
- [ ] CDN scripts loaded from reliable sources (jsdelivr, cdnjs, unpkg)
- [ ] Scroll-driven narrative with GSAP ScrollTrigger or equivalent
- [ ] Typography hierarchy clear (h1 > h2 > body > caption)
- [ ] Color system semantically meaningful
- [ ] Mobile responsive (CSS Grid/Flexbox, touch events for interactions)
- [ ] 60fps animations (use `will-change`, avoid layout thrashing)
- [ ] Source attribution included
- [ ] Single file with CDN dependencies only

## Anti-Patterns to Avoid

- **Static walls of text** — Always add interaction opportunities
- **Generic "AI slop" aesthetics** — No Inter font, no purple gradients, no generic cards
- **Heavy frameworks** — No React, Vue, Angular; use vanilla JS + specialized libraries
- **Library overuse** — Don't load D3 to change a single element's color
- **Backwards compatibility** — Target modern browsers, use ES2022+, CSS nesting
- **Summary without synthesis** — Sources should combine, not concatenate
- **Interactions without purpose** — Every slider should reveal insight
- **Blocking script loads** — Use `defer` or `type="module"` for scripts
- **Missing touch support** — Physics and drag interactions need touch events
- **Forgetting cleanup** — Remove event listeners, cancel animation frames on unmount
