// GoldGradient.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const GoldGradient = ({ children, style }) => {
  return (
    <LinearGradient
      colors={['#fefb37ff', '#d6991fff', '#9f7928', '#8A6E2F']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    borderRadius: 200,
  },
});