'use strict'
Object.defineProperty(exports, '__esModule', { value: true })

const { PathResolver } = require('../../util.js')

const { BaseAction } = require('./base.js')

class BuildAction extends BaseAction {
  constructor (cwdPathResolver) {
    super({
      actionName: 'build',
      summary: 'Run webpack',
      documentation: 'Run webpack'
    })

    this.pr = cwdPathResolver || new PathResolver()
  }

  onDefineParameters () {
    super.onDefineParameters()

    // other parameters
  }

  async onExecute () {
    const config = await this.resolveConfig(this.pr)
    return new Promise((resolve, reject) => {
      const webpack = this.pr.require('webpack')
      webpack(config, (err, stats) => {
        if (err) {
          return reject(err)
        }
        console.log(stats.toString({ colors: !this._noColor.value }) + '\n')
        resolve()
      })
    })
  }
}

exports.BuildAction = BuildAction
