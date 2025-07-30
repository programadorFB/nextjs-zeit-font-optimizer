import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TransactionScreen from './src/screens/TrasactionScreen';
import ChartsScreen from './src/screens/ChartsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import InvestmentProfile from './src/screens/InvestmentProfile';
// Import context
import { AuthProvider } from './src/context/AuthContext';
import { FinancialProvider } from './src/context/FinancialContext';
import { BettingProvider } from './src/context/BettingContext';

const Stack = createStackNavigator();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // You can add a loading screen here
  }

  return (
    <AuthProvider>
      <FinancialProvider>
        <BettingProvider> 
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: '#000000',
              },
              headerTintColor: '#FFD700',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
            >
            {!isAuthenticated ? (
              <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
              />
            ) : (
              <>
                <Stack.Screen 
                  name="Dashboard" 
                  component={DashboardScreen}
                  options={{ title: 'Financial Control' }}
                  />
                <Stack.Screen 
                  name="Transaction" 
                  component={TransactionScreen}
                  options={{ title: 'Add Transaction' }}
                  />
                <Stack.Screen 
                  name="Charts" 
                  component={ChartsScreen}
                  options={{ title: 'Analytics' }}
                  />
                <Stack.Screen 
                  name="Profile" 
                  component={ProfileScreen}
                  options={{ title: 'Profile Settings' }}
                  />
                <Stack.Screen 
                  name="InvestmentProfile" 
                  component={InvestmentProfile}
                  options={{ headerShown: false }}
                  />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
        </BettingProvider>
      </FinancialProvider>
    </AuthProvider>
  );
};

export default App;