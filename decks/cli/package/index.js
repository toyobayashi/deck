'use strict'
Object.defineProperty(exports, '__esModule', { value: true })

/**
 * 程序 main 函数
 * @param {string[]} args - 除掉脚本自身，剩余的命令行参数
 * @returns {Promise<void>}
 */
function main (args) {
  const { PathResolver } = require('./util.js')

  const pkg = require('./package.json')
  const pr = new PathResolver()

  if (args[0] === '-v' || args[0] === '--version') {
    console.log(`mypack: v${pkg.version}`)
    console.log(`webpack: v${pr.require('webpack').version}`)
    return
  }

  const {
    DynamicCommandLineParser
  } = require('@rushstack/ts-command-line')

  const commandLineParser = new DynamicCommandLineParser({
    toolFilename: 'mypack',
    toolDescription: `[v${pkg.version}] ${pkg.description}`
  })

  const { BuildAction } = require('./bin/actions/build.js')
  const { WatchAction } = require('./bin/actions/watch.js')
  const { ServeAction } = require('./bin/actions/serve.js')
  commandLineParser.addAction(new BuildAction(pr))
  commandLineParser.addAction(new WatchAction(pr))
  commandLineParser.addAction(new ServeAction(pr))

  return commandLineParser.executeWithoutErrorHandling(args)
}

exports.default = main
