import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

const AuthContext = createContext();

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  UPDATE_PROFILE_START: 'UPDATE_PROFILE_START',
  UPDATE_PROFILE_SUCCESS: 'UPDATE_PROFILE_SUCCESS',
  UPDATE_PROFILE_FAILURE: 'UPDATE_PROFILE_FAILURE',
  RESTORE_SESSION: 'RESTORE_SESSION',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.UPDATE_PROFILE_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        isInitializing: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.UPDATE_PROFILE_FAILURE:
      return {
        ...state,
        isLoading: false,
        isInitializing: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isInitializing: false,
      };

    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isInitializing: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'userToken',
  USER: 'userData',
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize - check for existing session
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const [savedToken, savedUser] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (savedToken && savedUser) {
        const userData = JSON.parse(savedUser);
        
        // Set token in API service
        apiService.setAuthToken(savedToken);
        
        // Validate token with server (optional - you can skip this if you trust stored tokens)
        try {
          // You could add a /auth/validate endpoint or just try to fetch user profile
          const response = await apiService.getUserProfile();
          if (response.success) {
            dispatch({
              type: AUTH_ACTIONS.RESTORE_SESSION,
              payload: {
                user: response.data || userData,
                token: savedToken,
              },
            });
            return;
          }
        } catch (error) {
          // Token invalid, clear storage
          await clearStorage();
        }
      }
      
      // No valid session found
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('Error initializing auth:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const saveToStorage = async (token, user) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
      ]);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  const clearStorage = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await apiService.login(email, password);
      
      if (response.success) {
        const { token, user } = response;
        
        // Set token in API service
        apiService.setAuthToken(token);
        
        // Save to storage
        await saveToStorage(token, user);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { token, user },
        });
        
        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: response.error || 'Login failed',
        });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Network error';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // FUNÇÃO REGISTER ATUALIZADA COM BANCA INICIAL
  const register = async (name, email, password, initialBank) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      // Validação da banca inicial
      if (!initialBank || initialBank <= 0) {
        const errorMessage = 'Banca inicial deve ser maior que zero';
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: errorMessage,
        });
        return { success: false, error: errorMessage };
      }

      // Chama a API de registro com a banca inicial
      const response = await apiService.register(name, email, password, initialBank);
      
      if (response.success) {
        const { token, user } = response;
        
        // Set token in API service
        apiService.setAuthToken(token);
        
        // Save to storage
        await saveToStorage(token, user);
        
        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: { token, user },
        });
        
        return { success: true, message: 'Conta criada com sucesso! Sua banca inicial foi definida.' };
      } else {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: response.error || 'Registration failed',
        });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Network error';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (profileData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_PROFILE_START });

    try {
      const response = await apiService.updateUserProfile(profileData);
      
      if (response.success) {
        const updatedUser = { ...state.user, ...response.data };
        
        // Update storage
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        
        dispatch({
          type: AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS,
          payload: { user: updatedUser },
        });
        
        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_PROFILE_FAILURE,
          payload: response.error || 'Profile update failed',
        });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Network error';
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Optional: Call logout endpoint
      if (state.token) {
        try {
          await apiService.logout();
        } catch (error) {
          // Ignore logout API errors
          console.warn('Logout API call failed:', error);
        }
      }
    } finally {
      // Always clear local data
      apiService.clearAuthToken();
      await clearStorage();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isInitializing: state.isInitializing,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;