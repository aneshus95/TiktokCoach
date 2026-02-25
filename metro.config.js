const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  server: {
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Increase timeout to 4 hours (14400000 milliseconds)
        res.setTimeout(14400000);
        return middleware(req, res, next);
      };
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
