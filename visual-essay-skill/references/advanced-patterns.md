# Advanced Patterns Reference

Extended patterns for complex interactive essays. Load this file when building essays with multiple interactive sections or complex visualizations.

## Alpine.js Advanced Patterns

### Global State with Alpine.store

```javascript
// Define global state accessible from any component
document.addEventListener('alpine:init', () => {
  Alpine.store('essay', {
    currentSection: 0,
    scrollProgress: 0,
    darkMode: false,
    
    setSection(n) {
      this.currentSection = n;
      // Trigger GSAP animation
      gsap.to(window, { scrollTo: `#section-${n}`, duration: 1 });
    }
  });
});

// Access from any element
<button @click="$store.essay.setSection(2)">Jump to Section 2</button>
<span x-text="$store.essay.scrollProgress.toFixed(0) + '%'"></span>
```

### Alpine + D3 Integration

```html
<div x-data="forceGraph()" x-init="init()">
  <svg x-ref="svg" width="600" height="400"></svg>
  <input type="range" x-model="chargeStrength" @input="updateForce()" min="-500" max="0">
</div>

<script>
function forceGraph() {
  return {
    chargeStrength: -200,
    simulation: null,
    
    init() {
      const svg = d3.select(this.$refs.svg);
      this.simulation = d3.forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(this.chargeStrength))
        .force('center', d3.forceCenter(300, 200));
      // ... bindings
    },
    
    updateForce() {
      this.simulation.force('charge').strength(this.chargeStrength);
      this.simulation.alpha(0.5).restart();
    }
  };
}
</script>
```

### Reactive Computed Values

```html
<div x-data="{ 
  n: 5, 
  get sumOfSquares() { return this.n * (this.n + 1) * (2 * this.n + 1) / 6; },
  get approximation() { return Math.pow(this.n, 3) / 3; },
  get accuracy() { return (this.approximation / this.sumOfSquares * 100).toFixed(1); }
}">
  <input type="range" x-model="n" min="1" max="20">
  <p>Exact: <span x-text="sumOfSquares"></span></p>
  <p>Approximation: <span x-text="approximation.toFixed(1)"></span></p>
  <p>Accuracy: <span x-text="accuracy + '%'"></span></p>
</div>
```

## Lenis + GSAP Integration

### Smooth Scroll with ScrollTrigger

```javascript
// Initialize Lenis
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

// Connect Lenis to GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Now ScrollTrigger works with Lenis smooth scroll
gsap.from('.reveal', {
  y: 100,
  opacity: 0,
  scrollTrigger: {
    trigger: '.reveal',
    start: 'top 80%',
  }
});
```

### Scroll-to with Lenis

```javascript
// Smooth scroll to element
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    lenis.scrollTo(target, { offset: -100, duration: 1.5 });
  });
});
```

## GSAP ScrollTrigger Advanced Patterns

### Pinned Visualization with Scrubbed Animation

```javascript
// Pin a visualization while user scrolls through 3 "pages" of content
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.visualization-section',
    start: 'top top',
    end: '+=3000', // 3000px of scroll
    pin: true,
    scrub: 1, // Smooth 1-second lag
    snap: {
      snapTo: [0, 0.33, 0.66, 1], // Snap to stages
      duration: 0.3,
      ease: 'power2.inOut'
    }
  }
});

// Add animations to timeline
tl.to('.stage-1', { opacity: 0 }, 0.33)
  .from('.stage-2', { opacity: 0, y: 50 }, 0.33)
  .to('.stage-2', { opacity: 0 }, 0.66)
  .from('.stage-3', { opacity: 0, y: 50 }, 0.66);
```

### Horizontal Scroll Section

```javascript
const sections = gsap.utils.toArray('.horizontal-panel');

gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: '.horizontal-container',
    pin: true,
    scrub: 1,
    snap: 1 / (sections.length - 1),
    end: () => '+=' + document.querySelector('.horizontal-container').offsetWidth
  }
});
```

### Progress-Linked Updates

```javascript
ScrollTrigger.create({
  trigger: '.interactive-section',
  start: 'top center',
  end: 'bottom center',
  onUpdate: self => {
    // self.progress goes from 0 to 1
    updateVisualization(self.progress);
    
    // Update progress indicator
    gsap.to('.progress-bar', {
      width: `${self.progress * 100}%`,
      duration: 0.1,
      ease: 'none'
    });
  }
});
```

## D3 Advanced Patterns

### Force-Directed Graph with Drag

```javascript
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id(d => d.id).distance(100))
  .force('charge', d3.forceManyBody().strength(-300))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide().radius(30));

const node = svg.selectAll('.node')
  .data(nodes)
  .join('circle')
  .attr('class', 'node')
  .attr('r', 20)
  .call(d3.drag()
    .on('start', (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on('drag', (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on('end', (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }));

simulation.on('tick', () => {
  link
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);
  
  node
    .attr('cx', d => d.x)
    .attr('cy', d => d.y);
});
```

### Animated Path Drawing

```javascript
const path = svg.append('path')
  .datum(data)
  .attr('d', line)
  .attr('fill', 'none')
  .attr('stroke', '#E8A838')
  .attr('stroke-width', 2);

// Get total length for animation
const totalLength = path.node().getTotalLength();

path
  .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
  .attr('stroke-dashoffset', totalLength)
  .transition()
  .duration(2000)
  .ease(d3.easeLinear)
  .attr('stroke-dashoffset', 0);
```

### Voronoi Interaction Layer

```javascript
// Create voronoi for efficient mouse detection
const voronoi = d3.Delaunay.from(points, d => x(d.x), d => y(d.y)).voronoi([0, 0, width, height]);

svg.append('g')
  .selectAll('path')
  .data(points)
  .join('path')
  .attr('d', (d, i) => voronoi.renderCell(i))
  .attr('fill', 'transparent')
  .on('mouseenter', (event, d) => showTooltip(d))
  .on('mouseleave', hideTooltip);
```

## Three.js Patterns

### Responsive Canvas with Pixel Ratio

```javascript
function resizeRenderer() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  renderer.setSize(width, height);
  renderer.setPixelRatio(pixelRatio);
}

// Use ResizeObserver for container-based resizing
new ResizeObserver(resizeRenderer).observe(container);
```

### Orbit Controls

```javascript
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Required for damping
  renderer.render(scene, camera);
}
```

### Custom Shader Material

```javascript
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#E8A838') }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    
    void main() {
      float wave = sin(vUv.x * 10.0 + uTime) * 0.5 + 0.5;
      gl_FragColor = vec4(uColor * wave, 1.0);
    }
  `
});

// Update in animation loop
function animate(time) {
  material.uniforms.uTime.value = time * 0.001;
  // ...
}
```

## Matter.js Patterns

### Constrained Drag with Boundaries

```javascript
// Keep bodies within bounds
Matter.Events.on(engine, 'beforeUpdate', () => {
  Matter.Composite.allBodies(world).forEach(body => {
    if (!body.isStatic) {
      const { x, y } = body.position;
      const bounded = {
        x: Math.max(50, Math.min(width - 50, x)),
        y: Math.max(50, Math.min(height - 50, y))
      };
      Matter.Body.setPosition(body, bounded);
    }
  });
});
```

### Custom Renderer (Canvas 2D)

```javascript
// Skip Matter.Render, use your own
function customRender() {
  const bodies = Matter.Composite.allBodies(world);
  
  ctx.clearRect(0, 0, width, height);
  
  bodies.forEach(body => {
    ctx.beginPath();
    const vertices = body.vertices;
    ctx.moveTo(vertices[0].x, vertices[0].y);
    vertices.slice(1).forEach(v => ctx.lineTo(v.x, v.y));
    ctx.closePath();
    
    ctx.fillStyle = body.render?.fillStyle || '#E8A838';
    ctx.fill();
  });
  
  requestAnimationFrame(customRender);
}
```

## Modern CSS Patterns

### Container Queries

```css
.card-container {
  container-type: inline-size;
}

.card {
  display: grid;
  grid-template-columns: 1fr;
  
  @container (min-width: 400px) {
    grid-template-columns: 200px 1fr;
  }
}
```

### CSS Nesting with Dark Mode

```css
.demo-card {
  background: white;
  color: var(--text-primary);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.1);
  }
  
  & h3 {
    color: var(--accent);
  }
  
  @media (prefers-color-scheme: dark) {
    background: #1a1a2e;
    color: #f0f0f0;
  }
}
```

### Scroll-Driven Animations (CSS-only)

```css
@keyframes reveal {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}

.reveal {
  animation: reveal linear;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}
```

## Performance Patterns

### Debounced Resize Handler

```javascript
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

window.addEventListener('resize', debounce(handleResize, 100));
```

### RequestAnimationFrame Throttle

```javascript
let ticking = false;

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateVisualization();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
```

### Intersection Observer for Lazy Loading

```javascript
const lazyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      initVisualization(el);
      lazyObserver.unobserve(el);
    }
  });
}, { rootMargin: '200px' }); // Start loading before visible

document.querySelectorAll('.lazy-viz').forEach(el => lazyObserver.observe(el));
```
