import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useFinancial } from '../context/FinancialContext';
import { useBetting } from '../context/BettingContext';
import SideMenu from '../components/SideMenu';
import TransactionList from '../components/TransactionList';
import ObjectivesList from '../components/ObjectiveList';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { styles } from './DashStyle';

const EditModal = ({ visible, onClose, title, value, onSave, isStopLoss = false, initialBalance = 1000 }) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [error, setError] = useState('');

  const handleSave = () => {
    const numericValue = parseFloat(inputValue.replace(',', '.'));
    
    if (isNaN(numericValue) || numericValue < 0) {
      setError('Por favor, insira um valor válido');
      return;
    }

    if (isStopLoss && numericValue >= initialBalance) {
      setError('Stop Loss deve ser menor que o valor inicial da banca');
      return;
    }

    onSave(numericValue);
    onClose();
    setInputValue('');
    setError('');
  };

  const getPresetValues = () => {
    if (isStopLoss) {
      return [
        { value: initialBalance * 0.05, label: '5%' },
        { value: initialBalance * 0.10, label: '10%' },
        { value: initialBalance * 0.20, label: '20%' },
        { value: initialBalance * 0.30, label: '30%' },
      ];
    } else {
      return [
        { value: initialBalance * 0.10, label: '10%' },
        { value: initialBalance * 0.25, label: '25%' },
        { value: initialBalance * 0.50, label: '50%' },
        { value: initialBalance * 1.00, label: '100%' },
      ];
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Valor em R$</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>R$</Text>
                <TextInput
                  style={styles.modalInput}
                  value={inputValue}
                  onChangeText={(text) => {
                    setInputValue(text.replace(/[^0-9.,]/g, ''));
                    setError('');
                  }}
                  placeholder="0,00"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <View style={styles.presetContainer}>
              <Text style={styles.presetTitle}>Valores sugeridos:</Text>
              <View style={styles.presetButtons}>
                {getPresetValues().map((preset, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.presetButton}
                    onPress={() => {
                      setInputValue(preset.value.toFixed(0));
                      setError('');
                    }}
                  >
                    <Text style={styles.presetButtonText}>{preset.label}</Text>
                    <Text style={styles.presetValueText}>R$ {preset.value.toFixed(0)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { balance, transactions, objectives, loading, refreshData } = useFinancial();
  const { bettingProfile, updateBettingProfile } = useBetting();
  const [menuVisible, setMenuVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-300));
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalData, setEditModalData] = useState({});

  const getTotalWithdraws = () => {
    return transactions
      .filter(t => t.type === 'withdraw')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getInitialDeposits = () => {
    return transactions
      .filter(t => t.isInitialBank && t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getRealProfit = () => {
    const saqueTotal = getTotalWithdraws();
    return balance - bettingProfile.initialBalance - saqueTotal;
  };

  const getPerformanceColor = () => {
    const lucro = getRealProfit();
    if (lucro > 0) return '#4CAF50';
    if (lucro < 0) return '#F44336';
    return '#FFD700';
  };

  const getPerformanceIcon = () => {
    const lucro = getRealProfit();
    if (lucro > 0) return 'trending-up';
    if (lucro < 0) return 'trending-down';
    return 'trending-flat';
  };

  // Get player behavior icon and description from betting profile
  const getPlayerBehaviorData = () => {
    // Profiles mapping from InvestmentProfile.js
    const profiles = {
      cautious: {
        id: 'cautious',
        title: 'Jogador Cauteloso',
        icon: { name: 'shield-alt', color: '#4CAF50' },
        description: 'Apostas seguras com menor risco'
      },
      balanced: {
        id: 'balanced', 
        title: 'Jogador Equilibrado',
        icon: { name: 'balance-scale', color: '#FFD700' },
        description: 'Equilíbrio entre risco e recompensa'
      },
      highrisk: {
        id: 'highrisk',
        title: 'Jogador de Alto Risco', 
        icon: { name: 'fire', color: '#F44336' },
        description: 'Grandes ganhos com alta volatilidade'
      }
    };

    // Use profileType from bettingProfile if available, otherwise fall back to riskLevel
    if (bettingProfile.profileType && profiles[bettingProfile.profileType]) {
      return profiles[bettingProfile.profileType];
    }

    // Fallback to risk level mapping
    if (bettingProfile.riskLevel <= 3) {
      return profiles.cautious;
    } else if (bettingProfile.riskLevel <= 6) {
      return profiles.balanced;
    } else {
      return profiles.highrisk;
    }
  };

  const getPlayerBehaviorIcon = () => {
    return getPlayerBehaviorData().icon;
  };

  const getBehaviorDescription = () => {
    return getPlayerBehaviorData().title;
  };

  const openEditModal = (type, title, currentValue) => {
    setEditModalData({
      type,
      title,
      currentValue,
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = (newValue) => {
    if (editModalData.type === 'stopLoss') {
      updateBettingProfile({ 
        ...bettingProfile, 
        stopLoss: newValue 
      });
    } else if (editModalData.type === 'profitTarget') {
      updateBettingProfile({ 
        ...bettingProfile, 
        profitTarget: newValue 
      });
    }
  };

  const onRefresh = async () => {
    await refreshData();
  };

  const toggleMenu = () => {
    const toValue = menuVisible ? -300 : 0;
    
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setMenuVisible(!menuVisible);
  };

  const closeMenu = () => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setMenuVisible(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const recentTransactions = transactions.slice(-5).reverse();
  const incompleteObjectives = objectives.filter(obj => obj.current_amount < obj.target_amount);
  const currentObjective = incompleteObjectives[0];
  const behaviorIcon = getPlayerBehaviorIcon();

  return (
    <View style={styles.container}>
      <EditModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        title={editModalData.title}
        value={editModalData.currentValue || 0}
        onSave={handleSaveEdit}
        isStopLoss={editModalData.type === 'stopLoss'}
        initialBalance={bettingProfile.initialBalance}
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={['#FFD700']}
            tintColor="#FFD700"
          />
        }
        onTouchStart={closeMenu}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
          <Text style={styles.greeting}>
            Olá, {user?.name || 'Jogador'}!
          </Text>
          <FontAwesome5 name="dice" size={20} color="#FFD700" />
        </View>

        {/* Balance Cards Section */}
        <View style={styles.balanceSection}>
          {/* Valor Inicial */}
          <View style={styles.balanceCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="account-balance-wallet" size={20} color="#4CAF50" />
              <Text style={styles.cardTitle}>Valor Inicial</Text>
            </View>
            <Text style={[styles.balanceAmount, styles.initialAmount]}>
              {formatCurrency(getInitialDeposits())}
            </Text>
            <Text style={styles.cardSubtitle}>Banca inicial</Text>
            
            {getInitialDeposits() > 0 && (
              <View style={styles.initialDepositsContainer}>
                <Text style={styles.initialDepositsText}>
                  Depósitos iniciais: {formatCurrency(getInitialDeposits())}
                </Text>
              </View>
            )}
          </View>

          {/* Saldo Atual */}
          <View style={[styles.balanceCard, styles.mainBalanceCard]}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="coins" size={20} color="#FFD700" />
              <Text style={styles.cardTitle}>Saldo Banca</Text>
            </View>
            <Text style={[
              styles.balanceAmount,
              styles.mainBalance,
              balance >= 0 ? styles.positiveBalance : styles.negativeBalance
            ]}>
              {formatCurrency(balance)}
            </Text>
            <View style={styles.performanceContainer}>
              <MaterialIcons 
                name={getPerformanceIcon()} 
                size={16} 
                color={getPerformanceColor()} 
              />
              <Text style={[styles.performanceText, { color: getPerformanceColor() }]}>
                {formatCurrency(getRealProfit())}
              </Text>
            </View>
          </View>

          {/* Objetivo Selecionado */}
          <View style={styles.balanceCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="flag" size={20} color="#FF9800" />
              <Text style={styles.cardTitle}>Objetivo</Text>
            </View>
            {currentObjective ? (
              <>
                <Text style={[styles.balanceAmount, styles.objectiveAmount]} numberOfLines={1}>
                  {formatCurrency(currentObjective.target_amount)}
                </Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>
                  {currentObjective.title}
                </Text>
                <View style={styles.progressBarMini}>
                  <View 
                    style={[
                      styles.progressFillMini, 
                      { width: `${calculateProgress(currentObjective.current_amount, currentObjective.target_amount)}%` }
                    ]} 
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.balanceAmount, styles.noObjective]}>
                  --
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Transaction', { showObjectives: true })}>
                  <Text style={styles.addObjectiveText}>+ Definir Meta</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.depositButton]}
            onPress={() => navigation.navigate('Transaction', { type: 'deposit' })}
          >
            <MaterialIcons name="add" size={20} color="#000" />
            <Text style={styles.actionButtonText}>Depósito</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.withdrawButton]}
            onPress={() => navigation.navigate('Transaction', { type: 'withdraw' })}
          >
            <MaterialIcons name="remove" size={20} color="#000" />
            <Text style={styles.actionButtonText}>Saque</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.chartsButton]}
            onPress={() => navigation.navigate('Charts')}
          >
            <FontAwesome5 name="chart-bar" size={16} color="#000" />
            <Text style={styles.actionButtonText}>Gráficos</Text>
          </TouchableOpacity>
        </View>

        {/* Visão Geral Section */}
        <View style={styles.overviewSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Visão Geral da Operação</Text>
            <View style={styles.behaviorDisplay}>
              <FontAwesome5 name={behaviorIcon.name} size={16} color={behaviorIcon.color} />
              <Text style={[styles.behaviorText, { color: behaviorIcon.color }]}>
                {getBehaviorDescription()}
              </Text>
            </View>
          </View>
          
          <View style={styles.overviewCards}>
            {/* Lucro da Operação Card */}
            <View style={[styles.overviewCard, styles.operationProfitCard]}>
              <View style={styles.overviewCardHeader}>
                <View style={styles.cardTitleContainer}>
                  <MaterialIcons 
                    name={getRealProfit() >= 0 ? "trending-up" : "trending-down"} 
                    size={20} 
                    color={getPerformanceColor()} 
                  />
                  <Text style={styles.overviewCardTitle}>Lucro da Operação</Text>
                </View>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: getPerformanceColor() + '20' }
                ]}>
                  <Text style={[styles.statusText, { color: getPerformanceColor() }]}>
                    {getRealProfit() >= 0 ? 'LUCRO' : 'PREJUÍZO'}
                  </Text>
                </View>
              </View>
              
              <Text style={[
                styles.overviewAmount, 
                styles.operationProfitAmount,
                { color: getPerformanceColor() }
              ]}>
                {getRealProfit() >= 0 ? '+' : ''}{formatCurrency(getRealProfit())}
              </Text>
              
              <View style={styles.progressInfo}>
                <Text style={styles.overviewSubtitle}>
                  Resultado atual da operação
                </Text>
                <Text style={styles.distanceText}>
                  Valor inicial: {formatCurrency(bettingProfile.initialBalance)}
                </Text>
                <Text style={styles.distanceText}>
                  Saques realizados: {formatCurrency(getTotalWithdraws())}
                </Text>
              </View>
              
              <View style={styles.riskIndicator}>
                <View style={[
                  styles.riskBar,
                  { 
                    width: `${Math.min(100, Math.max(10, ((balance / bettingProfile.initialBalance) * 100)))}%`,
                    backgroundColor: getPerformanceColor()
                  }
                ]} />
              </View>
            </View>

            {/* Stop-Loss Card - Enhanced */}
            <View style={[styles.overviewCard, styles.stopLossCard]}>
              <View style={styles.overviewCardHeader}>
                <View style={styles.cardTitleContainer}>
                  <MaterialIcons name="warning" size={20} color="#F44336" />
                  <Text style={styles.overviewCardTitle}>Stop-Loss</Text>
                </View>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => openEditModal('stopLoss', 'Editar Stop Loss', bettingProfile.stopLoss)}
                >
                  <MaterialIcons name="edit" size={16} color="#FFD700" />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.overviewAmount, styles.stopLossAmount]}>
                {formatCurrency(bettingProfile.stopLoss)}
              </Text>
              
              <View style={styles.progressInfo}>
                <Text style={styles.overviewSubtitle}>
                  {bettingProfile.stopLoss > 0 ? 
                    `Limite de ${Math.round((bettingProfile.stopLoss / bettingProfile.initialBalance) * 100)}% da banca` : 
                    'Nenhum limite definido'}
                </Text>
                {bettingProfile.stopLoss > 0 && (
                  <Text style={[
                    styles.distanceText,
                    { color: (balance - bettingProfile.stopLoss) < (bettingProfile.initialBalance * 0.1) ? '#FF9800' : '#AAAAAA' }
                  ]}>
                    Distância atual: {formatCurrency(balance - bettingProfile.stopLoss)}
                  </Text>
                )}
              </View>
              
              <View style={styles.riskIndicator}>
                <View style={[
                  styles.riskBar,
                  { 
                    width: `${Math.min(100, Math.max(0, (balance / bettingProfile.initialBalance) * 100))}%`,
                    backgroundColor: balance <= bettingProfile.stopLoss ? '#F44336' : 
                                  (balance - bettingProfile.stopLoss) < (bettingProfile.initialBalance * 0.1) ? '#FF9800' : '#4CAF50'
                  }
                ]} />
              </View>
            </View>

            {/* Profit Target Card - Enhanced */}
            <View style={[styles.overviewCard, styles.profitTargetCard]}>
              <View style={styles.overviewCardHeader}>
                <View style={styles.cardTitleContainer}>
                  <MaterialIcons name="trending-up" size={20} color="#4CAF50" />
                  <Text style={styles.overviewCardTitle}>Meta Ganhos</Text>
                </View>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => openEditModal('profitTarget', 'Editar Meta de Ganhos', bettingProfile.profitTarget)}
                >
                  <MaterialIcons name="edit" size={16} color="#FFD700" />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.overviewAmount, styles.profitAmount]}>
                {formatCurrency(bettingProfile.initialBalance + bettingProfile.profitTarget)}
              </Text>
              
              <View style={styles.progressInfo}>
                <Text style={styles.overviewSubtitle}>
                  {bettingProfile.profitTarget > 0 ? 
                    `Lucro de ${Math.round((bettingProfile.profitTarget / bettingProfile.initialBalance) * 100)}% sobre a banca` : 
                    'Nenhuma meta definida'}
                </Text>
                {bettingProfile.profitTarget > 0 && (
                  <Text style={styles.distanceText}>
                    Falta: {formatCurrency((bettingProfile.initialBalance + bettingProfile.profitTarget) - balance)}
                  </Text>
                )}
              </View>
              
              <View style={styles.riskIndicator}>
                <View style={[
                  styles.riskBar,
                  { 
                    width: `${Math.min(100, (balance / (bettingProfile.initialBalance + bettingProfile.profitTarget)) * 100)}%`,
                    backgroundColor: balance >= (bettingProfile.initialBalance + bettingProfile.profitTarget) ? '#4CAF50' : '#FFD700'
                  }
                ]} />
              </View>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transações Recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transaction')}>
              <Text style={styles.seeAllText}>Ver Todas</Text>
            </TouchableOpacity>
          </View>
          
          {recentTransactions.length > 0 ? (
            <TransactionList transactions={recentTransactions} />
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome5 name="receipt" size={40} color="#666" />
              <Text style={styles.emptyStateText}>Nenhuma transação ainda</Text>
              <Text style={styles.emptyStateSubtext}>
                Adicione sua primeira transação para começar
              </Text>
            </View>
          )}
        </View>

        {/* Objectives */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Objetivos Financeiros</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transaction', { showObjectives: true })}>
              <Text style={styles.seeAllText}>Gerenciar</Text>
            </TouchableOpacity>
          </View>
          
          {incompleteObjectives.length > 0 ? (
            <ObjectivesList objectives={incompleteObjectives.slice(0, 3)} />
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="flag" size={40} color="#666" />
              <Text style={styles.emptyStateText}>Nenhum objetivo ativo</Text>
              <Text style={styles.emptyStateSubtext}>
                Defina metas financeiras para acompanhar seu progresso
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Side Menu */}
      <SideMenu
        visible={menuVisible}
        slideAnim={slideAnim}
        onClose={closeMenu}
        navigation={navigation}
      />
      
      {/* Overlay */}
      {menuVisible && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={closeMenu}
          activeOpacity={1}
        />
      )}
    </View>
  );
};

export default DashboardScreen;