import React, { useState, useEffect, useCallback, useRef } from 'react';

// Equivalence vs Equality
// The fundamental shift from strict to weak structure

const EquivalenceExplorer = () => {
  const [mode, setMode] = useState('equality'); // 'equality', 'isomorphism', 'equivalence'
  const [animationPhase, setAnimationPhase] = useState(0);
  const [witnessVisible, setWitnessVisible] = useState(false);
  const [coherenceLevel, setCoherenceLevel] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(p => (p + 0.02) % (Math.PI * 2));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Animate the witness appearing
  const showWitness = () => {
    setWitnessVisible(false);
    setIsAnimating(true);
    setTimeout(() => {
      setWitnessVisible(true);
      setIsAnimating(false);
    }, 500);
  };

  const EqualityView = () => (
    <div className="relative h-full">
      <svg viewBox="0 0 500 350" className="w-full h-full">
        <defs>
          <linearGradient id="eqGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f0fdf4" />
            <stop offset="100%" stopColor="#dcfce7" />
          </linearGradient>
        </defs>
        
        <rect x="50" y="50" width="400" height="250" rx="20" fill="url(#eqGrad)" stroke="#86efac" strokeWidth="2" />
        
        {/* Two "equal" objects */}
        <g>
          <circle cx="175" cy="175" r={45} fill="#22c55e" />
          <text x="175" y="182" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">A</text>
        </g>
        
        {/* Equals sign */}
        <text x="250" y="185" textAnchor="middle" fill="#166534" fontSize="36" fontWeight="bold">=</text>
        
        <g>
          <circle cx="325" cy="175" r={45} fill="#22c55e" />
          <text x="325" y="182" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">A</text>
        </g>
        
        {/* Label */}
        <text x="250" y="330" textAnchor="middle" fill="#166534" fontSize="18" fontWeight="600"
              fontFamily="Georgia, serif">
          Strict Equality: A = A
        </text>
        
        {/* Explanation */}
        <text x="250" y="80" textAnchor="middle" fill="#15803d" fontSize="14" fontFamily="Georgia, serif">
          In sets: two elements are identical or distinct
        </text>
      </svg>
    </div>
  );

  const IsomorphismView = () => {
    const pulse = 0.8 + 0.2 * Math.sin(animationPhase * 2);
    
    return (
      <div className="relative h-full">
        <svg viewBox="0 0 500 350" className="w-full h-full">
          <defs>
            <linearGradient id="isoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#eff6ff" />
              <stop offset="100%" stopColor="#dbeafe" />
            </linearGradient>
            <marker id="arrowIso" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#2563eb" />
            </marker>
            <marker id="arrowIsoRev" markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto">
              <polygon points="10 0, 0 3.5, 10 7" fill="#2563eb" />
            </marker>
          </defs>
          
          <rect x="50" y="50" width="400" height="250" rx="20" fill="url(#isoGrad)" stroke="#93c5fd" strokeWidth="2" />
          
          {/* Two objects */}
          <g>
            <circle cx="150" cy="175" r={40} fill="#2563eb" />
            <text x="150" y="182" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold">A</text>
          </g>
          
          <g>
            <circle cx="350" cy="175" r={40} fill="#2563eb" />
            <text x="350" y="182" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold">B</text>
          </g>
          
          {/* Isomorphism arrows */}
          <path 
            d="M 195 160 Q 250 120 305 160" 
            fill="none" 
            stroke="#2563eb" 
            strokeWidth="3"
            markerEnd="url(#arrowIso)"
            opacity={pulse}
          />
          <text x="250" y="115" textAnchor="middle" fill="#1e40af" fontSize="16" fontStyle="italic">f</text>
          
          <path 
            d="M 305 190 Q 250 230 195 190" 
            fill="none" 
            stroke="#2563eb" 
            strokeWidth="3"
            markerEnd="url(#arrowIso)"
            opacity={pulse}
          />
          <text x="250" y="250" textAnchor="middle" fill="#1e40af" fontSize="16" fontStyle="italic">g</text>
          
          {/* Composition equations */}
          {witnessVisible && (
            <g>
              <rect x="80" y="280" width="150" height="30" rx="6" fill="white" stroke="#93c5fd" />
              <text x="155" y="300" textAnchor="middle" fill="#1e40af" fontSize="12" fontFamily="monospace">
                g ∘ f = id_A
              </text>
              
              <rect x="270" y="280" width="150" height="30" rx="6" fill="white" stroke="#93c5fd" />
              <text x="345" y="300" textAnchor="middle" fill="#1e40af" fontSize="12" fontFamily="monospace">
                f ∘ g = id_B
              </text>
            </g>
          )}
          
          {/* Label */}
          <text x="250" y="340" textAnchor="middle" fill="#1e40af" fontSize="18" fontWeight="600"
                fontFamily="Georgia, serif">
            Isomorphism: A ≅ B
          </text>
          
          {/* Explanation */}
          <text x="250" y="80" textAnchor="middle" fill="#1d4ed8" fontSize="14" fontFamily="Georgia, serif">
            In categories: invertible morphism (unique inverse)
          </text>
        </svg>
        
        {!witnessVisible && (
          <button
            onClick={showWitness}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
          >
            Show Inverse Equations
          </button>
        )}
      </div>
    );
  };

  const EquivalenceView = () => {
    const pulse1 = 0.7 + 0.3 * Math.sin(animationPhase);
    const pulse2 = 0.7 + 0.3 * Math.sin(animationPhase + Math.PI / 2);
    const pulse3 = 0.7 + 0.3 * Math.sin(animationPhase + Math.PI);
    
    return (
      <div className="relative h-full">
        <svg viewBox="0 0 500 400" className="w-full h-full">
          <defs>
            <linearGradient id="equivGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#faf5ff" />
              <stop offset="100%" stopColor="#f3e8ff" />
            </linearGradient>
            <marker id="arrowEquiv" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#7c3aed" />
            </marker>
            <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <rect x="30" y="30" width="440" height="340" rx="20" fill="url(#equivGrad)" stroke="#c4b5fd" strokeWidth="2" />
          
          {/* Two objects */}
          <g>
            <circle cx="130" cy="180" r={35} fill="#7c3aed" />
            <text x="130" y="187" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">A</text>
          </g>
          
          <g>
            <circle cx="370" cy="180" r={35} fill="#7c3aed" />
            <text x="370" y="187" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">B</text>
          </g>
          
          {/* Equivalence arrows */}
          <path 
            d="M 170 165 Q 250 100 330 165" 
            fill="none" 
            stroke="#7c3aed" 
            strokeWidth="3"
            markerEnd="url(#arrowEquiv)"
          />
          <text x="250" y="95" textAnchor="middle" fill="#5b21b6" fontSize="15" fontStyle="italic">f</text>
          
          <path 
            d="M 330 195 Q 250 260 170 195" 
            fill="none" 
            stroke="#7c3aed" 
            strokeWidth="3"
            markerEnd="url(#arrowEquiv)"
          />
          <text x="250" y="275" textAnchor="middle" fill="#5b21b6" fontSize="15" fontStyle="italic">g</text>
          
          {/* 2-morphism witnesses */}
          {coherenceLevel >= 1 && (
            <g opacity={pulse1} filter="url(#glow2)">
              {/* g∘f ≃ id_A witness */}
              <ellipse cx="130" cy="180" rx="55" ry="35" fill="none" stroke="#a78bfa" strokeWidth="2" strokeDasharray="4,2" />
              <path d="M 95 150 Q 130 130 165 150" fill="none" stroke="#8b5cf6" strokeWidth="2" />
              <circle cx="130" cy="145" r={8} fill="#8b5cf6" />
              <text x="130" y="148" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">η</text>
              <text x="130" y="130" textAnchor="middle" fill="#6d28d9" fontSize="10">g∘f ≃ id</text>
            </g>
          )}
          
          {coherenceLevel >= 1 && (
            <g opacity={pulse2} filter="url(#glow2)">
              {/* f∘g ≃ id_B witness */}
              <ellipse cx="370" cy="180" rx="55" ry="35" fill="none" stroke="#a78bfa" strokeWidth="2" strokeDasharray="4,2" />
              <path d="M 335 150 Q 370 130 405 150" fill="none" stroke="#8b5cf6" strokeWidth="2" />
              <circle cx="370" cy="145" r={8} fill="#8b5cf6" />
              <text x="370" y="148" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">ε</text>
              <text x="370" y="130" textAnchor="middle" fill="#6d28d9" fontSize="10">f∘g ≃ id</text>
            </g>
          )}
          
          {/* Higher coherences */}
          {coherenceLevel >= 2 && (
            <g opacity={pulse3}>
              <text x="250" y="320" textAnchor="middle" fill="#7c3aed" fontSize="11" fontFamily="Georgia, serif">
                + triangle identities witnessed by 3-morphisms...
              </text>
              <text x="250" y="340" textAnchor="middle" fill="#a78bfa" fontSize="10" fontFamily="Georgia, serif">
                + coherences all the way up
              </text>
            </g>
          )}
          
          {/* Label */}
          <text x="250" y="385" textAnchor="middle" fill="#5b21b6" fontSize="18" fontWeight="600"
                fontFamily="Georgia, serif">
            Equivalence: A ≃ B
          </text>
          
          {/* Explanation */}
          <text x="250" y="60" textAnchor="middle" fill="#6d28d9" fontSize="13" fontFamily="Georgia, serif">
            In ∞-categories: inverse equations witnessed by 2-morphisms
          </text>
        </svg>
        
        {/* Coherence level control */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <span className="text-sm text-purple-700">Coherence:</span>
          <button
            onClick={() => setCoherenceLevel(1)}
            className={`px-3 py-1 rounded ${coherenceLevel >= 1 ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'}`}
          >
            η, ε
          </button>
          <button
            onClick={() => setCoherenceLevel(2)}
            className={`px-3 py-1 rounded ${coherenceLevel >= 2 ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'}`}
          >
            + higher
          </button>
        </div>
      </div>
    );
  };

  const ComparisonTable = () => (
    <div className="grid grid-cols-3 gap-4 text-sm">
      <div className={`p-4 rounded-xl transition-all ${mode === 'equality' ? 'ring-2 ring-green-400 bg-green-50' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span className="font-semibold text-green-800">Equality</span>
        </div>
        <div className="space-y-1 text-slate-600" style={{ fontFamily: 'Georgia, serif' }}>
          <p><strong>Domain:</strong> Sets</p>
          <p><strong>Notation:</strong> A = B</p>
          <p><strong>Data:</strong> Nothing (boolean)</p>
          <p><strong>Inverse:</strong> —</p>
        </div>
      </div>
      
      <div className={`p-4 rounded-xl transition-all ${mode === 'isomorphism' ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full bg-blue-500" />
          <span className="font-semibold text-blue-800">Isomorphism</span>
        </div>
        <div className="space-y-1 text-slate-600" style={{ fontFamily: 'Georgia, serif' }}>
          <p><strong>Domain:</strong> 1-Categories</p>
          <p><strong>Notation:</strong> A ≅ B</p>
          <p><strong>Data:</strong> f: A → B</p>
          <p><strong>Inverse:</strong> Unique g with g∘f = id</p>
        </div>
      </div>
      
      <div className={`p-4 rounded-xl transition-all ${mode === 'equivalence' ? 'ring-2 ring-purple-400 bg-purple-50' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full bg-purple-500" />
          <span className="font-semibold text-purple-800">Equivalence</span>
        </div>
        <div className="space-y-1 text-slate-600" style={{ fontFamily: 'Georgia, serif' }}>
          <p><strong>Domain:</strong> ∞-Categories</p>
          <p><strong>Notation:</strong> A ≃ B</p>
          <p><strong>Data:</strong> f, g, η, ε, ...</p>
          <p><strong>Inverse:</strong> Exists + witnesses</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-slate-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            From <span className="text-green-600">=</span> to{' '}
            <span className="text-blue-600">≅</span> to{' '}
            <span className="text-purple-600">≃</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
            The fundamental relaxation: from strict equality to witnessed equivalence
          </p>
        </div>

        {/* Mode selector */}
        <div className="flex justify-center gap-3 mb-6">
          {[
            { id: 'equality', label: 'Equality', symbol: '=', color: 'green' },
            { id: 'isomorphism', label: 'Isomorphism', symbol: '≅', color: 'blue' },
            { id: 'equivalence', label: 'Equivalence', symbol: '≃', color: 'purple' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id);
                setWitnessVisible(false);
              }}
              className={`px-6 py-3 rounded-xl transition-all flex items-center gap-3 ${
                mode === m.id
                  ? `bg-${m.color}-600 text-white shadow-lg shadow-${m.color}-200`
                  : 'bg-white text-slate-600 hover:bg-slate-50 shadow'
              }`}
              style={{
                backgroundColor: mode === m.id ? 
                  (m.color === 'green' ? '#16a34a' : m.color === 'blue' ? '#2563eb' : '#7c3aed') : undefined
              }}
            >
              <span className="text-2xl font-bold">{m.symbol}</span>
              <span className="font-semibold">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Main visualization */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6" style={{ height: 420 }}>
          {mode === 'equality' && <EqualityView />}
          {mode === 'isomorphism' && <IsomorphismView />}
          {mode === 'equivalence' && <EquivalenceView />}
        </div>

        {/* Comparison */}
        <ComparisonTable />

        {/* Key insight */}
        <div className="mt-6 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            The Philosophy of Equivalence
          </h3>
          <p className="opacity-90 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            In ∞-category theory, we never ask "are A and B equal?" — we ask "are A and B equivalent?" 
            An equivalence is not just a yes/no answer but comes with <em>data</em>: the morphisms f and g, 
            plus the 2-morphisms η and ε witnessing that g∘f ≃ id and f∘g ≃ id, plus higher coherences.
          </p>
          <p className="opacity-80 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
            This is the principle of <strong>equivalence invariance</strong>: any property or construction 
            in ∞-category theory must respect equivalences. We can never distinguish equivalent objects.
          </p>
        </div>

        {/* Progressive structure */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            The Progressive Weakening
          </h3>
          <div className="flex items-center justify-between text-center">
            <div className="flex-1">
              <div className="w-12 h-12 rounded-full bg-green-500 mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold">=</div>
              <p className="text-sm text-slate-600">Strict</p>
              <p className="text-xs text-slate-400">Boolean</p>
            </div>
            <div className="text-2xl text-slate-300">→</div>
            <div className="flex-1">
              <div className="w-12 h-12 rounded-full bg-blue-500 mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold">≅</div>
              <p className="text-sm text-slate-600">Invertible</p>
              <p className="text-xs text-slate-400">1-morphism</p>
            </div>
            <div className="text-2xl text-slate-300">→</div>
            <div className="flex-1">
              <div className="w-12 h-12 rounded-full bg-purple-500 mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold">≃</div>
              <p className="text-sm text-slate-600">Witnessed</p>
              <p className="text-xs text-slate-400">+ 2-morphisms</p>
            </div>
            <div className="text-2xl text-slate-300">→</div>
            <div className="flex-1">
              <div className="w-12 h-12 rounded-full bg-pink-500 mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold">∿</div>
              <p className="text-sm text-slate-600">Coherent</p>
              <p className="text-xs text-slate-400">All levels</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquivalenceExplorer;
