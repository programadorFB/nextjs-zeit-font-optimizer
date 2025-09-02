import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  interpolate,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const RiskSlider = ({ value, onValueChange, selectedProfile, compact = false, containerStyle = {} }) => {
  const sliderWidth = compact ? width - 120 : width - 80;
  const knobSize = 20;
  const maxSliderValue = sliderWidth - knobSize;
  
  // Enhanced animated values
  const translateX = useSharedValue((value / 10) * maxSliderValue);
  const scale = useSharedValue(1);
  const isPressed = useSharedValue(false);
  const glowOpacity = useSharedValue(0);
  const trackGlowOpacity = useSharedValue(0.3);

  // CALCULATE VALUES DIRECTLY - No function calls in worklets
  const knobColor = value <= 3 ? '#4CAF50' : value <= 6 ? '#FFD700' : '#F44336';
  const trackGradient = value <= 3 ? ['#4CAF50', '#81C784'] : value <= 6 ? ['#FFD700', '#FFEB3B'] : ['#F44336', '#FF7043'];
  const currentIcon = value <= 3 ? 'shield-alt' : value <= 6 ? 'balance-scale' : 'fire';
  const currentIconColor = value <= 3 ? '#4CAF50' : value <= 6 ? '#FFD700' : '#F44336';

  // Update translateX when value changes externally
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

  // Enhanced Modern Gesture API with 3D feedback
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
      const newTranslateX = (currentVal / 10) * maxSliderValue + event.translationX * sensitivityFactor;
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

  // Enhanced animated styles
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

  // Ícone que acompanha a barra e fica acima dela
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

  // Função para obter o perfil atual baseado no valor
  const getCurrentProfile = () => {
    if (value <= 3) {
      return {
        title: 'Jogador Cauteloso',
        icon: 'shield-alt',
        color: '#4CAF50',
        description: 'Apostas seguras com menor risco'
      };
    } else if (value <= 6) {
      return {
        title: 'Jogador Equilibrado', 
        icon: 'balance-scale',
        color: '#FFD700',
        description: 'Equilíbrio entre risco e recompensa'
      };
    } else {
      return {
        title: 'Jogador de Alto Risco',
        icon: 'fire', 
        color: '#F44336',
        description: 'Grandes ganhos com alta volatilidade'
      };
    }
  };

  const currentProfile = getCurrentProfile();

  return (
    <View style={[hybridStyles.sliderContainer, compact && hybridStyles.compactContainer, containerStyle]}>
      {!compact && (
        <View style={hybridStyles.sliderHeader}>
          <Text style={hybridStyles.sliderTitle}>Nível de Tolerância ao Risco</Text>
          <View style={hybridStyles.currentProfileIndicator}>
            <FontAwesome5 
              name={currentProfile.icon} 
              size={20} 
              color={currentProfile.color} 
            />
            <Text style={[hybridStyles.currentProfileText, { color: currentProfile.color }]}>
              {currentProfile.title}
            </Text>
          </View>
        </View>
      )}

      {compact && (
        <View style={hybridStyles.compactHeader}>
          <Text style={hybridStyles.compactTitle}>Perfil de Risco</Text>
          <View style={hybridStyles.compactProfileDisplay}>
            <FontAwesome5 
              name={currentProfile.icon} 
              size={16} 
              color={currentProfile.color} 
            />
            <Text style={[hybridStyles.compactProfileText, { color: currentProfile.color }]}>
              {currentProfile.title}
            </Text>
          </View>
        </View>
      )}

      {!compact && (
        <View style={hybridStyles.sliderLabels}>
          <View style={hybridStyles.labelContainer}>
            <FontAwesome5 name="shield-alt" size={18} color={value <= 3 ? '#4CAF50' : '#666'} />
            <Text style={[hybridStyles.sliderLabel, value <= 3 && hybridStyles.activeLabel]}>
              Cauteloso
            </Text>
          </View>
          <View style={hybridStyles.labelContainer}>
            <FontAwesome5 name="balance-scale" size={18} color={value > 3 && value <= 6 ? '#FFD700' : '#666'} />
            <Text style={[hybridStyles.sliderLabel, value > 3 && value <= 6 && hybridStyles.activeLabel]}>
              Equilibrado
            </Text>
          </View>
          <View style={hybridStyles.labelContainer}>
            <FontAwesome5 name="fire" size={18} color={value > 6 ? '#F44336' : '#666'} />
            <Text style={[hybridStyles.sliderLabel, value > 6 && hybridStyles.activeLabel]}>
              Alto Risco
            </Text>
          </View>
        </View>
      )}

      {/* Container do slider com o ícone acima */}
      <View style={[hybridStyles.sliderWrapper, compact && hybridStyles.compactSliderWrapper]}>
        {/* Ícone que acompanha a barra - ACIMA da track */}
        <Animated.View style={[hybridStyles.floatingIcon, iconAnimatedStyle]}>
          <View style={[hybridStyles.iconBubble, { borderColor: currentIconColor }]}>
            <FontAwesome5 
              name={currentIcon} 
              size={compact ? 14 : 18} 
              color="#FFF" 
            />
            <Text style={[hybridStyles.iconValue, { color: currentIconColor }]}>{value}</Text>
          </View>
          {/* Seta apontando para baixo */}
          <View style={[hybridStyles.iconArrow, { borderTopColor: currentIconColor }]} />
        </Animated.View>

        {/* Track do slider */}
        <Animated.View style={[hybridStyles.sliderTrack, trackGlowStyle]}>
          <Animated.View style={[hybridStyles.sliderTrackFill, trackFillAnimatedStyle]}>
            <LinearGradient
              colors={trackGradient}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
          
          {/* Knob invisível para o gesto */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[hybridStyles.sliderKnob, knobAnimatedStyle]}>
              <View style={hybridStyles.knobCenter} />
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      </View>

      {/* Números da escala */}
      <View style={[hybridStyles.scaleNumbers, compact && hybridStyles.compactScaleNumbers]}>
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
                compact && hybridStyles.compactScaleNumber,
              ]}
            >
              {i}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Descrição compacta do perfil */}
      {compact && (
        <View style={hybridStyles.compactDescription}>
          <Text style={hybridStyles.compactDescriptionText}>
            {currentProfile.description}
          </Text>
        </View>
      )}
    </View>
  );
};

// Estilos híbridos otimizados
const hybridStyles = StyleSheet.create({
  // Main Container
  sliderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: 30,
  },
  
  // Versão compacta
  compactContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginHorizontal: 0,
    marginBottom: 20,
    backgroundColor: 'rgba(26, 26, 26, 0.6)',
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },

  // Headers
  sliderHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  compactHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  
  sliderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  currentProfileIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  compactProfileDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  
  currentProfileText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  compactProfileText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Slider Labels
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  labelContainer: {
    alignItems: 'center',
    flex: 1,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  activeLabel: {
    color: '#FFD700',
  },

  // Slider Wrapper
  sliderWrapper: {
    position: 'relative',
    marginBottom: 25,
    paddingTop: 50,
  },
  compactSliderWrapper: {
    paddingTop: 40,
    marginBottom: 20,
  },

  // Floating Icon
  floatingIcon: {
    position: 'absolute',
    top: -40,
    left: -20,
    zIndex: 10,
    alignItems: 'center',
  },
  iconBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  iconValue: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  iconArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFD700',
    marginTop: -1,
  },

  // Slider Track & Knob
  sliderTrack: {
    height: 8,
    backgroundColor: 'rgba(51, 51, 51, 0.8)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  sliderTrackFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderKnob: {
    position: 'absolute',
    top: -16,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  knobCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },

  // Scale Numbers
  scaleNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: 15,
  },
  compactScaleNumbers: {
    marginTop: 10,
    paddingHorizontal: 2,
  },
  scaleNumberContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  scaleNumber: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  compactScaleNumber: {
    fontSize: 10,
  },
  activeScaleNumber: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Compact Description
  compactDescription: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  compactDescriptionText: {
    fontSize: 11,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default RiskSlider;