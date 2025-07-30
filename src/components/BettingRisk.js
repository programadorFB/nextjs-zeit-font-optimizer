import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFinancial } from '../context/FinancialContext';
import { useBetting } from '../context/BettingContext';
import { MaterialIcons } from '@expo/vector-icons';

const RiskSettingsScreen = () => {
  const navigation = useNavigation();
  const { balance } = useFinancial();
  const { bettingProfile, updateBettingProfile } = useBetting();
  
  // Estados para configurações
  const [stopLossEnabled, setStopLossEnabled] = useState(bettingProfile.stopLoss > 0);
  const [stopLossValue, setStopLossValue] = useState(bettingProfile.stopLoss.toString());
  const [stopLossPercentage, setStopLossPercentage] = useState('');
  
  const [dailyTargetEnabled, setDailyTargetEnabled] = useState(bettingProfile.dailyTarget > 0);
  const [dailyTargetValue, setDailyTargetValue] = useState(bettingProfile.dailyTarget?.toString() || '');
  const [dailyTargetPercentage, setDailyTargetPercentage] = useState('');
  
  const [profitTargetEnabled, setProfitTargetEnabled] = useState(bettingProfile.profitTarget > 0);
  const [profitTargetValue, setProfitTargetValue] = useState(bettingProfile.profitTarget.toString());
  const [profitTargetPercentage, setProfitTargetPercentage] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Calcular porcentagens iniciais
    if (bettingProfile.initialBalance > 0) {
      if (bettingProfile.stopLoss > 0) {
        setStopLossPercentage(((bettingProfile.stopLoss / bettingProfile.initialBalance) * 100).toFixed(0));
      }
      if (bettingProfile.dailyTarget > 0) {
        setDailyTargetPercentage(((bettingProfile.dailyTarget / bettingProfile.initialBalance) * 100).toFixed(1));
      }
      if (bettingProfile.profitTarget > 0) {
        setProfitTargetPercentage(((bettingProfile.profitTarget / bettingProfile.initialBalance) * 100).toFixed(0));
      }
    }
  }, [bettingProfile]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const parseCurrency = (value) => {
    return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  };

  const calculateFromPercentage = (percentage, isStopLoss = false) => {
    const percent = parseFloat(percentage) || 0;
    if (isStopLoss) {
      return (bettingProfile.initialBalance * percent) / 100;
    }
    return (bettingProfile.initialBalance * percent) / 100;
  };

  const updateStopLossFromValue = (value) => {
    const numericValue = parseCurrency(value);
    setStopLossValue(numericValue.toString());
    if (bettingProfile.initialBalance > 0) {
      const percentage = (numericValue / bettingProfile.initialBalance) * 100;
      setStopLossPercentage(percentage.toFixed(0));
    }
  };

  const updateStopLossFromPercentage = (percentage) => {
    setStopLossPercentage(percentage);
    const value = calculateFromPercentage(percentage, true);
    setStopLossValue(value.toString());
  };

  const updateDailyTargetFromValue = (value) => {
    const numericValue = parseCurrency(value);
    setDailyTargetValue(numericValue.toString());
    if (bettingProfile.initialBalance > 0) {
      const percentage = (numericValue / bettingProfile.initialBalance) * 100;
      setDailyTargetPercentage(percentage.toFixed(1));
    }
  };

  const updateDailyTargetFromPercentage = (percentage) => {
    setDailyTargetPercentage(percentage);
    const value = calculateFromPercentage(percentage);
    setDailyTargetValue(value.toString());
  };

  const updateProfitTargetFromValue = (value) => {
    const numericValue = parseCurrency(value);
    setProfitTargetValue(numericValue.toString());
    if (bettingProfile.initialBalance > 0) {
      const percentage = (numericValue / bettingProfile.initialBalance) * 100;
      setProfitTargetPercentage(percentage.toFixed(0));
    }
  };

  const updateProfitTargetFromPercentage = (percentage) => {
    setProfitTargetPercentage(percentage);
    const value = calculateFromPercentage(percentage);
    setProfitTargetValue(value.toString());
  };

  const validateSettings = () => {
    const stopLoss = stopLossEnabled ? parseFloat(stopLossValue) : 0;
    const dailyTarget = dailyTargetEnabled ? parseFloat(dailyTargetValue) : 0;
    const profitTarget = profitTargetEnabled ? parseFloat(profitTargetValue) : 0;

    if (stopLossEnabled && stopLoss >= bettingProfile.initialBalance) {
      Alert.alert('Erro', 'Stop-loss deve ser menor que a banca inicial');
      return false;
    }

    if (stopLossEnabled && stopLoss >= balance) {
      Alert.alert(
        'Atenção', 
        'Stop-loss está acima do saldo atual. Isso ativará o stop-loss imediatamente.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => saveSettings() }
        ]
      );
      return false;
    }

    if (dailyTargetEnabled && dailyTarget <= 0) {
      Alert.alert('Erro', 'Meta diária deve ser maior que zero');
      return false;
    }

    if (profitTargetEnabled && profitTarget <= 0) {
      Alert.alert('Erro', 'Meta de lucro deve ser maior que zero');
      return false;
    }

    return true;
  };

  const saveSettings = async () => {
    if (!validateSettings()) return;

    setLoading(true);
    try {
      const newSettings = {
        ...bettingProfile,
        stopLoss: stopLossEnabled ? parseFloat(stopLossValue) : 0,
        dailyTarget: dailyTargetEnabled ? parseFloat(dailyTargetValue) : 0,
        profitTarget: profitTargetEnabled ? parseFloat(profitTargetValue) : 0,
      };

      await updateBettingProfile(newSettings);
      
      Alert.alert(
        'Sucesso', 
        'Configurações de risco atualizadas com sucesso!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar configurações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetToRecommended = () => {
    Alert.alert(
      'Configurações Recomendadas',
      'Aplicar configurações recomendadas?\n\n• Stop-loss: 70% da banca\n• Meta diária: 5% da banca\n• Meta de lucro: 50% da banca',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aplicar',
          onPress: () => {
            setStopLossEnabled(true);
            updateStopLossFromPercentage('70');
            setDailyTargetEnabled(true);
            updateDailyTargetFromPercentage('5');
            setProfitTargetEnabled(true);
            updateProfitTargetFromPercentage('50');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações de Risco</Text>
        <TouchableOpacity onPress={resetToRecommended}>
          <MaterialIcons name="auto-fix-high" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informações da Banca */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informações da Banca</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Banca Inicial:</Text>
            <Text style={styles.infoValue}>{formatCurrency(bettingProfile.initialBalance)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Saldo Atual:</Text>
            <Text style={[styles.infoValue, { color: balance >= bettingProfile.initialBalance ? '#4CAF50' : '#F44336' }]}>
              {formatCurrency(balance)}
            </Text>
          </View>
        </View>

        {/* Stop-Loss */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <View style={styles.settingTitleContainer}>
              <MaterialIcons name="shield" size={24} color="#F44336" />
              <Text style={styles.settingTitle}>Stop-Loss</Text>
            </View>
            <Switch
              value={stopLossEnabled}
              onValueChange={setStopLossEnabled}
              trackColor={{ false: '#767577', true: '#F44336' }}
              thumbColor={stopLossEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
          
          {stopLossEnabled && (
            <>
              <Text style={styles.settingDescription}>
                Limite mínimo da banca. Quando atingido, pare de jogar.
              </Text>
              
              <View style={styles.inputContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Valor (R$)</Text>
                  <TextInput
                    style={styles.input}
                    value={stopLossValue}
                    onChangeText={updateStopLossFromValue}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>
                
                <Text style={styles.inputSeparator}>ou</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Porcentagem (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={stopLossPercentage}
                    onChangeText={updateStopLossFromPercentage}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.recommendationContainer}>
                <Text style={styles.recommendationText}>
                  💡 Recomendado: 70-80% da banca inicial
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Meta Diária */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <View style={styles.settingTitleContainer}>
              <MaterialIcons name="today" size={24} color="#FFD700" />
              <Text style={styles.settingTitle}>Meta Diária</Text>
            </View>
            <Switch
              value={dailyTargetEnabled}
              onValueChange={setDailyTargetEnabled}
              trackColor={{ false: '#767577', true: '#FFD700' }}
              thumbColor={dailyTargetEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
          
          {dailyTargetEnabled && (
            <>
              <Text style={styles.settingDescription}>
                Meta de ganho por dia. Ao atingir, considere parar de jogar.
              </Text>
              
              <View style={styles.inputContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Valor (R$)</Text>
                  <TextInput
                    style={styles.input}
                    value={dailyTargetValue}
                    onChangeText={updateDailyTargetFromValue}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>
                
                <Text style={styles.inputSeparator}>ou</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Porcentagem (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={dailyTargetPercentage}
                    onChangeText={updateDailyTargetFromPercentage}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.recommendationContainer}>
                <Text style={styles.recommendationText}>
                  💡 Recomendado: 3-10% da banca inicial
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Meta de Lucro Total */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <View style={styles.settingTitleContainer}>
              <MaterialIcons name="flag" size={24} color="#4CAF50" />
              <Text style={styles.settingTitle}>Meta de Lucro Total</Text>
            </View>
            <Switch
              value={profitTargetEnabled}
              onValueChange={setProfitTargetEnabled}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={profitTargetEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
          
          {profitTargetEnabled && (
            <>
              <Text style={styles.settingDescription}>
                Meta de lucro total. Ao atingir, considere sacar os ganhos.
              </Text>
              
              <View style={styles.inputContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Valor (R$)</Text>
                  <TextInput
                    style={styles.input}
                    value={profitTargetValue}
                    onChangeText={updateProfitTargetFromValue}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>
                
                <Text style={styles.inputSeparator}>ou</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Porcentagem (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={profitTargetPercentage}
                    onChangeText={updateProfitTargetFromPercentage}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.recommendationContainer}>
                <Text style={styles.recommendationText}>
                  💡 Recomendado: 50-100% da banca inicial
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Dicas de Gerenciamento */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Dicas de Gerenciamento</Text>
          <Text style={styles.tipText}>• Nunca jogue sem stop-loss definido</Text>
          <Text style={styles.tipText}>• Respeite suas metas diárias</Text>
          <Text style={styles.tipText}>• Saque os lucros regularmente</Text>
          <Text style={styles.tipText}>• Revise suas configurações mensalmente</Text>
        </View>
      </ScrollView>

      {/* Botões de Ação */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={saveSettings}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  settingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  settingDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444444',
  },
  inputSeparator: {
    fontSize: 12,
    color: '#666666',
    marginHorizontal: 12,
    marginBottom: 12,
  },
  recommendationContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  recommendationText: {
    fontSize: 12,
    color: '#FFD700',
  },
  tipsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 6,
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333333',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#666666',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RiskSettingsScreen;