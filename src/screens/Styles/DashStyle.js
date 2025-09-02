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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  menuButton: {
    width: 30,
    height: 30,
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  menuLine: {
    width: '100%',
    height: 2,
    borderColor: 'transparent',
    borderRadius: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(209, 180, 100, 0.1)', // Cor dourada secundária com opacidade
    borderColor: '#d1b464', // Dourado secundário
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  warningText: {
    color: '#d1b464', // Dourado secundário
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  warningAmount: {
    color: '#d1b464', // Dourado secundário
  },

  // Balance Section
  balanceSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
    minHeight: 100,
  },
  mainBalanceCard: {
    borderWidth: 2,
    borderColor: '#fdb931', // Dourado principal
    shadowColor: '#fdb931', // Dourado principal
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  initialAmount: {
    color: '#4CAF50',
  },
  mainBalance: {
    fontSize: 20,
  },
  positiveBalance: {
    color: '#4CAF50',
  },
  negativeBalance: {
    color: '#F44336',
  },
  objectiveAmount: {
    color: '#d1b464', // Dourado secundário
  },
  noObjective: {
    color: '#666666',
  },
  cardSubtitle: {
    fontSize: 10,
    color: '#888888',
    textAlign: 'center',
  },
  performanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  performanceText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  progressBarMini: {
    width: '100%',
    height: 3,
    backgroundColor: '#333333',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFillMini: {
    height: '100%',
    backgroundColor: '#d1b464', // Dourado secundário
    borderRadius: 2,
  },
  addObjectiveText: {
    fontSize: 10,
    color: '#fdb931', // Dourado principal
    marginTop: 4,
    textAlign: 'center',
  },
  dataSourceText: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
  },
  initialDepositsContainer: {
    marginTop: 8,
    alignItems: 'center',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  depositButton: {
    backgroundColor: '#4CAF50',
  },
  withdrawButton: {
    backgroundColor: '#F44336',
  },
  chartsButton: {
    borderColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },

  // Overview Section
  overviewSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fdb931', // Dourado principal
  },
  behaviorDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  behaviorText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Overview Cards
  overviewCards: {
    gap: 15,
  },
  overviewCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
    position: 'relative',
    overflow: 'hidden',
  },
  operationProfitCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  stopLossCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  profitTargetCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  overviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overviewCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(253, 185, 49, 0.1)', // Dourado principal com opacidade
  },
  overviewAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  operationProfitAmount: {
    fontSize: 28,
  },
  stopLossAmount: {
    color: '#F44336',
  },
  profitAmount: {
    color: '#4CAF50',
  },
  progressInfo: {
    marginBottom: 15,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  riskIndicator: {
    width: '100%',
    height: 6,
    backgroundColor: '#333333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  riskBar: {
    height: '100%',
    borderRadius: 3,
  },

  // Section Styles
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#fdb931', // Dourado principal
    fontWeight: '600',
  },

  // Empty State
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
    lineHeight: 20,
  },

  // Side Menu & Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#fdb931', // Dourado principal
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
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
    color: '#fdb931', // Dourado principal
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#fdb931', // Dourado principal
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#fdb931', // Dourado principal
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 5,
  },
  presetContainer: {
    marginTop: 15,
  },
  presetTitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 10,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  presetButtonText: {
    fontSize: 12,
    color: '#fdb931', // Dourado principal
    fontWeight: '600',
  },
  presetValueText: {
    fontSize: 10,
    color: '#CCCCCC',
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#333333',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#CCCCCC',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});