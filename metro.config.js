const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
const config = {
  resolver: {
    sourceExts: [...defaultConfig.resolver.sourceExts, 'css'],
  },
};

 // NativeWind temporarily disabled due to path resolution issues with spaces in path
// Uncomment below if you want to use NativeWind (requires path without spaces)
// try {
//   const {withNativeWind} = require('nativewind/metro');
//   module.exports = withNativeWind(mergeConfig(defaultConfig, config), {
//     input: './global.css',
//   });
// } catch (error) {
//   console.warn('NativeWind metro config failed:', error.message);
//   module.exports = mergeConfig(defaultConfig, config);
// }

module.exports = mergeConfig(defaultConfig, config);
