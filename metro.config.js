const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ✅ Pour charger les modules Firebase en .cjs
config.resolver.sourceExts.push('cjs');

// ✅ Désactiver l'option exports (pour certaines libs mal structurées)
config.resolver.unstable_enablePackageExports = false;

// ✅ 🔥 Important : support des liens symboliques (pnpm)
config.resolver.symlinks = true;

// ✅ CRITIQUE: Ignorer les anciens dossiers React Navigation pour éviter les conflits
config.resolver.blockList = [
  /app\/screens\/.*/,
  /navigation\/.*/,
];

// ✅ Résolutions pour le web : mock de react-async-hook
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-async-hook') {
    return {
      filePath: path.resolve(__dirname, 'react-async-hook.web.js'),
      type: 'sourceFile',
    };
  }

  // Utiliser la résolution par défaut pour tout le reste
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
