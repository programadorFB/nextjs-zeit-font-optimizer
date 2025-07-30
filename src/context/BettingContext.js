import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BettingContext = createContext();

export const useBetting = () => {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  return context;
};

export const BettingProvider = ({ children }) => {
  const [bettingProfile, setBettingProfile] = useState({
    initialBalance: 0,
    riskLevel: 5,
    stopLoss: 0,
    profitTarget: 0,
    profileType: 'balanced', // cautious, balanced, highrisk
    profileData: null, // Complete profile from InvestmentProfile
    isInitialized: false,
  });

  const [bettingHistory, setBettingHistory] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);

  // Carregar dados do AsyncStorage
  useEffect(() => {
    loadBettingData();
  }, []);

  const loadBettingData = async () => {
    try {
      const profileData = await AsyncStorage.getItem('bettingProfile');
      const historyData = await AsyncStorage.getItem('bettingHistory');
      const sessionData = await AsyncStorage.getItem('currentSession');

      if (profileData) {
        const profile = JSON.parse(profileData);
        setBettingProfile(profile);
      }

      if (historyData) {
        setBettingHistory(JSON.parse(historyData));
      }

      if (sessionData) {
        setCurrentSession(JSON.parse(sessionData));
      }
    } catch (error) {
      console.error('Erro ao carregar dados de apostas:', error);
    }
  };

  const saveBettingProfile = async (profileData) => {
    try {
      const updatedProfile = {
        ...bettingProfile,
        ...profileData,
        isInitialized: true,
      };

      setBettingProfile(updatedProfile);
      await AsyncStorage.setItem('bettingProfile', JSON.stringify(updatedProfile));
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar perfil de apostas:', error);
      return { success: false, error: 'Falha ao salvar perfil' };
    }
  };

  const updateBettingProfile = async (updates) => {
    try {
      const updatedProfile = {
        ...bettingProfile,
        ...updates,
      };

      setBettingProfile(updatedProfile);
      await AsyncStorage.setItem('bettingProfile', JSON.stringify(updatedProfile));
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil de apostas:', error);
      return { success: false, error: 'Falha ao atualizar perfil' };
    }
  };

  // New function to save complete profile from InvestmentProfile
  const saveCompleteProfile = async (profileFromInvestment) => {
    try {
      const completeProfile = {
        ...bettingProfile,
        initialBalance: profileFromInvestment.bankroll || profileFromInvestment.initialBalance,
        riskLevel: profileFromInvestment.riskLevel,
        stopLoss: profileFromInvestment.stopLoss,
        profitTarget: profileFromInvestment.profitTarget || 0,
        profileType: profileFromInvestment.profile?.id || getProfileTypeFromRisk(profileFromInvestment.riskLevel),
        profileData: profileFromInvestment.profile, // Complete profile object
        isInitialized: true,
        lastUpdated: new Date().toISOString(),
      };

      setBettingProfile(completeProfile);
      await AsyncStorage.setItem('bettingProfile', JSON.stringify(completeProfile));
      
      return { success: true, profile: completeProfile };
    } catch (error) {
      console.error('Erro ao salvar perfil completo:', error);
      return { success: false, error: 'Falha ao salvar perfil completo' };
    }
  };

  // Helper function to determine profile type from risk level
  const getProfileTypeFromRisk = (riskLevel) => {
    if (riskLevel <= 3) return 'cautious';
    if (riskLevel <= 6) return 'balanced';
    return 'highrisk';
  };

  // Function to get current profile data for display
  const getCurrentProfileData = () => {
    // If we have saved profile data from InvestmentProfile, use it
    if (bettingProfile.profileData) {
      return bettingProfile.profileData;
    }

    // Otherwise, create profile data based on current settings
    const profiles = {
      cautious: {
        id: 'cautious',
        title: 'Jogador Cauteloso',
        description: 'Prefere apostas seguras com menor risco',
        color: '#4CAF50',
        expectedReturn: 'Ganhos Baixos/Constantes',
        icon: { name: 'shield-alt', color: '#4CAF50' }
      },
      balanced: {
        id: 'balanced',
        title: 'Jogador Equilibrado', 
        description: 'Equilíbrio entre risco e recompensa',
        color: '#FFD700',
        expectedReturn: 'Ganhos Moderados',
        icon: { name: 'balance-scale', color: '#FFD700' }
      },
      highrisk: {
        id: 'highrisk',
        title: 'Jogador de Alto Risco',
        description: 'Busca grandes ganhos com alta volatilidade', 
        color: '#F44336',
        expectedReturn: 'Ganhos Altos/Voláteis',
        icon: { name: 'fire', color: '#F44336' }
      }
    };

    return profiles[bettingProfile.profileType] || profiles.balanced;
  };

  const initializeBettingProfile = async (initialBalance) => {
    const defaultProfile = {
      initialBalance: initialBalance,
      riskLevel: 5,
      stopLoss: initialBalance * 0.2, // 20% do valor inicial como padrão
      profitTarget: initialBalance * 0.5, // 50% de lucro como meta padrão
      profileType: 'balanced',
      profileData: null,
      isInitialized: true,
      createdAt: new Date().toISOString(),
    };

    return await saveBettingProfile(defaultProfile);
  };

  const startBettingSession = async (sessionData = {}) => {
    try {
      const session = {
        id: Date.now().toString(),
        startTime: new Date().toISOString(),
        initialBalance: bettingProfile.initialBalance,
        currentBalance: bettingProfile.initialBalance,
        bets: [],
        status: 'active',
        profileUsed: getCurrentProfileData(),
        ...sessionData,
      };

      setCurrentSession(session);
      await AsyncStorage.setItem('currentSession', JSON.stringify(session));
      
      return { success: true, session };
    } catch (error) {
      console.error('Erro ao iniciar sessão de apostas:', error);
      return { success: false, error: 'Falha ao iniciar sessão' };
    }
  };

  const endBettingSession = async (endData = {}) => {
    try {
      if (!currentSession) {
        return { success: false, error: 'Nenhuma sessão ativa' };
      }

      const endedSession = {
        ...currentSession,
        endTime: new Date().toISOString(),
        status: 'completed',
        ...endData,
      };

      // Adicionar à história
      const updatedHistory = [...bettingHistory, endedSession];
      setBettingHistory(updatedHistory);
      await AsyncStorage.setItem('bettingHistory', JSON.stringify(updatedHistory));

      // Limpar sessão atual
      setCurrentSession(null);
      await AsyncStorage.removeItem('currentSession');
      
      return { success: true, session: endedSession };
    } catch (error) {
      console.error('Erro ao finalizar sessão de apostas:', error);
      return { success: false, error: 'Falha ao finalizar sessão' };
    }
  };

  const addBetToSession = async (betData) => {
    try {
      if (!currentSession) {
        return { success: false, error: 'Nenhuma sessão ativa' };
      }

      const bet = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...betData,
      };

      const updatedSession = {
        ...currentSession,
        bets: [...currentSession.bets, bet],
        currentBalance: betData.newBalance || currentSession.currentBalance,
      };

      setCurrentSession(updatedSession);
      await AsyncStorage.setItem('currentSession', JSON.stringify(updatedSession));
      
      return { success: true, bet };
    } catch (error) {
      console.error('Erro ao adicionar aposta à sessão:', error);
      return { success: false, error: 'Falha ao adicionar aposta' };
    }
  };

  const checkStopLoss = (currentBalance) => {
    if (bettingProfile.stopLoss > 0 && currentBalance <= bettingProfile.stopLoss) {
      return {
        triggered: true,
        message: `Stop Loss atingido! Limite: R$ ${bettingProfile.stopLoss.toFixed(2)}`,
        lossAmount: bettingProfile.initialBalance - currentBalance,
      };
    }
    return { triggered: false };
  };

  const checkProfitTarget = (currentBalance) => {
    const targetBalance = bettingProfile.initialBalance + bettingProfile.profitTarget;
    if (bettingProfile.profitTarget > 0 && currentBalance >= targetBalance) {
      return {
        achieved: true,
        message: `Meta de lucro atingida! Objetivo: R$ ${targetBalance.toFixed(2)}`,
        profitAmount: currentBalance - bettingProfile.initialBalance,
      };
    }
    return { achieved: false };
  };

  const getBettingStatistics = () => {
    const totalSessions = bettingHistory.length;
    const completedSessions = bettingHistory.filter(s => s.status === 'completed');
    
    let totalProfit = 0;
    let totalLoss = 0;
    let winSessions = 0;
    let lossSessions = 0;

    completedSessions.forEach(session => {
      const result = session.currentBalance - session.initialBalance;
      if (result > 0) {
        totalProfit += result;
        winSessions++;
      } else if (result < 0) {
        totalLoss += Math.abs(result);
        lossSessions++;
      }
    });

    const winRate = totalSessions > 0 ? (winSessions / totalSessions) * 100 : 0;
    const averageProfit = winSessions > 0 ? totalProfit / winSessions : 0;
    const averageLoss = lossSessions > 0 ? totalLoss / lossSessions : 0;

    return {
      totalSessions,
      winSessions,
      lossSessions,
      winRate,
      totalProfit,
      totalLoss,
      netResult: totalProfit - totalLoss,
      averageProfit,
      averageLoss,
      currentProfile: getCurrentProfileData(),
    };
  };

  const getProfileRecommendations = () => {
    const stats = getBettingStatistics();
    const recommendations = [];

    if (stats.winRate < 40) {
      recommendations.push({
        type: 'warning',
        title: 'Taxa de Vitória Baixa',
        message: 'Considere reduzir seu nível de risco ou revisar sua estratégia.',
      });
    }

    if (stats.averageLoss > stats.averageProfit) {
      recommendations.push({
        type: 'alert',
        title: 'Gestão de Risco',
        message: 'Suas perdas médias são maiores que seus ganhos. Considere ajustar o stop-loss.',
      });
    }

    if (bettingProfile.riskLevel > 7 && stats.winRate < 50) {
      recommendations.push({
        type: 'suggestion',
        title: 'Perfil de Risco Alto',
        message: 'Com sua taxa de vitória atual, um perfil mais conservador pode ser mais adequado.',
      });
    }

    return recommendations;
  };

  const resetBettingData = async () => {
    try {
      await AsyncStorage.multiRemove(['bettingProfile', 'bettingHistory', 'currentSession']);
      setBettingProfile({
        initialBalance: 0,
        riskLevel: 5,
        stopLoss: 0,
        profitTarget: 0,
        profileType: 'balanced',
        profileData: null,
        isInitialized: false,
      });
      setBettingHistory([]);
      setCurrentSession(null);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao resetar dados de apostas:', error);
      return { success: false, error: 'Falha ao resetar dados' };
    }
  };

  const value = {
    // Estado
    bettingProfile,
    bettingHistory,
    currentSession,

    // Ações do perfil
    saveBettingProfile,
    updateBettingProfile,
    initializeBettingProfile,
    saveCompleteProfile, // New function
    getCurrentProfileData, // New function

    // Ações de sessão
    startBettingSession,
    endBettingSession,
    addBetToSession,

    // Verificações
    checkStopLoss,
    checkProfitTarget,

    // Estatísticas e análises
    getBettingStatistics,
    getProfileRecommendations,

    // Utilitários
    resetBettingData,
    loadBettingData,
  };

  return (
    <BettingContext.Provider value={value}>
      {children}
    </BettingContext.Provider>
  );
};

// Add this export to your BettingContext.js file
export const useBettingProfile = () => {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error('useBettingProfile must be used within a BettingProvider');
  }
  
  // Return specific profile data for components that only need profile info
  return {
    profileData: context.bettingProfile,
    updateProfile: context.updateBettingProfile,
    initializeProfile: context.initializeBettingProfile,
    saveProfile: context.saveBettingProfile,
    saveCompleteProfile: context.saveCompleteProfile,
    getCurrentProfileData: context.getCurrentProfileData,
  };
};