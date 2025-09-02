import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
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
        <BlurView intensity={25} tint="dark" style={styles.blurContainer} />
        <Animated.View
          style={[
            styles.menuItemBorder, 
            { opacity: glowOpacity },
            isNew && { borderColor: '#ada860ff' }
          ]}
        />
        

        
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
      <BlurView intensity={50} tint="dark" style={styles.blurContainer} />

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
          icon={<FontAwesome5 name="user-tie" size={20} color="white" />}
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: 'rgba(26, 26, 26, 0.6)',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItemContainer: {
    marginHorizontal: 10,
    marginVertical: 3,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  menuItemBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  menuIcon: {
    width: 30,
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  logoutText: {
    color: '#FF6B6B',
  },
  newMenuItem: {
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  newMenuText: {
    color: '#FFD700',
  },
  newBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 10,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(51, 51, 51, 0.8)',
    marginVertical: 15,
    marginHorizontal: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#888888',
  },
});

export default SideMenu;