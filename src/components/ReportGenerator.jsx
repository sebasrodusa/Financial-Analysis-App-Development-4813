import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useClient } from '../context/ClientContext';

const { FiArrowLeft, FiDownload, FiPrinter, FiFileText, FiTarget, FiShield } = FiIcons;

function ReportGenerator() {
  const { id } = useParams();
  const { state } = useClient();
  const [client, setClient] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const reportRef = useRef();

  useEffect(() => {
    const foundClient = state.clients.find(c => c.id === id);
    const foundAnalysis = state.analyses.find(a => a.clientId === id);
    setClient(foundClient);
    setAnalysis(foundAnalysis);
  }, [id, state.clients, state.analyses]);

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Financial Report - ${client?.firstName} ${client?.lastName}`,
  });

  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Financial_Report_${client?.firstName}_${client?.lastName}.pdf`);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getIncomeChartOption = () => {
    if (!analysis) return {};
    
    return {
      title: {
        text: 'Income Breakdown',
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
          name: 'Income',
          type: 'pie',
          radius: '50%',
          data: [
            { value: analysis.income.primaryIncome, name: 'Primary Income' },
            { value: analysis.income.spouseIncome, name: 'Spouse Income' },
            { value: analysis.income.otherIncome, name: 'Other Income' }
          ].filter(item => item.value > 0),
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

  const getExpensesChartOption = () => {
    if (!analysis) return {};
    
    return {
      title: {
        text: 'Expenses Breakdown',
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
          name: 'Expenses',
          type: 'pie',
          radius: '50%',
          data: [
            { value: analysis.expenses.housing, name: 'Housing' },
            { value: analysis.expenses.transportation, name: 'Transportation' },
            { value: analysis.expenses.food, name: 'Food' },
            { value: analysis.expenses.healthcare, name: 'Healthcare' },
            { value: analysis.expenses.insurance, name: 'Insurance' },
            { value: analysis.expenses.utilities, name: 'Utilities' },
            { value: analysis.expenses.entertainment, name: 'Entertainment' },
            { value: analysis.expenses.other, name: 'Other' }
          ].filter(item => item.value > 0),
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

  const getNetWorthChartOption = () => {
    if (!analysis) return {};
    
    return {
      title: {
        text: 'Net Worth Overview',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['Assets', 'Liabilities']
      },
      xAxis: {
        type: 'category',
        data: ['Financial Position']
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '${value}'
        }
      },
      series: [
        {
          name: 'Assets',
          type: 'bar',
          data: [analysis.assets.totalAssets],
          itemStyle: {
            color: '#10B981'
          }
        },
        {
          name: 'Liabilities',
          type: 'bar',
          data: [analysis.liabilities.totalLiabilities],
          itemStyle: {
            color: '#EF4444'
          }
        }
      ]
    };
  };

  const getAssetsBreakdownOption = () => {
    if (!analysis) return {};
    
    return {
      title: {
        text: 'Assets Breakdown',
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
          name: 'Assets',
          type: 'pie',
          radius: '50%',
          data: [
            { value: analysis.assets.cash, name: 'Cash' },
            { value: analysis.assets.investments, name: 'Investments' },
            { value: analysis.assets.retirement, name: 'Retirement' },
            { value: analysis.assets.realEstate, name: 'Real Estate' },
            { value: analysis.assets.personal, name: 'Personal' }
          ].filter(item => item.value > 0),
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

  if (!client || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <SafeIcon icon={FiFileText} className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {!client ? 'Client not found' : 'No analysis data available'}
          </h2>
          <p className="text-gray-600 mb-4">
            {!client ? 'The requested client could not be found.' : 'Please create a financial analysis first.'}
          </p>
          <Link 
            to={!client ? "/" : `/analysis/${id}`}
            className="text-blue-600 hover:text-blue-800"
          >
            {!client ? 'Return to Dashboard' : 'Create Analysis'}
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
                  Financial Report
                </h1>
                <p className="text-gray-600">{client.firstName} {client.lastName}</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <SafeIcon icon={FiPrinter} />
                <span>Print</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <SafeIcon icon={FiDownload} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Report Content */}
        <div ref={reportRef} className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Report Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">Financial Analysis Report</h1>
              <h2 className="text-2xl mb-4">{client.firstName} {client.lastName}</h2>
              <p className="text-blue-100">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Client Information */}
          <div className="p-8 border-b border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p><strong>Name:</strong> {client.firstName} {client.lastName}</p>
                <p><strong>Email:</strong> {client.email}</p>
                <p><strong>Phone:</strong> {client.phone || 'Not provided'}</p>
                <p><strong>Date of Birth:</strong> {client.dateOfBirth ? `${new Date(client.dateOfBirth).toLocaleDateString()} (Age: ${calculateAge(client.dateOfBirth)})` : 'Not provided'}</p>
                <p><strong>Marital Status:</strong> {client.maritalStatus}</p>
              </div>
              <div>
                <p><strong>Occupation:</strong> {client.occupation || 'Not provided'}</p>
                <p><strong>Employer:</strong> {client.employer || 'Not provided'}</p>
                <p><strong>Address:</strong> {client.address ? `${client.address}, ${client.city}, ${client.state} ${client.zipCode}` : 'Not provided'}</p>
                {client.children && client.children.length > 0 && (
                  <p><strong>Children:</strong> {client.children.length}</p>
                )}
              </div>
            </div>

            {/* Spouse Information */}
            {client.maritalStatus === 'married' && (client.spouseFirstName || client.spouseLastName) && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Spouse Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p><strong>Name:</strong> {client.spouseFirstName} {client.spouseLastName}</p>
                    <p><strong>Date of Birth:</strong> {client.spouseDateOfBirth ? `${new Date(client.spouseDateOfBirth).toLocaleDateString()} (Age: ${calculateAge(client.spouseDateOfBirth)})` : 'Not provided'}</p>
                    <p><strong>Phone:</strong> {client.spousePhone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p><strong>Email:</strong> {client.spouseEmail || 'Not provided'}</p>
                    <p><strong>Occupation:</strong> {client.spouseOccupation || 'Not provided'}</p>
                    <p><strong>Employer:</strong> {client.spouseEmployer || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Children Information */}
            {client.children && client.children.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Children</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {client.children.map((child, index) => (
                    <div key={child.id || index} className="bg-gray-50 rounded-lg p-3">
                      <p><strong>{child.firstName} {child.lastName}</strong></p>
                      {child.dateOfBirth && (
                        <p className="text-sm text-gray-600">
                          Born: {new Date(child.dateOfBirth).toLocaleDateString()} (Age: {calculateAge(child.dateOfBirth)})
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Financial Summary */}
          <div className="p-8 border-b border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Financial Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <h4 className="text-lg font-semibold text-green-800 mb-2">Total Income</h4>
                <p className="text-3xl font-bold text-green-600">${analysis.income.totalIncome.toLocaleString()}</p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg text-center">
                <h4 className="text-lg font-semibold text-red-800 mb-2">Total Expenses</h4>
                <p className="text-3xl font-bold text-red-600">${analysis.expenses.totalExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">Net Income</h4>
                <p className="text-3xl font-bold text-blue-600">${analysis.netIncome.toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <h4 className="text-lg font-semibold text-purple-800 mb-2">Net Worth</h4>
                <p className="text-3xl font-bold text-purple-600">${analysis.netWorth.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Financial Goals */}
          {analysis.financialGoals && analysis.financialGoals.length > 0 && (
            <div className="p-8 border-b border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <SafeIcon icon={FiTarget} className="text-purple-500 mr-2" />
                Financial Goals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.financialGoals.map((goal, index) => (
                  <div key={goal.id || index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                        goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {goal.priority} priority
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target:</span>
                        <span className="font-medium">${goal.targetAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current:</span>
                        <span className="font-medium">${goal.currentAmount.toLocaleString()}</span>
                      </div>
                      {goal.targetDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Target Date:</span>
                          <span className="font-medium">{new Date(goal.targetDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ 
                            width: `${goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0}%` 
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 text-center">
                        {goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0}% Complete
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Life Insurance */}
          {analysis.lifeInsurance && analysis.lifeInsurance.length > 0 && (
            <div className="p-8 border-b border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <SafeIcon icon={FiShield} className="text-blue-500 mr-2" />
                Life Insurance Policies
              </h3>
              <div className="space-y-4">
                {analysis.lifeInsurance.map((policy, index) => (
                  <div key={policy.id || index} className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{policy.policyType} Life Insurance</h4>
                        <p className="text-gray-600">{policy.insuranceCompany}</p>
                        {policy.policyNumber && <p className="text-sm text-gray-500">Policy: {policy.policyNumber}</p>}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Coverage Amount</p>
                        <p className="font-semibold text-lg">${policy.coverageAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Annual Premium</p>
                        <p className="font-semibold">${policy.premium.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Beneficiary</p>
                        <p className="font-semibold">{policy.beneficiary || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-900">Total Life Insurance Coverage:</span>
                    <span className="text-2xl font-bold text-blue-700">
                      ${analysis.lifeInsurance.reduce((sum, policy) => sum + policy.coverageAmount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Visual Analysis</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <ReactECharts option={getIncomeChartOption()} style={{ height: '400px' }} />
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ReactECharts option={getExpensesChartOption()} style={{ height: '400px' }} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <ReactECharts option={getAssetsBreakdownOption()} style={{ height: '400px' }} />
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ReactECharts option={getNetWorthChartOption()} style={{ height: '400px' }} />
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="p-8 border-t border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Detailed Breakdown</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Income Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Primary Income:</span>
                    <span className="font-medium">${analysis.income.primaryIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spouse Income:</span>
                    <span className="font-medium">${analysis.income.spouseIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Income:</span>
                    <span className="font-medium">${analysis.income.otherIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold">${analysis.income.totalIncome.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Expense Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Housing:</span>
                    <span className="font-medium">${analysis.expenses.housing.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transportation:</span>
                    <span className="font-medium">${analysis.expenses.transportation.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Food:</span>
                    <span className="font-medium">${analysis.expenses.food.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Healthcare:</span>
                    <span className="font-medium">${analysis.expenses.healthcare.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance:</span>
                    <span className="font-medium">${analysis.expenses.insurance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilities:</span>
                    <span className="font-medium">${analysis.expenses.utilities.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entertainment:</span>
                    <span className="font-medium">${analysis.expenses.entertainment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other:</span>
                    <span className="font-medium">${analysis.expenses.other.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold">${analysis.expenses.totalExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Asset Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cash:</span>
                    <span className="font-medium">${analysis.assets.cash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Investments:</span>
                    <span className="font-medium">${analysis.assets.investments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retirement:</span>
                    <span className="font-medium">${analysis.assets.retirement.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Real Estate:</span>
                    <span className="font-medium">${analysis.assets.realEstate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Personal:</span>
                    <span className="font-medium">${analysis.assets.personal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold">${analysis.assets.totalAssets.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Liability Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Mortgage:</span>
                    <span className="font-medium">${analysis.liabilities.mortgage.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credit Cards:</span>
                    <span className="font-medium">${analysis.liabilities.creditCards.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loans:</span>
                    <span className="font-medium">${analysis.liabilities.loans.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other:</span>
                    <span className="font-medium">${analysis.liabilities.other.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold">${analysis.liabilities.totalLiabilities.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 text-center text-gray-600">
            <p>This report was generated on {new Date().toLocaleDateString()} for financial planning purposes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportGenerator;