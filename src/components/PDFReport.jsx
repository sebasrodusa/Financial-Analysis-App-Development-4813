import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Use system fonts instead of external fonts
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0F2FE',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerDate: {
    fontSize: 10,
    color: '#BFDBFE',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    border: '1 solid #E5E7EB',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: '1 solid #E5E7EB',
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 10,
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  rowLabel: {
    fontSize: 10,
    color: '#6B7280',
    flex: 1,
  },
  rowValue: {
    fontSize: 10,
    color: '#111827',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  gridItem: {
    width: '48%',
    marginBottom: 8,
    marginRight: '2%',
  },
  summaryCard: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  summaryCardTitle: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 3,
  },
  summaryCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  goalCard: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    border: '1 solid #E5E7EB',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  goalName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  goalPriority: {
    fontSize: 8,
    padding: '2 6',
    borderRadius: 10,
    color: '#ffffff',
  },
  goalDetails: {
    marginTop: 5,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
  insurancePolicy: {
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    border: '1 solid #BFDBFE',
  },
  policyHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 5,
  },
  policyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  policyItem: {
    width: '50%',
    marginBottom: 3,
  },
  totalCard: {
    backgroundColor: '#DBEAFE',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  childCard: {
    backgroundColor: '#FAF5FF',
    padding: 8,
    borderRadius: 6,
    marginBottom: 5,
    border: '1 solid #E9D5FF',
  },
  childName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  childDetails: {
    fontSize: 9,
    color: '#6B46C1',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 9,
    borderTop: '1 solid #E5E7EB',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 10,
    right: 30,
    color: '#6B7280',
    fontSize: 9,
  },
  chartContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  chartImage: {
    width: '100%',
    height: 300,
    objectFit: 'contain',
  },
  chartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chartGridItem: {
    width: '48%',
    marginBottom: 15,
  },
});

const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
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

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return '#EF4444';
    case 'medium': return '#F59E0B';
    case 'low': return '#10B981';
    default: return '#6B7280';
  }
};

// Helper function to calculate financial metrics
const calculateFinancialMetrics = (analysis) => {
  // Ensure we have valid numbers
  const totalIncome = analysis.income?.totalIncome || 0;
  const totalExpenses = analysis.expenses?.totalExpenses || 0;
  const totalAssets = analysis.assets?.totalAssets || 0;
  const totalLiabilities = analysis.liabilities?.totalLiabilities || 0;

  // Calculate net income (income - expenses)
  const netIncome = totalIncome - totalExpenses;
  
  // Calculate net worth (assets - liabilities)
  const netWorth = totalAssets - totalLiabilities;
  
  // Calculate debt-to-asset ratio
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  
  // Calculate savings rate (net income / total income)
  const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;
  
  // Calculate monthly net income
  const monthlyNetIncome = netIncome / 12;

  return {
    netIncome,
    netWorth,
    debtToAssetRatio,
    savingsRate,
    monthlyNetIncome,
    totalIncome,
    totalExpenses,
    totalAssets,
    totalLiabilities
  };
};

function PDFReport({ client, analysis, chartImages }) {
  // Ensure we have valid data before rendering
  if (!client || !analysis) {
    console.error('PDFReport: Missing client or analysis data');
    return null;
  }

  // Provide default values for potentially undefined properties
  const safeClient = {
    firstName: client.firstName || 'Unknown',
    lastName: client.lastName || 'Client',
    email: client.email || 'No email provided',
    phone: client.phone || null,
    dateOfBirth: client.dateOfBirth || null,
    maritalStatus: client.maritalStatus || 'Unknown',
    occupation: client.occupation || null,
    employer: client.employer || null,
    address: client.address || null,
    city: client.city || null,
    state: client.state || null,
    zipCode: client.zipCode || null,
    spouseFirstName: client.spouseFirstName || null,
    spouseLastName: client.spouseLastName || null,
    spouseDateOfBirth: client.spouseDateOfBirth || null,
    spousePhone: client.spousePhone || null,
    spouseEmail: client.spouseEmail || null,
    spouseOccupation: client.spouseOccupation || null,
    spouseEmployer: client.spouseEmployer || null,
    children: client.children || [],
  };

  const safeAnalysis = {
    income: {
      primaryIncome: analysis.income?.primaryIncome || 0,
      spouseIncome: analysis.income?.spouseIncome || 0,
      otherIncome: analysis.income?.otherIncome || 0,
      totalIncome: analysis.income?.totalIncome || 0,
    },
    expenses: {
      housing: analysis.expenses?.housing || 0,
      transportation: analysis.expenses?.transportation || 0,
      food: analysis.expenses?.food || 0,
      healthcare: analysis.expenses?.healthcare || 0,
      insurance: analysis.expenses?.insurance || 0,
      utilities: analysis.expenses?.utilities || 0,
      entertainment: analysis.expenses?.entertainment || 0,
      other: analysis.expenses?.other || 0,
      totalExpenses: analysis.expenses?.totalExpenses || 0,
    },
    assets: {
      cash: analysis.assets?.cash || 0,
      investments: analysis.assets?.investments || 0,
      retirement: analysis.assets?.retirement || 0,
      realEstate: analysis.assets?.realEstate || 0,
      personal: analysis.assets?.personal || 0,
      totalAssets: analysis.assets?.totalAssets || 0,
    },
    liabilities: {
      mortgage: analysis.liabilities?.mortgage || 0,
      creditCards: analysis.liabilities?.creditCards || 0,
      loans: analysis.liabilities?.loans || 0,
      other: analysis.liabilities?.other || 0,
      totalLiabilities: analysis.liabilities?.totalLiabilities || 0,
    },
    financialGoals: analysis.financialGoals || [],
    lifeInsurance: analysis.lifeInsurance || [],
  };

  // Calculate corrected financial metrics
  const metrics = calculateFinancialMetrics(safeAnalysis);
  const safeChartImages = chartImages || {};

  return (
    <Document>
      {/* Page 1: Header and Client Information */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Financial Analysis Report</Text>
          <Text style={styles.headerSubtitle}>
            {safeClient.firstName} {safeClient.lastName}
          </Text>
          <Text style={styles.headerDate}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Name:</Text>
                <Text style={styles.rowValue}>{safeClient.firstName} {safeClient.lastName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Email:</Text>
                <Text style={styles.rowValue}>{safeClient.email}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Phone:</Text>
                <Text style={styles.rowValue}>{safeClient.phone || 'Not provided'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Date of Birth:</Text>
                <Text style={styles.rowValue}>
                  {safeClient.dateOfBirth ? 
                    `${new Date(safeClient.dateOfBirth).toLocaleDateString()} (Age: ${calculateAge(safeClient.dateOfBirth)})` : 
                    'Not provided'
                  }
                </Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Marital Status:</Text>
                <Text style={styles.rowValue}>{safeClient.maritalStatus}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Occupation:</Text>
                <Text style={styles.rowValue}>{safeClient.occupation || 'Not provided'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Employer:</Text>
                <Text style={styles.rowValue}>{safeClient.employer || 'Not provided'}</Text>
              </View>
              {safeClient.children && safeClient.children.length > 0 && (
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Children:</Text>
                  <Text style={styles.rowValue}>{safeClient.children.length}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Address */}
          {safeClient.address && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.subsectionTitle}>Address</Text>
              <Text style={{ fontSize: 10, color: '#374151' }}>
                {safeClient.address}, {safeClient.city}, {safeClient.state} {safeClient.zipCode}
              </Text>
            </View>
          )}

          {/* Spouse Information */}
          {safeClient.maritalStatus === 'married' && (safeClient.spouseFirstName || safeClient.spouseLastName) && (
            <View style={{ marginTop: 15 }}>
              <Text style={styles.subsectionTitle}>Spouse Information</Text>
              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Name:</Text>
                    <Text style={styles.rowValue}>{safeClient.spouseFirstName} {safeClient.spouseLastName}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Date of Birth:</Text>
                    <Text style={styles.rowValue}>
                      {safeClient.spouseDateOfBirth ? 
                        `${new Date(safeClient.spouseDateOfBirth).toLocaleDateString()} (Age: ${calculateAge(safeClient.spouseDateOfBirth)})` : 
                        'Not provided'
                      }
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Phone:</Text>
                    <Text style={styles.rowValue}>{safeClient.spousePhone || 'Not provided'}</Text>
                  </View>
                </View>
                <View style={styles.gridItem}>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Email:</Text>
                    <Text style={styles.rowValue}>{safeClient.spouseEmail || 'Not provided'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Occupation:</Text>
                    <Text style={styles.rowValue}>{safeClient.spouseOccupation || 'Not provided'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Employer:</Text>
                    <Text style={styles.rowValue}>{safeClient.spouseEmployer || 'Not provided'}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Children Information */}
          {safeClient.children && safeClient.children.length > 0 && (
            <View style={{ marginTop: 15 }}>
              <Text style={styles.subsectionTitle}>Children</Text>
              {safeClient.children.map((child, index) => (
                <View key={child.id || index} style={styles.childCard}>
                  <Text style={styles.childName}>{child.firstName || 'Child'} {child.lastName || ''}</Text>
                  {child.dateOfBirth && (
                    <Text style={styles.childDetails}>
                      Born: {new Date(child.dateOfBirth).toLocaleDateString()} (Age: {calculateAge(child.dateOfBirth)})
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>

      {/* Page 2: Financial Summary */}
      <Page size="A4" style={styles.page}>
        {/* Financial Summary Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.grid}>
            <View style={[styles.gridItem, styles.summaryCard, { backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.summaryCardTitle, { color: '#166534' }]}>Total Income</Text>
              <Text style={[styles.summaryCardValue, { color: '#166534' }]}>
                {formatCurrency(metrics.totalIncome)}
              </Text>
            </View>
            <View style={[styles.gridItem, styles.summaryCard, { backgroundColor: '#FEF2F2' }]}>
              <Text style={[styles.summaryCardTitle, { color: '#991B1B' }]}>Total Expenses</Text>
              <Text style={[styles.summaryCardValue, { color: '#991B1B' }]}>
                {formatCurrency(metrics.totalExpenses)}
              </Text>
            </View>
            <View style={[styles.gridItem, styles.summaryCard, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.summaryCardTitle, { color: '#1E40AF' }]}>Net Income</Text>
              <Text style={[styles.summaryCardValue, { color: '#1E40AF' }]}>
                {formatCurrency(metrics.netIncome)}
              </Text>
            </View>
            <View style={[styles.gridItem, styles.summaryCard, { backgroundColor: '#FAF5FF' }]}>
              <Text style={[styles.summaryCardTitle, { color: '#7C3AED' }]}>Net Worth</Text>
              <Text style={[styles.summaryCardValue, { color: '#7C3AED' }]}>
                {formatCurrency(metrics.netWorth)}
              </Text>
            </View>
          </View>
        </View>

        {/* Income Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Income Details</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Primary Income:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.income.primaryIncome)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Spouse Income:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.income.spouseIncome)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Other Income:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.income.otherIncome)}</Text>
          </View>
          <View style={[styles.row, { borderTop: '1 solid #E5E7EB', paddingTop: 5, marginTop: 5 }]}>
            <Text style={[styles.rowLabel, { fontWeight: 'bold', color: '#111827' }]}>Total:</Text>
            <Text style={[styles.rowValue, { fontSize: 12 }]}>{formatCurrency(metrics.totalIncome)}</Text>
          </View>
        </View>

        {/* Expense Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense Details</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Housing:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.expenses.housing)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Transportation:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.expenses.transportation)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Food:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.expenses.food)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Healthcare:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.expenses.healthcare)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Insurance:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.expenses.insurance)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Utilities:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.expenses.utilities)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Entertainment:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.expenses.entertainment)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Other:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.expenses.other)}</Text>
          </View>
          <View style={[styles.row, { borderTop: '1 solid #E5E7EB', paddingTop: 5, marginTop: 5 }]}>
            <Text style={[styles.rowLabel, { fontWeight: 'bold', color: '#111827' }]}>Total:</Text>
            <Text style={[styles.rowValue, { fontSize: 12 }]}>{formatCurrency(metrics.totalExpenses)}</Text>
          </View>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>

      {/* Page 3: Assets and Liabilities */}
      <Page size="A4" style={styles.page}>
        {/* Assets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Asset Details</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Cash:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.assets.cash)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Investments:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.assets.investments)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Retirement:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.assets.retirement)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Real Estate:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.assets.realEstate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Personal:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.assets.personal)}</Text>
          </View>
          <View style={[styles.row, { borderTop: '1 solid #E5E7EB', paddingTop: 5, marginTop: 5 }]}>
            <Text style={[styles.rowLabel, { fontWeight: 'bold', color: '#111827' }]}>Total Assets:</Text>
            <Text style={[styles.rowValue, { fontSize: 12 }]}>{formatCurrency(metrics.totalAssets)}</Text>
          </View>
        </View>

        {/* Liabilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liability Details</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Mortgage:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.liabilities.mortgage)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Credit Cards:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.liabilities.creditCards)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Loans:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.liabilities.loans)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Other:</Text>
            <Text style={styles.rowValue}>{formatCurrency(safeAnalysis.liabilities.other)}</Text>
          </View>
          <View style={[styles.row, { borderTop: '1 solid #E5E7EB', paddingTop: 5, marginTop: 5 }]}>
            <Text style={[styles.rowLabel, { fontWeight: 'bold', color: '#111827' }]}>Total Liabilities:</Text>
            <Text style={[styles.rowValue, { fontSize: 12 }]}>{formatCurrency(metrics.totalLiabilities)}</Text>
          </View>
        </View>

        {/* Net Worth Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Net Worth Calculation</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Assets:</Text>
            <Text style={[styles.rowValue, { color: '#059669' }]}>{formatCurrency(metrics.totalAssets)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Liabilities:</Text>
            <Text style={[styles.rowValue, { color: '#DC2626' }]}>-{formatCurrency(metrics.totalLiabilities)}</Text>
          </View>
          <View style={[styles.row, { borderTop: '2 solid #374151', paddingTop: 8, marginTop: 8 }]}>
            <Text style={[styles.rowLabel, { fontWeight: 'bold', fontSize: 12, color: '#111827' }]}>Net Worth:</Text>
            <Text style={[styles.rowValue, { fontSize: 14, fontWeight: 'bold', color: metrics.netWorth >= 0 ? '#059669' : '#DC2626' }]}>
              {formatCurrency(metrics.netWorth)}
            </Text>
          </View>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>

      {/* Page 4: Visual Analysis */}
      {safeChartImages && Object.keys(safeChartImages).length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visual Financial Analysis</Text>
            <View style={styles.chartGrid}>
              {/* Income Breakdown */}
              {safeChartImages.income && (
                <View style={styles.chartGridItem}>
                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Income Breakdown</Text>
                    <Image style={styles.chartImage} src={safeChartImages.income} />
                  </View>
                </View>
              )}
              {/* Expenses Breakdown */}
              {safeChartImages.expenses && (
                <View style={styles.chartGridItem}>
                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Expenses Breakdown</Text>
                    <Image style={styles.chartImage} src={safeChartImages.expenses} />
                  </View>
                </View>
              )}
              {/* Assets Breakdown */}
              {safeChartImages.assets && (
                <View style={styles.chartGridItem}>
                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Assets Breakdown</Text>
                    <Image style={styles.chartImage} src={safeChartImages.assets} />
                  </View>
                </View>
              )}
              {/* Net Worth Overview */}
              {safeChartImages.netWorth && (
                <View style={styles.chartGridItem}>
                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Net Worth Overview</Text>
                    <Image style={styles.chartImage} src={safeChartImages.netWorth} />
                  </View>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
        </Page>
      )}

      {/* Page 5: Financial Goals (if any) */}
      {safeAnalysis.financialGoals && safeAnalysis.financialGoals.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financial Goals</Text>
            {safeAnalysis.financialGoals.map((goal, index) => (
              <View key={goal.id || index} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalName}>{goal.name || 'Unnamed Goal'}</Text>
                  <Text style={[styles.goalPriority, { backgroundColor: getPriorityColor(goal.priority) }]}>
                    {goal.priority || 'medium'} priority
                  </Text>
                </View>
                <View style={styles.goalDetails}>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Target Amount:</Text>
                    <Text style={styles.rowValue}>{formatCurrency(goal.targetAmount || 0)}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Current Amount:</Text>
                    <Text style={styles.rowValue}>{formatCurrency(goal.currentAmount || 0)}</Text>
                  </View>
                  {goal.targetDate && (
                    <View style={styles.row}>
                      <Text style={styles.rowLabel}>Target Date:</Text>
                      <Text style={styles.rowValue}>{new Date(goal.targetDate).toLocaleDateString()}</Text>
                    </View>
                  )}
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      { width: `${goal.targetAmount > 0 ? Math.min(((goal.currentAmount || 0) / goal.targetAmount) * 100, 100) : 0}%` }
                    ]} />
                  </View>
                  <Text style={{ fontSize: 9, color: '#6B7280', textAlign: 'center', marginTop: 3 }}>
                    {goal.targetAmount > 0 ? Math.round(((goal.currentAmount || 0) / goal.targetAmount) * 100) : 0}% Complete
                  </Text>
                  {goal.notes && (
                    <Text style={{ fontSize: 9, color: '#6B7280', marginTop: 5, fontStyle: 'italic' }}>
                      Notes: {goal.notes}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
        </Page>
      )}

      {/* Page 6: Life Insurance (if any) */}
      {safeAnalysis.lifeInsurance && safeAnalysis.lifeInsurance.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Life Insurance Policies</Text>
            {safeAnalysis.lifeInsurance.map((policy, index) => (
              <View key={policy.id || index} style={styles.insurancePolicy}>
                <Text style={styles.policyHeader}>
                  {policy.policyType || 'Life Insurance'} - {policy.insuranceCompany || 'Unknown Company'}
                </Text>
                <View style={styles.policyGrid}>
                  <View style={styles.policyItem}>
                    <Text style={styles.rowLabel}>Policy Number:</Text>
                    <Text style={styles.rowValue}>{policy.policyNumber || 'Not provided'}</Text>
                  </View>
                  <View style={styles.policyItem}>
                    <Text style={styles.rowLabel}>Coverage Amount:</Text>
                    <Text style={styles.rowValue}>{formatCurrency(policy.coverageAmount || 0)}</Text>
                  </View>
                  <View style={styles.policyItem}>
                    <Text style={styles.rowLabel}>Annual Premium:</Text>
                    <Text style={styles.rowValue}>{formatCurrency(policy.premium || 0)}</Text>
                  </View>
                  <View style={styles.policyItem}>
                    <Text style={styles.rowLabel}>Beneficiary:</Text>
                    <Text style={styles.rowValue}>{policy.beneficiary || 'Not specified'}</Text>
                  </View>
                  {policy.policyStartDate && (
                    <View style={styles.policyItem}>
                      <Text style={styles.rowLabel}>Start Date:</Text>
                      <Text style={styles.rowValue}>{new Date(policy.policyStartDate).toLocaleDateString()}</Text>
                    </View>
                  )}
                  {policy.policyEndDate && (
                    <View style={styles.policyItem}>
                      <Text style={styles.rowLabel}>End Date:</Text>
                      <Text style={styles.rowValue}>{new Date(policy.policyEndDate).toLocaleDateString()}</Text>
                    </View>
                  )}
                </View>
                {policy.notes && (
                  <Text style={{ fontSize: 9, color: '#1E40AF', marginTop: 5, fontStyle: 'italic' }}>
                    Notes: {policy.notes}
                  </Text>
                )}
              </View>
            ))}
            <View style={styles.totalCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Life Insurance Coverage:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(safeAnalysis.lifeInsurance.reduce((sum, policy) => sum + (policy.coverageAmount || 0), 0))}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Annual Premiums:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(safeAnalysis.lifeInsurance.reduce((sum, policy) => sum + (policy.premium || 0), 0))}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
        </Page>
      )}

      {/* Footer Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Summary</Text>
          <Text style={{ fontSize: 11, lineHeight: 1.6, color: '#374151' }}>
            This comprehensive financial analysis report provides a detailed overview of {safeClient.firstName} {safeClient.lastName}'s current financial position as of {new Date().toLocaleDateString()}. The analysis includes income and expense breakdowns, asset and liability assessments, financial goal tracking, and life insurance coverage evaluation.
          </Text>
          
          <Text style={[styles.subsectionTitle, { marginTop: 20 }]}>Key Financial Metrics:</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Monthly Net Income:</Text>
            <Text style={styles.rowValue}>{formatCurrency(metrics.monthlyNetIncome)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Annual Net Income:</Text>
            <Text style={styles.rowValue}>{formatCurrency(metrics.netIncome)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Debt-to-Asset Ratio:</Text>
            <Text style={styles.rowValue}>
              {metrics.totalAssets > 0 ? `${metrics.debtToAssetRatio.toFixed(1)}%` : 'N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Savings Rate:</Text>
            <Text style={styles.rowValue}>
              {metrics.totalIncome > 0 ? `${metrics.savingsRate.toFixed(1)}%` : 'N/A'}
            </Text>
          </View>
          
          <Text style={[styles.subsectionTitle, { marginTop: 20 }]}>Recommendations:</Text>
          <Text style={{ fontSize: 10, lineHeight: 1.6, color: '#374151' }}>
            • Review and update financial goals regularly to ensure they align with changing life circumstances{'\n'}
            • Consider increasing emergency fund to 3-6 months of expenses{'\n'}
            • Evaluate life insurance coverage annually or after major life events{'\n'}
            • Monitor debt-to-income ratios and work towards debt reduction{'\n'}
            • Consult with a financial advisor for personalized investment strategies
          </Text>
        </View>
        
        <View style={styles.footer}>
          <Text>
            This report was generated on {new Date().toLocaleDateString()} for financial planning purposes only. Please consult with a qualified financial professional for personalized advice.
          </Text>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>
    </Document>
  );
}

export default PDFReport;