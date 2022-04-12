'use strict'
Object.defineProperty(exports, '__esModule', { value: true })

const {
  CommandLineAction
} = require('@rushstack/ts-command-line')

const { readConfig, getDefaultConfig } = require('../../util.js')

class BaseAction extends CommandLineAction {
  onDefineParameters () {
    this._config = this.defineStringParameter({
      parameterLongName: '--config',
      parameterShortName: '-c',
      description: 'Configuration file',
      argumentName: 'FILE',
      environmentVariable: 'MYPACK_CONFIG'
    })

    this._mode = this.defineChoiceParameter({
      alternatives: ['none', 'development', 'production'],
      defaultValue: 'none',
      parameterLongName: '--mode',
      description: 'Development or production mode',
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
      config = getDefaultConfig(pathResolver.context, this._mode.value)
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

exports.BaseAction = BaseAction
