import React, { useState, useEffect, useRef, useCallback } from 'react';

// The Shapes of Higher Categories
// Simplices, cubes, and the geometry of composition

const ShapesExplorer = () => {
  const [selectedShape, setSelectedShape] = useState('simplex');
  const [dimension, setDimension] = useState(2);
  const [rotation, setRotation] = useState({ x: 0.4, y: 0.3, z: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showFaces, setShowFaces] = useState(true);
  const [highlightedFace, setHighlightedFace] = useState(null);
  const lastMouse = useRef({ x: 0, y: 0 });
  const animationRef = useRef(null);

  // Physics-based rotation when not dragging
  useEffect(() => {
    const animate = () => {
      if (!isDragging) {
        setRotation(prev => ({
          x: prev.x + velocity.x,
          y: prev.y + velocity.y,
          z: prev.z
        }));
        setVelocity(prev => ({
          x: prev.x * 0.98, // Friction
          y: prev.y * 0.98
        }));
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isDragging, velocity]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setVelocity({ x: 0, y: 0 });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    
    setRotation(prev => ({
      x: prev.x + dy * 0.005,
      y: prev.y + dx * 0.005,
      z: prev.z
    }));
    
    // Store velocity for momentum
    setVelocity({ x: dy * 0.001, y: dx * 0.001 });
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, [isDragging]);

  const handleMouseUp = () => setIsDragging(false);

  // 3D projection
  const project = (point) => {
    const { x, y, z } = point;
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    const x2 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;
    
    const scale = 300 / (300 + z2);
    return {
      x: 300 + x2 * scale * 100,
      y: 250 + y1 * scale * 100,
      z: z2,
      scale
    };
  };

  // Generate simplex vertices
  const getSimplexVertices = (n) => {
    if (n === 0) return [{ x: 0, y: 0, z: 0 }];
    if (n === 1) return [
      { x: -1, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 }
    ];
    if (n === 2) return [
      { x: 0, y: -1, z: 0 },
      { x: -0.866, y: 0.5, z: 0 },
      { x: 0.866, y: 0.5, z: 0 }
    ];
    if (n === 3) return [
      { x: 0, y: 0.8, z: 0 },
      { x: -0.8, y: -0.4, z: -0.4 },
      { x: 0.8, y: -0.4, z: -0.4 },
      { x: 0, y: -0.4, z: 0.8 }
    ];
    return [];
  };

  // Generate cube vertices
  const getCubeVertices = (n) => {
    if (n === 0) return [{ x: 0, y: 0, z: 0 }];
    if (n === 1) return [
      { x: -1, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 }
    ];
    if (n === 2) return [
      { x: -0.7, y: -0.7, z: 0 },
      { x: 0.7, y: -0.7, z: 0 },
      { x: 0.7, y: 0.7, z: 0 },
      { x: -0.7, y: 0.7, z: 0 }
    ];
    if (n === 3) return [
      { x: -0.6, y: -0.6, z: -0.6 },
      { x: 0.6, y: -0.6, z: -0.6 },
      { x: 0.6, y: 0.6, z: -0.6 },
      { x: -0.6, y: 0.6, z: -0.6 },
      { x: -0.6, y: -0.6, z: 0.6 },
      { x: 0.6, y: -0.6, z: 0.6 },
      { x: 0.6, y: 0.6, z: 0.6 },
      { x: -0.6, y: 0.6, z: 0.6 }
    ];
    return [];
  };

  // Get edges for simplex
  const getSimplexEdges = (n) => {
    const edges = [];
    for (let i = 0; i <= n; i++) {
      for (let j = i + 1; j <= n; j++) {
        edges.push([i, j]);
      }
    }
    return edges;
  };

  // Get edges for cube
  const getCubeEdges = (n) => {
    if (n === 1) return [[0, 1]];
    if (n === 2) return [[0, 1], [1, 2], [2, 3], [3, 0]];
    if (n === 3) return [
      [0, 1], [1, 2], [2, 3], [3, 0], // bottom
      [4, 5], [5, 6], [6, 7], [7, 4], // top
      [0, 4], [1, 5], [2, 6], [3, 7]  // verticals
    ];
    return [];
  };

  // Get faces
  const getSimplexFaces = (n) => {
    if (n < 2) return [];
    if (n === 2) return [[0, 1, 2]];
    if (n === 3) return [
      [0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]
    ];
    return [];
  };

  const getCubeFaces = (n) => {
    if (n < 2) return [];
    if (n === 2) return [[0, 1, 2, 3]];
    if (n === 3) return [
      [0, 1, 2, 3], [4, 5, 6, 7], // top/bottom
      [0, 1, 5, 4], [2, 3, 7, 6], // front/back
      [0, 3, 7, 4], [1, 2, 6, 5]  // left/right
    ];
    return [];
  };

  const vertices = selectedShape === 'simplex' 
    ? getSimplexVertices(dimension) 
    : getCubeVertices(dimension);
  const edges = selectedShape === 'simplex'
    ? getSimplexEdges(dimension)
    : getCubeEdges(dimension);
  const faces = selectedShape === 'simplex'
    ? getSimplexFaces(dimension)
    : getCubeFaces(dimension);
  
  const projectedVertices = vertices.map(v => project(v));

  // Sort faces by z-depth
  const sortedFaces = faces.map((face, idx) => ({
    face,
    idx,
    avgZ: face.reduce((sum, vi) => sum + projectedVertices[vi].z, 0) / face.length
  })).sort((a, b) => a.avgZ - b.avgZ);

  const renderShape = () => (
    <svg 
      viewBox="0 0 600 500" 
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <filter id="edgeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="vertexGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="vertexGrad" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
      </defs>
      
      <rect width="600" height="500" fill="url(#bgGradient)" />
      
      {/* Grid lines for depth reference */}
      <g opacity="0.1">
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`gridH-${i}`} x1="50" y1={50 + i * 40} x2="550" y2={50 + i * 40} stroke="#fff" />
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`gridV-${i}`} x1={50 + i * 40} y1="50" x2={50 + i * 40} y2="450" stroke="#fff" />
        ))}
      </g>

      {/* Faces */}
      {showFaces && sortedFaces.map(({ face, idx }) => {
        const isHighlighted = highlightedFace === idx;
        const faceColor = selectedShape === 'simplex' 
          ? `hsla(${250 + idx * 30}, 70%, 50%, ${isHighlighted ? 0.5 : 0.2})`
          : `hsla(${180 + idx * 20}, 70%, 50%, ${isHighlighted ? 0.5 : 0.2})`;
        
        const pathD = face.map((vi, i) => 
          `${i === 0 ? 'M' : 'L'} ${projectedVertices[vi].x} ${projectedVertices[vi].y}`
        ).join(' ') + ' Z';
        
        return (
          <path
            key={`face-${idx}`}
            d={pathD}
            fill={faceColor}
            stroke={isHighlighted ? '#fff' : 'rgba(255,255,255,0.3)'}
            strokeWidth={isHighlighted ? 2 : 1}
            onMouseEnter={() => setHighlightedFace(idx)}
            onMouseLeave={() => setHighlightedFace(null)}
            style={{ transition: 'fill 0.2s ease' }}
          />
        );
      })}

      {/* Edges */}
      {edges.map(([v1, v2], idx) => {
        const p1 = projectedVertices[v1];
        const p2 = projectedVertices[v2];
        const avgZ = (p1.z + p2.z) / 2;
        const opacity = 0.4 + 0.6 * (1 - (avgZ + 1) / 2);
        const strokeColor = selectedShape === 'simplex' ? '#a78bfa' : '#22d3d8';
        
        return (
          <g key={`edge-${idx}`}>
            <line
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={strokeColor}
              strokeWidth={3}
              opacity={opacity}
              filter="url(#edgeGlow)"
              strokeLinecap="round"
            />
            {/* Direction arrow */}
            {showLabels && dimension <= 2 && (
              <polygon
                points={`${(p1.x + p2.x) / 2 + 6},${(p1.y + p2.y) / 2} 
                         ${(p1.x + p2.x) / 2 - 3},${(p1.y + p2.y) / 2 - 4} 
                         ${(p1.x + p2.x) / 2 - 3},${(p1.y + p2.y) / 2 + 4}`}
                fill={strokeColor}
                opacity={opacity}
                transform={`rotate(${Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI}, ${(p1.x + p2.x) / 2}, ${(p1.y + p2.y) / 2})`}
              />
            )}
          </g>
        );
      })}

      {/* Vertices */}
      {projectedVertices.map((p, idx) => {
        const size = 8 + p.scale * 4;
        const opacity = 0.6 + 0.4 * p.scale;
        
        return (
          <g key={`vertex-${idx}`}>
            <circle
              cx={p.x} cy={p.y} r={size}
              fill="url(#vertexGrad)"
              filter="url(#vertexGlow)"
              opacity={opacity}
            />
            {showLabels && (
              <text
                x={p.x}
                y={p.y - size - 8}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="14"
                fontWeight="bold"
              >
                {idx}
              </text>
            )}
          </g>
        );
      })}

      {/* Shape label */}
      <text x="300" y="40" textAnchor="middle" fill="#94a3b8" fontSize="16" fontFamily="Georgia, serif">
        {selectedShape === 'simplex' ? `Δ${superscript(dimension)}` : `□${superscript(dimension)}`} — 
        {selectedShape === 'simplex' ? ' Standard Simplex' : ' Standard Cube'}
      </text>
      
      <text x="300" y="480" textAnchor="middle" fill="#64748b" fontSize="12">
        Drag to rotate • {vertices.length} vertices • {edges.length} edges • {faces.length} faces
      </text>
    </svg>
  );

  const shapeInfo = {
    simplex: {
      name: 'Simplex',
      symbol: 'Δⁿ',
      description: 'The standard n-simplex is the convex hull of n+1 affinely independent points.',
      usage: 'Foundation of simplicial sets, quasi-categories, and simplicial homotopy theory.',
      composition: 'A 2-simplex represents a composable pair of morphisms and their composite.',
      colors: { primary: '#a78bfa', bg: '#1e1b4b' }
    },
    cube: {
      name: 'Cube',
      symbol: '□ⁿ',
      description: 'The standard n-cube is the product of n copies of the interval [0,1].',
      usage: 'Foundation of cubical sets, used in directed homotopy type theory.',
      composition: 'Natural for representing paths and homotopies as continuous deformations.',
      colors: { primary: '#22d3d8', bg: '#042f2e' }
    }
  };

  const currentInfo = shapeInfo[selectedShape];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0f172a' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            The <span style={{ color: currentInfo.colors.primary }}>Shapes</span> of Higher Categories
          </h1>
          <p className="text-slate-400 text-lg" style={{ fontFamily: 'Georgia, serif' }}>
            Simplices and cubes: the geometric building blocks of ∞-category theory
          </p>
        </div>

        {/* Shape selector */}
        <div className="flex justify-center gap-4 mb-6">
          {['simplex', 'cube'].map(shape => (
            <button
              key={shape}
              onClick={() => setSelectedShape(shape)}
              className={`px-6 py-3 rounded-xl transition-all ${
                selectedShape === shape
                  ? 'text-white shadow-lg'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
              style={{
                backgroundColor: selectedShape === shape ? shapeInfo[shape].colors.primary : undefined
              }}
            >
              <span className="text-2xl mr-2">{shape === 'simplex' ? '△' : '□'}</span>
              <span className="font-semibold">{shapeInfo[shape].name}</span>
            </button>
          ))}
        </div>

        {/* Dimension selector */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <span className="text-slate-400">Dimension:</span>
          {[0, 1, 2, 3].map(d => (
            <button
              key={d}
              onClick={() => setDimension(d)}
              className={`w-10 h-10 rounded-lg transition-all ${
                dimension === d
                  ? 'text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
              style={{
                backgroundColor: dimension === d ? currentInfo.colors.primary : undefined
              }}
            >
              {d}
            </button>
          ))}
          <div className="ml-4 flex gap-2">
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-3 py-1 rounded text-sm ${showLabels ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-500'}`}
            >
              Labels
            </button>
            <button
              onClick={() => setShowFaces(!showFaces)}
              className={`px-3 py-1 rounded text-sm ${showFaces ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-500'}`}
            >
              Faces
            </button>
          </div>
        </div>

        {/* Main visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl" style={{ height: 500 }}>
            {renderShape()}
          </div>

          {/* Info panel */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: currentInfo.colors.primary }}
              >
                {selectedShape === 'simplex' ? '△' : '□'}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{currentInfo.symbol}</h3>
                <p className="text-slate-400 text-sm">{currentInfo.name}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="text-slate-400 font-semibold mb-1">Definition</h4>
                <p className="text-slate-300" style={{ fontFamily: 'Georgia, serif' }}>
                  {currentInfo.description}
                </p>
              </div>

              <div>
                <h4 className="text-slate-400 font-semibold mb-1">Usage</h4>
                <p className="text-slate-300" style={{ fontFamily: 'Georgia, serif' }}>
                  {currentInfo.usage}
                </p>
              </div>

              <div>
                <h4 className="text-slate-400 font-semibold mb-1">For Composition</h4>
                <p className="text-slate-300" style={{ fontFamily: 'Georgia, serif' }}>
                  {currentInfo.composition}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-slate-400 font-semibold mb-2">Structure</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-800 rounded p-2">
                    <div className="text-lg font-bold" style={{ color: currentInfo.colors.primary }}>
                      {vertices.length}
                    </div>
                    <div className="text-xs text-slate-500">vertices</div>
                  </div>
                  <div className="bg-slate-800 rounded p-2">
                    <div className="text-lg font-bold" style={{ color: currentInfo.colors.primary }}>
                      {edges.length}
                    </div>
                    <div className="text-xs text-slate-500">edges</div>
                  </div>
                  <div className="bg-slate-800 rounded p-2">
                    <div className="text-lg font-bold" style={{ color: currentInfo.colors.primary }}>
                      {faces.length}
                    </div>
                    <div className="text-xs text-slate-500">faces</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="mt-6 bg-slate-900 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Simplices vs Cubes in ∞-Category Theory
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">△</span>
                <span className="text-purple-400 font-semibold">Simplicial Approach</span>
              </div>
              <ul className="space-y-2 text-slate-300" style={{ fontFamily: 'Georgia, serif' }}>
                <li>• <strong>Quasi-categories:</strong> simplicial sets with inner horn fillers</li>
                <li>• <strong>Segal condition:</strong> composition from Spine ↪ Δⁿ</li>
                <li>• Face maps encode source, target, composition</li>
                <li>• Used by Joyal, Lurie (Higher Topos Theory)</li>
              </ul>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">□</span>
                <span className="text-cyan-400 font-semibold">Cubical Approach</span>
              </div>
              <ul className="space-y-2 text-slate-300" style={{ fontFamily: 'Georgia, serif' }}>
                <li>• <strong>Cubical sets:</strong> natural for paths and homotopies</li>
                <li>• <strong>Connections:</strong> degenerate cubes for identities</li>
                <li>• Better computational properties (Kan operations)</li>
                <li>• Used in HoTT, directed type theory (Riehl-Shulman)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const superscript = (n) => {
  const sups = { '0': '⁰', '1': '¹', '2': '²', '3': '³' };
  return String(n).split('').map(c => sups[c] || c).join('');
};

export default ShapesExplorer;
