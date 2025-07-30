import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
  },
  menuButton: {
    padding: 10,
  },
  menuLine: {
    width: 25,
    height: 3,
    backgroundColor: '#FFD700',
    marginBottom: 4,
    borderRadius: 2,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 15,
  },

  // Balance Cards Section
  balanceSection: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 25,
    gap: 10,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333333',
    minHeight: 120,
  },
  mainBalanceCard: {
    borderColor: '#FFD700',
    borderWidth: 2,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 6,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mainBalance: {
    fontSize: 18,
  },
  initialAmount: {
    color: '#4CAF50',
  },
  objectiveAmount: {
    color: '#FF9800',
  },
  noObjective: {
    color: '#666666',
    fontSize: 24,
  },
  positiveBalance: {
    color: '#4CAF50',
  },
  negativeBalance: {
    color: '#F44336',
  },
  cardSubtitle: {
    fontSize: 10,
    color: '#888888',
  },
  performanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  performanceText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  progressBarMini: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFillMini: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 2,
  },
  addObjectiveText: {
    fontSize: 12,
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  initialDepositsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 175, 80, 0.3)',
  },
  initialDepositsText: {
    fontSize: 10,
    color: '#4CAF50',
    textAlign: 'center',
  },

  // Quick Actions Styles
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  depositButton: {
    backgroundColor: '#4CAF50',
  },
  withdrawButton: {
    backgroundColor: '#F44336',
  },
  chartsButton: {
    backgroundColor: '#FFD700',
  },
  actionButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },

  // Overview Section Styles
  overviewSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  overviewCards: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333333',
    minWidth: '45%',
  },
  operationProfitCard: {
    borderLeftColor: '#FFD700',
    borderLeftWidth: 4,
    minWidth: '100%',
    marginBottom: 10,
  },
  stopLossCard: {
    borderLeftColor: '#F44336',
    borderLeftWidth: 4,
  },
  profitTargetCard: {
    borderLeftColor: '#4CAF50',
    borderLeftWidth: 4,
  },
  overviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewCardTitle: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 6,
    fontWeight: '600',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 4,
  },
  overviewAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  operationProfitAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stopLossAmount: {
    color: '#F44336',
  },
  profitAmount: {
    color: '#4CAF50',
  },
  overviewSubtitle: {
    fontSize: 10,
    color: '#888888',
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 9,
    color: '#AAAAAA',
  },
  progressInfo: {
    marginBottom: 8,
  },
  riskIndicator: {
    height: 3,
    backgroundColor: '#333333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  riskBar: {
    height: '100%',
    borderRadius: 2,
  },
  behaviorDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  behaviorText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Section Styles
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  seeAllText: {
    color: '#FFD700',
    fontSize: 14,
    textDecorationLine: 'underline',
  },

  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 15,
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },

  // Overlay Styles
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444444',
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  presetContainer: {
    marginBottom: 20,
  },
  presetTitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
    fontWeight: '600',
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  presetButtonText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  presetValueText: {
    fontSize: 10,
    color: '#AAAAAA',
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#444444',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: 'bold',
  },
});