import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';

// ═══════════════════════════════════════════════════════════════════════════════
// IMPLICIT DIFFERENTIATION: An Interactive Exploration
// Transformed from traditional lecture notes into an explorable explanation
// ═══════════════════════════════════════════════════════════════════════════════

const ImplicitDifferentiationEssay = () => {
  // ─────────────────────────────────────────────────────────────────────────────
  // STATE: Parameters the reader can manipulate
  // ─────────────────────────────────────────────────────────────────────────────
  const [ellipseA, setEllipseA] = useState(3);
  const [ellipseB, setEllipseB] = useState(2);
  const [pointAngle, setPointAngle] = useState(Math.PI / 4);
  const [showTangent, setShowTangent] = useState(true);
  const [showDerivation, setShowDerivation] = useState(false);
  const [cubicX, setCubicX] = useState(1.5);
  const [activeSection, setActiveSection] = useState(0);
  
  // For logarithmic differentiation
  const [logBase, setLogBase] = useState(2);
  const [logX, setLogX] = useState(1.5);
  
  // For higher-order derivatives
  const [polyDegree, setPolyDegree] = useState(4);
  const [derivOrder, setDerivOrder] = useState(0);
  const [concavityX, setConcavityX] = useState(0);

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPUTED: Mathematical quantities that update with parameters
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Ellipse point and tangent
  const ellipsePoint = useMemo(() => {
    const x = ellipseA * Math.cos(pointAngle);
    const y = ellipseB * Math.sin(pointAngle);
    return { x, y };
  }, [ellipseA, ellipseB, pointAngle]);

  const ellipseTangentSlope = useMemo(() => {
    const { x, y } = ellipsePoint;
    if (Math.abs(y) < 0.01) return Infinity;
    return -(ellipseB * ellipseB * x) / (ellipseA * ellipseA * y);
  }, [ellipsePoint, ellipseA, ellipseB]);

  // Generate ellipse points for visualization
  const ellipseData = useMemo(() => {
    const points = [];
    for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
      points.push({
        x: ellipseA * Math.cos(t),
        y: ellipseB * Math.sin(t),
      });
    }
    return points;
  }, [ellipseA, ellipseB]);

  // Tangent line data
  const tangentData = useMemo(() => {
    const { x: px, y: py } = ellipsePoint;
    const m = ellipseTangentSlope;
    if (!isFinite(m)) return [{ x: px, y: -5 }, { x: px, y: 5 }];
    return [
      { x: px - 2, y: py - 2 * m },
      { x: px + 2, y: py + 2 * m },
    ];
  }, [ellipsePoint, ellipseTangentSlope]);

  // Tschirnhaus cubic: y² = x³ + 3x²
  const cubicData = useMemo(() => {
    const points = [];
    for (let x = -2.5; x <= 3; x += 0.05) {
      const ySquared = x * x * x + 3 * x * x;
      if (ySquared >= 0) {
        const y = Math.sqrt(ySquared);
        points.push({ x, yTop: y, yBottom: -y });
      }
    }
    return points;
  }, []);

  const cubicPoint = useMemo(() => {
    const x = cubicX;
    const ySquared = x * x * x + 3 * x * x;
    if (ySquared < 0) return null;
    const y = Math.sqrt(ySquared);
    const slope = (3 * x * x + 6 * x) / (2 * y);
    return { x, y, slope };
  }, [cubicX]);

  // x^x function for logarithmic differentiation
  const xToXData = useMemo(() => {
    const points = [];
    for (let x = 0.1; x <= 3; x += 0.05) {
      points.push({
        x,
        y: Math.pow(x, x),
        derivative: Math.pow(x, x) * (Math.log(x) + 1),
      });
    }
    return points;
  }, []);

  // Polynomial and its derivatives
  const polynomialData = useMemo(() => {
    // f(x) = x^4 - 3x^2 + 2
    const f = (x) => Math.pow(x, 4) - 3 * Math.pow(x, 2) + 2;
    const f1 = (x) => 4 * Math.pow(x, 3) - 6 * x;
    const f2 = (x) => 12 * Math.pow(x, 2) - 6;
    const f3 = (x) => 24 * x;
    const f4 = (x) => 24;
    
    const derivatives = [f, f1, f2, f3, f4];
    const points = [];
    
    for (let x = -2; x <= 2; x += 0.05) {
      const point = { x };
      derivatives.forEach((d, i) => {
        point[`d${i}`] = d(x);
      });
      points.push(point);
    }
    return { points, derivatives };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // STYLES
  // ─────────────────────────────────────────────────────────────────────────────
  const colors = {
    curve: '#94a3b8',      // slate-400
    tangent: '#f59e0b',    // amber-500
    point: '#f59e0b',      // amber-500
    derivative: '#8b5cf6', // violet-500
    highlight: '#22c55e',  // green-500
    grid: '#334155',       // slate-700
    text: '#e2e8f0',       // slate-200
    muted: '#64748b',      // slate-500
    accent: '#06b6d4',     // cyan-500
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPONENTS
  // ─────────────────────────────────────────────────────────────────────────────

  const SectionTitle = ({ children }) => (
    <h2 className="text-3xl font-bold text-slate-100 mb-4 mt-16">
      {children}
    </h2>
  );

  const Prose = ({ children }) => (
    <p className="text-lg text-slate-300 leading-relaxed mb-6 max-w-2xl">
      {children}
    </p>
  );

  const Highlight = ({ color = 'amber', children }) => {
    const colorClasses = {
      amber: 'text-amber-400 font-semibold',
      violet: 'text-violet-400 font-semibold',
      cyan: 'text-cyan-400 font-semibold',
      green: 'text-green-400 font-semibold',
    };
    return <span className={colorClasses[color]}>{children}</span>;
  };

  const Slider = ({ label, value, onChange, min, max, step = 0.01 }) => (
    <div className="mb-4">
      <label className="block text-sm text-slate-400 mb-1">
        {label}: <span className="text-amber-400 font-mono">{typeof value === 'number' ? value.toFixed(2) : value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
      />
    </div>
  );

  const MathBlock = ({ children, reveal = true }) => (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-lg p-4 my-6 font-mono text-center transition-all duration-500 ${reveal ? 'opacity-100' : 'opacity-0'}`}>
      <span className="text-xl text-slate-200">{children}</span>
    </div>
  );

  const InsightBox = ({ children }) => (
    <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 my-6 rounded-r-lg">
      <p className="text-amber-200">{children}</p>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HEADER */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <header className="text-center mb-16 pt-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent mb-4">
            Differentiation Techniques
          </h1>
          <p className="text-xl text-slate-400">
            An Interactive Exploration
          </p>
        </header>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 1: THE HOOK - Implicit Differentiation */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="mb-24">
          <Prose>
            <Highlight color="amber">Drag the point</Highlight> around the ellipse. 
            Watch the <Highlight color="amber">tangent line</Highlight> respond.
          </Prose>

          {/* Interactive Ellipse Visualization */}
          <div className="bg-slate-800/30 rounded-xl p-6 mb-8">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                  <XAxis 
                    dataKey="x" 
                    type="number" 
                    domain={[-4, 4]} 
                    stroke={colors.muted}
                    tickLine={false}
                  />
                  <YAxis 
                    type="number" 
                    domain={[-4, 4]} 
                    stroke={colors.muted}
                    tickLine={false}
                  />
                  
                  {/* The Ellipse */}
                  <Line
                    data={ellipseData}
                    type="natural"
                    dataKey="y"
                    stroke={colors.curve}
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={false}
                  />
                  
                  {/* Tangent Line */}
                  {showTangent && (
                    <Line
                      data={tangentData}
                      type="linear"
                      dataKey="y"
                      stroke={colors.tangent}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                  
                  {/* The Point */}
                  <ReferenceDot
                    x={ellipsePoint.x}
                    y={ellipsePoint.y}
                    r={8}
                    fill={colors.point}
                    stroke={colors.point}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Slider
                label="Point position (θ)"
                value={pointAngle}
                onChange={setPointAngle}
                min={0}
                max={2 * Math.PI}
                step={0.05}
              />
              <Slider
                label="Semi-axis a"
                value={ellipseA}
                onChange={setEllipseA}
                min={1}
                max={4}
              />
              <Slider
                label="Semi-axis b"
                value={ellipseB}
                onChange={setEllipseB}
                min={1}
                max={4}
              />
            </div>

            {/* Live Computation Display */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-slate-500 text-sm">Point x</div>
                <div className="text-amber-400 font-mono text-lg">{ellipsePoint.x.toFixed(3)}</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-slate-500 text-sm">Point y</div>
                <div className="text-amber-400 font-mono text-lg">{ellipsePoint.y.toFixed(3)}</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-slate-500 text-sm">Tangent slope</div>
                <div className="text-amber-400 font-mono text-lg">
                  {isFinite(ellipseTangentSlope) ? ellipseTangentSlope.toFixed(3) : '∞'}
                </div>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-slate-500 text-sm">Formula check</div>
                <div className="text-green-400 font-mono text-lg">
                  {(-(ellipseB * ellipseB * ellipsePoint.x) / (ellipseA * ellipseA * ellipsePoint.y)).toFixed(3)}
                </div>
              </div>
            </div>
          </div>

          <Prose>
            Notice something peculiar? We never wrote <Highlight color="cyan">y as a function of x</Highlight>. 
            The ellipse equation <span className="font-mono text-slate-400">x²/a² + y²/b² = 1</span> mixes 
            x and y together. Yet somehow, we computed a tangent slope.
          </Prose>

          <Prose>
            This is <Highlight color="violet">implicit differentiation</Highlight>. When x and y are 
            tangled in an equation, we differentiate both sides, treating y as a function of x, 
            then solve for dy/dx.
          </Prose>

          <button
            onClick={() => setShowDerivation(!showDerivation)}
            className="px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/50 rounded-lg text-violet-300 transition-colors mb-6"
          >
            {showDerivation ? 'Hide' : 'Reveal'} the derivation
          </button>

          {showDerivation && (
            <div className="bg-slate-800/50 rounded-lg p-6 space-y-4 border border-slate-700">
              <div className="font-mono text-slate-300">
                <div className="mb-2">Starting equation:</div>
                <div className="text-xl text-center mb-4">x²/a² + y²/b² = 1</div>
                
                <div className="mb-2">Differentiate both sides:</div>
                <div className="text-xl text-center mb-4">
                  <span className="text-amber-400">2x/a²</span> + <span className="text-violet-400">2y/b² · (dy/dx)</span> = 0
                </div>
                
                <div className="mb-2">Solve for dy/dx:</div>
                <div className="text-xl text-center text-green-400">
                  dy/dx = -b²x / (a²y)
                </div>
              </div>
            </div>
          )}

          <InsightBox>
            The <Highlight color="amber">tangent slope</Highlight> you see above is computed by this formula. 
            Drag the point to the top of the ellipse (y at maximum)—the tangent becomes horizontal. 
            Drag to the side (x at maximum)—the tangent becomes vertical. The formula captures both.
          </InsightBox>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 2: Another Implicit Curve */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="mb-24">
          <SectionTitle>The Tschirnhaus Cubic</SectionTitle>
          
          <Prose>
            Here's a more exotic curve: <span className="font-mono text-slate-400">y² = x³ + 3x²</span>. 
            <Highlight color="amber">Drag the x-coordinate</Highlight> and watch the tangent line.
          </Prose>

          <div className="bg-slate-800/30 rounded-xl p-6 mb-8">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                  <XAxis 
                    dataKey="x" 
                    type="number" 
                    domain={[-3, 3.5]} 
                    stroke={colors.muted}
                  />
                  <YAxis 
                    type="number" 
                    domain={[-4, 4]} 
                    stroke={colors.muted}
                  />
                  
                  {/* Upper branch */}
                  <Line
                    data={cubicData}
                    type="natural"
                    dataKey="yTop"
                    stroke={colors.curve}
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={false}
                  />
                  
                  {/* Lower branch */}
                  <Line
                    data={cubicData}
                    type="natural"
                    dataKey="yBottom"
                    stroke={colors.curve}
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={false}
                  />
                  
                  {/* Tangent Line */}
                  {cubicPoint && (
                    <Line
                      data={[
                        { x: cubicPoint.x - 1.5, y: cubicPoint.y - 1.5 * cubicPoint.slope },
                        { x: cubicPoint.x + 1.5, y: cubicPoint.y + 1.5 * cubicPoint.slope },
                      ]}
                      type="linear"
                      dataKey="y"
                      stroke={colors.tangent}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                  
                  {/* The Point */}
                  {cubicPoint && (
                    <ReferenceDot
                      x={cubicPoint.x}
                      y={cubicPoint.y}
                      r={8}
                      fill={colors.point}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6">
              <Slider
                label="x position"
                value={cubicX}
                onChange={setCubicX}
                min={0.1}
                max={2.5}
              />
            </div>

            {cubicPoint && (
              <div className="mt-4 text-center">
                <span className="text-slate-500">Slope at ({cubicPoint.x.toFixed(2)}, {cubicPoint.y.toFixed(2)}): </span>
                <span className="text-amber-400 font-mono text-xl">{cubicPoint.slope.toFixed(3)}</span>
                <span className="text-slate-600 ml-4">= (3x² + 6x)/(2y)</span>
              </div>
            )}
          </div>

          <Prose>
            The pattern is always the same: differentiate both sides, then isolate dy/dx. 
            What changes is the algebra—but the <Highlight color="violet">principle of linear approximation</Highlight> remains.
          </Prose>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 3: Logarithmic Differentiation */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="mb-24">
          <SectionTitle>Logarithmic Differentiation</SectionTitle>
          
          <Prose>
            Consider the function <span className="font-mono text-cyan-400">f(x) = xˣ</span>. 
            The base varies. The exponent varies. Neither the power rule nor the exponential rule applies directly.
          </Prose>

          <Prose>
            <Highlight color="amber">Watch the curve</Highlight> and its derivative as you explore different x values.
          </Prose>

          <div className="bg-slate-800/30 rounded-xl p-6 mb-8">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={xToXData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                  <XAxis 
                    dataKey="x" 
                    stroke={colors.muted}
                  />
                  <YAxis 
                    stroke={colors.muted}
                    domain={[0, 'auto']}
                  />
                  
                  {/* The function x^x */}
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke={colors.curve}
                    strokeWidth={3}
                    dot={false}
                    name="f(x) = xˣ"
                  />
                  
                  {/* Its derivative */}
                  <Line
                    type="monotone"
                    dataKey="derivative"
                    stroke={colors.violet}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="f'(x)"
                  />
                  
                  {/* Current x marker */}
                  <ReferenceLine x={logX} stroke={colors.tangent} strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6">
              <Slider
                label="Explore x"
                value={logX}
                onChange={setLogX}
                min={0.2}
                max={2.5}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-slate-500 text-sm">f(x) = xˣ</div>
                <div className="text-slate-200 font-mono text-lg">{Math.pow(logX, logX).toFixed(3)}</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-slate-500 text-sm">ln(x) + 1</div>
                <div className="text-violet-400 font-mono text-lg">{(Math.log(logX) + 1).toFixed(3)}</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-slate-500 text-sm">f'(x) = xˣ(ln x + 1)</div>
                <div className="text-amber-400 font-mono text-lg">
                  {(Math.pow(logX, logX) * (Math.log(logX) + 1)).toFixed(3)}
                </div>
              </div>
            </div>
          </div>

          <Prose>
            The trick is to take logarithms first: <span className="font-mono text-slate-400">ln f(x) = x ln x</span>. 
            Now we can differentiate—logarithms transform products into sums, powers into products.
          </Prose>

          <MathBlock>
            d/dx[ln f] = f'/f = ln(x) + 1 → f'(x) = xˣ(ln x + 1)
          </MathBlock>

          <InsightBox>
            At x = 1, the derivative equals 1. The curve xˣ has slope 1 at the point (1, 1). 
            Drag the slider to x = 1 and verify this yourself.
          </InsightBox>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 4: Higher-Order Derivatives */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="mb-24">
          <SectionTitle>Higher-Order Derivatives</SectionTitle>
          
          <Prose>
            What happens if you differentiate a derivative? You get the <Highlight color="violet">second derivative</Highlight>—a 
            measure of how the slope itself is changing.
          </Prose>

          <Prose>
            Here's a polynomial: <span className="font-mono text-slate-400">f(x) = x⁴ - 3x² + 2</span>. 
            <Highlight color="amber">Choose a derivative order</Highlight> and watch the graph transform.
          </Prose>

          <div className="bg-slate-800/30 rounded-xl p-6 mb-8">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={polynomialData.points} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                  <XAxis 
                    dataKey="x" 
                    stroke={colors.muted}
                  />
                  <YAxis 
                    stroke={colors.muted}
                    domain={[-10, 30]}
                  />
                  
                  {/* Original function (faded) */}
                  {derivOrder > 0 && (
                    <Line
                      type="monotone"
                      dataKey="d0"
                      stroke={colors.curve}
                      strokeWidth={1}
                      strokeOpacity={0.3}
                      dot={false}
                    />
                  )}
                  
                  {/* Current derivative */}
                  <Line
                    type="monotone"
                    dataKey={`d${derivOrder}`}
                    stroke={derivOrder === 0 ? colors.curve : colors.violet}
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 flex justify-center gap-2">
              {[0, 1, 2, 3, 4].map((order) => (
                <button
                  key={order}
                  onClick={() => setDerivOrder(order)}
                  className={`px-4 py-2 rounded-lg font-mono transition-colors ${
                    derivOrder === order
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {order === 0 ? 'f(x)' : `f${"'".repeat(order)}(x)`}
                </button>
              ))}
            </div>

            <div className="mt-6 text-center font-mono">
              {derivOrder === 0 && <span className="text-slate-300">f(x) = x⁴ - 3x² + 2</span>}
              {derivOrder === 1 && <span className="text-violet-400">f'(x) = 4x³ - 6x</span>}
              {derivOrder === 2 && <span className="text-violet-400">f''(x) = 12x² - 6</span>}
              {derivOrder === 3 && <span className="text-violet-400">f'''(x) = 24x</span>}
              {derivOrder === 4 && <span className="text-violet-400">f''''(x) = 24</span>}
            </div>
          </div>

          <Prose>
            Each differentiation reduces the degree by one. A degree-4 polynomial has exactly 
            four derivatives before reaching a constant, and the fifth derivative is zero.
          </Prose>

          <InsightBox>
            The <Highlight color="violet">second derivative</Highlight> tells you about curvature. 
            Where f''(x) {'>'} 0, the curve bends upward (concave up). 
            Where f''(x) {'<'} 0, it bends downward. 
            Click on f''(x) above—see how its sign matches the bending of the original curve.
          </InsightBox>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* CLOSING */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="mb-16 text-center">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-slate-200 mb-4">
              The Deeper Pattern
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Every technique in this essay—implicit differentiation, logarithmic differentiation, 
              higher-order derivatives—rests on a single principle: 
              <span className="text-amber-400"> linear approximation</span>. 
              The derivative captures how a function behaves locally, and all our techniques 
              are just clever ways to extract that local behavior from different presentations of functions.
            </p>
            <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto">
              The ellipse, the cubic, the exponential tower xˣ—they all yield to the same idea.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-slate-600 py-8 border-t border-slate-800">
          <p>
            Transformed from traditional lecture notes into an explorable explanation.
          </p>
          <p className="text-slate-700 mt-2">
            In the tradition of Bret Victor and Bartosz Ciechanowski.
          </p>
        </footer>

      </div>
    </div>
  );
};

export default ImplicitDifferentiationEssay;
