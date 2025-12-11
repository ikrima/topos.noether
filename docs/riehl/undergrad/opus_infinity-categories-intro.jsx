import React, { useState, useRef, useEffect, useCallback } from 'react';

// ∞-Category Introduction: Objects, Morphisms, and Higher Witnesses
// Based on Emily Riehl's "∞-category theory for undergraduates"

const InfinityCategoryExplorer = () => {
  const [level, setLevel] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [positions, setPositions] = useState({
    x: { x: 100, y: 280 },
    y: { x: 300, y: 280 },
    z: { x: 500, y: 280 },
    w: { x: 700, y: 280 }
  });
  const svgRef = useRef(null);

  // Animation loop for smooth transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(p => (p + 0.02) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (point, e) => {
    setDragging(point);
    e.stopPropagation();
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging || !svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    setPositions(prev => ({
      ...prev,
      [dragging]: { x: Math.max(50, Math.min(750, svgP.x)), y: Math.max(50, Math.min(350, svgP.y)) }
    }));
  }, [dragging]);

  const handleMouseUp = () => setDragging(null);

  // Calculate bezier control point for curved arrows
  const getMidPoint = (p1, p2, offset = 0) => {
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len;
    const ny = dx / len;
    return { x: mx + nx * offset, y: my + ny * offset };
  };

  const Arrow = ({ from, to, label, color = "#4f46e5", curved = 0, dashed = false, animated = false }) => {
    const mid = getMidPoint(from, to, curved);
    const path = curved !== 0
      ? `M ${from.x} ${from.y} Q ${mid.x} ${mid.y} ${to.x} ${to.y}`
      : `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    
    const dashOffset = animated ? animationPhase * 50 : 0;
    
    return (
      <g>
        <defs>
          <marker id={`arrow-${color.replace('#', '')}`} markerWidth="10" markerHeight="7" 
            refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={color} />
          </marker>
        </defs>
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={dashed ? "5,5" : "none"}
          strokeDashoffset={dashOffset}
          markerEnd={`url(#arrow-${color.replace('#', '')})`}
          style={{ transition: 'all 0.3s ease' }}
        />
        {label && (
          <text
            x={mid.x}
            y={mid.y - 10}
            textAnchor="middle"
            fill={color}
            fontSize="16"
            fontStyle="italic"
            fontFamily="Georgia, serif"
          >
            {label}
          </text>
        )}
      </g>
    );
  };

  const Point = ({ pos, label, color = "#1e1b4b", draggable = true, onMouseDown }) => {
    const isHovered = hoveredElement === label;
    const scale = isHovered ? 1.3 : 1;
    
    return (
      <g
        onMouseEnter={() => setHoveredElement(label)}
        onMouseLeave={() => setHoveredElement(null)}
        onMouseDown={draggable ? onMouseDown : undefined}
        style={{ cursor: draggable ? 'grab' : 'default' }}
      >
        <circle
          cx={pos.x}
          cy={pos.y}
          r={12 * scale}
          fill={color}
          style={{ transition: 'all 0.2s ease' }}
        />
        <text
          x={pos.x}
          y={pos.y + 35}
          textAnchor="middle"
          fill="#1e1b4b"
          fontSize="18"
          fontWeight="bold"
          fontFamily="Georgia, serif"
        >
          {label}
        </text>
      </g>
    );
  };

  const TwoMorphism = ({ vertices, label, color = "rgba(99, 102, 241, 0.15)" }) => {
    const [v1, v2, v3] = vertices;
    const pulse = 0.8 + 0.2 * Math.sin(animationPhase * 2);
    
    return (
      <g>
        <path
          d={`M ${v1.x} ${v1.y} L ${v2.x} ${v2.y} L ${v3.x} ${v3.y} Z`}
          fill={color}
          opacity={pulse}
          style={{ transition: 'all 0.3s ease' }}
        />
        <text
          x={(v1.x + v2.x + v3.x) / 3}
          y={(v1.y + v2.y + v3.y) / 3 + 5}
          textAnchor="middle"
          fill="#6366f1"
          fontSize="14"
          fontFamily="Georgia, serif"
        >
          {label}
        </text>
      </g>
    );
  };

  const renderLevel0 = () => (
    <g>
      <Point pos={positions.x} label="x" onMouseDown={(e) => handleMouseDown('x', e)} />
      <Point pos={positions.y} label="y" onMouseDown={(e) => handleMouseDown('y', e)} />
    </g>
  );

  const renderLevel1 = () => (
    <g>
      <Arrow from={positions.x} to={positions.y} label="f" color="#4f46e5" />
      {renderLevel0()}
    </g>
  );

  const renderLevel2 = () => {
    const compositeY = positions.y.y + 60;
    return (
      <g>
        <TwoMorphism 
          vertices={[positions.x, positions.y, positions.z]} 
          label="α ≃"
        />
        <Arrow from={positions.x} to={positions.y} label="f" color="#4f46e5" curved={-30} />
        <Arrow from={positions.y} to={positions.z} label="g" color="#4f46e5" curved={-30} />
        <Arrow from={positions.x} to={positions.z} label="g∘f" color="#10b981" dashed animated />
        <Point pos={positions.x} label="x" onMouseDown={(e) => handleMouseDown('x', e)} />
        <Point pos={positions.y} label="y" onMouseDown={(e) => handleMouseDown('y', e)} />
        <Point pos={positions.z} label="z" onMouseDown={(e) => handleMouseDown('z', e)} />
      </g>
    );
  };

  const renderLevel3 = () => {
    const center = {
      x: (positions.x.x + positions.y.x + positions.z.x + positions.w.x) / 4,
      y: (positions.x.y + positions.y.y + positions.z.y + positions.w.y) / 4
    };
    
    return (
      <g>
        {/* Inner tetrahedron faces for 3-morphism */}
        <path
          d={`M ${positions.x.x} ${positions.x.y} 
              L ${positions.y.x} ${positions.y.y} 
              L ${positions.z.x} ${positions.z.y} Z`}
          fill="rgba(99, 102, 241, 0.1)"
          stroke="rgba(99, 102, 241, 0.3)"
          strokeWidth="1"
        />
        <path
          d={`M ${positions.y.x} ${positions.y.y} 
              L ${positions.z.x} ${positions.z.y} 
              L ${positions.w.x} ${positions.w.y} Z`}
          fill="rgba(16, 185, 129, 0.1)"
          stroke="rgba(16, 185, 129, 0.3)"
          strokeWidth="1"
        />
        
        {/* 1-morphisms */}
        <Arrow from={positions.x} to={positions.y} label="f" color="#4f46e5" curved={-20} />
        <Arrow from={positions.y} to={positions.z} label="g" color="#4f46e5" curved={-20} />
        <Arrow from={positions.z} to={positions.w} label="h" color="#4f46e5" curved={-20} />
        
        {/* Composed morphisms */}
        <Arrow from={positions.x} to={positions.z} label="g∘f" color="#10b981" curved={40} dashed />
        <Arrow from={positions.y} to={positions.w} label="h∘g" color="#f59e0b" curved={-40} dashed />
        <Arrow from={positions.x} to={positions.w} label="h∘g∘f" color="#ef4444" curved={60} dashed animated />
        
        {/* 2-morphism labels */}
        <text x={(positions.x.x + positions.y.x + positions.z.x)/3} 
              y={(positions.x.y + positions.y.y + positions.z.y)/3} 
              fill="#6366f1" fontSize="12" textAnchor="middle">α</text>
        <text x={(positions.y.x + positions.z.x + positions.w.x)/3} 
              y={(positions.y.y + positions.z.y + positions.w.y)/3} 
              fill="#10b981" fontSize="12" textAnchor="middle">β</text>
        
        {/* 3-morphism indicator */}
        <circle cx={center.x} cy={center.y} r={8 + 3 * Math.sin(animationPhase * 3)} 
                fill="rgba(239, 68, 68, 0.3)" />
        <text x={center.x} y={center.y + 4} textAnchor="middle" fill="#ef4444" fontSize="11">γ</text>
        
        {/* Points */}
        <Point pos={positions.x} label="x" onMouseDown={(e) => handleMouseDown('x', e)} />
        <Point pos={positions.y} label="y" onMouseDown={(e) => handleMouseDown('y', e)} />
        <Point pos={positions.z} label="z" onMouseDown={(e) => handleMouseDown('z', e)} />
        <Point pos={positions.w} label="w" onMouseDown={(e) => handleMouseDown('w', e)} />
      </g>
    );
  };

  const levels = [
    { 
      title: "Objects", 
      subtitle: "The nouns of our mathematical language",
      description: "Objects are the fundamental entities. Drag them to explore.",
      render: renderLevel0 
    },
    { 
      title: "1-Morphisms", 
      subtitle: "Arrows between objects — the verbs",
      description: "1-morphisms f: x → y connect objects. In a topological space, these are paths.",
      render: renderLevel1 
    },
    { 
      title: "2-Morphisms", 
      subtitle: "Witnesses of composition",
      description: "The composite g∘f exists, witnessed by an invertible 2-morphism α. The dashed arrow shows the composite.",
      render: renderLevel2 
    },
    { 
      title: "3-Morphisms", 
      subtitle: "Witnesses of associativity",
      description: "h∘(g∘f) = (h∘g)∘f is witnessed by invertible 3-morphisms. Coherence continues upward.",
      render: renderLevel3 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-slate-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            What are <span className="text-indigo-600">∞-categories</span>?
          </h1>
          <p className="text-slate-600 text-lg italic" style={{ fontFamily: 'Georgia, serif' }}>
            "A category frames a possible template for any mathematical theory..."
          </p>
          <p className="text-slate-500 text-sm mt-1">— Barry Mazur</p>
        </div>

        {/* Level selector */}
        <div className="flex justify-center gap-2 mb-6">
          {levels.map((l, i) => (
            <button
              key={i}
              onClick={() => setLevel(i)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                level === i 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'bg-white text-slate-600 hover:bg-indigo-50'
              }`}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {i}-morphisms
            </button>
          ))}
        </div>

        {/* Current level info */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-baseline gap-3 mb-2">
            <h2 className="text-2xl text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>
              {levels[level].title}
            </h2>
            <span className="text-slate-500 italic" style={{ fontFamily: 'Georgia, serif' }}>
              {levels[level].subtitle}
            </span>
          </div>
          <p className="text-slate-600" style={{ fontFamily: 'Georgia, serif' }}>
            {levels[level].description}
          </p>
        </div>

        {/* Main visualization */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <svg 
            ref={svgRef}
            viewBox="0 0 800 400" 
            className="w-full h-96"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="800" height="400" fill="url(#grid)" />
            
            {levels[level].render()}
          </svg>
        </div>

        {/* Key insight box */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
          <h3 className="text-lg font-semibold text-indigo-800 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Key Insight
          </h3>
          <p className="text-slate-700" style={{ fontFamily: 'Georgia, serif' }}>
            An ∞-category has objects, 1-morphisms between them, and then <em>invertible</em> higher 
            morphisms witnessing composition (2-morphisms), associativity (3-morphisms), and 
            coherence conditions all the way up. Unlike ordinary categories where composition is 
            a <em>function</em>, in ∞-categories composition is witnessed by higher structure.
          </p>
        </div>

        {/* Navigation hint */}
        <div className="text-center mt-6 text-slate-500 text-sm">
          <p>Drag the points to explore • Click level buttons to see higher morphisms</p>
        </div>
      </div>
    </div>
  );
};

export default InfinityCategoryExplorer;
