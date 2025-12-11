import React, { useState, useEffect, useRef, useCallback } from 'react';

// Simplicial Sets & Horn Filling Explorer
// Visualizing quasi-categories as simplicial sets with inner horn fillers

const SimplicialSetsExplorer = () => {
  const [dimension, setDimension] = useState(2);
  const [selectedHorn, setSelectedHorn] = useState(1); // Which vertex is missing
  const [showFiller, setShowFiller] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [rotation, setRotation] = useState({ x: 0.3, y: 0.5 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const svgRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(p => (p + 0.03) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
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

  // 3D projection with rotation
  const project3D = (x, y, z) => {
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    
    // Rotate around X
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    
    // Rotate around Y
    const x2 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;
    
    // Perspective projection
    const scale = 400 / (400 + z2);
    return {
      x: 400 + x2 * scale * 150,
      y: 250 + y1 * scale * 150,
      z: z2
    };
  };

  // Generate simplex vertices
  const getSimplexVertices = (n) => {
    if (n === 1) {
      return [
        { x: -1, y: 0, z: 0, label: '0' },
        { x: 1, y: 0, z: 0, label: '1' }
      ];
    }
    if (n === 2) {
      return [
        { x: 0, y: -0.8, z: 0, label: '0' },
        { x: -0.8, y: 0.6, z: 0, label: '1' },
        { x: 0.8, y: 0.6, z: 0, label: '2' }
      ];
    }
    if (n === 3) {
      const h = Math.sqrt(2/3);
      return [
        { x: 0, y: -0.7, z: -0.4, label: '0' },
        { x: -0.7, y: 0.4, z: -0.4, label: '1' },
        { x: 0.7, y: 0.4, z: -0.4, label: '2' },
        { x: 0, y: 0, z: 0.7, label: '3' }
      ];
    }
    return [];
  };

  // Get edges of an n-simplex
  const getEdges = (n) => {
    const edges = [];
    for (let i = 0; i <= n; i++) {
      for (let j = i + 1; j <= n; j++) {
        edges.push([i, j]);
      }
    }
    return edges;
  };

  // Get faces of an n-simplex (for n >= 2)
  const getFaces = (n) => {
    if (n < 2) return [];
    const faces = [];
    for (let i = 0; i <= n; i++) {
      for (let j = i + 1; j <= n; j++) {
        for (let k = j + 1; k <= n; k++) {
          faces.push([i, j, k]);
        }
      }
    }
    return faces;
  };

  // Check if edge is part of the horn (not the missing face)
  const isHornEdge = (edge, hornVertex, n) => {
    // For Λⁿₖ, the horn includes all faces except the k-th face
    // The k-th face is the one opposite to vertex k
    // Edge is in horn if it doesn't complete the missing face
    if (n === 2) {
      // For Λ²ₖ, exclude edge opposite to vertex k
      const [v1, v2] = edge;
      if (selectedHorn === 0 && v1 === 1 && v2 === 2) return false;
      if (selectedHorn === 1 && v1 === 0 && v2 === 2) return false;
      if (selectedHorn === 2 && v1 === 0 && v2 === 1) return false;
    }
    if (n === 3) {
      // For 3-simplex, more complex horn structure
      const [v1, v2] = edge;
      // Inner horns: k = 1 or k = 2
      // Outer horns: k = 0 or k = 3
    }
    return true;
  };

  // Check if this horn is "inner" (fillable in a quasi-category)
  const isInnerHorn = (k, n) => {
    return k > 0 && k < n;
  };

  const vertices = getSimplexVertices(dimension);
  const projectedVertices = vertices.map(v => project3D(v.x, v.y, v.z));
  const edges = getEdges(dimension);
  const faces = getFaces(dimension);

  // Determine which edge is the "missing" one for the horn
  const getMissingEdgeForHorn = () => {
    if (dimension === 2) {
      if (selectedHorn === 0) return [1, 2];
      if (selectedHorn === 1) return [0, 2];
      if (selectedHorn === 2) return [0, 1];
    }
    return null;
  };

  const missingEdge = getMissingEdgeForHorn();

  const renderSimplex = () => {
    const faceElements = [];
    const edgeElements = [];
    const vertexElements = [];

    // Sort faces by z-depth for proper rendering
    const sortedFaces = faces.map((face, idx) => {
      const avgZ = face.reduce((sum, vi) => sum + projectedVertices[vi].z, 0) / face.length;
      return { face, avgZ, idx };
    }).sort((a, b) => a.avgZ - b.avgZ);

    // Render faces
    sortedFaces.forEach(({ face }) => {
      const isHornFace = !face.includes(selectedHorn);
      const isMissingFace = face.includes(selectedHorn) && dimension === 3;
      
      let fillColor = 'rgba(99, 102, 241, 0.15)';
      let strokeColor = 'rgba(99, 102, 241, 0.3)';
      
      if (!showFiller && face.every(v => v !== selectedHorn)) {
        fillColor = 'rgba(99, 102, 241, 0.25)';
      }
      if (showFiller) {
        fillColor = 'rgba(16, 185, 129, 0.2)';
        strokeColor = 'rgba(16, 185, 129, 0.4)';
      }

      const path = `M ${face.map(vi => `${projectedVertices[vi].x} ${projectedVertices[vi].y}`).join(' L ')} Z`;
      faceElements.push(
        <path
          key={`face-${face.join('-')}`}
          d={path}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1"
          style={{ transition: 'all 0.4s ease' }}
        />
      );
    });

    // Render edges
    edges.forEach(([v1, v2]) => {
      const p1 = projectedVertices[v1];
      const p2 = projectedVertices[v2];
      
      const isMissing = missingEdge && missingEdge[0] === v1 && missingEdge[1] === v2;
      
      let strokeColor = '#4f46e5';
      let strokeWidth = 2;
      let dashArray = 'none';
      let opacity = 1;

      if (isMissing && !showFiller) {
        strokeColor = '#ef4444';
        dashArray = '5,5';
        opacity = 0.5 + 0.3 * Math.sin(animationPhase * 2);
      } else if (showFiller && isMissing) {
        strokeColor = '#10b981';
        strokeWidth = 3;
      }

      edgeElements.push(
        <line
          key={`edge-${v1}-${v2}`}
          x1={p1.x}
          y1={p1.y}
          x2={p2.x}
          y2={p2.y}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          opacity={opacity}
          style={{ transition: 'all 0.3s ease' }}
        />
      );

      // Arrow direction indicator
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / len;
      const ny = dy / len;
      
      if (!isMissing || showFiller) {
        edgeElements.push(
          <polygon
            key={`arrow-${v1}-${v2}`}
            points={`${midX + nx * 8},${midY + ny * 8} 
                     ${midX - ny * 4},${midY + nx * 4} 
                     ${midX + ny * 4},${midY - nx * 4}`}
            fill={isMissing && showFiller ? '#10b981' : '#4f46e5'}
            style={{ transition: 'all 0.3s ease' }}
          />
        );
      }
    });

    // Render vertices
    projectedVertices.forEach((p, i) => {
      const isHornVertex = i === selectedHorn;
      const scale = isHornVertex ? (showFiller ? 1.2 : 0.8) : 1;
      const color = isHornVertex 
        ? (showFiller ? '#10b981' : '#f97316') 
        : '#1e1b4b';
      
      vertexElements.push(
        <g key={`vertex-${i}`}>
          <circle
            cx={p.x}
            cy={p.y}
            r={14 * scale}
            fill={color}
            style={{ transition: 'all 0.3s ease' }}
          />
          <text
            x={p.x}
            y={p.y + 5}
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
          >
            {i}
          </text>
        </g>
      );
    });

    return [...faceElements, ...edgeElements, ...vertexElements];
  };

  const isInner = isInnerHorn(selectedHorn, dimension);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-slate-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Simplicial Sets & <span className="text-purple-600">Horn Filling</span>
          </h1>
          <p className="text-slate-600 text-lg" style={{ fontFamily: 'Georgia, serif' }}>
            A quasi-category is a simplicial set in which every <em>inner</em> horn has a filler
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dimension selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                Simplex Dimension (Δⁿ)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3].map(n => (
                  <button
                    key={n}
                    onClick={() => {
                      setDimension(n);
                      setSelectedHorn(Math.min(selectedHorn, n));
                      setShowFiller(false);
                    }}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      dimension === n 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-purple-100'
                    }`}
                  >
                    Δ{superscript(n)}
                  </button>
                ))}
              </div>
            </div>

            {/* Horn selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                Horn (Λⁿₖ) — missing vertex k
              </label>
              <div className="flex gap-2">
                {Array.from({ length: dimension + 1 }, (_, k) => (
                  <button
                    key={k}
                    onClick={() => {
                      setSelectedHorn(k);
                      setShowFiller(false);
                    }}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedHorn === k 
                        ? isInnerHorn(k, dimension)
                          ? 'bg-green-600 text-white'
                          : 'bg-orange-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    k={k}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-sm">
                <span className={`px-2 py-1 rounded ${
                  isInner ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {isInner ? '✓ Inner horn (fillable)' : '✗ Outer horn (not required to fill)'}
                </span>
              </div>
            </div>

            {/* Filler toggle */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                Horn Filler
              </label>
              <button
                onClick={() => setShowFiller(!showFiller)}
                className={`px-6 py-2 rounded-lg transition-all ${
                  showFiller
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                }`}
              >
                {showFiller ? 'Filler Applied ✓' : 'Add Filler'}
              </button>
            </div>
          </div>
        </div>

        {/* Main visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-4">
            <svg 
              ref={svgRef}
              viewBox="0 0 800 500" 
              className="w-full h-96 cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <defs>
                <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </radialGradient>
              </defs>
              <rect width="800" height="500" fill="url(#bgGrad)" />
              
              {renderSimplex()}
              
              {/* Labels */}
              <text x="400" y="30" textAnchor="middle" fill="#475569" fontSize="18" fontFamily="Georgia, serif">
                {showFiller ? `Δ${superscript(dimension)} (filled)` : `Λ${superscript(dimension)}${subscript(selectedHorn)}`}
              </text>
              <text x="400" y="480" textAnchor="middle" fill="#94a3b8" fontSize="14">
                Drag to rotate
              </text>
            </svg>
          </div>

          {/* Info panel */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Understanding Horns
            </h3>
            
            <div className="space-y-4 text-sm text-slate-600" style={{ fontFamily: 'Georgia, serif' }}>
              <div className="p-3 bg-slate-50 rounded-lg">
                <strong>Δⁿ</strong> — the standard n-simplex
                <p className="mt-1 text-slate-500">
                  {dimension === 1 && "An edge: two vertices connected by a directed arrow"}
                  {dimension === 2 && "A triangle: three vertices, three edges, one 2-face"}
                  {dimension === 3 && "A tetrahedron: four vertices, six edges, four triangular faces"}
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <strong>Λⁿₖ</strong> — the k-th horn
                <p className="mt-1 text-slate-500">
                  The horn Λⁿₖ is Δⁿ with the k-th face (and interior) removed.
                </p>
              </div>
              
              <div className={`p-3 rounded-lg border ${isInner ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <strong>{isInner ? 'Inner Horn' : 'Outer Horn'}</strong>
                <p className="mt-1 text-slate-500">
                  {isInner 
                    ? `k=${selectedHorn} is an inner horn (0 < k < ${dimension}). In a quasi-category, inner horns MUST have fillers — this captures composition!`
                    : `k=${selectedHorn} is an outer horn (k=0 or k=n). Outer horns need not have fillers in a quasi-category.`
                  }
                </p>
              </div>

              {dimension === 2 && (
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <strong>Composition</strong>
                  <p className="mt-1 text-slate-500">
                    For Λ²₁: given arrows f: 0→1 and g: 1→2, the filler provides a composite g∘f: 0→2!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key insight */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
          <h3 className="text-lg font-semibold text-purple-800 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Why Inner Horns?
          </h3>
          <p className="text-slate-700" style={{ fontFamily: 'Georgia, serif' }}>
            The inner horn filling condition is the key insight: given a composable pair of 1-morphisms 
            (the two edges of Λ²₁), there exists a composite (the filler provides the third edge). 
            The filled 2-simplex is the <em>witness</em> that this composite exists. In higher dimensions, 
            horn fillings witness associativity and higher coherences.
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper functions for superscript/subscript display
const superscript = (n) => {
  const sups = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵' };
  return String(n).split('').map(c => sups[c] || c).join('');
};

const subscript = (n) => {
  const subs = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅' };
  return String(n).split('').map(c => subs[c] || c).join('');
};

export default SimplicialSetsExplorer;
