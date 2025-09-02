import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StatusBar, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Contexts
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { FinancialProvider } from './src/context/FinancialContext';
import { BettingProvider } from './src/context/BettingContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TransactionScreen from './src/screens/TrasactionScreen';
import TransactionHistoryScreen from './src/screens/TransactionHistoryScreen'; // NOVO
import ChartsScreen from './src/screens/ChartsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import InvestmentProfileScreen from './src/screens/InvestmentProfile';

// Services
import apiService from './src/services/api';

const Stack = createStackNavigator();

// Loading component
const LoadingScreen = () => (
  <View style={{
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <ActivityIndicator size="large" color="#FFD700" />
    <Text style={{
      color: '#FFFFFF',
      fontSize: 16,
      marginTop: 20,
      fontWeight: '600',
    }}>
      Carregando...
    </Text>
  </View>
);

// API Connection Test Component
const ConnectionTest = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    testAPIConnection();
  }, [retryCount]);

  const testAPIConnection = async () => {
    try {
      setConnectionStatus('testing');
      const result = await apiService.testConnection();
      
      if (result.success) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('failed');
      }
    } catch (error) {
      console.error('API Connection test failed:', error);
      setConnectionStatus('failed');
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (connectionStatus === 'testing') {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{
          color: '#FFFFFF',
          fontSize: 18,
          marginTop: 20,
          textAlign: 'center',
          fontWeight: 'bold',
        }}>
          Conectando ao servidor...
        </Text>
        <Text style={{
          color: '#CCCCCC',
          fontSize: 14,
          marginTop: 10,
          textAlign: 'center',
        }}>
          Verificando conexão com a API
        </Text>
      </View>
    );
  }

  if (connectionStatus === 'failed') {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <Text style={{
          color: '#F44336',
          fontSize: 24,
          marginBottom: 20,
          textAlign: 'center',
        }}>
          ⚠️
        </Text>
        <Text style={{
          color: '#FFFFFF',
          fontSize: 18,
          marginBottom: 10,
          textAlign: 'center',
          fontWeight: 'bold',
        }}>
          Erro de Conexão
        </Text>
        <Text style={{
          color: '#CCCCCC',
          fontSize: 14,
          marginBottom: 30,
          textAlign: 'center',
          lineHeight: 20,
        }}>
          Não foi possível conectar ao servidor.{'\n'}
          Verifique sua conexão com a internet e tente novamente.
        </Text>
        <TouchableOpacity
          style={{
            borderColor: 'transparent',
            paddingHorizontal: 30,
            paddingVertical: 15,
            borderRadius: 10,
          }}
          onPress={handleRetry}
        >
          <Text style={{
            color: '#000000',
            fontSize: 16,
            fontWeight: 'bold',
          }}>
            Tentar Novamente
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return children;
};

// Navigation Component
const AppNavigator = () => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#000000' },
          animationEnabled: true,
          gestureEnabled: true,
        }}
      >
        {isAuthenticated ? (
          // Authenticated screens
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen 
              name="Transaction" 
              component={TransactionScreen}
              options={{
                presentation: 'modal',
                gestureDirection: 'vertical',
              }}
            />
            {/* NOVO - Tela de histórico de transações adicionada abaixo */}
            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
            <Stack.Screen name="Charts" component={ChartsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen 
              name="InvestmentProfile" 
              component={InvestmentProfileScreen}
              options={{
                presentation: 'modal',
                gestureDirection: 'vertical',
              }}
            />
          </>
        ) : (
          // Unauthenticated screens
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{
          flex: 1,
          backgroundColor: '#000000',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <Text style={{
            color: '#F44336',
            fontSize: 24,
            marginBottom: 20,
            textAlign: 'center',
          }}>
            💥
          </Text>
          <Text style={{
            color: '#FFFFFF',
            fontSize: 18,
            marginBottom: 10,
            textAlign: 'center',
            fontWeight: 'bold',
          }}>
            Ops! Algo deu errado
          </Text>
          <Text style={{
            color: '#CCCCCC',
            fontSize: 14,
            marginBottom: 30,
            textAlign: 'center',
            lineHeight: 20,
          }}>
            O aplicativo encontrou um erro inesperado.{'\n'}
            Tente reiniciar o aplicativo.
          </Text>
          <TouchableOpacity
            style={{
              borderColor: 'transparent',
              paddingHorizontal: 30,
              paddingVertical: 15,
              borderRadius: 10,
            }}
            onPress={() => {
              this.setState({ hasError: false, error: null });
            }}
          >
            <Text style={{
              color: '#000000',
              fontSize: 16,
              fontWeight: 'bold',
            }}>
              Tentar Novamente
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Main App Component
const App = () => {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#000000" 
          translucent={false}
        />
        <AuthProvider>
          <ConnectionTest>
            <FinancialProvider>
              <BettingProvider>
                <AppNavigator />
              </BettingProvider>
            </FinancialProvider>
          </ConnectionTest>
        </AuthProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

export default App;