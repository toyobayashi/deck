#!/usr/bin/env node

'use strict'
Object.defineProperty(exports, '__esModule', { value: true })

const main = require('..').default

main(process.argv.slice(2)).catch(err => {
  console.error(err)
  process.exit(1)
})
