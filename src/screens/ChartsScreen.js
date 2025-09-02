import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useFinancial } from '../context/FinancialContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
// Importação correta usando a exportação default do seu arquivo api.js
import apiService from '../services/api';

const { width: screenWidth } = Dimensions.get('window');

// CONSTANTES
const PERIODS = [
  { key: '3', label: '3M' },
  { key: '6', label: '6M' },
  { key: '12', label: '1A' }
];

const CHART_TYPES = [
  { key: 'overview', label: 'Visão Geral', icon: 'chart-pie' },
  { key: 'trends', label: 'Tendências', icon: 'chart-line' },
  { key: 'categories', label: 'Categorias', icon: 'list-ul' }
];

const chartConfig = {
  backgroundColor: '#1A1A1A',
  backgroundGradientFrom: '#1A1A1A',
  backgroundGradientTo: '#1A1A1A',
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(204, 204, 204, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#FFD700',
  },
};

const ChartsScreen = () => {
  const { transactions } = useFinancial();
  const [selectedPeriod, setSelectedPeriod] = useState('6');
  const [selectedChart, setSelectedChart] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Estados para armazenar os dados da API
  const [overviewData, setOverviewData] = useState(null);
  const [trendsData, setTrendsData] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Chamadas de API mais limpas usando as funções nomeadas do apiService
      const overviewRes = await apiService.getAnalyticsOverview();
      if (overviewRes.success) {
        setOverviewData(overviewRes.data);
      }

      const trendsRes = await apiService.getMonthlyAnalytics(selectedPeriod);
      if (trendsRes.success && trendsRes.data.length > 0) {
        const sortedData = trendsRes.data.sort((a, b) => new Date(a.month) - new Date(b.month));
        setTrendsData(sortedData);
      } else {
        setTrendsData([]);
      }
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // O restante do arquivo permanece idêntico...
  const categoryData = useMemo(() => {
    if (transactions.length === 0) return [];
    
    const categoryMap = transactions
      .filter(tx => tx.type === 'withdraw') 
      .reduce((acc, tx) => {
        const key = tx.category || 'Outros';
        acc[key] = (acc[key] || 0) + tx.amount;
        return acc;
      }, {});

    const colors = ['#FFD700', '#F44336', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];
    
    return Object.entries(categoryMap)
      .map(([name, value], index) => ({
        name,
        amount: value,
        color: colors[index % colors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 13,
      }))
      .sort((a, b) => b.amount - a.amount);

  }, [transactions]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="chart-line" size={60} color="#666" />
      <Text style={styles.emptyTitle}>Nenhum Dado Disponível</Text>
      <Text style={styles.emptySubtitle}>
        Adicione algumas transações para ver suas análises de apostas.
      </Text>
    </View>
  );

  const renderChartContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      );
    }

    if (transactions.length === 0) {
      return renderEmptyState();
    }

    switch(selectedChart) {
      case 'overview':
        if (!overviewData) return renderEmptyState();
        const profitLoss = parseFloat(overviewData.current_balance) - parseFloat(overviewData.initial_balance);
        const roi = overviewData.initial_balance > 0 ? (profitLoss / parseFloat(overviewData.initial_balance)) * 100 : 0;

        return (
          <>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Resumo da Banca</Text>
              <PieChart
                data={[
                  { name: 'Depósitos', population: parseFloat(overviewData.total_deposits), color: '#4CAF50', legendFontColor: '#7F7F7F', legendFontSize: 15 },
                  { name: 'Saques', population: parseFloat(overviewData.total_withdrawals), color: '#F44336', legendFontColor: '#7F7F7F', legendFontSize: 15 },
                ]}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>R$ {parseFloat(overviewData.real_profit).toFixed(2)}</Text>
                <Text style={styles.statLabel}>Lucro/Prejuízo Real</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: roi >= 0 ? '#4CAF50' : '#F44336' }]}>
                  {roi.toFixed(1)}%
                </Text>
                <Text style={styles.statLabel}>ROI</Text>
              </View>
            </View>
          </>
        );
      
      case 'trends':
        if (trendsData.length === 0) return renderEmptyState();
        return (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Tendências Mensais</Text>
            <LineChart
              data={{
                labels: trendsData.map(d => new Date(d.month).toLocaleString('default', { month: 'short' })),
                datasets: [
                  { data: trendsData.map(d => d.deposits), color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, strokeWidth: 2 },
                  { data: trendsData.map(d => d.withdraws), color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`, strokeWidth: 2 }
                ],
                legend: ["Depósitos", "Saques"]
              }}
              width={screenWidth - 40}
              height={250}
              chartConfig={chartConfig}
              bezier
            />
          </View>
        );
      
      case 'categories':
        if (categoryData.length === 0) return renderEmptyState();
        return (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Distribuição de Saques por Categoria</Text>
            <PieChart
              data={categoryData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorContainer}>
          {PERIODS.map(period => (
            <TouchableOpacity
              key={period.key}
              style={[styles.selectorButton, selectedPeriod === period.key && styles.selectorButtonActive]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text style={[styles.selectorButtonText, selectedPeriod === period.key && styles.selectorButtonTextActive]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorContainer}>
          {CHART_TYPES.map(chart => (
            <TouchableOpacity
              key={chart.key}
              style={[styles.selectorButton, selectedChart === chart.key && styles.selectorButtonActive]}
              onPress={() => setSelectedChart(chart.key)}
            >
              <FontAwesome5 name={chart.icon} size={14} color={selectedChart === chart.key ? '#000' : '#CCC'} style={{ marginRight: 8 }} />
              <Text style={[styles.selectorButtonText, selectedChart === chart.key && styles.selectorButtonTextActive]}>
                {chart.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchData}
              colors={['#FFD700']}
              tintColor="#FFD700"
            />
          } 
      >
        
        {renderChartContent()}
      </ScrollView>
      
    </View>
    
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    header: {
      paddingTop: 50,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#333333',
      backgroundColor: '#1A1A1A',
    },
    selectorContainer: {
      paddingHorizontal: 15,
      paddingVertical: 5,
      alignItems: 'center',
    },
    selectorButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 8,
      marginRight: 10,
      borderRadius: 20,
      backgroundColor: '#2A2A2A',
      borderWidth: 1,
      borderColor: '#333333',
    },
    selectorButtonActive: {
      borderColor: 'transparent',
      borderColor: '#FFD700',
    },
    selectorButtonText: {
      color: '#CCCCCC',
      fontSize: 14,
      fontWeight: '600',
    },
    selectorButtonTextActive: {
      color: '#000000',
      fontWeight: 'bold',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 15,
      paddingBottom: 30,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      minHeight: 400,
    },
    emptyTitle: {
      fontSize: 20,
      color: '#FFFFFF',
      marginTop: 20,
      marginBottom: 10,
      fontWeight: 'bold',
    },
    emptySubtitle: {
      fontSize: 16,
      color: '#CCCCCC',
      textAlign: 'center',
      lineHeight: 24,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 300,
    },
    chartCard: {
      backgroundColor: '#1A1A1A',
      borderRadius: 15,
      padding: 10,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#333333',
      alignItems: 'center',
    },
    chartTitle: {
      fontSize: 18,
      color: '#FFD700',
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    statCard: {
      width: '48%',
      backgroundColor: '#1A1A1A',
      borderRadius: 12,
      padding: 15,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#333333',
    },
    statValue: {
      fontSize: 22,
      color: '#FFFFFF',
      fontWeight: 'bold',
      marginBottom: 5,
    },
    statLabel: {
      fontSize: 14,
      color: '#CCCCCC',
    },
  });
  

export default ChartsScreen;