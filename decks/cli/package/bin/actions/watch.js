'use strict'
Object.defineProperty(exports, '__esModule', { value: true })

const { PathResolver } = require('../../util.js')

const { BaseAction } = require('./base.js')

class WatchAction extends BaseAction {
  constructor (cwdPathResolver) {
    super({
      actionName: 'watch',
      summary: 'Run webpack and watch for files changes.',
      documentation: 'Run webpack and watch for files changes.'
    })

    this.pr = cwdPathResolver || new PathResolver()
  }

  onDefineParameters () {
    super.onDefineParameters()

    // other parameters
  }

  async onExecute () {
    const config = await this.resolveConfig(this.pr)
    const webpack = this.pr.require('webpack')
    const compiler = webpack(config)
    compiler.watch({
      aggregateTimeout: 200
    }, (err, stats) => {
      if (err) {
        console.error(err)
        return
      }

      console.log(stats.toString({ colors: !this._noColor.value }) + '\n')
    })
  }
}

exports.WatchAction = WatchAction
