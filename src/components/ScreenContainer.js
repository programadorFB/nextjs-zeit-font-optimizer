import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSideMenu } from '../context/SideMenuContext';
import SideMenu from '../components/SideMenu';
import MenuButton from '../components/MenuButton';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * Container universal para todas as telas
 * Inclui side menu, header customizável e overlay automático
 */
const ScreenContainer = ({
  children,
  // Header options
  showHeader = true,
  headerTitle,
  showMenuButton = true,
  showBackButton = false,
  headerRight,
  headerStyle = {},
  
  // Menu options
  disableMenuOverlay = false,
  
  // Container options
  backgroundColor = '#000000',
  statusBarStyle = 'light-content',
  
  // Custom handlers
  onBackPress,
  onMenuPress,
}) => {
  const navigation = useNavigation();
  const { menuVisible, slideAnim, closeMenu } = useSideMenu();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const handleOverlayPress = () => {
    if (!disableMenuOverlay) {
      closeMenu();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Status Bar */}
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={statusBarStyle}
        translucent={false}
      />

      {/* Header */}
      {showHeader && (
        <View style={[styles.header, headerStyle]}>
          <View style={styles.headerLeft}>
            {showBackButton && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackPress}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <MaterialIcons name="arrow-back" size={24} color="#FFD700" />
              </TouchableOpacity>
            )}
            
            {showMenuButton && !showBackButton && (
              <MenuButton onPress={onMenuPress} />
            )}
          </View>

          <View style={styles.headerCenter}>
            {headerTitle && (
              <Text style={styles.headerTitle} numberOfLines={1}>
                {headerTitle}
              </Text>
            )}
          </View>

          <View style={styles.headerRight}>
            {headerRight && headerRight}
          </View>
        </View>
      )}

      {/* Screen Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Side Menu */}
      <SideMenu
        visible={menuVisible}
        slideAnim={slideAnim}
        onClose={closeMenu}
        navigation={navigation}
      />

      {/* Overlay */}
      {menuVisible && !disableMenuOverlay && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={handleOverlayPress}
          activeOpacity={1}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    zIndex: 100,
    minHeight: Platform.OS === 'ios' ? 88 : 64,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
});

export default ScreenContainer;