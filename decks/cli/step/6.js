#!/usr/bin/env node

const path = require('path')
const Module = require('module')

class PathResolver {
  constructor (context) {
    this.context = context || process.cwd()
    this.require = Module.createRequire(
      path.join(this.context, 'mod.js'))
  }

  resolve (...args) {
    return path.resolve(this.context, ...args)
  }
}

async function main (args) {
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

  commandLineParser.addAction(new BuildAction(pr))
  commandLineParser.addAction(new WatchAction(pr))
  commandLineParser.addAction(new ServeAction(pr))

  await commandLineParser.executeWithoutErrorHandling(args)
}

const {
  CommandLineAction
} = require('@rushstack/ts-command-line')

class BaseAction extends CommandLineAction {
  // TODO
}

class BuildAction extends BaseAction {
  // TODO
}

class WatchAction extends BaseAction {
  // TODO
}

class ServeAction extends BaseAction {
  // TODO
}

main(process.argv.slice(2)).catch(err => {
  console.error(err)
  process.exit(1)
})
