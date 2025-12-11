import React, { useState, useEffect, useRef } from 'react';

// The Ladder of n-Categories
// Bret Victor-style: see all levels of abstraction simultaneously

const LadderExplorer = () => {
  const [focusLevel, setFocusLevel] = useState(1);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [expandedLevel, setExpandedLevel] = useState(null);
  const [showTransitions, setShowTransitions] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(p => (p + 0.02) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const levels = [
    {
      n: 0,
      name: 'Sets',
      altName: '0-categories',
      color: '#059669',
      lightColor: '#ecfdf5',
      hasObjects: true,
      hasMorphisms: false,
      has2Morphisms: false,
      hasHigher: false,
      description: 'Just objects, no morphisms',
      formula: 'Hom(x,y) = ∅ or {=}',
      icon: '●',
      example: 'Elements of a set'
    },
    {
      n: 1,
      name: 'Categories',
      altName: '1-categories',
      color: '#2563eb',
      lightColor: '#eff6ff',
      hasObjects: true,
      hasMorphisms: true,
      has2Morphisms: false,
      hasHigher: false,
      description: 'Objects and morphisms',
      formula: 'Hom(x,y) is a set',
      icon: '● → ●',
      example: 'Groups, Rings, Modules'
    },
    {
      n: 2,
      name: '2-Categories',
      altName: 'Bicategories',
      color: '#7c3aed',
      lightColor: '#f5f3ff',
      hasObjects: true,
      hasMorphisms: true,
      has2Morphisms: true,
      hasHigher: false,
      description: 'Objects, morphisms, and 2-morphisms',
      formula: 'Hom(x,y) is a category',
      icon: '● ⇒ ●',
      example: 'Cat, categories of spans'
    },
    {
      n: 'n',
      name: 'n-Categories',
      altName: 'Weak n-categories',
      color: '#db2777',
      lightColor: '#fdf2f8',
      hasObjects: true,
      hasMorphisms: true,
      has2Morphisms: true,
      hasHigher: true,
      description: 'Morphisms up to dimension n',
      formula: 'Hom(x,y) is an (n-1)-category',
      icon: '● ⋯ ●',
      example: 'n-fold categories'
    },
    {
      n: '∞',
      name: '∞-Categories',
      altName: '(∞,1)-categories',
      color: '#0891b2',
      lightColor: '#ecfeff',
      hasObjects: true,
      hasMorphisms: true,
      has2Morphisms: true,
      hasHigher: true,
      description: 'All higher morphisms, invertible above 1',
      formula: 'Hom(x,y) is an ∞-groupoid',
      icon: '● ∿ ●',
      example: 'Spaces, derived categories'
    }
  ];

  const LevelVisualization = ({ level, index, isFocused, isExpanded }) => {
    const scale = isFocused ? 1 : 0.85;
    const opacity = isFocused ? 1 : 0.7;
    
    // Generate visualization for this level
    const renderStructure = () => {
      const size = isExpanded ? 300 : 150;
      const cx = size / 2;
      const cy = size / 2;
      
      if (level.n === 0) {
        // Just points
        const points = [
          { x: cx - 40, y: cy },
          { x: cx, y: cy - 30 },
          { x: cx + 40, y: cy },
          { x: cx, y: cy + 30 }
        ];
        return (
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={10} fill={level.color} />
            ))}
          </svg>
        );
      }
      
      if (level.n === 1) {
        // Objects with morphisms (arrows)
        return (
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
            <defs>
              <marker id={`arrow-${level.n}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={level.color} />
              </marker>
            </defs>
            {/* Objects */}
            <circle cx={cx - 50} cy={cy} r={12} fill={level.color} />
            <circle cx={cx + 50} cy={cy} r={12} fill={level.color} />
            {/* Morphism */}
            <line x1={cx - 35} y1={cy} x2={cx + 35} y2={cy} 
                  stroke={level.color} strokeWidth="2" markerEnd={`url(#arrow-${level.n})`} />
            {/* Labels */}
            <text x={cx - 50} y={cy + 30} textAnchor="middle" fill="#64748b" fontSize="12">x</text>
            <text x={cx + 50} y={cy + 30} textAnchor="middle" fill="#64748b" fontSize="12">y</text>
            <text x={cx} y={cy - 10} textAnchor="middle" fill="#64748b" fontSize="11" fontStyle="italic">f</text>
          </svg>
        );
      }
      
      if (level.n === 2) {
        // Objects, morphisms, and 2-morphisms
        const pulse = 0.8 + 0.2 * Math.sin(animationPhase);
        return (
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
            <defs>
              <marker id={`arrow-${level.n}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={level.color} />
              </marker>
            </defs>
            {/* 2-morphism surface */}
            <path
              d={`M ${cx - 50} ${cy} Q ${cx} ${cy - 40} ${cx + 50} ${cy} Q ${cx} ${cy + 40} ${cx - 50} ${cy}`}
              fill={level.lightColor}
              stroke={level.color}
              strokeWidth="1"
              opacity={pulse}
            />
            {/* Two morphisms */}
            <path d={`M ${cx - 35} ${cy} Q ${cx} ${cy - 30} ${cx + 35} ${cy}`}
                  fill="none" stroke={level.color} strokeWidth="2" markerEnd={`url(#arrow-${level.n})`} />
            <path d={`M ${cx - 35} ${cy} Q ${cx} ${cy + 30} ${cx + 35} ${cy}`}
                  fill="none" stroke={level.color} strokeWidth="2" markerEnd={`url(#arrow-${level.n})`} />
            {/* Objects */}
            <circle cx={cx - 50} cy={cy} r={12} fill={level.color} />
            <circle cx={cx + 50} cy={cy} r={12} fill={level.color} />
            {/* 2-morphism arrow */}
            <path d={`M ${cx} ${cy - 15} L ${cx} ${cy + 15}`}
                  stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow2)" />
            <defs>
              <marker id="arrow2" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="#94a3b8" />
              </marker>
            </defs>
            <text x={cx + 8} y={cy + 4} fill="#64748b" fontSize="10">α</text>
          </svg>
        );
      }
      
      // Higher categories (n and ∞)
      const pulse = 0.7 + 0.3 * Math.sin(animationPhase);
      const numLayers = level.n === 'n' ? 4 : 6;
      
      return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
          <defs>
            <marker id={`arrow-${level.n}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={level.color} />
            </marker>
          </defs>
          
          {/* Multiple layers of morphisms */}
          {Array.from({ length: numLayers }, (_, i) => {
            const offset = (i - numLayers / 2 + 0.5) * 12;
            const layerPulse = 0.3 + 0.7 * Math.sin(animationPhase + i * 0.5);
            
            return (
              <path
                key={i}
                d={`M ${cx - 35} ${cy} Q ${cx} ${cy + offset} ${cx + 35} ${cy}`}
                fill="none"
                stroke={level.color}
                strokeWidth="1.5"
                opacity={layerPulse}
              />
            );
          })}
          
          {/* Connecting tissue (higher morphisms) */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={40}
            ry={numLayers * 6}
            fill={level.lightColor}
            opacity={0.5 * pulse}
          />
          
          {/* Objects */}
          <circle cx={cx - 50} cy={cy} r={12} fill={level.color} />
          <circle cx={cx + 50} cy={cy} r={12} fill={level.color} />
          
          {/* Infinity symbol for ∞-categories */}
          {level.n === '∞' && (
            <text x={cx} y={cy + 4} textAnchor="middle" fill={level.color} fontSize="20" fontWeight="bold">
              ∿
            </text>
          )}
        </svg>
      );
    };
    
    return (
      <div
        className={`relative transition-all duration-500 cursor-pointer ${
          isExpanded ? 'col-span-full' : ''
        }`}
        style={{ 
          transform: `scale(${scale})`,
          opacity,
          zIndex: isFocused ? 10 : 1
        }}
        onClick={() => setExpandedLevel(isExpanded ? null : index)}
        onMouseEnter={() => setFocusLevel(index)}
      >
        <div 
          className={`rounded-2xl p-4 transition-all duration-300 ${
            isFocused ? 'shadow-xl ring-2' : 'shadow-md hover:shadow-lg'
          }`}
          style={{ 
            backgroundColor: isFocused ? level.lightColor : 'white',
            borderColor: level.color,
            ringColor: level.color
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: level.color }}
            >
              {level.n}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>
                {level.name}
              </h3>
              <p className="text-xs text-slate-500">{level.altName}</p>
            </div>
          </div>
          
          {/* Visualization */}
          <div className={`${isExpanded ? 'h-64' : 'h-32'} mb-3 transition-all duration-300`}>
            {renderStructure()}
          </div>
          
          {/* Info */}
          <div className="text-sm space-y-2">
            <p className="text-slate-600" style={{ fontFamily: 'Georgia, serif' }}>
              {level.description}
            </p>
            <div className="font-mono text-xs bg-slate-100 rounded px-2 py-1 inline-block">
              {level.formula}
            </div>
            {isExpanded && (
              <div className="pt-2 border-t border-slate-200 mt-2">
                <p className="text-xs text-slate-500">
                  <strong>Example:</strong> {level.example}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Transition arrow */}
        {showTransitions && index < levels.length - 1 && !isExpanded && (
          <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 z-20">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg"
              style={{ 
                backgroundColor: `color-mix(in srgb, ${level.color} 50%, ${levels[index + 1].color} 50%)`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              →
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-slate-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-cyan-500">
              Ladder
            </span> of n-Categories
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
            Each level adds new structure: morphisms, then 2-morphisms, then higher morphisms,
            until we reach the summit where all higher structure exists.
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setShowTransitions(!showTransitions)}
            className={`px-4 py-2 rounded-lg transition-all ${
              showTransitions ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'
            }`}
          >
            {showTransitions ? '✓' : '○'} Show Transitions
          </button>
          <button
            onClick={() => setExpandedLevel(null)}
            className="px-4 py-2 rounded-lg bg-white text-slate-600 hover:bg-slate-50"
          >
            Reset View
          </button>
        </div>

        {/* Main ladder */}
        <div className={`grid gap-8 ${
          expandedLevel !== null ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5'
        }`}>
          {levels.map((level, index) => (
            <LevelVisualization
              key={level.n}
              level={level}
              index={index}
              isFocused={focusLevel === index}
              isExpanded={expandedLevel === index}
            />
          ))}
        </div>

        {/* Key insight */}
        <div className="mt-8 bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            The Pattern
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-300 mb-2">Inductive Structure</h4>
              <p className="text-sm opacity-80" style={{ fontFamily: 'Georgia, serif' }}>
                An n-category has objects and, between any two objects, an <em>(n-1)-category</em> of morphisms.
                This recursion grounds out at n=0 (sets have no morphisms) or continues to ∞.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-300 mb-2">Why Stop at ∞?</h4>
              <p className="text-sm opacity-80" style={{ fontFamily: 'Georgia, serif' }}>
                In an (∞,1)-category, all morphisms above dimension 1 are <em>invertible</em>. 
                This gives us exactly the right amount of higher structure for homotopy theory — 
                enough to capture "sameness up to homotopy" without extra strictness.
              </p>
            </div>
          </div>
        </div>

        {/* Current focus details */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: levels[focusLevel].color }}
            >
              {levels[focusLevel].n}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>
                {levels[focusLevel].name}
              </h3>
              <p className="text-slate-500">{levels[focusLevel].description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className={`p-3 rounded-lg ${levels[focusLevel].hasObjects ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
              <div className="font-semibold">Objects</div>
              <div>{levels[focusLevel].hasObjects ? '✓ Yes' : '✗ No'}</div>
            </div>
            <div className={`p-3 rounded-lg ${levels[focusLevel].hasMorphisms ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-400'}`}>
              <div className="font-semibold">1-Morphisms</div>
              <div>{levels[focusLevel].hasMorphisms ? '✓ Yes' : '✗ No'}</div>
            </div>
            <div className={`p-3 rounded-lg ${levels[focusLevel].has2Morphisms ? 'bg-purple-50 text-purple-700' : 'bg-slate-50 text-slate-400'}`}>
              <div className="font-semibold">2-Morphisms</div>
              <div>{levels[focusLevel].has2Morphisms ? '✓ Yes' : '✗ No'}</div>
            </div>
            <div className={`p-3 rounded-lg ${levels[focusLevel].hasHigher ? 'bg-pink-50 text-pink-700' : 'bg-slate-50 text-slate-400'}`}>
              <div className="font-semibold">Higher Morphisms</div>
              <div>{levels[focusLevel].hasHigher ? '✓ All levels' : '✗ No'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LadderExplorer;
