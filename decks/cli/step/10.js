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
  constructor (options) {
    super(options)  // 基类构造函数调用 onDefineParameters
  }

  onDefineParameters () {
    this._config = this.defineStringParameter({
      parameterLongName: '--config',
      parameterShortName: '-c',
      description: 'Provide path to a configuration file',
      argumentName: 'FILE',
      environmentVariable: 'MYPACK_CONFIG'
    })

    this._mode = this.defineChoiceParameter({
      alternatives: ['none', 'development', 'production'],
      defaultValue: 'none',
      parameterLongName: '--mode',
      description: 'Defines the mode to pass to mypack',
      environmentVariable: 'MYPACK_MODE'
    })

    this._entry = this.defineStringListParameter({
      parameterLongName: '--entry',
      description: 'The entry point(s) of your application',
      argumentName: 'ENTRIES'
    })

    this._target = this.defineStringListParameter({
      parameterLongName: '--target',
      parameterShortName: '-t',
      description: 'Sets the build target',
      argumentName: 'TARGET'
    })

    this._progress = this.defineFlagParameter({
      parameterLongName: '--progress',
      description: 'Print compilation progress during build',
      environmentVariable: 'MYPACK_PROGRESS'
    })

    this._noColor = this.defineFlagParameter({
      parameterLongName: '--no-color',
      description: 'Disables any color on the console',
      environmentVariable: 'MYPACK_NO_COLOR'
    })
  }

  async resolveConfig (pathResolver) {
    let config
    if (this._config.value) {
      config = await readConfig(this._config.value)
    } else {
      config = getDefaultConfig(pathResolver, this._mode.value)
      if (this._entry.values.length > 0) {
        config.entry = this._entry.values
      }
      if (this._target.values.length > 0) {
        config.target = this._target.values
      }
      if (this._progress.value) {
        const webpack = pathResolver.require('webpack')
        const progressPlugin = new webpack.ProgressPlugin()
        config.plugins = [...(config.plugins || []), progressPlugin]
      }
    }

    return config
  }
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
