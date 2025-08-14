import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const InsuranceExplorer = () => {
  const [selectedCoverage, setSelectedCoverage] = useState(1000000);
  const [businessSize, setBusinessSize] = useState('small');
  const [riskProfile, setRiskProfile] = useState('medium');
  const [timeHorizon, setTimeHorizon] = useState(5);
  const [hoveredInsurer, setHoveredInsurer] = useState(null);

  // Core insurance data derived from research
  const coverageOptions = [
    { amount: 300000, label: '$300K', required: 'State Minimum', color: '#ff4757' },
    { amount: 1000000, label: '$1M', required: 'Industry Standard', color: '#ffa502' },
    { amount: 2000000, label: '$2M', required: 'Recommended', color: '#2ed573' },
    { amount: 5000000, label: '$5M', required: 'Premium Protection', color: '#1e90ff' }
  ];

  const insurers = [
    {
      name: 'State Farm',
      rating: 'A++',
      avgCost: 152,
      specialties: ['General Contractors', 'Residential'],
      coverage: ['General Liability', 'Commercial Auto', 'Workers Comp'],
      texasPresence: 'Strong',
      constructionFocus: 8,
      customerSat: 8.5,
      color: '#dc143c'
    },
    {
      name: 'Liberty Mutual',
      rating: 'A',
      avgCost: 168,
      specialties: ['Commercial', 'Multi-Trade'],
      coverage: ['General Liability', 'Commercial Auto', 'Professional'],
      texasPresence: 'Strong',
      constructionFocus: 9,
      customerSat: 7.2,
      color: '#1e90ff'
    },
    {
      name: 'Travelers',
      rating: 'A++',
      avgCost: 145,
      specialties: ['Construction', 'Contractors'],
      coverage: ['All Standard', 'Specialty Construction'],
      texasPresence: 'Strong',
      constructionFocus: 9.5,
      customerSat: 8.0,
      color: '#dc143c'
    },
    {
      name: 'The Hartford',
      rating: 'A+',
      avgCost: 139,
      specialties: ['Small Business', 'Contractors'],
      coverage: ['General Liability', 'BOP'],
      texasPresence: 'Moderate',
      constructionFocus: 8.5,
      customerSat: 8.2,
      color: '#228b22'
    },
    {
      name: 'CNA',
      rating: 'A',
      avgCost: 175,
      specialties: ['Commercial Construction'],
      coverage: ['Comprehensive Commercial'],
      texasPresence: 'Strong',
      constructionFocus: 9.8,
      customerSat: 7.8,
      color: '#4169e1'
    }
  ];

  const requirementsByType = {
    'State Minimum': { gl: 300000, auto: 30000, pollution: 0 },
    'TDHCA Bids': { gl: 300000, auto: 30000, pollution: 0 },
    'Industry Standard': { gl: 1000000, auto: 1000000, pollution: 5000000 },
    'College Station': { gl: 1000000, auto: 1000000, pollution: 5000000 }
  };

  const calculateAnnualCost = (insurer, coverage) => {
    const baseCost = insurer.avgCost * 12;
    const coverageMultiplier = coverage / 1000000;
    const riskMultiplier = riskProfile === 'low' ? 0.8 : riskProfile === 'high' ? 1.3 : 1.0;
    const sizeMultiplier = businessSize === 'startup' ? 0.7 : businessSize === 'large' ? 1.4 : 1.0;
    
    return Math.round(baseCost * coverageMultiplier * riskMultiplier * sizeMultiplier);
  };

  const riskFactors = [
    { name: 'Tiling Work', risk: 'Medium', description: 'Slip hazards, adhesive exposure' },
    { name: 'Deck Construction', risk: 'High', description: 'Height work, structural liability' },
    { name: 'Material Transport', risk: 'Medium', description: 'Vehicle liability, cargo damage' },
    { name: 'Client Premises', risk: 'High', description: 'Property damage, access liability' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 font-system">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-4xl font-light text-gray-900 mb-2">Insurance Strategy Explorer</h1>
          <p className="text-lg text-gray-600">Interactive research tools for Brazos Built Right's insurance decisions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Controls */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Coverage Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Coverage Amount</h3>
            <div className="space-y-3">
              {coverageOptions.map(option => (
                <button
                  key={option.amount}
                  onClick={() => setSelectedCoverage(option.amount)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedCoverage === option.amount 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{option.label}</span>
                    <span className="text-sm text-gray-600">{option.required}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Business Profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Business Profile</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Size</label>
                <select 
                  value={businessSize} 
                  onChange={(e) => setBusinessSize(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="startup">Startup (1-2 employees)</option>
                  <option value="small">Small (3-10 employees)</option>
                  <option value="medium">Medium (11-25 employees)</option>
                  <option value="large">Large (25+ employees)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Profile</label>
                <select 
                  value={riskProfile} 
                  onChange={(e) => setRiskProfile(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Planning Horizon: {timeHorizon} years</label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Risk Assessment</h3>
            <div className="space-y-3">
              {riskFactors.map((factor, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    factor.risk === 'High' ? 'bg-red-500' : 
                    factor.risk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-900">{factor.name}</div>
                    <div className="text-sm text-gray-600">{factor.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Visualization Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Insurer Comparison */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-6">Annual Premium Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={insurers.map(insurer => ({
                name: insurer.name,
                cost: calculateAnnualCost(insurer, selectedCoverage),
                focus: insurer.constructionFocus * 100,
                satisfaction: insurer.customerSat * 100
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Insurer Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insurers.map((insurer, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredInsurer(insurer.name)}
                onMouseLeave={() => setHoveredInsurer(null)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{insurer.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <span className="text-sm font-medium text-green-600">{insurer.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${calculateAnnualCost(insurer, selectedCoverage).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">annually</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Construction Focus:</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{width: `${insurer.constructionFocus * 10}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Customer Satisfaction:</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{width: `${insurer.customerSat * 10}%`}}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">Specialties:</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {insurer.specialties.map((specialty, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Requirements Matrix */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-6">Texas Requirements Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Requirement Type</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">General Liability</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Auto Liability</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Pollution Liability</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(requirementsByType).map(([type, reqs]) => (
                    <tr key={type} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{type}</td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        ${reqs.gl.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        ${reqs.auto.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {reqs.pollution ? `$${reqs.pollution.toLocaleString()}` : 'Not Required'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Ready to get quotes?</h4>
              <p className="text-gray-600">Based on your selections: {coverageOptions.find(c => c.amount === selectedCoverage)?.label} coverage for {businessSize} business</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Generate Quote Sheet
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceExplorer;