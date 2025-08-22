const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Ensure CSS is properly handled in production
config.transformer.minifierConfig = {
  // Disable minification that might break CSS classes
  mangle: false,
};

module.exports = withNativeWind(config, { input: './global.css' });