import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Clock, AlertCircle, ArrowRight, Play, Pause } from 'lucide-react';

const ImplementationTimeline = () => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [selectedPhase, setSelectedPhase] = useState('foundation');
  const [showOnlyCritical, setShowOnlyCritical] = useState(false);

  const phases = {
    foundation: {
      name: 'Foundation',
      subtitle: 'Weeks 1-8',
      description: 'Essential coverage and basic risk management',
      gradient: 'from-emerald-400 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      weeks: [1, 2, 3, 4, 5, 6, 7, 8],
      icon: '🏗️'
    },
    expansion: {
      name: 'Expansion',
      subtitle: 'Weeks 9-16',
      description: 'Additional coverage and process optimization',
      gradient: 'from-blue-400 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      weeks: [9, 10, 11, 12, 13, 14, 15, 16],
      icon: '📈'
    },
    optimization: {
      name: 'Optimization',
      subtitle: 'Weeks 17-24',
      description: 'Advanced strategies and continuous improvement',
      gradient: 'from-purple-400 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      weeks: [17, 18, 19, 20, 21, 22, 23, 24],
      icon: '⚡'
    }
  };

  const tasks = [
    // Foundation Phase
    {
      id: 'gl_quotes',
      week: 1,
      phase: 'foundation',
      title: 'Obtain General Liability Quotes',
      description: 'Get competitive quotes from CNA, Liberty Mutual, and regional carriers',
      critical: true,
      cost: 0,
      dependencies: [],
      deliverables: ['3 competitive quotes', 'Coverage comparison matrix'],
      owner: 'Business Owner',
      icon: '📋'
    },
    {
      id: 'wc_setup',
      week: 1,
      phase: 'foundation',
      title: 'Setup Workers Compensation',
      description: 'Secure coverage with Texas Mutual Insurance Company',
      critical: true,
      cost: 19000,
      dependencies: [],
      deliverables: ['Active WC policy', 'Certificate of coverage'],
      owner: 'Business Owner',
      icon: '🛡️'
    },
    {
      id: 'broker_selection',
      week: 2,
      phase: 'foundation',
      title: 'Select Insurance Broker',
      description: 'Choose specialized construction insurance broker',
      critical: true,
      cost: 0,
      dependencies: ['gl_quotes'],
      deliverables: ['Signed broker agreement', 'Broker contact information'],
      owner: 'Business Owner',
      icon: '🤝'
    },
    {
      id: 'auto_coverage',
      week: 3,
      phase: 'foundation',
      title: 'Commercial Auto Insurance',
      description: 'Secure fleet coverage for company vehicles',
      critical: true,
      cost: 7000,
      dependencies: ['broker_selection'],
      deliverables: ['Auto insurance policy', 'Vehicle registration updates'],
      owner: 'Business Owner',
      icon: '🚛'
    },
    {
      id: 'safety_program',
      week: 4,
      phase: 'foundation',
      title: 'Implement Basic Safety Program',
      description: 'Develop safety manual and training procedures',
      critical: false,
      cost: 2500,
      dependencies: [],
      deliverables: ['Safety manual', 'Training schedule', 'Incident reporting forms'],
      owner: 'Operations Manager',
      icon: '⚠️'
    },
    {
      id: 'certificate_system',
      week: 5,
      phase: 'foundation',
      title: 'Certificate Management System',
      description: 'Setup system for tracking insurance certificates',
      critical: true,
      cost: 500,
      dependencies: ['auto_coverage'],
      deliverables: ['Certificate tracking spreadsheet', 'ACORD forms'],
      owner: 'Administrative Staff',
      icon: '📄'
    },
    {
      id: 'contract_templates',
      week: 6,
      phase: 'foundation',
      title: 'Contract Templates',
      description: 'Develop standard contract language for insurance requirements',
      critical: true,
      cost: 3000,
      dependencies: [],
      deliverables: ['Contract templates', 'Insurance requirement clauses'],
      owner: 'Legal Advisor',
      icon: '📝'
    },
    {
      id: 'tdi_registration',
      week: 7,
      phase: 'foundation',
      title: 'Texas Department of Insurance Registration',
      description: 'Complete required state registrations',
      critical: true,
      cost: 500,
      dependencies: ['wc_setup'],
      deliverables: ['TDI registration certificate', 'Compliance documentation'],
      owner: 'Business Owner',
      icon: '🏛️'
    },
    {
      id: 'claims_procedures',
      week: 8,
      phase: 'foundation',
      title: 'Claims Management Procedures',
      description: 'Establish protocols for incident reporting and claims',
      critical: false,
      cost: 1000,
      dependencies: ['certificate_system'],
      deliverables: ['Claims procedures manual', 'Emergency contact list'],
      owner: 'Operations Manager',
      icon: '📞'
    },

    // Expansion Phase
    {
      id: 'professional_liability',
      week: 9,
      phase: 'expansion',
      title: 'Professional Liability Coverage',
      description: 'Add E&O coverage for design-build elements',
      critical: false,
      cost: 2400,
      dependencies: ['broker_selection'],
      deliverables: ['Professional liability policy', 'Coverage explanation'],
      owner: 'Business Owner',
      icon: '🎯'
    },
    {
      id: 'pollution_liability',
      week: 10,
      phase: 'expansion',
      title: 'Pollution Liability Insurance',
      description: 'Secure environmental coverage for TCEQ compliance',
      critical: false,
      cost: 5400,
      dependencies: ['professional_liability'],
      deliverables: ['CPL policy', 'Environmental procedures manual'],
      owner: 'Business Owner',
      icon: '🌍'
    },
    {
      id: 'subcontractor_requirements',
      week: 11,
      phase: 'expansion',
      title: 'Subcontractor Insurance Requirements',
      description: 'Standardize insurance requirements for subcontractors',
      critical: true,
      cost: 1500,
      dependencies: ['contract_templates'],
      deliverables: ['Subcontractor requirements document', 'Verification procedures'],
      owner: 'Project Manager',
      icon: '👥'
    },
    {
      id: 'cyber_insurance',
      week: 12,
      phase: 'expansion',
      title: 'Cyber Insurance Coverage',
      description: 'Protect against cyber threats and data breaches',
      critical: false,
      cost: 2400,
      dependencies: [],
      deliverables: ['Cyber insurance policy', 'Cybersecurity procedures'],
      owner: 'Business Owner',
      icon: '💻'
    },
    {
      id: 'equipment_coverage',
      week: 13,
      phase: 'expansion',
      title: 'Equipment and Tools Coverage',
      description: 'Inland marine coverage for tools and equipment',
      critical: false,
      cost: 3000,
      dependencies: [],
      deliverables: ['Equipment inventory', 'Inland marine policy'],
      owner: 'Operations Manager',
      icon: '🔧'
    },
    {
      id: 'experience_mod',
      week: 14,
      phase: 'expansion',
      title: 'Experience Modification Review',
      description: 'Optimize workers comp experience rating',
      critical: false,
      cost: 2000,
      dependencies: ['safety_program'],
      deliverables: ['Experience mod analysis', 'Safety improvement plan'],
      owner: 'Safety Manager',
      icon: '📊'
    },
    {
      id: 'umbrella_coverage',
      week: 15,
      phase: 'expansion',
      title: 'Umbrella/Excess Coverage',
      description: 'Add $5M umbrella policy for additional protection',
      critical: false,
      cost: 8000,
      dependencies: ['pollution_liability'],
      deliverables: ['Umbrella policy', 'Coverage verification'],
      owner: 'Business Owner',
      icon: '☂️'
    },
    {
      id: 'risk_assessment',
      week: 16,
      phase: 'expansion',
      title: 'Comprehensive Risk Assessment',
      description: 'Conduct formal risk assessment with insurance consultant',
      critical: false,
      cost: 5000,
      dependencies: ['umbrella_coverage'],
      deliverables: ['Risk assessment report', 'Recommendations matrix'],
      owner: 'Insurance Consultant',
      icon: '🔍'
    },

    // Optimization Phase
    {
      id: 'premium_audit',
      week: 17,
      phase: 'optimization',
      title: 'Premium Audit Preparation',
      description: 'Prepare for annual workers comp premium audit',
      critical: false,
      cost: 1000,
      dependencies: ['experience_mod'],
      deliverables: ['Audit preparation checklist', 'Payroll documentation'],
      owner: 'Accounting Manager',
      icon: '📈'
    },
    {
      id: 'carrier_review',
      week: 18,
      phase: 'optimization',
      title: 'Annual Carrier Review',
      description: 'Evaluate carrier performance and market options',
      critical: false,
      cost: 2000,
      dependencies: ['risk_assessment'],
      deliverables: ['Carrier performance scorecard', 'Market comparison'],
      owner: 'Insurance Broker',
      icon: '⭐'
    },
    {
      id: 'captive_evaluation',
      week: 19,
      phase: 'optimization',
      title: 'Captive Insurance Evaluation',
      description: 'Assess captive insurance opportunities for large operations',
      critical: false,
      cost: 10000,
      dependencies: ['carrier_review'],
      deliverables: ['Captive feasibility study', 'Cost-benefit analysis'],
      owner: 'Insurance Consultant',
      icon: '🏢'
    },
    {
      id: 'telematics_program',
      week: 20,
      phase: 'optimization',
      title: 'Fleet Telematics Program',
      description: 'Implement vehicle monitoring for auto insurance discounts',
      critical: false,
      cost: 5000,
      dependencies: [],
      deliverables: ['Telematics system', 'Driver behavior monitoring'],
      owner: 'Fleet Manager',
      icon: '🛰️'
    },
    {
      id: 'safety_certification',
      week: 21,
      phase: 'optimization',
      title: 'Safety Certification Program',
      description: 'Pursue EMR reduction through certified safety programs',
      critical: false,
      cost: 8000,
      dependencies: ['premium_audit'],
      deliverables: ['Safety certification', 'Training completion records'],
      owner: 'Safety Manager',
      icon: '🏆'
    },
    {
      id: 'international_coverage',
      week: 22,
      phase: 'optimization',
      title: 'International Coverage Assessment',
      description: 'Evaluate coverage needs for potential international projects',
      critical: false,
      cost: 3000,
      dependencies: [],
      deliverables: ['International coverage analysis', 'Global program options'],
      owner: 'Insurance Broker',
      icon: '🌐'
    },
    {
      id: 'predictive_analytics',
      week: 23,
      phase: 'optimization',
      title: 'Predictive Risk Analytics',
      description: 'Implement data analytics for risk prediction and prevention',
      critical: false,
      cost: 12000,
      dependencies: ['safety_certification'],
      deliverables: ['Analytics platform', 'Risk prediction models'],
      owner: 'Risk Manager',
      icon: '🔮'
    },
    {
      id: 'annual_review',
      week: 24,
      phase: 'optimization',
      title: 'Annual Program Review',
      description: 'Comprehensive review and planning for next year',
      critical: true,
      cost: 2000,
      dependencies: ['predictive_analytics'],
      deliverables: ['Annual review report', 'Next year strategy'],
      owner: 'Executive Team',
      icon: '📅'
    }
  ];

  const toggleTaskCompletion = (taskId) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
  };

  const getFilteredTasks = () => {
    let filtered = tasks;
    
    if (selectedPhase !== 'all') {
      filtered = filtered.filter(task => task.phase === selectedPhase);
    }
    
    if (showOnlyCritical) {
      filtered = filtered.filter(task => task.critical);
    }
    
    return filtered.sort((a, b) => a.week - b.week);
  };

  const getTaskStatus = (task) => {
    if (completedTasks.has(task.id)) return 'completed';
    if (task.week <= currentWeek) return 'current';
    if (task.week <= currentWeek + 2) return 'upcoming';
    return 'future';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-emerald-600" />;
      case 'current':
        return <Play className="w-6 h-6 text-orange-500" />;
      case 'upcoming':
        return <Clock className="w-6 h-6 text-amber-500" />;
      default:
        return <Circle className="w-6 h-6 text-slate-400" />;
    }
  };

  const calculateTotalCost = () => {
    return getFilteredTasks().reduce((total, task) => total + task.cost, 0);
  };

  const calculateProgress = () => {
    const filteredTasks = getFilteredTasks();
    const completed = filteredTasks.filter(task => completedTasks.has(task.id)).length;
    return filteredTasks.length > 0 ? (completed / filteredTasks.length) * 100 : 0;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-8xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-thin tracking-tight text-slate-900 mb-4">
            Implementation
            <span className="font-light text-purple-600 block">Timeline</span>
          </h1>
          <p className="text-xl text-slate-600 font-light max-w-3xl mx-auto leading-relaxed">
            Track your insurance program implementation with intelligent progress monitoring
          </p>
        </div>

        {/* Control Panel */}
        <div className="mb-12">
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-purple-500/10 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
              <h2 className="text-2xl font-medium text-white">Timeline Controls</h2>
              <p className="text-purple-100 font-light mt-1">Navigate and customize your implementation journey</p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
                {/* Week Navigator */}
                <div className="text-center">
                  <label className="block text-sm font-medium text-slate-600 mb-4">Current Week</label>
                  <div className="flex items-center justify-center space-x-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                      disabled={currentWeek <= 1}
                      className="rounded-full h-10 w-10 p-0"
                    >
                      -
                    </Button>
                    <div className="text-3xl font-light text-purple-600 min-w-[60px]">{currentWeek}</div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setCurrentWeek(Math.min(24, currentWeek + 1))}
                      disabled={currentWeek >= 24}
                      className="rounded-full h-10 w-10 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Phase Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-4">Implementation Phase</label>
                  <select 
                    value={selectedPhase}
                    onChange={(e) => setSelectedPhase(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Phases</option>
                    <option value="foundation">Foundation Phase</option>
                    <option value="expansion">Expansion Phase</option>
                    <option value="optimization">Optimization Phase</option>
                  </select>
                </div>

                {/* Critical Filter */}
                <div className="flex items-center justify-center">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyCritical}
                      onChange={(e) => setShowOnlyCritical(e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-slate-600">Critical Tasks Only</span>
                  </label>
                </div>

                {/* Quick Stats */}
                <div className="text-center">
                  <div className="text-2xl font-light text-slate-800">{Math.ceil((24 - currentWeek) / 4)}</div>
                  <div className="text-sm text-slate-600 font-light">Months Remaining</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {Object.entries(phases).map(([key, phase]) => (
            <div 
              key={key}
              className={`group cursor-pointer transition-all duration-500 ${
                selectedPhase === key ? 'scale-105' : 'hover:scale-102'
              }`}
              onClick={() => setSelectedPhase(key)}
            >
              <div className={`backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl overflow-hidden ${
                selectedPhase === key ? 'ring-4 ring-purple-500/50' : ''
              }`}>
                <div className={`bg-gradient-to-r ${phase.gradient} px-8 py-8`}>
                  <div className="text-center">
                    <div className="text-4xl mb-2">{phase.icon}</div>
                    <h3 className="text-2xl font-medium text-white mb-1">{phase.name}</h3>
                    <p className="text-white/80 font-light">{phase.subtitle}</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-slate-600 font-light mb-4 leading-relaxed">{phase.description}</p>
                  <div className="text-center">
                    <div className="text-lg font-medium text-slate-800 mb-1">
                      {tasks.filter(t => t.phase === key && completedTasks.has(t.id)).length} / {tasks.filter(t => t.phase === key).length}
                    </div>
                    <div className="text-sm text-slate-600 font-light">Tasks Completed</div>
                    <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${phase.gradient} h-2 rounded-full transition-all duration-500`}
                        style={{ 
                          width: `${(tasks.filter(t => t.phase === key && completedTasks.has(t.id)).length / tasks.filter(t => t.phase === key).length) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-blue-500/10 overflow-hidden">
            <div className="p-8 text-center">
              <div className="text-4xl font-thin text-blue-600 mb-2">{calculateProgress().toFixed(1)}%</div>
              <div className="text-slate-600 font-light mb-4">Overall Progress</div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-emerald-500/10 overflow-hidden">
            <div className="p-8 text-center">
              <div className="text-4xl font-thin text-emerald-600 mb-2">{formatCurrency(calculateTotalCost())}</div>
              <div className="text-slate-600 font-light mb-2">Total Investment</div>
              <div className="text-xs text-slate-500 font-light">
                {getFilteredTasks().length} selected tasks
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-orange-500/10 overflow-hidden">
            <div className="p-8 text-center">
              <div className="text-4xl font-thin text-orange-600 mb-2">Week {currentWeek}</div>
              <div className="text-slate-600 font-light mb-2">Current Position</div>
              <div className="text-xs text-slate-500 font-light">
                {24 - currentWeek} weeks remaining
              </div>
            </div>
          </div>
        </div>

        {/* Task Timeline */}
        <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/50 shadow-2xl shadow-slate-500/10 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-8 py-6">
            <h3 className="text-2xl font-medium text-white">Implementation Tasks</h3>
            <p className="text-slate-200 font-light mt-1">Your strategic roadmap to comprehensive protection</p>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              {getFilteredTasks().map((task) => {
                const status = getTaskStatus(task);
                const canComplete = task.dependencies.every(dep => completedTasks.has(dep));
                const isCompleted = completedTasks.has(task.id);
                
                return (
                  <div 
                    key={task.id}
                    className={`group transition-all duration-500 ${
                      status === 'completed' ? 'scale-[0.98] opacity-80' : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className={`rounded-3xl border-2 transition-all duration-300 backdrop-blur-sm ${
                      status === 'completed' ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' :
                      status === 'current' ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 shadow-lg shadow-orange-500/20' :
                      status === 'upcoming' ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' :
                      'bg-white/60 border-slate-200/50'
                    } ${!canComplete && !isCompleted ? 'opacity-60' : ''}`}>
                      
                      <div className="p-8">
                        <div className="flex items-start space-x-6">
                          {/* Status Icon & Week */}
                          <div className="flex flex-col items-center space-y-3">
                            <button
                              onClick={() => toggleTaskCompletion(task.id)}
                              disabled={!canComplete && !isCompleted}
                              className="transition-all duration-200 hover:scale-110"
                            >
                              {getStatusIcon(status)}
                            </button>
                            <div className="text-center">
                              <div className="text-lg font-medium text-slate-700">Week {task.week}</div>
                              {task.critical && (
                                <div className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium mt-1">
                                  Critical
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Task Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="text-2xl">{task.icon}</div>
                                <div>
                                  <h4 className={`text-xl font-medium mb-2 ${isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                                    {task.title}
                                  </h4>
                                  <p className="text-slate-600 font-light leading-relaxed">{task.description}</p>
                                </div>
                              </div>
                              <div className="text-right ml-6">
                                <div className="text-2xl font-light text-emerald-600 mb-1">
                                  {formatCurrency(task.cost)}
                                </div>
                                <div className="text-sm text-slate-500 font-light">Investment</div>
                              </div>
                            </div>
                            
                            {/* Task Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                              <div>
                                <div className="text-xs text-slate-500 font-medium mb-2">OWNER</div>
                                <div className="text-sm font-medium text-slate-700">{task.owner}</div>
                              </div>
                              <div>
                                <div className="text-xs text-slate-500 font-medium mb-2">DELIVERABLES</div>
                                <div className="text-sm font-medium text-indigo-600">{task.deliverables.length} items</div>
                              </div>
                              <div>
                                <div className="text-xs text-slate-500 font-medium mb-2">DEPENDENCIES</div>
                                <div className="text-sm font-medium text-slate-700">
                                  {task.dependencies.length === 0 ? 'None' : `${task.dependencies.length} tasks`}
                                </div>
                              </div>
                            </div>
                            
                            {/* Dependencies */}
                            {task.dependencies.length > 0 && (
                              <div className="mb-4">
                                <div className="text-xs text-slate-500 font-medium mb-2">PREREQUISITES</div>
                                <div className="flex flex-wrap gap-2">
                                  {task.dependencies.map(dep => {
                                    const depTask = tasks.find(t => t.id === dep);
                                    return (
                                      <span 
                                        key={dep}
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                          completedTasks.has(dep) 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : 'bg-red-100 text-red-700'
                                        }`}
                                      >
                                        {depTask?.title}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            
                            {/* Deliverables Expand */}
                            <details className="group/details">
                              <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                View Deliverables ({task.deliverables.length})
                              </summary>
                              <div className="mt-3 pl-4 border-l-2 border-indigo-200">
                                <div className="space-y-2">
                                  {task.deliverables.map((deliverable, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                                      <span className="text-sm text-slate-600">{deliverable}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </details>
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

        {/* Status Legend */}
        <div className="mt-12 backdrop-blur-xl bg-white/60 rounded-3xl border border-white/50 shadow-lg">
          <div className="p-8">
            <h3 className="text-xl font-medium text-slate-800 mb-6 text-center">Timeline Status Guide</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-slate-800 mb-1">Completed</div>
                <div className="text-xs text-slate-600 font-light">Task finished</div>
              </div>
              <div className="text-center">
                <Play className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-slate-800 mb-1">Active</div>
                <div className="text-xs text-slate-600 font-light">Current week</div>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-slate-800 mb-1">Upcoming</div>
                <div className="text-xs text-slate-600 font-light">Next 2 weeks</div>
              </div>
              <div className="text-center">
                <Circle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-slate-800 mb-1">Future</div>
                <div className="text-xs text-slate-600 font-light">Planned ahead</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImplementationTimeline;