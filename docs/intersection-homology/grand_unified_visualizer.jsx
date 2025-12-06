import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * THE GRAND UNIFIED VISUALIZER
 * ============================
 * 
 * Team Perspective:
 * 
 * BRET VICTOR: "This is the ultimate explorable explanation. Every mathematical
 * structure is a transformation away from every other. Scrub through the morphisms
 * of mathematics itself."
 * 
 * STEVEN WITTENS: "We render the *space of mathematical structures* as a continuous
 * manifold. Watch stratifications become perverse sheaves become spectral sequences
 * become tropical shadows—all flowing into each other."
 * 
 * EMILY RIEHL: "The ∞-categorical framework makes this possible. Every construction
 * is a functor, every relationship an adjunction. We're navigating the ∞-category
 * of mathematical theories."
 */

const GrandUnifiedVisualizer = () => {
  const [mode, setMode] = useState('stratification');
  const [morphParameter, setMorphParameter] = useState(0);
  const [highlightPath, setHighlightPath] = useState(null);
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  const modes = [
    { id: 'stratification', name: 'Stratified Space', color: '#8ab4f8' },
    { id: 'perverse', name: 'Perverse Sheaves', color: '#c58af9' },
    { id: 'tstructure', name: 't-Structure', color: '#ffa07a' },
    { id: 'characteristic', name: 'Characteristic Cycles', color: '#ffd700' },
    { id: 'spectral', name: 'Spectral Sequence', color: '#ff00ff' },
    { id: 'tropical', name: 'Tropical Shadow', color: '#6ee7b7' },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    // =====================================================================
    // MASTER SCENE
    // =====================================================================

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.008);

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.set(0, 20, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;

    // =====================================================================
    // UNIVERSAL LIGHTING
    // =====================================================================

    const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambientLight);

    const lights = [
      { color: 0x8ab4f8, pos: [30, 30, 30] },
      { color: 0xc58af9, pos: [-30, 20, -30] },
      { color: 0x6ee7b7, pos: [0, 40, 0] },
      { color: 0xffd700, pos: [0, -20, 30] },
    ];

    lights.forEach(({ color, pos }) => {
      const light = new THREE.PointLight(color, 1.5, 100);
      light.position.set(...pos);
      scene.add(light);
    });

    // =====================================================================
    // MORPHING GEOMETRIES
    // =====================================================================

    const geometries = {
      stratification: createStratificationGeometry(),
      perverse: createPerverseGeometry(),
      tstructure: createTStructureGeometry(),
      characteristic: createCharacteristicCycleGeometry(),
      spectral: createSpectralSequenceGeometry(),
      tropical: createTropicalGeometry(),
    };

    function createStratificationGeometry() {
      const group = new THREE.Group();

      // Node structure (two crossing lines)
      const createBranch = (rotation) => {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 25, 16);
        const material = new THREE.MeshStandardMaterial({
          color: 0x8ab4f8,
          emissive: 0x4a7fc8,
          emissiveIntensity: 0.5,
          metalness: 0.7,
          roughness: 0.3,
        });
        const branch = new THREE.Mesh(geometry, material);
        branch.rotation.z = rotation;
        return branch;
      };

      group.add(createBranch(0));
      group.add(createBranch(Math.PI / 2));

      // Singular point
      const singularGeometry = new THREE.SphereGeometry(1, 32, 32);
      const singularMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4444,
        emissive: 0xff0000,
        emissiveIntensity: 1,
        metalness: 0.9,
        roughness: 0.1,
      });
      const singular = new THREE.Mesh(singularGeometry, singularMaterial);
      group.add(singular);

      return group;
    }

    function createPerverseGeometry() {
      const group = new THREE.Group();

      // IC sheaf as glowing torus
      const geometry = new THREE.TorusGeometry(8, 2, 32, 64);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xc58af9,
        emissive: 0xc58af9,
        emissiveIntensity: 0.6,
        metalness: 0.8,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.9,
      });
      const torus = new THREE.Mesh(geometry, material);
      group.add(torus);

      // Particles flowing on torus
      const particleCount = 200;
      const particlesGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const theta = (i / particleCount) * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        positions[i * 3] = (8 + 2 * Math.cos(phi)) * Math.cos(theta);
        positions[i * 3 + 1] = (8 + 2 * Math.cos(phi)) * Math.sin(theta);
        positions[i * 3 + 2] = 2 * Math.sin(phi);
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      group.add(particles);
      group.userData.particles = particles;

      return group;
    }

    function createTStructureGeometry() {
      const group = new THREE.Group();

      // Layers representing truncations
      for (let i = -3; i <= 3; i++) {
        const geometry = new THREE.PlaneGeometry(30, 30);
        const material = new THREE.MeshPhysicalMaterial({
          color: i === 0 ? 0xffa07a : 0x8ab4f8,
          transparent: true,
          opacity: i === 0 ? 0.4 : 0.15,
          side: THREE.DoubleSide,
          metalness: 0.5,
          roughness: 0.5,
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.position.y = i * 3;
        group.add(plane);

        // Heart highlight at degree 0
        if (i === 0) {
          const heartGeometry = new THREE.RingGeometry(3, 5, 32);
          const heartMaterial = new THREE.MeshBasicMaterial({
            color: 0xffa07a,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
          });
          const heart = new THREE.Mesh(heartGeometry, heartMaterial);
          heart.rotation.x = Math.PI / 2;
          group.add(heart);
        }
      }

      return group;
    }

    function createCharacteristicCycleGeometry() {
      const group = new THREE.Group();

      // Lagrangian submanifold as flowing surface
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-10, 0, -10),
        new THREE.Vector3(-5, 5, 0),
        new THREE.Vector3(0, 0, 10),
        new THREE.Vector3(5, -5, 0),
        new THREE.Vector3(10, 0, -10),
      ], true);

      const tubeGeometry = new THREE.TubeGeometry(curve, 100, 1.5, 16, true);
      const tubeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffd700,
        emissive: 0xffd700,
        emissiveIntensity: 0.7,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1,
        transparent: true,
        opacity: 0.95,
      });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      group.add(tube);

      // Flowing particles
      const particleCount = 100;
      const particlesGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const t = i / particleCount;
        const point = curve.getPoint(t);
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffd700,
        size: 0.5,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
      });
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      group.add(particles);
      group.userData.particles = particles;
      group.userData.curve = curve;

      return group;
    }

    function createSpectralSequenceGeometry() {
      const group = new THREE.Group();

      // Grid of spheres representing E_r terms
      const gridSize = 5;
      for (let p = 0; p < gridSize; p++) {
        for (let q = 0; q < gridSize; q++) {
          if (Math.random() > 0.3) {
            const geometry = new THREE.SphereGeometry(0.5, 16, 16);
            const material = new THREE.MeshStandardMaterial({
              color: 0xff00ff,
              emissive: 0xff00ff,
              emissiveIntensity: 0.5,
              metalness: 0.7,
              roughness: 0.3,
            });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(
              (p - gridSize / 2) * 3,
              (q - gridSize / 2) * 3,
              0
            );
            group.add(sphere);
          }
        }
      }

      return group;
    }

    function createTropicalGeometry() {
      const group = new THREE.Group();

      // Polyhedral complex
      const vertices = [
        new THREE.Vector3(-10, 0, 0),
        new THREE.Vector3(10, 0, 0),
        new THREE.Vector3(0, 10, 0),
        new THREE.Vector3(0, -10, 0),
        new THREE.Vector3(0, 0, 10),
        new THREE.Vector3(0, 0, -10),
      ];

      const edges = [
        [0, 2], [0, 3], [0, 4], [0, 5],
        [1, 2], [1, 3], [1, 4], [1, 5],
        [2, 4], [2, 5], [3, 4], [3, 5],
      ];

      edges.forEach(([i, j]) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([vertices[i], vertices[j]]);
        const material = new THREE.LineBasicMaterial({
          color: 0x6ee7b7,
          linewidth: 3,
        });
        const line = new THREE.Line(geometry, material);
        group.add(line);
      });

      vertices.forEach(v => {
        const geometry = new THREE.SphereGeometry(0.8, 16, 16);
        const material = new THREE.MeshStandardMaterial({
          color: 0x6ee7b7,
          emissive: 0x6ee7b7,
          emissiveIntensity: 0.8,
          metalness: 0.8,
          roughness: 0.2,
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(v);
        group.add(sphere);
      });

      return group;
    }

    // Add all geometries to scene
    Object.values(geometries).forEach(geom => {
      geom.visible = false;
      scene.add(geom);
    });

    geometries[mode].visible = true;

    // =====================================================================
    // ANIMATION & MORPHING
    // =====================================================================

    let time = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      time += clock.getDelta();

      // Auto-play through modes
      if (playing) {
        setMorphParameter(prev => {
          const next = prev + 0.005;
          if (next >= 1) {
            const currentIdx = modes.findIndex(m => m.id === mode);
            const nextIdx = (currentIdx + 1) % modes.length;
            setMode(modes[nextIdx].id);
            return 0;
          }
          return next;
        });
      }

      // Smooth mode transitions
      Object.entries(geometries).forEach(([key, geom]) => {
        if (key === mode) {
          geom.visible = true;
          geom.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        } else {
          geom.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), 0.1);
          if (geom.scale.x < 0.02) geom.visible = false;
        }
      });

      // Rotate camera
      const radius = 40;
      camera.position.x = Math.sin(time * 0.1) * radius;
      camera.position.z = Math.cos(time * 0.1) * radius;
      camera.lookAt(0, 0, 0);

      // Animate particles
      [geometries.perverse, geometries.characteristic].forEach(geom => {
        if (geom.userData.particles && geom.userData.curve) {
          const positions = geom.userData.particles.geometry.attributes.position.array;
          for (let i = 0; i < positions.length / 3; i++) {
            const t = ((i / (positions.length / 3)) + time * 0.1) % 1;
            const point = geom.userData.curve.getPoint(t);
            positions[i * 3] = point.x;
            positions[i * 3 + 1] = point.y;
            positions[i * 3 + 2] = point.z;
          }
          geom.userData.particles.geometry.attributes.position.needsUpdate = true;
        }
      });

      // Pulse effects
      geometries.stratification.children.forEach((child, i) => {
        if (child.material && child.material.emissiveIntensity !== undefined) {
          child.material.emissiveIntensity = 0.5 + Math.sin(time * 2 + i) * 0.3;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [mode, playing]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: '#000',
      fontFamily: '"Iosevka", "Fira Code", monospace',
    }}>
      {/* 3D Canvas */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Title Overlay */}
      <div style={{
        position: 'absolute',
        top: '3rem',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 300,
          margin: 0,
          background: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 50%, #ffff00 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 40px rgba(0,245,255,0.5)',
          letterSpacing: '-0.02em',
        }}>
          The Grand Unified Visualizer
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#888',
          margin: '0.5rem 0 0 0',
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
        }}>
          Navigate the Space of Mathematical Structures
        </p>
      </div>

      {/* Mode Selector */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '2rem',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              padding: '1rem 1.5rem',
              background: mode === m.id ? `${m.color}40` : 'rgba(255,255,255,0.05)',
              border: `2px solid ${mode === m.id ? m.color : 'rgba(255,255,255,0.2)'}`,
              borderRadius: '8px',
              color: mode === m.id ? m.color : '#888',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: mode === m.id ? 600 : 400,
              textAlign: 'left',
              transition: 'all 0.3s ease',
              minWidth: '200px',
              boxShadow: mode === m.id ? `0 0 20px ${m.color}80` : 'none',
            }}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
      }}>
        <button
          onClick={() => setPlaying(!playing)}
          style={{
            padding: '1rem 2rem',
            background: playing ? 'rgba(255,0,255,0.3)' : 'rgba(0,245,255,0.3)',
            border: `2px solid ${playing ? '#ff00ff' : '#00f5ff'}`,
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            boxShadow: `0 0 20px ${playing ? '#ff00ff' : '#00f5ff'}80`,
          }}
        >
          {playing ? '⏸ Pause' : '▶ Play Tour'}
        </button>

        <div style={{
          padding: '1rem 2rem',
          background: 'rgba(255,255,255,0.05)',
          border: '2px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '0.9rem',
        }}>
          <strong>Mode:</strong> {modes.find(m => m.id === mode)?.name}
        </div>
      </div>

      {/* Info Box */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '2rem',
        transform: 'translateY(-50%)',
        maxWidth: '350px',
        background: 'rgba(0,0,0,0.8)',
        border: '2px solid rgba(255,255,255,0.2)',
        borderRadius: '12px',
        padding: '1.5rem',
        fontSize: '0.9rem',
        lineHeight: '1.7',
        color: '#ccc',
      }}>
        <div style={{ color: modes.find(m => m.id === mode)?.color, fontWeight: 600, marginBottom: '0.75rem', fontSize: '1.1rem' }}>
          {mode === 'stratification' && 'Stratified Space'}
          {mode === 'perverse' && 'Perverse Sheaves'}
          {mode === 'tstructure' && 't-Structure'}
          {mode === 'characteristic' && 'Characteristic Cycles'}
          {mode === 'spectral' && 'Spectral Sequence'}
          {mode === 'tropical' && 'Tropical Shadow'}
        </div>
        <div>
          {mode === 'stratification' && 'The node xy = 0 in ℂ² stratified into smooth branches and singular point. This is where the journey begins.'}
          {mode === 'perverse' && 'The IC sheaf flowing on the stratification. Perverse sheaves are the eigenobjects of Verdier duality.'}
          {mode === 'tstructure' && 'The perverse t-structure. The heart (orange) is where perverse sheaves live—an abelian category inside the derived category.'}
          {mode === 'characteristic' && 'The characteristic cycle CC(IC_X) in T*X. A Lagrangian submanifold encoding microlocal data. Kashiwara: deg(CC) = χ.'}
          {mode === 'spectral' && 'Spectral sequence computing cohomology. Watch differentials kill terms page by page until convergence to E_∞.'}
          {mode === 'tropical' && 'The tropical shadow—a piecewise linear approximation. All the topology, polynomial-time algorithms.'}
        </div>
      </div>
    </div>
  );
};

export default GrandUnifiedVisualizer;
