const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ✅ Pour charger les modules Firebase en .cjs
config.resolver.sourceExts.push('cjs');

// ✅ Désactiver l’option exports (pour certaines libs mal structurées)
config.resolver.unstable_enablePackageExports = false;

// ✅ 🔥 Important : support des liens symboliques (pnpm)
config.resolver.symlinks = true;

module.exports = config;
