# Sound Ninjutsu Dojo v3.0 - WebGPU Architecture Guide
## ClojureScript + WGSL Compute Shaders + Category Theory

---

## 🎯 Vision: Data-Driven Physics Dojo with Functional Reactive Programming

This document outlines the **next evolution** of the Sound Ninjutsu Dojo, transforming it into a fully data-driven, composable physics visualization system using:

1. **ClojureScript** for homoiconic EDN-based scene graphs
2. **WebGPU compute shaders** for massive parallel particle systems
3. **Category-theoretic compilation** from high-level IR to GPU code
4. **Reactive dataflow** connecting physics → visuals → audio

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    EDN SCENE GRAPH (IR)                  │
│  {:scene {:physics {...} :visuals {...} :audio {...}}}  │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────▼───────────┐
         │   MACRO EXPANSION     │
         │  (Metaphorical Passes) │
         └───────────┬───────────┘
                     │
        ┌────────────▼─────────────┐
        │   LOWERING COMPILER      │
        │ EDN → Node Graph → GPU   │
        └────────────┬─────────────┘
                     │
    ┌────────────────▼──────────────────┐
    │         EXECUTION ENGINES          │
    ├────────────────┬──────────────────┤
    │  WebGPU        │  Web Audio       │
    │  Compute       │  Synthesis       │
    └────────────────┴──────────────────┘
```

---

## 🔮 EDN Scene Graph (Symbolic IR)

### Example: Complete Scene Definition

```clojure
{:scene/id "sound-ninjutsu-dojo"
 :scene/timestamp 1728259200000
 
 ;; Physics engine configuration
 :physics/engine
 {:gravity 9.81
  :timestep 0.016
  :integrator :verlet
  :collision-planes [{:normal [0 1 0] :offset 0}]}
 
 ;; Ball entity with component-based architecture
 :entities
 [{:entity/id :ball-1
   :entity/type :physics/rigid-body
   :transform {:position [0 3.2 0]
               :velocity [0 0 0]
               :rotation [0 0 0]}
   :physics {:mass 0.45
             :radius 0.2
             :restitution 0.8
             :friction 0.1}
   :visual {:geometry :sphere
            :shader :chakra-glow
            :color [1.0 0.42 0.21]  ;; #ff6b35
            :emissive-intensity 0.4}
   :audio {:on-impact {:synth :impact-burst
                       :freq-fn '(fn [v] (+ 80 (* v 20)))}}}]
 
 ;; Particle system (GPU compute shader)
 :particles/systems
 [{:system/id :impact-burst
   :compute-shader :burst.wgsl
   :max-particles 10000
   :emit-on :collision
   :properties {:lifetime [0.8 1.5]
                :speed [2.0 3.5]
                :color-gradient [:chakra-blue :chakra-orange]
                :fade-curve :exponential}}]
 
 ;; Node graph connections (dataflow)
 :graph/connections
 [{:from [:ball-1 :physics/collision-event]
   :to [:impact-burst :emit-trigger]}
  {:from [:ball-1 :physics/velocity]
   :to [:ball-1 :audio/freq-mod]}
  {:from [:ball-1 :transform/position]
   :to [:hud :height-display]}]
 
 ;; Visual overlays
 :overlays
 [{:type :equation
   :text "E = ½mv² + mgh"
   :position [2 4 0]
   :animation {:float true :amplitude 0.1}}
  {:type :energy-bar
   :bind [:ball-1 :physics/energy]
   :position :hud
   :style :gradient}]
 
 ;; Audio synthesis graph
 :audio/graph
 [{:node/id :impact-osc
   :type :oscillator
   :waveform :sine
   :freq {:input [:ball-1 :physics/collision-velocity]
          :fn '(fn [v] (+ 80 (* v 20)))}}
  {:node/id :impact-env
   :type :adsr
   :attack 0.01
   :decay 0.1
   :sustain 0.0
   :release 0.05}
  {:node/id :filter
   :type :biquad-filter
   :filter-type :lowpass
   :frequency 2000}]}
```

---

## 🧬 Compilation Pipeline (Metaphorical Passes)

### Pass 1: Macro Expansion (Desugaring)

Transform high-level constructs into primitive operations:

```clojure
;; INPUT (sugared)
{:ball {:on-impact :play-sound}}

;; OUTPUT (desugared)
{:graph/connections
 [{:from [:ball :physics/collision-event]
   :to [:audio-system :trigger]
   :transform :event->audio-params}]}
```

### Pass 2: Type Inference & Validation

```clojure
;; Infer data types flowing through graph
{:ball {:physics/velocity ::vec3}}
→ {:audio {:freq-mod ::scalar}}  ;; Requires vec3→scalar transform

;; Auto-insert conversion node
{:from [:ball :physics/velocity]
 :transform '(fn [v] (length v))  ;; vec3→scalar
 :to [:audio :freq-mod]}
```

### Pass 3: Optimization (Fusion, CSE)

```clojure
;; BEFORE: Multiple reads of same property
(height ball)  (height ball)  (height ball)

;; AFTER: Common subexpression elimination
(let [h (height ball)]
  [h h h])
```

### Pass 4: Lowering to WebGPU

```clojure
;; EDN particle system spec
{:particles/systems
 [{:compute-shader :burst.wgsl
   :emit-on :collision}]}

;; LOWERS TO: WebGPU compute pipeline
{:pipeline
 {:compute-shader "burst.wgsl"
  :bind-groups [{:buffer :particle-state
                 :layout :storage-read-write}
                {:buffer :emitter-params
                 :layout :uniform}]
  :dispatch [256 1 1]}}
```

---

## 💾 WGSL Compute Shader: Particle Burst System

```wgsl
// burst.wgsl - 10,000 particle GPU simulation

struct Particle {
    position: vec3<f32>,
    velocity: vec3<f32>,
    life: f32,
    size: f32,
}

struct EmitterParams {
    origin: vec3<f32>,
    count: u32,
    speed_min: f32,
    speed_max: f32,
    lifetime: f32,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> params: EmitterParams;
@group(0) @binding(2) var<uniform> dt: f32;
@group(0) @binding(3) var<uniform> gravity: f32;

// Random number generation (PCG hash)
fn pcg_hash(input: u32) -> u32 {
    let state = input * 747796405u + 2891336453u;
    let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}

fn random(seed: u32) -> f32 {
    return f32(pcg_hash(seed)) / 4294967295.0;
}

@compute @workgroup_size(256)
fn emit_particles(@builtin(global_invocation_id) id: vec3<u32>) {
    let idx = id.x;
    if (idx >= params.count) { return; }
    
    // Initialize particle
    let angle = random(idx * 2u) * 6.28318530718;  // 2π
    let elevation = random(idx * 2u + 1u) * 3.14159265359 * 0.5;  // 0 to π/2
    let speed = mix(params.speed_min, params.speed_max, random(idx * 3u));
    
    particles[idx].position = params.origin;
    particles[idx].velocity = vec3<f32>(
        cos(angle) * cos(elevation) * speed,
        sin(elevation) * speed * 2.0,  // Bias upward
        sin(angle) * cos(elevation) * speed
    );
    particles[idx].life = params.lifetime;
    particles[idx].size = 0.05;
}

@compute @workgroup_size(256)
fn update_particles(@builtin(global_invocation_id) id: vec3<u32>) {
    let idx = id.x;
    if (idx >= params.count) { return; }
    
    var p = particles[idx];
    
    if (p.life <= 0.0) { return; }
    
    // Euler integration
    p.velocity.y -= gravity * dt;
    p.position += p.velocity * dt;
    p.life -= dt;
    
    // Fade size with life
    p.size = 0.05 * (p.life / params.lifetime);
    
    particles[idx] = p;
}
```

---

## 🎨 ClojureScript WebGPU Interop

```clojure
(ns sound-ninjutsu.gpu
  (:require [clojure.core.async :as async]))

;; WebGPU device initialization
(defn init-gpu []
  (let [adapter (js-await (.requestAdapter js/navigator.gpu))
        device (js-await (.requestDevice adapter))]
    {:adapter adapter
     :device device
     :queue (.getQueue device)}))

;; Compile WGSL shader from EDN spec
(defn compile-compute-shader [device shader-code]
  (.createShaderModule device
    #js {:code shader-code}))

;; Create particle buffer (10K particles × 32 bytes)
(defn create-particle-buffer [device count]
  (.createBuffer device
    #js {:size (* count 32)  ;; 8 floats per particle
         :usage (bit-or js/GPUBufferUsage.STORAGE
                       js/GPUBufferUsage.COPY_DST)}))

;; Bind group for compute shader
(defn create-bind-group [device pipeline buffers]
  (.createBindGroup device
    #js {:layout (.getBindGroupLayout pipeline 0)
         :entries (clj->js
                    [{:binding 0 :resource {:buffer (:particles buffers)}}
                     {:binding 1 :resource {:buffer (:params buffers)}}
                     {:binding 2 :resource {:buffer (:dt buffers)}}
                     {:binding 3 :resource {:buffer (:gravity buffers)}}])}))

;; Dispatch compute shader
(defn dispatch-compute [device queue pipeline bind-group workgroups]
  (let [command-encoder (.createCommandEncoder device)
        compute-pass (.beginComputePass command-encoder)]
    (.setPipeline compute-pass pipeline)
    (.setBindGroup compute-pass 0 bind-group)
    (.dispatchWorkgroups compute-pass workgroups 1 1)
    (.end compute-pass)
    (.submit queue #js [(.finish command-encoder)])))

;; Reactive dataflow: physics event → GPU particle emit
(defn react-to-collision [gpu-state collision-event]
  (async/go
    (let [{:keys [device queue pipeline bind-group]} @gpu-state
          {:keys [position velocity]} collision-event]
      
      ;; Update uniform buffer with collision params
      (.writeBuffer queue (:params-buffer @gpu-state)
                   0
                   (js/Float32Array. #js [(:x position) 
                                          (:y position) 
                                          (:z position)
                                          50  ;; particle count
                                          2.0  ;; speed_min
                                          3.5  ;; speed_max
                                          1.2])) ;; lifetime
      
      ;; Dispatch emit shader
      (dispatch-compute device queue 
                       (:emit-pipeline @gpu-state) 
                       bind-group 
                       1)  ;; 256 threads per workgroup, 1 workgroup
      
      ;; Frame loop: dispatch update shader
      (loop []
        (dispatch-compute device queue
                         (:update-pipeline @gpu-state)
                         bind-group
                         (/ 10000 256))  ;; workgroups for 10K particles
        (async/<! (async/timeout 16))  ;; 60 FPS
        (recur)))))
```

---

## 🔗 Category-Theoretic Compilation

### Functors: Scene Graph Transformations

```clojure
;; Functor F: EDN → Node Graph
(defn edn->node-graph [scene-edn]
  {:nodes (map entity->node (:entities scene-edn))
   :edges (map connection->edge (:graph/connections scene-edn))})

;; Functor G: Node Graph → GPU Pipeline
(defn node-graph->gpu [node-graph]
  {:compute-pipelines (filter compute-node? (:nodes node-graph))
   :render-pipeline (build-render-pipeline (:nodes node-graph))
   :buffers (allocate-buffers (:nodes node-graph))})

;; Composition: F ∘ G
(def edn->gpu (comp node-graph->gpu edn->node-graph))
```

### Natural Transformations: Uniform Optimizations

```clojure
;; Natural transformation η: Identity ⇒ Optimized
;; For every scene graph S, η_S : S → optimize(S)
(defn optimize-transform [scene-graph]
  {:pre-optimization scene-graph
   :optimization-steps [:dead-code-elimination
                        :common-subexpression
                        :buffer-fusion]
   :post-optimization (apply-optimizations scene-graph)})

;; Naturality square commutes:
;;    F(S) ─────F(η)────→ F(optimize(S))
;;     │                      │
;;   G(F(S))               G(F(η))
;;     │                      │
;;     └────G(η)────────→ G(optimize(S))
```

### Yoneda Embedding: Introspection

```clojure
;; A physics node is fully characterized by how it behaves
;; in all possible scene graphs (Yoneda lemma)

(defn node-behavior [node scene-graph]
  "Returns the 'meaning' of node by probing it in scene-graph"
  {:inputs (connections-to node scene-graph)
   :outputs (connections-from node scene-graph)
   :transform (node-function node)})

;; Two nodes are equivalent if they behave the same in ALL graphs
(defn node-equiv? [n1 n2]
  (every? #(= (node-behavior n1 %) (node-behavior n2 %))
          (all-possible-graphs)))
```

---

## 🎵 Web Audio Graph (Reactive)

```clojure
(ns sound-ninjutsu.audio
  (:require [clojure.core.async :as async]))

;; Audio node graph as data
(def audio-graph
  {:nodes
   {:impact-osc {:type :oscillator
                 :waveform :sine
                 :frequency {:base 80 :mod 20}}
    :impact-env {:type :adsr
                 :attack 0.01
                 :decay 0.1
                 :sustain 0.0
                 :release 0.05}
    :filter {:type :biquad-filter
             :filter-type :lowpass
             :frequency 2000}}
   :connections
   [{:from :impact-osc :to :filter}
    {:from :filter :to :impact-env}
    {:from :impact-env :to :output}]})

;; Compile audio graph to Web Audio API
(defn compile-audio-graph [graph audio-ctx]
  (let [nodes (reduce-kv
                (fn [acc id spec]
                  (assoc acc id (create-audio-node audio-ctx spec)))
                {}
                (:nodes graph))]
    
    ;; Connect nodes
    (doseq [{:keys [from to]} (:connections graph)]
      (.connect (get nodes from) (get nodes to)))
    
    nodes))

;; React to physics collision
(defn play-impact [audio-nodes velocity]
  (let [osc (:impact-osc audio-nodes)
        env (:impact-env audio-nodes)
        freq (+ 80 (* velocity 20))]
    
    (set! (.-frequency.value osc) freq)
    (.trigger env)))
```

---

## 🚀 Next Steps: Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)
- [ ] Set up ClojureScript + shadow-cljs build
- [ ] Implement EDN scene graph parser
- [ ] Build basic EDN → Three.js compiler
- [ ] Add hot-reload with Figwheel

### Phase 2: WebGPU Integration (Week 2)
- [ ] Initialize WebGPU device + adapter
- [ ] Write WGSL compute shader for particles
- [ ] Implement buffer management (particles, uniforms)
- [ ] Build compute pipeline dispatch system

### Phase 3: Node Graph Editor (Week 3)
- [ ] Interactive node creation/deletion
- [ ] Drag-and-drop connections
- [ ] Live preview of node outputs
- [ ] Serialize graph to EDN

### Phase 4: Advanced Features (Week 4)
- [ ] Multiple ball types (soccer, volleyball, basketball)
- [ ] Spin dynamics (angular momentum)
- [ ] Post-processing effects (bloom, motion blur)
- [ ] Export system (video, GIF, EDN)

---

## 📚 References & Inspiration

- **Brett Victor**: *Explorable Explanations*, *Learnable Programming*
- **Steve Wittens**: *Making WebGL Dance* (Acko.net)
- **David Nolen**: ClojureScript core.async patterns
- **WebGPU Best Practices**: [gpuweb.github.io](https://gpuweb.github.io/gpuweb/)
- **Category Theory for Programmers**: Bartosz Milewski
- **Functional Reactive Programming**: Conal Elliott

---

## 🎯 Usage Example

```clojure
;; Define scene in EDN
(def my-scene
  {:scene/id "custom-bounce"
   :entities [{:entity/id :my-ball
               :physics {:mass 0.6 :restitution 0.85}}]})

;; Compile to GPU
(def compiled (compile-scene my-scene))

;; Run simulation
(start-simulation! compiled)

;; Export to video
(export-video! compiled "bounce.mp4")
```

---

**END OF ARCHITECTURE GUIDE**
*May your compiler passes be pure, your shaders blazing fast, and your physics accurate! ⚡*
