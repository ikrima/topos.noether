import React, { useState, useEffect, useRef, useCallback } from 'react';

// The Nerve of a Category
// How ordinary categories become simplicial sets - the bridge to ∞-categories

const NerveExplorer = () => {
  const [selectedDimension, setSelectedDimension] = useState(0);
  const [hoveredSimplex, setHoveredSimplex] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [categoryDrag, setCategoryDrag] = useState(null);
  const [showAllDimensions, setShowAllDimensions] = useState(false);
  const [categoryPositions, setCategoryPositions] = useState({
    A: { x: 120, y: 200 },
    B: { x: 280, y: 80 },
    C: { x: 280, y: 320 },
    D: { x: 440, y: 200 }
  });
  const svgRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(p => (p + 0.02) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // The category structure
  const objects = ['A', 'B', 'C', 'D'];
  const morphisms = [
    { from: 'A', to: 'B', label: 'f' },
    { from: 'A', to: 'C', label: 'g' },
    { from: 'B', to: 'D', label: 'h' },
    { from: 'C', to: 'D', label: 'k' },
    { from: 'A', to: 'D', label: 'h∘f = k∘g' } // composite
  ];

  // Generate nerve simplices
  const nerve = {
    0: objects.map(o => [o]), // 0-simplices are objects
    1: morphisms.filter(m => m.from !== 'A' || m.to !== 'D').map(m => [m.from, m.to]), // 1-simplices are morphisms (excluding composite for display)
    2: [ // 2-simplices are composable pairs
      ['A', 'B', 'D'], // f then h
      ['A', 'C', 'D']  // g then k
    ],
    3: [ // 3-simplices would be composable triples (none in this small category)
    ]
  };

  // Composable chains for highlighting
  const composableChains = {
    'A,B,D': { morphisms: ['f', 'h'], composite: 'h∘f' },
    'A,C,D': { morphisms: ['g', 'k'], composite: 'k∘g' }
  };

  const handleMouseDown = (obj, e) => {
    setCategoryDrag(obj);
    e.stopPropagation();
  };

  const handleMouseMove = useCallback((e) => {
    if (!categoryDrag || !svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    setCategoryPositions(prev => ({
      ...prev,
      [categoryDrag]: { 
        x: Math.max(50, Math.min(520, svgP.x)), 
        y: Math.max(50, Math.min(350, svgP.y)) 
      }
    }));
  }, [categoryDrag]);

  const handleMouseUp = () => setCategoryDrag(null);

  // Bezier curve for morphism arrows
  const getMorphismPath = (from, to) => {
    const p1 = categoryPositions[from];
    const p2 = categoryPositions[to];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    // Offset for arrow start/end (avoid overlap with circles)
    const offset = 24;
    const startX = p1.x + (dx / len) * offset;
    const startY = p1.y + (dy / len) * offset;
    const endX = p2.x - (dx / len) * offset;
    const endY = p2.y - (dy / len) * offset;
    
    // Curve control point perpendicular to line
    const mx = (startX + endX) / 2;
    const my = (startY + endY) / 2;
    const nx = -dy / len;
    const ny = dx / len;
    const curveOffset = 20;
    
    return {
      path: `M ${startX} ${startY} Q ${mx + nx * curveOffset} ${my + ny * curveOffset} ${endX} ${endY}`,
      labelPos: { x: mx + nx * curveOffset * 1.5, y: my + ny * curveOffset * 1.5 }
    };
  };

  // Check if morphism is part of highlighted simplex
  const isMorphismHighlighted = (from, to) => {
    if (!hoveredSimplex) return false;
    const key = hoveredSimplex.join(',');
    const chain = composableChains[key];
    if (!chain) return false;
    
    const idx = hoveredSimplex.indexOf(from);
    const idx2 = hoveredSimplex.indexOf(to);
    return idx !== -1 && idx2 !== -1 && idx2 === idx + 1;
  };

  const renderCategory = () => {
    return (
      <svg 
        ref={svgRef}
        viewBox="0 0 560 400" 
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <marker id="arrowHead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
          </marker>
          <marker id="arrowHeadHighlight" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
          </marker>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>
        </defs>
        
        <rect width="560" height="400" fill="url(#bgGrad)" rx="12" />
        
        {/* Title */}
        <text x="280" y="30" textAnchor="middle" fill="#334155" fontSize="16" fontWeight="600"
              fontFamily="Georgia, serif">
          Category C
        </text>

        {/* Morphisms */}
        {morphisms.map((m, idx) => {
          const { path, labelPos } = getMorphismPath(m.from, m.to);
          const isHighlighted = isMorphismHighlighted(m.from, m.to);
          const isComposite = m.from === 'A' && m.to === 'D';
          
          return (
            <g key={`morph-${idx}`}>
              <path
                d={path}
                fill="none"
                stroke={isHighlighted ? '#6366f1' : (isComposite ? '#94a3b8' : '#64748b')}
                strokeWidth={isHighlighted ? 3 : 2}
                strokeDasharray={isComposite ? '6,4' : 'none'}
                markerEnd={isHighlighted ? 'url(#arrowHeadHighlight)' : 'url(#arrowHead)'}
                filter={isHighlighted ? 'url(#softGlow)' : 'none'}
                style={{ transition: 'all 0.2s ease' }}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                fill={isHighlighted ? '#4f46e5' : '#475569'}
                fontSize={isComposite ? '11' : '14'}
                fontStyle="italic"
                fontFamily="Georgia, serif"
              >
                {m.label}
              </text>
            </g>
          );
        })}

        {/* Objects */}
        {objects.map(obj => {
          const pos = categoryPositions[obj];
          const isInSimplex = hoveredSimplex?.includes(obj);
          const scale = isInSimplex ? 1.15 : 1;
          
          return (
            <g 
              key={obj}
              onMouseDown={(e) => handleMouseDown(obj, e)}
              style={{ cursor: 'grab' }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={22 * scale}
                fill={isInSimplex ? '#6366f1' : '#1e293b'}
                filter={isInSimplex ? 'url(#softGlow)' : 'none'}
                style={{ transition: 'all 0.2s ease' }}
              />
              <text
                x={pos.x}
                y={pos.y + 6}
                textAnchor="middle"
                fill="white"
                fontSize="18"
                fontWeight="bold"
                fontFamily="Georgia, serif"
              >
                {obj}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const SimplexVisualization = ({ simplex, dimension, isHovered, onHover }) => {
    const size = 80;
    const padding = 10;
    
    const getVertexPosition = (idx, total) => {
      if (total === 1) return { x: size / 2, y: size / 2 };
      if (total === 2) return { x: padding + idx * (size - 2 * padding), y: size / 2 };
      if (total === 3) {
        const positions = [
          { x: size / 2, y: padding + 5 },
          { x: padding, y: size - padding - 5 },
          { x: size - padding, y: size - padding - 5 }
        ];
        return positions[idx];
      }
      return { x: size / 2, y: size / 2 };
    };

    const vertices = simplex.map((v, i) => ({
      label: v,
      pos: getVertexPosition(i, simplex.length)
    }));

    return (
      <div 
        className={`relative rounded-xl transition-all duration-200 cursor-pointer ${
          isHovered 
            ? 'bg-indigo-100 ring-2 ring-indigo-400 shadow-lg' 
            : 'bg-slate-50 hover:bg-slate-100'
        }`}
        style={{ width: size, height: size }}
        onMouseEnter={() => onHover(simplex)}
        onMouseLeave={() => onHover(null)}
      >
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
          {/* Fill for 2-simplex */}
          {dimension === 2 && (
            <polygon
              points={vertices.map(v => `${v.pos.x},${v.pos.y}`).join(' ')}
              fill={isHovered ? 'rgba(99, 102, 241, 0.2)' : 'rgba(100, 116, 139, 0.1)'}
              stroke={isHovered ? '#6366f1' : '#94a3b8'}
              strokeWidth="1"
            />
          )}
          
          {/* Edges for 1+ simplices */}
          {dimension >= 1 && vertices.map((v, i) => {
            if (i === vertices.length - 1) return null;
            const next = vertices[i + 1];
            return (
              <line
                key={`edge-${i}`}
                x1={v.pos.x}
                y1={v.pos.y}
                x2={next.pos.x}
                y2={next.pos.y}
                stroke={isHovered ? '#6366f1' : '#64748b'}
                strokeWidth={isHovered ? 2 : 1.5}
              />
            );
          })}
          
          {/* Vertices */}
          {vertices.map((v, i) => (
            <g key={`vertex-${i}`}>
              <circle
                cx={v.pos.x}
                cy={v.pos.y}
                r={dimension === 0 ? 12 : 10}
                fill={isHovered ? '#4f46e5' : '#334155'}
              />
              <text
                x={v.pos.x}
                y={v.pos.y + 4}
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="bold"
              >
                {v.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  const renderNerve = () => {
    const dimensions = showAllDimensions ? [0, 1, 2] : [selectedDimension];
    
    return (
      <div className="space-y-4">
        {dimensions.map(dim => (
          <div 
            key={dim}
            className={`p-4 rounded-xl transition-all ${
              !showAllDimensions ? 'bg-white' : 
              dim === selectedDimension ? 'bg-white ring-2 ring-indigo-200' : 'bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${
                dim === 0 ? 'bg-emerald-500' :
                dim === 1 ? 'bg-blue-500' :
                'bg-purple-500'
              }`}>
                {dim}
              </div>
              <div>
                <h4 className="font-semibold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>
                  {dim}-Simplices (N(C){subscript(dim)})
                </h4>
                <p className="text-xs text-slate-500">
                  {dim === 0 && 'Objects of C'}
                  {dim === 1 && 'Morphisms of C'}
                  {dim === 2 && 'Composable pairs in C'}
                </p>
              </div>
              <div className="ml-auto text-sm text-slate-600">
                |N(C){subscript(dim)}| = {nerve[dim].length}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {nerve[dim].map((simplex, idx) => (
                <SimplexVisualization
                  key={idx}
                  simplex={simplex}
                  dimension={dim}
                  isHovered={hoveredSimplex?.join(',') === simplex.join(',')}
                  onHover={setHoveredSimplex}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-slate-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            The <span className="text-indigo-600">Nerve</span> of a Category
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
            Every category has a nerve — a simplicial set that encodes its compositional structure.
            This is the bridge between category theory and homotopy theory.
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2].map(dim => (
            <button
              key={dim}
              onClick={() => {
                setSelectedDimension(dim);
                setShowAllDimensions(false);
              }}
              className={`px-5 py-3 rounded-xl transition-all ${
                selectedDimension === dim && !showAllDimensions
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white text-slate-600 hover:bg-indigo-50'
              }`}
            >
              <div className="font-semibold">{dim}-simplices</div>
              <div className="text-xs opacity-70">
                {dim === 0 && 'objects'}
                {dim === 1 && 'morphisms'}
                {dim === 2 && 'composable pairs'}
              </div>
            </button>
          ))}
          <button
            onClick={() => setShowAllDimensions(!showAllDimensions)}
            className={`px-5 py-3 rounded-xl transition-all ${
              showAllDimensions
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                : 'bg-white text-slate-600 hover:bg-purple-50'
            }`}
          >
            <div className="font-semibold">All</div>
            <div className="text-xs opacity-70">dimensions</div>
          </button>
        </div>

        {/* Main visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Category */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>
                Source: Category C
              </h3>
              <p className="text-sm text-slate-500">Drag objects to rearrange</p>
            </div>
            <div className="h-[400px]">
              {renderCategory()}
            </div>
          </div>

          {/* Nerve */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>
                Target: Nerve N(C) ∈ sSet
              </h3>
              <p className="text-sm text-slate-500">Hover to highlight in category</p>
            </div>
            <div className="p-4 h-[400px] overflow-y-auto">
              {renderNerve()}
            </div>
          </div>
        </div>

        {/* Formula explanation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">0</div>
              <h4 className="font-semibold text-emerald-800">0-Simplices</h4>
            </div>
            <p className="text-sm text-emerald-700 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              N(C)₀ = Ob(C)
            </p>
            <p className="text-xs text-emerald-600">
              Each object of C becomes a vertex (0-simplex) in the nerve.
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</div>
              <h4 className="font-semibold text-blue-800">1-Simplices</h4>
            </div>
            <p className="text-sm text-blue-700 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              N(C)₁ = Mor(C)
            </p>
            <p className="text-xs text-blue-600">
              Each morphism f: A → B becomes an edge from A to B.
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-purple-500 text-white flex items-center justify-center text-sm font-bold">2</div>
              <h4 className="font-semibold text-purple-800">2-Simplices</h4>
            </div>
            <p className="text-sm text-purple-700 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              N(C)₂ = composable pairs
            </p>
            <p className="text-xs text-purple-600">
              Each composable pair (f, g) with g∘f defined becomes a filled triangle.
            </p>
          </div>
        </div>

        {/* Key insight */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Why the Nerve Matters
          </h3>
          <p className="opacity-90 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            The nerve functor N: Cat → sSet is <em>fully faithful</em>: a category can be completely 
            recovered from its nerve. But not every simplicial set is the nerve of a category — 
            only those satisfying the <em>strict</em> Segal condition (unique horn fillers).
          </p>
          <p className="opacity-80 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
            A <strong>quasi-category</strong> relaxes this: instead of requiring <em>unique</em> fillers 
            for inner horns, it only requires fillers to <em>exist</em>. This generalization 
            gives us ∞-categories where composition is defined only up to (coherent) homotopy.
          </p>
        </div>
      </div>
    </div>
  );
};

const subscript = (n) => {
  const subs = { '0': '₀', '1': '₁', '2': '₂', '3': '₃' };
  return String(n).split('').map(c => subs[c] || c).join('');
};

export default NerveExplorer;
