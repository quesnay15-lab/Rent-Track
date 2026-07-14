// Some npm packages ship a modern ESM/browser build (using newer JS syntax
// like private class fields) alongside their React Native build, and Metro's
// automatic "package exports" resolution can sometimes pick the wrong one —
// causing a "private properties are not supported" runtime error on Hermes.
// Disabling it forces Metro back to the main/react-native entry points.

const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
