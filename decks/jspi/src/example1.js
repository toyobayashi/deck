#!/usr/bin/env node

import {
  WasmModule
} from './util.js'

const mod = new WasmModule({
  env: {
    sleep (ms) {
      const end = Date.now() + ms
      while (Date.now() < end) {}
    }
  }
})

mod.instantiate('example1.wasm').then(() => {
  const ret = mod.exports._start()
  console.log('after _start')
  console.log(ret)
})
