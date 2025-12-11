import React, { useState, useEffect, useRef, useCallback } from 'react';

// The Fundamental ∞-Groupoid: Points, Paths, Homotopies
// Based on Emily Riehl's topological motivation for ∞-categories

const FundamentalGroupoidExplorer = () => {
  const [level, setLevel] = useState(1);
  const [time, setTime] = useState(0);
  const [homotopyParam, setHomotopyParam] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPath, setSelectedPath] = useState(0);
  const [dragging, setDragging] = useState(null);
  const [points, setPoints] = useState([
    { x: 150, y: 300, label: 'p' },
    { x: 450, y: 200, label: 'q' },
    { x: 650, y: 350, label: 'r' }
  ]);
  const svgRef = useRef(null);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTime(t => (t + 0.02) % 1);
    }, 30);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Path definitions using cubic bezier
  const paths = [
    { // Path γ from p to q (upper arc)
      from: 0, to: 1,
      control1: { dx: 100, dy: -150 },
      control2: { dx: -100, dy: -100 },
      color: '#4f46e5',
      label: 'γ'
    },
    { // Path γ' from p to q (lower arc)
      from: 0, to: 1,
      control1: { dx: 150, dy: 50 },
      control2: { dx: -50, dy: 100 },
      color: '#10b981',
      label: "γ'"
    },
    { // Path δ from q to r
      from: 1, to: 2,
      control1: { dx: 50, dy: 100 },
      control2: { dx: -100, dy: 50 },
      color: '#f59e0b',
      label: 'δ'
    }
  ];

  const getPathPoint = (path, t) => {
    const p1 = points[path.from];
    const p2 = points[path.to];
    const c1 = { x: p1.x + path.control1.dx, y: p1.y + path.control1.dy };
    const c2 = { x: p2.x + path.control2.dx, y: p2.y + path.control2.dy };
    
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    
    return {
      x: mt3 * p1.x + 3 * mt2 * t * c1.x + 3 * mt * t2 * c2.x + t3 * p2.x,
      y: mt3 * p1.y + 3 * mt2 * t * c1.y + 3 * mt * t2 * c2.y + t3 * p2.y
    };
  };

  const getPathString = (path) => {
    const p1 = points[path.from];
    const p2 = points[path.to];
    const c1 = { x: p1.x + path.control1.dx, y: p1.y + path.control1.dy };
    const c2 = { x: p2.x + path.control2.dx, y: p2.y + path.control2.dy };
    return `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  };

  // Interpolate between two paths for homotopy visualization
  const getHomotopyPoint = (t) => {
    const path1 = paths[0];
    const path2 = paths[1];
    
    const pt1 = getPathPoint(path1, t);
    const pt2 = getPathPoint(path2, t);
    
    return {
      x: pt1.x + (pt2.x - pt1.x) * homotopyParam,
      y: pt1.y + (pt2.y - pt1.y) * homotopyParam
    };
  };

  const handleMouseDown = (idx, e) => {
    setDragging(idx);
    e.stopPropagation();
  };

  const handleMouseMove = useCallback((e) => {
    if (dragging === null || !svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    setPoints(prev => prev.map((p, i) => 
      i === dragging 
        ? { ...p, x: Math.max(50, Math.min(750, svgP.x)), y: Math.max(50, Math.min(450, svgP.y)) }
        : p
    ));
  }, [dragging]);

  const handleMouseUp = () => setDragging(null);

  const renderSpaceSurface = () => {
    // Draw a subtle torus-like surface
    const pathData = [];
    for (let i = 0; i < 360; i += 30) {
      const r1 = 300, r2 = 150;
      const cx = 400, cy = 280;
      const angle = (i * Math.PI) / 180;
      pathData.push(
        <ellipse
          key={`ring-${i}`}
          cx={cx}
          cy={cy}
          rx={r1 * Math.cos(angle) * 0.3 + r1 * 0.7}
          ry={r2}
          fill="none"
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth="1"
          transform={`rotate(${i * 0.1}, ${cx}, ${cy})`}
        />
      );
    }
    return pathData;
  };

  const renderMovingPoint = () => {
    if (level < 1) return null;
    
    let pos;
    if (level === 1) {
      pos = getPathPoint(paths[selectedPath], time);
    } else {
      pos = getHomotopyPoint(time);
    }

    return (
      <g>
        <circle
          cx={pos.x}
          cy={pos.y}
          r={12}
          fill="#ef4444"
          filter="drop-shadow(0 2px 4px rgba(239, 68, 68, 0.4))"
        />
        <circle
          cx={pos.x}
          cy={pos.y}
          r={20}
          fill="none"
          stroke="rgba(239, 68, 68, 0.3)"
          strokeWidth="2"
          strokeDasharray="4,4"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${pos.x} ${pos.y}`}
            to={`360 ${pos.x} ${pos.y}`}
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    );
  };

  const renderHomotopySurface = () => {
    if (level < 2) return null;

    // Draw the homotopy as a surface between two paths
    const strips = [];
    const numStrips = 20;
    
    for (let i = 0; i < numStrips; i++) {
      const s1 = i / numStrips;
      const s2 = (i + 1) / numStrips;
      
      const points1 = [];
      const points2 = [];
      
      for (let t = 0; t <= 1; t += 0.1) {
        const p1a = getPathPoint(paths[0], t);
        const p1b = getPathPoint(paths[1], t);
        const p2a = getPathPoint(paths[0], t);
        const p2b = getPathPoint(paths[1], t);
        
        points1.push({
          x: p1a.x + (p1b.x - p1a.x) * s1,
          y: p1a.y + (p1b.y - p1a.y) * s1
        });
        points2.push({
          x: p2a.x + (p2b.x - p2a.x) * s2,
          y: p2a.y + (p2b.y - p2a.y) * s2
        });
      }
      
      const pathD = `M ${points1[0].x} ${points1[0].y} ` +
        points1.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') +
        points2.reverse().map(p => `L ${p.x} ${p.y}`).join(' ') + ' Z';
      
      const hue = 250 + (i / numStrips) * 60;
      const lightness = 85 - (Math.abs(s1 - homotopyParam) < 0.1 ? 20 : 0);
      
      strips.push(
        <path
          key={`strip-${i}`}
          d={pathD}
          fill={`hsl(${hue}, 70%, ${lightness}%)`}
          opacity={0.3}
          stroke="none"
        />
      );
    }

    // Highlight current homotopy position
    const currentPath = [];
    for (let t = 0; t <= 1; t += 0.05) {
      currentPath.push(getHomotopyPoint(t));
    }
    
    strips.push(
      <path
        key="current-homotopy"
        d={`M ${currentPath[0].x} ${currentPath[0].y} ` + 
           currentPath.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}
        fill="none"
        stroke="#ef4444"
        strokeWidth="3"
        strokeLinecap="round"
      />
    );

    return <g>{strips}</g>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            The Fundamental <span className="text-purple-400">∞-Groupoid</span>
          </h1>
          <p className="text-slate-300 text-lg" style={{ fontFamily: 'Georgia, serif' }}>
            Points are objects • Paths are 1-morphisms • Homotopies are 2-morphisms
          </p>
        </div>

        {/* Level selector */}
        <div className="flex justify-center gap-3 mb-6">
          {[
            { level: 0, label: 'Objects', desc: 'Points in space' },
            { level: 1, label: '1-Morphisms', desc: 'Paths between points' },
            { level: 2, label: '2-Morphisms', desc: 'Homotopies between paths' }
          ].map(({ level: l, label, desc }) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-5 py-3 rounded-xl transition-all ${
                level === l
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="font-semibold">{label}</div>
              <div className="text-xs opacity-70">{desc}</div>
            </button>
          ))}
        </div>

        {/* Main visualization */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl shadow-2xl p-4 mb-6">
          <svg
            ref={svgRef}
            viewBox="0 0 800 500"
            className="w-full h-[500px]"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Background gradient */}
            <defs>
              <radialGradient id="spaceBg" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect width="800" height="500" fill="url(#spaceBg)" />
            
            {/* Surface visualization */}
            {renderSpaceSurface()}

            {/* Homotopy surface (level 2) */}
            {renderHomotopySurface()}

            {/* Paths */}
            {level >= 1 && paths.slice(0, level >= 2 ? 2 : (selectedPath === 2 ? 3 : selectedPath + 1)).map((path, idx) => (
              <g key={`path-${idx}`}>
                <path
                  d={getPathString(path)}
                  fill="none"
                  stroke={path.color}
                  strokeWidth={selectedPath === idx || level >= 2 ? 4 : 2}
                  strokeLinecap="round"
                  filter="url(#glow)"
                  opacity={level >= 2 ? 0.8 : (selectedPath === idx ? 1 : 0.4)}
                  style={{ transition: 'all 0.3s ease' }}
                />
                {/* Path label */}
                <text
                  x={getPathPoint(path, 0.5).x + (idx === 0 ? -20 : 20)}
                  y={getPathPoint(path, 0.5).y + (idx === 0 ? -20 : 20)}
                  fill={path.color}
                  fontSize="20"
                  fontStyle="italic"
                  fontFamily="Georgia, serif"
                  filter="url(#glow)"
                >
                  {path.label}
                </text>
              </g>
            ))}

            {/* Points */}
            {points.map((pt, idx) => (
              <g 
                key={`point-${idx}`}
                onMouseDown={(e) => handleMouseDown(idx, e)}
                style={{ cursor: 'grab' }}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={18}
                  fill="#f8fafc"
                  filter="url(#glow)"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={14}
                  fill="#1e1b4b"
                />
                <text
                  x={pt.x}
                  y={pt.y + 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                  fontFamily="Georgia, serif"
                >
                  {pt.label}
                </text>
              </g>
            ))}

            {/* Moving point */}
            {level >= 1 && isPlaying && renderMovingPoint()}
          </svg>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Playback controls */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Traverse {level >= 2 ? 'Homotopy' : 'Path'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-6 py-2 rounded-lg transition-all ${
                    isPlaying 
                      ? 'bg-red-500 text-white' 
                      : 'bg-purple-600 text-white hover:bg-purple-500'
                  }`}
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={time}
                  onChange={(e) => setTime(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-slate-400 w-12 text-right">
                  t={time.toFixed(2)}
                </span>
              </div>
              
              {level >= 2 && (
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">Homotopy s:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={homotopyParam}
                    onChange={(e) => setHomotopyParam(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-slate-400 w-12 text-right">
                    s={homotopyParam.toFixed(2)}
                  </span>
                </div>
              )}

              {level === 1 && (
                <div className="flex gap-2">
                  {paths.map((path, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPath(idx)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        selectedPath === idx
                          ? 'text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                      style={{ backgroundColor: selectedPath === idx ? path.color : undefined }}
                    >
                      Path {path.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              {level === 0 && 'Objects: Points in Space'}
              {level === 1 && '1-Morphisms: Paths'}
              {level === 2 && '2-Morphisms: Homotopies'}
            </h3>
            <p className="text-slate-300 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
              {level === 0 && (
                'In the fundamental ∞-groupoid of a topological space X, objects are simply points p, q, r, ... in the space. Drag them to reposition.'
              )}
              {level === 1 && (
                'A 1-morphism from p to q is a path γ: [0,1] → X with γ(0) = p and γ(1) = q. Multiple paths can connect the same points. Press play to see a point traverse the path.'
              )}
              {level === 2 && (
                'A 2-morphism between paths γ and γ\' is a homotopy—a continuous family of paths interpolating between them. The parameter s controls which path in the family we\'re viewing. This 2-morphism witnesses that γ and γ\' are "the same up to homotopy."'
              )}
            </p>
          </div>
        </div>

        {/* Key insight */}
        <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur rounded-2xl p-6 border border-purple-500/30">
          <h3 className="text-lg font-semibold text-purple-300 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Grothendieck's Homotopy Hypothesis
          </h3>
          <p className="text-slate-300" style={{ fontFamily: 'Georgia, serif' }}>
            The fundamental ∞-groupoid defines an <em className="text-purple-400">equivalence</em> between 
            spaces (up to weak homotopy equivalence) and ∞-groupoids (up to equivalence). 
            As Scholze says: an ∞-groupoid is an <em className="text-purple-400">anima</em>—the "soul" of a space.
            All morphisms in an ∞-groupoid are invertible, capturing the idea that paths can be traversed 
            in either direction.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FundamentalGroupoidExplorer;
