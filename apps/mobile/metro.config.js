const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

const rootNodeModules = path.resolve(__dirname, "../../node_modules");

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  rootNodeModules,
];

config.watchFolders = [rootNodeModules];

module.exports = withNativeWind(config, { input: "./app/globals.css" });
