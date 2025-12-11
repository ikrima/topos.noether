import React, { useState, useEffect, useRef, useCallback } from 'react';

// Hom-Spaces: From Sets to ∞-Groupoids
// The crucial conceptual shift in ∞-category theory

const HomSpacesExplorer = () => {
  const [viewMode, setViewMode] = useState('set'); // 'set', 'groupoid', 'space'
  const [selectedMorphism, setSelectedMorphism] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [homotopyT, setHomotopyT] = useState(0.5);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pathCount, setPathCount] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(p => (p + 0.015) % (Math.PI * 2));
      if (isAnimating) {
        setHomotopyT(t => {
          const newT = t + 0.01;
          return newT > 1 ? 0 : newT;
        });
      }
    }, 30);
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Generate paths between two points with varying curvature
  const generatePaths = (count) => {
    const paths = [];
    for (let i = 0; i < count; i++) {
      const curveStrength = (i - (count - 1) / 2) * 60;
      paths.push({
        id: `f${i}`,
        label: i === Math.floor(count / 2) ? 'f' : `f${subscript(i)}`,
        curve: curveStrength,
        color: `hsl(${220 + i * 30}, 70%, 55%)`
      });
    }
    return paths;
  };

  const paths = generatePaths(pathCount);

  // Interpolate between two paths
  const getInterpolatedPath = (path1, path2, t) => {
    return path1.curve + (path2.curve - path1.curve) * t;
  };

  // The Hom-Set view (discrete points)
  const HomSetView = () => (
    <div className="relative h-full flex flex-col">
      <div className="text-center p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>
          Hom-Set: Hom<sub>C</sub>(X, Y)
        </h3>
        <p className="text-sm text-slate-500">A discrete set of morphisms</p>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <svg viewBox="0 0 400 300" className="w-full h-full max-h-64">
          {/* Set boundary */}
          <ellipse 
            cx="200" cy="150" rx="150" ry="100" 
            fill="none" 
            stroke="#cbd5e1" 
            strokeWidth="2"
            strokeDasharray="8,4"
          />
          <text x="200" y="30" textAnchor="middle" fill="#64748b" fontSize="14"
                fontFamily="Georgia, serif">
            Set
          </text>
          
          {/* Morphisms as discrete points */}
          {paths.map((path, i) => {
            const angle = (i / paths.length) * Math.PI * 2 - Math.PI / 2;
            const r = 60;
            const x = 200 + Math.cos(angle) * r;
            const y = 150 + Math.sin(angle) * r;
            const isSelected = selectedMorphism === path.id;
            
            return (
              <g key={path.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 24 : 20}
                  fill={path.color}
                  stroke={isSelected ? '#1e293b' : 'none'}
                  strokeWidth="3"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => setSelectedMorphism(path.id)}
                />
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  fontStyle="italic"
                  style={{ pointerEvents: 'none' }}
                >
                  {path.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      <div className="p-4 bg-slate-50 rounded-b-xl">
        <p className="text-sm text-slate-600" style={{ fontFamily: 'Georgia, serif' }}>
          In ordinary categories, morphisms form a <strong>set</strong>. Two morphisms are either 
          equal or not — there's no notion of "how similar" they are.
        </p>
      </div>
    </div>
  );

  // The Hom-Groupoid view (with explicit 2-morphisms)
  const HomGroupoidView = () => {
    const centerX = 200, centerY = 150;
    
    return (
      <div className="relative h-full flex flex-col">
        <div className="text-center p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>
            Hom-Groupoid: Map<sub>C</sub>(X, Y)
          </h3>
          <p className="text-sm text-slate-500">Morphisms with 2-morphisms (homotopies) between them</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <svg viewBox="0 0 400 300" className="w-full h-full max-h-64">
            {/* 2-morphisms between adjacent paths */}
            {paths.slice(0, -1).map((path, i) => {
              const nextPath = paths[i + 1];
              const angle1 = (i / paths.length) * Math.PI * 2 - Math.PI / 2;
              const angle2 = ((i + 1) / paths.length) * Math.PI * 2 - Math.PI / 2;
              const r = 60;
              const x1 = centerX + Math.cos(angle1) * r;
              const y1 = centerY + Math.sin(angle1) * r;
              const x2 = centerX + Math.cos(angle2) * r;
              const y2 = centerY + Math.sin(angle2) * r;
              
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;
              const pulse = 0.8 + 0.2 * Math.sin(animationPhase + i);
              
              return (
                <g key={`2morph-${i}`}>
                  {/* Surface between morphisms */}
                  <path
                    d={`M ${x1} ${y1} Q ${centerX} ${centerY} ${x2} ${y2}`}
                    fill="none"
                    stroke={`hsl(${220 + i * 30}, 50%, 70%)`}
                    strokeWidth="12"
                    opacity={0.3 * pulse}
                    strokeLinecap="round"
                  />
                  {/* 2-morphism arrow */}
                  <path
                    d={`M ${x1 + 15} ${y1} Q ${midX} ${midY - 10} ${x2 - 15} ${y2}`}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    markerEnd="url(#arrow2morph)"
                    strokeDasharray="4,2"
                  />
                  {/* Label */}
                  <text
                    x={midX}
                    y={midY - 15}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                    fontStyle="italic"
                  >
                    α{subscript(i)}
                  </text>
                </g>
              );
            })}
            
            <defs>
              <marker id="arrow2morph" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="#94a3b8" />
              </marker>
            </defs>
            
            {/* Morphisms as vertices */}
            {paths.map((path, i) => {
              const angle = (i / paths.length) * Math.PI * 2 - Math.PI / 2;
              const r = 60;
              const x = centerX + Math.cos(angle) * r;
              const y = centerY + Math.sin(angle) * r;
              const isSelected = selectedMorphism === path.id;
              
              return (
                <g key={path.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 22 : 18}
                    fill={path.color}
                    stroke={isSelected ? '#1e293b' : 'white'}
                    strokeWidth={isSelected ? 3 : 2}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onClick={() => setSelectedMorphism(path.id)}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    fontStyle="italic"
                    style={{ pointerEvents: 'none' }}
                  >
                    {path.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        
        <div className="p-4 bg-slate-50 rounded-b-xl">
          <p className="text-sm text-slate-600" style={{ fontFamily: 'Georgia, serif' }}>
            In ∞-categories, morphisms form a <strong>groupoid</strong> (or ∞-groupoid). 
            The 2-morphisms α<sub>i</sub> are <em>invertible</em> homotopies between 1-morphisms.
          </p>
        </div>
      </div>
    );
  };

  // The Hom-Space view (continuous space)
  const HomSpaceView = () => {
    const width = 400, height = 300;
    const startX = 80, startY = height / 2;
    const endX = width - 80, endY = height / 2;
    
    // Generate interpolated path at current homotopy parameter
    const getCurrentCurve = () => {
      const t = homotopyT * (paths.length - 1);
      const i = Math.floor(t);
      const frac = t - i;
      
      if (i >= paths.length - 1) return paths[paths.length - 1].curve;
      return getInterpolatedPath(paths[i], paths[i + 1], frac);
    };

    const getPathD = (curve) => {
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2 - curve;
      return `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
    };
    
    return (
      <div className="relative h-full flex flex-col">
        <div className="text-center p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>
            Hom-Space: Map<sub>C</sub>(X, Y)
          </h3>
          <p className="text-sm text-slate-500">A continuous space of morphisms (an ∞-groupoid)</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-h-64">
            <defs>
              <linearGradient id="spaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0e7ff" />
                <stop offset="100%" stopColor="#c7d2fe" />
              </linearGradient>
              <marker id="arrowPath" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#4f46e5" />
              </marker>
              <marker id="arrowCurrent" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
              </marker>
            </defs>
            
            {/* Space visualization - family of paths */}
            {Array.from({ length: 30 }, (_, i) => {
              const t = i / 29;
              const idx = t * (paths.length - 1);
              const i1 = Math.floor(idx);
              const frac = idx - i1;
              const curve = i1 >= paths.length - 1 
                ? paths[paths.length - 1].curve 
                : getInterpolatedPath(paths[i1], paths[Math.min(i1 + 1, paths.length - 1)], frac);
              
              return (
                <path
                  key={i}
                  d={getPathD(curve)}
                  fill="none"
                  stroke={`hsl(${220 + t * 60}, 60%, 65%)`}
                  strokeWidth="1.5"
                  opacity={0.4}
                />
              );
            })}
            
            {/* Named paths */}
            {paths.map((path, i) => (
              <path
                key={path.id}
                d={getPathD(path.curve)}
                fill="none"
                stroke={path.color}
                strokeWidth="2.5"
                markerEnd="url(#arrowPath)"
                opacity={0.8}
              />
            ))}
            
            {/* Current position in homotopy */}
            <path
              d={getPathD(getCurrentCurve())}
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              markerEnd="url(#arrowCurrent)"
            />
            
            {/* Endpoints */}
            <g>
              <circle cx={startX} cy={startY} r={20} fill="#1e293b" />
              <text x={startX} y={startY + 6} textAnchor="middle" fill="white" 
                    fontSize="16" fontWeight="bold">X</text>
            </g>
            <g>
              <circle cx={endX} cy={endY} r={20} fill="#1e293b" />
              <text x={endX} y={endY + 6} textAnchor="middle" fill="white" 
                    fontSize="16" fontWeight="bold">Y</text>
            </g>
            
            {/* Homotopy parameter indicator */}
            <rect x={width / 2 - 80} y={height - 35} width={160} height={25} rx="12" fill="white" stroke="#e2e8f0" />
            <text x={width / 2} y={height - 18} textAnchor="middle" fill="#475569" fontSize="12">
              homotopy: t = {homotopyT.toFixed(2)}
            </text>
          </svg>
        </div>
        
        {/* Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`px-4 py-2 rounded-lg transition-all ${
                isAnimating 
                  ? 'bg-red-500 text-white' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {isAnimating ? '⏸ Pause' : '▶ Animate'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={homotopyT}
              onChange={(e) => setHomotopyT(parseFloat(e.target.value))}
              className="flex-1"
            />
          </div>
          <p className="text-sm text-slate-600" style={{ fontFamily: 'Georgia, serif' }}>
            The mapping space is a <strong>continuous</strong> family of morphisms. 
            Scrub the parameter to move through the space — every point is a valid morphism!
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-slate-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            From Hom-<span className="text-blue-600">Sets</span> to Hom-<span className="text-purple-600">Spaces</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
            The revolutionary shift: in ∞-categories, morphisms don't just form sets — 
            they form <em>spaces</em> with their own rich homotopical structure.
          </p>
        </div>

        {/* Mode selector */}
        <div className="flex justify-center gap-3 mb-6">
          {[
            { id: 'set', label: 'Hom-Set', desc: '1-categories', color: 'blue' },
            { id: 'groupoid', label: 'Hom-Groupoid', desc: '2-categories', color: 'violet' },
            { id: 'space', label: 'Hom-Space', desc: '∞-categories', color: 'purple' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-5 py-3 rounded-xl transition-all ${
                viewMode === mode.id
                  ? `bg-${mode.color}-600 text-white shadow-lg shadow-${mode.color}-200`
                  : 'bg-white text-slate-600 hover:bg-slate-50 shadow'
              }`}
              style={{
                backgroundColor: viewMode === mode.id ? 
                  (mode.color === 'blue' ? '#2563eb' : mode.color === 'violet' ? '#7c3aed' : '#9333ea') : undefined
              }}
            >
              <div className="font-semibold">{mode.label}</div>
              <div className="text-xs opacity-70">{mode.desc}</div>
            </button>
          ))}
        </div>

        {/* Path count control */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <span className="text-slate-600 text-sm">Number of morphisms:</span>
          <input
            type="range"
            min="2"
            max="7"
            value={pathCount}
            onChange={(e) => setPathCount(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-slate-800 font-semibold w-8">{pathCount}</span>
        </div>

        {/* Main visualization */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6" style={{ minHeight: 450 }}>
          {viewMode === 'set' && <HomSetView />}
          {viewMode === 'groupoid' && <HomGroupoidView />}
          {viewMode === 'space' && <HomSpaceView />}
        </div>

        {/* Comparison table */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            The Evolution of Morphism Collections
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className={`p-4 rounded-xl ${viewMode === 'set' ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-slate-50'}`}>
              <h4 className="font-semibold text-blue-700 mb-2">1-Categories</h4>
              <p className="text-slate-600" style={{ fontFamily: 'Georgia, serif' }}>
                Hom(X,Y) is a <strong>set</strong>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                f = g or f ≠ g (equality is boolean)
              </p>
            </div>
            <div className={`p-4 rounded-xl ${viewMode === 'groupoid' ? 'ring-2 ring-violet-400 bg-violet-50' : 'bg-slate-50'}`}>
              <h4 className="font-semibold text-violet-700 mb-2">2-Categories</h4>
              <p className="text-slate-600" style={{ fontFamily: 'Georgia, serif' }}>
                Hom(X,Y) is a <strong>category</strong>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                2-morphisms α: f ⇒ g relate morphisms
              </p>
            </div>
            <div className={`p-4 rounded-xl ${viewMode === 'space' ? 'ring-2 ring-purple-400 bg-purple-50' : 'bg-slate-50'}`}>
              <h4 className="font-semibold text-purple-700 mb-2">∞-Categories</h4>
              <p className="text-slate-600" style={{ fontFamily: 'Georgia, serif' }}>
                Hom(X,Y) is an <strong>∞-groupoid</strong>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Morphisms form a continuous space
              </p>
            </div>
          </div>
        </div>

        {/* Key insight */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Why This Matters
          </h3>
          <p className="opacity-90" style={{ fontFamily: 'Georgia, serif' }}>
            In topology, continuous maps between spaces don't just form a set — they form a 
            <em> mapping space</em> Map(X, Y) with its own topology. A path in this space is a 
            <em> homotopy</em> between maps. This is why algebraic topology naturally leads to ∞-categories: 
            the morphisms themselves carry homotopical information that a mere set cannot capture.
          </p>
          <p className="opacity-80 text-sm mt-3" style={{ fontFamily: 'Georgia, serif' }}>
            This is Riehl's point: ∞-categories are categories where "all the sets have been replaced by ∞-groupoids."
          </p>
        </div>
      </div>
    </div>
  );
};

const subscript = (n) => {
  const subs = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆' };
  return String(n).split('').map(c => subs[c] || c).join('');
};

export default HomSpacesExplorer;
