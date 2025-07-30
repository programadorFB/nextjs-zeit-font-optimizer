import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { styles } from './styles';
import { BlurView } from 'expo-blur';
import { MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';

const MenuItem = ({ icon, text, onPress, isLogout = false, isNew = false }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for new items
  React.useEffect(() => {
    if (isNew) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isNew]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return (
    <Animated.View 
      style={{ 
        transform: [
          { scale: scaleAnim },
          { scale: isNew ? pulseAnim : 1 }
        ] 
      }}
    >
      <TouchableOpacity
        style={[
          styles.menuItemContainer,
          isNew && styles.newMenuItem
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        <Animated.View
          style={[
            styles.menuItemBorder, 
            { opacity: glowOpacity },
            isNew && { borderColor: '#FFD700' }
          ]}
        />
        
        {isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        
        <View style={styles.menuItemContent}>
          <View style={styles.menuIcon}>
            {icon}
          </View>
          <Text style={[
            styles.menuText, 
            isLogout && styles.logoutText,
            isNew && styles.newMenuText
          ]}>
            {text}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const SideMenu = ({ visible, slideAnim, onClose, navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          onClose();
        },
      },
    ]);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />

      <View style={styles.profileSection}>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
      </View>

      <View style={styles.menuItems}>
        <MenuItem
          icon={<MaterialIcons name="dashboard" size={24} color="white" />}
          text="Dashboard"
          onPress={() => { onClose(); navigation.navigate('Dashboard'); }}
        />
        <MenuItem
          icon={<FontAwesome5 name="chart-line" size={20} color="white" />}
          text="Análise"
          onPress={() => { onClose(); navigation.navigate('Charts'); }}
        />
        <MenuItem
          icon={<Feather name="download" size={22} color="white" />}
          text="Add Depósito"
          onPress={() => { onClose(); navigation.navigate('Transaction', { type: 'deposit' }); }}
        />
        <MenuItem
          icon={<Feather name="upload" size={22} color="white" />}
          text="Add Despesa"
          onPress={() => { onClose(); navigation.navigate('Transaction', { type: 'withdraw' }); }}
        />
        <MenuItem
          icon={<FontAwesome5 name="bullseye" size={20} color="white" />}
          text="Objetivos"
          onPress={() => { onClose(); navigation.navigate('Transaction', { showObjectives: true }); }}
        />
        
        {/* NEW: Investment Profile Button */}
        <MenuItem
          icon={<FontAwesome5 name="user-tie" size={20} color="#FFD700" />}
          text="Perfil de Investimento"
          onPress={() => { onClose(); navigation.navigate('InvestmentProfile'); }}
          isNew={true}
        />
        
        <View style={styles.separator} />
        <MenuItem
          icon={<Feather name="settings" size={22} color="white" />}
          text="Configurações de Perfil"
          onPress={() => { onClose(); navigation.navigate('Profile'); }}
        />
        <MenuItem
          icon={<MaterialIcons name="logout" size={24} color="#FF6B6B" />}
          text="Logout"
          onPress={handleLogout}
          isLogout
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Financial Control v1.0</Text>
      </View>
    </Animated.View>
  );
};

export default SideMenu;