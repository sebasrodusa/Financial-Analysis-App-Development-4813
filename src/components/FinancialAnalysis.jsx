import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useClient } from '../context/ClientContext';

const { FiArrowLeft, FiSave, FiDollarSign, FiUsers, FiHome, FiCreditCard, FiTarget, FiShield, FiPlus, FiTrash2, FiEdit2 } = FiIcons;

function FinancialAnalysis() {
  const { id } = useParams();
  const { state, dispatch } = useClient();
  const [client, setClient] = useState(null);
  const [analysis, setAnalysis] = useState({
    clientId: id,
    personalInfo: {},
    spouseInfo: {},
    children: [],
    income: {
      primaryIncome: 0,
      spouseIncome: 0,
      otherIncome: 0,
      totalIncome: 0
    },
    expenses: {
      housing: 0,
      transportation: 0,
      food: 0,
      healthcare: 0,
      insurance: 0,
      utilities: 0,
      entertainment: 0,
      other: 0,
      totalExpenses: 0
    },
    assets: {
      cash: 0,
      investments: 0,
      retirement: 0,
      realEstate: 0,
      personal: 0,
      totalAssets: 0
    },
    liabilities: {
      mortgage: 0,
      creditCards: 0,
      loans: 0,
      other: 0,
      totalLiabilities: 0
    },
    financialGoals: [],
    lifeInsurance: [],
    netIncome: 0,
    netWorth: 0
  });

  useEffect(() => {
    const foundClient = state.clients.find(c => c.id === id);
    setClient(foundClient);
    
    const existingAnalysis = state.analyses.find(a => a.clientId === id);
    if (existingAnalysis) {
      setAnalysis(existingAnalysis);
    }
  }, [id, state.clients, state.analyses]);

  useEffect(() => {
    // Calculate totals
    const totalIncome = analysis.income.primaryIncome + analysis.income.spouseIncome + analysis.income.otherIncome;
    const totalExpenses = Object.values(analysis.expenses).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0) - analysis.expenses.totalExpenses;
    const totalAssets = Object.values(analysis.assets).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0) - analysis.assets.totalAssets;
    const totalLiabilities = Object.values(analysis.liabilities).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0) - analysis.liabilities.totalLiabilities;
    
    setAnalysis(prev => ({
      ...prev,
      income: { ...prev.income, totalIncome },
      expenses: { ...prev.expenses, totalExpenses },
      assets: { ...prev.assets, totalAssets },
      liabilities: { ...prev.liabilities, totalLiabilities },
      netIncome: totalIncome - totalExpenses,
      netWorth: totalAssets - totalLiabilities
    }));
  }, [analysis.income.primaryIncome, analysis.income.spouseIncome, analysis.income.otherIncome, 
      analysis.expenses.housing, analysis.expenses.transportation, analysis.expenses.food, 
      analysis.expenses.healthcare, analysis.expenses.insurance, analysis.expenses.utilities, 
      analysis.expenses.entertainment, analysis.expenses.other,
      analysis.assets.cash, analysis.assets.investments, analysis.assets.retirement, 
      analysis.assets.realEstate, analysis.assets.personal,
      analysis.liabilities.mortgage, analysis.liabilities.creditCards, analysis.liabilities.loans, 
      analysis.liabilities.other]);

  const handleInputChange = (section, field, value) => {
    setAnalysis(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const addFinancialGoal = () => {
    const newGoal = {
      id: Date.now(),
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: '',
      priority: 'medium',
      notes: ''
    };
    setAnalysis(prev => ({
      ...prev,
      financialGoals: [...prev.financialGoals, newGoal]
    }));
  };

  const removeFinancialGoal = (id) => {
    setAnalysis(prev => ({
      ...prev,
      financialGoals: prev.financialGoals.filter(goal => goal.id !== id)
    }));
  };

  const updateFinancialGoal = (id, field, value) => {
    setAnalysis(prev => ({
      ...prev,
      financialGoals: prev.financialGoals.map(goal =>
        goal.id === id ? { ...goal, [field]: value } : goal
      )
    }));
  };

  const addLifeInsurance = () => {
    const newPolicy = {
      id: Date.now(),
      policyType: 'term',
      insuranceCompany: '',
      policyNumber: '',
      coverageAmount: 0,
      premium: 0,
      beneficiary: '',
      policyStartDate: '',
      policyEndDate: '',
      notes: ''
    };
    setAnalysis(prev => ({
      ...prev,
      lifeInsurance: [...prev.lifeInsurance, newPolicy]
    }));
  };

  const removeLifeInsurance = (id) => {
    setAnalysis(prev => ({
      ...prev,
      lifeInsurance: prev.lifeInsurance.filter(policy => policy.id !== id)
    }));
  };

  const updateLifeInsurance = (id, field, value) => {
    setAnalysis(prev => ({
      ...prev,
      lifeInsurance: prev.lifeInsurance.map(policy =>
        policy.id === id ? { ...policy, [field]: value } : policy
      )
    }));
  };

  const saveAnalysis = () => {
    const analysisData = {
      ...analysis,
      id: analysis.id || Date.now().toString(),
      updatedAt: new Date().toISOString()
    };

    if (analysis.id) {
      dispatch({ type: 'UPDATE_ANALYSIS', payload: analysisData });
    } else {
      dispatch({ type: 'ADD_ANALYSIS', payload: analysisData });
    }

    alert('Analysis saved successfully!');
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Client not found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to={`/client/${id}`}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <SafeIcon icon={FiArrowLeft} className="text-xl text-gray-700" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Financial Analysis
                </h1>
                <p className="text-gray-600">{client.firstName} {client.lastName}</p>
              </div>
            </div>
            <button
              onClick={saveAnalysis}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <SafeIcon icon={FiSave} />
              <span>Save Analysis</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Income Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <SafeIcon icon={FiDollarSign} className="text-2xl text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900">Income</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Income (Annual)
                </label>
                <input
                  type="number"
                  value={analysis.income.primaryIncome}
                  onChange={(e) => handleInputChange('income', 'primaryIncome', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spouse Income (Annual)
                </label>
                <input
                  type="number"
                  value={analysis.income.spouseIncome}
                  onChange={(e) => handleInputChange('income', 'spouseIncome', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Income (Annual)
                </label>
                <input
                  type="number"
                  value={analysis.income.otherIncome}
                  onChange={(e) => handleInputChange('income', 'otherIncome', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Income:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${analysis.income.totalIncome.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Expenses Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <SafeIcon icon={FiCreditCard} className="text-2xl text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900">Expenses</h2>
            </div>
            
            <div className="space-y-4">
              {Object.entries(analysis.expenses).filter(([key]) => key !== 'totalExpenses').map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()} (Annual)
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleInputChange('expenses', key, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Expenses:</span>
                  <span className="text-lg font-bold text-red-600">
                    ${analysis.expenses.totalExpenses.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Assets Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <SafeIcon icon={FiHome} className="text-2xl text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">Assets</h2>
            </div>
            
            <div className="space-y-4">
              {Object.entries(analysis.assets).filter(([key]) => key !== 'totalAssets').map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleInputChange('assets', key, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Assets:</span>
                  <span className="text-lg font-bold text-blue-600">
                    ${analysis.assets.totalAssets.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Liabilities Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <SafeIcon icon={FiCreditCard} className="text-2xl text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900">Liabilities</h2>
            </div>
            
            <div className="space-y-4">
              {Object.entries(analysis.liabilities).filter(([key]) => key !== 'totalLiabilities').map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleInputChange('liabilities', key, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Liabilities:</span>
                  <span className="text-lg font-bold text-orange-600">
                    ${analysis.liabilities.totalLiabilities.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Financial Goals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiTarget} className="text-2xl text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-900">Financial Goals</h2>
            </div>
            <button
              onClick={addFinancialGoal}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <SafeIcon icon={FiPlus} />
              <span>Add Goal</span>
            </button>
          </div>

          {analysis.financialGoals.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <SafeIcon icon={FiTarget} className="text-4xl text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No financial goals added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analysis.financialGoals.map((goal) => (
                <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Financial Goal</h4>
                    <button
                      onClick={() => removeFinancialGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Goal Name
                      </label>
                      <input
                        type="text"
                        value={goal.name}
                        onChange={(e) => updateFinancialGoal(goal.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Emergency Fund, House Down Payment"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Amount
                      </label>
                      <input
                        type="number"
                        value={goal.targetAmount}
                        onChange={(e) => updateFinancialGoal(goal.id, 'targetAmount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Amount
                      </label>
                      <input
                        type="number"
                        value={goal.currentAmount}
                        onChange={(e) => updateFinancialGoal(goal.id, 'currentAmount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={goal.targetDate}
                        onChange={(e) => updateFinancialGoal(goal.id, 'targetDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={goal.priority}
                        onChange={(e) => updateFinancialGoal(goal.id, 'priority', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Progress
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={goal.notes}
                      onChange={(e) => updateFinancialGoal(goal.id, 'notes', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional notes about this goal..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Life Insurance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiShield} className="text-2xl text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">Life Insurance Policies</h2>
            </div>
            <button
              onClick={addLifeInsurance}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <SafeIcon icon={FiPlus} />
              <span>Add Policy</span>
            </button>
          </div>

          {analysis.lifeInsurance.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <SafeIcon icon={FiShield} className="text-4xl text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No life insurance policies added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analysis.lifeInsurance.map((policy) => (
                <div key={policy.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Life Insurance Policy</h4>
                    <button
                      onClick={() => removeLifeInsurance(policy.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Policy Type
                      </label>
                      <select
                        value={policy.policyType}
                        onChange={(e) => updateLifeInsurance(policy.id, 'policyType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="term">Term Life</option>
                        <option value="whole">Whole Life</option>
                        <option value="universal">Universal Life</option>
                        <option value="variable">Variable Life</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Insurance Company
                      </label>
                      <input
                        type="text"
                        value={policy.insuranceCompany}
                        onChange={(e) => updateLifeInsurance(policy.id, 'insuranceCompany', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Policy Number
                      </label>
                      <input
                        type="text"
                        value={policy.policyNumber}
                        onChange={(e) => updateLifeInsurance(policy.id, 'policyNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Coverage Amount
                      </label>
                      <input
                        type="number"
                        value={policy.coverageAmount}
                        onChange={(e) => updateLifeInsurance(policy.id, 'coverageAmount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Annual Premium
                      </label>
                      <input
                        type="number"
                        value={policy.premium}
                        onChange={(e) => updateLifeInsurance(policy.id, 'premium', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Beneficiary
                      </label>
                      <input
                        type="text"
                        value={policy.beneficiary}
                        onChange={(e) => updateLifeInsurance(policy.id, 'beneficiary', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Policy Start Date
                      </label>
                      <input
                        type="date"
                        value={policy.policyStartDate}
                        onChange={(e) => updateLifeInsurance(policy.id, 'policyStartDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Policy End Date
                      </label>
                      <input
                        type="date"
                        value={policy.policyEndDate}
                        onChange={(e) => updateLifeInsurance(policy.id, 'policyEndDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={policy.notes}
                      onChange={(e) => updateLifeInsurance(policy.id, 'notes', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional notes about this policy..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Financial Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Net Income</h3>
              <p className="text-3xl font-bold">${analysis.netIncome.toLocaleString()}</p>
              <p className="text-green-100 text-sm">Annual</p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Net Worth</h3>
              <p className="text-3xl font-bold">${analysis.netWorth.toLocaleString()}</p>
              <p className="text-blue-100 text-sm">Total</p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Financial Goals</h3>
              <p className="text-3xl font-bold">{analysis.financialGoals.length}</p>
              <p className="text-purple-100 text-sm">Active</p>
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Life Insurance</h3>
              <p className="text-3xl font-bold">
                ${analysis.lifeInsurance.reduce((sum, policy) => sum + policy.coverageAmount, 0).toLocaleString()}
              </p>
              <p className="text-indigo-100 text-sm">Total Coverage</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default FinancialAnalysis;