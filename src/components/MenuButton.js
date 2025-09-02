import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Animated,
  StyleSheet,
} from 'react-native';
import { useSideMenu } from '../context/SideMenuContext';

const MenuButton = ({ 
  style = {},
  size = 30,
  color = '#b69e1aff',
  animationDuration = 300,
  onPress,
}) => {
  const { toggleMenu, menuVisible } = useSideMenu();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animação de rotação quando o menu abre/fecha
    Animated.timing(rotateAnim, {
      toValue: menuVisible ? 1 : 0,
      duration: animationDuration,
      useNativeDriver: true,
    }).start();
  }, [menuVisible]);

  const handlePress = () => {
    // Animação de "tap"
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) {
      onPress();
    } else {
      toggleMenu();
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { width: size, height: size },
        style,
      ]}
      onPress={handlePress}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.buttonContent,
          {
            transform: [
              { rotate: rotation },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <View style={[styles.line, { backgroundColor: color, width: size * 0.8 }]} />
        <View style={[styles.line, { backgroundColor: color, width: size * 0.8 }]} />
        <View style={[styles.line, { backgroundColor: color, width: size * 0.8 }]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '70%',
    width: '100%',
  },
  line: {
    height: 2,
    borderRadius: 1,
  },
});

export default MenuButton;