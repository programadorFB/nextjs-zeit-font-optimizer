import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const StopLossCard = ({ 
  stopLoss, 
  balance, 
  initialBalance, 
  onEdit,
  formatCurrency 
}) => {
  const getStopLossStatus = () => {
    if (stopLoss > 0 && balance <= stopLoss) {
      return {
        text: 'STOP LOSS ATINGIDO!',
        color: '#F44336',
        icon: 'error'
      };
    }
    
    if (initialBalance > 0) {
        const distance = balance - stopLoss;
        const warningThreshold = initialBalance * 0.1;
        if (distance < warningThreshold) {
          return {
            text: 'PRÓXIMO AO STOP LOSS',
            color: '#d1b464',
            icon: 'warning'
          };
        }
    }
    
    return {
      text: 'NORMAL',
      color: '#4CAF50',
      icon: 'check-circle'
    };
  };

  const getProgressBarColor = () => {
    if (stopLoss > 0 && balance <= stopLoss) return '#F44336';
    if (initialBalance > 0 && (balance - stopLoss) < (initialBalance * 0.1)) return '#d1b464';
    return '#4CAF50';
  };

  const getProgressPercentage = () => {
    if (initialBalance === 0) return 0;
    return Math.min(100, Math.max(0, (balance / initialBalance) * 100));
  };

  const status = getStopLossStatus();

  return (
    <View style={[styles.overviewCard, styles.stopLossCard]}>
      <View style={styles.overviewCardHeader}>
        <View style={styles.cardTitleContainer}>
          <MaterialIcons name="warning" size={20} color="#F44336" />
          <Text style={styles.overviewCardTitle}>Stop-Loss</Text>
        </View>
        
        <View style={styles.headerRight}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: status.color + '20' }
          ]}>
            <MaterialIcons 
              name={status.icon} 
              size={12} 
              color={status.color} 
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.text}
            </Text>
          </View>
          
          {/*
            A ALTERAÇÃO ESTÁ AQUI:
            O botão agora está sempre habilitado para permitir a edição.
          */}
          <TouchableOpacity 
            style={styles.editButton}
            onPress={onEdit}
            // REMOVIDO: disabled={initialBalance === 0}
          >
            <MaterialIcons 
              name="edit" 
              size={16} 
              color={"#fdb931"} // REMOVIDO: Lógica ternária que deixava o ícone cinza
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={[styles.overviewAmount, styles.stopLossAmount]}>
        {formatCurrency(stopLoss)}
      </Text>
      
      <View style={styles.progressInfo}>
        <Text style={styles.overviewSubtitle}>
          {stopLoss > 0 && initialBalance > 0 ? 
            `Limite de ${Math.round((stopLoss / initialBalance) * 100)}% da banca` : 
            'Nenhum limite definido'}
        </Text>
        
        {stopLoss > 0 && initialBalance > 0 && (
          <>
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Distância atual:</Text>
                <Text style={[
                  styles.detailValue,
                  { color: status.color }
                ]}>
                  {formatCurrency(Math.max(0, balance - stopLoss))}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Saldo atual:</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(balance)}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Limite definido:</Text>
                <Text style={[styles.detailValue, { color: '#F44336' }]}>
                  {formatCurrency(stopLoss)}
                </Text>
              </View>
            </View>
            
            {balance <= stopLoss && (
              <View style={styles.alertContainer}>
                <MaterialIcons name="error" size={16} color="#F44336" />
                <Text style={styles.alertText}>
                  Recomendamos parar as operações e reavaliar sua estratégia
                </Text>
              </View>
            )}
          </>
        )}
        
        {stopLoss === 0 && (
          <View style={styles.noLimitContainer}>
            <MaterialIcons name="info" size={16} color="#d1b464" />
            <Text style={styles.noLimitText}>
              Defina um stop loss para proteger sua banca
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.riskIndicator}>
        <View style={[
          styles.riskBar,
          { 
            width: `${getProgressPercentage()}%`,
            backgroundColor: getProgressBarColor()
          }
        ]} />
      </View>
      
      {initialBalance > 0 && stopLoss > 0 && (
        <View style={styles.referenceMarkers}>
          <View 
            style={[
              styles.marker,
              { 
                left: `${(stopLoss / initialBalance) * 100}%`,
                borderLeftColor: '#F44336'
              }
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overviewCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  stopLossCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  overviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  overviewCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(253, 185, 49, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(253, 185, 49, 0.3)',
  },
  overviewAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  stopLossAmount: {
    color: '#F44336',
  },
  progressInfo: {
    marginBottom: 15,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  detailsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#AAAAAA',
    flex: 1,
  },
  detailValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'right',
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  alertText: {
    fontSize: 12,
    color: '#F44336',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  noLimitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(209, 180, 100, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(209, 180, 100, 0.3)',
  },
  noLimitText: {
    fontSize: 12,
    color: '#d1b464',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  riskIndicator: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  riskBar: {
    height: '100%',
    borderRadius: 4,
    // transition: 'all 0.3s ease', // transition não é uma propriedade react-native
  },
  referenceMarkers: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    height: 8,
    pointerEvents: 'none',
  },
  marker: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: '100%',
    borderLeftWidth: 2,
    borderStyle: 'dashed',
  },
});

export default StopLossCard;