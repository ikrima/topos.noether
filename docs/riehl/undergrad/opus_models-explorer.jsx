import React, { useState, useEffect, useRef } from 'react';

// Models of ∞-Categories: A Comparative View
// Visualizing the equivalence between different presentations

const ModelsExplorer = () => {
  const [selectedModel, setSelectedModel] = useState('qCat');
  const [showConnections, setShowConnections] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [hoveredModel, setHoveredModel] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(p => (p + 0.015) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const models = {
    qCat: {
      name: 'Quasi-categories',
      altName: 'Weak Kan complexes',
      color: '#6366f1',
      lightColor: '#eef2ff',
      position: { x: 200, y: 150 },
      definition: 'Simplicial sets with inner horn fillers',
      structure: 'X₀ → X₁ → X₂ → ⋯',
      keyProperty: 'Every inner horn Λⁿₖ (0 < k < n) has a filler',
      author: 'Joyal, Lurie',
      pros: ['Clean definition', 'Good for mapping spaces', 'HTT foundation'],
      example: 'The nerve of a category is a quasi-category'
    },
    Rezk: {
      name: 'Complete Segal Spaces',
      altName: 'Rezk spaces',
      color: '#10b981',
      lightColor: '#ecfdf5',
      position: { x: 600, y: 150 },
      definition: 'Bisimplicial sets that are Reedy fibrant with Segal and completeness conditions',
      structure: '⋮   ⋮   ⋱\nX₀₁ X₁₁ ⋯\nX₀₀ X₁₀ ⋯',
      keyProperty: 'Segal maps & completeness maps are equivalences',
      author: 'Rezk',
      pros: ['Natural model structure', 'Objects form a space', 'Good for localization'],
      example: 'Classification diagram of a category'
    },
    Segal: {
      name: 'Segal Categories',
      altName: '',
      color: '#f59e0b',
      lightColor: '#fffbeb',
      position: { x: 200, y: 400 },
      definition: 'Simplicial spaces with discrete objects satisfying Segal conditions',
      structure: 'Simplicial space with X₀ discrete',
      keyProperty: 'Segal maps are equivalences, objects are discrete',
      author: 'Dwyer-Kan-Smith, Hirschowitz-Simpson',
      pros: ['Strict objects', 'Easier to construct', 'Good for enriched categories'],
      example: 'Simplicial localization of a category'
    },
    '1Comp': {
      name: '1-Complicial Sets',
      altName: 'Saturated 1-trivial weak complicial sets',
      color: '#ef4444',
      lightColor: '#fef2f2',
      position: { x: 600, y: 400 },
      definition: 'Stratified simplicial sets with certain horn extensions',
      structure: 'Simplicial set with "thin" simplices marked',
      keyProperty: 'Marked simplices satisfy extension conditions',
      author: 'Verity, Riehl-Verity',
      pros: ['Handles strict structure', 'Good for directed homotopy', 'Synthetic approach'],
      example: 'Street nerve of a 2-category'
    }
  };

  // Connections between models (all are equivalent!)
  const connections = [
    { from: 'qCat', to: 'Rezk', label: '≃' },
    { from: 'qCat', to: 'Segal', label: '≃' },
    { from: 'qCat', to: '1Comp', label: '≃' },
    { from: 'Rezk', to: 'Segal', label: '≃' },
    { from: 'Rezk', to: '1Comp', label: '≃' },
    { from: 'Segal', to: '1Comp', label: '≃' }
  ];

  const ModelCard = ({ id, model, isSelected, isHovered }) => {
    const scale = isSelected ? 1.05 : (isHovered ? 1.02 : 1);
    const elevation = isSelected ? '0 20px 40px' : (isHovered ? '0 10px 20px' : '0 4px 8px');
    
    return (
      <div
        className="absolute transition-all duration-300 cursor-pointer"
        style={{
          left: model.position.x - 150,
          top: model.position.y - 80,
          width: 300,
          transform: `scale(${scale})`,
          zIndex: isSelected ? 20 : (isHovered ? 15 : 10)
        }}
        onClick={() => setSelectedModel(id)}
        onMouseEnter={() => setHoveredModel(id)}
        onMouseLeave={() => setHoveredModel(null)}
      >
        <div 
          className="rounded-xl p-4 border-2 transition-all duration-300"
          style={{
            backgroundColor: isSelected ? model.lightColor : 'white',
            borderColor: isSelected ? model.color : '#e2e8f0',
            boxShadow: `${elevation} ${model.color}20`
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: model.color }}
            />
            <h3 
              className="font-semibold text-lg"
              style={{ color: model.color, fontFamily: 'Georgia, serif' }}
            >
              {model.name}
            </h3>
          </div>
          {model.altName && (
            <p className="text-xs text-slate-500 mb-2 italic">{model.altName}</p>
          )}
          <p className="text-sm text-slate-600 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            {model.definition}
          </p>
          <div className="text-xs text-slate-500">
            {model.author}
          </div>
        </div>
      </div>
    );
  };

  const renderConnections = () => {
    if (!showConnections) return null;
    
    return connections.map(({ from, to, label }, idx) => {
      const m1 = models[from];
      const m2 = models[to];
      const isHighlighted = selectedModel === from || selectedModel === to;
      
      // Calculate midpoint for label
      const mx = (m1.position.x + m2.position.x) / 2;
      const my = (m1.position.y + m2.position.y) / 2;
      
      // Slight curve offset
      const dx = m2.position.x - m1.position.x;
      const dy = m2.position.y - m1.position.y;
      const nx = -dy / Math.sqrt(dx*dx + dy*dy) * 20;
      const ny = dx / Math.sqrt(dx*dx + dy*dy) * 20;
      
      return (
        <g key={`conn-${idx}`}>
          <path
            d={`M ${m1.position.x} ${m1.position.y} 
                Q ${mx + nx} ${my + ny} 
                  ${m2.position.x} ${m2.position.y}`}
            fill="none"
            stroke={isHighlighted ? '#6366f1' : '#cbd5e1'}
            strokeWidth={isHighlighted ? 3 : 1.5}
            strokeDasharray={isHighlighted ? 'none' : '8,4'}
            opacity={isHighlighted ? 1 : 0.5}
            style={{ transition: 'all 0.3s ease' }}
          />
          <circle
            cx={mx + nx * 0.5}
            cy={my + ny * 0.5}
            r={12}
            fill="white"
            stroke={isHighlighted ? '#6366f1' : '#cbd5e1'}
            strokeWidth="2"
          />
          <text
            x={mx + nx * 0.5}
            y={my + ny * 0.5 + 4}
            textAnchor="middle"
            fill={isHighlighted ? '#6366f1' : '#94a3b8'}
            fontSize="14"
            fontWeight="bold"
          >
            {label}
          </text>
        </g>
      );
    });
  };

  const selectedModelData = models[selectedModel];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-light text-slate-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Models of <span className="text-indigo-600">∞-Categories</span>
          </h1>
          <p className="text-slate-600 text-lg" style={{ fontFamily: 'Georgia, serif' }}>
            Multiple equivalent presentations — the model independence theorem
          </p>
        </div>

        {/* Connection toggle */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowConnections(!showConnections)}
            className={`px-4 py-2 rounded-lg transition-all ${
              showConnections 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-slate-600 hover:bg-indigo-50'
            }`}
          >
            {showConnections ? '✓ Showing Equivalences' : 'Show Equivalences'}
          </button>
        </div>

        {/* Main diagram */}
        <div className="relative bg-white rounded-2xl shadow-xl mb-6" style={{ height: 550 }}>
          {/* Connection lines (SVG layer) */}
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 800 550"
            style={{ zIndex: 5 }}
          >
            {renderConnections()}
          </svg>

          {/* Model cards */}
          {Object.entries(models).map(([id, model]) => (
            <ModelCard
              key={id}
              id={id}
              model={model}
              isSelected={selectedModel === id}
              isHovered={hoveredModel === id}
            />
          ))}

          {/* Central "∞-categories" node */}
          <div className="absolute" style={{ left: 350, top: 230, zIndex: 25 }}>
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(
                  ${models.qCat.color} 0deg 90deg,
                  ${models.Rezk.color} 90deg 180deg,
                  ${models.Segal.color} 180deg 270deg,
                  ${models['1Comp'].color} 270deg 360deg
                )`,
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
              }}
            >
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>
                  ∞-Cat
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected model details */}
        <div 
          className="rounded-2xl p-6 border-2 transition-all duration-300"
          style={{ 
            backgroundColor: selectedModelData.lightColor,
            borderColor: selectedModelData.color 
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 
                className="text-2xl font-semibold mb-3"
                style={{ color: selectedModelData.color, fontFamily: 'Georgia, serif' }}
              >
                {selectedModelData.name}
              </h2>
              
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Structure:</h4>
                <pre className="bg-white rounded-lg p-3 text-sm font-mono whitespace-pre-wrap">
                  {selectedModelData.structure}
                </pre>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Key Property:</h4>
                <p className="text-slate-600" style={{ fontFamily: 'Georgia, serif' }}>
                  {selectedModelData.keyProperty}
                </p>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Advantages:</h4>
                <ul className="space-y-1">
                  {selectedModelData.pros.map((pro, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-600">
                      <span style={{ color: selectedModelData.color }}>✓</span>
                      <span style={{ fontFamily: 'Georgia, serif' }}>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Example:</h4>
                <p className="text-slate-600 italic" style={{ fontFamily: 'Georgia, serif' }}>
                  {selectedModelData.example}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key insight */}
        <div className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Model Independence Theorem
          </h3>
          <p className="opacity-90" style={{ fontFamily: 'Georgia, serif' }}>
            All four models are <em>equivalent</em> as presentations of the same underlying mathematical 
            structure. This means any theorem proven in one model automatically transfers to all others. 
            The choice of model depends on the problem at hand — quasi-categories are great for mapping spaces, 
            complete Segal spaces for localization, Segal categories for enriched structures, and 
            1-complicial sets for directed homotopy theory.
          </p>
          <p className="mt-3 opacity-80 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
            As Riehl emphasizes: "We work with a particular model only when necessary for a specific construction, 
            but the theorems hold independently of the choice."
          </p>
        </div>

        {/* Reference */}
        <div className="mt-6 text-center text-slate-500 text-sm">
          <p>Based on Emily Riehl's "∞-category theory for undergraduates" • Theories of Everything Podcast</p>
        </div>
      </div>
    </div>
  );
};

export default ModelsExplorer;
