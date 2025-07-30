import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useFinancial } from '../context/FinancialContext';
import LineChart from '../components/LineCharts';
import PieChart from '../components/PieChart';
import BarChart from '../components/BarChart';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const ChartsScreen = () => {
  const { transactions, balance, getMonthlyData, getCategoryData } = useFinancial();
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedChart, setSelectedChart] = useState('overview');

  // Dados simulados de apostas - na implementação real, estes viriam de um contexto
  const [bettingData] = useState({
    initialBalance: 1000,
    riskLevel: 5,
    stopLoss: 200,
    profitTarget: 500,
  });
  const getTotalWithdraws = () => {
  return transactions
    .filter(t => t.type === 'withdraw')
    .reduce((sum, t) => sum + t.amount, 0);
};

const getRealProfit = () => {
  const saqueTotal = getTotalWithdraws();
  return balance - bettingProfile.initialBalance - saqueTotal;
};



  const periods = [
    { key: '3months', label: '3M' },
    { key: '6months', label: '6M' },
    { key: '1year', label: '1A' },
    { key: 'all', label: 'Tudo' }
  ];

  const chartTypes = [
    { key: 'overview', label: 'Visão Geral' },
    { key: 'categories', label: 'Categorias' },
    { key: 'trends', label: 'Tendências' }
  ];

  const getFilteredTransactions = () => {
    if (selectedPeriod === 'all') return transactions;
    
    const now = new Date();
    let startDate;
    
    switch (selectedPeriod) {
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      default:
        return transactions;
    }
    
    return transactions.filter(t => new Date(t.date) >= startDate);
  };

  const getOverviewData = () => {
    const filteredTransactions = getFilteredTransactions();
    
    const totalDeposits = filteredTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdraws = filteredTransactions
      .filter(t => t.type === 'withdraw')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netIncome = totalDeposits - totalWithdraws;
    const performance = balance - bettingData.initialBalance;
    
    return { totalDeposits, totalWithdraws, netIncome, performance };
  };

  const getMonthlyTrendData = () => {
    const filteredTransactions = getFilteredTransactions();
    const monthlyData = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { deposits: 0, withdraws: 0, month: monthKey };
      }
      
      if (transaction.type === 'deposit') {
        monthlyData[monthKey].deposits += transaction.amount;
      } else {
        monthlyData[monthKey].withdraws += transaction.amount;
      }
    });
    
    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(data => ({
        ...data,
        balance: data.deposits - data.withdraws,
        monthLabel: new Date(data.month + '-01').toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: '2-digit' 
        })
      }));
  };

  const getCategoryBreakdown = () => {
    const filteredTransactions = getFilteredTransactions();
    const categoryData = {};
    
    filteredTransactions.forEach(transaction => {
      const category = transaction.category || 'Outros';
      
      if (!categoryData[category]) {
        categoryData[category] = { deposits: 0, withdraws: 0 };
      }
      
      if (transaction.type === 'deposit') {
        categoryData[category].deposits += transaction.amount;
      } else {
        categoryData[category].withdraws += transaction.amount;
      }
    });
    
    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      amount: data.deposits + data.withdraws,
      deposits: data.deposits,
      withdraws: data.withdraws,
      percentage: 0 // Will be calculated in component
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPerformanceColor = (value) => {
    if (value > 0) return '#4CAF50';
    if (value < 0) return '#F44336';
    return '#FFD700';
  };

  const getRiskStatus = () => {
    if (balance <= bettingData.stopLoss) return { color: '#F44336', status: 'ALTO RISCO' };
    if (balance >= (bettingData.initialBalance + bettingData.profitTarget)) return { color: '#4CAF50', status: 'META ATINGIDA' };
    return { color: '#FFD700', status: 'DENTRO DO LIMITE' };
  };

  const overviewData = getOverviewData();
  const monthlyTrendData = getMonthlyTrendData();
  const categoryData = getCategoryBreakdown();
  const riskStatus = getRiskStatus();

  const renderOverviewChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>
        <FontAwesome5 name="chart-line" size={18} color="#FFD700" /> Gerenciador de Banca
      </Text>
      
      {/* Balance & Performance Cards */}
      <View style={styles.balanceOverview}>
        <View style={[styles.balanceCard, styles.mainCard]}>
          <View style={styles.cardIcon}>
            <FontAwesome5 name="coins" size={24} color="#FFD700" />
          </View>
          <Text style={styles.balanceLabel}>Saldo Atual</Text>
          <Text style={[styles.balanceAmount, { color: getPerformanceColor(balance) }]}>
            {formatCurrency(balance)}
          </Text>
          <Text style={[styles.performanceText, { color: getPerformanceColor(overviewData.performance) }]}>
            {overviewData.performance >= 0 ? '+' : ''}{formatCurrency(overviewData.performance)}
          </Text>
        </View>

        <View style={[styles.riskCard, { borderLeftColor: riskStatus.color }]}>
          <View style={styles.cardIcon}>
            <MaterialIcons name="warning" size={24} color={riskStatus.color} />
          </View>
          <Text style={styles.riskLabel}>Status</Text>
          <Text style={[styles.riskStatus, { color: riskStatus.color }]}>
            {riskStatus.status}
          </Text>
          <View style={styles.riskIndicator}>
            <View style={[
              styles.riskBar,
              { 
                width: `${Math.min((balance / bettingData.initialBalance) * 100, 100)}%`,
                backgroundColor: riskStatus.color
              }
            ]} />
          </View>
        </View>
      </View>
      
      {/* Summary Cards */}
      <View style={styles.summaryCards}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <View style={styles.summaryCardHeader}>
            <MaterialIcons name="add" size={20} color="#4CAF50" />
            <Text style={styles.summaryCardTitle}>Depósitos</Text>
          </View>
          <Text style={[styles.summaryCardAmount, styles.incomeAmount]}>
            {formatCurrency(overviewData.totalDeposits)}
          </Text>
        </View>
        
        <View style={[styles.summaryCard, styles.expenseCard]}>
          <View style={styles.summaryCardHeader}>
            <MaterialIcons name="remove" size={20} color="#F44336" />
            <Text style={styles.summaryCardTitle}>Saques</Text>
          </View>
          <Text style={[styles.summaryCardAmount, styles.expenseAmount]}>
            {formatCurrency(overviewData.totalWithdraws)}
          </Text>
        </View>
        
        <View style={[styles.summaryCard, styles.netCard]}>
          <View style={styles.summaryCardHeader}>
            <FontAwesome5 name="balance-scale" size={16} color="#FFD700" />
            <Text style={styles.summaryCardTitle}>Resultado</Text>
          </View>
          <Text style={[
            styles.summaryCardAmount,
            overviewData.netIncome >= 0 ? styles.incomeAmount : styles.expenseAmount
          ]}>
            {formatCurrency(overviewData.netIncome)}
          </Text>
        </View>
      </View>

      {/* Betting Limits Section */}
      <View style={styles.limitsSection}>
        <Text style={styles.sectionTitle}>Limites de Apostas</Text>
        <View style={styles.limitsCards}>
          <View style={[styles.limitCard, styles.stopLossCard]}>
            <MaterialIcons name="stop" size={18} color="#F44336" />
            <Text style={styles.limitLabel}>Stop-Loss</Text>
            <Text style={styles.limitValue}>{formatCurrency(bettingData.stopLoss)}</Text>
            <Text style={styles.limitDistance}>
              {balance > bettingData.stopLoss 
                ? `${formatCurrency(balance - bettingData.stopLoss)} acima`
                : 'ATINGIDO!'
              }
            </Text>
          </View>

          <View style={[styles.limitCard, styles.profitTargetCard]}>
            <MaterialIcons name="trending-up" size={18} color="#4CAF50" />
            <Text style={styles.limitLabel}>Meta Lucro</Text>
            <Text style={styles.limitValue}>
              {formatCurrency(bettingData.initialBalance + bettingData.profitTarget)}
            </Text>
            <Text style={styles.limitDistance}>
              {balance >= (bettingData.initialBalance + bettingData.profitTarget)
                ? 'ATINGIDA!'
                : `${formatCurrency((bettingData.initialBalance + bettingData.profitTarget) - balance)} restante`
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Monthly Trend Line Chart */}
      {monthlyTrendData.length > 0 && (
        <View style={styles.chartWrapper}>
          <Text style={styles.chartSubtitle}>
            <FontAwesome5 name="chart-area" size={14} color="#CCCCCC" /> Evolução Mensal
          </Text>
          <LineChart 
            data={monthlyTrendData}
            width={screenWidth - 40}
            height={200}
          />
        </View>
      )}
    </View>
  );

  const renderCategoriesChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>
        <FontAwesome5 name="chart-pie" size={18} color="#FFD700" /> Gastos por Categoria
      </Text>
      
      {categoryData.length > 0 ? (
        <>
          <View style={styles.chartWrapper}>
            <PieChart 
              data={categoryData.filter(d => d.withdraws > 0)}
              width={screenWidth - 40}
              height={250}
            />
          </View>
          
          {/* Category List */}
          <View style={styles.categoryList}>
            <Text style={styles.categoryListTitle}>Top Categorias</Text>
            {categoryData
              .filter(d => d.withdraws > 0)
              .sort((a, b) => b.withdraws - a.withdraws)
              .slice(0, 5)
              .map((category, index) => (
                <View key={category.category} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <View style={[
                      styles.categoryColor,
                      { backgroundColor: getColorForIndex(index) }
                    ]} />
                    <Text style={styles.categoryName}>{category.category}</Text>
                  </View>
                  <Text style={styles.categoryAmount}>
                    {formatCurrency(category.withdraws)}
                  </Text>
                </View>
              ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyChart}>
          <FontAwesome5 name="chart-pie" size={40} color="#666" />
          <Text style={styles.emptyChartText}>Nenhum dado de categoria disponível</Text>
        </View>
      )}
    </View>
  );

  const renderTrendsChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>
        <FontAwesome5 name="chart-bar" size={18} color="#FFD700" /> Entradas vs Saídas
      </Text>
      
      {monthlyTrendData.length > 0 ? (
        <View style={styles.chartWrapper}>
          <BarChart 
            data={monthlyTrendData}
            width={screenWidth - 40}
            height={250}
          />
        </View>
      ) : (
        <View style={styles.emptyChart}>
          <FontAwesome5 name="chart-bar" size={40} color="#666" />
          <Text style={styles.emptyChartText}>Nenhum dado de tendência disponível</Text>
        </View>
      )}
      
      {/* Transaction Summary */}
      <View style={styles.transactionSummary}>
        <Text style={styles.summaryTitle}>
          <FontAwesome5 name="receipt" size={16} color="#FFD700" /> Atividade Recente
        </Text>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{transactions.length}</Text>
            <Text style={styles.statLabel}>Total de Transações</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {transactions.filter(t => t.type === 'deposit').length}
            </Text>
            <Text style={styles.statLabel}>Depósitos</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {transactions.filter(t => t.type === 'withdraw').length}
            </Text>
            <Text style={styles.statLabel}>Saques</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const getColorForIndex = (index) => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    return colors[index % colors.length];
  };

  const renderChart = () => {
    switch (selectedChart) {
      case 'overview':
        return renderOverviewChart();
      case 'categories':
        return renderCategoriesChart();
      case 'trends':
        return renderTrendsChart();
      default:
        return renderOverviewChart();
    }
  };

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome5 name="chart-line" size={60} color="#666" />
        <Text style={styles.emptyTitle}>Nenhum Dado Disponível</Text>
        <Text style={styles.emptySubtitle}>
          Adicione algumas transações para ver suas análises de apostas
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {periods.map(period => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.periodButtonTextActive
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart Type Selector */}
      <View style={styles.chartTypeSelector}>
        {chartTypes.map(chart => (
          <TouchableOpacity
            key={chart.key}
            style={[
              styles.chartTypeButton,
              selectedChart === chart.key && styles.chartTypeButtonActive
            ]}
            onPress={() => setSelectedChart(chart.key)}
          >
            <Text style={[
              styles.chartTypeButtonText,
              selectedChart === chart.key && styles.chartTypeButtonTextActive
            ]}>
              {chart.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart Content */}
      {renderChart()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  periodSelector: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#FFD700',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  periodButtonTextActive: {
    color: '#000000',
  },
  chartTypeSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 5,
  },
  chartTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  chartTypeButtonActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  chartTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  chartTypeButtonTextActive: {
    color: '#000000',
  },
  chartContainer: {
    margin: 20,
    marginTop: 0,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
    textAlign: 'center',
  },
  chartSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 15,
    textAlign: 'center',
  },

  // Balance Overview
  balanceOverview: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
  },
  balanceCard: {
    flex: 2,
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    alignItems: 'center',
  },
  mainCard: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  riskCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333333',
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  cardIcon: {
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  performanceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  riskLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  riskStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  riskIndicator: {
    width: '100%',
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  riskBar: {
    height: '100%',
    borderRadius: 2,
  },

  // Summary Cards
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  incomeCard: {
    backgroundColor: '#1A2A1A',
    borderColor: '#4CAF50',
  },
  expenseCard: {
    backgroundColor: '#2A1A1A',
    borderColor: '#F44336',
  },
  netCard: {
    backgroundColor: '#2A2A1A',
    borderColor: '#FFD700',
  },
  summaryCardTitle: {
    fontSize: 11,
    color: '#CCCCCC',
    marginLeft: 4,
    textAlign: 'center',
  },
  summaryCardAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#4CAF50',
  },
  expenseAmount: {
    color: '#F44336',
  },

  // Limits Section
  limitsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
  },
  limitsCards: {
    flexDirection: 'row',
    gap: 10,
  },
  limitCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333333',
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  stopLossCard: {
    borderLeftColor: '#F44336',
  },
  profitTargetCard: {
    borderLeftColor: '#4CAF50',
  },
  limitLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 5,
    marginBottom: 5,
  },
  limitValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  limitDistance: {
    fontSize: 10,
    color: '#888888',
    textAlign: 'center',
  },

  // Chart Wrapper
  chartWrapper: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },

  // Category List
  categoryList: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  categoryListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },

  // Transaction Summary
  transactionSummary: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },

  // Empty States
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#CCCCCC',
    marginTop: 20,
    marginBottom: 15,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  emptyChartText: {
    fontSize: 16,
    color: '#888888',
    marginTop: 15,
  },
});

export default ChartsScreen;