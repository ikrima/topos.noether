import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const QuoteComparisonFramework = () => {
  const [selectedQuotes, setSelectedQuotes] = useState(['travelers', 'statefarm', 'hartford']);
  const [timeRange, setTimeRange] = useState(5);
  const [inflationRate, setInflationRate] = useState(3.5);
  const [claimsHistory, setClaimsHistory] = useState('clean');
  const [businessGrowth, setBusinessGrowth] = useState(15);
  const [hoveredQuote, setHoveredQuote] = useState(null);
  const [showProjections, setShowProjections] = useState(false);

  // Sample quote data structure based on research
  const quotes = {
    travelers: {
      name: 'Travelers',
      primaryContact: 'Jane Miller - (979) 555-0123',
      baseAnnualPremium: 1740,
      rating: 'A++',
      strengths: ['Construction Expertise', 'Local Presence', 'Competitive Rates'],
      weaknesses: ['Limited Digital Tools', 'Complex Claims Process'],
      coverages: {
        generalLiability: { limit: 2000000, premium: 980, deductible: 1000 },
        commercialAuto: { limit: 1000000, premium: 560, deductible: 1000 },
        workersComp: { premium: 1200, experience: 'Good' },
        pollutionLiability: { limit: 5000000, premium: 480, available: true },
        professionalLiability: { limit: 1000000, premium: 320, available: true }
      },
      discounts: ['Safety Program: 10%', 'Multi-Policy: 15%', 'Claims-Free: 5%'],
      color: '#dc143c'
    },
    statefarm: {
      name: 'State Farm',
      primaryContact: 'Mike Rodriguez - (979) 555-0145',
      baseAnnualPremium: 1824,
      rating: 'A++',
      strengths: ['Brand Recognition', 'Agent Network', 'Customer Service'],
      weaknesses: ['Higher Premiums', 'Limited Construction Focus'],
      coverages: {
        generalLiability: { limit: 2000000, premium: 1120, deductible: 1000 },
        commercialAuto: { limit: 1000000, premium: 704, deductible: 500 },
        workersComp: { premium: 1380, experience: 'Average' },
        pollutionLiability: { limit: 5000000, premium: 520, available: true },
        professionalLiability: { limit: 1000000, premium: 280, available: false }
      },
      discounts: ['Good Driver: 8%', 'Multi-Policy: 12%', 'Long-term: 3%'],
      color: '#dc143c'
    },
    hartford: {
      name: 'The Hartford',
      primaryContact: 'Sarah Johnson - (979) 555-0167',
      baseAnnualPremium: 1668,
      rating: 'A+',
      strengths: ['Small Business Focus', 'Digital Platform', 'Responsive Claims'],
      weaknesses: ['Limited Local Presence', 'Newer to Construction'],
      coverages: {
        generalLiability: { limit: 2000000, premium: 940, deductible: 1000 },
        commercialAuto: { limit: 1000000, premium: 528, deductible: 1000 },
        workersComp: { premium: 1140, experience: 'Excellent' },
        pollutionLiability: { limit: 5000000, premium: 460, available: true },
        professionalLiability: { limit: 1000000, premium: 300, available: true }
      },
      discounts: ['Digital Policy: 5%', 'Claims-Free: 8%', 'Bundle: 18%'],
      color: '#228b22'
    },
    liberty: {
      name: 'Liberty Mutual',
      primaryContact: 'David Chen - (979) 555-0189',
      baseAnnualPremium: 2016,
      rating: 'A',
      strengths: ['Commercial Focus', 'Risk Management', 'National Reach'],
      weaknesses: ['Higher Costs', 'Complex Underwriting'],
      coverages: {
        generalLiability: { limit: 2000000, premium: 1240, deductible: 1000 },
        commercialAuto: { limit: 1000000, premium: 776, deductible: 1000 },
        workersComp: { premium: 1480, experience: 'Good' },
        pollutionLiability: { limit: 5000000, premium: 580, available: true },
        professionalLiability: { limit: 1000000, premium: 360, available: true }
      },
      discounts: ['Safety Training: 12%', 'Loss Control: 8%', 'Multi-Year: 4%'],
      color: '#1e90ff'
    },
    cna: {
      name: 'CNA',
      primaryContact: 'Lisa Thompson - (979) 555-0201',
      baseAnnualPremium: 2100,
      rating: 'A',
      strengths: ['Construction Specialists', 'Risk Engineering', 'Claims Expertise'],
      weaknesses: ['Premium Pricing', 'Strict Underwriting'],
      coverages: {
        generalLiability: { limit: 2000000, premium: 1320, deductible: 1000 },
        commercialAuto: { limit: 1000000, premium: 780, deductible: 1000 },
        workersComp: { premium: 1500, experience: 'Excellent' },
        pollutionLiability: { limit: 5000000, premium: 600, available: true },
        professionalLiability: { limit: 1000000, premium: 400, available: true }
      },
      discounts: ['Construction Safety: 15%', 'Experience Mod: 10%', 'Bundle: 12%'],
      color: '#4169e1'
    }
  };

  const calculateProjectedCost = (quote, year) => {
    const baseCost = quote.baseAnnualPremium;
    const inflationFactor = Math.pow(1 + inflationRate / 100, year);
    const growthFactor = Math.pow(1 + businessGrowth / 100, year);
    const claimsFactor = claimsHistory === 'clean' ? 0.95 : claimsHistory === 'average' ? 1.0 : 1.15;
    
    return Math.round(baseCost * inflationFactor * growthFactor * claimsFactor);
  };

  const projectionData = Array.from({ length: timeRange + 1 }, (_, year) => {
    const dataPoint = { year: year === 0 ? 'Today' : `Year ${year}` };
    selectedQuotes.forEach(quoteId => {
      if (quotes[quoteId]) {
        dataPoint[quotes[quoteId].name] = calculateProjectedCost(quotes[quoteId], year);
      }
    });
    return dataPoint;
  });

  const radarData = [
    { subject: 'Cost', travelers: 85, statefarm: 75, hartford: 90, liberty: 65, cna: 60 },
    { subject: 'Service', travelers: 80, statefarm: 90, hartford: 85, liberty: 75, cna: 85 },
    { subject: 'Claims', travelers: 85, statefarm: 80, hartford: 90, liberty: 75, cna: 95 },
    { subject: 'Expertise', travelers: 95, statefarm: 70, hartford: 75, liberty: 85, cna: 100 },
    { subject: 'Digital', travelers: 65, statefarm: 70, hartford: 95, liberty: 80, cna: 75 },
    { subject: 'Local', travelers: 90, statefarm: 95, hartford: 60, liberty: 75, cna: 70 }
  ];

  const riskFactorAnalysis = {
    low: { multiplier: 0.85, description: 'Excellent safety record, experienced crew' },
    medium: { multiplier: 1.0, description: 'Standard industry risk profile' },
    high: { multiplier: 1.25, description: 'Higher risk operations, new business' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6 font-system">
      
      {/* Header with Live Controls */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-4xl font-light text-gray-900 mb-2">Quote Comparison Matrix</h1>
              <p className="text-lg text-gray-600">Dynamic analysis of insurance proposals for Brazos Built Right</p>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowProjections(!showProjections)}
                className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                  showProjections 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showProjections ? 'Hide' : 'Show'} Projections
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Live Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Quote Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Compare Quotes</h3>
            <div className="space-y-3">
              {Object.entries(quotes).map(([id, quote]) => (
                <label key={id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedQuotes.includes(id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedQuotes([...selectedQuotes, id]);
                      } else {
                        setSelectedQuotes(selectedQuotes.filter(q => q !== id));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-900">{quote.name}</span>
                  <span className="text-sm text-gray-600">({quote.rating})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Projection Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Scenario Modeling</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Horizon: {timeRange} years
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={timeRange}
                  onChange={(e) => setTimeRange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Inflation: {inflationRate}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Growth: {businessGrowth}%/year
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={businessGrowth}
                  onChange={(e) => setBusinessGrowth(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Claims History</label>
                <select 
                  value={claimsHistory} 
                  onChange={(e) => setClaimsHistory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="clean">Clean Record</option>
                  <option value="average">Average Claims</option>
                  <option value="poor">Poor History</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">Key Insights</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm font-medium text-green-800">Lowest Cost</div>
                <div className="text-green-600">The Hartford - $1,668/year</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-800">Best for Construction</div>
                <div className="text-blue-600">CNA - Specialist expertise</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-sm font-medium text-purple-800">Best Overall Value</div>
                <div className="text-purple-600">Travelers - Balance of all factors</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Visualization Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Cost Projection Chart */}
          {showProjections && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-medium text-gray-900 mb-6">Premium Projections</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`} />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Annual Premium']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  {selectedQuotes.map(quoteId => {
                    if (quotes[quoteId]) {
                      return (
                        <Line 
                          key={quoteId}
                          type="monotone" 
                          dataKey={quotes[quoteId].name} 
                          stroke={quotes[quoteId].color}
                          strokeWidth={3}
                          dot={{ fill: quotes[quoteId].color, strokeWidth: 2, r: 4 }}
                        />
                      );
                    }
                    return null;
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Radar Chart for Multi-Factor Comparison */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-6">Multi-Factor Analysis</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                {selectedQuotes.map(quoteId => {
                  if (quotes[quoteId]) {
                    return (
                      <Radar
                        key={quoteId}
                        name={quotes[quoteId].name}
                        dataKey={quoteId}
                        stroke={quotes[quoteId].color}
                        fill={quotes[quoteId].color}
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    );
                  }
                  return null;
                })}
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Quote Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedQuotes.map(quoteId => {
              const quote = quotes[quoteId];
              if (!quote) return null;
              
              return (
                <div 
                  key={quoteId}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-200 ${
                    hoveredQuote === quoteId ? 'shadow-lg scale-105' : ''
                  }`}
                  onMouseEnter={() => setHoveredQuote(quoteId)}
                  onMouseLeave={() => setHoveredQuote(null)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{quote.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{quote.primaryContact}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <span className="text-sm font-medium text-green-600">{quote.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${quote.baseAnnualPremium.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">annual premium</div>
                    </div>
                  </div>

                  {/* Coverage Breakdown */}
                  <div className="space-y-2 mb-4">
                    <h5 className="font-medium text-gray-900">Coverage Breakdown:</h5>
                    {Object.entries(quote.coverages).map(([type, coverage]) => (
                      <div key={type} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="text-gray-900">${coverage.premium?.toLocaleString() || 'N/A'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h6 className="text-sm font-medium text-green-700 mb-2">Strengths</h6>
                      <ul className="space-y-1">
                        {quote.strengths.map((strength, i) => (
                          <li key={i} className="text-xs text-gray-600">• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h6 className="text-sm font-medium text-red-700 mb-2">Considerations</h6>
                      <ul className="space-y-1">
                        {quote.weaknesses.map((weakness, i) => (
                          <li key={i} className="text-xs text-gray-600">• {weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Available Discounts */}
                  <div className="pt-4 border-t border-gray-100">
                    <h6 className="text-sm font-medium text-gray-900 mb-2">Available Discounts</h6>
                    <div className="flex flex-wrap gap-1">
                      {quote.discounts.map((discount, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                          {discount}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Panel */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to Move Forward?</h3>
              <p className="text-blue-100">
                You've compared {selectedQuotes.length} quotes over a {timeRange}-year horizon
              </p>
            </div>
            <div className="flex space-x-4">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium">
                Download Analysis
              </button>
              <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors duration-200 font-medium">
                Schedule Meetings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteComparisonFramework;