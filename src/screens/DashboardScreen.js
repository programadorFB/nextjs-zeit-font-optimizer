import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  Alert,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useFinancial } from '../context/FinancialContext';
import { useBetting } from '../context/BettingContext';
import SideMenu from '../components/SideMenu';
import TransactionList from '../components/TransactionList';
import ObjectivesList from '../components/ObjectiveList';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { GoldGradient } from '../components/GoldGradient';

// O COMPONENTE 'EditModal' FOI COMPLETAMENTE REMOVIDO DESTA ÁREA

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { 
    balance, 
    transactions, 
    objectives, 
    loading, 
    refreshData, 
    initialBankBalance,
    getEffectiveInitialBalance,
    getOperationalProfit,
    totalDeposits,
    totalWithdraws 
  } = useFinancial();
  
  const { 
    bettingProfile, 
    updateBettingProfile, 
    syncWithFinancialContext,
    isLoading: bettingLoading 
  } = useBetting();

  const [menuVisible, setMenuVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-300));
  // OS ESTADOS 'editModalVisible' E 'editModalData' FORAM REMOVIDOS

  useEffect(() => {
    if (!loading && !bettingLoading) {
      syncWithFinancialContext({
        initialBankBalance,
        getEffectiveInitialBalance,
        balance,
        totalDeposits,
        totalWithdraws
      });

      if (!bettingProfile.isInitialized && initialBankBalance > 0) {
        console.log('Inicializando perfil no dashboard com banca:', initialBankBalance);
        initializeDefaultProfile();
      }
    }
  }, [loading, bettingLoading, initialBankBalance, balance, bettingProfile.isInitialized]);

  const initializeDefaultProfile = async () => {
    try {
      const defaultRisk = 5;
      const defaultProfile = {
        id: 'balanced',
        title: 'Jogador Equilibrado',
        description: 'Perfil padrão balanceado',
        color: '#FFD700',
        expectedReturn: 'Ganhos Moderados',
        icon: { name: 'balance-scale', color: '#FFD700' }
      };
      const profileData = {
        profile: defaultProfile,
        profileType: 'balanced',
        riskLevel: defaultRisk,
        stopLoss: initialBankBalance * 0.1,
        profitTarget: initialBankBalance * 0.2,
        bankroll: initialBankBalance,
        initialBalance: initialBankBalance,
        isInitialized: true,
        createdAt: new Date().toISOString()
      };
      await updateBettingProfile(profileData);
      console.log('Perfil padrão inicializado:', profileData);
    } catch (error) {
      console.error('Erro ao inicializar perfil padrão:', error);
    }
  };

  const getCumulativeInitialBalance = () => {
    const allInitialDeposits = transactions
      .filter(tx => tx.type === 'deposit' && tx.isInitialBank === true)
      .reduce((acc, tx) => acc + tx.amount, 0);
    
    if (allInitialDeposits > 0) return allInitialDeposits;
    if (bettingProfile.isInitialized && bettingProfile.initialBalance > 0) return bettingProfile.initialBalance;
    if (initialBankBalance > 0) return initialBankBalance;
    const effectiveBalance = getEffectiveInitialBalance();
    if (effectiveBalance > 0) return effectiveBalance;
    return 0;
  };

  const getInitialDepositsBreakdown = () => {
    return transactions
      .filter(tx => tx.type === 'deposit' && tx.isInitialBank === true)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const calculateAutomaticProfitTarget = () => {
    const initialBalance = getCumulativeInitialBalance();
    const riskLevel = bettingProfile.riskLevel;
    if (initialBalance === 0) return 0;
    const profitMultiplier = (riskLevel / 100) + 1;
    const calculatedTarget = initialBalance * profitMultiplier;
    return calculatedTarget - initialBalance;
  };

  const getRealProfit = () => {
    const initialBalance = getCumulativeInitialBalance();
    const profitWithdrawals = transactions
      .filter(tx => tx.type === 'withdraw' && tx.category === 'Saque de Lucro')
      .reduce((acc, tx) => acc + tx.amount, 0);
    const currentNetProfit = Math.max(0, balance - initialBalance);
    return currentNetProfit + profitWithdrawals;
  };

  const getOperationResult = () => {
    const initialBalance = getCumulativeInitialBalance();
    return balance - initialBalance;
  };

  const getPerformanceColor = () => {
    const profit = getRealProfit();
    if (profit > 0) return '#4CAF50';
    if (profit < 0) return '#F44336';
    return '#fdb931';
  };

  const getPerformanceIcon = () => {
    const profit = getRealProfit();
    if (profit > 0) return 'trending-up';
    if (profit < 0) return 'trending-down';
    return 'trending-flat';
  };

  const getPlayerBehaviorData = () => {
    const profiles = {
      cautious: { id: 'cautious', title: 'Jogador Cauteloso', icon: { name: 'shield-alt', color: '#4CAF50' }, description: 'Apostas seguras com menor risco' },
      balanced: { id: 'balanced', title: 'Jogador Equilibrado', icon: { name: 'balance-scale', color: '#fdb931' }, description: 'Equilíbrio entre risco e recompensa' },
      highrisk: { id: 'highrisk', title: 'Jogador de Alto Risco', icon: { name: 'fire', color: '#F44336' }, description: 'Grandes ganhos com alta volatilidade' }
    };
    if (bettingProfile.profileType && profiles[bettingProfile.profileType]) return profiles[bettingProfile.profileType];
    if (bettingProfile.riskLevel <= 3) return profiles.cautious;
    if (bettingProfile.riskLevel <= 6) return profiles.balanced;
    return profiles.highrisk;
  };

  const getPlayerBehaviorIcon = () => getPlayerBehaviorData().icon;
  const getBehaviorDescription = () => getPlayerBehaviorData().title;

  // A FUNÇÃO 'openEditModal' FOI REMOVIDA
  // A FUNÇÃO 'handleSaveEdit' FOI REMOVIDA

  const onRefresh = async () => {
    await refreshData();
  };

  const toggleMenu = () => {
    const toValue = menuVisible ? -300 : 0;
    Animated.timing(slideAnim, { toValue, duration: 300, useNativeDriver: false }).start();
    setMenuVisible(!menuVisible);
  };

  const closeMenu = () => {
    if (menuVisible) {
      Animated.timing(slideAnim, { toValue: -300, duration: 300, useNativeDriver: false }).start();
      setMenuVisible(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const calculateProgress = (current, target) => Math.min((current / target) * 100, 100);

  const showInitialBalanceWarning = () => {
    const initialBalance = getCumulativeInitialBalance();
    if (initialBalance === 0 && (totalDeposits > 0 || balance > 0)) {
      Alert.alert('Banca Inicial Não Definida', 'Para melhor controle financeiro, defina sua banca inicial nas transações.', [
        { text: 'Agora Não', style: 'cancel' },
        { text: 'Definir Agora', onPress: () => navigation.navigate('Transaction', { type: 'deposit' }) }
      ]);
    }
  };

  const showInitialBalanceDetails = () => {
    const initialDeposits = getInitialDepositsBreakdown();
    const totalInitial = getCumulativeInitialBalance();
    if (initialDeposits.length === 0) {
      showInitialBalanceWarning();
      return;
    }
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR');
    const detailsText = initialDeposits.map((deposit, index) => `${index + 1}. ${formatCurrency(deposit.amount)} - ${formatDate(deposit.date)}`).join('\n');
    Alert.alert('Bancas Iniciais Registradas', `Total Acumulado: ${formatCurrency(totalInitial)}\n\nDetalhamento:\n${detailsText}`, [
      { text: 'OK', style: 'default' },
      { text: 'Adicionar Nova Banca', onPress: () => navigation.navigate('Transaction', { type: 'deposit' }) }
    ]);
  };

  const recentTransactions = transactions.slice(-5).reverse();
  const incompleteObjectives = objectives.filter(obj => obj.current_amount < obj.target_amount);
  const currentObjective = incompleteObjectives[0];
  const behaviorIcon = getPlayerBehaviorIcon();
  const initialBalance = getCumulativeInitialBalance();
  const initialDepositsBreakdown = getInitialDepositsBreakdown();
  const hasInitializationIssue = initialBalance === 0 && balance > 0;

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../assets/fundoLuxo.jpg')}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.overlayGradient} />
        
        {/* A CHAMADA AO COMPONENTE '<EditModal />' FOI REMOVIDA DAQUI */}

        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
          <Text style={styles.greeting}>Olá, {user?.name || 'Jogador'}!</Text>
          <Image source={require('../assets/logo.png')} style={{ width: 50, height: 50 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          bounces={true}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} colors={['#fdb931']} tintColor="#fdb931" />}
          onTouchStart={closeMenu}
        >
          {hasInitializationIssue && (
            <TouchableOpacity style={styles.warningBanner} onPress={showInitialBalanceWarning}>
              <MaterialIcons name="warning" size={20} color="#d1b464" />
              <Text style={styles.warningText}>Banca inicial não definida. Toque para configurar.</Text>
            </TouchableOpacity>
          )}

          <View style={styles.balanceSection}>
            <TouchableOpacity style={styles.balanceCard} onPress={showInitialBalanceDetails} activeOpacity={0.7}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="account-balance-wallet" size={20} color="#4CAF50" />
                <Text style={styles.cardTitle}>Valor Inicial</Text>
                {initialDepositsBreakdown.length > 1 && (
                  <View style={styles.multipleIndicator}>
                    <Text style={styles.multipleText}>{initialDepositsBreakdown.length}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.balanceAmount, styles.initialAmount, hasInitializationIssue && styles.warningAmount]}>
                {formatCurrency(initialBalance)}
              </Text>
              <Text style={styles.cardSubtitle}>
                {hasInitializationIssue ? 'Não definida' : initialDepositsBreakdown.length > 1 ? `${initialDepositsBreakdown.length} bancas acumuladas` : 'Banca inicial'}
              </Text>
              {initialDepositsBreakdown.length > 0 && (
                <View style={styles.initialDepositsContainer}>
                  <Text style={styles.dataSourceText}>Toque para ver detalhes</Text>
                  {initialDepositsBreakdown.length > 1 && <View style={styles.progressBarMini}><View style={[styles.progressFillMini, { width: '100%', backgroundColor: '#4CAF50' }]} /></View>}
                </View>
              )}
            </TouchableOpacity>

            <View style={[styles.balanceCard, styles.mainBalanceCard]}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="coins" size={20} color="#fdb931" />
                <Text style={styles.cardTitle}>Saldo Banca</Text>
              </View>
              <Text style={[styles.balanceAmount, styles.mainBalance, balance >= 0 ? styles.positiveBalance : styles.negativeBalance]}>
                {formatCurrency(balance)}
              </Text>
              <View style={styles.performanceContainer}>
                <MaterialIcons name={getPerformanceIcon()} size={16} color={getPerformanceColor()} />
                <Text style={[styles.performanceText, { color: getPerformanceColor() }]}>{formatCurrency(getOperationResult())}</Text>
              </View>
            </View>

            <View style={styles.balanceCard}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="flag" size={20} color="#d1b464" />
                <Text style={styles.cardTitle}>Objetivo</Text>
              </View>
              {currentObjective ? (
                <>
                  <Text style={[styles.balanceAmount, styles.objectiveAmount]} numberOfLines={1}>{formatCurrency(currentObjective.target_amount)}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>{currentObjective.title}</Text>
                  <View style={styles.progressBarMini}><View style={[styles.progressFillMini, { width: `${calculateProgress(currentObjective.current_amount, currentObjective.target_amount)}%` }]} /></View>
                </>
              ) : (
                <>
                  <Text style={[styles.balanceAmount, styles.noObjective]}>--</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Transaction', { showObjectives: true })}><Text style={styles.addObjectiveText}>+ Definir Meta</Text></TouchableOpacity>
                </>
              )}
            </View>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity style={[styles.actionButton, styles.depositButton]} onPress={() => navigation.navigate('Transaction', { type: 'deposit' })}>
              <MaterialIcons name="add" size={20} color="#000" />
              <Text style={styles.actionButtonText}>Depósito</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.withdrawButton]} onPress={() => navigation.navigate('Transaction', { type: 'withdraw' })}>
              <MaterialIcons name="remove" size={20} color="#000" />
              <Text style={styles.actionButtonText}>Saque</Text>
            </TouchableOpacity>
            <GoldGradient style={styles.gradientActionButton}>
              <TouchableOpacity style={[styles.actionButton, styles.chartsButton]} onPress={() => navigation.navigate('Charts')}>
                <FontAwesome5 name="chart-bar" size={16} color="#000" />
                <Text style={styles.actionButtonText}>Gráficos</Text>
              </TouchableOpacity>
            </GoldGradient>
          </View>

          <View style={styles.overviewSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Visão Geral da Operação</Text>
              <View style={styles.behaviorDisplay}>
                <FontAwesome5 name={behaviorIcon.name} size={16} color={behaviorIcon.color} />
                <Text style={[styles.behaviorText, { color: behaviorIcon.color }]}>{getBehaviorDescription()}</Text>
              </View>
            </View>
            
            <View style={styles.overviewCards}>
              <View style={[styles.overviewCard, styles.operationProfitCard]}>
                <View style={styles.overviewCardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <MaterialIcons name={getRealProfit() >= 0 ? "trending-up" : "trending-down"} size={20} color={getPerformanceColor()} />
                    <Text style={styles.overviewCardTitle}>Lucro Real Total</Text>
                  </View>
                  <View style={[styles.statusIndicator, { backgroundColor: getPerformanceColor() + '20' }]}>
                    <Text style={[styles.statusText, { color: getPerformanceColor() }]}>{getRealProfit() >= 0 ? 'LUCRO' : 'PREJUÍZO'}</Text>
                  </View>
                </View>
                <Text style={[styles.overviewAmount, styles.operationProfitAmount, { color: getPerformanceColor() }]}>{getRealProfit() >= 0 ? '+' : ''}{formatCurrency(getRealProfit())}</Text>
                <View style={styles.progressInfo}>
                  <Text style={styles.overviewSubtitle}>Lucro real incluindo saques</Text>
                  <Text style={styles.distanceText}>Valor inicial: {formatCurrency(initialBalance)}{initialDepositsBreakdown.length > 1 && ` (${initialDepositsBreakdown.length} bancas)`}</Text>
                  <Text style={styles.distanceText}>Saldo atual: {formatCurrency(balance)}</Text>
                  <Text style={styles.distanceText}>Saques realizados: {formatCurrency(totalWithdraws)}</Text>
                  {initialBalance > 0 && <Text style={styles.distanceText}>ROI: {((getRealProfit() / initialBalance) * 100).toFixed(1)}%</Text>}
                </View>
                <View style={styles.riskIndicator}><View style={[styles.riskBar, { width: `${Math.min(100, Math.max(10, initialBalance > 0 ? ((balance / initialBalance) * 100) : 50))}%`, backgroundColor: getPerformanceColor() }]} /></View>
              </View>

              {/* Card Stop-Loss MODIFICADO */}
              <View style={[styles.overviewCard, styles.stopLossCard]}>
                <View style={styles.overviewCardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <MaterialIcons name="warning" size={20} color="#F44336" />
                    <Text style={styles.overviewCardTitle}>Stop-Loss</Text>
                  </View>
                  {/* O BOTÃO 'TouchableOpacity' de edição foi removido daqui */}
                </View>
                <Text style={[styles.overviewAmount, styles.stopLossAmount]}>{formatCurrency(bettingProfile.stopLoss)}</Text>
                <View style={styles.progressInfo}>
                  <Text style={styles.overviewSubtitle}>
                    {bettingProfile.stopLoss > 0 && initialBalance > 0 ? `Limite de ${Math.round((bettingProfile.stopLoss / initialBalance) * 100)}% da banca` : 'Nenhum limite definido'}
                  </Text>
                  {bettingProfile.stopLoss > 0 && initialBalance > 0 && (
                    <>
                      <Text style={[styles.distanceText, { color: (balance - bettingProfile.stopLoss) < (initialBalance * 0.1) ? '#d1b464' : '#AAAAAA' }]}>
                        Distância atual: {formatCurrency(balance - bettingProfile.stopLoss)}
                      </Text>
                      {balance <= bettingProfile.stopLoss && <Text style={[styles.distanceText, { color: '#F44336', fontWeight: 'bold' }]}>⚠️ STOP LOSS ATINGIDO!</Text>}
                    </>
                  )}
                </View>
                <View style={styles.riskIndicator}><View style={[styles.riskBar, { width: `${Math.min(100, Math.max(0, initialBalance > 0 ? (balance / initialBalance) * 100 : 50))}%`, backgroundColor: balance <= bettingProfile.stopLoss ? '#F44336' : (balance - bettingProfile.stopLoss) < (initialBalance * 0.1) ? '#d1b464' : '#4CAF50' }]} /></View>
              </View>

              <View style={[styles.overviewCard, styles.profitTargetCard]}>
                <View style={styles.overviewCardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <MaterialIcons name="trending-up" size={20} color="#4CAF50" />
                    <Text style={styles.overviewCardTitle}>Meta Ganhos</Text>
                  </View>
                  <View style={styles.automaticIndicator}>
                    <MaterialIcons name="auto-awesome" size={16} color="#fdb931" />
                    <Text style={styles.automaticText}>Auto</Text>
                  </View>
                </View>
                <Text style={[styles.overviewAmount, styles.profitAmount]}>{formatCurrency(calculateAutomaticProfitTarget())}</Text>
                <View style={styles.progressInfo}>
                  <Text style={styles.overviewSubtitle}>
                    {calculateAutomaticProfitTarget() > 0 && initialBalance > 0 ? `Lucro de ${Math.round((calculateAutomaticProfitTarget() / initialBalance) * 100)}% sobre a banca` : 'Baseado no seu perfil de risco'}
                  </Text>
                  {calculateAutomaticProfitTarget() > 0 && initialBalance > 0 && (
                    <>
                      <Text style={styles.distanceText}>Nível de Risco: {bettingProfile.riskLevel}</Text>
                      <Text style={styles.distanceText}>Falta: {formatCurrency(Math.max(0, (initialBalance + calculateAutomaticProfitTarget()) - balance))}</Text>
                      {balance >= (initialBalance + calculateAutomaticProfitTarget()) && <Text style={[styles.distanceText, { color: '#4CAF50', fontWeight: 'bold' }]}>🎯 META ATINGIDA!</Text>}
                      {initialDepositsBreakdown.length > 1 && <Text style={styles.distanceText}>Base: {formatCurrency(initialBalance)} ({initialDepositsBreakdown.length} bancas)</Text>}
                    </>
                  )}
                </View>
                <View style={styles.riskIndicator}><View style={[styles.riskBar, { width: `${Math.min(100, calculateAutomaticProfitTarget() > 0 ? (balance / (initialBalance + calculateAutomaticProfitTarget())) * 100 : 0)}%`, backgroundColor: balance >= (initialBalance + calculateAutomaticProfitTarget()) ? '#4CAF50' : '#fdb931' }]} /></View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transações Recentes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}><Text style={styles.seeAllText}>Ver Todas</Text></TouchableOpacity>
            </View>
            {recentTransactions.length > 0 ? <TransactionList transactions={recentTransactions} /> : (
              <View style={styles.emptyState}>
                <FontAwesome5 name="receipt" size={40} color="#666" />
                <Text style={styles.emptyStateText}>Nenhuma transação ainda</Text>
                <Text style={styles.emptyStateSubtext}>Adicione sua primeira transação para começar</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Objetivos Financeiros</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Transaction', { showObjectives: true })}><Text style={styles.seeAllText}>Gerenciar</Text></TouchableOpacity>
            </View>
            {incompleteObjectives.length > 0 ? <ObjectivesList objectives={incompleteObjectives.slice(0, 3)} /> : (
              <View style={styles.emptyState}>
                <MaterialIcons name="flag" size={40} color="#666" />
                <Text style={styles.emptyStateText}>Nenhum objetivo ativo</Text>
                <Text style={styles.emptyStateSubtext}>Defina metas financeiras para acompanhar seu progresso</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <SideMenu visible={menuVisible} slideAnim={slideAnim} onClose={closeMenu} navigation={navigation} />
        {menuVisible && <TouchableOpacity style={styles.overlay} onPress={closeMenu} activeOpacity={1} />}
      </ImageBackground>
    </View>
  );
};

// Os estilos permanecem os mesmos, então vou omiti-los para encurtar a resposta.
// Copie a seção de estilos da sua versão original ou da minha resposta anterior.
// ... (COLE A VARIÁVEL 'styles' AQUI)
const styles = {
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  // Background Image
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: '#fdb931',
    borderRadius: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(209, 180, 100, 0.15)',
    borderColor: '#d1b464',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
  },
  warningText: {
    color: '#d1b464',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  warningAmount: {
    color: '#d1b464',
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
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    minHeight: 100,
  },
  mainBalanceCard: {
    borderWidth: 2,
    borderColor: '#fdb931',
    shadowColor: '#fdb931',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 6,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  // NOVO: Indicador de múltiplas bancas
  multipleIndicator: {
    position: 'absolute',
    right: 0,
    top: -2,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  multipleText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    color: '#d1b464',
  },
  noObjective: {
    color: '#666666',
  },
  cardSubtitle: {
    fontSize: 10,
    color: '#888888',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressBarMini: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFillMini: {
    height: '100%',
    backgroundColor: '#d1b464',
    borderRadius: 2,
  },
  addObjectiveText: {
    fontSize: 10,
    color: '#fdb931',
    marginTop: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dataSourceText: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    background: 'transparent',
    borderRadius: 12,
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
    color: '#fdb931',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  behaviorDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  behaviorText: {
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Overview Cards
  overviewCards: {
    gap: 15,
  },
  overviewCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    backgroundColor: 'rgba(253, 185, 49, 0.1)',
  },
  
  // Indicador automático
  automaticIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(253, 185, 49, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(253, 185, 49, 0.3)',
  },
  automaticText: {
    fontSize: 10,
    color: '#fdb931',
    marginLeft: 4,
    fontWeight: '600',
  },
  
  overviewAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  distanceText: {
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  riskIndicator: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  seeAllText: {
    fontSize: 14,
    color: '#fdb931',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
  }
};

export default DashboardScreen;