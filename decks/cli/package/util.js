'use strict'
Object.defineProperty(exports, '__esModule', { value: true })

const path = require('path')
const Module = require('module')

class PathResolver {
  constructor (context) {
    this.context = context || process.cwd()
    this.require = Module.createRequire(path.join(this.context, 'mod.js'))
  }

  resolve (...args) {
    if (!args.length) return path.resolve(this.context)
    if (path.isAbsolute(args[0])) {
      return path.join(...args)
    }
    return path.join(this.context, ...args)
  }
}

function getDefaultConfig (context, mode) {
  const pr = new PathResolver(context)

  return {
    entry: {
      app: pr.resolve('src/index')
    },
    output: {
      path: pr.resolve('dist'),
      filename: '[name].js'
    },
    mode: mode,
    devtool: mode === 'development' ? 'eval-source-map' : false,
    context,
    node: false,
    target: ['web', 'es5'],
    devServer: {
      host: '0.0.0.0',
      port: 8090,
      static: pr.resolve('dist'),
      devMiddleware: {
        publicPath: '/'
      }
    }
  }
}

function readConfig (filePath, env) {
  const r = typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__ : require
  let mod = r(path.resolve(filePath))
  if (mod.__esModule) {
    mod = mod.default
  }
  if (typeof mod === 'function') {
    return Promise.resolve(mod(env))
  }
  return Promise.resolve(mod)
}

exports.PathResolver = PathResolver
exports.getDefaultConfig = getDefaultConfig
exports.readConfig = readConfig
