import React, { useState, useEffect, useRef, useCallback } from 'react';

// Composition in ∞-Categories: Witnesses and Coherence
// Visualizing how composition is witnessed by 2-morphisms

const CompositionWitnessExplorer = () => {
  const [step, setStep] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [showWitness, setShowWitness] = useState(false);
  const [compositeProgress, setCompositeProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotation, setRotation] = useState({ x: 0.4, y: 0.3 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(p => (p + 0.02) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Animate composition
  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setCompositeProgress(p => {
        if (p >= 1) {
          setIsAnimating(false);
          setShowWitness(true);
          return 1;
        }
        return p + 0.02;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isAnimating]);

  const handleMouseDown = (e) => {
    if (step === 2) {
      setIsDragging(true);
      lastMouse.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    setRotation(prev => ({
      x: prev.x + dy * 0.005,
      y: prev.y + dx * 0.005
    }));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, [isDragging]);

  const handleMouseUp = () => setIsDragging(false);

  // 2D positions for binary composition
  const pos2D = {
    x: { x: 150, y: 300 },
    y: { x: 400, y: 150 },
    z: { x: 650, y: 300 }
  };

  // 3D positions for associativity tetrahedron
  const project3D = (x, y, z) => {
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    const x2 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;
    
    const scale = 400 / (400 + z2);
    return {
      x: 400 + x2 * scale * 120,
      y: 250 + y1 * scale * 120,
      z: z2
    };
  };

  const tetraVertices = [
    { coords: [0, 1, 0], label: 'x' },
    { coords: [-0.9, -0.5, -0.5], label: 'y' },
    { coords: [0.9, -0.5, -0.5], label: 'z' },
    { coords: [0, -0.3, 1], label: 'w' }
  ];

  const startComposition = () => {
    setCompositeProgress(0);
    setShowWitness(false);
    setIsAnimating(true);
  };

  const renderBinaryComposition = () => {
    const midY = (pos2D.x.y + pos2D.y.y) / 2 + 30;
    const midZ = (pos2D.y.y + pos2D.z.y) / 2 - 30;
    
    // Calculate bezier curve for composite that morphs from segmented to direct
    const compositeStart = {
      c1: { x: pos2D.x.x + 100, y: pos2D.x.y - 50 },
      c2: { x: pos2D.z.x - 100, y: pos2D.z.y - 50 }
    };
    
    // Interpolate control points based on progress
    const getCompositePathD = () => {
      if (compositeProgress < 0.5) {
        // First half: follow f then g
        const t = compositeProgress * 2;
        if (t < 0.5) {
          const subT = t * 2;
          return `M ${pos2D.x.x} ${pos2D.x.y} 
                  Q ${pos2D.x.x + 80} ${pos2D.x.y - 80} 
                    ${pos2D.x.x + (pos2D.y.x - pos2D.x.x) * subT} 
                    ${pos2D.x.y + (pos2D.y.y - pos2D.x.y) * subT}`;
        } else {
          const subT = (t - 0.5) * 2;
          return `M ${pos2D.x.x} ${pos2D.x.y} 
                  Q ${pos2D.x.x + 80} ${pos2D.x.y - 80} ${pos2D.y.x} ${pos2D.y.y}
                  Q ${pos2D.y.x + 80} ${pos2D.y.y + 80} 
                    ${pos2D.y.x + (pos2D.z.x - pos2D.y.x) * subT} 
                    ${pos2D.y.y + (pos2D.z.y - pos2D.y.y) * subT}`;
        }
      } else {
        // Second half: smooth into direct path
        const t = (compositeProgress - 0.5) * 2;
        const c1x = pos2D.y.x - 50 + (pos2D.x.x + 150 - (pos2D.y.x - 50)) * t;
        const c1y = pos2D.y.y - 30 + (pos2D.x.y - 100 - (pos2D.y.y - 30)) * t;
        const c2x = pos2D.y.x + 50 + (pos2D.z.x - 150 - (pos2D.y.x + 50)) * t;
        const c2y = pos2D.y.y - 30 + (pos2D.z.y - 100 - (pos2D.y.y - 30)) * t;
        
        return `M ${pos2D.x.x} ${pos2D.x.y} 
                C ${c1x} ${c1y}, ${c2x} ${c2y}, ${pos2D.z.x} ${pos2D.z.y}`;
      }
    };

    return (
      <g>
        {/* 2-morphism witness triangle */}
        {showWitness && (
          <path
            d={`M ${pos2D.x.x} ${pos2D.x.y} 
                L ${pos2D.y.x} ${pos2D.y.y} 
                L ${pos2D.z.x} ${pos2D.z.y} Z`}
            fill="rgba(99, 102, 241, 0.15)"
            stroke="rgba(99, 102, 241, 0.4)"
            strokeWidth="2"
            strokeDasharray="5,5"
          >
            <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze" />
          </path>
        )}
        
        {/* Arrow f: x → y */}
        <path
          d={`M ${pos2D.x.x + 15} ${pos2D.x.y - 10} 
              Q ${pos2D.x.x + 80} ${pos2D.x.y - 80} 
                ${pos2D.y.x - 15} ${pos2D.y.y + 10}`}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="3"
          markerEnd="url(#arrowBlue)"
        />
        <text x={(pos2D.x.x + pos2D.y.x) / 2 - 30} y={(pos2D.x.y + pos2D.y.y) / 2 - 20}
              fill="#4f46e5" fontSize="20" fontStyle="italic" fontFamily="Georgia, serif">f</text>

        {/* Arrow g: y → z */}
        <path
          d={`M ${pos2D.y.x + 15} ${pos2D.y.y + 10} 
              Q ${pos2D.y.x + 80} ${pos2D.y.y + 80} 
                ${pos2D.z.x - 15} ${pos2D.z.y - 10}`}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="3"
          markerEnd="url(#arrowBlue)"
        />
        <text x={(pos2D.y.x + pos2D.z.x) / 2 + 20} y={(pos2D.y.y + pos2D.z.y) / 2 - 20}
              fill="#4f46e5" fontSize="20" fontStyle="italic" fontFamily="Georgia, serif">g</text>

        {/* Composite g∘f animation */}
        {compositeProgress > 0 && (
          <path
            d={getCompositePathD()}
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
            strokeLinecap="round"
            markerEnd="url(#arrowGreen)"
          />
        )}
        
        {/* Final composite arrow */}
        {showWitness && (
          <>
            <path
              d={`M ${pos2D.x.x + 20} ${pos2D.x.y + 5} 
                  C ${pos2D.x.x + 150} ${pos2D.x.y + 100}, 
                    ${pos2D.z.x - 150} ${pos2D.z.y + 100}, 
                    ${pos2D.z.x - 20} ${pos2D.z.y + 5}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeDasharray="8,4"
              markerEnd="url(#arrowGreen)"
            >
              <animate attributeName="stroke-dashoffset" values="24;0" dur="1s" repeatCount="indefinite" />
            </path>
            <text x={400} y={380}
                  fill="#10b981" fontSize="20" fontStyle="italic" fontFamily="Georgia, serif"
                  textAnchor="middle">g∘f</text>
          </>
        )}

        {/* 2-morphism label */}
        {showWitness && (
          <g>
            <text x={400} y={240}
                  fill="#6366f1" fontSize="18" fontFamily="Georgia, serif"
                  textAnchor="middle">α ≃</text>
            <text x={400} y={260}
                  fill="#64748b" fontSize="12" fontFamily="Georgia, serif"
                  textAnchor="middle">(2-morphism witness)</text>
          </g>
        )}

        {/* Vertices */}
        {[
          { pos: pos2D.x, label: 'x' },
          { pos: pos2D.y, label: 'y' },
          { pos: pos2D.z, label: 'z' }
        ].map(({ pos, label }) => (
          <g key={label}>
            <circle cx={pos.x} cy={pos.y} r={20} fill="#1e1b4b" />
            <text x={pos.x} y={pos.y + 6} textAnchor="middle" fill="white" 
                  fontSize="18" fontWeight="bold" fontFamily="Georgia, serif">{label}</text>
          </g>
        ))}
      </g>
    );
  };

  const renderAssociativityTetrahedron = () => {
    const projected = tetraVertices.map(v => ({
      ...project3D(...v.coords),
      label: v.label
    }));

    // Sort faces by z for proper rendering
    const faces = [
      { verts: [0, 1, 2], label: 'α', color: 'rgba(99, 102, 241, 0.2)' },
      { verts: [1, 2, 3], label: 'β', color: 'rgba(16, 185, 129, 0.2)' },
      { verts: [0, 2, 3], label: 'γ', color: 'rgba(245, 158, 11, 0.2)' },
      { verts: [0, 1, 3], label: 'δ', color: 'rgba(239, 68, 68, 0.2)' }
    ].map(face => ({
      ...face,
      avgZ: face.verts.reduce((s, v) => s + projected[v].z, 0) / 3
    })).sort((a, b) => a.avgZ - b.avgZ);

    // Edges with labels
    const edges = [
      { from: 0, to: 1, label: 'f', color: '#4f46e5' },
      { from: 1, to: 2, label: 'g', color: '#4f46e5' },
      { from: 2, to: 3, label: 'h', color: '#4f46e5' },
      { from: 0, to: 2, label: 'g∘f', color: '#10b981', dashed: true },
      { from: 1, to: 3, label: 'h∘g', color: '#f59e0b', dashed: true },
      { from: 0, to: 3, label: 'h∘g∘f', color: '#ef4444', dashed: true }
    ];

    return (
      <g>
        {/* Faces */}
        {faces.map((face, idx) => {
          const path = `M ${face.verts.map(v => `${projected[v].x} ${projected[v].y}`).join(' L ')} Z`;
          return (
            <path
              key={`face-${idx}`}
              d={path}
              fill={face.color}
              stroke="rgba(100, 116, 139, 0.3)"
              strokeWidth="1"
            />
          );
        })}

        {/* Edges */}
        {edges.map(({ from, to, label, color, dashed }) => {
          const p1 = projected[from];
          const p2 = projected[to];
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          
          return (
            <g key={`edge-${from}-${to}`}>
              <line
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke={color}
                strokeWidth={dashed ? 2 : 3}
                strokeDasharray={dashed ? '6,4' : 'none'}
              />
              <text x={mx} y={my - 8} textAnchor="middle" fill={color}
                    fontSize="14" fontStyle="italic" fontFamily="Georgia, serif">{label}</text>
            </g>
          );
        })}

        {/* Vertices */}
        {projected.map((p, idx) => (
          <g key={`vertex-${idx}`}>
            <circle cx={p.x} cy={p.y} r={18} fill="#1e1b4b" />
            <text x={p.x} y={p.y + 6} textAnchor="middle" fill="white"
                  fontSize="16" fontWeight="bold" fontFamily="Georgia, serif">
              {p.label}
            </text>
          </g>
        ))}

        {/* 3-morphism indicator at center */}
        <circle
          cx={400}
          cy={250}
          r={12 + 4 * Math.sin(animationPhase * 2)}
          fill="rgba(168, 85, 247, 0.4)"
          stroke="#a855f7"
          strokeWidth="2"
        />
        <text x={400} y={254} textAnchor="middle" fill="#a855f7"
              fontSize="14" fontWeight="bold">Γ</text>
      </g>
    );
  };

  const steps = [
    {
      title: "Composable Morphisms",
      desc: "Given 1-morphisms f: x → y and g: y → z, we want to compose them.",
      action: null
    },
    {
      title: "Witnessing Composition",
      desc: "In an ∞-category, composition is witnessed by an invertible 2-morphism α.",
      action: { label: "Compose", fn: startComposition }
    },
    {
      title: "Associativity Tetrahedron",
      desc: "For three composable morphisms f, g, h, associativity h∘(g∘f) = (h∘g)∘f is witnessed by invertible 3-morphisms.",
      action: null
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-slate-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Composition via <span className="text-emerald-600">Witnesses</span>
          </h1>
          <p className="text-slate-600 text-lg" style={{ fontFamily: 'Georgia, serif' }}>
            In ∞-categories, composition isn't a function — it's witnessed by higher morphisms
          </p>
        </div>

        {/* Step selector */}
        <div className="flex justify-center gap-3 mb-6">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setStep(idx);
                if (idx !== 1) {
                  setShowWitness(false);
                  setCompositeProgress(0);
                }
              }}
              className={`px-5 py-3 rounded-xl transition-all ${
                step === idx
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'bg-white text-slate-600 hover:bg-emerald-50'
              }`}
            >
              <div className="font-semibold text-sm">{s.title}</div>
            </button>
          ))}
        </div>

        {/* Info box */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl text-slate-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            {steps[step].title}
          </h2>
          <p className="text-slate-600" style={{ fontFamily: 'Georgia, serif' }}>
            {steps[step].desc}
          </p>
          {steps[step].action && (
            <button
              onClick={steps[step].action.fn}
              disabled={isAnimating}
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isAnimating ? 'Composing...' : steps[step].action.label}
            </button>
          )}
        </div>

        {/* Main visualization */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <svg 
            viewBox="0 0 800 500" 
            className="w-full h-[450px]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: step === 2 ? 'grab' : 'default' }}
          >
            <defs>
              <marker id="arrowBlue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#4f46e5" />
              </marker>
              <marker id="arrowGreen" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
              </marker>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="#e2e8f0" />
              </pattern>
            </defs>
            <rect width="800" height="500" fill="url(#dots)" />
            
            {step < 2 ? renderBinaryComposition() : renderAssociativityTetrahedron()}
            
            {step === 2 && (
              <text x={400} y={480} textAnchor="middle" fill="#94a3b8" fontSize="14">
                Drag to rotate
              </text>
            )}
          </svg>
        </div>

        {/* Key formulas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
            <h3 className="text-lg font-semibold text-indigo-800 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Binary Composition
            </h3>
            <div className="font-mono text-center text-lg mb-3 bg-white rounded-lg p-3">
              <span className="text-indigo-600">f</span> : x → y,{' '}
              <span className="text-indigo-600">g</span> : y → z
              <br />
              ⟹{' '}
              <span className="text-emerald-600">g∘f</span> : x → z
            </div>
            <p className="text-sm text-slate-600" style={{ fontFamily: 'Georgia, serif' }}>
              The composite exists, <em>witnessed</em> by an invertible 2-morphism α 
              filling the triangle. In a quasi-category, this is the inner horn Λ²₁ filler.
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
            <h3 className="text-lg font-semibold text-emerald-800 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Associativity
            </h3>
            <div className="font-mono text-center text-lg mb-3 bg-white rounded-lg p-3">
              h ∘ (g ∘ f) = (h ∘ g) ∘ f
              <br />
              <span className="text-purple-600">witnessed by Γ</span>
            </div>
            <p className="text-sm text-slate-600" style={{ fontFamily: 'Georgia, serif' }}>
              Unlike ordinary categories where this is an <em>equation</em>, in ∞-categories 
              associativity is <em>witnessed</em> by an invertible 3-morphism Γ filling the tetrahedron.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompositionWitnessExplorer;
