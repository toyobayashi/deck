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
    return path.resolve(this.context, ...args)
  }
}

function getDefaultConfig (pr, mode) {
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
    context: pr.context,
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

function readConfig (filePath) {
  const r = typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__ : require
  let mod = r(path.resolve(filePath))
  if (mod.__esModule) {
    mod = mod.default
  }
  if (typeof mod === 'function') {
    return Promise.resolve(mod())
  }
  return Promise.resolve(mod)
}

exports.PathResolver = PathResolver
exports.getDefaultConfig = getDefaultConfig
exports.readConfig = readConfig
