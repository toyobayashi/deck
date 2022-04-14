'use strict'
Object.defineProperty(exports, '__esModule', { value: true })

const { PathResolver } = require('../../util.js')

const { BaseAction } = require('./base.js')

class ServeAction extends BaseAction {
  constructor (cwdPathResolver) {
    super({
      actionName: 'serve',
      summary: 'Run the webpack-dev-server.',
      documentation: 'Run the webpack-dev-server.'
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
    const WebpackDevServer = this.pr.require('webpack-dev-server')
    const compiler = webpack(config)
    const devServerOptions = config.devServer || {}
    const server = new WebpackDevServer(devServerOptions, compiler)
    await server.start()
  }
}

exports.ServeAction = ServeAction
