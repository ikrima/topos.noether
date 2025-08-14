import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const InsuranceCostExplorer = () => {
  const [revenue, setRevenue] = useState([500000]);
  const [payroll, setPayroll] = useState([150000]);
  const [vehicles, setVehicles] = useState([1]);
  const [riskLevel, setRiskLevel] = useState([2]);
  const [commercialMix, setCommercialMix] = useState([0]);

  // Calculate insurance costs based on inputs
  const calculateCosts = () => {
    const revenueVal = revenue[0];
    const payrollVal = payroll[0];
    const vehicleCount = vehicles[0];
    const risk = riskLevel[0];
    const commercial = commercialMix[0] / 100;

    const riskMultiplier = { 1: 0.8, 2: 1.0, 3: 1.3 }[risk];
    const commercialMultiplier = 1 + (commercial * 0.4);

    const costs = {
      generalLiability: Math.round((revenueVal * 0.006 * riskMultiplier * commercialMultiplier)),
      workersComp: Math.round((payrollVal * 0.063 * riskMultiplier)),
      commercialAuto: Math.round((vehicleCount * 3500 * riskMultiplier)),
      professionalLiability: Math.round((900 + (revenueVal * 0.0006)) * commercialMultiplier),
      pollutionLiability: commercial > 0.3 ? Math.round(2700 * riskMultiplier) : 0,
      cyber: Math.round(1200 * (1 + commercial * 0.5)),
      umbrella: revenueVal > 1000000 ? Math.round(5000 * riskMultiplier) : 0,
      equipment: revenueVal > 800000 ? Math.round(3000 * riskMultiplier) : 0
    };

    const total = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
    const percentage = ((total / revenueVal) * 100).toFixed(2);

    return { ...costs, total, percentage };
  };

  const costs = calculateCosts();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRiskColor = (percentage) => {
    if (percentage < 3) return 'text-emerald-600';
    if (percentage < 5) return 'text-amber-600';
    return 'text-red-500';
  };

  const coverageItems = [
    { name: 'General Liability', amount: costs.generalLiability, required: true, color: 'bg-blue-500' },
    { name: 'Workers Compensation', amount: costs.workersComp, required: true, color: 'bg-emerald-500' },
    { name: 'Commercial Auto', amount: costs.commercialAuto, required: true, color: 'bg-purple-500' },
    { name: 'Professional Liability', amount: costs.professionalLiability, required: false, color: 'bg-orange-500' },
    { name: 'Pollution Liability', amount: costs.pollutionLiability, required: false, color: 'bg-pink-500' },
    { name: 'Cyber Insurance', amount: costs.cyber, required: false, color: 'bg-indigo-500' },
    { name: 'Umbrella Coverage', amount: costs.umbrella, required: false, color: 'bg-teal-500' },
    { name: 'Equipment Coverage', amount: costs.equipment, required: false, color: 'bg-rose-500' }
  ].filter(item => item.amount > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-thin tracking-tight text-slate-900 mb-4">
            Insurance Cost
            <span className="font-light text-blue-600 block">Explorer</span>
          </h1>
          <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
            Discover how your business parameters shape insurance investments with real-time precision
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <div className="xl:col-span-5 space-y-6">
            <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-blue-500/10 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <h2 className="text-2xl font-medium text-white">Business Parameters</h2>
                <p className="text-blue-100 font-light mt-1">Adjust to explore scenarios</p>
              </div>
              
              <div className="p-8 space-y-10">
                <div>
                  <div className="flex justify-between items-baseline mb-4">
                    <label className="text-lg font-medium text-slate-800">Annual Revenue</label>
                    <span className="text-2xl font-light text-blue-600">{formatCurrency(revenue[0])}</span>
                  </div>
                  <Slider
                    value={revenue}
                    onValueChange={setRevenue}
                    max={3000000}
                    min={100000}
                    step={50000}
                    className="w-full h-2"
                  />
                  <div className="flex justify-between text-sm text-slate-500 mt-3 font-light">
                    <span>$100K</span>
                    <span>$3M</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-4">
                    <label className="text-lg font-medium text-slate-800">Annual Payroll</label>
                    <span className="text-2xl font-light text-emerald-600">{formatCurrency(payroll[0])}</span>
                  </div>
                  <Slider
                    value={payroll}
                    onValueChange={setPayroll}
                    max={1000000}
                    min={50000}
                    step={25000}
                    className="w-full h-2"
                  />
                  <div className="flex justify-between text-sm text-slate-500 mt-3 font-light">
                    <span>$50K</span>
                    <span>$1M</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-4">
                    <label className="text-lg font-medium text-slate-800">Fleet Size</label>
                    <span className="text-2xl font-light text-purple-600">{vehicles[0]} vehicle{vehicles[0] !== 1 ? 's' : ''}</span>
                  </div>
                  <Slider
                    value={vehicles}
                    onValueChange={setVehicles}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full h-2"
                  />
                  <div className="flex justify-between text-sm text-slate-500 mt-3 font-light">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-4">
                    <label className="text-lg font-medium text-slate-800">Risk Profile</label>
                    <span className="text-2xl font-light text-orange-600">
                      {['Conservative', 'Balanced', 'Aggressive'][riskLevel[0] - 1]}
                    </span>
                  </div>
                  <Slider
                    value={riskLevel}
                    onValueChange={setRiskLevel}
                    max={3}
                    min={1}
                    step={1}
                    className="w-full h-2"
                  />
                  <div className="flex justify-between text-sm text-slate-500 mt-3 font-light">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-4">
                    <label className="text-lg font-medium text-slate-800">Commercial Work</label>
                    <span className="text-2xl font-light text-pink-600">{commercialMix[0]}%</span>
                  </div>
                  <Slider
                    value={commercialMix}
                    onValueChange={setCommercialMix}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full h-2"
                  />
                  <div className="flex justify-between text-sm text-slate-500 mt-3 font-light">
                    <span>All Residential</span>
                    <span>All Commercial</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="xl:col-span-7 space-y-6">
            {/* Total Cost Card */}
            <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-blue-500/10 overflow-hidden">
              <div className="p-8">
                <div className="text-center">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-slate-600 mb-2">Total Annual Investment</h3>
                    <div className={`text-7xl font-thin tracking-tight mb-2 ${getRiskColor(costs.percentage)}`}>
                      {formatCurrency(costs.total)}
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                      <span className={`text-4xl font-light ${getRiskColor(costs.percentage)}`}>
                        {costs.percentage}%
                      </span>
                      <span className="text-slate-500 text-lg font-light">of revenue</span>
                    </div>
                  </div>
                  
                  <div className="backdrop-blur-sm bg-slate-50/50 rounded-2xl p-6 border border-slate-200/50">
                    <div className="text-sm text-slate-600 mb-3 font-medium">Industry Benchmark: 2-4% of Revenue</div>
                    <div className={`text-base font-medium ${costs.percentage < 5 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {costs.percentage < 2 ? 'Below Target Range - Consider Additional Protection' :
                       costs.percentage <= 4 ? 'Optimal Range - Well Positioned' :
                       costs.percentage <= 6 ? 'Above Target - Optimization Opportunity' :
                       'Significantly Above Target - Strategic Review Needed'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coverage Breakdown */}
            <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-blue-500/10 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-8 py-6">
                <h3 className="text-2xl font-medium text-white">Coverage Portfolio</h3>
                <p className="text-slate-200 font-light mt-1">Investment breakdown by protection type</p>
              </div>
              
              <div className="p-8">
                <div className="space-y-4">
                  {coverageItems.map((item, index) => (
                    <div key={index} className="group hover:scale-[1.02] transition-all duration-300">
                      <div className="flex items-center justify-between py-4 px-6 rounded-2xl bg-gradient-to-r from-slate-50/50 to-white/50 border border-slate-200/50 backdrop-blur-sm">
                        <div className="flex items-center space-x-4">
                          <div className={`w-4 h-4 ${item.color} rounded-full shadow-lg`}></div>
                          <div>
                            <span className="text-lg font-medium text-slate-800">{item.name}</span>
                            {item.required && (
                              <span className="ml-3 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-2xl font-light text-slate-700">{formatCurrency(item.amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strategic Insights */}
            <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-blue-500/10 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6">
                <h3 className="text-2xl font-medium text-white">Strategic Insights</h3>
                <p className="text-emerald-100 font-light mt-1">Tailored recommendations for your scenario</p>
              </div>
              
              <div className="p-8 space-y-4">
                {costs.percentage > 5 && (
                  <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-3"></div>
                      <div>
                        <h4 className="font-medium text-amber-800 text-lg">Cost Optimization Opportunity</h4>
                        <p className="text-amber-700 font-light">Consider implementing comprehensive safety programs to reduce workers compensation costs by 15-40%</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {commercialMix[0] > 50 && (
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                      <div>
                        <h4 className="font-medium text-blue-800 text-lg">Commercial Growth Strategy</h4>
                        <p className="text-blue-700 font-light">Your commercial focus requires enhanced professional liability and environmental coverage for optimal protection</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {revenue[0] > 1000000 && costs.umbrella === 0 && (
                  <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-3"></div>
                      <div>
                        <h4 className="font-medium text-purple-800 text-lg">Scale Protection</h4>
                        <p className="text-purple-700 font-light">Consider umbrella coverage to provide additional protection as your revenue grows beyond $1M</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {costs.percentage < 2 && (
                  <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-3"></div>
                      <div>
                        <h4 className="font-medium text-emerald-800 text-lg">Efficient Investment</h4>
                        <p className="text-emerald-700 font-light">Your costs are well-optimized. Ensure coverage adequacy supports your growth trajectory</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceCostExplorer;