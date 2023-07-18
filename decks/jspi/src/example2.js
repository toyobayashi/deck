#!/usr/bin/env node --experimental-wasm-stack-switching

import {
  WasmModule,
  wrapAsyncImport,
  wrapAsyncExport
} from './util.js'

const mod = new WasmModule({
  env: {
    suspender: new WebAssembly.Global({
      mutable: true,
      value: 'externref'
    }, null),
    sleep: wrapAsyncImport(function (ms) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(ms)
        }, ms)
      })
    }, ['i32'], [])
  }
})

mod.instantiate('example2.wasm').then(() => {
  const asyncStart = wrapAsyncExport(mod.exports._start)
  asyncStart().then((ret) => {
    console.log(ret)
  })
  console.log('after _start')
})
