import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  Modal,
  StyleSheet,
  TextInput,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  ScrollView,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  interpolate,
  withSpring,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useBetting } from '../context/BettingContext';
import StopLossCard from '../components/StopLossCard';
import {hybridStyles, modalStyles}  from './Styles/InvestmentProfileStyle'; // << IMPORTAÇÃO DOS ESTILOS

const { width } = Dimensions.get('window');

const StopLossEditModal = ({ visible, onClose, title, value, onSave, isStopLoss = false, initialBalance = 0 }) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setInputValue(value.toString());
      setError('');
    }
  }, [visible, value]);

  const handleSave = () => {
    const numericValue = parseFloat(inputValue.replace(',', '.'));
    
    if (isNaN(numericValue) || numericValue < 0) {
      setError('Por favor, insira um valor válido');
      return;
    }

    if (isStopLoss && initialBalance > 0 && numericValue >= initialBalance) {
      setError('Stop Loss deve ser menor que o valor inicial da banca');
      return;
    }

    onSave(numericValue);
    onClose();
    setInputValue('');
    setError('');
  };

  const getPresetValues = () => {
    if (isStopLoss && initialBalance > 0) {
      return [
        { value: initialBalance * 0.05, label: '5%' },
        { value: initialBalance * 0.10, label: '10%' },
        { value: initialBalance * 0.20, label: '20%' },
        { value: initialBalance * 0.30, label: '30%' },
      ];
    }
    return [];
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.modalCloseButton}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.modalContent}>
            <View style={modalStyles.inputContainer}>
              <Text style={modalStyles.inputLabel}>Valor em R$</Text>
              <View style={modalStyles.inputWrapper}>
                <Text style={modalStyles.currencySymbol}>R$</Text>
                <TextInput
                  style={modalStyles.modalInput}
                  value={inputValue}
                  onChangeText={(text) => {
                    setInputValue(text.replace(/[^0-9.,]/g, ''));
                    setError('');
                  }}
                  placeholder="0,00"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
              {error ? <Text style={modalStyles.errorText}>{error}</Text> : null}
            </View>

            {isStopLoss && getPresetValues().length > 0 && (
              <View style={modalStyles.presetContainer}>
                <Text style={modalStyles.presetTitle}>Valores sugeridos:</Text>
                <View style={modalStyles.presetButtons}>
                  {getPresetValues().map((preset, index) => (
                    <TouchableOpacity
                      key={index}
                      style={modalStyles.presetButton}
                      onPress={() => {
                        setInputValue(preset.value.toFixed(0));
                        setError('');
                      }}
                    >
                      <Text style={modalStyles.presetButtonText}>{preset.label}</Text>
                      <Text style={modalStyles.presetValueText}>R$ {preset.value.toFixed(0)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={modalStyles.modalActions}>
            <TouchableOpacity style={modalStyles.cancelButton} onPress={onClose}>
              <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.saveButton} onPress={handleSave}>
              <Text style={modalStyles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const RiskSlider = ({ value, onValueChange, selectedProfile }) => {
  const sliderWidth = width - 80;
  const knobSize = 20;
  const maxSliderValue = sliderWidth - knobSize;
  
  const translateX = useSharedValue((value / 10) * maxSliderValue);
  const scale = useSharedValue(1);
  const isPressed = useSharedValue(false);
  const glowOpacity = useSharedValue(0);
  const trackGlowOpacity = useSharedValue(0.3);

  const knobColor = value <= 3 ? '#4CAF50' : value <= 6 ? '#FFD700' : '#F44336';
  const trackGradient = value <= 3 ? ['#4CAF50', '#81C784'] : value <= 6 ? ['#FFD700', '#FFEB3B'] : ['#F44336', '#FF7043'];
  const currentIcon = value <= 3 ? 'shield-alt' : value <= 6 ? 'balance-scale' : 'fire';
  const currentIconColor = value <= 3 ? '#4CAF50' : value <= 6 ? '#FFD700' : '#F44336';

  useEffect(() => {
    translateX.value = withSpring((value / 10) * maxSliderValue, {
      damping: 15,
      stiffness: 200,
    });
  }, [value, maxSliderValue, translateX]);

  const updateValue = (newTranslateX) => {
    'worklet';
    const clampedX = Math.max(0, Math.min(maxSliderValue, newTranslateX));
    const newValue = Math.round((clampedX / maxSliderValue) * 10);
    runOnJS(onValueChange)(newValue);
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      isPressed.value = true;
      scale.value = withSpring(1.3, { damping: 25 });
      glowOpacity.value = withSpring(1.8);
      trackGlowOpacity.value = withSpring(0.6);
    })
    .onUpdate((event) => {
      'worklet';
      
      const sensitivityFactor = 0.7;
      const currentVal = Math.round((translateX.value / maxSliderValue) * 10);
      const newTranslateX = (currentVal / 10) * maxSliderValue + event.translationX*sensitivityFactor;
      const clampedX = Math.max(0, Math.min(maxSliderValue, newTranslateX));
      translateX.value = clampedX;
    })
    .onEnd((event) => {
      'worklet';
      const currentVal = Math.round((translateX.value / maxSliderValue) * 10);
      const newTranslateX = (currentVal / 10) * maxSliderValue + event.translationX;
      const clampedX = Math.max(0, Math.min(maxSliderValue, newTranslateX));
      translateX.value = withSpring(clampedX, {
        damping: 10,
        stiffness: 200,
      });
      updateValue(clampedX);
    })
    .onFinalize(() => {
      'worklet';
      isPressed.value = false;
      scale.value = withSpring(1, { damping: 12 });
      glowOpacity.value = withSpring(0);
      trackGlowOpacity.value = withSpring(0.3);
    })
    .activateAfterLongPress(0)
    .minDistance(2)
    .activeOffsetX([-15, 15]);

  const knobAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
        { perspective: 1000 },
        {
          rotateY: interpolate(
            translateX.value,
            [0, maxSliderValue],
            [-15, 15]
          ) + 'deg'
        }
      ],
      backgroundColor: knobColor,
      shadowColor: knobColor,
      shadowOpacity: interpolate(glowOpacity.value, [0, 1], [0.2, 0.8]),
      shadowRadius: interpolate(glowOpacity.value, [0, 1], [4, 12]),
      elevation: interpolate(glowOpacity.value, [0, 1], [4, 12]),
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value + knobSize/2 },
        { scale: interpolate(scale.value, [1, 1.3], [1, 1.2]) }
      ],
      opacity: interpolate(glowOpacity.value, [0, 1], [0.8, 1]),
    };
  });

  const trackFillAnimatedStyle = useAnimatedStyle(() => {
    const fillWidth = interpolate(
      translateX.value,
      [0, maxSliderValue],
      [0, 100]
    );
    return {
      width: `${fillWidth}%`,
    };
  });

  const trackGlowStyle = useAnimatedStyle(() => {
    return {
      shadowColor: knobColor,
      shadowOpacity: trackGlowOpacity.value,
      shadowRadius: 8,
      elevation: 10,
    };
  });

  return (
    <View style={hybridStyles.sliderContainer}>
      <View style={hybridStyles.sliderHeader}>
        <Text style={hybridStyles.sliderTitle}>Nível de Tolerância ao Risco</Text>
        <View style={hybridStyles.currentProfileIndicator}>
          <FontAwesome5 
            name={currentIcon} 
            size={24} 
            color={currentIconColor} 
          />
          <Text style={[hybridStyles.currentProfileText, { color: currentIconColor }]}>
            {selectedProfile?.title}
          </Text>
        </View>
      </View>

      <View style={hybridStyles.sliderLabels}>
        <View style={hybridStyles.labelContainer}>
          <FontAwesome5 name="shield-alt" size={20} color={value <= 3 ? '#4CAF50' : '#666'} />
          <Text style={[hybridStyles.sliderLabel, value <= 3 && hybridStyles.activeLabel]}>
            Cauteloso
          </Text>
        </View>
        <View style={hybridStyles.labelContainer}>
          <FontAwesome5 name="balance-scale" size={20} color={value > 3 && value <= 6 ? '#FFD700' : '#666'} />
          <Text style={[hybridStyles.sliderLabel, value > 3 && value <= 6 && hybridStyles.activeLabel]}>
            Equilibrado
          </Text>
        </View>
        <View style={hybridStyles.labelContainer}>
          <FontAwesome5 name="fire" size={20} color={value > 6 ? '#F44336' : '#666'} />
          <Text style={[hybridStyles.sliderLabel, value > 6 && hybridStyles.activeLabel]}>
            Alto Risco
          </Text>
        </View>
      </View>

      <View style={hybridStyles.sliderWrapper}>
        <Animated.View style={[hybridStyles.floatingIcon, iconAnimatedStyle]}>
          <View style={[hybridStyles.iconBubble, { borderColor: currentIconColor }]}>
            <FontAwesome5 
              name={currentIcon} 
              size={18} 
              color="#FFF" 
            />
            <Text style={[hybridStyles.iconValue, { color: currentIconColor }]}>{value}</Text>
          </View>
          <View style={[hybridStyles.iconArrow, { borderTopColor: currentIconColor }]} />
        </Animated.View>

        <Animated.View style={[hybridStyles.sliderTrack, trackGlowStyle]}>
          <Animated.View style={[hybridStyles.sliderTrackFill, trackFillAnimatedStyle]}>
            <LinearGradient
              colors={trackGradient}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
          
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[hybridStyles.sliderKnob, knobAnimatedStyle]}>
              <View style={hybridStyles.knobCenter} />
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      </View>

      <View style={hybridStyles.scaleNumbers}>
        {Array.from({ length: 11 }, (_, i) => (
          <TouchableOpacity
            key={i}
            style={hybridStyles.scaleNumberContainer}
            onPress={() => onValueChange(i)}
            hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
          >
            <Text
              style={[
                hybridStyles.scaleNumber,
                Math.round(value) === i && hybridStyles.activeScaleNumber,
              ]}
            >
              {i}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const ProfileDisplay = ({ selectedProfile, riskValue }) => {
  const fadeInValue = useSharedValue(0);
  const rotateValue = useSharedValue(0);
  const glowIntensity = useSharedValue(0);

  useEffect(() => {
    if (selectedProfile) {
      fadeInValue.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });
      rotateValue.value = withSpring(360, {
        damping: 20,
        stiffness: 80,
      });
      glowIntensity.value = withSpring(1, {
        damping: 12,
        stiffness: 150,
      });
    }
  }, [selectedProfile, fadeInValue, rotateValue, glowIntensity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeInValue.value,
      transform: [
        {
          translateY: interpolate(fadeInValue.value, [0, 1], [30, 0])
        },
        {
          scale: interpolate(fadeInValue.value, [0, 1], [0.9, 1])
        }
      ]
    };
  });

  const rouletteWheelStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotateZ: `${rotateValue.value}deg`
        }
      ],
      shadowColor: selectedProfile?.color || '#FFD700',
      shadowOpacity: interpolate(glowIntensity.value, [0, 1], [0.1, 0.4]),
      shadowRadius: interpolate(glowIntensity.value, [0, 1], [4, 12]),
      elevation: interpolate(glowIntensity.value, [0, 1], [4, 12]),
    };
  });

  if (!selectedProfile) return null;

  return (
    <Animated.View style={[hybridStyles.profileDisplay, { borderColor: selectedProfile?.color }, animatedStyle]}>
      <View style={hybridStyles.glassOverlay} />
      
      <View style={[
        hybridStyles.profileDisplayGlow,
        { backgroundColor: selectedProfile?.color }
      ]} />
      
      <View style={hybridStyles.profileImageWrapper}>
        <Animated.View style={[
          hybridStyles.rouletteWheel,
          { borderColor: selectedProfile?.color },
          rouletteWheelStyle
        ]}>
          <LinearGradient
            colors={[
              selectedProfile?.color + '40' || '#FFD70040',
              selectedProfile?.color + '20' || '#FFD70020',
              'transparent'
            ]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={hybridStyles.rouletteCenter}>
            <Text style={[hybridStyles.rouletteNumber, { color: selectedProfile?.color }]}>
              {riskValue}
            </Text>
          </View>
          
          {[...Array(8)].map((_, i) => (
            <View
              key={i}
              style={[
                {
                  position: 'absolute',
                  width: 2,
                  height: 15,
                  backgroundColor: selectedProfile?.color + '60',
                  transform: [
                    { rotate: `${i * 45}deg` },
                    { translateY: -52 }
                  ]
                }
              ]}
            />
          ))}
        </Animated.View>
      </View>

      <View style={hybridStyles.profileInfoDisplay}>
        <Text style={[hybridStyles.profileTitle, { color: selectedProfile.color }]}>
          {selectedProfile.title}
        </Text>
        
        <Text style={hybridStyles.profileDescription}>
          {selectedProfile.description}
        </Text>
        
        <View style={hybridStyles.profileStats}>
          <View style={hybridStyles.statItem}>
            <Text style={hybridStyles.statLabel}>Nível de Risco:</Text>
            <Text style={[hybridStyles.statValue, { color: selectedProfile.color }]}>
              {riskValue}/10
            </Text>
          </View>
          
          <View style={hybridStyles.statItem}>
            <Text style={hybridStyles.statLabel}>Potencial de Ganho:</Text>
            <Text style={[hybridStyles.statValue, { color: selectedProfile.color }]}>
              {selectedProfile.expectedReturn}
            </Text>
          </View>
        </View>

        <View style={hybridStyles.featuresContainer}>
          <Text style={hybridStyles.featuresTitle}>Características:</Text>
          {selectedProfile.features.map((feature, index) => (
            <View key={index} style={hybridStyles.featureItem}>
              <MaterialIcons name="check-circle" size={16} color={selectedProfile.color} />
              <Text style={hybridStyles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={[hybridStyles.depthIndicator, { backgroundColor: selectedProfile?.color + '20' }]} />
    </Animated.View>
  );
};


const BettingProfileScreen = () => {
  const navigation = useNavigation();
  const { bettingProfile, saveCompleteProfile, updateBettingProfile } = useBetting();
  const [riskValue, setRiskValue] = useState(bettingProfile?.riskLevel ?? 5);
  
  const [isStopLossModalVisible, setStopLossModalVisible] = useState(false);

  useEffect(() => {
    if (bettingProfile?.riskLevel !== undefined) {
      setRiskValue(bettingProfile.riskLevel);
    }
  }, [bettingProfile?.riskLevel]);

  const handleRiskChange = (value) => {
    setRiskValue(value);
    if (bettingProfile?.id) {
      updateBettingProfile({ riskLevel: value });
    }
  };

  const handleSaveStopLoss = (newStopLoss) => {
    updateBettingProfile({ stopLoss: newStopLoss });
    setStopLossModalVisible(false);
  };
  
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const buttonScale = useSharedValue(1);
  const saveButtonOpacity = useSharedValue(1);

  const profiles = {
    cautious: {
      id: 'cautious',
      title: 'Jogador Cauteloso',
      description: 'Prefere apostas seguras com menor risco, focando em preservar o bankroll e fazer ganhos consistentes.',
      color: '#4CAF50',
      expectedReturn: 'Ganhos Baixos/Constantes',
      icon: { name: 'shield-alt', color: '#4CAF50' },
      features: ['Apostas externas (vermelho/preto)', 'Menor volatilidade', 'Gestão rigorosa do bankroll', 'Sessões mais longas']
    },
    balanced: {
      id: 'balanced',
      title: 'Jogador Equilibrado',
      description: 'Combina apostas seguras com algumas jogadas mais arriscadas, buscando equilíbrio entre risco e recompensa.',
      color: '#FFD700',
      expectedReturn: 'Ganhos Moderados',
      icon: { name: 'balance-scale', color: '#FFD700' },
      features: ['Mix de apostas internas/externas', 'Risco calculado', 'Estratégias diversificadas', 'Flexibilidade nas apostas']
    },
    highrisk: {
      id: 'highrisk',
      title: 'Jogador de Alto Risco',
      description: 'Busca grandes ganhos através de apostas de alto risco, aceitando maior volatilidade para maximizar retornos.',
      color: '#F44336',
      expectedReturn: 'Ganhos Altos/Voláteis',
      icon: { name: 'fire', color: '#F44336' },
      features: ['Apostas em números específicos', 'Alta volatilidade', 'Potencial de grandes ganhos', 'Sessões intensas']
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

    setIsLoading(true);
    buttonScale.value = withSpring(0.95);
    saveButtonOpacity.value = withSpring(0.7);

    const completeProfileData = {
      profile: selectedProfile,
      riskLevel: riskValue,
      stopLoss: bettingProfile?.stopLoss ?? 0,
      profitTarget: 0,
      bankroll: 0,
      initialBalance: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await saveCompleteProfile(completeProfileData);
      
      if (result.success) {
        Alert.alert(
          'Perfil Salvo com Sucesso!',
          `Perfil: ${selectedProfile.title}\nRisco: ${riskValue}/10`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível salvar o perfil. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
      buttonScale.value = withSpring(1);
      saveButtonOpacity.value = withSpring(1);
    }
  };

  const saveButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
      opacity: saveButtonOpacity.value,
    };
  });

  const ScrollContainer = ({ children }) => {
    return (
      <ScrollView 
        style={hybridStyles.scrollView}
        contentContainerStyle={hybridStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        decelerationRate="fast" 
      >
        {children}
      </ScrollView>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={hybridStyles.container}>
        <LinearGradient
          colors={['#000000', '#0A0A0A', '#000000']}
          style={hybridStyles.backgroundGradient}
        />
        <View style={hybridStyles.header}>
          <TouchableOpacity 
            style={hybridStyles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
            <MaterialIcons name="arrow-back" size={24} color="#FFD700" />
          </TouchableOpacity>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={hybridStyles.headerTitle}>Perfil de Investimento</Text>
            <View style={hybridStyles.headerUnderline} />
          </View>
          
          <View style={hybridStyles.headerRight}>
            <FontAwesome5 name="dice" size={20} color="#FFD700" />
          </View>
        </View>
        
        <ScrollContainer>
          <View style={hybridStyles.introduction}>
            <Text style={hybridStyles.introTitle}>Defina seu Estilo de Jogo</Text>
            <Text style={hybridStyles.introDescription}>
              Configure seu perfil de investimento definindo seu nível de tolerância ao risco.
            </Text>
          </View>

          <RiskSlider 
            value={riskValue}
            onValueChange={handleRiskChange}
            selectedProfile={selectedProfile}
          />
          

          <ProfileDisplay 
            selectedProfile={selectedProfile}
            riskValue={riskValue}
          />
          <View style={{ marginHorizontal: 20, marginBottom: 30 }}>
              <StopLossCard 
                  stopLoss={bettingProfile?.stopLoss ?? 0}
                  balance={bettingProfile?.bankroll ?? 0}
                  initialBalance={bettingProfile?.initialBalance ?? 0}
                  onEdit={() => setStopLossModalVisible(true)}
                  formatCurrency={(val) =>
                  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0)
                  }
              />
          </View>

          <View style={hybridStyles.actionButtons}>
            <TouchableOpacity
              style={hybridStyles.saveButton}
              onPress={handleSaveProfile}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Animated.View style={saveButtonAnimatedStyle}>
                <LinearGradient
                  colors={selectedProfile ? [
                    selectedProfile.color,
                    selectedProfile.color + 'CC',
                    selectedProfile.color + '80'
                  ] : ['#666', '#555', '#444']}
                  style={hybridStyles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={hybridStyles.buttonIcon}>
                    <FontAwesome5 
                      name={isLoading ? "spinner" : "save"} 
                      size={16} 
                      color="#000" 
                    />
                  </View>
                  <Text style={hybridStyles.saveButtonText}>
                    {isLoading ? 'Salvando Perfil...' : 'Salvar Perfil'}
                  </Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {selectedProfile && (
            <View style={[hybridStyles.riskWarning, {
              backgroundColor: selectedProfile.id === 'highrisk' ? 
              'rgba(244, 67, 54, 0.1)' : 'rgba(255, 215, 0, 0.1)',
              borderColor: selectedProfile.id === 'highrisk' ? 
              '#F44336' : '#FFD700',
            }]}>
              <FontAwesome5 
                name="exclamation-triangle" 
                size={16} 
                color={selectedProfile.id === 'highrisk' ? '#F44336' : '#FFD700'} 
              />
              <Text style={[hybridStyles.riskWarningText, {
                color: selectedProfile.id === 'highrisk' ? '#F44336' : '#FFD700',
              }]}>
                {selectedProfile.id === 'highrisk' 
                  ? 'Atenção: Perfil de alto risco. Pode resultar em perdas significativas.'
                  : 'Lembre-se: Apostas envolvem riscos. Jogue com responsabilidade.'
                }
              </Text>
            </View>
          )}
        </ScrollContainer>
        
        <StopLossEditModal
          visible={isStopLossModalVisible}
          onClose={() => setStopLossModalVisible(false)}
          title="Editar Stop Loss"
          value={bettingProfile?.stopLoss ?? 0}
          onSave={handleSaveStopLoss}
          isStopLoss={true}
          initialBalance={bettingProfile?.initialBalance ?? 0}
        />
      </View>
    </GestureHandlerRootView>
  );
};

export default BettingProfileScreen;