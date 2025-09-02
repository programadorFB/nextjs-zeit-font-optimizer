// src/components/GlobalHeader.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// O "toggleMenu" será passado via props
const GlobalHeader = ({ toggleMenu }) => {
  const navigation = useNavigation();
  const route = useRoute();

  // Obtém o título definido nas opções da tela, ou usa o nome da rota como fallback
  const screenTitle = navigation.getState().routes.find(r => r.key === route.key)?.params?.title || route.name;

  return (
    <View style={styles.header}>
      {navigation.canGoBack() ? (
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={toggleMenu}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </TouchableOpacity>
      )}
      <Text style={styles.greeting}>{screenTitle}</Text>
      <FontAwesome5 name="dice" size={20} color="#FFD700" />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  button: {
    width: 30,
    height: 30,
    justifyContent: 'space-around',
    paddingVertical: 6,
  },
  menuLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#FFD700',
    borderRadius: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default GlobalHeader;