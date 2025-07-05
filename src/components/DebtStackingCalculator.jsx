import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiCreditCard, FiCalculator, FiTrendingDown, FiPlus, FiTrash2 } = FiIcons;

function DebtStackingCalculator() {
  const [debts, setDebts] = useState([
    { id: 1, name: 'Credit Card 1', balance: 5000, minPayment: 150, interestRate: 18.99 },
    { id: 2, name: 'Credit Card 2', balance: 3000, minPayment: 75, interestRate: 22.99 },
    { id: 3, name: 'Personal Loan', balance: 10000, minPayment: 250, interestRate: 12.99 }
  ]);

  const [extraPayment, setExtraPayment] = useState(200);
  const [strategy, setStrategy] = useState('avalanche');
  const [results, setResults] = useState(null);

  const addDebt = () => {
    const newDebt = {
      id: Date.now(),
      name: `Debt ${debts.length + 1}`,
      balance: 0,
      minPayment: 0,
      interestRate: 0
    };
    setDebts([...debts, newDebt]);
  };

  const removeDebt = (id) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };

  const updateDebt = (id, field, value) => {
    setDebts(debts.map(debt => 
      debt.id === id ? { ...debt, [field]: parseFloat(value) || 0 } : debt
    ));
  };

  const calculateDebtPayoff = () => {
    if (debts.length === 0) return;

    const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minPayment, 0);
    const totalExtraPayment = extraPayment;
    const totalPayment = totalMinPayment + totalExtraPayment;

    // Sort debts based on strategy
    const sortedDebts = [...debts].sort((a, b) => {
      if (strategy === 'avalanche') {
        return b.interestRate - a.interestRate; // Highest interest first
      } else {
        return a.balance - b.balance; // Lowest balance first (snowball)
      }
    });

    // Calculate payoff schedule
    const payoffSchedule = [];
    let remainingDebts = sortedDebts.map(debt => ({ ...debt }));
    let month = 0;
    let totalInterestPaid = 0;

    while (remainingDebts.length > 0 && month < 600) { // Max 50 years
      month++;
      let extraPaymentRemaining = totalExtraPayment;

      // Apply minimum payments and interest
      remainingDebts.forEach(debt => {
        const monthlyInterest = (debt.balance * debt.interestRate / 100) / 12;
        totalInterestPaid += monthlyInterest;
        debt.balance += monthlyInterest;
        debt.balance -= debt.minPayment;
        debt.balance = Math.max(0, debt.balance);
      });

      // Apply extra payment to priority debt
      if (extraPaymentRemaining > 0 && remainingDebts.length > 0) {
        const priorityDebt = remainingDebts[0];
        const extraApplied = Math.min(extraPaymentRemaining, priorityDebt.balance);
        priorityDebt.balance -= extraApplied;
        extraPaymentRemaining -= extraApplied;
      }

      // Record monthly snapshot
      payoffSchedule.push({
        month,
        totalBalance: remainingDebts.reduce((sum, debt) => sum + debt.balance, 0),
        debts: remainingDebts.map(debt => ({ ...debt }))
      });

      // Remove paid off debts
      remainingDebts = remainingDebts.filter(debt => debt.balance > 0.01);
    }

    const totalOriginalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const payoffTime = payoffSchedule.length;
    const totalPaid = totalOriginalBalance + totalInterestPaid;

    setResults({
      payoffTime,
      totalInterestPaid,
      totalPaid,
      totalOriginalBalance,
      payoffSchedule,
      strategy
    });
  };

  const getPayoffChartOption = () => {
    if (!results) return {};

    const months = results.payoffSchedule.map(item => item.month);
    const balances = results.payoffSchedule.map(item => item.totalBalance);

    return {
      title: {
        text: 'Debt Payoff Progress',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: 'Month {b}: ${c}'
      },
      xAxis: {
        type: 'category',
        data: months,
        name: 'Months'
      },
      yAxis: {
        type: 'value',
        name: 'Balance ($)',
        axisLabel: {
          formatter: '${value}'
        }
      },
      series: [
        {
          name: 'Remaining Balance',
          type: 'line',
          data: balances,
          smooth: true,
          itemStyle: {
            color: '#EF4444'
          },
          areaStyle: {
            color: 'rgba(239, 68, 68, 0.1)'
          }
        }
      ]
    };
  };

  const getDebtBreakdownOption = () => {
    const data = debts.map(debt => ({
      value: debt.balance,
      name: debt.name
    }));

    return {
      title: {
        text: 'Current Debt Breakdown',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: ${c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: 'Debt',
          type: 'pie',
          radius: '50%',
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
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
                Debt Stacking Calculator
              </h1>
              <p className="text-gray-600">Optimize your debt repayment strategy</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Debt Input */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiCreditCard} className="text-2xl text-red-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Your Debts</h2>
                </div>
                <button
                  onClick={addDebt}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <SafeIcon icon={FiPlus} />
                  <span>Add Debt</span>
                </button>
              </div>

              <div className="space-y-4">
                {debts.map((debt) => (
                  <div key={debt.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <input
                        type="text"
                        value={debt.name}
                        onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                        className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                      />
                      <button
                        onClick={() => removeDebt(debt.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <SafeIcon icon={FiTrash2} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Balance
                        </label>
                        <input
                          type="number"
                          value={debt.balance}
                          onChange={(e) => updateDebt(debt.id, 'balance', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Payment
                        </label>
                        <input
                          type="number"
                          value={debt.minPayment}
                          onChange={(e) => updateDebt(debt.id, 'minPayment', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Interest Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={debt.interestRate}
                          onChange={(e) => updateDebt(debt.id, 'interestRate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Monthly Payment
                  </label>
                  <input
                    type="number"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repayment Strategy
                  </label>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="avalanche">Debt Avalanche (Highest Interest First)</option>
                    <option value="snowball">Debt Snowball (Lowest Balance First)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={calculateDebtPayoff}
                className="w-full mt-6 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiCalculator} />
                <span>Calculate Payoff Strategy</span>
              </button>
            </motion.div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <SafeIcon icon={FiTrendingDown} className="text-xl text-green-500" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Payoff Results
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1">Time to Pay Off</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {results.payoffTime} months
                    </p>
                    <p className="text-sm text-blue-600">
                      ({Math.floor(results.payoffTime / 12)} years, {results.payoffTime % 12} months)
                    </p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600 mb-1">Total Interest Paid</p>
                    <p className="text-2xl font-bold text-red-700">
                      ${results.totalInterestPaid.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Amount Paid</p>
                    <p className="text-2xl font-bold text-gray-700">
                      ${results.totalPaid.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 mb-1">Strategy Used</p>
                    <p className="font-semibold text-green-700 capitalize">
                      {results.strategy === 'avalanche' ? 'Debt Avalanche' : 'Debt Snowball'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current Debt Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Debt:</span>
                  <span className="font-semibold">
                    ${debts.reduce((sum, debt) => sum + debt.balance, 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Min Monthly Payment:</span>
                  <span className="font-semibold">
                    ${debts.reduce((sum, debt) => sum + debt.minPayment, 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Extra Payment:</span>
                  <span className="font-semibold">${extraPayment.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-900 font-semibold">Total Monthly:</span>
                  <span className="font-bold text-lg">
                    ${(debts.reduce((sum, debt) => sum + debt.minPayment, 0) + extraPayment).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Charts */}
        {results && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <ReactECharts option={getPayoffChartOption()} style={{ height: '400px' }} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <ReactECharts option={getDebtBreakdownOption()} style={{ height: '400px' }} />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DebtStackingCalculator;