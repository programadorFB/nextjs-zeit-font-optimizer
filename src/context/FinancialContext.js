import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

const FinancialContext = createContext();

// Action types
const FINANCIAL_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_REFRESHING: 'SET_REFRESHING',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  SET_BALANCE: 'SET_BALANCE',
  SET_OBJECTIVES: 'SET_OBJECTIVES',
  ADD_OBJECTIVE: 'ADD_OBJECTIVE',
  UPDATE_OBJECTIVE: 'UPDATE_OBJECTIVE',
  DELETE_OBJECTIVE: 'DELETE_OBJECTIVE',
  SET_ANALYTICS: 'SET_ANALYTICS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_DATA: 'RESET_DATA',
};

// Initial state
const initialState = {
  transactions: [],
  balance: 0,
  objectives: [],
  analytics: {
    overview: null,
    monthly: [],
    performance: null,
    riskAnalysis: null,
  },
  categories: [],
  loading: false,
  refreshing: false,
  error: null,
  lastUpdated: null,
};

// Reducer
const financialReducer = (state, action) => {
  switch (action.type) {
    case FINANCIAL_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case FINANCIAL_ACTIONS.SET_REFRESHING:
      return {
        ...state,
        refreshing: action.payload,
      };

    case FINANCIAL_ACTIONS.SET_TRANSACTIONS:
      return {
        ...state,
        transactions: action.payload,
        lastUpdated: new Date().getTime(),
      };

    case FINANCIAL_ACTIONS.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        lastUpdated: new Date().getTime(),
      };

    case FINANCIAL_ACTIONS.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map(tx =>
          tx.id === action.payload.id ? action.payload : tx
        ),
        lastUpdated: new Date().getTime(),
      };

    case FINANCIAL_ACTIONS.DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter(tx => tx.id !== action.payload),
        lastUpdated: new Date().getTime(),
      };

    case FINANCIAL_ACTIONS.SET_BALANCE:
      return {
        ...state,
        balance: action.payload,
      };

    case FINANCIAL_ACTIONS.SET_OBJECTIVES:
      return {
        ...state,
        objectives: action.payload,
      };

    case FINANCIAL_ACTIONS.ADD_OBJECTIVE:
      return {
        ...state,
        objectives: [action.payload, ...state.objectives],
      };

    case FINANCIAL_ACTIONS.UPDATE_OBJECTIVE:
      return {
        ...state,
        objectives: state.objectives.map(obj =>
          obj.id === action.payload.id ? action.payload : obj
        ),
      };

    case FINANCIAL_ACTIONS.DELETE_OBJECTIVE:
      return {
        ...state,
        objectives: state.objectives.filter(obj => obj.id !== action.payload),
      };

    case FINANCIAL_ACTIONS.SET_ANALYTICS:
      return {
        ...state,
        analytics: {
          ...state.analytics,
          ...action.payload,
        },
      };

    case FINANCIAL_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        refreshing: false,
      };

    case FINANCIAL_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case FINANCIAL_ACTIONS.RESET_DATA:
      return initialState;

    default:
      return state;
  }
};

// Cache keys
const CACHE_KEYS = {
  TRANSACTIONS: 'cached_transactions',
  BALANCE: 'cached_balance',
  OBJECTIVES: 'cached_objectives',
  LAST_SYNC: 'last_sync_time',
};

export const FinancialProvider = ({ children }) => {
  const [state, dispatch] = useReducer(financialReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Initialize data when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      loadInitialData();
    } else {
      // Clear data when user logs out
      dispatch({ type: FINANCIAL_ACTIONS.RESET_DATA });
      clearCache();
    }
  }, [isAuthenticated, user]);

  // Cache management
  const loadFromCache = async () => {
    try {
      const [cachedTransactions, cachedBalance, cachedObjectives] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(CACHE_KEYS.BALANCE),
        AsyncStorage.getItem(CACHE_KEYS.OBJECTIVES),
      ]);

      if (cachedTransactions) {
        dispatch({
          type: FINANCIAL_ACTIONS.SET_TRANSACTIONS,
          payload: JSON.parse(cachedTransactions),
        });
      }

      if (cachedBalance) {
        dispatch({
          type: FINANCIAL_ACTIONS.SET_BALANCE,
          payload: parseFloat(cachedBalance),
        });
      }

      if (cachedObjectives) {
        dispatch({
          type: FINANCIAL_ACTIONS.SET_OBJECTIVES,
          payload: JSON.parse(cachedObjectives),
        });
      }
    } catch (error) {
      console.error('Error loading from cache:', error);
    }
  };

  const saveToCache = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  const clearCache = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(CACHE_KEYS.TRANSACTIONS),
        AsyncStorage.removeItem(CACHE_KEYS.BALANCE),
        AsyncStorage.removeItem(CACHE_KEYS.OBJECTIVES),
        AsyncStorage.removeItem(CACHE_KEYS.LAST_SYNC),
      ]);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  // Data loading functions
  const loadInitialData = async () => {
    dispatch({ type: FINANCIAL_ACTIONS.SET_LOADING, payload: true });
    
    try {
      // Load from cache first for immediate UI update
      await loadFromCache();
      
      // Then load fresh data from API
      await refreshData();
    } catch (error) {
      console.error('Error loading initial data:', error);
      dispatch({
        type: FINANCIAL_ACTIONS.SET_ERROR,
        payload: 'Failed to load financial data',
      });
    } finally {
      dispatch({ type: FINANCIAL_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const refreshData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      dispatch({ type: FINANCIAL_ACTIONS.SET_REFRESHING, payload: true });
    }
    
    try {
      const [transactionsResponse, balanceResponse, objectivesResponse] = await Promise.all([
        apiService.getTransactions(),
        apiService.getBalance(),
        apiService.getObjectives(),
      ]);

      // Update transactions
      if (transactionsResponse.success) {
        dispatch({
          type: FINANCIAL_ACTIONS.SET_TRANSACTIONS,
          payload: transactionsResponse.data,
        });
        await saveToCache(CACHE_KEYS.TRANSACTIONS, transactionsResponse.data);
      }

      // Update balance
      if (balanceResponse.success) {
        const balance = parseFloat(balanceResponse.balance);
        dispatch({
          type: FINANCIAL_ACTIONS.SET_BALANCE,
          payload: balance,
        });
        await saveToCache(CACHE_KEYS.BALANCE, balance.toString());
      }

      // Update objectives
      if (objectivesResponse.success) {
        dispatch({
          type: FINANCIAL_ACTIONS.SET_OBJECTIVES,
          payload: objectivesResponse.data,
        });
        await saveToCache(CACHE_KEYS.OBJECTIVES, objectivesResponse.data);
      }

      // Save last sync time
      await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().getTime().toString());
      
      dispatch({ type: FINANCIAL_ACTIONS.CLEAR_ERROR });
    } catch (error) {
      console.error('Error refreshing data:', error);
      dispatch({
        type: FINANCIAL_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to refresh data',
      });
    } finally {
      if (showRefreshing) {
        dispatch({ type: FINANCIAL_ACTIONS.SET_REFRESHING, payload: false });
      }
    }
  }, []);

  // Transaction operations
  const addTransaction = async (transactionData) => {
    try {
      const response = await apiService.createTransaction(transactionData);
      
      if (response.success) {
        dispatch({
          type: FINANCIAL_ACTIONS.ADD_TRANSACTION,
          payload: response.data,
        });
        
        // Update balance
        const newBalance = parseFloat(response.data.balance_after);
        dispatch({
          type: FINANCIAL_ACTIONS.SET_BALANCE,
          payload: newBalance,
        });
        
        // Update cache
        const updatedTransactions = [response.data, ...state.transactions];
        await saveToCache(CACHE_KEYS.TRANSACTIONS, updatedTransactions);
        await saveToCache(CACHE_KEYS.BALANCE, newBalance.toString());
        
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      return { success: false, error: error.message };
    }
  };

  const updateTransaction = async (transactionId, updateData) => {
    try {
      const response = await apiService.updateTransaction(transactionId, updateData);
      
      if (response.success) {
        dispatch({
          type: FINANCIAL_ACTIONS.UPDATE_TRANSACTION,
          payload: response.data,
        });
        
        // Refresh balance
        await refreshBalance();
        
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      const response = await apiService.deleteTransaction(transactionId);
      
      if (response.success) {
        dispatch({
          type: FINANCIAL_ACTIONS.DELETE_TRANSACTION,
          payload: transactionId,
        });
        
        // Refresh balance
        await refreshBalance();
        
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return { success: false, error: error.message };
    }
  };

  // Objective operations
  const addObjective = async (objectiveData) => {
    try {
      const response = await apiService.createObjective(objectiveData);
      
      if (response.success) {
        dispatch({
          type: FINANCIAL_ACTIONS.ADD_OBJECTIVE,
          payload: response.data,
        });
        
        // Update cache
        const updatedObjectives = [response.data, ...state.objectives];
        await saveToCache(CACHE_KEYS.OBJECTIVES, updatedObjectives);
        
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error adding objective:', error);
      return { success: false, error: error.message };
    }
  };

  const updateObjective = async (objectiveId, updateData) => {
    try {
      const response = await apiService.updateObjective(objectiveId, updateData);
      
      if (response.success) {
        dispatch({
          type: FINANCIAL_ACTIONS.UPDATE_OBJECTIVE,
          payload: response.data,
        });
        
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error updating objective:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteObjective = async (objectiveId) => {
    try {
      const response = await apiService.deleteObjective(objectiveId);
      
      if (response.success) {
        dispatch({
          type: FINANCIAL_ACTIONS.DELETE_OBJECTIVE,
          payload: objectiveId,
        });
        
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error deleting objective:', error);
      return { success: false, error: error.message };
    }
  };

  // Analytics operations
  const loadAnalytics = async () => {
    try {
      const [overviewResponse, monthlyResponse, performanceResponse, riskResponse] = await Promise.all([
        apiService.getAnalyticsOverview(),
        apiService.getMonthlyAnalytics(),
        apiService.getPerformanceStats(),
        apiService.getRiskAnalysis(),
      ]);

      const analyticsData = {};
      
      if (overviewResponse.success) {
        analyticsData.overview = overviewResponse.data;
      }
      
      if (monthlyResponse.success) {
        analyticsData.monthly = monthlyResponse.data;
      }
      
      if (performanceResponse.success) {
        analyticsData.performance = performanceResponse.data;
      }
      
      if (riskResponse.success) {
        analyticsData.riskAnalysis = riskResponse.data;
      }

      dispatch({
        type: FINANCIAL_ACTIONS.SET_ANALYTICS,
        payload: analyticsData,
      });
      
      return { success: true, data: analyticsData };
    } catch (error) {
      console.error('Error loading analytics:', error);
      return { success: false, error: error.message };
    }
  };

  // Helper functions
  const refreshBalance = async () => {
    try {
      const response = await apiService.getBalance();
      if (response.success) {
        const balance = parseFloat(response.balance);
        dispatch({
          type: FINANCIAL_ACTIONS.SET_BALANCE,
          payload: balance,
        });
        await saveToCache(CACHE_KEYS.BALANCE, balance.toString());
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };

  const clearError = () => {
    dispatch({ type: FINANCIAL_ACTIONS.CLEAR_ERROR });
  };

  // Computed values
  const totalDeposits = state.transactions
    .filter(tx => tx.type === 'deposit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalWithdraws = state.transactions
    .filter(tx => tx.type === 'withdraw')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const initialBankBalance = state.transactions
    .find(tx => tx.is_initial_bank)?.amount || 0;

  const getEffectiveInitialBalance = () => {
    return initialBankBalance || totalDeposits || 0;
  };

  const getOperationalProfit = () => {
    const effectiveInitial = getEffectiveInitialBalance();
    return state.balance - effectiveInitial;
  };

  // Categories helper
  const getUniqueCategories = () => {
    const categories = state.transactions
      .map(tx => tx.category)
      .filter(Boolean);
    return [...new Set(categories)];
  };

  // Monthly data helper
  const getMonthlyData = () => {
    const monthlyData = {};
    
    state.transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          deposits: 0,
          withdraws: 0,
          balance: 0,
        };
      }
      
      if (tx.type === 'deposit') {
        monthlyData[monthKey].deposits += tx.amount;
      } else {
        monthlyData[monthKey].withdraws += tx.amount;
      }
      
      monthlyData[monthKey].balance = monthlyData[monthKey].deposits - monthlyData[monthKey].withdraws;
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  // Category data helper
  const getCategoryData = () => {
    const categoryData = {};
    
    state.transactions
      .filter(tx => tx.type === 'withdraw')
      .forEach(tx => {
        const category = tx.category || 'Outros';
        if (!categoryData[category]) {
          categoryData[category] = {
            category,
            amount: 0,
            count: 0,
          };
        }
        categoryData[category].amount += tx.amount;
        categoryData[category].count += 1;
      });
    
    return Object.values(categoryData).sort((a, b) => b.amount - a.amount);
  };

  const value = {
    // State
    transactions: state.transactions,
    balance: state.balance,
    objectives: state.objectives,
    analytics: state.analytics,
    loading: state.loading,
    refreshing: state.refreshing,
    error: state.error,
    lastUpdated: state.lastUpdated,
    
    // Computed values
    totalDeposits,
    totalWithdraws,
    initialBankBalance,
    
    // Actions
    refreshData,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addObjective,
    updateObjective,
    deleteObjective,
    loadAnalytics,
    clearError,
    
    // Helper functions
    getEffectiveInitialBalance,
    getOperationalProfit,
    getUniqueCategories,
    getMonthlyData,
    getCategoryData,
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

export default FinancialContext;