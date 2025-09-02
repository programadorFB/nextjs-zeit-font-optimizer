import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


const BalanceCard = ({ balance }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const isPositive = balance >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Saldo de Banca</Text>
        <Text style={[
          styles.balance,
          isPositive ? styles.positiveBalance : styles.negativeBalance
        ]}>
          {formatCurrency(balance)}
        </Text>
        
        <View style={styles.indicator}>
          <View style={[
            styles.indicatorDot,
            isPositive ? styles.positiveDot : styles.negativeDot
          ]} />
          <Text style={styles.indicatorText}>
            {isPositive ? 'Banca Positiva' : 'Banca Negativa'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 10,
    fontWeight: '500',
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  positiveBalance: {
    color: '#4CAF50',
  },
  negativeBalance: {
    color: '#F44336',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  positiveDot: {
    backgroundColor: '#4CAF50',
  },
  negativeDot: {
    backgroundColor: '#F44336',
  },
  indicatorText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
});

export default BalanceCard;