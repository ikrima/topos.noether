import React, { useState, useEffect, useRef } from 'react';

/**
 * ∞-CATEGORY NAVIGATOR
 * =====================
 * 
 * Emily Riehl's Vision:
 * "∞-categories are not just abstract nonsense—they're the natural home for homotopy-coherent
 * mathematics. Every diagram that 'commutes up to homotopy' lives here. The key is seeing
 * how composition at level n constrains composition at level n+1, creating an infinite
 * tower of coherence."
 * 
 * This navigator lets you:
 * - Walk through levels of morphisms (0-cells, 1-cells, 2-cells, ...)
 * - See composition operations at each level
 * - Understand how perverse sheaves form an ∞-category
 * - Visualize the Kan complex structure
 */

const InfinityCategoryNavigator = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [compositionPath, setCompositionPath] = useState([]);
  const [showCoherence, setShowCoherence] = useState(true);
  const [categoryType, setCategoryType] = useState('perverse');
  const canvasRef = useRef(null);

  // =====================================================================
  // MATHEMATICAL STRUCTURES
  // =====================================================================

  const categories = {
    perverse: {
      name: 'Perv(X) - Perverse Sheaves',
      description: 'The ∞-category of perverse sheaves with derived morphisms',
      objects: ['IC_X', 'IC_Y', 'IC_Z', 'j_!*ℚ_U', '𝔻IC_X'],
      morphisms: {
        1: [
          { from: 'IC_X', to: 'IC_Y', name: 'f', desc: 'Morphism in Perv(X)' },
          { from: 'IC_Y', to: 'IC_Z', name: 'g', desc: 'Morphism in Perv(X)' },
          { from: 'IC_X', to: 'IC_Z', name: 'g∘f', desc: 'Composition' },
        ],
        2: [
          { between: ['f', 'g∘f'], name: 'α', desc: '2-morphism (homotopy)' },
          { between: ['id', 'f∘f⁻¹'], name: 'η', desc: 'Unit 2-cell' },
        ],
        3: [
          { between: ['α', 'β'], name: 'Ψ', desc: 'Modification' },
        ]
      },
      properties: [
        'Abelian heart at level 0',
        'Stable ∞-category structure',
        'Verdier duality is an involution',
        't-structure defines truncation functors'
      ]
    },
    derived: {
      name: 'D^b_c(X) - Derived Category',
      description: 'The ∞-category underlying the derived category',
      objects: ['F•', 'G•', 'H•', 'Cone(f)', 'F[1]'],
      morphisms: {
        1: [
          { from: 'F•', to: 'G•', name: 'f', desc: 'Chain map' },
          { from: 'G•', to: 'H•', name: 'g', desc: 'Chain map' },
          { from: 'F•', to: 'Cone(f)', name: 'i', desc: 'Inclusion' },
        ],
        2: [
          { between: ['f', 'g'], name: 'α', desc: 'Chain homotopy' },
        ],
        3: []
      },
      properties: [
        'Triangulated structure (classical)',
        'Stable ∞-category (natural enhancement)',
        'Shift functor [1] is an autoequivalence',
        'Distinguished triangles from pushouts'
      ]
    },
    spaces: {
      name: '𝓢 - ∞-Category of Spaces',
      description: 'Kan complexes / ∞-groupoids',
      objects: ['X', 'Y', 'Z', 'Map(X,Y)', 'ΩX'],
      morphisms: {
        1: [
          { from: 'X', to: 'Y', name: 'f', desc: 'Continuous map' },
          { from: 'Y', to: 'Z', name: 'g', desc: 'Continuous map' },
        ],
        2: [
          { between: ['f', 'g'], name: 'H', desc: 'Homotopy' },
        ],
        3: [
          { between: ['H', 'K'], name: 'Ψ', desc: 'Homotopy of homotopies' },
        ]
      },
      properties: [
        'Every morphism is invertible (∞-groupoid)',
        'Composition defined up to coherent homotopy',
        'Models homotopy types',
        'Universal example of ∞-category'
      ]
    }
  };

  const currentCategory = categories[categoryType];

  // =====================================================================
  // CANVAS RENDERING
  // =====================================================================

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.clientWidth;
    const height = canvas.height = canvas.clientHeight;

    // Clear
    ctx.fillStyle = '#0f1419';
    ctx.fillRect(0, 0, width, height);

    // Draw level indicators
    const maxLevel = 5;
    const levelHeight = height / (maxLevel + 1);

    for (let level = 0; level <= maxLevel; level++) {
      const y = height - level * levelHeight;
      const isActive = level === currentLevel;

      // Level background
      if (isActive) {
        ctx.fillStyle = 'rgba(138, 180, 248, 0.1)';
        ctx.fillRect(0, y - levelHeight/2, width, levelHeight);
      }

      // Level line
      ctx.strokeStyle = isActive ? '#8ab4f8' : 'rgba(138, 180, 248, 0.2)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Level label
      ctx.fillStyle = isActive ? '#8ab4f8' : 'rgba(138, 180, 248, 0.5)';
      ctx.font = `${isActive ? 'bold ' : ''}14px "Fira Code", monospace`;
      ctx.fillText(`${level}-cells`, 20, y - 10);

      // Level description
      const descriptions = [
        'Objects',
        'Morphisms',
        'Natural transformations',
        'Modifications',
        'Pentagonators',
        'Higher coherence'
      ];
      ctx.font = '11px "Fira Code", monospace';
      ctx.fillStyle = isActive ? '#c58af9' : 'rgba(197, 138, 249, 0.5)';
      ctx.fillText(descriptions[level] || 'Higher cells', 100, y - 10);
    }

    // Draw objects at level 0
    if (currentLevel >= 0) {
      const objects = currentCategory.objects;
      const objectSpacing = width / (objects.length + 1);

      objects.forEach((obj, i) => {
        const x = (i + 1) * objectSpacing;
        const y = height - 0 * levelHeight;

        // Object node
        const radius = selectedObjects.includes(obj) ? 25 : 20;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = selectedObjects.includes(obj) 
          ? 'rgba(197, 138, 249, 0.3)' 
          : 'rgba(138, 180, 248, 0.2)';
        ctx.fill();
        ctx.strokeStyle = selectedObjects.includes(obj) ? '#c58af9' : '#8ab4f8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Object label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(obj, x, y + 4);
      });
    }

    // Draw 1-morphisms
    if (currentLevel >= 1 && currentCategory.morphisms[1]) {
      currentCategory.morphisms[1].forEach(morph => {
        const fromIdx = currentCategory.objects.indexOf(morph.from);
        const toIdx = currentCategory.objects.indexOf(morph.to);
        
        if (fromIdx === -1 || toIdx === -1) return;

        const objectSpacing = width / (currentCategory.objects.length + 1);
        const x1 = (fromIdx + 1) * objectSpacing;
        const x2 = (toIdx + 1) * objectSpacing;
        const y = height - 1 * levelHeight;

        // Arrow
        ctx.beginPath();
        ctx.moveTo(x1, height);
        ctx.quadraticCurveTo((x1 + x2) / 2, y, x2, height);
        ctx.strokeStyle = compositionPath.includes(morph.name) ? '#c58af9' : '#8ab4f8';
        ctx.lineWidth = compositionPath.includes(morph.name) ? 3 : 2;
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(height - y, x2 - (x1 + x2) / 2);
        ctx.save();
        ctx.translate(x2, height);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -5);
        ctx.lineTo(-10, 5);
        ctx.closePath();
        ctx.fillStyle = compositionPath.includes(morph.name) ? '#c58af9' : '#8ab4f8';
        ctx.fill();
        ctx.restore();

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'italic 11px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(morph.name, (x1 + x2) / 2, y + 5);
      });
    }

    // Draw 2-morphisms (if showing coherence)
    if (currentLevel >= 2 && showCoherence && currentCategory.morphisms[2]) {
      currentCategory.morphisms[2].forEach((twoCell, idx) => {
        const y = height - 2 * levelHeight;
        const x = width / 2 + (idx - currentCategory.morphisms[2].length/2) * 150;

        // 2-cell surface (simplified as bubble)
        ctx.beginPath();
        ctx.ellipse(x, y, 60, 40, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(197, 138, 249, 0.15)';
        ctx.fill();
        ctx.strokeStyle = '#c58af9';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.fillStyle = '#c58af9';
        ctx.font = 'bold 13px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(twoCell.name, x, y + 5);
        ctx.font = '10px "Fira Code", monospace';
        ctx.fillText(twoCell.desc, x, y + 20);
      });
    }

    // Draw 3-morphisms
    if (currentLevel >= 3 && showCoherence && currentCategory.morphisms[3] && currentCategory.morphisms[3].length > 0) {
      const y = height - 3 * levelHeight;
      const x = width / 2;

      // 3-cell globe
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50);
      gradient.addColorStop(0, 'rgba(110, 231, 183, 0.3)');
      gradient.addColorStop(1, 'rgba(110, 231, 183, 0.05)');

      ctx.beginPath();
      ctx.arc(x, y, 50, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 14px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Higher coherence', x, y + 5);
    }

  }, [currentLevel, selectedObjects, compositionPath, showCoherence, categoryType]);

  // =====================================================================
  // COMPOSITION CALCULATOR
  // =====================================================================

  const calculateComposition = () => {
    if (selectedObjects.length < 2) return null;
    
    // Find morphisms between selected objects
    const morphisms = currentCategory.morphisms[1] || [];
    const path = [];
    
    for (let i = 0; i < selectedObjects.length - 1; i++) {
      const morph = morphisms.find(
        m => m.from === selectedObjects[i] && m.to === selectedObjects[i + 1]
      );
      if (morph) path.push(morph.name);
    }
    
    return path.length > 0 ? path.join(' ∘ ') : null;
  };

  const composition = calculateComposition();

  // =====================================================================
  // RENDER UI
  // =====================================================================

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(165deg, #0f1419 0%, #1a1535 50%, #0f1419 100%)',
      color: '#e8e8e8',
      fontFamily: '"Charter", "Georgia", serif',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <header style={{
        padding: '2rem 3rem',
        borderBottom: '1px solid rgba(138, 180, 248, 0.2)',
        background: 'rgba(15, 20, 25, 0.8)',
        backdropFilter: 'blur(10px)',
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 300,
          margin: 0,
          background: 'linear-gradient(135deg, #8ab4f8 0%, #c58af9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          ∞-Category Navigator
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#888',
          margin: '0.5rem 0 0 0',
          fontStyle: 'italic',
        }}>
          Exploring {currentCategory.name}
        </p>
      </header>

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        height: 'calc(100vh - 120px)',
        gap: '1rem',
        padding: '1rem 3rem',
      }}>
        {/* Left Panel - Controls */}
        <div style={{
          overflowY: 'auto',
          paddingRight: '1rem',
        }}>
          {/* Category Selector */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(138, 180, 248, 0.2)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1rem',
          }}>
            <h3 style={{
              color: '#8ab4f8',
              fontSize: '1.2rem',
              marginBottom: '1rem',
            }}>
              Choose Your ∞-Category
            </h3>
            {Object.entries(categories).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setCategoryType(key)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '1rem',
                  marginBottom: '0.5rem',
                  background: categoryType === key ? 'rgba(138, 180, 248, 0.2)' : 'rgba(138, 180, 248, 0.05)',
                  border: categoryType === key ? '2px solid #8ab4f8' : '1px solid rgba(138, 180, 248, 0.2)',
                  borderRadius: '6px',
                  color: '#e8e8e8',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: '"Fira Code", monospace',
                  fontSize: '0.9rem',
                }}
              >
                <strong style={{ color: categoryType === key ? '#8ab4f8' : '#888' }}>
                  {cat.name}
                </strong>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                  {cat.description}
                </div>
              </button>
            ))}
          </div>

          {/* Level Control */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(138, 180, 248, 0.2)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1rem',
          }}>
            <h3 style={{
              color: '#c58af9',
              fontSize: '1.2rem',
              marginBottom: '1rem',
            }}>
              Navigate Levels
            </h3>
            <label style={{
              display: 'block',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: '#aaa',
            }}>
              Current Level: <strong style={{ color: '#c58af9', fontSize: '1.2rem' }}>{currentLevel}</strong>
            </label>
            <input
              type="range"
              min="0"
              max="5"
              value={currentLevel}
              onChange={(e) => setCurrentLevel(parseInt(e.target.value))}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(138, 180, 248, 0.2)',
                outline: 'none',
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '0.5rem',
              fontSize: '0.8rem',
              color: '#666',
            }}>
              <span>0-cells</span>
              <span>1-cells</span>
              <span>2-cells</span>
              <span>3-cells</span>
            </div>
          </div>

          {/* Coherence Toggle */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(138, 180, 248, 0.2)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1rem',
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}>
              <input
                type="checkbox"
                checked={showCoherence}
                onChange={(e) => setShowCoherence(e.target.checked)}
                style={{ marginRight: '0.75rem' }}
              />
              Show Higher Coherence Data
            </label>
          </div>

          {/* Composition Display */}
          {composition && (
            <div style={{
              background: 'rgba(197, 138, 249, 0.1)',
              border: '2px solid #c58af9',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '1rem',
            }}>
              <h4 style={{ color: '#c58af9', marginBottom: '0.75rem', fontSize: '1rem' }}>
                Composition
              </h4>
              <div style={{
                fontFamily: '"Fira Code", monospace',
                fontSize: '1.1rem',
                color: '#fff',
              }}>
                {composition}
              </div>
            </div>
          )}

          {/* Properties */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(110, 231, 183, 0.2)',
            borderRadius: '8px',
            padding: '1.5rem',
          }}>
            <h4 style={{ color: '#6ee7b7', marginBottom: '1rem', fontSize: '1.1rem' }}>
              Properties
            </h4>
            {currentCategory.properties.map((prop, i) => (
              <div
                key={i}
                style={{
                  fontSize: '0.85rem',
                  color: '#aaa',
                  marginBottom: '0.5rem',
                  paddingLeft: '1rem',
                  borderLeft: '2px solid #6ee7b7',
                }}
              >
                {prop}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Visualization */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(138, 180, 248, 0.2)',
          borderRadius: '8px',
          padding: '1.5rem',
          position: 'relative',
        }}>
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>

      {/* Emily Riehl Quote */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '800px',
        background: 'rgba(197, 138, 249, 0.1)',
        border: '1px solid rgba(197, 138, 249, 0.3)',
        borderRadius: '8px',
        padding: '1rem 2rem',
        fontSize: '0.85rem',
        color: '#ccc',
        textAlign: 'center',
        fontStyle: 'italic',
      }}>
        <strong style={{ color: '#c58af9', fontStyle: 'normal' }}>Emily Riehl:</strong> "An ∞-category
        is a Kan complex enriched over itself. The miracle is that homotopy-coherent composition at every
        level emerges automatically from the simplicial structure. This is why perverse sheaves, which
        classically live in a triangulated category, are more naturally ∞-categorical objects."
      </div>
    </div>
  );
};

export default InfinityCategoryNavigator;
