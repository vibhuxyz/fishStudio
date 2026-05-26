const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

const rootNodeModules = path.resolve(__dirname, "../../node_modules");

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  rootNodeModules,
];

config.watchFolders = Array.from(
  new Set([...(config.watchFolders ?? []), rootNodeModules]),
);

// Stub out native-only packages when bundling for web (expo export)
const WEB_STUBS = {
  "@stripe/stripe-react-native": path.resolve(__dirname, "stubs/stripe-react-native.js"),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && WEB_STUBS[moduleName]) {
    return { filePath: WEB_STUBS[moduleName], type: "sourceFile" };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./app/globals.css" });
