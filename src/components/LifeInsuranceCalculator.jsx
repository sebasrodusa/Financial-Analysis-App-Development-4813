import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiShield, FiCalculator, FiInfo } = FiIcons;

function LifeInsuranceCalculator() {
  const [formData, setFormData] = useState({
    age: 35,
    annualIncome: 75000,
    existingCoverage: 0,
    mortgage: 300000,
    otherDebts: 50000,
    childrenCount: 2,
    yearsToSupport: 18,
    spouseIncome: 50000,
    emergencyFund: 6,
    educationCosts: 100000,
    finalExpenses: 15000,
    method: 'income-replacement'
  });

  const [result, setResult] = useState(null);

  const calculateInsurance = () => {
    let coverage = 0;
    
    if (formData.method === 'income-replacement') {
      // Income replacement method (10x annual income)
      coverage = formData.annualIncome * 10;
    } else if (formData.method === 'needs-analysis') {
      // Needs analysis method
      const incomeReplacement = formData.annualIncome * formData.yearsToSupport;
      const debts = formData.mortgage + formData.otherDebts;
      const emergencyFund = formData.annualIncome * (formData.emergencyFund / 12);
      const education = formData.educationCosts;
      const finalExpenses = formData.finalExpenses;
      
      const totalNeeds = incomeReplacement + debts + emergencyFund + education + finalExpenses;
      const existingAssets = formData.existingCoverage + (formData.spouseIncome * 5);
      
      coverage = Math.max(0, totalNeeds - existingAssets);
    } else if (formData.method === 'dime-method') {
      // DIME method (Debt + Income + Mortgage + Education)
      coverage = formData.otherDebts + (formData.annualIncome * 5) + formData.mortgage + formData.educationCosts;
    }

    const monthlyPremium = calculatePremium(coverage, formData.age);
    
    setResult({
      coverage: Math.round(coverage),
      monthlyPremium: Math.round(monthlyPremium),
      annualPremium: Math.round(monthlyPremium * 12),
      method: formData.method
    });
  };

  const calculatePremium = (coverage, age) => {
    // Simplified premium calculation (actual rates vary by insurer)
    const baseRate = 0.0012; // Base rate per $1000 of coverage
    const ageMultiplier = 1 + (age - 25) * 0.02; // Age factor
    return (coverage / 1000) * baseRate * ageMultiplier;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const getComparisonChartOption = () => {
    if (!result) return {};
    
    const methods = ['Income Replacement', 'Needs Analysis', 'DIME Method'];
    const coverages = [
      formData.annualIncome * 10,
      result.coverage,
      formData.otherDebts + (formData.annualIncome * 5) + formData.mortgage + formData.educationCosts
    ];

    return {
      title: {
        text: 'Coverage Comparison by Method',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: ${c}'
      },
      xAxis: {
        type: 'category',
        data: methods,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '${value}'
        }
      },
      series: [
        {
          name: 'Coverage Amount',
          type: 'bar',
          data: coverages,
          itemStyle: {
            color: '#3B82F6'
          }
        }
      ]
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <SafeIcon icon={FiArrowLeft} className="text-xl text-gray-700" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Life Insurance Calculator
              </h1>
              <p className="text-gray-600">Calculate your optimal life insurance coverage</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <SafeIcon icon={FiShield} className="text-2xl text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900">Insurance Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Income
                  </label>
                  <input
                    type="number"
                    value={formData.annualIncome}
                    onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Coverage
                  </label>
                  <input
                    type="number"
                    value={formData.existingCoverage}
                    onChange={(e) => handleInputChange('existingCoverage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mortgage Balance
                  </label>
                  <input
                    type="number"
                    value={formData.mortgage}
                    onChange={(e) => handleInputChange('mortgage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Debts
                  </label>
                  <input
                    type="number"
                    value={formData.otherDebts}
                    onChange={(e) => handleInputChange('otherDebts', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Children
                  </label>
                  <input
                    type="number"
                    value={formData.childrenCount}
                    onChange={(e) => handleInputChange('childrenCount', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years to Support Family
                  </label>
                  <input
                    type="number"
                    value={formData.yearsToSupport}
                    onChange={(e) => handleInputChange('yearsToSupport', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spouse Annual Income
                  </label>
                  <input
                    type="number"
                    value={formData.spouseIncome}
                    onChange={(e) => handleInputChange('spouseIncome', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Fund (Months)
                  </label>
                  <input
                    type="number"
                    value={formData.emergencyFund}
                    onChange={(e) => handleInputChange('emergencyFund', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education Costs
                  </label>
                  <input
                    type="number"
                    value={formData.educationCosts}
                    onChange={(e) => handleInputChange('educationCosts', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final Expenses
                  </label>
                  <input
                    type="number"
                    value={formData.finalExpenses}
                    onChange={(e) => handleInputChange('finalExpenses', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calculation Method
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="income-replacement">Income Replacement (10x)</option>
                    <option value="needs-analysis">Needs Analysis</option>
                    <option value="dime-method">DIME Method</option>
                  </select>
                </div>
              </div>

              <button
                onClick={calculateInsurance}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiCalculator} />
                <span>Calculate Insurance Needs</span>
              </button>
            </motion.div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Recommended Coverage
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1">Coverage Amount</p>
                    <p className="text-3xl font-bold text-blue-700">
                      ${result.coverage.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 mb-1">Est. Monthly Premium</p>
                    <p className="text-2xl font-bold text-green-700">
                      ${result.monthlyPremium.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Est. Annual Premium</p>
                    <p className="text-xl font-bold text-gray-700">
                      ${result.annualPremium.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600 mb-1">Method Used</p>
                    <p className="font-semibold text-yellow-700 capitalize">
                      {result.method.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Information Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <SafeIcon icon={FiInfo} className="text-xl text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Calculation Methods
                </h3>
              </div>

              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Income Replacement</h4>
                  <p>Simple rule of thumb: 10x annual income</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Needs Analysis</h4>
                  <p>Comprehensive calculation based on specific financial needs and goals</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">DIME Method</h4>
                  <p>Debt + Income (5x) + Mortgage + Education costs</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Comparison Chart */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Method Comparison
            </h3>
            <ReactECharts option={getComparisonChartOption()} style={{ height: '400px' }} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default LifeInsuranceCalculator;