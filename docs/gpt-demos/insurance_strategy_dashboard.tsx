import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Shield, DollarSign, Users, AlertTriangle, CheckCircle, Zap, Target } from 'lucide-react';

const InsuranceStrategyDashboard = () => {
  const [yearHorizon, setYearHorizon] = useState([5]);
  const [growthRate, setGrowthRate] = useState([25]);
  const [riskTolerance, setRiskTolerance] = useState([2]);
  const [commercialTransition, setCommercialTransition] = useState([3]);
  const [selectedMetric, setSelectedMetric] = useState('cost');

  // Generate projection data based on parameters
  const generateProjections = () => {
    const years = yearHorizon[0];
    const growth = growthRate[0] / 100;
    const risk = riskTolerance[0];
    const commercialStart = commercialTransition[0];
    
    const data = [];
    let baseRevenue = 500000;
    
    for (let year = 1; year <= years; year++) {
      const revenue = baseRevenue * Math.pow(1 + growth, year - 1);
      const isCommercial = year >= commercialStart;
      const commercialMix = isCommercial ? Math.min((year - commercialStart + 1) * 20, 80) : 0;
      
      const riskMultiplier = { 1: 0.8, 2: 1.0, 3: 1.2 }[risk];
      const commercialMultiplier = 1 + (commercialMix / 100) * 0.4;
      
      const insuranceCost = revenue * 0.035 * riskMultiplier * commercialMultiplier;
      const expectedLosses = revenue * 0.008 * riskMultiplier;
      const uninsuredRisk = expectedLosses * 2.5;
      
      const employees = Math.ceil(revenue / 150000);
      const payroll = employees * 65000;
      
      data.push({
        year,
        revenue: Math.round(revenue),
        insuranceCost: Math.round(insuranceCost),
        insurancePercentage: ((insuranceCost / revenue) * 100).toFixed(2),
        employees,
        payroll,
        expectedLosses: Math.round(expectedLosses),
        uninsuredRisk: Math.round(uninsuredRisk),
        commercialMix: Math.round(commercialMix),
        netSavings: Math.round(uninsuredRisk - insuranceCost)
      });
    }
    
    return data;
  };

  const projectionData = generateProjections();

  const coverageBreakdown = [
    { name: 'General Liability', value: 35, color: '#3B82F6' },
    { name: 'Workers Comp', value: 25, color: '#10B981' },
    { name: 'Commercial Auto', value: 15, color: '#8B5CF6' },
    { name: 'Professional Liability', value: 10, color: '#F59E0B' },
    { name: 'Environmental', value: 8, color: '#EF4444' },
    { name: 'Cyber & Others', value: 7, color: '#06B6D4' }
  ];

  const carrierRecommendations = [
    {
      name: 'CNA Insurance',
      strengths: ['Construction expertise', 'Competitive pricing', 'Texas presence'],
      coverage: ['General Liability', 'Professional Liability'],
      rating: 'A',
      marketShare: 35,
      gradient: 'from-blue-500 to-indigo-600',
      icon: '🏢'
    },
    {
      name: 'Texas Mutual',
      strengths: ['Workers comp leader', 'Rate reductions', 'State-specific'],
      coverage: ['Workers Compensation'],
      rating: 'A+',
      marketShare: 41,
      gradient: 'from-emerald-500 to-teal-600',
      icon: '🤠'
    },
    {
      name: 'Liberty Mutual',
      strengths: ['Package policies', 'Large projects', 'Umbrella coverage'],
      coverage: ['Umbrella', 'Commercial Auto'],
      rating: 'A',
      marketShare: 12,
      gradient: 'from-purple-500 to-pink-600',
      icon: '🗽'
    }
  ];

  const riskFactors = [
    { name: 'Construction Injuries', impact: 'High', trend: 'Stable', mitigation: 'Safety programs', icon: '⚠️', color: 'orange' },
    { name: 'Environmental Liability', impact: 'Very High', trend: 'Increasing', mitigation: 'CPL coverage', icon: '🌍', color: 'red' },
    { name: 'Cyber Attacks', impact: 'Medium', trend: 'Rapidly Increasing', mitigation: 'Cyber insurance', icon: '💻', color: 'purple' },
    { name: 'Professional Errors', impact: 'Medium', trend: 'Stable', mitigation: 'E&O coverage', icon: '🎯', color: 'blue' },
    { name: 'Vehicle Accidents', impact: 'High', trend: 'Stable', mitigation: 'Fleet management', icon: '🚛', color: 'amber' }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatLarge = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return formatCurrency(value);
  };

  const getMetricData = () => {
    switch (selectedMetric) {
      case 'cost':
        return projectionData.map(d => ({ ...d, value: d.insuranceCost }));
      case 'percentage':
        return projectionData.map(d => ({ ...d, value: parseFloat(d.insurancePercentage) }));
      case 'employees':
        return projectionData.map(d => ({ ...d, value: d.employees }));
      case 'savings':
        return projectionData.map(d => ({ ...d, value: d.netSavings }));
      default:
        return projectionData;
    }
  };

  const currentYear = projectionData[0] || {};
  const finalYear = projectionData[projectionData.length - 1] || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-8xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-thin tracking-tight text-slate-900 mb-6">
            Strategic
            <span className="font-light text-indigo-600 block">Dashboard</span>
          </h1>
          <p className="text-2xl text-slate-600 font-light max-w-4xl mx-auto leading-relaxed">
            Explore how strategic decisions shape your insurance investment across time and risk scenarios
          </p>
        </div>

        {/* Strategic Control Panel */}
        <div className="mb-16">
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-indigo-500/10 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-10 py-8">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <Shield className="w-8 h-8 text-white" />
                <h2 className="text-3xl font-medium text-white">Strategic Parameters</h2>
              </div>
              <p className="text-center text-indigo-100 font-light text-lg">Shape your future with intelligent scenario modeling</p>
            </div>
            
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                <div className="text-center">
                  <div className="mb-6">
                    <label className="block text-lg font-medium text-slate-800 mb-2">Planning Horizon</label>
                    <div className="text-4xl font-thin text-indigo-600 mb-4">{yearHorizon[0]} years</div>
                  </div>
                  <Slider
                    value={yearHorizon}
                    onValueChange={setYearHorizon}
                    max={10}
                    min={3}
                    step={1}
                    className="w-full h-3"
                  />
                  <div className="flex justify-between text-sm text-slate-500 mt-3 font-light">
                    <span>3 years</span>
                    <span>10 years</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="mb-6">
                    <label className="block text-lg font-medium text-slate-800 mb-2">Growth Trajectory</label>
                    <div className="text-4xl font-thin text-emerald-600 mb-4">{growthRate[0]}%</div>
                  </div>
                  <Slider
                    value={growthRate}
                    onValueChange={setGrowthRate}
                    max={50}
                    min={10}
                    step={5}
                    className="w-full h-3"
                  />
                  <div className="flex justify-between text-sm text-slate-500 mt-3 font-light">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="mb-6">
                    <label className="block text-lg font-medium text-slate-800 mb-2">Risk Profile</label>
                    <div className="text-4xl font-thin text-purple-600 mb-4">
                      {['Conservative', 'Balanced', 'Aggressive'][riskTolerance[0] - 1]}
                    </div>
                  </div>
                  <Slider
                    value={riskTolerance}
                    onValueChange={setRiskTolerance}
                    max={3}
                    min={1}
                    step={1}
                    className="w-full h-3"
                  />
                  <div className="flex justify-between text-sm text-slate-500 mt-3 font-light">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="mb-6">
                    <label className="block text-lg font-medium text-slate-800 mb-2">Commercial Focus</label>
                    <div className="text-4xl font-thin text-orange-600 mb-4">Year {commercialTransition[0]}</div>
                  </div>
                  <Slider
                    value={commercialTransition}
                    onValueChange={setCommercialTransition}
                    max={yearHorizon[0]}
                    min={2}
                    step={1}
                    className="w-full h-3"
                  />
                  <div className="flex justify-between text-sm text-slate-500 mt-3 font-light">
                    <span>Early</span>
                    <span>Later</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="group hover:scale-105 transition-all duration-500">
            <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-50/80 to-green-100/80 rounded-3xl border border-white/50 shadow-2xl shadow-emerald-500/10 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-medium text-emerald-600 mb-2">Final Year Revenue</p>
                    <p className="text-4xl font-thin text-emerald-800">{formatLarge(finalYear.revenue)}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-emerald-600" />
                </div>
                <div className="text-center p-4 bg-white/50 rounded-2xl">
                  <div className="text-lg font-medium text-emerald-700">
                    {((finalYear.revenue / currentYear.revenue - 1) * 100).toFixed(0)}% Total Growth
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group hover:scale-105 transition-all duration-500">
            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-indigo-100/80 rounded-3xl border border-white/50 shadow-2xl shadow-blue-500/10 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-2">Insurance Investment</p>
                    <p className="text-4xl font-thin text-blue-800">{formatLarge(finalYear.insuranceCost)}</p>
                  </div>
                  <Shield className="w-12 h-12 text-blue-600" />
                </div>
                <div className="text-center p-4 bg-white/50 rounded-2xl">
                  <div className="text-lg font-medium text-blue-700">
                    {finalYear.insurancePercentage}% of Revenue
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group hover:scale-105 transition-all duration-500">
            <div className="backdrop-blur-xl bg-gradient-to-br from-purple-50/80 to-pink-100/80 rounded-3xl border border-white/50 shadow-2xl shadow-purple-500/10 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-2">Risk Protection</p>
                    <p className="text-4xl font-thin text-purple-800">{formatLarge(finalYear.uninsuredRisk)}</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-purple-600" />
                </div>
                <div className="text-center p-4 bg-white/50 rounded-2xl">
                  <div className="text-lg font-medium text-purple-700">
                    Potential Exposure
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group hover:scale-105 transition-all duration-500">
            <div className="backdrop-blur-xl bg-gradient-to-br from-orange-50/80 to-amber-100/80 rounded-3xl border border-white/50 shadow-2xl shadow-orange-500/10 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-medium text-orange-600 mb-2">Team Growth</p>
                    <p className="text-4xl font-thin text-orange-800">{finalYear.employees}</p>
                  </div>
                  <Users className="w-12 h-12 text-orange-600" />
                </div>
                <div className="text-center p-4 bg-white/50 rounded-2xl">
                  <div className="text-lg font-medium text-orange-700">
                    Projected Team Size
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16">
          {/* Main Projection Chart */}
          <div className="xl:col-span-2">
            <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-slate-500/10 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-medium text-white">Business Growth Projection</h3>
                    <p className="text-slate-200 font-light mt-1">Interactive scenario modeling</p>
                  </div>
                  <div className="flex space-x-2">
                    {['cost', 'percentage', 'savings'].map((metric) => (
                      <Button
                        key={metric}
                        size="sm"
                        variant={selectedMetric === metric ? 'default' : 'outline'}
                        onClick={() => setSelectedMetric(metric)}
                        className={`rounded-full px-4 ${
                          selectedMetric === metric 
                            ? 'bg-white text-slate-700 hover:bg-gray-100' 
                            : 'border-white/50 text-white hover:bg-white/10'
                        }`}
                      >
                        {metric === 'cost' ? 'Cost' : metric === 'percentage' ? '%' : 'ROI'}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={getMetricData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="year" 
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      tickFormatter={selectedMetric === 'percentage' ? (v) => `${v}%` : formatLarge}
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={selectedMetric === 'percentage' ? 
                        (value) => [`${value}%`, 'Insurance %'] :
                        (value) => [formatCurrency(value), selectedMetric === 'cost' ? 'Insurance Cost' : selectedMetric === 'savings' ? 'Net Savings' : 'Value']
                      }
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#6366f1" 
                      strokeWidth={4}
                      dot={{ r: 8, fill: '#6366f1' }}
                      activeDot={{ r: 10, fill: '#4f46e5' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      strokeDasharray="8 8"
                      dot={{ r: 6, fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Coverage Distribution */}
          <div>
            <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-slate-500/10 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                <h3 className="text-2xl font-medium text-white">Coverage Portfolio</h3>
                <p className="text-indigo-100 font-light mt-1">Investment distribution</p>
              </div>
              
              <div className="p-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={coverageBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      strokeWidth={3}
                      stroke="#ffffff"
                    >
                      {coverageBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="mt-6 space-y-3">
                  {coverageBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full shadow-lg"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm font-medium text-slate-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-light text-slate-600">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carriers and Risk Analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-16">
          {/* Recommended Carriers */}
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-slate-500/10 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6">
              <h3 className="text-2xl font-medium text-white">Strategic Carriers</h3>
              <p className="text-emerald-100 font-light mt-1">Optimized for Texas construction</p>
            </div>
            
            <div className="p-8">
              <div className="space-y-6">
                {carrierRecommendations.map((carrier, index) => (
                  <div key={index} className="group hover:scale-[1.02] transition-all duration-300">
                    <div className="backdrop-blur-sm bg-gradient-to-r from-white/60 to-slate-50/60 border border-slate-200/50 rounded-2xl overflow-hidden">
                      <div className={`bg-gradient-to-r ${carrier.gradient} px-6 py-4`}>
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{carrier.icon}</div>
                          <div className="flex-1">
                            <h4 className="text-xl font-medium text-white">{carrier.name}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-white/90 text-sm">Rating: {carrier.rating}</span>
                              <span className="text-white/90 text-sm">{carrier.marketShare}% market share</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="mb-4">
                          <div className="text-sm text-slate-600 font-medium mb-3">Core Strengths</div>
                          <div className="flex flex-wrap gap-2">
                            {carrier.strengths.map((strength, i) => (
                              <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                {strength}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-slate-600 font-medium mb-3">Coverage Specialties</div>
                          <div className="flex flex-wrap gap-2">
                            {carrier.coverage.map((cov, i) => (
                              <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                                {cov}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Factor Analysis */}
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-slate-500/10 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 px-8 py-6">
              <h3 className="text-2xl font-medium text-white">Risk Intelligence</h3>
              <p className="text-red-100 font-light mt-1">Dynamic threat landscape</p>
            </div>
            
            <div className="p-8">
              <div className="space-y-4">
                {riskFactors.map((risk, index) => (
                  <div key={index} className="group hover:scale-[1.02] transition-all duration-300">
                    <div className="backdrop-blur-sm bg-gradient-to-r from-white/60 to-slate-50/60 border border-slate-200/50 rounded-2xl p-6">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{risk.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-medium text-slate-800">{risk.name}</h4>
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                              risk.impact === 'Very High' ? 'bg-red-100 text-red-700' :
                              risk.impact === 'High' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {risk.impact}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-500 font-medium">Trend: </span>
                              <span className={`font-medium ${
                                risk.trend === 'Rapidly Increasing' ? 'text-red-600' :
                                risk.trend === 'Increasing' ? 'text-orange-600' :
                                'text-emerald-600'
                              }`}>
                                {risk.trend}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium">Mitigation: </span>
                              <span className="font-medium text-blue-600">{risk.mitigation}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Projection Table */}
        <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-slate-500/10 overflow-hidden mb-16">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-6">
            <h3 className="text-2xl font-medium text-white">Financial Roadmap</h3>
            <p className="text-slate-200 font-light mt-1">Year-by-year strategic evolution</p>
          </div>
          
          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left p-4 text-slate-700 font-medium">Year</th>
                    <th className="text-right p-4 text-slate-700 font-medium">Revenue</th>
                    <th className="text-right p-4 text-slate-700 font-medium">Insurance Investment</th>
                    <th className="text-right p-4 text-slate-700 font-medium">% of Revenue</th>
                    <th className="text-right p-4 text-slate-700 font-medium">Team Size</th>
                    <th className="text-right p-4 text-slate-700 font-medium">Commercial %</th>
                    <th className="text-right p-4 text-slate-700 font-medium">Risk Protection</th>
                  </tr>
                </thead>
                <tbody>
                  {projectionData.map((row, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                          <span className="font-medium text-slate-800">Year {row.year}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium text-slate-800">{formatLarge(row.revenue)}</td>
                      <td className="p-4 text-right font-medium text-blue-600">{formatCurrency(row.insuranceCost)}</td>
                      <td className="p-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          parseFloat(row.insurancePercentage) <= 4 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {row.insurancePercentage}%
                        </span>
                      </td>
                      <td className="p-4 text-right font-medium text-slate-700">{row.employees}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${row.commercialMix}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-slate-700">{row.commercialMix}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium text-emerald-600">{formatLarge(row.netSavings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Strategic Action Items */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-50/80 to-blue-50/80 rounded-3xl border border-white/50 shadow-2xl shadow-emerald-500/10 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-blue-600 px-8 py-6">
            <div className="flex items-center justify-center space-x-4">
              <Target className="w-8 h-8 text-white" />
              <h3 className="text-2xl font-medium text-white">Strategic Imperatives</h3>
            </div>
            <p className="text-center text-emerald-100 font-light text-lg mt-2">Your roadmap to risk-optimized growth</p>
          </div>
          
          <div className="p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Zap className="w-6 h-6 text-red-500" />
                  <h4 className="text-xl font-medium text-slate-800">Immediate Actions (30 Days)</h4>
                </div>
                <div className="space-y-4">
                  {[
                    'Secure General Liability and Workers Compensation coverage',
                    'Establish relationship with specialized construction insurance broker',
                    'Implement basic safety program to optimize experience modification'
                  ].map((action, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-white/60 rounded-2xl backdrop-blur-sm">
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-medium mt-1">
                        {index + 1}
                      </div>
                      <span className="text-slate-700 font-light leading-relaxed">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Target className="w-6 h-6 text-blue-500" />
                  <h4 className="text-xl font-medium text-slate-800">Strategic Planning (3-12 Months)</h4>
                </div>
                <div className="space-y-4">
                  {[
                    'Add Professional Liability before commercial transition',
                    'Implement Pollution Liability for environmental compliance',
                    'Develop comprehensive subcontractor insurance requirements'
                  ].map((action, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-white/60 rounded-2xl backdrop-blur-sm">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mt-1">
                        {index + 1}
                      </div>
                      <span className="text-slate-700 font-light leading-relaxed">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceStrategyDashboard;