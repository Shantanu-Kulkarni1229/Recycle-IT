const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

let config = getDefaultConfig(__dirname);

// 👇 Ensure Metro knows where tslib is
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  tslib: require.resolve("tslib"),
};

module.exports = withNativeWind(config, { input: "./app/global.css" });
