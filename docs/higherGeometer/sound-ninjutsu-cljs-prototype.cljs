;; sound_ninjutsu/core.cljs
;; Minimal prototype: EDN scene graph → WebGPU compute particles

(ns sound-ninjutsu.core
  (:require [clojure.string :as str]))

;; =============================================================================
;; EDN SCENE GRAPH (Data-Driven IR)
;; =============================================================================

(def scene-graph
  "Complete scene definition as Clojure data"
  {:scene/metadata
   {:title "Sound Ninjutsu Dojo"
    :version "3.0.0"
    :timestamp (.now js/Date)}
   
   ;; Physics world configuration
   :physics/world
   {:gravity [0 -9.81 0]
    :timestep 0.016
    :substeps 1}
   
   ;; Entity-component system
   :entities
   [{:id :ball
     :components
     {:transform {:position [0 3 0]
                  :rotation [0 0 0]
                  :scale [1 1 1]}
      :rigidbody {:mass 0.45
                  :velocity [0 0 0]
                  :angular-velocity [0 0 0]}
      :collider {:type :sphere
                 :radius 0.2
                 :restitution 0.8
                 :friction 0.1}
      :visual {:geometry :sphere
               :material {:color [1.0 0.42 0.21]
                         :metalness 0.6
                         :roughness 0.4
                         :emissive [1.0 0.42 0.21]
                         :emissive-strength 0.3}}}}
    
    {:id :ground
     :components
     {:transform {:position [0 0 0]}
      :collider {:type :plane
                 :normal [0 1 0]}
      :visual {:geometry :plane
               :material {:color [0.1 0.1 0.18]}}}}]
   
   ;; GPU particle systems
   :particles/systems
   [{:id :impact-burst
     :max-particles 10000
     :compute-shader "particles/burst.wgsl"
     :emit-on {:event :collision
               :entity :ball}
     :properties {:lifetime [0.8 1.5]
                  :speed [2.0 3.5]
                  :size [0.02 0.05]
                  :color-gradient [[0.3 0.8 0.77]   ;; chakra-blue
                                   [1.0 0.42 0.21]]  ;; chakra-orange
                  :gravity-scale 1.0}}]
   
   ;; Dataflow graph (connections)
   :graph/edges
   [{:from [:ball :rigidbody/collision-event]
     :to [:impact-burst :emit]
     :transform identity}
    
    {:from [:ball :rigidbody/velocity]
     :to [:audio-synth :frequency]
     :transform (fn [v] (+ 80 (* (Math/sqrt (+ (* v v) (* v v) (* v v))) 20)))}]})

;; =============================================================================
;; WGSL SHADER CODE (Embedded as String for Now)
;; =============================================================================

(def particle-compute-shader
  "WGSL compute shader for particle simulation"
  "
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

// PCG Random
fn pcg_hash(input: u32) -> u32 {
  var state = input * 747796405u + 2891336453u;
  let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
  return (word >> 22u) ^ word;
}

fn random_float(seed: u32) -> f32 {
  return f32(pcg_hash(seed)) / 4294967295.0;
}

fn random_vec3(seed: u32) -> vec3<f32> {
  return vec3<f32>(
    random_float(seed),
    random_float(seed + 1u),
    random_float(seed + 2u)
  );
}

// Emit new particles
@compute @workgroup_size(256)
fn emit(@builtin(global_invocation_id) id: vec3<u32>) {
  let idx = id.x;
  if (idx >= uniforms.emit_count) { return; }
  
  let seed = u32(uniforms.time * 1000.0) + idx * 3u;
  
  // Spherical coordinates
  let angle = random_float(seed) * 6.28318530718;  // 2π
  let elevation = random_float(seed + 1u) * 1.5708;  // π/2 (upward bias)
  let speed = 2.0 + random_float(seed + 2u) * 1.5;
  
  particles[idx].position = uniforms.emit_position;
  particles[idx].velocity = vec3<f32>(
    cos(angle) * cos(elevation) * speed,
    sin(elevation) * speed * 2.0,
    sin(angle) * cos(elevation) * speed
  );
  particles[idx].life = 1.0 + random_float(seed + 3u) * 0.5;
  particles[idx].size = 0.03 + random_float(seed + 4u) * 0.02;
  
  // Color gradient (blue → orange)
  let t = random_float(seed + 5u);
  particles[idx].color = mix(
    vec3<f32>(0.3, 0.8, 0.77),  // blue
    vec3<f32>(1.0, 0.42, 0.21),  // orange
    t
  );
}

// Update particle physics
@compute @workgroup_size(256)
fn update(@builtin(global_invocation_id) id: vec3<u32>) {
  let idx = id.x;
  if (idx >= uniforms.particle_count) { return; }
  
  var p = particles[idx];
  
  if (p.life <= 0.0) { return; }
  
  // Physics integration
  p.velocity.y -= uniforms.gravity * uniforms.dt;
  p.position += p.velocity * uniforms.dt;
  p.life -= uniforms.dt;
  
  // Fade size over lifetime
  let life_ratio = p.life / 1.5;
  p.size = 0.05 * life_ratio;
  
  particles[idx] = p;
}
")

;; =============================================================================
;; WEBGPU INITIALIZATION
;; =============================================================================

(defonce gpu-state (atom {}))

(defn init-webgpu! []
  (-> (js/navigator.gpu.requestAdapter)
      (.then (fn [adapter]
               (-> (.requestDevice adapter)
                   (.then (fn [device]
                            (swap! gpu-state assoc
                                   :adapter adapter
                                   :device device
                                   :queue (.queue device))
                            (js/console.log "✅ WebGPU initialized" device)
                            device)))))))

;; =============================================================================
;; BUFFER MANAGEMENT
;; =============================================================================

(defn create-particle-buffer [device max-particles]
  "Create GPU buffer for particle data"
  (let [particle-size 48  ;; 12 floats × 4 bytes (see WGSL struct)
        total-size (* max-particles particle-size)]
    (.createBuffer device
                   #js {:size total-size
                        :usage (bit-or js/GPUBufferUsage.STORAGE
                                      js/GPUBufferUsage.COPY_DST
                                      js/GPUBufferUsage.COPY_SRC)
                        :label "Particle Storage Buffer"})))

(defn create-uniform-buffer [device]
  "Create uniform buffer for shader parameters"
  (.createBuffer device
                 #js {:size 64  ;; Align to 16 bytes
                      :usage (bit-or js/GPUBufferUsage.UNIFORM
                                    js/GPUBufferUsage.COPY_DST)
                      :label "Particle Uniforms"}))

;; =============================================================================
;; SHADER COMPILATION
;; =============================================================================

(defn compile-shader [device shader-code label]
  "Compile WGSL shader module"
  (.createShaderModule device
                       #js {:code shader-code
                            :label label}))

(defn create-compute-pipeline [device shader-module entry-point]
  "Create compute pipeline from shader"
  (.createComputePipeline device
                          #js {:layout "auto"
                               :compute #js {:module shader-module
                                            :entryPoint entry-point}
                               :label (str "Pipeline: " entry-point)}))

;; =============================================================================
;; BIND GROUP SETUP
;; =============================================================================

(defn create-bind-group [device pipeline particle-buffer uniform-buffer]
  "Create bind group connecting buffers to shader"
  (.createBindGroup device
                    #js {:layout (.getBindGroupLayout pipeline 0)
                         :entries #js [#js {:binding 0
                                           :resource #js {:buffer particle-buffer}}
                                      #js {:binding 1
                                           :resource #js {:buffer uniform-buffer}}]
                         :label "Particle Bind Group"}))

;; =============================================================================
;; DISPATCH COMPUTE
;; =============================================================================

(defn dispatch-compute! [device queue pipeline bind-group workgroups]
  "Execute compute shader on GPU"
  (let [encoder (.createCommandEncoder device #js {:label "Compute Encoder"})
        pass (.beginComputePass encoder #js {:label "Particle Compute Pass"})]
    
    (.setPipeline pass pipeline)
    (.setBindGroup pass 0 bind-group)
    (.dispatchWorkgroups pass workgroups 1 1)
    (.end pass)
    
    (.submit queue #js [(.finish encoder)])))

;; =============================================================================
;; UNIFORM UPDATES
;; =============================================================================

(defn update-uniforms! [queue uniform-buffer params]
  "Write uniform data to GPU buffer"
  (let [{:keys [dt gravity particle-count emit-count emit-position time]} params
        [x y z] emit-position
        data (js/Float32Array.
              #js [dt gravity particle-count emit-count
                   x y z time])]
    (.writeBuffer queue uniform-buffer 0 data)))

;; =============================================================================
;; PARTICLE SYSTEM MANAGER
;; =============================================================================

(defn init-particle-system! [scene-graph]
  "Initialize GPU particle system from scene graph"
  (let [device (:device @gpu-state)
        queue (:queue @gpu-state)
        particle-spec (first (:particles/systems scene-graph))
        max-particles (:max-particles particle-spec)
        
        ;; Create buffers
        particle-buffer (create-particle-buffer device max-particles)
        uniform-buffer (create-uniform-buffer device)
        
        ;; Compile shaders
        shader-module (compile-shader device particle-compute-shader "Particle Shader")
        emit-pipeline (create-compute-pipeline device shader-module "emit")
        update-pipeline (create-compute-pipeline device shader-module "update")
        
        ;; Bind groups
        emit-bind-group (create-bind-group device emit-pipeline particle-buffer uniform-buffer)
        update-bind-group (create-bind-group device update-pipeline particle-buffer uniform-buffer)]
    
    (swap! gpu-state assoc
           :particle-buffer particle-buffer
           :uniform-buffer uniform-buffer
           :emit-pipeline emit-pipeline
           :update-pipeline update-pipeline
           :emit-bind-group emit-bind-group
           :update-bind-group update-bind-group
           :max-particles max-particles)
    
    (js/console.log "✅ Particle system initialized" 
                    {:max-particles max-particles})))

;; =============================================================================
;; SIMULATION LOOP
;; =============================================================================

(defn emit-particles! [position count]
  "Emit particles at position"
  (let [{:keys [device queue uniform-buffer emit-pipeline emit-bind-group]} @gpu-state
        time (/ (.now js/Date) 1000.0)]
    
    (update-uniforms! queue uniform-buffer
                     {:dt 0.016
                      :gravity 9.81
                      :particle-count 10000
                      :emit-count count
                      :emit-position position
                      :time time})
    
    ;; Dispatch emit shader (1 workgroup = 256 threads)
    (dispatch-compute! device queue emit-pipeline emit-bind-group 
                      (js/Math.ceil (/ count 256)))))

(defn update-particles! [dt]
  "Update all particles (physics simulation)"
  (let [{:keys [device queue uniform-buffer update-pipeline update-bind-group 
                max-particles]} @gpu-state
        time (/ (.now js/Date) 1000.0)]
    
    (update-uniforms! queue uniform-buffer
                     {:dt dt
                      :gravity 9.81
                      :particle-count max-particles
                      :emit-count 0
                      :emit-position [0 0 0]
                      :time time})
    
    ;; Dispatch update shader (workgroups = particles / 256)
    (dispatch-compute! device queue update-pipeline update-bind-group
                      (js/Math.ceil (/ max-particles 256)))))

;; =============================================================================
;; REACTIVE EVENT SYSTEM
;; =============================================================================

(defn on-collision! [collision-data]
  "React to physics collision event by emitting particles"
  (let [{:keys [position velocity]} collision-data
        speed (js/Math.sqrt (+ (* velocity velocity)
                              (* velocity velocity)))]
    
    (js/console.log "💥 Collision!" position speed)
    
    ;; Emit particles at collision point
    (emit-particles! position 50)))

;; =============================================================================
;; MAIN ENTRY POINT
;; =============================================================================

(defn ^:export main []
  "Initialize the Sound Ninjutsu Dojo"
  (js/console.log "%c⚡ SOUND NINJUTSU DOJO v3.0"
                  "color: #4ecdc4; font-size: 20px; font-weight: bold")
  (js/console.log "%cClojureScript + WebGPU + Category Theory"
                  "color: #ff6b35; font-size: 14px")
  
  ;; Print scene graph
  (js/console.log "📊 Scene Graph:" (clj->js scene-graph))
  
  ;; Initialize WebGPU
  (-> (init-webgpu!)
      (.then (fn [_]
               (js/console.log "🎨 Initializing particle system...")
               (init-particle-system! scene-graph)))
      (.then (fn [_]
               (js/console.log "✅ Ready to simulate!")
               
               ;; Test: Emit particles at ball position
               (emit-particles! [0 1 0] 100)
               
               ;; Start update loop (60 FPS)
               (js/setInterval #(update-particles! 0.016) 16)))
      (.catch (fn [err]
                (js/console.error "❌ WebGPU initialization failed:" err)))))

;; =============================================================================
;; SHADOW-CLJS BUILD CONFIGURATION
;; =============================================================================

(comment
  ;; shadow-cljs.edn
  {:source-paths ["src"]
   :dependencies [[org.clojure/clojure "1.11.1"]
                  [org.clojure/clojurescript "1.11.60"]]
   :builds
   {:app {:target :browser
          :output-dir "public/js"
          :asset-path "/js"
          :modules {:main {:init-fn sound-ninjutsu.core/main}}
          :devtools {:http-root "public"
                     :http-port 8080}}}}
  
  ;; To run:
  ;; $ npm install -g shadow-cljs
  ;; $ shadow-cljs watch app
  ;; $ open http://localhost:8080
  )

;; =============================================================================
;; USAGE EXAMPLES
;; =============================================================================

(comment
  ;; Compile scene to GPU
  (init-particle-system! scene-graph)
  
  ;; Emit particles on collision
  (on-collision! {:position [0 0.2 0]
                  :velocity [0 -5 0]})
  
  ;; Manual update tick
  (update-particles! 0.016)
  
  ;; Inspect GPU state
  @gpu-state
  )
