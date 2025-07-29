module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './app',
          },
        },
      ],
      // 🔧 Plugin .env AVANT reanimated
      [
        'module:react-native-dotenv',
        {
          envName: 'APP_ENV',
          moduleName: '@env',
          path: '.env',
          blocklist: null,
          allowlist: null,
          safe: false,
          allowUndefined: true,
          verbose: false,
        },
      ],
      // 🔧 IMPORTANT: reanimated TOUJOURS en dernier !
      'react-native-reanimated/plugin',
    ],
  };
};