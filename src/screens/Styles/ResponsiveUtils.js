import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Device types
export const DEVICE_TYPES = {
  PHONE_SMALL: 'phoneSmall',   // < 375px
  PHONE: 'phone',              // 375-414px
  PHONE_LARGE: 'phoneLarge',   // 414-480px
  TABLET_SMALL: 'tabletSmall', // 480-768px
  TABLET: 'tablet',            // 768-1024px
  TABLET_LARGE: 'tabletLarge', // > 1024px
};

// Screen dimensions
export const SCREEN_DIMENSIONS = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isLandscape: SCREEN_WIDTH > SCREEN_HEIGHT,
  isPortrait: SCREEN_WIDTH <= SCREEN_HEIGHT,
};

// Get current device type
export const getDeviceType = () => {
  if (SCREEN_WIDTH < 375) return DEVICE_TYPES.PHONE_SMALL;
  if (SCREEN_WIDTH < 414) return DEVICE_TYPES.PHONE;
  if (SCREEN_WIDTH < 480) return DEVICE_TYPES.PHONE_LARGE;
  if (SCREEN_WIDTH < 768) return DEVICE_TYPES.TABLET_SMALL;
  if (SCREEN_WIDTH < 1024) return DEVICE_TYPES.TABLET;
  return DEVICE_TYPES.TABLET_LARGE;
};

// Check if device is tablet
export const isTablet = () => {
  const deviceType = getDeviceType();
  return [
    DEVICE_TYPES.TABLET_SMALL,
    DEVICE_TYPES.TABLET,
    DEVICE_TYPES.TABLET_LARGE
  ].includes(deviceType);
};

// Responsive width
export const wp = (percentage) => {
  return (percentage * SCREEN_WIDTH) / 100;
};

// Responsive height
export const hp = (percentage) => {
  return (percentage * SCREEN_HEIGHT) / 100;
};

// Responsive font size based on screen width
export const rf = (size) => {
  const scale = SCREEN_WIDTH / 375; // Base on iPhone 7/8 width
  const newSize = size * scale;
  
  // Minimum and maximum limits
  const minSize = size * 0.8;
  const maxSize = size * 1.3;
  
  return Math.max(minSize, Math.min(maxSize, newSize));
};

// Responsive padding/margin
export const rs = (size) => {
  const scale = SCREEN_WIDTH / 375;
  return size * scale;
};

// Responsive border radius
export const rbr = (radius) => {
  return radius * (SCREEN_WIDTH / 375);
};

// Get responsive value based on device type
export const getResponsiveValue = (values) => {
  const deviceType = getDeviceType();
  
  if (values[deviceType] !== undefined) {
    return values[deviceType];
  }
  
  // Fallback logic
  if (isTablet()) {
    return values.tablet || values.default || values[Object.keys(values)[0]];
  }
  
  return values.phone || values.default || values[Object.keys(values)[0]];
};

// Responsive flex basis
export const getFlexBasis = (columns, gap = 0) => {
  const gapTotal = gap * (columns - 1);
  return `${(100 - gapTotal) / columns}%`;
};

// Responsive grid
export const getGridItemWidth = (columns, containerWidth = SCREEN_WIDTH, gap = 0) => {
  const gapTotal = gap * (columns - 1);
  return (containerWidth - gapTotal) / columns;
};

// Responsive font weight (some devices handle font weights differently)
export const rfw = (weight) => {
  const pixelRatio = PixelRatio.get();
  
  if (pixelRatio < 2) {
    // Lower DPI devices
    switch (weight) {
      case 'bold': return '600';
      case '700': return '600';
      case '800': return '700';
      case '900': return '700';
      default: return weight;
    }
  }
  
  return weight;
};

// Responsive line height
export const rlh = (fontSize, ratio = 1.4) => {
  return fontSize * ratio;
};

// Safe area calculations (for devices with notches)
export const getSafeAreaPadding = () => {
  const deviceType = getDeviceType();
  
  // Approximate safe area values for different devices
  switch (deviceType) {
    case DEVICE_TYPES.PHONE_SMALL:
      return { top: rs(20), bottom: rs(10) };
    case DEVICE_TYPES.PHONE:
      return { top: rs(25), bottom: rs(15) };
    case DEVICE_TYPES.PHONE_LARGE:
      return { top: rs(30), bottom: rs(20) };
    default:
      return { top: rs(35), bottom: rs(25) };
  }
};

// Responsive shadow
export const getResponsiveShadow = (elevation) => {
  const scale = Math.min(SCREEN_WIDTH / 375, 1.5);
  
  return {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: elevation * scale,
    },
    shadowOpacity: 0.22 + (elevation * 0.02),
    shadowRadius: (elevation * 2) * scale,
    elevation: elevation * scale,
  };
};

// Responsive card dimensions
export const getCardDimensions = () => {
  const deviceType = getDeviceType();
  
  return getResponsiveValue({
    [DEVICE_TYPES.PHONE_SMALL]: {
      padding: rs(12),
      borderRadius: rbr(10),
      margin: rs(8),
    },
    [DEVICE_TYPES.PHONE]: {
      padding: rs(16),
      borderRadius: rbr(12),
      margin: rs(10),
    },
    [DEVICE_TYPES.PHONE_LARGE]: {
      padding: rs(18),
      borderRadius: rbr(14),
      margin: rs(12),
    },
    [DEVICE_TYPES.TABLET_SMALL]: {
      padding: rs(20),
      borderRadius: rbr(16),
      margin: rs(15),
    },
    [DEVICE_TYPES.TABLET]: {
      padding: rs(24),
      borderRadius: rbr(18),
      margin: rs(18),
    },
    [DEVICE_TYPES.TABLET_LARGE]: {
      padding: rs(28),
      borderRadius: rbr(20),
      margin: rs(20),
    },
  });
};

// Responsive button dimensions
export const getButtonDimensions = () => {
  const deviceType = getDeviceType();
  
  return getResponsiveValue({
    [DEVICE_TYPES.PHONE_SMALL]: {
      height: rs(44),
      paddingHorizontal: rs(16),
      fontSize: rf(14),
      borderRadius: rbr(8),
    },
    [DEVICE_TYPES.PHONE]: {
      height: rs(48),
      paddingHorizontal: rs(20),
      fontSize: rf(16),
      borderRadius: rbr(10),
    },
    [DEVICE_TYPES.PHONE_LARGE]: {
      height: rs(52),
      paddingHorizontal: rs(24),
      fontSize: rf(17),
      borderRadius: rbr(12),
    },
    [DEVICE_TYPES.TABLET_SMALL]: {
      height: rs(56),
      paddingHorizontal: rs(28),
      fontSize: rf(18),
      borderRadius: rbr(14),
    },
    [DEVICE_TYPES.TABLET]: {
      height: rs(60),
      paddingHorizontal: rs(32),
      fontSize: rf(19),
      borderRadius: rbr(16),
    },
    [DEVICE_TYPES.TABLET_LARGE]: {
      height: rs(64),
      paddingHorizontal: rs(36),
      fontSize: rf(20),
      borderRadius: rbr(18),
    },
  });
};

// Responsive column count for grids
export const getColumnCount = () => {
  const deviceType = getDeviceType();
  
  return getResponsiveValue({
    [DEVICE_TYPES.PHONE_SMALL]: 1,
    [DEVICE_TYPES.PHONE]: 1,
    [DEVICE_TYPES.PHONE_LARGE]: 2,
    [DEVICE_TYPES.TABLET_SMALL]: 2,
    [DEVICE_TYPES.TABLET]: 3,
    [DEVICE_TYPES.TABLET_LARGE]: 4,
  });
};

// Responsive modal dimensions
export const getModalDimensions = () => {
  const deviceType = getDeviceType();
  
  return getResponsiveValue({
    [DEVICE_TYPES.PHONE_SMALL]: {
      width: wp(95),
      maxWidth: wp(95),
      padding: rs(16),
    },
    [DEVICE_TYPES.PHONE]: {
      width: wp(90),
      maxWidth: wp(90),
      padding: rs(20),
    },
    [DEVICE_TYPES.PHONE_LARGE]: {
      width: wp(85),
      maxWidth: wp(85),
      padding: rs(24),
    },
    [DEVICE_TYPES.TABLET_SMALL]: {
      width: wp(75),
      maxWidth: 500,
      padding: rs(28),
    },
    [DEVICE_TYPES.TABLET]: {
      width: wp(65),
      maxWidth: 600,
      padding: rs(32),
    },
    [DEVICE_TYPES.TABLET_LARGE]: {
      width: wp(55),
      maxWidth: 700,
      padding: rs(36),
    },
  });
};

// Responsive icon sizes
export const getIconSize = (size = 'medium') => {
  const deviceType = getDeviceType();
  
  const sizeMap = {
    small: {
      [DEVICE_TYPES.PHONE_SMALL]: rf(14),
      [DEVICE_TYPES.PHONE]: rf(16),
      [DEVICE_TYPES.PHONE_LARGE]: rf(18),
      [DEVICE_TYPES.TABLET_SMALL]: rf(20),
      [DEVICE_TYPES.TABLET]: rf(22),
      [DEVICE_TYPES.TABLET_LARGE]: rf(24),
    },
    medium: {
      [DEVICE_TYPES.PHONE_SMALL]: rf(20),
      [DEVICE_TYPES.PHONE]: rf(22),
      [DEVICE_TYPES.PHONE_LARGE]: rf(24),
      [DEVICE_TYPES.TABLET_SMALL]: rf(26),
      [DEVICE_TYPES.TABLET]: rf(28),
      [DEVICE_TYPES.TABLET_LARGE]: rf(30),
    },
    large: {
      [DEVICE_TYPES.PHONE_SMALL]: rf(28),
      [DEVICE_TYPES.PHONE]: rf(32),
      [DEVICE_TYPES.PHONE_LARGE]: rf(36),
      [DEVICE_TYPES.TABLET_SMALL]: rf(40),
      [DEVICE_TYPES.TABLET]: rf(44),
      [DEVICE_TYPES.TABLET_LARGE]: rf(48),
    },
  };
  
  return getResponsiveValue(sizeMap[size] || sizeMap.medium);
};