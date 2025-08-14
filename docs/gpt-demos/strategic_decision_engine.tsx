import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const StrategicDecisionEngine = () => {
  const [currentPhase, setCurrentPhase] = useState('startup');
  const [riskTolerance, setRiskTolerance] = useState(5);
  const [cashFlow, setCashFlow] = useState(3);
  const [growthPlan, setGrowthPlan] = useState('aggressive');
  const [complianceLevel, setComplianceLevel] = useState('standard');
  const [selectedFactors, setSelectedFactors] = useState(['cost', 'coverage', 'service']);
  const [decisionWeight, setDecisionWeight] = useState({
    cost: 30,
    coverage: 25,
    service: 20,
    expertise: 15,
    growth: 10
  });

  const businessPhases = {
    startup: {
      title: 'Startup Phase',
      description: 'First 2 years - Building foundation',
      priorities: ['Cost Efficiency', 'Basic Protection', 'Cash Flow Management'],
      recommendedCoverage: {
        generalLiability: '$1M/$2M',
        commercialAuto: '$1M',
        workersComp: 'Required if employees',
        pollutionLiability: '$5M (College Station req.)',
        professionalLiability: 'Optional'
      },
      typicalPremium: '$1,500-2,500',
      color: '#10b981'
    },
    scaling: {
      title: 'Scaling Phase',
      description: 'Years 3-7 - Expanding operations',
      priorities: ['Enhanced Coverage', 'Risk Management', 'Operational Efficiency'],
      recommendedCoverage: {
        generalLiability: '$2M/$4M',
        commercialAuto: '$2M',
        workersComp: 'Essential',
        pollutionLiability: '$10M',
        professionalLiability: '$1M'
      },
      typicalPremium: '$3,000-5,000',
      color: '#f59e0b'
    },
    established: {
      title: 'Established Phase',
      description: 'Years 8-15 - Market leadership',
      priorities: ['Comprehensive Protection', 'Industry Leadership', 'Strategic Growth'],
      recommendedCoverage: {
        generalLiability: '$5M/$10M',
        commercialAuto: '$3M',
        workersComp: 'Comprehensive',
        pollutionLiability: '$15M',
        professionalLiability: '$2M'
      },
      typicalPremium: '$6,000-12,000',
      color: '#3b82f6'
    },
    mature: {
      title: 'Mature Enterprise',
      description: 'Years 15+ - Market dominance',
      priorities: ['Enterprise Risk Management', 'Acquisition Protection', 'Legacy Planning'],
      recommendedCoverage: {
        generalLiability: '$10M+',
        commercialAuto: '$5M+',
        workersComp: 'Self-insurance options',
        pollutionLiability: '$25M+',
        professionalLiability: '$5M+'
      },
      typicalPremium: '$15,000-30,000+',
      color: '#8b5cf6'
    }
  };

  const decisionFactors = {
    cost: {
      name: 'Cost Efficiency',
      description: 'Premium affordability and ROI',
      icon: '💰',
      considerations: ['Annual premium', 'Deductibles', 'Payment terms', 'Discount opportunities']
    },
    coverage: {
      name: 'Coverage Breadth',
      description: 'Protection comprehensiveness',
      icon: '🛡️',
      considerations: ['Policy limits', 'Exclusions', 'Additional coverages', 'Future expandability']
    },
    service: {
      name: 'Service Quality',
      description: 'Customer support and responsiveness',
      icon: '🤝',
      considerations: ['Claim handling', 'Agent accessibility', 'Online tools', 'Response times']
    },
    expertise: {
      name: 'Industry Expertise',
      description: 'Construction-specific knowledge',
      icon: '🏗️',
      considerations: ['Construction experience', 'Trade understanding', 'Risk engineering', 'Loss control']
    },
    growth: {
      name: 'Growth Adaptability',
      description: 'Ability to scale with business',
      icon: '📈',
      considerations: ['Multi-state expansion', 'Service line additions', 'Coverage flexibility', 'Partnership potential']
    }
  };

  const riskScenarios = [
    {
      scenario: 'Property Damage Claim',
      probability: 'Medium',
      impact: '$25,000 - $100,000',
      mitigation: 'General Liability Insurance'
    },
    {
      scenario: 'Worker Injury',
      probability: 'High',
      impact: '$50,000 - $500,000',
      mitigation: 'Workers Compensation'
    },
    {
      scenario: 'Vehicle Accident',
      probability: 'Medium',
      impact: '$20,000 - $200,000',
      mitigation: 'Commercial Auto Insurance'
    },
    {
      scenario: 'Environmental Violation',
      probability: 'Low',
      impact: '$100,000 - $1,000,000',
      mitigation: 'Pollution Liability Insurance'
    },
    {
      scenario: 'Professional Error',
      probability: 'Low',
      impact: '$30,000 - $300,000',
      mitigation: 'Professional Liability Insurance'
    }
  ];

  const calculateDecisionScore = (insurer) => {
    // Mock scoring algorithm based on weighted factors
    const scores = {
      travelers: { cost: 8, coverage: 9, service: 8, expertise: 9, growth: 8 },
      statefarm: { cost: 7, coverage: 8, service: 9, expertise: 7, growth: 8 },
      hartford: { cost: 9, coverage: 8, service: 8, expertise: 7, growth: 7 },
      liberty: { cost: 6, coverage: 9, service: 7, expertise: 8, growth: 9 },
      cna: { cost: 5, coverage: 10, service: 8, expertise: 10, growth: 8 }
    };

    if (!scores[insurer]) return 0;

    return Object.keys(decisionWeight).reduce((total, factor) => {
      return total + (scores[insurer][factor] * decisionWeight[factor] / 100);
    }, 0);
  };

  const insurers = ['travelers', 'statefarm', 'hartford', 'liberty', 'cna'];
  const rankedInsurers = insurers
    .map(insurer => ({
      name: insurer,
      score: calculateDecisionScore(insurer),
      displayName: insurer.charAt(0).toUpperCase() + insurer.slice(1)
    }))
    .sort((a, b) => b.score - a.score);

  const phaseData = Object.keys(businessPhases).map(phase => ({
    phase: businessPhases[phase].title.split(' ')[0],
    premium: parseInt(businessPhases[phase].typicalPremium.match(/\d+/)[0]) * 1000,
    coverage: phase === 'startup' ? 2 : phase === 'scaling' ? 4 : phase === 'established' ? 8 : 12
  }));

  const currentPhaseData = businessPhases[currentPhase];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-6 font-system">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-4xl font-light text-gray-900 mb-2">Strategic Decision Engine</h1>
          <p className="text-lg text-gray-600 mb-6">
            Interactive framework for making informed insurance decisions at every stage of growth
          </p>
          
          {/* Phase Selector */}
          <div className="flex space-x-2">
            {Object.entries(businessPhases).map(([key, phase]) => (
              <button
                key={key}
                onClick={() => setCurrentPhase(key)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPhase === key 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {phase.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Decision Controls */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Current Phase Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: currentPhaseData.color }}
              ></div>
              <h3 className="text-xl font-medium text-gray-900">{currentPhaseData.title}</h3>
            </div>
            <p className="text-gray-600 mb-4">{currentPhaseData.description}</p>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Key Priorities:</h4>
                <ul className="space-y-1">
                  {currentPhaseData.priorities.map((priority, i) => (
                    <li key={i} className="text-sm text-gray-600">• {priority}</li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-3 border-t border-gray-100">
                <div className="text-sm text-gray-600">Typical Annual Premium</div>
                <div className="text-lg font-bold text-gray-900">{currentPhaseData.typicalPremium}</div>
              </div>
            </div>
          </div>

          {/* Decision Weights */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Decision Priorities</h3>
            <p className="text-sm text-gray-600 mb-4">Adjust the importance of each factor for your situation:</p>
            
            <div className="space-y-4">
              {Object.entries(decisionFactors).map(([key, factor]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {factor.icon} {factor.name}
                    </span>
                    <span className="text-sm text-gray-600">{decisionWeight[key]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={decisionWeight[key]}
                    onChange={(e) => setDecisionWeight({
                      ...decisionWeight,
                      [key]: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">{factor.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Total: {Object.values(decisionWeight).reduce((a, b) => a + b, 0)}%
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Risk Profile</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Tolerance: {riskTolerance}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Conservative</span>
                  <span>Aggressive</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cash Flow Priority: {cashFlow}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={cashFlow}
                  onChange={(e) => setCashFlow(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Coverage First</span>
                  <span>Cost First</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Growth Plan</label>
                <select 
                  value={growthPlan} 
                  onChange={(e) => setGrowthPlan(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="conservative">Conservative Growth</option>
                  <option value="steady">Steady Expansion</option>
                  <option value="aggressive">Aggressive Scaling</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Analysis Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Growth Trajectory Visualization */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-6">Insurance Evolution Path</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={phaseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="phase" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'premium' ? `$${value.toLocaleString()}` : `${value}M`,
                    name === 'premium' ? 'Annual Premium' : 'Coverage Limit'
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="premium" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Insurer Ranking */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-6">Optimized Insurer Ranking</h3>
            <p className="text-gray-600 mb-4">Based on your current priorities and phase:</p>
            
            <div className="space-y-3">
              {rankedInsurers.map((insurer, index) => (
                <div key={insurer.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{insurer.displayName}</div>
                      <div className="text-sm text-gray-600">Weighted score: {insurer.score.toFixed(1)}/10</div>
                    </div>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{width: `${(insurer.score / 10) * 100}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Scenario Analysis */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-6">Risk Scenario Planning</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riskScenarios.map((scenario, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{scenario.scenario}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      scenario.probability === 'High' ? 'bg-red-100 text-red-700' :
                      scenario.probability === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {scenario.probability}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Potential Impact: {scenario.impact}
                  </div>
                  <div className="text-sm text-purple-600 font-medium">
                    {scenario.mitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Coverage for Current Phase */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-6">
              Recommended Coverage - {currentPhaseData.title}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(currentPhaseData.recommendedCoverage).map(([type, coverage]) => (
                <div key={type} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 capitalize mb-1">
                    {type.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-lg font-bold text-purple-600">{coverage}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Panel */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div>
              <h3 className="text-2xl font-bold mb-2">Decision Summary</h3>
              <p className="text-purple-100">
                Top recommendation for {currentPhaseData.title}: <strong>{rankedInsurers[0]?.displayName}</strong>
              </p>
              <p className="text-purple-100 text-sm mt-1">
                Score: {rankedInsurers[0]?.score.toFixed(1)}/10 based on your priorities
              </p>
            </div>
            <div className="flex space-x-4">
              <button className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium">
                Export Decision Matrix
              </button>
              <button className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors duration-200 font-medium">
                Proceed to Quotes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategicDecisionEngine;