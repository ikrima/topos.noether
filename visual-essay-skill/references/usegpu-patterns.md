# use.gpu Patterns Reference

use.gpu is a set of declarative, reactive WebGPU libraries created by Steven Wittens (acko.net). It enables high-performance mathematical visualizations with a reactive programming model.

**Repository**: https://gitlab.com/unconed/use.gpu  
**Documentation**: https://usegpu.live/  
**Browser Requirements**: Chrome 113+, Edge 113+, Firefox Nightly (behind flag)

## When to Use use.gpu

| Scenario | Recommendation |
|----------|----------------|
| < 10,000 points | D3.js with SVG or Canvas |
| 10,000 - 100,000 points | Three.js with BufferGeometry |
| > 100,000 points | **use.gpu** or Three.js with instancing |
| Real-time GPU computation | **use.gpu** |
| Reactive data flow | **use.gpu** (built-in reactivity) |
| Maximum browser support | Three.js (WebGL fallback) |
| Cutting-edge performance | **use.gpu** (WebGPU native) |

## Core Concepts

### Live (Reactive Runtime)

use.gpu uses a reactive runtime called "Live" that automatically tracks dependencies and updates only what's needed:

```javascript
import { live, memo, use } from '@use-gpu/live';

// Reactive computation
const doubledValue = memo(() => sourceValue() * 2);

// Automatically re-runs when dependencies change
```

### Declarative Scene Graph

Similar to React but for GPU rendering:

```javascript
import { Canvas, OrbitCamera, Mesh } from '@use-gpu/workbench';

// JSX-like scene description
<Canvas>
  <OrbitCamera position={[0, 0, 5]} />
  <Mesh geometry={geometry} material={material} />
</Canvas>
```

## Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
  {
    "imports": {
      "@use-gpu/live": "https://cdn.jsdelivr.net/npm/@use-gpu/live/dist/index.mjs",
      "@use-gpu/webgpu": "https://cdn.jsdelivr.net/npm/@use-gpu/webgpu/dist/index.mjs",
      "@use-gpu/workbench": "https://cdn.jsdelivr.net/npm/@use-gpu/workbench/dist/index.mjs"
    }
  }
  </script>
</head>
<body>
  <div id="canvas-container"></div>
  
  <script type="module">
    // Check for WebGPU support first
    if (!navigator.gpu) {
      document.getElementById('canvas-container').innerHTML = `
        <div style="padding: 20px; background: #fee; border-radius: 8px;">
          <strong>WebGPU not supported.</strong><br>
          Please use Chrome 113+ or Edge 113+.
        </div>
      `;
      throw new Error('WebGPU not supported');
    }
    
    // Initialize use.gpu
    import { makeRenderer } from '@use-gpu/webgpu';
    
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.getElementById('canvas-container').appendChild(canvas);
    
    const renderer = await makeRenderer(canvas);
    
    // ... build your visualization
  </script>
</body>
</html>
```

## Integration with Alpine.js

```html
<div x-data="gpuVisualization()" x-init="init()">
  <canvas x-ref="canvas" width="800" height="600"></canvas>
  <input type="range" x-model="particleCount" min="1000" max="100000" step="1000">
  <span x-text="particleCount + ' particles'"></span>
</div>

<script type="module">
  function gpuVisualization() {
    return {
      particleCount: 10000,
      renderer: null,
      
      async init() {
        if (!navigator.gpu) {
          this.$refs.canvas.parentElement.innerHTML = '<p>WebGPU not supported</p>';
          return;
        }
        
        const { makeRenderer } = await import('@use-gpu/webgpu');
        this.renderer = await makeRenderer(this.$refs.canvas);
        
        this.$watch('particleCount', (count) => {
          this.updateParticles(count);
        });
        
        this.render();
      },
      
      updateParticles(count) {
        // Regenerate particle buffer
      },
      
      render() {
        // Render loop
        requestAnimationFrame(() => this.render());
      }
    };
  }
</script>
```

## Fallback Strategy

Always provide a fallback for browsers without WebGPU:

```javascript
async function initVisualization(container) {
  if (navigator.gpu) {
    // Modern path: use.gpu
    return await initUseGPU(container);
  } else {
    // Fallback: Three.js with WebGL
    return initThreeJS(container);
  }
}

// Feature detection component
<div x-data="{ hasWebGPU: !!navigator.gpu }">
  <template x-if="hasWebGPU">
    <div x-data="gpuVisualization()"><!-- use.gpu --></div>
  </template>
  <template x-if="!hasWebGPU">
    <div x-data="webglFallback()"><!-- Three.js --></div>
  </template>
</div>
```

## Performance Considerations

1. **Batch updates**: use.gpu's reactive system batches updates automatically, but avoid creating new arrays/objects every frame
2. **Use typed arrays**: `Float32Array` for positions, `Uint8Array` for colors
3. **Prefer GPU compute**: Move calculations to compute shaders when possible
4. **Profile with Chrome DevTools**: Enable "GPU" in Performance panel

## Resources

- **Live Documentation**: https://usegpu.live/docs
- **Examples Gallery**: https://usegpu.live/examples
- **GitLab Repository**: https://gitlab.com/unconed/use.gpu
- **Steven Wittens' Blog**: https://acko.net/ (design philosophy behind use.gpu)
- **WebGPU Fundamentals**: https://webgpufundamentals.org/
