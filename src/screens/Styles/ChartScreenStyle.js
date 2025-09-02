import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
    borderColor: 'transparent',
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
    borderColor: 'transparent',
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

  // Behavior Section
  behaviorSection: {
    marginBottom: 25,
  },
  behaviorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  behaviorInfo: {
    marginLeft: 15,
    flex: 1,
  },
  behaviorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  behaviorDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  riskLevelText: {
    fontSize: 12,
    color: '#888888',
  },

  // Initial Balance Section
  initialBalanceSection: {
    marginBottom: 25,
  },
  balanceInfoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  balanceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceInfoLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  balanceInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
