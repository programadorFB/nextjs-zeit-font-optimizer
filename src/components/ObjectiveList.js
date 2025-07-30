import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const ObjectivesList = ({ objectives }) => {
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

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 50) return '#FFD700';
    if (progress >= 25) return '#FF9800';
    return '#F44336';
  };

  const renderObjective = ({ item }) => {
    const progress = calculateProgress(item.current_amount, item.target_amount);
    const daysRemaining = getDaysRemaining(item.deadline);
    const progressColor = getProgressColor(progress);

    return (
      <View style={styles.objectiveItem}>
        <View style={styles.objectiveHeader}>
          <Text style={styles.objectiveTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.objectiveProgress}>
            {progress.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progress}%`, backgroundColor: progressColor }
              ]}
            />
          </View>
        </View>

        <View style={styles.objectiveDetails}>
          <View style={styles.amountContainer}>
            <Text style={styles.currentAmount}>
              {formatCurrency(item.current_amount)}
            </Text>
            <Text style={styles.targetAmount}>
              of {formatCurrency(item.target_amount)}
            </Text>
          </View>

          <View style={styles.deadlineContainer}>
            <Text style={[
              styles.deadline,
              daysRemaining < 30 ? styles.urgentDeadline : styles.normalDeadline
            ]}>
              {daysRemaining > 0 
                ? `${daysRemaining} days left`
                : daysRemaining === 0
                ? 'Due today'
                : `${Math.abs(daysRemaining)} days overdue`
              }
            </Text>
          </View>
        </View>

        <Text style={styles.deadlineDate}>
          Target: {formatDate(item.deadline)}
        </Text>
      </View>
    );
  };

  if (!objectives || objectives.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No objectives found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={objectives}
        renderItem={renderObjective}
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
  objectiveItem: {
    backgroundColor: '#1A1A1A',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  objectiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  objectiveTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 10,
  },
  objectiveProgress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  progressBarContainer: {
    marginBottom: 15,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  objectiveDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountContainer: {
    flex: 1,
  },
    currentAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    targetAmount: {
        fontSize: 14,
        color: '#CCCCCC',
    },  
    deadlineContainer: {
    flex: 1,                
    alignItems: 'flex-end',
  },
});

export default ObjectivesList;