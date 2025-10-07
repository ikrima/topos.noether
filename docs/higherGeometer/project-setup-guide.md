# Sound Ninjutsu Dojo - Complete Project Template

## Quick Setup Script

Save this as `setup.sh` and run `bash setup.sh`:

```bash
#!/bin/bash

echo "⚡ Setting up Sound Ninjutsu Dojo..."

# Create directory structure
mkdir -p sound-ninjutsu-cljs/{src/sound_ninjutsu,public,shaders}

cd sound-ninjutsu-cljs

# Create package.json
cat > package.json << 'EOF'
{
  "name": "sound-ninjutsu-dojo",
  "version": "3.0.0",
  "description": "Data-driven physics visualization with ClojureScript + WebGPU",
  "scripts": {
    "dev": "shadow-cljs watch app",
    "build": "shadow-cljs release app",
    "repl": "shadow-cljs cljs-repl app",
    "server": "npx http-server public -p 8080"
  },
  "devDependencies": {
    "shadow-cljs": "^2.25.8",
    "http-server": "^14.1.1"
  }
}
EOF

# Create shadow-cljs.edn
cat > shadow-cljs.edn << 'EOF'
{:source-paths ["src"]
 
 :dependencies
 [[org.clojure/clojure "1.11.1"]
  [org.clojure/clojurescript "1.11.60"]
  [org.clojure/core.async "1.6.681"]]
 
 :builds
 {:app
  {:target :browser
   :output-dir "public/js"
   :asset-path "/js"
   :modules {:main {:init-fn sound-ninjutsu.core/main}}
   
   :devtools
   {:http-root "public"
    :http-port 8080
    :preloads [devtools.preload]
    :after-load sound-ninjutsu.core/reload}
   
   :compiler-options
   {:infer-externs :auto
    :source-map true}
   
   :dev
   {:compiler-options
    {:optimizations :none}}
   
   :release
   {:compiler-options
    {:optimizations :advanced
     :pretty-print false}}}}}
EOF

# Create public/index.html
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sound Ninjutsu Dojo - ClojureScript + WebGPU</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Fira Code', monospace;
            background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
            color: #fff;
            padding: 20px;
            min-height: 100vh;
        }
        
        #app {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        h1 {
            font-size: 48px;
            color: #4ecdc4;
            text-align: center;
            margin-bottom: 20px;
            text-shadow: 0 0 20px rgba(78, 205, 196, 0.8);
        }
        
        .console-box {
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #4ecdc4;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            font-size: 14px;
            line-height: 1.6;
        }
        
        .console-box h2 {
            color: #ff6b35;
            margin-bottom: 10px;
        }
        
        canvas {
            display: block;
            width: 100%;
            max-width: 800px;
            margin: 20px auto;
            border: 2px solid #4ecdc4;
            border-radius: 8px;
        }
        
        .status {
            text-align: center;
            font-size: 18px;
            margin: 20px 0;
        }
        
        .status.loading { color: #ffeb3b; }
        .status.ready { color: #4ecdc4; }
        .status.error { color: #ff6b35; }
    </style>
</head>
<body>
    <div id="app">
        <h1>⚡ SOUND NINJUTSU DOJO</h1>
        
        <div class="status loading" id="status">
            🔄 Initializing WebGPU...
        </div>
        
        <canvas id="particle-canvas" width="800" height="600"></canvas>
        
        <div class="console-box">
            <h2>📊 System Status</h2>
            <div id="system-info">
                <p>Checking WebGPU support...</p>
            </div>
        </div>
        
        <div class="console-box">
            <h2>🎮 Controls</h2>
            <ul>
                <li><strong>Space:</strong> Emit particles</li>
                <li><strong>R:</strong> Reset simulation</li>
                <li><strong>1-5:</strong> Change gravity</li>
                <li><strong>F12:</strong> Open console for detailed logs</li>
            </ul>
        </div>
        
        <div class="console-box">
            <h2>📝 EDN State</h2>
            <pre id="edn-state"></pre>
        </div>
    </div>
    
    <!-- Load ClojureScript -->
    <script src="/js/main.js"></script>
    
    <script>
        // UI helpers (called from ClojureScript)
        window.updateStatus = function(status, className) {
            const el = document.getElementById('status');
            el.textContent = status;
            el.className = 'status ' + className;
        };
        
        window.updateSystemInfo = function(info) {
            document.getElementById('system-info').innerHTML = info;
        };
        
        window.updateEDNState = function(edn) {
            document.getElementById('edn-state').textContent = edn;
        };
    </script>
</body>
</html>
EOF

# Create WGSL shader files
cat > shaders/particles.wgsl << 'EOF'
// Particle compute shader
struct Particle {
    position: vec3<f32>,
    velocity: vec3<f32>,
    life: f32,
    size: f32,
    color: vec3<f32>,
    _padding: f32,
};

struct Uniforms {
    dt: f32,
    gravity: f32,
    particle_count: u32,
    emit_count: u32,
    emit_position: vec3<f32>,
    time: f32,
};

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

fn pcg_hash(input: u32) -> u32 {
    var state = input * 747796405u + 2891336453u;
    let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}

fn random_float(seed: u32) -> f32 {
    return f32(pcg_hash(seed)) / 4294967295.0;
}

@compute @workgroup_size(256)
fn emit(@builtin(global_invocation_id) id: vec3<u32>) {
    let idx = id.x;
    if (idx >= uniforms.emit_count) { return; }
    
    let seed = u32(uniforms.time * 1000.0) + idx * 3u;
    let angle = random_float(seed) * 6.28318530718;
    let elevation = random_float(seed + 1u) * 1.5708;
    let speed = 2.0 + random_float(seed + 2u) * 1.5;
    
    particles[idx].position = uniforms.emit_position;
    particles[idx].velocity = vec3<f32>(
        cos(angle) * cos(elevation) * speed,
        sin(elevation) * speed * 2.0,
        sin(angle) * cos(elevation) * speed
    );
    particles[idx].life = 1.0 + random_float(seed + 3u) * 0.5;
    particles[idx].size = 0.03 + random_float(seed + 4u) * 0.02;
    
    let t = random_float(seed + 5u);
    particles[idx].color = mix(
        vec3<f32>(0.3, 0.8, 0.77),
        vec3<f32>(1.0, 0.42, 0.21),
        t
    );
}

@compute @workgroup_size(256)
fn update(@builtin(global_invocation_id) id: vec3<u32>) {
    let idx = id.x;
    if (idx >= uniforms.particle_count) { return; }
    
    var p = particles[idx];
    if (p.life <= 0.0) { return; }
    
    p.velocity.y -= uniforms.gravity * uniforms.dt;
    p.position += p.velocity * uniforms.dt;
    p.life -= uniforms.dt;
    
    let life_ratio = p.life / 1.5;
    p.size = 0.05 * life_ratio;
    
    particles[idx] = p;
}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
.shadow-cljs/
public/js/
node_modules/
.cpcache/
.nrepl-port
.calva/
.lsp/
EOF

# Create README
cat > README.md << 'EOF'
# Sound Ninjutsu Dojo - ClojureScript Edition

## Installation

```bash
npm install
```

## Development

```bash
# Start dev server (auto-reload on save)
npm run dev

# Open browser
open http://localhost:8080
```

## REPL

```bash
# In another terminal
npm run repl

# Then in the REPL:
(in-ns 'sound-ninjutsu.core)
(emit-particles! [0 1 0] 100)
```

## Build for Production

```bash
npm run build
```

## Project Structure

```
sound-ninjutsu-cljs/
├── src/sound_ninjutsu/
│   └── core.cljs          # Main ClojureScript code
├── shaders/
│   └── particles.wgsl     # WebGPU compute shaders
├── public/
│   ├── index.html         # HTML template
│   └── js/                # Generated (git-ignored)
├── shadow-cljs.edn        # Build configuration
└── package.json           # Dependencies
```

## Next Steps

1. Copy `sound-ninjutsu-cljs-prototype.cljs` to `src/sound_ninjutsu/core.cljs`
2. Run `npm install`
3. Run `npm run dev`
4. Open http://localhost:8080 and check console (F12)
EOF

echo ""
echo "✅ Project structure created!"
echo ""
echo "Next steps:"
echo "  cd sound-ninjutsu-cljs"
echo "  npm install"
echo "  npm run dev"
echo ""
echo "Then copy the ClojureScript file:"
echo "  cp ../sound-ninjutsu-cljs-prototype.cljs src/sound_ninjutsu/core.cljs"
echo ""
echo "🎉 Happy coding!"
```

---

## Alternative: Manual Setup

If you prefer manual setup:

### 1. Install Node.js and npm

Download from: https://nodejs.org/

### 2. Install shadow-cljs globally

```bash
npm install -g shadow-cljs
```

### 3. Create project directory

```bash
mkdir sound-ninjutsu-cljs
cd sound-ninjutsu-cljs
mkdir -p src/sound_ninjutsu public shaders
```

### 4. Create configuration files

Copy the contents from the setup script above for:
- `package.json`
- `shadow-cljs.edn`
- `public/index.html`
- `shaders/particles.wgsl`
- `.gitignore`

### 5. Copy ClojureScript source

```bash
cp sound-ninjutsu-cljs-prototype.cljs src/sound_ninjutsu/core.cljs
```

### 6. Install dependencies

```bash
npm install
```

### 7. Start development server

```bash
npm run dev
```

### 8. Open browser

Navigate to: http://localhost:8080

---

## Troubleshooting Common Issues

### "shadow-cljs: command not found"

**Solution:**
```bash
# Global install
npm install -g shadow-cljs

# Or use npx
npx shadow-cljs watch app
```

### "Module not found: cljs.core"

**Solution:**
```bash
# Clean build
rm -rf .shadow-cljs
shadow-cljs watch app
```

### WebGPU not available

**Solution:**
- Use Chrome 113+ or Edge 113+
- Or enable chrome://flags/#enable-unsafe-webgpu

### Port 8080 already in use

**Solution:**
```bash
# Change port in shadow-cljs.edn
:devtools {:http-port 8081}
```

---

## VS Code Setup (Optional)

### Recommended Extensions

1. **Calva** - Clojure(Script) support
2. **Shader languages support** - WGSL syntax highlighting

### Install Calva

```bash
code --install-extension betterthantomorrow.calva
```

### Connect to REPL

1. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
2. Select "Calva: Connect to a Running REPL Server"
3. Choose "shadow-cljs"
4. Select `:app` build
5. Start evaluating code! (Ctrl+Enter)

---

## File Structure Explained

```
sound-ninjutsu-cljs/
│
├── src/sound_ninjutsu/         # ClojureScript source
│   └── core.cljs               # Main application code
│       ├── EDN scene graph
│       ├── WebGPU initialization
│       ├── Shader compilation
│       └── Event handlers
│
├── shaders/                    # WGSL compute shaders
│   └── particles.wgsl          # Particle system shader
│       ├── emit()   - Create particles
│       └── update() - Physics simulation
│
├── public/                     # Static web assets
│   ├── index.html              # HTML template
│   └── js/                     # Generated JavaScript
│       └── main.js             # (Auto-generated, git-ignored)
│
├── shadow-cljs.edn             # Build configuration
│   ├── Source paths
│   ├── Dependencies
│   ├── Build targets
│   └── Dev server settings
│
├── package.json                # npm dependencies
└── .gitignore                  # Git ignore rules
```

---

## Environment Variables

You can customize behavior with environment variables:

```bash
# Development mode
NODE_ENV=development npm run dev

# Production build
NODE_ENV=production npm run build

# Custom port
PORT=3000 npm run dev
```

---

## Testing WebGPU Support

Add this to your ClojureScript code to check WebGPU:

```clojure
(defn check-webgpu-support []
  (if (.-gpu js/navigator)
    (do
      (js/console.log "✅ WebGPU supported!")
      (-> (js/navigator.gpu.requestAdapter)
          (.then (fn [adapter]
                   (js/console.log "✅ GPU Adapter:" adapter)
                   adapter))))
    (js/console.error "❌ WebGPU not supported in this browser")))
```

---

## Performance Tips

### 1. Particle Count
Start with 1,000 particles and scale up:
```clojure
:max-particles 1000  ; Start here
:max-particles 10000 ; Good performance
:max-particles 100000 ; High-end GPUs only
```

### 2. Update Frequency
60 FPS is smooth, 30 FPS is acceptable:
```clojure
(js/setInterval #(update-particles! 0.016) 16)  ; 60 FPS
(js/setInterval #(update-particles! 0.033) 33)  ; 30 FPS
```

### 3. Buffer Management
Reuse buffers instead of recreating:
```clojure
;; Good: Reuse
(def particle-buffer (create-particle-buffer device 10000))

;; Bad: Recreate every frame
(let [buf (create-particle-buffer device 10000)] ...)
```

---

**You're all set!** 🎉

Run the setup script or follow the manual steps, and you'll have a complete ClojureScript + WebGPU development environment ready to go.

Questions? Check the README.md or console output for debugging info.
