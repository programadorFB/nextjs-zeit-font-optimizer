import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

const BettingContext = createContext();

// Action types
const BETTING_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_PROFILE: 'SET_PROFILE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  SET_SESSIONS: 'SET_SESSIONS',
  ADD_SESSION: 'ADD_SESSION',
  UPDATE_SESSION: 'UPDATE_SESSION',
  SET_STATS: 'SET_STATS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_DATA: 'RESET_DATA',
  SET_INITIALIZED: 'SET_INITIALIZED',
};

// Initial state
const initialState = {
  bettingProfile: {
    id: null,
    profileType: null,
    title: '',
    description: '',
    riskLevel: 5,
    initialBalance: 0,
    stopLoss: 0,
    profitTarget: 0,
    dailyTarget: 0,
    features: [],
    color: '#FFD700',
    iconName: 'dice',
    isInitialized: false,
    createdAt: null,
    updatedAt: null,
  },
  bettingSessions: [],
  bettingStats: {
    totalSessions: 0,
    winningSessions: 0,
    losingSessions: 0,
    winRate: 0,
    totalProfit: 0,
    avgSessionResult: 0,
    bestSession: 0,
    worstSession: 0,
  },
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Reducer
const bettingReducer = (state, action) => {
  switch (action.type) {
    case BETTING_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case BETTING_ACTIONS.SET_PROFILE:
      return {
        ...state,
        bettingProfile: {
          ...state.bettingProfile,
          ...action.payload,
          isInitialized: true,
        },
        lastUpdated: new Date().getTime(),
      };

    case BETTING_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        bettingProfile: {
          ...state.bettingProfile,
          ...action.payload,
          updatedAt: new Date().toISOString(),
        },
        lastUpdated: new Date().getTime(),
      };

    case BETTING_ACTIONS.SET_SESSIONS:
      return {
        ...state,
        bettingSessions: action.payload,
      };

    case BETTING_ACTIONS.ADD_SESSION:
      return {
        ...state,
        bettingSessions: [action.payload, ...state.bettingSessions],
      };

    case BETTING_ACTIONS.UPDATE_SESSION:
      return {
        ...state,
        bettingSessions: state.bettingSessions.map(session =>
          session.id === action.payload.id ? action.payload : session
        ),
      };

    case BETTING_ACTIONS.SET_STATS:
      return {
        ...state,
        bettingStats: action.payload,
      };

    case BETTING_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case BETTING_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case BETTING_ACTIONS.SET_INITIALIZED:
      return {
        ...state,
        bettingProfile: {
          ...state.bettingProfile,
          isInitialized: action.payload,
        },
      };

    case BETTING_ACTIONS.RESET_DATA:
      return initialState;

    default:
      return state;
  }
};

// Cache keys
const CACHE_KEYS = {
  BETTING_PROFILE: 'betting_profile',
  BETTING_SESSIONS: 'betting_sessions',
  BETTING_STATS: 'betting_stats',
};

// NOVA: Definição centralizada dos perfis
const PROFILES = {
  cautious: {
    id: 'cautious',
    title: 'Jogador Cauteloso',
    description: 'Prefere apostas seguras com menor risco, focando em preservar o bankroll e fazer ganhos consistentes.',
    color: '#4CAF50',
    icon: { name: 'shield-alt', color: '#4CAF50' },
    features: [
      'Apostas externas (vermelho/preto)',
      'Menor volatilidade',
      'Gestão rigorosa do bankroll',
      'Sessões mais longas'
    ]
  },
  balanced: {
    id: 'balanced',
    title: 'Jogador Equilibrado',
    description: 'Combina apostas seguras com algumas jogadas mais arriscadas, buscando equilíbrio entre risco e recompensa.',
    color: '#FFD700',
    icon: { name: 'balance-scale', color: '#FFD700' },
    features: [
      'Mix de apostas internas/externas',
      'Risco calculado',
      'Estratégias diversificadas',
      'Flexibilidade nas apostas'
    ]
  },
  highrisk: {
    id: 'highrisk',
    title: 'Jogador de Alto Risco',
    description: 'Busca grandes ganhos através de apostas de alto risco, aceitando maior volatilidade para maximizar retornos.',
    color: '#F44336',
    icon: { name: 'fire', color: '#F44336' },
    features: [
      'Apostas em números específicos',
      'Alta volatilidade',
      'Potencial de grandes ganhos',
      'Sessões intensas'
    ]
  }
};

export const BettingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bettingReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Initialize betting data when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      loadInitialData();
    } else {
      // Clear data when user logs out
      dispatch({ type: BETTING_ACTIONS.RESET_DATA });
      clearCache();
    }
  }, [isAuthenticated, user]);

  // Cache management
  const loadFromCache = async () => {
    try {
      const [cachedProfile, cachedSessions, cachedStats] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEYS.BETTING_PROFILE),
        AsyncStorage.getItem(CACHE_KEYS.BETTING_SESSIONS),
        AsyncStorage.getItem(CACHE_KEYS.BETTING_STATS),
      ]);

      if (cachedProfile) {
        dispatch({
          type: BETTING_ACTIONS.SET_PROFILE,
          payload: JSON.parse(cachedProfile),
        });
      }

      if (cachedSessions) {
        dispatch({
          type: BETTING_ACTIONS.SET_SESSIONS,
          payload: JSON.parse(cachedSessions),
        });
      }

      if (cachedStats) {
        dispatch({
          type: BETTING_ACTIONS.SET_STATS,
          payload: JSON.parse(cachedStats),
        });
      }
    } catch (error) {
      console.error('Error loading betting data from cache:', error);
    }
  };

  const saveToCache = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving betting data to cache:', error);
    }
  };

  const clearCache = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(CACHE_KEYS.BETTING_PROFILE),
        AsyncStorage.removeItem(CACHE_KEYS.BETTING_SESSIONS),
        AsyncStorage.removeItem(CACHE_KEYS.BETTING_STATS),
      ]);
    } catch (error) {
      console.error('Error clearing betting cache:', error);
    }
  };

  // Data loading functions
  const loadInitialData = async () => {
    dispatch({ type: BETTING_ACTIONS.SET_LOADING, payload: true });
    
    try {
      // Load from cache first
      await loadFromCache();
      
      // Then load fresh data from API
      await loadBettingProfile();
      await loadBettingStats();
    } catch (error) {
      console.error('Error loading initial betting data:', error);
      dispatch({
        type: BETTING_ACTIONS.SET_ERROR,
        payload: 'Failed to load betting data',
      });
    } finally {
      dispatch({ type: BETTING_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const loadBettingProfile = async () => {
    try {
      const response = await apiService.getBettingProfile();
      
      if (response.success && response.data) {
        const profileData = {
          id: response.data.id,
          profileType: response.data.profile_type,
          title: response.data.title,
          description: response.data.description,
          riskLevel: response.data.risk_level,
          initialBalance: parseFloat(response.data.initial_balance),
          stopLoss: parseFloat(response.data.stop_loss),
          profitTarget: parseFloat(response.data.profit_target),
          dailyTarget: parseFloat(response.data.daily_target || 0),
          features: response.data.features || [],
          color: response.data.color,
          iconName: response.data.icon_name,
          createdAt: response.data.created_at,
          updatedAt: response.data.updated_at,
        };

        dispatch({
          type: BETTING_ACTIONS.SET_PROFILE,
          payload: profileData,
        });

        await saveToCache(CACHE_KEYS.BETTING_PROFILE, profileData);
      } else {
        // No profile found, set as not initialized
        dispatch({
          type: BETTING_ACTIONS.SET_INITIALIZED,
          payload: false,
        });
      }
    } catch (error) {
      console.error('Error loading betting profile:', error);
      dispatch({
        type: BETTING_ACTIONS.SET_INITIALIZED,
        payload: false,
      });
    }
  };

  const loadBettingStats = async () => {
    try {
      const response = await apiService.getPerformanceStats();
      
      if (response.success && response.data) {
        const statsData = {
          totalSessions: response.data.total_sessions || 0,
          winningSessions: response.data.winning_sessions || 0,
          losingSessions: response.data.total_sessions - response.data.winning_sessions || 0,
          winRate: parseFloat(response.data.win_rate || 0),
          totalProfit: parseFloat(response.data.total_profit || 0),
          avgSessionResult: parseFloat(response.data.avg_session_result || 0),
          bestSession: parseFloat(response.data.best_session || 0),
          worstSession: parseFloat(response.data.worst_session || 0),
        };

        dispatch({
          type: BETTING_ACTIONS.SET_STATS,
          payload: statsData,
        });

        await saveToCache(CACHE_KEYS.BETTING_STATS, statsData);
      }
    } catch (error) {
      console.error('Error loading betting stats:', error);
    }
  };

  // Profile operations
  const saveCompleteProfile = async (profileData) => {
    dispatch({ type: BETTING_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const requestData = {
        profile: {
          id: profileData.profile.id,
          title: profileData.profile.title,
          description: profileData.profile.description,
          features: profileData.profile.features,
          color: profileData.profile.color,
          icon: { name: profileData.profile.icon?.name || 'dice' },
        },
        riskLevel: profileData.riskLevel,
        bankroll: profileData.bankroll || profileData.initialBalance,
        stopLoss: profileData.stopLoss,
        profitTarget: profileData.profitTarget,
      };

      const response = await apiService.createBettingProfile(requestData);
      
      if (response.success) {
        const savedProfile = {
          id: response.data.id,
          profileType: response.data.profile_type,
          title: response.data.title,
          description: response.data.description,
          riskLevel: response.data.risk_level,
          initialBalance: parseFloat(response.data.initial_balance),
          stopLoss: parseFloat(response.data.stop_loss),
          profitTarget: parseFloat(response.data.profit_target),
          features: response.data.features || [],
          color: response.data.color,
          iconName: response.data.icon_name,
          createdAt: response.data.created_at,
          updatedAt: response.data.updated_at,
        };

        dispatch({
          type: BETTING_ACTIONS.SET_PROFILE,
          payload: savedProfile,
        });

        await saveToCache(CACHE_KEYS.BETTING_PROFILE, savedProfile);
        
        return { success: true, data: savedProfile };
      } else {
        dispatch({
          type: BETTING_ACTIONS.SET_ERROR,
          payload: response.error || 'Failed to save profile',
        });
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error saving betting profile:', error);
      const errorMessage = error.message || 'Network error';
      dispatch({
        type: BETTING_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: BETTING_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const updateBettingProfile = async (updateData) => {
    if (!state.bettingProfile.id) {
      return { success: false, error: 'No profile to update' };
    }

    dispatch({ type: BETTING_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await apiService.updateBettingProfile(state.bettingProfile.id, updateData);
      
      if (response.success) {
        const updatedProfile = {
          ...state.bettingProfile,
          stopLoss: parseFloat(updateData.stopLoss || state.bettingProfile.stopLoss),
          profitTarget: parseFloat(updateData.profitTarget || state.bettingProfile.profitTarget),
          dailyTarget: parseFloat(updateData.dailyTarget || state.bettingProfile.dailyTarget),
          riskLevel: updateData.riskLevel || state.bettingProfile.riskLevel,
          updatedAt: new Date().toISOString(),
        };

        dispatch({
          type: BETTING_ACTIONS.UPDATE_PROFILE,
          payload: updatedProfile,
        });

        await saveToCache(CACHE_KEYS.BETTING_PROFILE, updatedProfile);
        
        return { success: true, data: updatedProfile };
      } else {
        dispatch({
          type: BETTING_ACTIONS.SET_ERROR,
          payload: response.error || 'Failed to update profile',
        });
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error updating betting profile:', error);
      const errorMessage = error.message || 'Network error';
      dispatch({
        type: BETTING_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: BETTING_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Session operations
  const startBettingSession = async (sessionData) => {
    try {
      const response = await apiService.startBettingSession(sessionData);
      
      if (response.success) {
        const newSession = {
          id: response.session_id,
          sessionId: response.session_id,
          startBalance: parseFloat(response.start_balance),
          gameType: sessionData.game_type,
          riskLevel: sessionData.risk_level,
          startedAt: new Date().toISOString(),
          status: 'active',
        };

        dispatch({
          type: BETTING_ACTIONS.ADD_SESSION,
          payload: newSession,
        });
        
        return { success: true, data: newSession };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error starting betting session:', error);
      return { success: false, error: error.message };
    }
  };

  const endBettingSession = async (sessionId) => {
    try {
      const response = await apiService.endBettingSession(sessionId);
      
      if (response.success) {
        const endedSession = {
          sessionId: response.data.session_id,
          startBalance: parseFloat(response.data.start_balance),
          endBalance: parseFloat(response.data.end_balance),
          netResult: parseFloat(response.data.net_result),
          durationSeconds: response.data.duration_seconds,
          endedAt: new Date().toISOString(),
          status: 'completed',
        };

        dispatch({
          type: BETTING_ACTIONS.UPDATE_SESSION,
          payload: endedSession,
        });

        // Refresh stats after session ends
        await loadBettingStats();
        
        return { success: true, data: endedSession };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error ending betting session:', error);
      return { success: false, error: error.message };
    }
  };

  // Sync with financial context
  const syncWithFinancialContext = useCallback((financialData) => {
    if (!state.bettingProfile.isInitialized && financialData.initialBankBalance > 0) {
      // Auto-initialize with financial data if no betting profile exists
      const autoProfile = {
        ...state.bettingProfile,
        initialBalance: financialData.initialBankBalance,
        isInitialized: true,
        title: 'Perfil Automático',
        description: 'Criado automaticamente baseado na banca inicial',
        profileType: 'balanced',
      };
      
      dispatch({
        type: BETTING_ACTIONS.SET_PROFILE,
        payload: autoProfile,
      });
    }
  }, [state.bettingProfile]);

  // Risk analysis helpers
  const getRiskStatus = () => {
    const { initialBalance, stopLoss } = state.bettingProfile;
    const currentBalance = 0; // This should come from financial context
    
    if (stopLoss <= 0) return 'undefined';
    if (currentBalance <= stopLoss) return 'critical';
    
    const distancePercentage = ((currentBalance - stopLoss) / initialBalance) * 100;
    
    if (distancePercentage < 5) return 'high';
    if (distancePercentage < 15) return 'medium';
    return 'low';
  };

  const getProfileRecommendations = () => {
    const { riskLevel } = state.bettingProfile;
    
    if (riskLevel <= 3) {
      return {
        type: 'conservative',
        stopLossPercentage: 10,
        profitTargetPercentage: 25,
        maxBetPercentage: 2,
      };
    } else if (riskLevel <= 6) {
      return {
        type: 'moderate',
        stopLossPercentage: 20,
        profitTargetPercentage: 50,
        maxBetPercentage: 5,
      };
    } else {
      return {
        type: 'aggressive',
        stopLossPercentage: 40,
        profitTargetPercentage: 100,
        maxBetPercentage: 10,
      };
    }
  };
  
  // NOVA: Helper function para obter detalhes do perfil
  const getProfileDetailsByRisk = (riskLevel) => {
    if (riskLevel <= 3) return PROFILES.cautious;
    if (riskLevel <= 6) return PROFILES.balanced;
    return PROFILES.highrisk;
  };

  const clearError = () => {
    dispatch({ type: BETTING_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    // State
    bettingProfile: state.bettingProfile,
    bettingSessions: state.bettingSessions,
    bettingStats: state.bettingStats,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    
    // Actions
    saveCompleteProfile,
    updateBettingProfile,
    startBettingSession,
    endBettingSession,
    loadBettingProfile,
    loadBettingStats,
    syncWithFinancialContext,
    clearError,
    
    // Helper functions
    getRiskStatus,
    getProfileRecommendations,
    getProfileDetailsByRisk, // NOVO: Exportar a função
  };

  return (
    <BettingContext.Provider value={value}>
      {children}
    </BettingContext.Provider>
  );
};

export const useBetting = () => {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  return context;
};

export default BettingContext;