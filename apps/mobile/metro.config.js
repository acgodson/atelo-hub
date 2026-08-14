const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.disableHierarchicalLookup = false;

const STUBBED_MODULES = new Set(["pino-pretty", "lokijs", "encoding", "porto"]);
const STUBBED_PREFIXES = ["@x402/", "porto/"];

const baseResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    STUBBED_MODULES.has(moduleName) ||
    STUBBED_PREFIXES.some((prefix) => moduleName.startsWith(prefix))
  ) {
    return { type: "empty" };
  }
  const resolve = baseResolveRequest || context.resolveRequest;
  return resolve(context, moduleName, platform);
};

module.exports = config;
