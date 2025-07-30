const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for web platform
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Add SVG support
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Support for SVG files
config.resolver.assetExts.push('svg');

module.exports = config;