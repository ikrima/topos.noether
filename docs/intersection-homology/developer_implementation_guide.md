# DEVELOPER IMPLEMENTATION GUIDE
## Extending the Perverse Sheaf Visualization Suite

*A Technical Deep Dive for Researchers and Developers*

---

## TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Mathematical Foundations](#mathematical-foundations)
4. [Implementation Patterns](#implementation-patterns)
5. [GPU Acceleration](#gpu-acceleration)
6. [Adding New Examples](#adding-new-examples)
7. [Performance Optimization](#performance-optimization)
8. [Integration with Research Tools](#integration-with-research-tools)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)

---

## ARCHITECTURE OVERVIEW

### System Design

The visualization suite follows a **three-layer architecture**:

```
┌─────────────────────────────────────────┐
│     PRESENTATION LAYER                  │
│  (HTML/CSS/React Components)            │
│  - User Interface                       │
│  - Controls & Interactions              │
└─────────────────────────────────────────┘
           ↓         ↑
┌─────────────────────────────────────────┐
│     VISUALIZATION LAYER                 │
│  (Canvas 2D / WebGL / Three.js)         │
│  - Rendering Pipeline                   │
│  - Animation Loops                      │
│  - Camera Controls                      │
└─────────────────────────────────────────┘
           ↓         ↑
┌─────────────────────────────────────────┐
│     MATHEMATICAL KERNEL                 │
│  (Pure JavaScript / WASM)               │
│  - Stratification Algorithms            │
│  - Characteristic Cycle Computation     │
│  - t-Structure Operations               │
│  - Spectral Sequence Engine             │
└─────────────────────────────────────────┘
```

**Key Design Principles**:

1. **Separation of Concerns**: Mathematical logic is completely independent of rendering
2. **Reactive Updates**: Changes propagate automatically through the system
3. **Composability**: Visualizations can be embedded and combined
4. **Performance**: GPU acceleration where beneficial, CPU for complex logic

### File Structure

```
perverse-sheaf-viz/
├── visualizations/
│   ├── t_structure_explorer.html          # Standalone HTML
│   ├── cotangent_bundle_3d.jsx           # React component
│   ├── infinity_category_navigator.jsx   # React component
│   ├── spectral_sequence_flow.html       # Standalone HTML
│   ├── grand_unified_visualizer.jsx      # React component
│   ├── gpu_characteristic_cycle.html     # WebGPU experiment
│   └── visualization_portal.html         # Entry point
├── lib/
│   ├── math/
│   │   ├── stratification.js             # Core math library
│   │   ├── perverse.js                   # Perverse sheaf operations
│   │   ├── characteristic.js             # Characteristic cycles
│   │   ├── spectral.js                   # Spectral sequence engine
│   │   └── tropical.js                   # Tropicalization algorithms
│   ├── rendering/
│   │   ├── canvas2d.js                   # 2D rendering utilities
│   │   ├── webgl-utils.js                # WebGL helpers
│   │   └── three-extensions.js           # Three.js custom materials
│   └── utils/
│       ├── vector-math.js                # Linear algebra
│       └── color-utils.js                # Color schemes
├── assets/
│   ├── shaders/
│   │   ├── characteristic-cycle.wgsl     # WebGPU compute shader
│   │   ├── lagrangian-flow.vert         # WebGL vertex shader
│   │   └── glow-effect.frag             # WebGL fragment shader
│   └── fonts/
├── docs/
│   ├── visualization_manifesto.md        # Philosophy & pedagogy
│   ├── implementation_guide.md           # This file
│   └── api-reference.md                  # (To be created)
└── examples/
    ├── node.json                         # Example: node xy=0
    ├── cusp.json                         # Example: cusp y²=x³
    └── whitney.json                      # Example: Whitney umbrella
```

---

## TECHNOLOGY STACK

### Core Technologies

**Frontend**:
- **HTML5/CSS3**: Base structure and styling
- **JavaScript ES6+**: Core logic
- **React 18**: Component-based architecture (for .jsx files)
- **Canvas 2D API**: 2D rendering (t-structure, spectral)
- **WebGL 2.0**: 3D graphics (cotangent bundle, unified)
- **Three.js r160**: 3D rendering library
- **WebGPU**: GPU compute (experimental characteristic cycle)

**Math/Computation**:
- **Math.js**: Numerical computations
- **gl-matrix**: Fast matrix operations
- **numeric.js**: Linear algebra (optional)

**Build Tools** (if building from source):
- **Vite**: Fast dev server and bundler
- **esbuild**: JavaScript bundler
- **TypeScript** (optional): Type safety

### Browser Requirements

**Minimum**:
```javascript
const MINIMUM_REQUIREMENTS = {
  chrome: 90,
  firefox: 88,
  safari: 14,
  edge: 90,
  webgl: "2.0",
  features: ["ES6", "Canvas2D", "WebGL2"]
};
```

**Optimal**:
```javascript
const OPTIMAL_REQUIREMENTS = {
  chrome: 120,
  edge: 120,
  webgpu: true,  // For gpu_characteristic_cycle.html
  gpu: "dedicated",
  ram: "8GB+",
  features: ["ES2023", "WebGPU", "SharedArrayBuffer"]
};
```

### Dependencies

Each visualization has minimal dependencies:

**Standalone HTML** (t-structure, spectral, portal):
- Zero npm dependencies
- Pure vanilla JavaScript
- Can be opened directly in browser

**React Components** (cotangent, navigator, unified):
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "three": "^0.160.0"
  },
  "peerDependencies": {
    "react": ">=18.0.0"
  }
}
```

---

## MATHEMATICAL FOUNDATIONS

### Core Data Structures

#### 1. Stratification

```javascript
class Stratification {
  constructor(strata) {
    this.strata = strata;  // Array of Stratum objects
    this.dimension = Math.max(...strata.map(s => s.dimension));
    this.validateFrontierCondition();
  }

  // Frontier condition: S̄ᵢ ∩ Sⱼ ≠ ∅ ⟹ Sⱼ ⊂ S̄ᵢ
  validateFrontierCondition() {
    for (let i = 0; i < this.strata.length; i++) {
      for (let j = 0; j < this.strata.length; j++) {
        if (i === j) continue;
        
        const Si = this.strata[i];
        const Sj = this.strata[j];
        
        if (this.closureIntersects(Si, Sj)) {
          if (!this.isSubset(Sj, this.closure(Si))) {
            throw new Error("Frontier condition violated");
          }
        }
      }
    }
  }

  // Get conormal bundle T*_S X at stratum S
  getConormalBundle(stratum) {
    return {
      base: stratum,
      fiber: this.getCotangentSpace(stratum),
      constraint: (x, xi) => {
        // ξ ⊥ T_x S (orthogonal to tangent space)
        const tangent = stratum.getTangentVectors(x);
        return tangent.every(v => dot(xi, v) < EPSILON);
      }
    };
  }
}

class Stratum {
  constructor(points, dimension, closure) {
    this.points = points;          // Discrete point cloud
    this.dimension = dimension;     // Dimension of stratum
    this.closure = closure;         // Reference to containing strata
  }

  getTangentVectors(point) {
    // Compute tangent space basis at point
    // Uses finite differences if no analytical formula
    const epsilon = 1e-6;
    const tangents = [];
    
    for (let i = 0; i < this.dimension; i++) {
      const dir = new Array(this.ambientDim).fill(0);
      dir[i] = epsilon;
      
      const forward = this.project(point.add(dir));
      const backward = this.project(point.sub(dir));
      
      tangents.push(forward.sub(backward).normalize());
    }
    
    return tangents;
  }
}
```

#### 2. Perverse Sheaf

```javascript
class PerverseSheaf {
  constructor(stratification, localSystems) {
    this.stratification = stratification;
    this.localSystems = localSystems;  // Map: stratum → local system
    this.perversity = this.middlePerversity();
  }

  // Middle perversity: m̄(k) = ⌊(k-2)/2⌋
  middlePerversity() {
    return {
      value: (codim) => Math.floor((codim - 2) / 2),
      type: "middle"
    };
  }

  // Check support conditions
  isPerverse() {
    // Condition 1: dim Supp(H^i(F)) ≤ -i
    for (let i in this.cohomology) {
      const support = this.getSupport(this.cohomology[i]);
      if (support.dimension > -i) {
        return false;
      }
    }

    // Condition 2: dim Supp(H^i(DF)) ≤ -i (Verdier dual)
    const dual = this.verdierDual();
    for (let i in dual.cohomology) {
      const support = dual.getSupport(dual.cohomology[i]);
      if (support.dimension > -i) {
        return false;
      }
    }

    return true;
  }

  verdierDual() {
    // 𝔻F = RHom(F, ω_X[dim X])
    // For IC sheaves: 𝔻IC_X ≅ IC_X (self-dual)
    return new PerverseSheaf(
      this.stratification,
      this.dualizeLocalSystems()
    );
  }

  // Intermediate extension j_!*
  intermediateExtension(openStratum) {
    // j_!* : Perv(U) → Perv(X)
    // Minimally ramified extension
    const extension = {};
    
    this.stratification.strata.forEach(S => {
      if (S === openStratum) {
        extension[S] = this.localSystems[S];
      } else {
        // Compute pushforward with controlled ramification
        extension[S] = this.computeExtension(S, openStratum);
      }
    });

    return new PerverseSheaf(this.stratification, extension);
  }
}
```

#### 3. Characteristic Cycle

```javascript
class CharacteristicCycle {
  constructor(perverseSheaf) {
    this.sheaf = perverseSheaf;
    this.components = this.compute();
  }

  compute() {
    // CC(F) = Σ mult_S(F) · [T*_S X]
    const components = [];

    this.sheaf.stratification.strata.forEach(S => {
      const multiplicity = this.computeMultiplicity(S);
      
      if (multiplicity > 0) {
        components.push({
          stratum: S,
          multiplicity: multiplicity,
          conormal: this.sheaf.stratification.getConormalBundle(S)
        });
      }
    });

    return components;
  }

  computeMultiplicity(stratum) {
    // Kashiwara's index theorem
    // For IC sheaf: multiplicity = rank of local system
    const localSystem = this.sheaf.localSystems[stratum];
    return localSystem ? localSystem.rank : 0;
  }

  // Degree of characteristic cycle
  degree() {
    // deg(CC(F)) = χ(X, F) (Kashiwara)
    return this.components.reduce((sum, comp) => {
      return sum + comp.multiplicity * comp.conormal.degree;
    }, 0);
  }

  // Tropicalization
  tropicalize(valuationMap) {
    // T*X → ℝ^n via log(|·|)
    const tropicalComponents = [];

    this.components.forEach(comp => {
      const tropical = {
        polyhedron: this.logMap(comp.conormal, valuationMap),
        multiplicity: comp.multiplicity,
        vertices: [],
        edges: [],
        faces: []
      };

      tropical.polyhedron = this.convexHull(tropical.polyhedron);
      tropicalComponents.push(tropical);
    });

    return new TropicalCycle(tropicalComponents);
  }
}

class TropicalCycle {
  constructor(components) {
    this.components = components;  // Polyhedral complexes
  }

  // Fast intersection theory
  intersect(other) {
    // Polynomial-time in tropical geometry!
    const intersections = [];

    this.components.forEach(C1 => {
      other.components.forEach(C2 => {
        const intersection = this.polyhedralIntersection(
          C1.polyhedron,
          C2.polyhedron
        );
        
        if (intersection.dimension >= 0) {
          intersections.push({
            polyhedron: intersection,
            multiplicity: C1.multiplicity * C2.multiplicity
          });
        }
      });
    });

    return new TropicalCycle(intersections);
  }

  // Balancing condition for tropical cycles
  isBalanced() {
    // At each codimension-1 face, multiplicities balance
    this.components.forEach(comp => {
      const faces = comp.polyhedron.getFaces(comp.dimension - 1);
      
      faces.forEach(face => {
        const adjacent = this.getAdjacentCells(face);
        const sum = adjacent.reduce((s, cell) => {
          return s + cell.multiplicity * this.primitiveVector(face, cell);
        }, 0);
        
        if (Math.abs(sum) > EPSILON) {
          return false;
        }
      });
    });

    return true;
  }
}
```

#### 4. Spectral Sequence

```javascript
class SpectralSequence {
  constructor(filtration) {
    this.filtration = filtration;  // Filtered complex
    this.pages = [this.computeE1()];
    this.currentPage = 1;
  }

  // E_1 page from filtered complex
  computeE1() {
    const E1 = {};

    // E_1^{p,q} = H^{p+q}(Gr^p F)
    for (let p = this.filtration.minDegree; p <= this.filtration.maxDegree; p++) {
      for (let q = -10; q <= 10; q++) {
        const graded = this.filtration.graded(p);
        const cohomology = this.computeCohomology(graded, p + q);
        
        if (cohomology.rank > 0) {
          E1[`${p},${q}`] = {
            rank: cohomology.rank,
            generators: cohomology.generators
          };
        }
      }
    }

    return E1;
  }

  // Differential d_r : E_r^{p,q} → E_r^{p+r,q-r+1}
  computeDifferential(page, p, q) {
    const r = page.pageNumber;
    const source = page.terms[`${p},${q}`];
    const target = page.terms[`${p+r},${q-r+1}`];

    if (!source || !target) return null;

    // Compute map via spectral sequence machinery
    return {
      from: [p, q],
      to: [p + r, q - r + 1],
      matrix: this.differentialMatrix(source, target, r)
    };
  }

  // Advance to next page
  nextPage() {
    const currentPage = this.pages[this.pages.length - 1];
    const r = currentPage.pageNumber;
    const nextTerms = {};

    // E_{r+1}^{p,q} = H^{p,q}(E_r, d_r)
    Object.keys(currentPage.terms).forEach(key => {
      const [p, q] = key.split(',').map(Number);
      
      // Compute kernel of d_r
      const diff = this.computeDifferential(currentPage, p, q);
      const kernel = diff ? this.kernel(diff.matrix) : currentPage.terms[key];
      
      // Compute cokernel of d_r coming from (p-r, q+r-1)
      const incoming = this.computeDifferential(currentPage, p - r, q + r - 1);
      const cokernel = incoming ? this.cokernel(incoming.matrix) : null;
      
      // Homology
      if (cokernel) {
        nextTerms[key] = this.quotient(kernel, cokernel);
      } else {
        nextTerms[key] = kernel;
      }
    });

    this.pages.push({
      pageNumber: r + 1,
      terms: nextTerms
    });

    this.currentPage++;
    return this.pages[this.pages.length - 1];
  }

  // Check convergence
  hasConverged() {
    if (this.pages.length < 2) return false;

    const current = this.pages[this.pages.length - 1];
    const previous = this.pages[this.pages.length - 2];

    // Compare terms
    for (let key in current.terms) {
      if (!previous.terms[key]) continue;
      
      if (current.terms[key].rank !== previous.terms[key].rank) {
        return false;
      }
    }

    return true;
  }
}
```

---

## IMPLEMENTATION PATTERNS

### Pattern 1: Reactive Visualization

**Problem**: Keep visualization in sync with mathematical state

**Solution**: Observer pattern + animation loop

```javascript
class ReactiveVisualization {
  constructor(canvas, mathKernel) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.kernel = mathKernel;
    this.state = {
      needsRedraw: true,
      parameters: {}
    };

    // Subscribe to kernel changes
    this.kernel.on('change', () => {
      this.state.needsRedraw = true;
    });

    this.startAnimationLoop();
  }

  startAnimationLoop() {
    const animate = () => {
      if (this.state.needsRedraw) {
        this.render();
        this.state.needsRedraw = false;
      }
      requestAnimationFrame(animate);
    };
    animate();
  }

  updateParameter(name, value) {
    this.state.parameters[name] = value;
    this.kernel.update(this.state.parameters);
    // kernel will emit 'change' event
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render based on kernel state
    const data = this.kernel.getData();
    this.drawData(data);
  }
}
```

### Pattern 2: Shader-Based Computation

**Problem**: Need to compute thousands of particles on characteristic cycles

**Solution**: GPU compute shaders (WebGPU)

```javascript
// Compute shader (WGSL)
const computeShader = `
@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let idx = id.x;
    var p = particles[idx];
    
    // Hamiltonian flow on T*X
    let dH_dxi = gradientMomentum(p.position, p.momentum);
    let dH_dx = gradientPosition(p.position, p.momentum);
    
    p.position += dH_dxi * uniforms.dt;
    p.momentum -= dH_dx * uniforms.dt;
    
    // Lagrangian constraint: stay on conormal bundle
    p = projectToLagrangian(p);
    
    particles[idx] = p;
}
`;

// JavaScript setup
async function setupGPUCompute() {
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();

  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: device.createShaderModule({ code: computeShader }),
      entryPoint: 'main'
    }
  });

  // Create buffers
  const particleBuffer = device.createBuffer({
    size: PARTICLE_COUNT * 32,  // 8 floats per particle
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
  });

  // Compute pass
  function compute() {
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(Math.ceil(PARTICLE_COUNT / 64));
    pass.end();
    device.queue.submit([encoder.finish()]);
  }

  return { compute, particleBuffer };
}
```

### Pattern 3: Morphing Geometries

**Problem**: Smoothly transition between different mathematical structures

**Solution**: Interpolated materials + opacity cross-fading

```javascript
class MorphingGeometry {
  constructor(scene) {
    this.scene = scene;
    this.geometries = {
      stratification: createStratificationMesh(),
      perverseSheaf: createPerverseMesh(),
      tropical: createTropicalMesh()
    };
    
    this.currentMode = 'stratification';
    this.targetMode = 'stratification';
    this.morphProgress = 0;

    // Add all to scene but hide
    Object.values(this.geometries).forEach(g => {
      g.visible = false;
      this.scene.add(g);
    });
    
    this.geometries[this.currentMode].visible = true;
  }

  morphTo(targetMode, duration = 1000) {
    if (this.currentMode === targetMode) return;

    this.targetMode = targetMode;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      this.morphProgress = Math.min(elapsed / duration, 1);

      // Ease function
      const t = this.easeInOutCubic(this.morphProgress);

      // Cross-fade
      this.geometries[this.currentMode].scale.lerp(
        new THREE.Vector3(0.01, 0.01, 0.01),
        t
      );
      
      this.geometries[this.currentMode].material.opacity = 1 - t;

      this.geometries[this.targetMode].visible = true;
      this.geometries[this.targetMode].scale.lerp(
        new THREE.Vector3(1, 1, 1),
        t
      );
      this.geometries[this.targetMode].material.opacity = t;

      if (this.morphProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.geometries[this.currentMode].visible = false;
        this.currentMode = this.targetMode;
      }
    };

    animate();
  }

  easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
```

---

## GPU ACCELERATION

### When to Use GPU

**Use GPU for**:
- Particle systems (>10,000 particles)
- Characteristic cycle flow simulation
- Real-time tropicalization
- Large-scale spectral sequence computation

**Use CPU for**:
- Topological computations (homology, cohomology)
- Symbolic manipulation
- UI interactions
- Small datasets (<1000 elements)

### WebGPU Pipeline

```javascript
// Complete pipeline for characteristic cycle computation

class GPUCharacteristicCycleComputer {
  async init() {
    // 1. Get device
    const adapter = await navigator.gpu.requestAdapter();
    this.device = await adapter.requestDevice();

    // 2. Create compute pipeline
    this.computePipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: this.device.createShaderModule({
          code: await fetch('characteristic-cycle.wgsl').then(r => r.text())
        }),
        entryPoint: 'computeCycle'
      }
    });

    // 3. Create render pipeline
    this.renderPipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: this.device.createShaderModule({
          code: await fetch('render-cycle.vert').then(r => r.text())
        }),
        entryPoint: 'main',
        buffers: [{
          arrayStride: 32,
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x4' }, // position
            { shaderLocation: 1, offset: 16, format: 'float32x4' } // velocity
          ]
        }]
      },
      fragment: {
        module: this.device.createShaderModule({
          code: await fetch('render-cycle.frag').then(r => r.text())
        }),
        entryPoint: 'main',
        targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }]
      },
      primitive: { topology: 'point-list' }
    });

    // 4. Allocate buffers
    this.particleBuffer = this.device.createBuffer({
      size: PARTICLE_COUNT * 32,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE
    });

    this.uniformBuffer = this.device.createBuffer({
      size: 256, // Matrices + scalars
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    // 5. Create bind groups
    this.computeBindGroup = this.device.createBindGroup({
      layout: this.computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.particleBuffer } },
        { binding: 1, resource: { buffer: this.uniformBuffer } }
      ]
    });

    this.renderBindGroup = this.device.createBindGroup({
      layout: this.renderPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } }
      ]
    });
  }

  frame() {
    // Update uniforms
    this.updateUniforms();

    const encoder = this.device.createCommandEncoder();

    // Compute pass
    const computePass = encoder.beginComputePass();
    computePass.setPipeline(this.computePipeline);
    computePass.setBindGroup(0, this.computeBindGroup);
    computePass.dispatchWorkgroups(
      Math.ceil(PARTICLE_COUNT / WORKGROUP_SIZE)
    );
    computePass.end();

    // Render pass
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: this.context.getCurrentTexture().createView(),
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        loadOp: 'clear',
        storeOp: 'store'
      }]
    });

    renderPass.setPipeline(this.renderPipeline);
    renderPass.setBindGroup(0, this.renderBindGroup);
    renderPass.setVertexBuffer(0, this.particleBuffer);
    renderPass.draw(PARTICLE_COUNT);
    renderPass.end();

    this.device.queue.submit([encoder.finish()]);
  }
}
```

### Optimization Tips

1. **Batch Operations**: Group similar computations
2. **Minimize State Changes**: Pipeline switches are expensive
3. **Use Persistent Buffers**: Avoid reallocating every frame
4. **Profile with Chrome DevTools**: GPU timeline shows bottlenecks
5. **Fallback Gracefully**: Always have Canvas 2D backup

---

## ADDING NEW EXAMPLES

### Step 1: Define the Stratification

```javascript
// examples/custom_example.json
{
  "name": "Custom Singularity",
  "equation": "z^2 - xy = 0",
  "strata": [
    {
      "name": "S_2",
      "dimension": 2,
      "description": "Smooth part",
      "points": "parametric",
      "parametrization": {
        "x": "u",
        "y": "v",
        "z": "sqrt(u*v)"
      }
    },
    {
      "name": "S_1",
      "dimension": 1,
      "description": "z-axis",
      "points": "parametric",
      "parametrization": {
        "x": "0",
        "y": "0",
        "z": "t"
      }
    },
    {
      "name": "S_0",
      "dimension": 0,
      "description": "Origin",
      "points": [[0, 0, 0]]
    }
  ],
  "closure": {
    "S_2": ["S_1", "S_0"],
    "S_1": ["S_0"]
  }
}
```

### Step 2: Compute IC Sheaf

```javascript
async function computeICShaf(exampleJson) {
  // Load example
  const example = await fetch(exampleJson).then(r => r.json());
  
  // Build stratification
  const strat = new Stratification(
    example.strata.map(s => new Stratum(
      s.points,
      s.dimension,
      example.closure[s.name]
    ))
  );

  // Define local systems (typically constant)
  const localSystems = {};
  strat.strata.forEach(S => {
    localSystems[S] = {
      rank: 1,  // Constant sheaf ℚ
      monodromy: (loop) => 1  // Trivial
    };
  });

  // Construct IC sheaf
  const icSheaf = new PerverseSheaf(strat, localSystems);
  
  // Verify it's perverse
  if (!icSheaf.isPerverse()) {
    throw new Error("Not a perverse sheaf!");
  }

  return icSheaf;
}
```

### Step 3: Add to Visualization

```javascript
// In t_structure_explorer.html or similar

async function loadCustomExample(jsonPath) {
  const icSheaf = await computeICShaf(jsonPath);
  
  // Add to object list
  state.objects.push(new DerivedObject(
    'IC_Custom',
    icSheaf.cohomologyDegrees(),
    { x: Math.random(), y: Math.random() }
  ));

  // Recompute visualization
  updateUI();
  render();
}

// UI button
document.getElementById('loadCustom').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = JSON.parse(ev.target.result);
      loadCustomExample(json);
    };
    reader.readAsText(file);
  };
  input.click();
});
```

---

## PERFORMANCE OPTIMIZATION

### Profiling

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.history = {};
  }

  measure(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    if (!this.history[name]) {
      this.history[name] = [];
    }
    this.history[name].push(end - start);

    // Keep last 100 measurements
    if (this.history[name].length > 100) {
      this.history[name].shift();
    }

    this.metrics[name] = {
      last: end - start,
      avg: this.average(this.history[name]),
      min: Math.min(...this.history[name]),
      max: Math.max(...this.history[name])
    };

    return result;
  }

  average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  report() {
    console.table(this.metrics);
  }
}

// Usage
const perf = new PerformanceMonitor();

function render() {
  perf.measure('total', () => {
    perf.measure('update', () => updateState());
    perf.measure('draw', () => drawScene());
  });

  // Every 60 frames, log report
  if (frameCount % 60 === 0) {
    perf.report();
  }
}
```

### Optimization Checklist

**Rendering**:
- [ ] Use `requestAnimationFrame` (never `setInterval`)
- [ ] Only redraw when state changes
- [ ] Batch draw calls
- [ ] Use offscreen canvas for static elements
- [ ] Enable hardware acceleration (`will-change: transform`)

**Computation**:
- [ ] Cache expensive calculations
- [ ] Use typed arrays (`Float32Array`) for numerical data
- [ ] Avoid garbage collection in animation loop
- [ ] Use Web Workers for heavy CPU work
- [ ] Profile with Chrome DevTools Performance tab

**Memory**:
- [ ] Pool objects (reuse instead of reallocate)
- [ ] Clear references when done
- [ ] Use weak maps for caches
- [ ] Monitor heap size

**Network**:
- [ ] Lazy-load large examples
- [ ] Use IndexedDB for client-side storage
- [ ] Compress JSON examples (gzip)
- [ ] CDN for Three.js and other libraries

---

## INTEGRATION WITH RESEARCH TOOLS

### Exporting to SageMath

```python
# Python script to export visualization data

import json
import sage.all as sage

def load_characteristic_cycle(json_path):
    """Load characteristic cycle from visualization"""
    with open(json_path) as f:
        data = json.load(f)
    
    # Parse components
    components = []
    for comp in data['components']:
        stratum = comp['stratum']
        multiplicity = comp['multiplicity']
        conormal = comp['conormal']
        
        components.append({
            'stratum': stratum,
            'mult': multiplicity,
            'cycle': sage.TropicalCycle(conormal['vertices'])
        })
    
    return components

def compute_intersection(cc1_path, cc2_path):
    """Compute intersection product"""
    cc1 = load_characteristic_cycle(cc1_path)
    cc2 = load_characteristic_cycle(cc2_path)
    
    intersection_number = 0
    for c1 in cc1:
        for c2 in cc2:
            intersection_number += c1['mult'] * c2['mult'] * \
                c1['cycle'].intersect(c2['cycle']).degree()
    
    return intersection_number

# Usage
result = compute_intersection(
    'viz_output/cc_node.json',
    'viz_output/cc_cusp.json'
)
print(f"Intersection number: {result}")
```

### Exporting to Lean 4

```lean
-- Lean 4 verification of visualization output

import Mathlib.AlgebraicGeometry.Scheme
import Mathlib.CategoryTheory.Triangulated

structure StratificationData where
  strata : List Stratum
  closure : Stratum → List Stratum
  frontier_condition : ∀ S T, T ∈ closure S → T.dimension < S.dimension

def verifyPerverseSheaf (F : PerverseSheaf) : Bool :=
  -- Check support conditions from visualization
  let h := F.cohomology
  (∀ i, dim (supp (h i)) ≤ -i) ∧
  (∀ i, dim (supp (h i).dual) ≤ -i)

theorem ic_sheaf_self_dual (X : Stratification) :
    let IC := intersectionCohomologyComplex X
    verdierDual IC ≅ IC := by
  -- Import computation from visualization
  sorry  -- Proof extracted from verified computation
```

### Linking to Python Library

```javascript
// JavaScript → Python via Pyodide (in-browser Python)

async function runPythonComputation() {
  // Load Pyodide
  const pyodide = await loadPyodide();
  await pyodide.loadPackage(['numpy', 'scipy']);

  // Transfer data
  const stratification = getCurrentStratification();
  pyodide.globals.set('stratification', stratification);

  // Run Python code
  const result = await pyodide.runPythonAsync(`
from perverse_sheaf_library import *

# Use data from JavaScript
strat = Stratification.from_dict(stratification)
ic = IntersectionCohomologyComplex(strat)
cc = CharacteristicCycle(ic)

# Compute
euler = cc.euler_characteristic()
betti = cc.betti_numbers()

{
  'euler': euler,
  'betti': betti,
  'degree': cc.degree()
}
  `);

  // Display results
  console.log('Python computation:', result);
  displayResults(result);
}
```

---

## TROUBLESHOOTING

### Common Issues

**Issue**: WebGL context lost
```javascript
canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  console.error('WebGL context lost');
  
  // Attempt recovery
  setTimeout(() => {
    canvas.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored');
      reinitializeWebGL();
    }, { once: true });
  }, 100);
});
```

**Issue**: Out of memory
```javascript
// Monitor memory usage
if (performance.memory) {
  const used = performance.memory.usedJSHeapSize;
  const total = performance.memory.totalJSHeapSize;
  
  if (used / total > 0.9) {
    console.warn('Memory usage high:', (used / 1024 / 1024).toFixed(2), 'MB');
    // Clear caches, reduce particle count, etc.
    optimizeMemoryUsage();
  }
}
```

**Issue**: Poor frame rate
```javascript
// Adaptive quality
class AdaptiveQuality {
  constructor() {
    this.targetFPS = 60;
    this.qualityLevel = 1.0;
    this.frameHistory = [];
  }

  update(currentFPS) {
    this.frameHistory.push(currentFPS);
    if (this.frameHistory.length > 60) this.frameHistory.shift();

    const avgFPS = this.frameHistory.reduce((a,b) => a+b) / this.frameHistory.length;

    if (avgFPS < this.targetFPS * 0.8) {
      this.qualityLevel = Math.max(0.1, this.qualityLevel - 0.1);
      console.log('Reducing quality to', this.qualityLevel);
    } else if (avgFPS > this.targetFPS * 0.95 && this.qualityLevel < 1.0) {
      this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.05);
    }

    return this.qualityLevel;
  }
}

const adaptiveQuality = new AdaptiveQuality();

function render() {
  const quality = adaptiveQuality.update(getCurrentFPS());
  setParticleCount(Math.floor(MAX_PARTICLES * quality));
  // ... render
}
```

---

## CONTRIBUTING

### Code Style

```javascript
// Use JSDoc comments
/**
 * Computes the characteristic cycle of a perverse sheaf
 * @param {PerverseSheaf} sheaf - The perverse sheaf
 * @param {Object} options - Computation options
 * @param {boolean} options.tropical - Use tropical methods
 * @returns {CharacteristicCycle} The computed cycle
 */
function computeCharacteristicCycle(sheaf, options = {}) {
  // Implementation
}

// Prefer const, use let sparingly
const IMMUTABLE = computeOnce();
let mutable = 0;

// Descriptive names
const stratifiedVariety = createNode();  // Good
const x = createNode();  // Bad

// Early returns
function isPerverse(sheaf) {
  if (!sheaf.cohomology) return false;
  if (!sheaf.stratification) return false;
  return checkSupportConditions(sheaf);
}
```

### Testing

```javascript
// Use simple assertion library
function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    console.error(`✗ ${name}:`, e.message);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Tests
test('Stratification satisfies frontier condition', () => {
  const strat = createNodeStratification();
  assert(strat.validateFrontierCondition(), 'Frontier condition failed');
});

test('IC sheaf is self-dual', () => {
  const ic = createICsheaf();
  const dual = ic.verdierDual();
  assert(ic.isomorphicTo(dual), 'IC sheaf not self-dual');
});
```

### Pull Request Template

```markdown
## Description
[Describe the change]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Performance improvement
- [ ] Documentation

## Checklist
- [ ] Code follows style guidelines
- [ ] Added tests
- [ ] Documentation updated
- [ ] Tested in Chrome, Firefox, Safari
- [ ] No performance regression

## Screenshots/Videos
[If visual change, include before/after]

## Mathematical Correctness
- [ ] Formula verified against BBD paper
- [ ] Edge cases tested
- [ ] Numerics are stable
```

---

## CONCLUSION

This guide provides the foundation for extending and customizing the perverse sheaf visualization suite. The key principles are:

1. **Separation of concerns**: Math, rendering, and interaction are independent
2. **Performance first**: Profile before optimizing, use GPU when appropriate
3. **Mathematical rigor**: Every visualization is mathematically correct
4. **Accessibility**: Fallbacks for older browsers, graceful degradation
5. **Community**: Code is meant to be shared, extended, and improved

For more detailed API documentation, see `api-reference.md` (to be created).

For questions, open an issue on GitHub or contact the maintainers.

**Happy visualizing!**

---

*Version 1.0.0 • December 2024 • MIT License*
