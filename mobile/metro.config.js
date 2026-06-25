const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')
const { resolve: resolveRequest } = require('metro-resolver')
const { withNativeWind } = require('nativewind/metro')

const projectRoot = __dirname
const workspaceRoot = path.resolve(__dirname, '..')

const config = getDefaultConfig(projectRoot)

config.resolver.sourceExts.push('cjs')
config.resolver.unstable_enablePackageExports = false

config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]
config.resolver.alias = {
  '@shared': path.resolve(workspaceRoot, 'shared'),
}

const firebaseAuthRnEntry = path.resolve(
  projectRoot,
  'node_modules/@firebase/auth/dist/rn/index.js',
)

const defaultResolver = config.resolver.resolveRequest

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform !== 'web' &&
    (moduleName === 'firebase/auth' || moduleName === '@firebase/auth')
  ) {
    return {
      filePath: firebaseAuthRnEntry,
      type: 'sourceFile',
    }
  }

  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform)
  }

  return resolveRequest(context, moduleName, platform)
}

module.exports = withNativeWind(config, { input: './global.css' })
