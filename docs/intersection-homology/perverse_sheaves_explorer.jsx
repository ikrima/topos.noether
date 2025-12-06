import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

// ============================================================================
// PERVERSE SHEAVES EXPLORER
// An Interactive Journey Through Stratified Spaces
// ============================================================================

const PerverseSheafExplorer = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const [interactionState, setInteractionState] = useState({
    stratification: 'node_in_plane',
    showOrdinaryHomology: true,
    showIntersectionHomology: true,
    tStructureShift: 0,
    characteristicCycle: false,
    cotangentView: false
  });

  const sections = [
    { id: 'intro', label: 'The Problem', icon: '∑' },
    { id: 'stratifications', label: 'Stratifications', icon: '⊔' },
    { id: 'intersection', label: 'Intersection Homology', icon: 'IH' },
    { id: 'perverse', label: 'Perverse Sheaves', icon: '𝒫' },
    { id: 'tstructure', label: 't-Structure', icon: '𝒟' },
    { id: 'characteristic', label: 'Characteristic Cycles', icon: 'CC' },
    { id: 'operations', label: 'Six Operations', icon: 'f*' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(165deg, #0a0e27 0%, #1a1f3a 50%, #0f1129 100%)',
      color: '#e8edf4',
      fontFamily: '"Eczar", "Crimson Text", serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Constellation Background */}
      <ConstellationBackground />
      
      {/* Header */}
      <header style={{
        padding: '2rem 4rem',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        background: 'rgba(10, 14, 39, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 700,
          margin: 0,
          background: 'linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em'
        }}>
          Perverse Sheaves
        </h1>
        <p style={{
          margin: '0.5rem 0 0 0',
          fontSize: '1.1rem',
          color: '#9ca3af',
          fontFamily: '"JetBrains Mono", monospace',
          letterSpacing: '0.05em'
        }}>
          Understanding Stratified Topology Through the Derived Category
        </p>
      </header>

      {/* Navigation */}
      <nav style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '1.5rem 4rem',
        overflowX: 'auto',
        background: 'rgba(26, 31, 58, 0.6)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)'
      }}>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              padding: '0.75rem 1.5rem',
              border: activeSection === section.id 
                ? '2px solid #d4af37' 
                : '1px solid rgba(212, 175, 55, 0.3)',
              background: activeSection === section.id
                ? 'rgba(212, 175, 55, 0.15)'
                : 'rgba(26, 31, 58, 0.8)',
              color: activeSection === section.id ? '#f4e4a6' : '#9ca3af',
              cursor: 'pointer',
              borderRadius: '4px',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={e => {
              if (activeSection !== section.id) {
                e.target.style.borderColor = 'rgba(212, 175, 55, 0.6)';
                e.target.style.background = 'rgba(26, 31, 58, 0.95)';
              }
            }}
            onMouseLeave={e => {
              if (activeSection !== section.id) {
                e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                e.target.style.background = 'rgba(26, 31, 58, 0.8)';
              }
            }}
          >
            <span style={{ fontSize: '1.2rem', fontFamily: 'serif' }}>{section.icon}</span>
            {section.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main style={{ padding: '3rem 4rem', position: 'relative', zIndex: 1 }}>
        {activeSection === 'intro' && <IntroSection />}
        {activeSection === 'stratifications' && (
          <StratificationsSection 
            state={interactionState} 
            setState={setInteractionState} 
          />
        )}
        {activeSection === 'intersection' && (
          <IntersectionHomologySection 
            state={interactionState} 
            setState={setInteractionState} 
          />
        )}
        {activeSection === 'perverse' && <PerverseSheavesSection />}
        {activeSection === 'tstructure' && (
          <TStructureSection 
            state={interactionState} 
            setState={setInteractionState} 
          />
        )}
        {activeSection === 'characteristic' && (
          <CharacteristicCyclesSection 
            state={interactionState} 
            setState={setInteractionState} 
          />
        )}
        {activeSection === 'operations' && <SixOperationsSection />}
      </main>
    </div>
  );
};

// ============================================================================
// CONSTELLATION BACKGROUND
// ============================================================================

const ConstellationBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Generate constellation points
    const points = [];
    for (let i = 0; i < 80; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.3
      });
    }

    // Draw connections and points
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw points
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${point.alpha})`;
        ctx.fill();
      });
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

// ============================================================================
// SECTION: INTRODUCTION
// ============================================================================

const IntroSection = () => (
  <div style={{ maxWidth: '900px', margin: '0 auto' }}>
    <h2 style={{
      fontSize: '2.5rem',
      marginBottom: '2rem',
      color: '#d4af37',
      fontWeight: 600
    }}>
      The Problem of Singular Spaces
    </h2>
    
    <SectionCard>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
        Ordinary homology fails catastrophically on singular spaces. Consider a simple example: 
        a cone over a circle. Topologically, it's contractible, so its homology is trivial. 
        But this misses the essential geometric information—the singularity at the cone point.
      </p>

      <div style={{
        background: 'rgba(212, 175, 55, 0.1)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '2rem 0',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.95rem'
      }}>
        <div style={{ marginBottom: '1rem', color: '#d4af37' }}>The Classical Disaster:</div>
        <div style={{ marginLeft: '1rem', lineHeight: '1.8' }}>
          H*(Cone(S¹)) = H*(point) = ℤ[0]
        </div>
        <div style={{ marginLeft: '1rem', lineHeight: '1.8', color: '#9ca3af', marginTop: '0.5rem' }}>
          // Lost: information about the circle at infinity!
        </div>
      </div>

      <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
        The revolution came in the late 1970s when Goresky and MacPherson asked: what if we 
        modify homology to "see" the stratification? What if we impose transversality conditions 
        on our chains?
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        margin: '2rem 0'
      }}>
        <KeyInsight
          title="Stratification Awareness"
          content="Spaces decompose into smooth strata of varying dimensions. The topology 'jumps' across these strata."
        />
        <KeyInsight
          title="Controlled Behavior"
          content="Impose perversity conditions: control how chains can intersect strata of different codimensions."
        />
      </div>

      <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginTop: '2rem' }}>
        This led to <em style={{ color: '#d4af37' }}>intersection homology</em>—a theory that 
        recovers Poincaré duality for singular spaces. But the story deepens dramatically when 
        we realize intersection homology lives naturally as a <em style={{ color: '#d4af37' }}>sheaf</em>.
      </p>
    </SectionCard>

    <SectionCard style={{ marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.8rem', color: '#d4af37', marginBottom: '1.5rem' }}>
        The Categorical Miracle
      </h3>
      <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
        In the early 1980s, Beilinson, Bernstein, Deligne, and Gabber made a stunning discovery: 
        intersection homology sheaves are not just sheaves—they're part of a <em>distinguished 
        subcategory</em> of the derived category of constructible sheaves, defined by vanishing 
        conditions that can be characterized purely categorically.
      </p>
      <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginTop: '1.5rem' }}>
        This subcategory, called <span style={{ 
          color: '#d4af37', 
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '1.05em'
        }}>Perv(X)</span>, forms the heart of a <em>t-structure</em>—a 
        way of doing homological algebra in the derived category. The name "perverse" (French: 
        <em>faisceaux pervers</em>) comes from the fact that the degree conventions are 
        intentionally shifted to make formulas work beautifully.
      </p>
    </SectionCard>
  </div>
);

// ============================================================================
// SECTION: STRATIFICATIONS
// ============================================================================

const StratificationsSection = ({ state, setState }) => {
  const canvasRef = useRef(null);

  const stratifications = {
    node_in_plane: {
      name: 'Node in ℂ (xy = 0)',
      strata: [
        { name: 'S₀', dim: 0, desc: 'singular point (origin)' },
        { name: 'S₁', dim: 1, desc: 'two smooth branches' }
      ]
    },
    cusp: {
      name: 'Cusp in ℂ (y² = x³)',
      strata: [
        { name: 'S₀', dim: 0, desc: 'singular point' },
        { name: 'S₁', dim: 1, desc: 'smooth points' }
      ]
    },
    cone: {
      name: 'Cone over S¹',
      strata: [
        { name: 'S₀', dim: 0, desc: 'cone point' },
        { name: 'S₁', dim: 1, desc: 'radial lines' },
        { name: 'S₂', dim: 2, desc: 'open cone (minus apex)' }
      ]
    },
    whitney: {
      name: 'Whitney Umbrella',
      strata: [
        { name: 'S₀', dim: 0, desc: 'pinch point' },
        { name: 'S₁', dim: 1, desc: 'double line' },
        { name: 'S₂', dim: 2, desc: 'sheets' }
      ]
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = 600;
    const height = canvas.height = 400;

    ctx.fillStyle = 'rgba(10, 14, 39, 0.8)';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // Draw based on selected stratification
    switch (state.stratification) {
      case 'node_in_plane':
        // Draw two crossing lines (node)
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.lineTo(500, 300);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(100, 300);
        ctx.lineTo(500, 100);
        ctx.stroke();
        
        // Singular point
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Labels
        ctx.fillStyle = '#9ca3af';
        ctx.font = '16px "JetBrains Mono"';
        ctx.fillText('S₁ (1-stratum)', 420, 320);
        ctx.fillText('S₀ (0-stratum)', centerX + 20, centerY - 10);
        break;

      case 'cusp':
        // Draw cusp curve y² = x³
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x <= 200; x += 1) {
          const t = (x / 200) * 2 - 1;
          const px = centerX + t * t * 150;
          const py = centerY + t * t * t * 100;
          if (x === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        
        // Singular point
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'cone':
        // Draw cone as radial lines
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.lineWidth = 1;
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(
            centerX + Math.cos(angle) * 150,
            centerY + Math.sin(angle) * 150
          );
          ctx.stroke();
        }
        
        // Circle at base
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
        ctx.stroke();
        
        // Apex
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'whitney':
        // Draw Whitney umbrella cross-section
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3;
        
        // Double line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 100);
        ctx.lineTo(centerX, centerY + 100);
        ctx.stroke();
        
        // Two sheets
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 100);
        ctx.quadraticCurveTo(centerX + 100, centerY, centerX + 150, centerY + 100);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 100);
        ctx.quadraticCurveTo(centerX - 100, centerY, centerX - 150, centerY + 100);
        ctx.stroke();
        
        // Pinch point
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }, [state.stratification]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#d4af37' }}>
        Stratifications: Decomposing Singular Spaces
      </h2>

      <SectionCard>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
          A <em style={{ color: '#d4af37' }}>stratification</em> decomposes a space X into 
          disjoint smooth manifolds (strata) of various dimensions, arranged by closure relations.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>Select Stratification:</h3>
            {Object.entries(stratifications).map(([key, strat]) => (
              <button
                key={key}
                onClick={() => setState({ ...state, stratification: key })}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '1rem',
                  marginBottom: '0.5rem',
                  background: state.stratification === key 
                    ? 'rgba(212, 175, 55, 0.2)' 
                    : 'rgba(26, 31, 58, 0.6)',
                  border: state.stratification === key 
                    ? '2px solid #d4af37' 
                    : '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#e8edf4',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  textAlign: 'left',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {strat.name}
              </button>
            ))}

            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '8px'
            }}>
              <h4 style={{ color: '#d4af37', marginBottom: '1rem' }}>Strata:</h4>
              {stratifications[state.stratification].strata.map((stratum, idx) => (
                <div key={idx} style={{ 
                  marginBottom: '0.75rem',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.9rem'
                }}>
                  <span style={{ color: '#d4af37' }}>{stratum.name}</span>
                  <span style={{ color: '#9ca3af' }}> (dim {stratum.dim})</span>
                  <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginLeft: '1rem' }}>
                    {stratum.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: '400px',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '8px',
                background: 'rgba(10, 14, 39, 0.8)'
              }}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.8rem', color: '#d4af37', marginBottom: '1.5rem' }}>
          Stratification Axioms
        </h3>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.95rem',
          lineHeight: '2'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ color: '#d4af37' }}>1. Decomposition:</span> X = ⊔ Sᵢ (disjoint union of strata)
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ color: '#d4af37' }}>2. Frontier Condition:</span> If S̄ᵢ ∩ Sⱼ ≠ ∅, then Sⱼ ⊂ S̄ᵢ
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ color: '#d4af37' }}>3. Local Triviality:</span> Each stratum has a neighborhood like Sᵢ × cone(link)
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

// ============================================================================
// SECTION: INTERSECTION HOMOLOGY
// ============================================================================

const IntersectionHomologySection = ({ state, setState }) => {
  const perversities = {
    middle: { t: [0, 0, 1, 1, 2, 2, 3], name: 'Middle (m̄)' },
    lower: { t: [0, 0, 0, 1, 1, 2, 2], name: 'Lower (p̄)' },
    upper: { t: [0, 0, 1, 2, 2, 3, 3], name: 'Upper (q̄)' },
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#d4af37' }}>
        Intersection Homology
      </h2>

      <SectionCard>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
          The key idea: modify chain complexes by imposing <em style={{ color: '#d4af37' }}>allowability 
          conditions</em> that control how chains can intersect strata.
        </p>

        <div style={{
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '8px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#d4af37', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Perversity Functions
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            A <em>perversity</em> p̄ is a function {'{'}codim{'}'} → ℤ that determines allowable 
            intersection dimensions:
          </p>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '1rem',
            background: 'rgba(10, 14, 39, 0.6)',
            padding: '1.5rem',
            borderRadius: '4px',
            lineHeight: '1.8'
          }}>
            <div>p̄(0) = p̄(1) = 0</div>
            <div>p̄(k) ≤ p̄(k+1) ≤ p̄(k) + 1</div>
            <div style={{ marginTop: '1rem', color: '#9ca3af' }}>
              // A k-chain σ is p̄-allowable if:
            </div>
            <div style={{ color: '#d4af37' }}>
              dim(σ ∩ Sᵢ) ≤ k - codim(Sᵢ) + p̄(codim(Sᵢ))
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          {Object.entries(perversities).map(([key, perv]) => (
            <div
              key={key}
              style={{
                padding: '1.5rem',
                background: 'rgba(26, 31, 58, 0.6)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '8px'
              }}
            >
              <h4 style={{ color: '#d4af37', marginBottom: '1rem' }}>{perv.name}</h4>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem' }}>
                {perv.t.map((val, idx) => (
                  <div key={idx} style={{ marginBottom: '0.3rem' }}>
                    p̄({idx}) = {val}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.8rem', color: '#d4af37', marginBottom: '1.5rem' }}>
          The Fundamental Theorem
        </h3>
        <div style={{
          background: 'rgba(212, 175, 55, 0.15)',
          border: '2px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '8px',
          padding: '2rem',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '1.05rem',
          lineHeight: '2'
        }}>
          <div style={{ color: '#d4af37', marginBottom: '1rem' }}>Theorem (Goresky-MacPherson):</div>
          <div>For a complex algebraic variety X of complex dimension n,</div>
          <div>with middle perversity m̄:</div>
          <div style={{ marginTop: '1rem', marginLeft: '2rem' }}>
            IH²ⁿ⁻ᵏ_m̄(X) ≅ IHᵏ_m̄(X)*
          </div>
          <div style={{ marginTop: '1rem', color: '#9ca3af' }}>
            // Poincaré duality restored!
          </div>
        </div>

        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginTop: '2rem' }}>
          This is remarkable: on smooth manifolds, we recover ordinary homology. On singular spaces, 
          we get a theory that satisfies Poincaré duality—something ordinary homology cannot do.
        </p>
      </SectionCard>
    </div>
  );
};

// ============================================================================
// SECTION: PERVERSE SHEAVES
// ============================================================================

const PerverseSheavesSection = () => (
  <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
    <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#d4af37' }}>
      The Sheaf-Theoretic Perspective
    </h2>

    <SectionCard>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
        The breakthrough: intersection homology arises from <em style={{ color: '#d4af37' }}>sheaves</em> on X. 
        More precisely, from objects in the <em>derived category</em> D^b_c(X) of bounded constructible 
        complexes.
      </p>

      <div style={{
        background: 'rgba(212, 175, 55, 0.1)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '8px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: '#d4af37', marginBottom: '1.5rem' }}>From Chains to Sheaves</h3>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.95rem', lineHeight: '1.8' }}>
          <div>Ordinary Homology: H*(X) = H*(C*(X))</div>
          <div style={{ marginTop: '0.5rem' }}>
            Sheaf Perspective: H*(X) = H*(X; ℚ_X)
          </div>
          <div style={{ marginTop: '1.5rem', color: '#d4af37' }}>
            Intersection Homology: IH*(X) = H*(X; IC_X)
          </div>
          <div style={{ marginTop: '0.5rem', color: '#9ca3af' }}>
            // IC_X is the "intersection cohomology complex"
          </div>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)',
        border: '2px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '8px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: '#d4af37', marginBottom: '1.5rem', fontSize: '1.6rem' }}>
          Definition: Perverse Sheaves
        </h3>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
          A complex F• ∈ D^b_c(X) is <em style={{ color: '#d4af37' }}>perverse</em> if it satisfies 
          support and cosupport conditions:
        </p>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '1rem',
          lineHeight: '2',
          background: 'rgba(10, 14, 39, 0.6)',
          padding: '1.5rem',
          borderRadius: '4px'
        }}>
          <div style={{ color: '#d4af37' }}>dim Supp(ℋⁱ(F•)) ≤ -i</div>
          <div style={{ color: '#d4af37' }}>dim Supp(ℋⁱ(𝔻F•)) ≤ -i</div>
          <div style={{ marginTop: '1rem', color: '#9ca3af' }}>
            // 𝔻 is Verdier duality
          </div>
        </div>
      </div>
    </SectionCard>

    <SectionCard style={{ marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.8rem', color: '#d4af37', marginBottom: '1.5rem' }}>
        Why "Perverse"?
      </h3>
      <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
        The name comes from the French <em>faisceaux pervers</em> meaning "contrary sheaves." 
        The degree conventions are intentionally shifted: what looks like it should be in degree 0 
        lives in degree -dim(X).
      </p>
      <div style={{
        padding: '1.5rem',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        fontFamily: '"JetBrains Mono", monospace'
      }}>
        <div style={{ color: '#ef4444', marginBottom: '0.5rem' }}>The "Perversity" Shift:</div>
        <div style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
          ℚ_X[dim X] is perverse (not ℚ_X)
        </div>
        <div style={{ fontSize: '0.95rem', lineHeight: '1.8', marginTop: '0.5rem' }}>
          For X smooth of dimension n: ℚ_X[n] ∈ Perv(X)
        </div>
      </div>
    </SectionCard>

    <SectionCard style={{ marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.8rem', color: '#d4af37', marginBottom: '1.5rem' }}>
        Key Properties
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <KeyInsight
          title="Abelian Category"
          content="Perv(X) is an abelian category inside D^b_c(X), despite being a subcategory of a triangulated category!"
        />
        <KeyInsight
          title="Artinian"
          content="Every perverse sheaf has a finite Jordan-Hölder series with simple perverse sheaves as factors"
        />
        <KeyInsight
          title="Self-Dual"
          content="Verdier duality preserves Perv(X): 𝔻: Perv(X) → Perv(X)^op"
        />
        <KeyInsight
          title="Stable Under Operations"
          content="The six functor formalism preserves or transforms perverse sheaves predictably"
        />
      </div>
    </SectionCard>
  </div>
);

// ============================================================================
// SECTION: T-STRUCTURE
// ============================================================================

const TStructureSection = ({ state, setState }) => {
  const degrees = [-3, -2, -1, 0, 1, 2, 3];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#d4af37' }}>
        The Perverse t-Structure
      </h2>

      <SectionCard>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
          A <em style={{ color: '#d4af37' }}>t-structure</em> on a triangulated category 𝒟 
          is a way to do homological algebra—it specifies "what belongs in which degree."
        </p>

        <div style={{
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '8px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#d4af37', marginBottom: '1.5rem' }}>Definition</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1rem' }}>
            A pair (𝒟^≤0, 𝒟^≥0) of full subcategories satisfying:
          </p>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.95rem', lineHeight: '2', marginLeft: '2rem' }}>
            <div>1. 𝒟^≤0 ⊂ 𝒟^≤1 and 𝒟^≥1 ⊂ 𝒟^≥0</div>
            <div>2. Hom(X, Y[−1]) = 0 for X ∈ 𝒟^≤0, Y ∈ 𝒟^≥0</div>
            <div>3. Every X ∈ 𝒟 fits in a triangle:</div>
            <div style={{ marginLeft: '2rem', color: '#d4af37' }}>
              A → X → B → A[1]
            </div>
            <div style={{ marginLeft: '2rem' }}>
              with A ∈ 𝒟^≤0 and B ∈ 𝒟^≥1
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '8px',
          padding: '2rem'
        }}>
          <h3 style={{ color: '#d4af37', marginBottom: '1.5rem', fontSize: '1.6rem' }}>
            The Heart
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1rem' }}>
            The <em style={{ color: '#d4af37' }}>heart</em> of the t-structure is:
          </p>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '1.1rem',
            background: 'rgba(10, 14, 39, 0.6)',
            padding: '1.5rem',
            borderRadius: '4px',
            marginBottom: '1.5rem',
            textAlign: 'center',
            color: '#d4af37'
          }}>
            𝒞 = 𝒟^≤0 ∩ 𝒟^≥0
          </div>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
            For the perverse t-structure: <span style={{ 
              fontFamily: '"JetBrains Mono", monospace',
              color: '#d4af37'
            }}>𝒞 = Perv(X)</span>, which is an abelian category!
          </p>
        </div>
      </SectionCard>

      <SectionCard style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.8rem', color: '#d4af37', marginBottom: '1.5rem' }}>
          Truncation Functors
        </h3>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
          The t-structure comes with truncation functors:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{
            padding: '1.5rem',
            background: 'rgba(26, 31, 58, 0.6)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '8px'
          }}>
            <h4 style={{ color: '#d4af37', marginBottom: '1rem' }}>τ^≤n (Lower Truncation)</h4>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <div>τ^≤n: 𝒟 → 𝒟^≤n</div>
              <div style={{ marginTop: '0.5rem', color: '#9ca3af' }}>
                // Kills cohomology above degree n
              </div>
            </div>
          </div>
          <div style={{
            padding: '1.5rem',
            background: 'rgba(26, 31, 58, 0.6)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '8px'
          }}>
            <h4 style={{ color: '#d4af37', marginBottom: '1rem' }}>τ^≥n (Upper Truncation)</h4>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <div>τ^≥n: 𝒟 → 𝒟^≥n</div>
              <div style={{ marginTop: '0.5rem', color: '#9ca3af' }}>
                // Kills cohomology below degree n
              </div>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '2rem',
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '8px'
        }}>
          <h4 style={{ color: '#d4af37', marginBottom: '1rem' }}>Perverse Cohomology</h4>
          <p style={{ fontSize: '1rem', lineHeight: '1.8', marginBottom: '1rem' }}>
            The perverse t-structure gives us new cohomology functors:
          </p>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '1rem',
            background: 'rgba(10, 14, 39, 0.6)',
            padding: '1.5rem',
            borderRadius: '4px'
          }}>
            <div style={{ color: '#d4af37' }}>ᵖℋⁱ(F•) := τ^≤i τ^≥i F•</div>
            <div style={{ marginTop: '0.5rem', color: '#9ca3af' }}>
              // "Perverse cohomology in degree i"
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.8rem', color: '#d4af37', marginBottom: '1.5rem' }}>
          Interactive: Shift the t-Structure
        </h3>
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '1rem', fontSize: '1.1rem' }}>
            Degree shift: {state.tStructureShift}
          </label>
          <input
            type="range"
            min="-3"
            max="3"
            value={state.tStructureShift}
            onChange={(e) => setState({ ...state, tStructureShift: parseInt(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '2rem',
          background: 'rgba(10, 14, 39, 0.6)',
          borderRadius: '8px',
          fontFamily: '"JetBrains Mono", monospace'
        }}>
          {degrees.map(d => {
            const shifted = d + state.tStructureShift;
            const inHeart = shifted === 0;
            return (
              <div
                key={d}
                style={{
                  padding: '1rem',
                  background: inHeart ? 'rgba(212, 175, 55, 0.3)' : 'transparent',
                  border: inHeart ? '2px solid #d4af37' : '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '4px',
                  textAlign: 'center',
                  minWidth: '60px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{shifted}</div>
                {inHeart && (
                  <div style={{ fontSize: '0.8rem', color: '#d4af37', marginTop: '0.5rem' }}>
                    Heart
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
};

// ============================================================================
// SECTION: CHARACTERISTIC CYCLES
// ============================================================================

const CharacteristicCyclesSection = ({ state, setState }) => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#d4af37' }}>
        Characteristic Cycles
      </h2>

      <SectionCard>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
          Perverse sheaves have a remarkable geometric invariant: their <em style={{ color: '#d4af37' }}>characteristic 
          cycle</em>, which lives in the cotangent bundle T*X.
        </p>

        <div style={{
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '8px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#d4af37', marginBottom: '1.5rem' }}>The Construction</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            For a constructible complex F• on X, the characteristic cycle CC(F•) is a Lagrangian 
            cycle in the cotangent bundle T*X that encodes:
          </p>
          <ul style={{ fontSize: '1.05rem', lineHeight: '2', marginLeft: '2rem' }}>
            <li>Which directions are "singular" for F•</li>
            <li>Multiplicities measuring "how singular"</li>
            <li>Geometric data invisible in cohomology</li>
          </ul>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '8px',
          padding: '2rem'
        }}>
          <h3 style={{ color: '#d4af37', marginBottom: '1.5rem', fontSize: '1.6rem' }}>
            Kashiwara's Index Theorem
          </h3>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '1rem',
            background: 'rgba(10, 14, 39, 0.6)',
            padding: '1.5rem',
            borderRadius: '4px',
            marginBottom: '1.5rem',
            lineHeight: '2'
          }}>
            <div style={{ color: '#d4af37' }}>Theorem (Kashiwara):</div>
            <div>If F ∈ Perv(X), then CC(F) is a</div>
            <div>Lagrangian cycle with positive multiplicities.</div>
            <div style={{ marginTop: '1rem' }}>
              Moreover: χ(X, F) = deg(CC(F))
            </div>
          </div>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
            This connects topology (Euler characteristic) with symplectic geometry (degree of 
            Lagrangian cycle)!
          </p>
        </div>
      </SectionCard>

      <SectionCard style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.8rem', color: '#d4af37', marginBottom: '1.5rem' }}>
          Example: Constant Sheaf on ℂ
        </h3>
        <CotangentVisualization />
      </SectionCard>

      <SectionCard style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.8rem', color: '#d4af37', marginBottom: '1.5rem' }}>
          Microlocal Perspective
        </h3>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
          Characteristic cycles reveal the <em style={{ color: '#d4af37' }}>microlocal</em> structure 
          of sheaves—how they behave in specific directions. This connects to:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <KeyInsight
            title="Wave Front Sets"
            content="From microlocal analysis: directions where distributional singularities propagate"
          />
          <KeyInsight
            title="Symplectic Geometry"
            content="Lagrangian submanifolds in T*X encode classical mechanics / geometric optics"
          />
          <KeyInsight
            title="Tropical Geometry"
            content="Characteristic cycles tropicalize to polyhedral complexes—combinatorial shadows"
          />
          <KeyInsight
            title="Fukaya Categories"
            content="Connection to mirror symmetry via Lagrangian correspondences"
          />
        </div>
      </SectionCard>
    </div>
  );
};

// ============================================================================
// SECTION: SIX OPERATIONS
// ============================================================================

const SixOperationsSection = () => (
  <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
    <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#d4af37' }}>
      The Six Operations
    </h2>

    <SectionCard>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
        Grothendieck's formalism of the <em style={{ color: '#d4af37' }}>six operations</em> governs 
        how sheaves behave under maps. For a morphism f: X → Y, we have:
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <OperationCard
          symbol="f*"
          name="Pullback"
          direction="D^b_c(Y) → D^b_c(X)"
          description="Pull sheaves back along f"
        />
        <OperationCard
          symbol="f_!"
          name="Pushforward with compact support"
          direction="D^b_c(X) → D^b_c(Y)"
          description="Push forward, zero outside image"
        />
        <OperationCard
          symbol="f_*"
          name="Direct image"
          direction="D^b_c(X) → D^b_c(Y)"
          description="Push forward all sections"
        />
        <OperationCard
          symbol="f^!"
          name="Exceptional inverse image"
          direction="D^b_c(Y) → D^b_c(X)"
          description="Right adjoint to f_!"
        />
        <OperationCard
          symbol="⊗"
          name="Tensor product"
          direction="D^b_c(X) × D^b_c(X) → D^b_c(X)"
          description="Combine sheaves"
        />
        <OperationCard
          symbol="ℛℋom"
          name="Internal Hom"
          direction="D^b_c(X)^op × D^b_c(X) → D^b_c(X)"
          description="Sheaf of homomorphisms"
        />
      </div>

      <div style={{
        background: 'rgba(212, 175, 55, 0.1)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '8px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: '#d4af37', marginBottom: '1.5rem' }}>Adjunction Relationships</h3>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '1rem',
          lineHeight: '2.5'
        }}>
          <div>f* ⊣ f_* (pullback ⊣ pushforward)</div>
          <div>f_! ⊣ f^! (compact support ⊣ exceptional)</div>
          <div>⊗ ⊣ ℛℋom (tensor ⊣ internal hom)</div>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
        border: '2px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '8px',
        padding: '2rem'
      }}>
        <h3 style={{ color: '#d4af37', marginBottom: '1.5rem', fontSize: '1.6rem' }}>
          Perverse Sheaves Under Operations
        </h3>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
          The perverse t-structure has remarkable stability properties:
        </p>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '1rem',
          lineHeight: '2',
          background: 'rgba(10, 14, 39, 0.6)',
          padding: '1.5rem',
          borderRadius: '4px'
        }}>
          <div><span style={{ color: '#d4af37' }}>For f: X → Y proper:</span> f_* preserves Perv</div>
          <div style={{ marginTop: '0.5rem' }}><span style={{ color: '#d4af37' }}>For f: X → Y smooth:</span> f* preserves Perv</div>
          <div style={{ marginTop: '0.5rem' }}><span style={{ color: '#d4af37' }}>Duality:</span> 𝔻: Perv(X) → Perv(X)^op</div>
          <div style={{ marginTop: '0.5rem' }}><span style={{ color: '#d4af37' }}>Intermediate extension:</span> j_!*: Perv(U) → Perv(X)</div>
        </div>
      </div>
    </SectionCard>

    <SectionCard style={{ marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.8rem', color: '#d4af37', marginBottom: '1.5rem' }}>
        The Decomposition Theorem
      </h3>
      <div style={{
        background: 'rgba(212, 175, 55, 0.15)',
        border: '2px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '8px',
        padding: '2rem',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '1.05rem',
        lineHeight: '2'
      }}>
        <div style={{ color: '#d4af37', marginBottom: '1rem' }}>Theorem (BBD):</div>
        <div>For f: X → Y proper map of complex varieties,</div>
        <div>and F ∈ Perv(X), we have:</div>
        <div style={{ marginTop: '1rem', marginLeft: '2rem', color: '#d4af37' }}>
          f_* F ≅ ⊕ᵢ (IC_Yᵢ ⊗ Lᵢ)[dᵢ]
        </div>
        <div style={{ marginTop: '1rem', color: '#9ca3af' }}>
          // Direct sum of shifted IC sheaves!
        </div>
      </div>
      <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginTop: '2rem' }}>
        This is one of the crown jewels of the theory: pushforwards of perverse sheaves decompose 
        into simple pieces in a canonical way.
      </p>
    </SectionCard>
  </div>
);

// ============================================================================
// SUPPORTING COMPONENTS
// ============================================================================

const SectionCard = ({ children, style = {} }) => (
  <div style={{
    background: 'rgba(26, 31, 58, 0.5)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '12px',
    padding: '2.5rem',
    backdropFilter: 'blur(10px)',
    ...style
  }}>
    {children}
  </div>
);

const KeyInsight = ({ title, content }) => (
  <div style={{
    padding: '1.5rem',
    background: 'rgba(212, 175, 55, 0.1)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '8px',
    borderLeft: '4px solid #d4af37'
  }}>
    <h4 style={{
      color: '#d4af37',
      marginBottom: '0.75rem',
      fontSize: '1.1rem',
      fontWeight: 600
    }}>
      {title}
    </h4>
    <p style={{
      fontSize: '0.95rem',
      lineHeight: '1.7',
      color: '#cbd5e1',
      margin: 0
    }}>
      {content}
    </p>
  </div>
);

const OperationCard = ({ symbol, name, direction, description }) => (
  <div style={{
    padding: '1.5rem',
    background: 'rgba(26, 31, 58, 0.6)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '8px',
    textAlign: 'center'
  }}>
    <div style={{
      fontSize: '2rem',
      color: '#d4af37',
      marginBottom: '0.5rem',
      fontFamily: 'serif'
    }}>
      {symbol}
    </div>
    <div style={{
      fontSize: '1rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
      color: '#e8edf4'
    }}>
      {name}
    </div>
    <div style={{
      fontSize: '0.85rem',
      fontFamily: '"JetBrains Mono", monospace',
      color: '#9ca3af',
      marginBottom: '0.75rem'
    }}>
      {direction}
    </div>
    <div style={{
      fontSize: '0.9rem',
      color: '#cbd5e1',
      lineHeight: '1.5'
    }}>
      {description}
    </div>
  </div>
);

const CotangentVisualization = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = 800;
    const height = canvas.height = 400;

    ctx.fillStyle = 'rgba(10, 14, 39, 0.9)';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // Draw base space (ℂ)
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Label base
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px "JetBrains Mono"';
    ctx.fillText('Base: ℂ', 20, 30);

    // Draw zero section (the base itself)
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(100, centerY);
    ctx.lineTo(700, centerY);
    ctx.stroke();

    ctx.fillStyle = '#d4af37';
    ctx.font = '16px "JetBrains Mono"';
    ctx.fillText('Zero section (base ℂ)', 520, centerY - 10);

    // Draw cotangent fibers
    const points = [200, 300, 400, 500, 600];
    points.forEach(x => {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x, centerY - 80);
      ctx.lineTo(x, centerY + 80);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    ctx.fillStyle = '#ef4444';
    ctx.font = '14px "JetBrains Mono"';
    ctx.fillText('Cotangent fibers', 620, 150);
    ctx.fillText('T*_x ℂ ≅ ℂ', 620, 170);

    // Highlight characteristic cycle
    ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
    ctx.fillRect(100, centerY - 5, 600, 10);
    
    ctx.fillStyle = '#d4af37';
    ctx.font = '16px "JetBrains Mono"';
    ctx.fillText('CC(ℚ_ℂ[1]) = zero section', 150, centerY + 30);

  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          maxWidth: '800px',
          height: 'auto',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '8px',
          background: 'rgba(10, 14, 39, 0.9)'
        }}
      />
      <p style={{
        marginTop: '1rem',
        fontSize: '0.95rem',
        color: '#9ca3af',
        fontFamily: '"JetBrains Mono", monospace'
      }}>
        The characteristic cycle of the constant sheaf ℚ_ℂ[1] is the zero section—it has 
        no conormal directions, reflecting smoothness of ℂ.
      </p>
    </div>
  );
};

export default PerverseSheafExplorer;
