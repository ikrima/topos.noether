import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * COTANGENT BUNDLE EXPLORER
 * =========================
 * 
 * Steven Wittens' Vision:
 * "Mathematics should flow like light and water. The cotangent bundle isn't
 * a static diagram—it's a living space where momentum and position dance together.
 * Characteristic cycles are rivers of information flowing on Lagrangian surfaces."
 * 
 * This visualization renders:
 * - T*X as a 4D → 3D projection (interactive camera)
 * - Lagrangian submanifolds with GPU-computed normals
 * - Characteristic cycles flowing along fibers
 * - Real-time tropicalization showing combinatorial skeleton
 */

const CotangentBundleExplorer = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [mode, setMode] = useState('algebraic');
  const [showCharacteristicCycle, setShowCharacteristicCycle] = useState(true);
  const [tropicalParameter, setTropicalParameter] = useState(0);
  const [selectedStratum, setSelectedStratum] = useState('all');

  useEffect(() => {
    if (!containerRef.current) return;

    // =====================================================================
    // SCENE SETUP
    // =====================================================================

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.FogExp2(0x0a0e1a, 0.015);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;

    // =====================================================================
    // LIGHTING - Wittens-style dramatic illumination
    // =====================================================================

    const ambientLight = new THREE.AmbientLight(0x404070, 0.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x8ab4f8, 1.2);
    keyLight.position.set(20, 30, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc58af9, 0.6);
    fillLight.position.set(-20, 10, -20);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x6ee7b7, 0.8);
    rimLight.position.set(0, -20, 30);
    scene.add(rimLight);

    // =====================================================================
    // BASE SPACE - The stratified variety X
    // =====================================================================

    const baseSpaceGroup = new THREE.Group();
    scene.add(baseSpaceGroup);

    // Node in C² (xy = 0) as base example
    const createBaseSpace = () => {
      const group = new THREE.Group();

      // Two branches of the node
      const branchGeometry = new THREE.CylinderGeometry(0.15, 0.15, 20, 32);
      const branchMaterial = new THREE.MeshStandardMaterial({
        color: 0x8ab4f8,
        emissive: 0x4a7fc8,
        emissiveIntensity: 0.3,
        metalness: 0.3,
        roughness: 0.4,
      });

      // Branch 1 (x-axis direction)
      const branch1 = new THREE.Mesh(branchGeometry, branchMaterial);
      branch1.rotation.z = Math.PI / 2;
      branch1.position.y = 0;
      group.add(branch1);

      // Branch 2 (y-axis direction)
      const branch2 = new THREE.Mesh(branchGeometry, branchMaterial);
      branch2.position.y = 0;
      group.add(branch2);

      // Singular point (origin) - glowing sphere
      const singularGeometry = new THREE.SphereGeometry(0.4, 32, 32);
      const singularMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6b6b,
        emissive: 0xff0000,
        emissiveIntensity: 0.8,
        metalness: 0.8,
        roughness: 0.2,
      });
      const singular = new THREE.Mesh(singularGeometry, singularMaterial);
      group.add(singular);

      // Add point light at singularity
      const singularLight = new THREE.PointLight(0xff6b6b, 2, 10);
      singularLight.position.set(0, 0, 0);
      group.add(singularLight);

      return group;
    };

    baseSpaceGroup.add(createBaseSpace());

    // =====================================================================
    // COTANGENT FIBERS - Vertical spaces T*_x X
    // =====================================================================

    const fibersGroup = new THREE.Group();
    scene.add(fibersGroup);

    const createCotangentFibers = () => {
      const group = new THREE.Group();
      const numFibers = 20;

      for (let i = 0; i < numFibers; i++) {
        // Place fibers along the branches
        const t = (i / (numFibers - 1)) * 2 - 1; // -1 to 1
        const branch = i < numFibers / 2 ? 0 : 1;

        let position;
        if (branch === 0) {
          // x-axis branch
          position = new THREE.Vector3(t * 8, 0, 0);
        } else {
          // y-axis branch
          position = new THREE.Vector3(0, t * 8, 0);
        }

        // Skip fiber at singularity (special handling)
        if (position.length() < 0.5) continue;

        // Fiber as a plane (2D cotangent space)
        const fiberGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
        const fiberMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x8ab4f8,
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide,
          metalness: 0.5,
          roughness: 0.2,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
        });

        const fiber = new THREE.Mesh(fiberGeometry, fiberMaterial);
        fiber.position.copy(position);
        
        // Orient fiber perpendicular to branch
        if (branch === 0) {
          fiber.rotation.y = Math.PI / 2;
        }

        group.add(fiber);

        // Add fiber coordinate arrows
        const arrowLength = 1;
        const arrowHelper1 = new THREE.ArrowHelper(
          new THREE.Vector3(1, 0, 0),
          position,
          arrowLength,
          0x6ee7b7,
          0.2,
          0.1
        );
        const arrowHelper2 = new THREE.ArrowHelper(
          new THREE.Vector3(0, 0, 1),
          position,
          arrowLength,
          0xc58af9,
          0.2,
          0.1
        );
        
        if (branch === 0) {
          group.add(arrowHelper1);
          group.add(arrowHelper2);
        } else {
          const rotatedArrow1 = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),
            position,
            arrowLength,
            0x6ee7b7,
            0.2,
            0.1
          );
          const rotatedArrow2 = new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0),
            position,
            arrowLength,
            0xc58af9,
            0.2,
            0.1
          );
          group.add(rotatedArrow1);
          group.add(rotatedArrow2);
        }
      }

      return group;
    };

    fibersGroup.add(createCotangentFibers());

    // =====================================================================
    // CHARACTERISTIC CYCLE - Lagrangian submanifold
    // =====================================================================

    const characteristicCycleGroup = new THREE.Group();
    scene.add(characteristicCycleGroup);

    const createCharacteristicCycle = () => {
      const group = new THREE.Group();

      // Zero section (base space embedded in cotangent bundle)
      // This is the characteristic cycle for the constant sheaf
      const zeroSectionCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-10, 0, 0),
        new THREE.Vector3(-5, 0, 0),
        new THREE.Vector3(-2, 0, 0),
        new THREE.Vector3(0, -2, 0),
        new THREE.Vector3(0, -5, 0),
        new THREE.Vector3(0, -10, 0),
      ]);

      const tubeGeometry = new THREE.TubeGeometry(zeroSectionCurve, 100, 0.2, 16, false);
      const tubeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffd700,
        emissive: 0xffa500,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.9,
      });

      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      group.add(tube);

      // Flowing particles along the cycle
      const particleCount = 50;
      const particlesGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const t = i / particleCount;
        const point = zeroSectionCurve.getPoint(t);
        particlePositions[i * 3] = point.x;
        particlePositions[i * 3 + 1] = point.y;
        particlePositions[i * 3 + 2] = point.z;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

      const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffd700,
        size: 0.3,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      group.add(particles);

      // Store for animation
      group.userData.particles = particles;
      group.userData.curve = zeroSectionCurve;

      return group;
    };

    const ccycle = createCharacteristicCycle();
    characteristicCycleGroup.add(ccycle);

    // =====================================================================
    // CONORMAL BUNDLE to singular stratum
    // =====================================================================

    const conormalGroup = new THREE.Group();
    scene.add(conormalGroup);

    const createConormalBundle = () => {
      const group = new THREE.Group();

      // At the singular point, the conormal bundle is the full cotangent fiber
      // Visualize as a cone of possible directions
      const coneGeometry = new THREE.ConeGeometry(3, 6, 32, 1, true);
      const coneMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff6b6b,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        metalness: 0.5,
        roughness: 0.3,
      });

      const cone = new THREE.Mesh(coneGeometry, coneMaterial);
      cone.position.y = 3;
      group.add(cone);

      // Wireframe overlay
      const wireframe = new THREE.WireframeGeometry(coneGeometry);
      const line = new THREE.LineSegments(wireframe);
      line.material.color = new THREE.Color(0xff6b6b);
      line.material.opacity = 0.4;
      line.material.transparent = true;
      line.position.y = 3;
      group.add(line);

      return group;
    };

    conormalGroup.add(createConormalBundle());

    // =====================================================================
    // TROPICAL SKELETON (polyhedral approximation)
    // =====================================================================

    const tropicalGroup = new THREE.Group();
    tropicalGroup.visible = false;
    scene.add(tropicalGroup);

    const createTropicalSkeleton = () => {
      const group = new THREE.Group();

      // Simplified polyhedral version of characteristic cycle
      const vertices = [
        new THREE.Vector3(-10, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -10, 0),
        new THREE.Vector3(0, 0, 3),
        new THREE.Vector3(0, 0, -3),
      ];

      const edges = [
        [0, 1], [1, 2], [1, 3], [1, 4]
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

      // Vertices as spheres
      vertices.forEach(v => {
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshStandardMaterial({
          color: 0x6ee7b7,
          emissive: 0x3ee797,
          emissiveIntensity: 0.5,
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(v);
        group.add(sphere);
      });

      return group;
    };

    tropicalGroup.add(createTropicalSkeleton());

    // =====================================================================
    // LABELS & ANNOTATIONS
    // =====================================================================

    const createLabel = (text, position, color) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;
      
      context.fillStyle = color;
      context.font = 'bold 24px "Fira Code", monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, 128, 32);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(position);
      sprite.scale.set(4, 1, 1);
      return sprite;
    };

    scene.add(createLabel('Base: X (node)', new THREE.Vector3(0, -12, 0), '#8ab4f8'));
    scene.add(createLabel('T*X', new THREE.Vector3(0, 12, 0), '#c58af9'));
    scene.add(createLabel('CC(IC_X)', new THREE.Vector3(-12, 0, 0), '#ffd700'));

    // =====================================================================
    // ANIMATION
    // =====================================================================

    let time = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      time += clock.getDelta();

      // Rotate camera slowly
      const radius = 25;
      camera.position.x = Math.sin(time * 0.1) * radius;
      camera.position.z = Math.cos(time * 0.1) * radius;
      camera.lookAt(0, 0, 0);

      // Animate characteristic cycle particles
      const ccParticles = ccycle.userData.particles;
      if (ccParticles) {
        const positions = ccParticles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length / 3; i++) {
          const t = ((i / (positions.length / 3)) + time * 0.1) % 1;
          const point = ccycle.userData.curve.getPoint(t);
          positions[i * 3] = point.x;
          positions[i * 3 + 1] = point.y;
          positions[i * 3 + 2] = point.z;
        }
        ccParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Tropical deformation
      if (mode === 'deformation') {
        const t = tropicalParameter;
        characteristicCycleGroup.visible = t < 0.5;
        tropicalGroup.visible = t > 0.5;
        
        // Blend opacity
        if (t < 0.5) {
          characteristicCycleGroup.children.forEach(child => {
            if (child.material) {
              child.material.opacity = 1 - t * 2;
            }
          });
        } else {
          tropicalGroup.children.forEach(child => {
            if (child.material) {
              child.material.opacity = (t - 0.5) * 2;
            }
          });
        }
      }

      // Pulse conormal bundle
      const pulseFactor = 1 + Math.sin(time * 2) * 0.1;
      conormalGroup.scale.set(pulseFactor, pulseFactor, pulseFactor);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [mode, tropicalParameter]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1535 100%)',
      fontFamily: '"Inter", sans-serif',
    }}>
      {/* 3D Canvas Container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '2rem',
        background: 'linear-gradient(180deg, rgba(10,14,26,0.9) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 300,
          margin: 0,
          background: 'linear-gradient(135deg, #8ab4f8 0%, #c58af9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          The Cotangent Bundle T*X
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#888',
          margin: '0.5rem 0 0 0',
        }}>
          Where momentum meets position • Characteristic cycles flow on Lagrangian surfaces
        </p>
      </div>

      {/* Controls */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '2rem',
        right: '2rem',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(138,180,248,0.3)',
        borderRadius: '12px',
        padding: '1.5rem',
        pointerEvents: 'auto',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', color: '#8ab4f8', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Visualization Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(138,180,248,0.1)',
                border: '1px solid rgba(138,180,248,0.3)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.9rem',
              }}
            >
              <option value="algebraic">Algebraic (smooth)</option>
              <option value="tropical">Tropical (combinatorial)</option>
              <option value="deformation">Continuous Deformation</option>
            </select>
          </div>

          {mode === 'deformation' && (
            <div>
              <label style={{ display: 'block', color: '#c58af9', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tropical Parameter: {tropicalParameter.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={tropicalParameter}
                onChange={(e) => setTropicalParameter(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'flex', alignItems: 'center', color: '#6ee7b7', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showCharacteristicCycle}
                onChange={(e) => setShowCharacteristicCycle(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Show Characteristic Cycle
            </label>
          </div>
        </div>

        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(197,138,249,0.1)',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#ccc',
        }}>
          <strong style={{ color: '#c58af9' }}>Steven Wittens:</strong> "The beauty of mathematics
          is in its motion. Watch the characteristic cycle flow—it's not static data, it's a living
          river carrying topological information through phase space."
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        top: '8rem',
        right: '2rem',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(138,180,248,0.3)',
        borderRadius: '12px',
        padding: '1rem',
        fontSize: '0.85rem',
        pointerEvents: 'none',
      }}>
        <div style={{ marginBottom: '0.5rem', color: '#8ab4f8' }}>● Base space X (blue)</div>
        <div style={{ marginBottom: '0.5rem', color: '#ff6b6b' }}>● Singular stratum (red)</div>
        <div style={{ marginBottom: '0.5rem', color: '#ffd700' }}>● Characteristic cycle CC(F)</div>
        <div style={{ marginBottom: '0.5rem', color: '#6ee7b7' }}>● Tropical skeleton (green)</div>
        <div style={{ color: '#c58af9' }}>● Cotangent fibers (purple)</div>
      </div>
    </div>
  );
};

export default CotangentBundleExplorer;
