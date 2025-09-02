// Enhanced api.js with proper error handling and authentication
// ATUALIZADO COM SUPORTE COMPLETO À BANCA INICIAL

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000';
    } else {
      return 'http://localhost:5000';
    }
  } else {
    return 'https://your-production-api.com';
  }
};

const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management with AsyncStorage
const tokenManager = {
  async getToken() {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(token) {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  async clearToken() {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (__DEV__) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log('Request Data:', config.data);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`API Response: ${response.config.url} - ${response.status}`);
    }
    return response.data || response;
  },
  async (error) => {
    if (__DEV__) {
      console.error('API Error:', error.response?.data || error.message);
    }

    if (error.response?.status === 401) {
      await tokenManager.clearToken();
      // Trigger logout in your app
    }

    const message = error.response?.data?.error || 
                   error.response?.data?.message || 
                   error.message || 
                   'Network error';
    
    return Promise.reject(new Error(message));
  }
);

// Updated API service
const apiService = {
  // Token management
  setAuthToken: tokenManager.setToken,
  getAuthToken: tokenManager.getToken,
  clearAuthToken: tokenManager.clearToken,

  // Auth endpoints
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.success && response.token) {
        await tokenManager.setToken(response.token);
      }
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // REGISTRO ATUALIZADO COM VALIDAÇÃO DE BANCA INICIAL
  async register(name, email, password, initialBank) {
    try {
      // Validações básicas no frontend
      if (!name || !email || !password) {
        return {
          success: false,
          error: 'Nome, email e senha são obrigatórios'
        };
      }

      if (!initialBank || initialBank <= 0) {
        return {
          success: false,
          error: 'Banca inicial é obrigatória e deve ser maior que zero'
        };
      }

      // Converter para número se for string
      const bankAmount = typeof initialBank === 'string' ? parseFloat(initialBank.replace(',', '.')) : initialBank;
      
      if (isNaN(bankAmount) || bankAmount <= 0) {
        return {
          success: false,
          error: 'Valor da banca inicial inválido'
        };
      }

      // Fazer a requisição com o campo correto
      const response = await api.post('/auth/register', { 
        name: name.trim(), 
        email: email.trim().toLowerCase(), 
        password,
        initialBank: bankAmount  // Campo esperado pelo backend
      });

      if (response.success && response.token) {
        await tokenManager.setToken(response.token);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Logout API call failed, but clearing local token');
    } finally {
      await tokenManager.clearToken();
    }
  },

  // User profile
  async getUserProfile() {
    try {
      return await api.get('/user/profile');
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Dashboard
  async getDashboardOverview() {
    try {
      return await api.get('/dashboard/overview');
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Betting Profile endpoints
  getBettingProfile: () => api.get('/betting-profiles'),
  createBettingProfile: (data) => api.post('/betting-profiles', data),
  updateBettingProfile: (profileId, data) => api.put(`/betting-profiles/${profileId}`, data),

  // Transactions
  getBalance: () => api.get('/balance'),
  getTransactions: (params = {}) => api.get('/transactions', { params }),
  
  // TRANSAÇÃO ATUALIZADA COM VALIDAÇÃO DE CATEGORIA
  async createTransaction(data) {
    try {
      // Validação de categoria obrigatória
      if (!data.category) {
        return {
          success: false,
          error: 'Categoria é obrigatória'
        };
      }

      if (!data.amount || data.amount <= 0) {
        return {
          success: false,
          error: 'Valor deve ser maior que zero'
        };
      }

      if (!data.type || !['deposit', 'withdraw'].includes(data.type)) {
        return {
          success: false,
          error: 'Tipo de transação inválido'
        };
      }

      return await api.post('/transactions', data);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  updateTransaction: (transactionId, data) => api.put(`/transactions/${transactionId}`, data),
  deleteTransaction: (transactionId) => api.delete(`/transactions/${transactionId}`),
  
  // Objectives
  getObjectives: () => api.get('/objectives'),
  createObjective: (data) => api.post('/objectives', data),
  updateObjective: (objectiveId, data) => api.put(`/objectives/${objectiveId}`, data),
  deleteObjective: (objectiveId) => api.delete(`/objectives/${objectiveId}`),

  // Analytics
  getAnalyticsOverview: () => api.get('/analytics/overview'),
  getMonthlyAnalytics: (months = 6) => api.get('/analytics/monthly', { params: { months } }),
  getPerformanceStats: (period = 'monthly') => api.get('/stats/performance', { params: { period } }),
  getRiskAnalysis: () => api.get('/stats/risk-analysis'),
  
  // Categories
  getCategories: () => api.get('/categories'),
  getGameTypes: () => api.get('/game-types'),
  
  // Health check
  healthCheck: () => api.get('/health'),

  // Test connection
  async testConnection() {
    try {
      const response = await api.get('/health');
      console.log('API Connection successful:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('API Connection failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Utility methods for initial bank validation
  validateInitialBank(amount) {
    const minAmount = 1.00;
    const maxAmount = 1000000.00;
    
    if (!amount || amount <= 0) {
      return {
        isValid: false,
        error: 'Banca inicial deve ser maior que zero'
      };
    }

    const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(',', '.')) : amount;
    
    if (isNaN(numericAmount)) {
      return {
        isValid: false,
        error: 'Valor inválido'
      };
    }

    if (numericAmount < minAmount) {
      return {
        isValid: false,
        error: `Banca inicial deve ser de pelo menos R$ ${minAmount.toFixed(2)}`
      };
    }

    if (numericAmount > maxAmount) {
      return {
        isValid: false,
        error: `Banca inicial não pode exceder R$ ${maxAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      };
    }

    return {
      isValid: true,
      amount: numericAmount
    };
  },

  // Format currency for display
  formatCurrency(amount) {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(',', '.')) : amount;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericAmount);
  },

  // Parse currency input
  parseCurrencyInput(input) {
    if (!input) return 0;
    
    // Remove tudo que não é número, vírgula ou ponto
    const cleaned = input.toString().replace(/[^\d.,]/g, '');
    
    // Substituir vírgula por ponto para conversão
    const normalized = cleaned.replace(',', '.');
    
    return parseFloat(normalized) || 0;
  }
};

export default apiService;