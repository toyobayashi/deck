#!/usr/bin/env node

import {
  WasmModule,
  decodeCString
} from './util.js'

const mod = new WasmModule(
  new URL('example1.wasm', import.meta.url),
  {
    env: {
      logCString (addr) {
        console.log(decodeCString(mod.memory, addr))
      },
      sleep (ms) {
        const end = Date.now() + ms
        while (Date.now() < end) {}
      }
    }
  }
)

mod.instantiate().then(() => {
  const ret = mod.exports._start()
  console.log('after _start')
  console.log(ret)
})
