import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const TransactionList = ({ transactions }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTransactionIcon = (type, category) => {
    if (type === 'deposit') {
      switch (category?.toLowerCase()) {
        case 'salary':
        case 'income':
          return '💰';
        case 'investment':
          return '📈';
        case 'gift':
          return '🎁';
        default:
          return '💵';
      }
    } else {
      switch (category?.toLowerCase()) {
        case 'food':
        case 'groceries':
          return '🍽️';
        case 'transport':
        case 'transportation':
          return '🚗';
        case 'entertainment':
          return '🎬';
        case 'shopping':
          return '🛍️';
        case 'bills':
        case 'utilities':
          return '📄';
        case 'health':
        case 'medical':
          return '🏥';
        default:
          return '💸';
      }
    }
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={styles.iconContainer}>
          <Text style={styles.transactionIcon}>
            {getTransactionIcon(item.type, item.category)}
          </Text>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {item.description || 'No description'}
          </Text>
          <Text style={styles.transactionCategory}>
            {item.category || 'Uncategorized'} • {formatDate(item.date)}
          </Text>
        </View>
      </View>
      
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          item.type === 'deposit' ? styles.depositAmount : styles.withdrawAmount
        ]}>
          {item.type === 'deposit' ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
      </View>
    </View>
  );

  if (!transactions || transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No transactions found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIcon: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  depositAmount: {
    color: '#4CAF50',
  },
  withdrawAmount: {
    color: '#F44336',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#CCCCCC',
  },
});

export default TransactionList;