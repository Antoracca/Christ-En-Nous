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
      // 🔧 IMPORTANT: reanimated TOUJOURS en dernier !
      'react-native-reanimated/plugin',
    ],
  };
};
