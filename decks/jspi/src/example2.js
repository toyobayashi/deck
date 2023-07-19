#!/usr/bin/env node --experimental-wasm-stack-switching

import {
  WasmModule,
  decodeCString,
  wrapAsyncImport,
  wrapAsyncExport
} from './util.js'

const mod = new WasmModule(
  new URL('example2.wasm', import.meta.url),
  {
    env: {
      suspender: new WebAssembly.Global({
        mutable: true,
        value: 'externref'
      }, null),
      logCString (addr) {
        console.log(decodeCString(mod.memory, addr))
      },
      sleep: wrapAsyncImport(function (ms) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(ms)
          }, ms)
        })
      }, ['i32'], [])
    }
  }
)

mod.instantiate().then(() => {
  const asyncStart = wrapAsyncExport(mod.exports._start)
  asyncStart().then((ret) => {
    console.log(ret)
  })
  console.log('after _start')
})
