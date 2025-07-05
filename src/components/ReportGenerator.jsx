import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { useReactToPrint } from 'react-to-print';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import * as echarts from 'echarts';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useClient } from '../context/ClientContext';
import PDFReport from './PDFReport';

const { FiArrowLeft, FiDownload, FiPrinter, FiFileText, FiTarget, FiShield } = FiIcons;

function ReportGenerator() {
  const { id } = useParams();
  const { state } = useClient();
  const [client, setClient] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [chartImages, setChartImages] = useState({});
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

  // Enhanced chart generation for PDF with better visibility
  const generateChartImages = async () => {
    if (!analysis) return {};

    const images = {};
    
    try {
      // Create temporary chart container with specific styling
      const chartContainer = document.createElement('div');
      chartContainer.style.width = '800px';
      chartContainer.style.height = '600px';
      chartContainer.style.position = 'absolute';
      chartContainer.style.left = '-10000px';
      chartContainer.style.top = '-10000px';
      chartContainer.style.backgroundColor = '#ffffff';
      document.body.appendChild(chartContainer);

      // Generate Income Chart
      const incomeChart = echarts.init(chartContainer, null, {
        renderer: 'canvas',
        useDirtyRect: false
      });
      
      incomeChart.setOption(getPDFIncomeChartOption());
      await new Promise(resolve => setTimeout(resolve, 500)); // Longer wait for full render
      images.income = incomeChart.getDataURL({
        type: 'png',
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });

      // Generate Expenses Chart
      incomeChart.clear();
      incomeChart.setOption(getPDFExpensesChartOption());
      await new Promise(resolve => setTimeout(resolve, 500));
      images.expenses = incomeChart.getDataURL({
        type: 'png',
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });

      // Generate Assets Chart
      incomeChart.clear();
      incomeChart.setOption(getPDFAssetsChartOption());
      await new Promise(resolve => setTimeout(resolve, 500));
      images.assets = incomeChart.getDataURL({
        type: 'png',
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });

      // Generate Net Worth Chart
      incomeChart.clear();
      incomeChart.setOption(getPDFNetWorthChartOption());
      await new Promise(resolve => setTimeout(resolve, 500));
      images.netWorth = incomeChart.getDataURL({
        type: 'png',
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });

      // Cleanup
      incomeChart.dispose();
      document.body.removeChild(chartContainer);

      console.log('Generated chart images:', Object.keys(images));

    } catch (error) {
      console.error('Error generating chart images:', error);
    }

    return images;
  };

  // PDF-specific chart options with enhanced visibility
  const getPDFIncomeChartOption = () => {
    if (!analysis) return {};
    
    const data = [
      { value: analysis.income.primaryIncome, name: 'Primary Income' },
      { value: analysis.income.spouseIncome, name: 'Spouse Income' },
      { value: analysis.income.otherIncome, name: 'Other Income' }
    ].filter(item => item.value > 0);

    return {
      backgroundColor: '#ffffff',
      title: {
        text: 'Income Breakdown',
        left: 'center',
        top: 20,
        textStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#1F2937'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ${c} ({d}%)',
        textStyle: {
          fontSize: 14
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: 20,
        textStyle: {
          fontSize: 16,
          color: '#374151'
        }
      },
      series: [
        {
          name: 'Income',
          type: 'pie',
          radius: ['30%', '70%'],
          center: ['50%', '55%'],
          data: data,
          itemStyle: {
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          label: {
            show: true,
            formatter: '{b}\n${c}',
            fontSize: 14,
            fontWeight: 'bold',
            color: '#1F2937'
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          color: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']
        }
      ]
    };
  };

  const getPDFExpensesChartOption = () => {
    if (!analysis) return {};
    
    const data = [
      { value: analysis.expenses.housing, name: 'Housing' },
      { value: analysis.expenses.transportation, name: 'Transportation' },
      { value: analysis.expenses.food, name: 'Food' },
      { value: analysis.expenses.healthcare, name: 'Healthcare' },
      { value: analysis.expenses.insurance, name: 'Insurance' },
      { value: analysis.expenses.utilities, name: 'Utilities' },
      { value: analysis.expenses.entertainment, name: 'Entertainment' },
      { value: analysis.expenses.other, name: 'Other' }
    ].filter(item => item.value > 0);

    return {
      backgroundColor: '#ffffff',
      title: {
        text: 'Expenses Breakdown',
        left: 'center',
        top: 20,
        textStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#1F2937'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ${c} ({d}%)',
        textStyle: {
          fontSize: 14
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: 20,
        textStyle: {
          fontSize: 16,
          color: '#374151'
        }
      },
      series: [
        {
          name: 'Expenses',
          type: 'pie',
          radius: ['30%', '70%'],
          center: ['50%', '55%'],
          data: data,
          itemStyle: {
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          label: {
            show: true,
            formatter: '{b}\n${c}',
            fontSize: 14,
            fontWeight: 'bold',
            color: '#1F2937'
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          color: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']
        }
      ]
    };
  };

  const getPDFAssetsChartOption = () => {
    if (!analysis) return {};
    
    const data = [
      { value: analysis.assets.cash, name: 'Cash' },
      { value: analysis.assets.investments, name: 'Investments' },
      { value: analysis.assets.retirement, name: 'Retirement' },
      { value: analysis.assets.realEstate, name: 'Real Estate' },
      { value: analysis.assets.personal, name: 'Personal' }
    ].filter(item => item.value > 0);

    return {
      backgroundColor: '#ffffff',
      title: {
        text: 'Assets Breakdown',
        left: 'center',
        top: 20,
        textStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#1F2937'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ${c} ({d}%)',
        textStyle: {
          fontSize: 14
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: 20,
        textStyle: {
          fontSize: 16,
          color: '#374151'
        }
      },
      series: [
        {
          name: 'Assets',
          type: 'pie',
          radius: ['30%', '70%'],
          center: ['50%', '55%'],
          data: data,
          itemStyle: {
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          label: {
            show: true,
            formatter: '{b}\n${c}',
            fontSize: 14,
            fontWeight: 'bold',
            color: '#1F2937'
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          color: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']
        }
      ]
    };
  };

  const getPDFNetWorthChartOption = () => {
    if (!analysis) return {};
    
    return {
      backgroundColor: '#ffffff',
      title: {
        text: 'Net Worth Overview',
        left: 'center',
        top: 20,
        textStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#1F2937'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params) {
          return params.map(param => `${param.seriesName}: $${param.value.toLocaleString()}`).join('<br/>');
        },
        textStyle: {
          fontSize: 14
        }
      },
      legend: {
        data: ['Assets', 'Liabilities'],
        bottom: 20,
        textStyle: {
          fontSize: 16,
          color: '#374151'
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '20%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['Financial Position'],
        axisLabel: {
          fontSize: 16,
          color: '#374151'
        },
        axisLine: {
          lineStyle: {
            color: '#9CA3AF'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: function(value) {
            return '$' + (value / 1000).toFixed(0) + 'K';
          },
          fontSize: 14,
          color: '#374151'
        },
        axisLine: {
          lineStyle: {
            color: '#9CA3AF'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#E5E7EB'
          }
        }
      },
      series: [
        {
          name: 'Assets',
          type: 'bar',
          data: [analysis.assets.totalAssets],
          itemStyle: {
            color: '#10B981',
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          barWidth: '40%',
          label: {
            show: true,
            position: 'top',
            formatter: '${c}',
            fontSize: 14,
            fontWeight: 'bold',
            color: '#1F2937'
          }
        },
        {
          name: 'Liabilities',
          type: 'bar',
          data: [analysis.liabilities.totalLiabilities],
          itemStyle: {
            color: '#EF4444',
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          barWidth: '40%',
          label: {
            show: true,
            position: 'top',
            formatter: '${c}',
            fontSize: 14,
            fontWeight: 'bold',
            color: '#1F2937'
          }
        }
      ]
    };
  };

  const handleDownloadPDF = async () => {
    // Ensure we have both client and analysis data before proceeding
    if (!client || !analysis) {
      alert('Missing client or analysis data. Please ensure both are loaded before generating PDF.');
      return;
    }

    // Additional validation to ensure data is properly structured
    if (!client.firstName || !client.lastName || !client.email) {
      alert('Incomplete client data. Please ensure client information is complete.');
      return;
    }

    if (!analysis.income || !analysis.expenses || !analysis.assets || !analysis.liabilities) {
      alert('Incomplete analysis data. Please ensure financial analysis is complete.');
      return;
    }
    
    setIsGeneratingPDF(true);
    
    try {
      console.log('Generating chart images...');
      const chartImagesData = await generateChartImages();
      setChartImages(chartImagesData);
      
      console.log('Generated chart images with keys:', Object.keys(chartImagesData));
      
      // Generate PDF using react-pdf
      const blob = await pdf(<PDFReport client={client} analysis={analysis} chartImages={chartImagesData} />).toBlob();
      
      // Save the PDF file
      saveAs(blob, `Financial_Report_${client.firstName}_${client.lastName}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please check the console for details and try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
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

  // Regular chart options for web display (unchanged)
  const getIncomeChartOption = () => {
    if (!analysis) return {};
    
    return {
      title: {
        text: 'Income Breakdown',
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1F2937'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: ${c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle'
      },
      series: [
        {
          name: 'Income',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
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
          },
          label: {
            formatter: '{b}: ${c}'
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
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1F2937'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: ${c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle'
      },
      series: [
        {
          name: 'Expenses',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
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
          },
          label: {
            formatter: '{b}: ${c}'
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
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1F2937'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params) {
          return params.map(param => `${param.seriesName}: $${param.value.toLocaleString()}`).join('<br/>');
        }
      },
      legend: {
        data: ['Assets', 'Liabilities'],
        top: 'bottom'
      },
      xAxis: {
        type: 'category',
        data: ['Financial Position'],
        axisLabel: {
          fontSize: 14
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: function(value) {
            return '$' + (value / 1000) + 'K';
          },
          fontSize: 12
        }
      },
      series: [
        {
          name: 'Assets',
          type: 'bar',
          data: [analysis.assets.totalAssets],
          itemStyle: {
            color: '#10B981'
          },
          barWidth: '40%'
        },
        {
          name: 'Liabilities',
          type: 'bar',
          data: [analysis.liabilities.totalLiabilities],
          itemStyle: {
            color: '#EF4444'
          },
          barWidth: '40%'
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
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1F2937'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: ${c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle'
      },
      series: [
        {
          name: 'Assets',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
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
          },
          label: {
            formatter: '{b}: ${c}'
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
                disabled={isGeneratingPDF}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SafeIcon icon={FiDownload} />
                <span>{isGeneratingPDF ? 'Generating...' : 'Download PDF'}</span>
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