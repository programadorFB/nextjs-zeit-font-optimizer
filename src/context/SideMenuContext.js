import React, { createContext, useContext, useState, useRef } from 'react';
import { Animated } from 'react-native';

const SideMenuContext = createContext();

export const SideMenuProvider = ({ children }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const toggleMenu = () => {
    const toValue = menuVisible ? -300 : 0;
    
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setMenuVisible(!menuVisible);
  };

  const closeMenu = () => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setMenuVisible(false);
    }
  };

  const openMenu = () => {
    if (!menuVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setMenuVisible(true);
    }
  };

  return (
    <SideMenuContext.Provider
      value={{
        menuVisible,
        slideAnim,
        toggleMenu,
        closeMenu,
        openMenu,
      }}
    >
      {children}
    </SideMenuContext.Provider>
  );
};

export const useSideMenu = () => {
  const context = useContext(SideMenuContext);
  if (!context) {
    throw new Error('useSideMenu must be used within a SideMenuProvider');
  }
  return context;
};