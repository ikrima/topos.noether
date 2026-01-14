import React, { useState, useEffect, useRef, useCallback } from 'react';

// Phase wheel color mapping
const phaseToColor = (phase, alpha = 1) => {
  const hue = ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const h = (hue / (2 * Math.PI)) * 360;
  return `hsla(${h}, 85%, 60%, ${alpha})`;
};

const phaseToGradient = (phase) => {
  const c1 = phaseToColor(phase, 0.9);
  const c2 = phaseToColor(phase + Math.PI/3, 0.7);
  return `linear-gradient(135deg, ${c1}, ${c2})`;
};

// ═══════════════════════════════════════════════════════════════════════════
// PANEL 1: LINE BUNDLE HOLONOMY
// Shows parallel transport along curves, the H² story
// ═══════════════════════════════════════════════════════════════════════════

const LineBundlePanel = () => {
  const canvasRef = useRef(null);
  const [time, setTime] = useState(0);
  const [curveProgress, setCurveProgress] = useState(0);
  const [accumulated, setAccumulated] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  
  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setTime(t => t + 0.02);
      setCurveProgress(p => {
        const newP = (p + 0.008) % 1;
        return newP;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [isAnimating]);

  useEffect(() => {
    // Accumulated phase = integral of connection 1-form
    // Simulating A = (1 + 0.3*sin(2θ)) dθ around the circle
    const theta = curveProgress * 2 * Math.PI;
    const connectionValue = 1 + 0.3 * Math.sin(2 * theta);
    setAccumulated(theta * (1 + 0.15 * (1 - Math.cos(2 * theta))));
  }, [curveProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.32;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    // Draw base circle (the manifold M = S¹)
    ctx.strokeStyle = 'rgba(100, 120, 180, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw fibers (the line bundle over the circle)
    const numFibers = 24;
    for (let i = 0; i < numFibers; i++) {
      const theta = (i / numFibers) * 2 * Math.PI;
      const x = cx + radius * Math.cos(theta);
      const y = cy + radius * Math.sin(theta);
      
      // Fiber is a line perpendicular to circle
      const nx = Math.cos(theta);
      const ny = Math.sin(theta);
      const fiberLen = 25;
      
      ctx.strokeStyle = 'rgba(80, 100, 160, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - nx * fiberLen, y - ny * fiberLen);
      ctx.lineTo(x + nx * fiberLen, y + ny * fiberLen);
      ctx.stroke();
    }

    // Draw the path traced so far
    ctx.strokeStyle = phaseToColor(accumulated, 0.8);
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= curveProgress * 100; i++) {
      const t = i / 100;
      const theta = t * 2 * Math.PI;
      const x = cx + radius * Math.cos(theta);
      const y = cy + radius * Math.sin(theta);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw moving point with phase indicator
    const pointTheta = curveProgress * 2 * Math.PI;
    const px = cx + radius * Math.cos(pointTheta);
    const py = cy + radius * Math.sin(pointTheta);

    // Phase indicator on fiber
    const nx = Math.cos(pointTheta);
    const ny = Math.sin(pointTheta);
    const phaseOffset = 20 * Math.sin(accumulated);
    
    // Glow effect
    const gradient = ctx.createRadialGradient(
      px + nx * phaseOffset, py + ny * phaseOffset, 0,
      px + nx * phaseOffset, py + ny * phaseOffset, 20
    );
    gradient.addColorStop(0, phaseToColor(accumulated, 0.9));
    gradient.addColorStop(0.5, phaseToColor(accumulated, 0.3));
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(px + nx * phaseOffset, py + ny * phaseOffset, 20, 0, 2 * Math.PI);
    ctx.fill();

    // Point itself
    ctx.fillStyle = phaseToColor(accumulated);
    ctx.beginPath();
    ctx.arc(px + nx * phaseOffset, py + ny * phaseOffset, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Connection indicator
    ctx.fillStyle = '#fff';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`θ = ${(pointTheta).toFixed(2)}`, cx, cy - 10);
    ctx.fillText(`∮A = ${accumulated.toFixed(3)}`, cx, cy + 10);

  }, [curveProgress, accumulated, time]);

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-number">01</span>
        <h3>Line Bundle Holonomy</h3>
        <span className="cohomology-badge">H²(M, ℤ)</span>
      </div>
      <div className="panel-content">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={280}
          onClick={() => setIsAnimating(!isAnimating)}
          style={{ cursor: 'pointer' }}
        />
        <div className="explanation">
          <p>A <strong>connection</strong> on a line bundle assigns a phase transport rule along curves.</p>
          <p>The <strong>holonomy</strong> ∮A around a loop measures total accumulated phase.</p>
          <p className="formula">hol(γ) = exp(∮<sub>γ</sub> A) ∈ U(1)</p>
        </div>
      </div>
      <div className="phase-wheel">
        <div className="phase-indicator" style={{ 
          background: phaseToGradient(accumulated),
          transform: `rotate(${accumulated}rad)`
        }} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PANEL 2: FIBER PRODUCT VISUALIZATION
// Shows Y → M, Y^[2], and the bundle gerbe structure
// ═══════════════════════════════════════════════════════════════════════════

const FiberProductPanel = () => {
  const canvasRef = useRef(null);
  const [selectedFiber, setSelectedFiber] = useState(2);
  const [selectedPoints, setSelectedPoints] = useState([0, 2]);
  const [showProduct, setShowProduct] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.03), 16);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    // Base manifold M (a line segment for simplicity)
    const baseY = h * 0.75;
    const baseStart = 40;
    const baseEnd = w - 40;
    
    ctx.strokeStyle = 'rgba(100, 120, 180, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(baseStart, baseY);
    ctx.lineTo(baseEnd, baseY);
    ctx.stroke();

    // Label
    ctx.fillStyle = 'rgba(150, 170, 220, 0.8)';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('M (base manifold)', w/2, baseY + 25);

    // Fibers over M
    const numFibers = 5;
    const fiberHeight = 120;
    const fiberSpacing = (baseEnd - baseStart) / (numFibers - 1);
    
    const fibers = [];
    for (let i = 0; i < numFibers; i++) {
      const x = baseStart + i * fiberSpacing;
      fibers.push({ x, baseY, points: [] });
      
      // Draw fiber
      const isSelected = i === selectedFiber;
      ctx.strokeStyle = isSelected ? 'rgba(120, 180, 255, 0.7)' : 'rgba(80, 100, 160, 0.3)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x, baseY - fiberHeight);
      ctx.stroke();

      // Points on fiber (elements of Y)
      const numPoints = 4;
      for (let j = 0; j < numPoints; j++) {
        const py = baseY - 20 - j * 28;
        fibers[i].points.push({ x, y: py, fiberIdx: i, pointIdx: j });
        
        const isPointSelected = isSelected && selectedPoints.includes(j);
        
        ctx.fillStyle = isPointSelected 
          ? phaseToColor(j * Math.PI/2 + time, 0.9)
          : 'rgba(100, 130, 180, 0.5)';
        ctx.beginPath();
        ctx.arc(x, py, isPointSelected ? 7 : 4, 0, 2 * Math.PI);
        ctx.fill();

        if (isPointSelected) {
          // Glow
          const glow = ctx.createRadialGradient(x, py, 0, x, py, 15);
          glow.addColorStop(0, phaseToColor(j * Math.PI/2 + time, 0.5));
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, py, 15, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    // Draw Y^[2] visualization when we have selected points
    if (selectedPoints.length >= 2) {
      const p1 = fibers[selectedFiber].points[selectedPoints[0]];
      const p2 = fibers[selectedFiber].points[selectedPoints[1]];
      
      // Line bundle P over Y^[2] - visualized as a connection between points
      ctx.strokeStyle = phaseToColor(time * 2, 0.7);
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Phase element of P_{(y1, y2)}
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      
      ctx.fillStyle = phaseToColor(time * 2);
      ctx.beginPath();
      ctx.arc(midX + 15, midY, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`P(y₁,y₂)`, midX + 25, midY + 4);
    }

    // Show product structure if enabled and we have 3 points
    if (showProduct && selectedPoints.length >= 2) {
      const pts = fibers[selectedFiber].points;
      const [i, j] = selectedPoints;
      const k = (j + 1) % pts.length;
      
      // Draw the triangle showing P_{ij} ⊗ P_{jk} → P_{ik}
      ctx.strokeStyle = 'rgba(255, 200, 100, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pts[i].x - 30, pts[i].y);
      ctx.lineTo(pts[j].x - 30, pts[j].y);
      ctx.lineTo(pts[k].x - 30, pts[k].y);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 200, 100, 0.8)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('P₁₂ ⊗ P₂₃ → P₁₃', pts[j].x - 80, pts[j].y);
    }

    // Y label
    ctx.fillStyle = 'rgba(150, 170, 220, 0.8)';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Y (fibration)', w/2, 20);

  }, [selectedFiber, selectedPoints, showProduct, time]);

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-number">02</span>
        <h3>Bundle Gerbe Structure</h3>
        <span className="cohomology-badge">Y<sup>[2]</sup> → M</span>
      </div>
      <div className="panel-content">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={280}
        />
        <div className="controls">
          <label>
            Fiber: 
            <input 
              type="range" 
              min="0" 
              max="4" 
              value={selectedFiber}
              onChange={e => setSelectedFiber(parseInt(e.target.value))}
            />
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={showProduct}
              onChange={e => setShowProduct(e.target.checked)}
            />
            Show product
          </label>
        </div>
        <div className="explanation">
          <p><strong>Y → M</strong>: fibration with fiber points = local trivializations</p>
          <p><strong>Y<sup>[2]</sup></strong>: pairs (y₁, y₂) in same fiber</p>
          <p><strong>P → Y<sup>[2]</sup></strong>: line bundle comparing trivializations</p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PANEL 3: SURFACE HOLONOMY / WZW
// Shows the gerbe holonomy over surfaces
// ═══════════════════════════════════════════════════════════════════════════

const SurfaceHolonomyPanel = () => {
  const canvasRef = useRef(null);
  const [surfaceRadius, setSurfaceRadius] = useState(0.5);
  const [time, setTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.02), 16);
    return () => clearInterval(interval);
  }, []);

  // Holonomy = exp(∫∫_Σ B) where B is the curving 2-form
  // For visualization: holonomy depends on "area" of surface
  const holonomy = surfaceRadius * surfaceRadius * Math.PI * 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    // Draw 3D-ish sphere representing the base space
    const sphereRadius = 80;
    
    // Background field lines (the B-field)
    ctx.strokeStyle = 'rgba(60, 80, 140, 0.15)';
    ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
      for (let j = -5; j <= 5; j++) {
        const x = cx + i * 25;
        const y = cy + j * 25;
        const angle = Math.atan2(y - cy, x - cx) + Math.PI/2 + time * 0.3;
        const len = 10;
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(angle) * len, y - Math.sin(angle) * len);
        ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
        ctx.stroke();
      }
    }

    // Draw the surface Σ (a disk)
    const diskRadius = surfaceRadius * sphereRadius;
    
    // Filled disk with phase color
    const diskGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, diskRadius);
    diskGrad.addColorStop(0, phaseToColor(holonomy, 0.6));
    diskGrad.addColorStop(0.7, phaseToColor(holonomy, 0.3));
    diskGrad.addColorStop(1, phaseToColor(holonomy, 0.1));
    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, diskRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Disk boundary
    ctx.strokeStyle = phaseToColor(holonomy, 0.9);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, diskRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Animated "flux" through surface
    const numFluxLines = 8;
    for (let i = 0; i < numFluxLines; i++) {
      const angle = (i / numFluxLines) * 2 * Math.PI + time;
      const r = diskRadius * 0.6 * (0.5 + 0.5 * Math.sin(time * 2 + i));
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      
      ctx.fillStyle = phaseToColor(holonomy + i, 0.7);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Σ (surface)', cx, cy + diskRadius + 25);
    ctx.fillText(`∫∫B = ${holonomy.toFixed(3)}`, cx, cy);

    // Draw outer sphere outline  
    ctx.strokeStyle = 'rgba(100, 120, 180, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, sphereRadius + 20, 0, 2 * Math.PI);
    ctx.stroke();

  }, [surfaceRadius, holonomy, time]);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.height / 2;
    const dist = Math.sqrt(x*x + y*y);
    setSurfaceRadius(Math.min(1.2, Math.max(0.1, dist / 80)));
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-number">03</span>
        <h3>Surface Holonomy</h3>
        <span className="cohomology-badge">H³(M, ℤ)</span>
      </div>
      <div className="panel-content">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={280}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        />
        <div className="explanation">
          <p>Drag to resize the surface Σ</p>
          <p>A <strong>gerbe connection</strong> has holonomy over surfaces:</p>
          <p className="formula">hol(Σ) = exp(∫∫<sub>Σ</sub> B) ∈ U(1)</p>
          <p>This is the <strong>WZW term</strong> in physics!</p>
        </div>
      </div>
      <div className="phase-wheel">
        <div className="phase-indicator" style={{ 
          background: phaseToGradient(holonomy),
          transform: `rotate(${holonomy}rad)`
        }} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PANEL 4: THE COCYCLE CONDITION
// Animates the associativity / coherence condition
// ═══════════════════════════════════════════════════════════════════════════

const CocyclePanel = () => {
  const canvasRef = useRef(null);
  const [time, setTime] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => {
        const newTime = t + 0.02;
        setActiveStep(Math.floor((newTime * 0.5) % 4));
        return newTime;
      });
    }, 16);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    // Draw tetrahedron representing the cocycle condition
    // g_αβγ · g_αγδ = g_βγδ · g_αβδ
    
    const cx = w / 2;
    const cy = h / 2 - 20;
    const size = 70;

    // Tetrahedron vertices
    const vertices = [
      { x: cx, y: cy - size, label: 'α' },
      { x: cx - size * 0.9, y: cy + size * 0.5, label: 'β' },
      { x: cx + size * 0.9, y: cy + size * 0.5, label: 'γ' },
      { x: cx, y: cy + size * 0.2, label: 'δ' } // center-ish for 3D effect
    ];

    // Edges with their cocycle values
    const edges = [
      { from: 0, to: 1, label: 'g_αβ' },
      { from: 0, to: 2, label: 'g_αγ' },
      { from: 0, to: 3, label: 'g_αδ' },
      { from: 1, to: 2, label: 'g_βγ' },
      { from: 1, to: 3, label: 'g_βδ' },
      { from: 2, to: 3, label: 'g_γδ' },
    ];

    // Faces (triangles) - the 2-cocycle condition applies here
    const faces = [
      { verts: [0, 1, 2], label: 'g_αβγ', color: 0 },
      { verts: [0, 1, 3], label: 'g_αβδ', color: 1 },
      { verts: [0, 2, 3], label: 'g_αγδ', color: 2 },
      { verts: [1, 2, 3], label: 'g_βγδ', color: 3 },
    ];

    // Draw faces with subtle fill
    faces.forEach((face, i) => {
      const isActive = i === activeStep;
      ctx.fillStyle = phaseToColor(i * Math.PI/2 + time, isActive ? 0.3 : 0.1);
      ctx.beginPath();
      ctx.moveTo(vertices[face.verts[0]].x, vertices[face.verts[0]].y);
      ctx.lineTo(vertices[face.verts[1]].x, vertices[face.verts[1]].y);
      ctx.lineTo(vertices[face.verts[2]].x, vertices[face.verts[2]].y);
      ctx.closePath();
      ctx.fill();
    });

    // Draw edges
    edges.forEach(edge => {
      ctx.strokeStyle = 'rgba(120, 150, 200, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(vertices[edge.from].x, vertices[edge.from].y);
      ctx.lineTo(vertices[edge.to].x, vertices[edge.to].y);
      ctx.stroke();
    });

    // Draw vertices
    vertices.forEach((v, i) => {
      ctx.fillStyle = phaseToColor(i * Math.PI/2, 0.9);
      ctx.beginPath();
      ctx.arc(v.x, v.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(v.label, v.x, v.y + 4);
    });

    // Show the cocycle equation
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Cocycle condition:', cx, h - 60);
    ctx.fillText('g_αβγ · g_αγδ = g_βγδ · g_αβδ', cx, h - 40);
    
    // Active face highlight
    const activeFace = faces[activeStep];
    ctx.fillStyle = phaseToColor(activeStep * Math.PI/2 + time, 0.9);
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText(activeFace.label, cx, h - 20);

  }, [time, activeStep]);

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-number">04</span>
        <h3>Čech 2-Cocycle</h3>
        <span className="cohomology-badge">δg = 1</span>
      </div>
      <div className="panel-content">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={280}
        />
        <div className="explanation">
          <p>On <strong>quadruple overlaps</strong> U<sub>αβγδ</sub>:</p>
          <p>The cocycle condition ensures coherence.</p>
          <p>Each face is a <strong>Dixmier-Douady</strong> contribution.</p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DIMENSIONAL LADDER DIAGRAM
// ═══════════════════════════════════════════════════════════════════════════

const DimensionalLadder = () => {
  return (
    <div className="ladder-container">
      <h2>The Dimensional Ladder</h2>
      <div className="ladder">
        <div className="ladder-rung">
          <div className="dimension">n=1</div>
          <div className="arrow">→</div>
          <div className="object">Function f: M → ℂ×</div>
          <div className="arrow">→</div>
          <div className="cohomology">H¹(M, ℂ×)</div>
        </div>
        <div className="ladder-connector">↓ categorify</div>
        <div className="ladder-rung highlight">
          <div className="dimension">n=2</div>
          <div className="arrow">→</div>
          <div className="object">Line Bundle L → M</div>
          <div className="arrow">→</div>
          <div className="cohomology">H²(M, ℤ)</div>
          <div className="detail">Chern class</div>
        </div>
        <div className="ladder-connector">↓ categorify</div>
        <div className="ladder-rung highlight-strong">
          <div className="dimension">n=3</div>
          <div className="arrow">→</div>
          <div className="object">Bundle Gerbe (P, Y, M)</div>
          <div className="arrow">→</div>
          <div className="cohomology">H³(M, ℤ)</div>
          <div className="detail">Dixmier-Douady class</div>
        </div>
        <div className="ladder-connector">↓ categorify</div>
        <div className="ladder-rung">
          <div className="dimension">n=4</div>
          <div className="arrow">→</div>
          <div className="object">2-Gerbe</div>
          <div className="arrow">→</div>
          <div className="cohomology">H⁴(M, ℤ)</div>
        </div>
      </div>
      <div className="ladder-insight">
        <strong>Pattern:</strong> Each level replaces "equality" with "isomorphism", 
        functions become bundles, bundles become gerbes.
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════

export default function BundleGerbeExplorer() {
  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        .app {
          min-height: 100vh;
          background: linear-gradient(180deg, #06060a 0%, #0c0c14 50%, #0a0a10 100%);
          color: #e0e4f0;
          font-family: 'Crimson Pro', Georgia, serif;
          padding: 2rem;
          overflow-x: hidden;
        }
        
        .header {
          text-align: center;
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(100, 120, 180, 0.2);
        }
        
        .header h1 {
          font-family: 'Crimson Pro', serif;
          font-size: 2.2rem;
          font-weight: 400;
          letter-spacing: 0.05em;
          color: #fff;
          margin-bottom: 0.5rem;
        }
        
        .header .subtitle {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          color: rgba(150, 170, 220, 0.8);
          letter-spacing: 0.1em;
        }
        
        .panels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
          max-width: 1400px;
          margin: 0 auto 2rem;
        }
        
        .panel {
          background: rgba(15, 15, 25, 0.8);
          border: 1px solid rgba(80, 100, 160, 0.3);
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }
        
        .panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, 
            rgba(100, 150, 255, 0.5), 
            rgba(200, 100, 255, 0.5), 
            rgba(100, 150, 255, 0.5));
        }
        
        .panel-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(20, 25, 40, 0.5);
          border-bottom: 1px solid rgba(80, 100, 160, 0.2);
        }
        
        .panel-number {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: rgba(150, 170, 220, 0.6);
          padding: 0.2rem 0.4rem;
          background: rgba(100, 120, 180, 0.15);
          border-radius: 3px;
        }
        
        .panel-header h3 {
          font-family: 'Crimson Pro', serif;
          font-size: 1.1rem;
          font-weight: 500;
          flex: 1;
        }
        
        .cohomology-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: rgba(200, 150, 255, 0.9);
          padding: 0.2rem 0.5rem;
          background: rgba(150, 100, 200, 0.15);
          border-radius: 3px;
          border: 1px solid rgba(150, 100, 200, 0.3);
        }
        
        .panel-content {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .panel-content canvas {
          border-radius: 4px;
          margin-bottom: 0.75rem;
        }
        
        .explanation {
          font-size: 0.9rem;
          line-height: 1.5;
          color: rgba(200, 210, 230, 0.85);
          text-align: center;
        }
        
        .explanation p {
          margin-bottom: 0.4rem;
        }
        
        .explanation strong {
          color: rgba(150, 200, 255, 0.95);
        }
        
        .formula {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          color: rgba(255, 220, 150, 0.9);
          background: rgba(100, 80, 50, 0.15);
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          margin: 0.5rem 0;
          display: inline-block;
        }
        
        .controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: rgba(150, 170, 200, 0.8);
        }
        
        .controls label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .controls input[type="range"] {
          width: 80px;
          accent-color: rgba(150, 180, 255, 0.8);
        }
        
        .controls input[type="checkbox"] {
          accent-color: rgba(150, 180, 255, 0.8);
        }
        
        .phase-wheel {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: conic-gradient(
            hsl(0, 85%, 60%),
            hsl(60, 85%, 60%),
            hsl(120, 85%, 60%),
            hsl(180, 85%, 60%),
            hsl(240, 85%, 60%),
            hsl(300, 85%, 60%),
            hsl(360, 85%, 60%)
          );
          opacity: 0.3;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .phase-indicator {
          width: 20px;
          height: 4px;
          border-radius: 2px;
          transform-origin: left center;
        }
        
        .ladder-container {
          max-width: 900px;
          margin: 2rem auto;
          padding: 1.5rem;
          background: rgba(15, 15, 25, 0.6);
          border: 1px solid rgba(80, 100, 160, 0.25);
          border-radius: 8px;
        }
        
        .ladder-container h2 {
          font-family: 'Crimson Pro', serif;
          font-size: 1.4rem;
          font-weight: 400;
          text-align: center;
          margin-bottom: 1.5rem;
          color: rgba(220, 230, 255, 0.95);
        }
        
        .ladder {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .ladder-rung {
          display: grid;
          grid-template-columns: 50px 30px 1fr 30px 120px;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          background: rgba(30, 35, 55, 0.4);
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          position: relative;
        }
        
        .ladder-rung.highlight {
          background: rgba(60, 80, 140, 0.25);
          border: 1px solid rgba(100, 130, 200, 0.3);
        }
        
        .ladder-rung.highlight-strong {
          background: rgba(100, 80, 160, 0.25);
          border: 1px solid rgba(160, 120, 220, 0.4);
        }
        
        .ladder-rung .dimension {
          color: rgba(200, 180, 255, 0.9);
          font-weight: 500;
        }
        
        .ladder-rung .arrow {
          color: rgba(150, 170, 200, 0.5);
          text-align: center;
        }
        
        .ladder-rung .object {
          color: rgba(180, 220, 255, 0.9);
        }
        
        .ladder-rung .cohomology {
          color: rgba(255, 200, 150, 0.9);
          text-align: right;
        }
        
        .ladder-rung .detail {
          position: absolute;
          right: -120px;
          font-size: 0.75rem;
          color: rgba(150, 170, 200, 0.6);
          font-style: italic;
        }
        
        .ladder-connector {
          text-align: center;
          color: rgba(150, 200, 150, 0.7);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          padding: 0.2rem;
        }
        
        .ladder-insight {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(50, 60, 100, 0.2);
          border-left: 3px solid rgba(150, 180, 255, 0.5);
          font-size: 0.95rem;
          line-height: 1.5;
        }
        
        .ladder-insight strong {
          color: rgba(180, 200, 255, 0.95);
        }
        
        .footer-note {
          max-width: 800px;
          margin: 2rem auto 0;
          text-align: center;
          font-size: 0.9rem;
          color: rgba(150, 160, 190, 0.7);
          line-height: 1.6;
        }
        
        .footer-note em {
          color: rgba(200, 180, 255, 0.8);
        }
        
        @media (max-width: 768px) {
          .app {
            padding: 1rem;
          }
          
          .panels-grid {
            grid-template-columns: 1fr;
          }
          
          .ladder-rung {
            grid-template-columns: 40px 20px 1fr;
            font-size: 0.75rem;
          }
          
          .ladder-rung .cohomology,
          .ladder-rung .arrow:last-of-type,
          .ladder-rung .detail {
            display: none;
          }
        }
      `}</style>
      
      <header className="header">
        <h1>Bundle Gerbes</h1>
        <div className="subtitle">GEOMETRIC REALISATION OF H³(M, ℤ)</div>
      </header>
      
      <div className="panels-grid">
        <LineBundlePanel />
        <FiberProductPanel />
        <SurfaceHolonomyPanel />
        <CocyclePanel />
      </div>
      
      <DimensionalLadder />
      
      <p className="footer-note">
        <em>Murray's insight:</em> Replace abstract sheaves of groupoids with concrete geometry — 
        a fibration Y → M carrying a line bundle P → Y<sup>[2]</sup> with an associative product.
        The Dixmier-Douady class measures the obstruction to triviality.
      </p>
    </div>
  );
}
