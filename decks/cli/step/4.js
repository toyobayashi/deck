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
}

main(process.argv.slice(2)).catch(err => {
  console.error(err)
  process.exit(1)
})
