const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['@expo/vector-icons'],
      },
    },
    argv
  );

  // Ajouter des alias pour résoudre les modules problématiques sur web
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-async-hook': require.resolve('./react-async-hook.web.js'),
  };

  return config;
};
