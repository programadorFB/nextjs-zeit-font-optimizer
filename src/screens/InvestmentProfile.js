import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useBetting } from '../context/BettingContext';
import { styles } from './InvestmentProfileStyle';

const { width } = Dimensions.get('window');

const RiskSlider = ({ value, onValueChange, selectedProfile }) => {
  const sliderRef = useRef(null);
  const sliderWidth = width - 80;
  const knobSize = 40;

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const newValue = Math.round(
        Math.max(0, Math.min(10, (event.nativeEvent.translationX / (sliderWidth - knobSize)) * 10))
      );
      onValueChange(newValue);
    }
  };

  const getTrackGradient = () => {
    if (value <= 3) return ['#4CAF50', '#81C784'];
    if (value <= 6) return ['#FFD700', '#FFEB3B'];
    return ['#F44336', '#FF7043'];
  };

  const getKnobColor = () => {
    if (value <= 3) return '#4CAF50';
    if (value <= 6) return '#FFD700';
    return '#F44336';
  };

  const getCurrentIcon = () => {
    if (value <= 3) return 'shield-alt';
    if (value <= 6) return 'balance-scale';
    return 'fire';
  };

  const getCurrentIconColor = () => {
    if (value <= 3) return '#4CAF50';
    if (value <= 6) return '#FFD700';
    return '#F44336';
  };

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderTitle}>Nível de Tolerância ao Risco</Text>
        <View style={styles.currentProfileIndicator}>
          <FontAwesome5 
            name={getCurrentIcon()} 
            size={24} 
            color={getCurrentIconColor()} 
          />
          <Text style={[styles.currentProfileText, { color: getCurrentIconColor() }]}>
            {selectedProfile?.title}
          </Text>
        </View>
      </View>

      <View style={styles.sliderLabels}>
        <View style={styles.labelContainer}>
          <FontAwesome5 name="shield-alt" size={20} color={value <= 3 ? '#4CAF50' : '#666'} />
          <Text style={[styles.sliderLabel, value <= 3 && styles.activeLabel]}>
            Cauteloso
          </Text>
        </View>
        <View style={styles.labelContainer}>
          <FontAwesome5 name="balance-scale" size={20} color={value > 3 && value <= 6 ? '#FFD700' : '#666'} />
          <Text style={[styles.sliderLabel, value > 3 && value <= 6 && styles.activeLabel]}>
            Equilibrado
          </Text>
        </View>
        <View style={styles.labelContainer}>
          <FontAwesome5 name="fire" size={20} color={value > 6 ? '#F44336' : '#666'} />
          <Text style={[styles.sliderLabel, value > 6 && styles.activeLabel]}>
            Alto Risco
          </Text>
        </View>
      </View>

      <View style={styles.sliderTrack}>
        <LinearGradient
          colors={getTrackGradient()}
          style={[styles.sliderTrackFill, { width: `${(value / 10) * 100}%` }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        
        <PanGestureHandler
          ref={sliderRef}
          onHandlerStateChange={onHandlerStateChange}
        >
          <View
            style={[
              styles.sliderKnob,
              {
                backgroundColor: getKnobColor(),
                left: (value / 10) * (sliderWidth - knobSize),
              },
            ]}
          >
            <FontAwesome5 
              name={getCurrentIcon()} 
              size={16} 
              color="#FFF" 
            />
          </View>
        </PanGestureHandler>
      </View>

      <View style={styles.scaleNumbers}>
        {Array.from({ length: 11 }, (_, i) => (
          <Text
            key={i}
            style={[
              styles.scaleNumber,
              Math.round(value) === i && styles.activeScaleNumber
            ]}
          >
            {i}
          </Text>
        ))}
      </View>
    </View>
  );
};

const ProfileDisplay = ({ selectedProfile, riskValue }) => {
  if (!selectedProfile) return null;

  return (
    <View style={styles.profileDisplay}>
      <View style={styles.profileHeader}>
        <FontAwesome5 
          name={selectedProfile.icon.name} 
          size={32} 
          color={selectedProfile.color} 
        />
        <Text style={[styles.profileTitle, { color: selectedProfile.color }]}>
          {selectedProfile.title}
        </Text>
      </View>
      
      <Text style={styles.profileDescription}>
        {selectedProfile.description}
      </Text>
      
      <View style={styles.profileStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Nível de Risco:</Text>
          <Text style={[styles.statValue, { color: selectedProfile.color }]}>
            {riskValue}/10
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Potencial de Ganho:</Text>
          <Text style={[styles.statValue, { color: selectedProfile.color }]}>
            {selectedProfile.expectedReturn}
          </Text>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Características:</Text>
        {selectedProfile.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={16} color={selectedProfile.color} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const BankrollInput = ({ value, onValueChange }) => {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleInputChange = (text) => {
    const cleanText = text.replace(/[^0-9.,]/g, '');
    setInputValue(cleanText);
    
    const numericValue = parseFloat(cleanText.replace(',', '.'));
    if (!isNaN(numericValue) && numericValue > 0) {
      onValueChange(numericValue);
    }
  };

  const getPresetValues = () => {
    return [500, 1000, 2000, 5000, 10000];
  };

  return (
    <View style={styles.bankrollContainer}>
      <Text style={styles.bankrollTitle}>Valor da Banca Inicial</Text>
      <Text style={styles.bankrollDescription}>
        Defina o valor que você pretende usar para suas apostas
      </Text>

      <View style={styles.bankrollInputWrapper}>
        <Text style={styles.currencySymbol}>R$</Text>
        <TextInput
          style={styles.bankrollInput}
          value={inputValue}
          onChangeText={handleInputChange}
          placeholder="0,00"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.presetValues}>
        <Text style={styles.presetTitle}>Valores Sugeridos:</Text>
        <View style={styles.presetButtons}>
          {getPresetValues().map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                {
                  backgroundColor: value === preset ? '#FFD70020' : 'transparent',
                },
              ]}
              onPress={() => {
                setInputValue(preset.toString());
                onValueChange(preset);
              }}
            >
              <Text
                style={[
                  styles.presetButtonText,
                  {
                    color: value === preset ? '#FFD700' : '#CCCCCC',
                  },
                ]}
              >
                R$ {preset.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const BettingProfileScreen = () => {
  const navigation = useNavigation();
  const { saveCompleteProfile } = useBetting();
  const [riskValue, setRiskValue] = useState(5);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [bankroll, setBankroll] = useState(1000);

  const profiles = {
    cautious: {
      id: 'cautious',
      title: 'Jogador Cauteloso',
      description: 'Prefere apostas seguras com menor risco, focando em preservar o bankroll e fazer ganhos consistentes.',
      color: '#4CAF50',
      expectedReturn: 'Ganhos Baixos/Constantes',
      icon: { name: 'shield-alt', color: '#4CAF50' },
      features: [
        'Apostas externas (vermelho/preto)',
        'Menor volatilidade',
        'Gestão rigorosa do bankroll',
        'Sessões mais longas'
      ]
    },
    balanced: {
      id: 'balanced',
      title: 'Jogador Equilibrado',
      description: 'Combina apostas seguras com algumas jogadas mais arriscadas, buscando equilíbrio entre risco e recompensa.',
      color: '#FFD700',
      expectedReturn: 'Ganhos Moderados',
      icon: { name: 'balance-scale', color: '#FFD700' },
      features: [
        'Mix de apostas internas/externas',
        'Risco calculado',
        'Estratégias diversificadas',
        'Flexibilidade nas apostas'
      ]
    },
    highrisk: {
      id: 'highrisk',
      title: 'Jogador de Alto Risco',
      description: 'Busca grandes ganhos através de apostas de alto risco, aceitando maior volatilidade para maximizar retornos.',
      color: '#F44336',
      expectedReturn: 'Ganhos Altos/Voláteis',
      icon: { name: 'fire', color: '#F44336' },
      features: [
        'Apostas em números específicos',
        'Alta volatilidade',
        'Potencial de grandes ganhos',
        'Sessões intensas'
      ]
    }
  };

  useEffect(() => {
    let profile;
    if (riskValue <= 3) {
      profile = profiles.cautious;
    } else if (riskValue <= 6) {
      profile = profiles.balanced;
    } else {
      profile = profiles.highrisk;
    }
    setSelectedProfile(profile);
  }, [riskValue]);

  const handleSaveProfile = async () => {
    if (!selectedProfile) {
      Alert.alert('Atenção', 'Por favor, ajuste seu perfil de risco.');
      return;
    }

    const completeProfileData = {
      profile: selectedProfile,
      riskLevel: riskValue,
      stopLoss: 0, // Removido do input, mas mantido para compatibilidade
      profitTarget: 0, // Removido do input, mas mantido para compatibilidade
      bankroll: bankroll,
      initialBalance: bankroll,
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await saveCompleteProfile(completeProfileData);
      
      if (result.success) {
        Alert.alert(
          'Perfil Salvo com Sucesso!',
          `Perfil: ${selectedProfile.title}\nRisco: ${riskValue}/10\nBankroll: R$ ${bankroll.toLocaleString()}`,
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível salvar o perfil. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Perfil de Investimento</Text>
        
        <View style={styles.headerRight}>
          <FontAwesome5 name="dice" size={20} color="#FFD700" />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introduction}>
          <Text style={styles.introTitle}>Defina seu Estilo de Jogo</Text>
          <Text style={styles.introDescription}>
            Configure seu perfil de investimento definindo o nível de risco e valor da banca inicial.
          </Text>
        </View>

        <RiskSlider 
          value={riskValue}
          onValueChange={setRiskValue}
          selectedProfile={selectedProfile}
        />

        <BankrollInput
          value={bankroll}
          onValueChange={setBankroll}
        />

        {selectedProfile && (
          <ProfileDisplay 
            selectedProfile={selectedProfile}
            riskValue={riskValue}
          />
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
          >
            <LinearGradient
              colors={selectedProfile ? [selectedProfile.color, selectedProfile.color + '80'] : ['#666', '#444']}
              style={styles.buttonGradient}
            >
              <FontAwesome5 name="save" size={16} color="#000" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>
                Salvar Perfil
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default BettingProfileScreen;