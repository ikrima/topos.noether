import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const RiskDecisionMatrix = () => {
  const [selectedScenario, setSelectedScenario] = useState('startup');
  const [hoveredRisk, setHoveredRisk] = useState(null);
  const [selectedRisks, setSelectedRisks] = useState(new Set());

  const scenarios = {
    startup: {
      name: 'Startup Phase',
      subtitle: 'Year 1',
      description: 'Minimal revenue, basic operations, residential focus',
      revenue: 500000,
      characteristics: ['Small crew', 'Local projects', 'Basic equipment', 'Residential only'],
      gradient: 'from-emerald-400 to-cyan-500',
      bgGradient: 'from-emerald-50 to-cyan-50'
    },
    growth: {
      name: 'Growth Phase',
      subtitle: 'Years 2-3',
      description: 'Expanding operations, mixed residential/commercial',
      revenue: 1500000,
      characteristics: ['Growing crew', 'Regional projects', 'Equipment investment', 'Some commercial work'],
      gradient: 'from-blue-400 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50'
    },
    established: {
      name: 'Established',
      subtitle: 'Year 4+',
      description: 'Mature operations, significant commercial work',
      revenue: 3000000,
      characteristics: ['Large crew', 'Major projects', 'Significant equipment', 'Primarily commercial'],
      gradient: 'from-purple-400 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    }
  };

  const risks = [
    {
      id: 'bodily_injury',
      name: 'Bodily Injury',
      description: 'Worker or third-party injuries on job sites',
      icon: '🚑',
      frequency: { startup: 'Medium', growth: 'High', established: 'High' },
      severity: { startup: 'High', growth: 'Very High', established: 'Very High' },
      cost: { startup: 50000, growth: 150000, established: 500000 },
      coverage: 'General Liability + Workers Comp',
      probability: { startup: 0.15, growth: 0.25, established: 0.35 }
    },
    {
      id: 'property_damage',
      name: 'Property Damage',
      description: 'Damage to client property or adjacent structures',
      icon: '🏠',
      frequency: { startup: 'Low', growth: 'Medium', established: 'Medium' },
      severity: { startup: 'Medium', growth: 'High', established: 'Very High' },
      cost: { startup: 25000, growth: 75000, established: 200000 },
      coverage: 'General Liability',
      probability: { startup: 0.08, growth: 0.12, established: 0.18 }
    },
    {
      id: 'faulty_workmanship',
      name: 'Faulty Workmanship',
      description: 'Defective work requiring correction or causing damage',
      icon: '🔧',
      frequency: { startup: 'Medium', growth: 'Medium', established: 'Low' },
      severity: { startup: 'Medium', growth: 'High', established: 'High' },
      cost: { startup: 15000, growth: 45000, established: 100000 },
      coverage: 'Professional Liability',
      probability: { startup: 0.12, growth: 0.15, established: 0.08 }
    },
    {
      id: 'environmental',
      name: 'Environmental Damage',
      description: 'Pollution incidents, soil contamination, stormwater violations',
      icon: '🌍',
      frequency: { startup: 'Very Low', growth: 'Low', established: 'Medium' },
      severity: { startup: 'Very High', growth: 'Very High', established: 'Very High' },
      cost: { startup: 100000, growth: 250000, established: 1000000 },
      coverage: 'Pollution Liability',
      probability: { startup: 0.02, growth: 0.05, established: 0.12 }
    },
    {
      id: 'cyber',
      name: 'Cyber Attack',
      description: 'Ransomware, data breach, wire transfer fraud',
      icon: '💻',
      frequency: { startup: 'Low', growth: 'Medium', established: 'High' },
      severity: { startup: 'Medium', growth: 'High', established: 'Very High' },
      cost: { startup: 20000, growth: 75000, established: 300000 },
      coverage: 'Cyber Insurance',
      probability: { startup: 0.05, growth: 0.15, established: 0.30 }
    },
    {
      id: 'vehicle_accident',
      name: 'Vehicle Accident',
      description: 'Auto accidents involving company vehicles or equipment',
      icon: '🚛',
      frequency: { startup: 'Medium', growth: 'High', established: 'High' },
      severity: { startup: 'High', growth: 'High', established: 'Very High' },
      cost: { startup: 40000, growth: 85000, established: 250000 },
      coverage: 'Commercial Auto',
      probability: { startup: 0.10, growth: 0.20, established: 0.25 }
    },
    {
      id: 'weather_damage',
      name: 'Weather Damage',
      description: 'Storm damage to equipment, materials, or work in progress',
      icon: '⛈️',
      frequency: { startup: 'Medium', growth: 'Medium', established: 'Medium' },
      severity: { startup: 'Low', growth: 'Medium', established: 'High' },
      cost: { startup: 8000, growth: 25000, established: 75000 },
      coverage: 'Property + Builders Risk',
      probability: { startup: 0.20, growth: 0.20, established: 0.20 }
    },
    {
      id: 'subcontractor_default',
      name: 'Subcontractor Default',
      description: 'Subcontractor fails to complete work or lacks insurance',
      icon: '🤝',
      frequency: { startup: 'Low', growth: 'Medium', established: 'High' },
      severity: { startup: 'Medium', growth: 'High', established: 'High' },
      cost: { startup: 12000, growth: 35000, established: 100000 },
      coverage: 'Subcontractor Default Insurance',
      probability: { startup: 0.06, growth: 0.12, established: 0.18 }
    }
  ];

  const getSeverityColor = (severity) => {
    const colors = {
      'Very Low': 'bg-emerald-100 border-emerald-300 text-emerald-800',
      'Low': 'bg-lime-100 border-lime-300 text-lime-800',
      'Medium': 'bg-amber-100 border-amber-300 text-amber-800',
      'High': 'bg-orange-100 border-orange-300 text-orange-800',
      'Very High': 'bg-red-100 border-red-300 text-red-800'
    };
    return colors[severity] || 'bg-slate-100 border-slate-300 text-slate-800';
  };

  const calculateExpectedLoss = (risk, scenario) => {
    return risk.cost[scenario] * risk.probability[scenario];
  };

  const toggleRiskSelection = (riskId) => {
    const newSelected = new Set(selectedRisks);
    if (newSelected.has(riskId)) {
      newSelected.delete(riskId);
    } else {
      newSelected.add(riskId);
    }
    setSelectedRisks(newSelected);
  };

  const calculateTotalRisk = () => {
    return risks.reduce((total, risk) => {
      return total + calculateExpectedLoss(risk, selectedScenario);
    }, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="max-w-8xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-thin tracking-tight text-slate-900 mb-4">
            Risk Decision
            <span className="font-light text-indigo-600 block">Matrix</span>
          </h1>
          <p className="text-xl text-slate-600 font-light max-w-3xl mx-auto leading-relaxed">
            Navigate business scenarios and understand risk exposure with intelligent prioritization
          </p>
        </div>

        {/* Scenario Selector */}
        <div className="mb-12">
          <h2 className="text-3xl font-light text-slate-800 mb-8 text-center">Select Your Business Phase</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.entries(scenarios).map(([key, scenario]) => (
              <div 
                key={key}
                className={`group cursor-pointer transition-all duration-500 ${
                  selectedScenario === key ? 'scale-105' : 'hover:scale-102'
                }`}
                onClick={() => setSelectedScenario(key)}
              >
                <div className={`backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl overflow-hidden ${
                  selectedScenario === key ? 'ring-4 ring-indigo-500/50' : ''
                }`}>
                  <div className={`bg-gradient-to-r ${scenario.gradient} px-8 py-8`}>
                    <div className="text-center">
                      <h3 className="text-2xl font-medium text-white mb-1">{scenario.name}</h3>
                      <p className="text-white/80 font-light text-lg">{scenario.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <p className="text-slate-600 font-light mb-6 leading-relaxed">{scenario.description}</p>
                    <div className="text-center mb-6">
                      <div className="text-3xl font-light text-slate-800 mb-1">
                        {formatCurrency(scenario.revenue)}
                      </div>
                      <div className="text-slate-500 font-light">Target Revenue</div>
                    </div>
                    <div className="space-y-3">
                      {scenario.characteristics.map((char, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                          <span className="text-slate-600 font-light">{char}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Risk Matrix */}
          <div className="xl:col-span-3">
            <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-indigo-500/10 overflow-hidden">
              <div className={`bg-gradient-to-r ${scenarios[selectedScenario].gradient} px-8 py-6`}>
                <h3 className="text-2xl font-medium text-white">Risk Exposure Analysis</h3>
                <p className="text-white/80 font-light mt-1">
                  {scenarios[selectedScenario].name} - Click risks to compare and explore
                </p>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  {risks.map((risk) => {
                    const expectedLoss = calculateExpectedLoss(risk, selectedScenario);
                    const isSelected = selectedRisks.has(risk.id);
                    const isHovered = hoveredRisk === risk.id;
                    
                    return (
                      <div 
                        key={risk.id}
                        className={`group transition-all duration-300 ${
                          isSelected ? 'scale-[1.02]' : isHovered ? 'scale-[1.01]' : ''
                        }`}
                        onMouseEnter={() => setHoveredRisk(risk.id)}
                        onMouseLeave={() => setHoveredRisk(null)}
                        onClick={() => toggleRiskSelection(risk.id)}
                      >
                        <div className={`cursor-pointer rounded-3xl border-2 transition-all duration-300 backdrop-blur-sm ${
                          isSelected 
                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-xl shadow-indigo-500/20' 
                            : isHovered 
                              ? 'bg-gradient-to-r from-slate-50 to-white border-slate-300 shadow-lg' 
                              : 'bg-white/60 border-slate-200/50 shadow-md hover:shadow-lg'
                        }`}>
                          <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-start space-x-4 flex-1">
                                <div className="text-4xl">{risk.icon}</div>
                                <div className="flex-1">
                                  <h4 className="text-2xl font-medium text-slate-800 mb-2">{risk.name}</h4>
                                  <p className="text-slate-600 font-light leading-relaxed">{risk.description}</p>
                                </div>
                              </div>
                              <div className="text-right ml-6">
                                <div className="text-3xl font-light text-red-600 mb-1">
                                  {formatCurrency(expectedLoss)}
                                </div>
                                <div className="text-sm text-slate-500 font-light">Expected Annual Loss</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="text-center">
                                <div className="text-xs text-slate-500 font-medium mb-2">FREQUENCY</div>
                                <span className={`inline-block px-3 py-2 rounded-xl text-sm font-medium ${getSeverityColor(risk.frequency[selectedScenario])}`}>
                                  {risk.frequency[selectedScenario]}
                                </span>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-slate-500 font-medium mb-2">SEVERITY</div>
                                <span className={`inline-block px-3 py-2 rounded-xl text-sm font-medium ${getSeverityColor(risk.severity[selectedScenario])}`}>
                                  {risk.severity[selectedScenario]}
                                </span>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-slate-500 font-medium mb-2">MAX COST</div>
                                <span className="text-lg font-medium text-slate-800">{formatCurrency(risk.cost[selectedScenario])}</span>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-slate-500 font-medium mb-2">COVERAGE</div>
                                <span className="text-sm font-medium text-indigo-600">{risk.coverage}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Panels */}
          <div className="space-y-6">
            {/* Total Risk Exposure */}
            <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-red-500/10 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-6">
                <h4 className="text-xl font-medium text-white text-center">Total Risk Exposure</h4>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-thin text-red-600 mb-3">
                    {formatCurrency(calculateTotalRisk())}
                  </div>
                  <div className="text-sm text-slate-600 font-light mb-4">Expected Annual Loss</div>
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl">
                    <div className="text-xs text-amber-700 font-light leading-relaxed">
                      Statistical expected cost based on industry data and probability modeling
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Prioritization */}
            <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-orange-500/10 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-6">
                <h4 className="text-xl font-medium text-white text-center">Priority Rankings</h4>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {risks
                    .sort((a, b) => calculateExpectedLoss(b, selectedScenario) - calculateExpectedLoss(a, selectedScenario))
                    .slice(0, 5)
                    .map((risk, index) => (
                      <div key={risk.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">{risk.name}</div>
                          <div className="text-xs text-slate-500">{risk.icon}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-red-600">
                            {formatCurrency(calculateExpectedLoss(risk, selectedScenario))}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-emerald-500/10 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-6">
                <h4 className="text-xl font-medium text-white text-center">Strategic Focus</h4>
              </div>
              <div className="p-6 space-y-4">
                {selectedScenario === 'startup' && (
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-2xl">
                    <div className="text-sm font-medium text-emerald-800 mb-2">Foundation Phase</div>
                    <div className="text-xs text-emerald-700 font-light">Secure General Liability and Workers Comp immediately. Focus on safety programs.</div>
                  </div>
                )}
                {selectedScenario === 'growth' && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl">
                    <div className="text-sm font-medium text-blue-800 mb-2">Expansion Phase</div>
                    <div className="text-xs text-blue-700 font-light">Add Professional Liability and Environmental coverage. Increase policy limits.</div>
                  </div>
                )}
                {selectedScenario === 'established' && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-2xl">
                    <div className="text-sm font-medium text-purple-800 mb-2">Mature Operations</div>
                    <div className="text-xs text-purple-700 font-light">Implement comprehensive risk management and consider captive insurance options.</div>
                  </div>
                )}
                
                <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200/50 rounded-2xl">
                  <div className="text-sm font-medium text-slate-800 mb-2">Universal Priority</div>
                  <div className="text-xs text-slate-700 font-light">Maintain strong contractual risk transfer practices and regular policy reviews.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-12 backdrop-blur-xl bg-white/60 rounded-3xl border border-white/50 shadow-lg">
          <div className="p-8">
            <h3 className="text-xl font-medium text-slate-800 mb-6 text-center">How to Navigate This Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-medium">1</span>
                </div>
                <div className="text-sm font-medium text-slate-800 mb-2">Select Phase</div>
                <div className="text-xs text-slate-600 font-light">Choose your current business scenario</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-medium">2</span>
                </div>
                <div className="text-sm font-medium text-slate-800 mb-2">Explore Risks</div>
                <div className="text-xs text-slate-600 font-light">Click and hover to examine each risk type</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-medium">3</span>
                </div>
                <div className="text-sm font-medium text-slate-800 mb-2">Compare Impact</div>
                <div className="text-xs text-slate-600 font-light">Use priority rankings to focus efforts</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-medium">4</span>
                </div>
                <div className="text-sm font-medium text-slate-800 mb-2">Take Action</div>
                <div className="text-xs text-slate-600 font-light">Follow strategic recommendations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDecisionMatrix;