const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

// Permet de charger les modules Firebase correctement
config.resolver.sourceExts.push('cjs');
// Désactive la prise en charge du champ "exports" dans package.json
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
