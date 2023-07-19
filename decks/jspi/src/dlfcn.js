#!/usr/bin/env node --experimental-wasm-stack-switching

import {
  WasmModule,
  wrapAsyncImport,
  wrapAsyncExport,
  decodeCString
} from './util.js'

const mainModuleGlobalBase = 1024
const memory = new WebAssembly.Memory({ initial: 1 })
const __indirect_function_table = new WebAssembly.Table({
  initial: 1,
  element: 'anyfunc'
})
const __stack_pointer = new WebAssembly.Global({
  value: 'i32',
  mutable: true
}, 4096)

const registryById = []
const registryByUrl = new Map()
let nextHandleId = 1

function allocateHandleId () {
  return nextHandleId++
}

function register (id, url, mod) {
  const exports = mod.exports
  const exportsList = Object.keys(exports)
  const record = {
    id,
    url,
    mod,
    table: Object.create(null)
  }
  registryById[id] = record
  registryByUrl.set(url, record)
  const start = __indirect_function_table.length
  __indirect_function_table.grow(exportsList.length)
  const ignore = [
    '__wasm_call_ctors',
    '__wasm_apply_data_relocs',
    '__dso_handle'
  ]
  for (let i = 0; i < exportsList.length; i++) {
    const k = exportsList[i]
    const index = start + i
    record.table[k] = index
    const value = exports[k]
    if (typeof value !== 'function' && ignore.includes(k)) {
      continue
    }
    const parameterType = WebAssembly.Function.type(value).parameters
    if (parameterType[0] === 'externref') {
      __indirect_function_table.set(index, wrapAsyncExport(value))
    } else {
      __indirect_function_table.set(index, value)
    }
  }
  if ('__wasm_apply_data_relocs' in exports) {
    exports.__wasm_apply_data_relocs()
  }
  if ('__wasm_call_ctors' in exports) {
    exports.__wasm_call_ctors()
  }
}

const dlopen = wrapAsyncImport(async function (filename) {
  try {
    const file = decodeCString(mainModule.memory, filename)
    const url = new URL(file, import.meta.url)
    if (registryByUrl.has(url)) {
      return registryByUrl.get(url).id
    }
    const mod = new WasmModule(url, {
      env: {
        memory,
        __indirect_function_table,
        __stack_pointer,
        __memory_base: new WebAssembly.Global({
          mutable: false,
          value: 'i32'
        }, mainModuleGlobalBase + nextHandleId * 64),
        __table_base: new WebAssembly.Global({
          mutable: false,
          value: 'i32'
        }, __indirect_function_table.length)
      },
      dlfcn: {
        dlopen,
        dlsym
      }
    })
    await mod.instantiate(file)
    const id = allocateHandleId()
    register(id, url, mod)
    return id
  } catch (err) {
    console.error(err)
    return 0
  }
}, ['i32', 'i32'], ['i32'])

function dlsym (handle, symbol) {
  try {
    const symbolName = decodeCString(mainModule.memory, symbol)
    const index = registryById[handle].table[symbolName]
    return index
  } catch (err) {
    console.error(err)
    return 0
  }
}

const url = new URL('dlfcn.wasm', import.meta.url)
const mainModule = new WasmModule(
  url,
  {
    env: {
      memory,
      __indirect_function_table,
      __stack_pointer,
      __memory_base: new WebAssembly.Global({
        mutable: false,
        value: 'i32'
      }, mainModuleGlobalBase),
      __table_base: new WebAssembly.Global({
        mutable: false,
        value: 'i32'
      }, __indirect_function_table.length),
      log (value) {
        console.log(value)
      }
    },
    dlfcn: {
      dlopen,
      dlsym
    }
  }
)

mainModule.instantiate('dlfcn.wasm').then(() => {
  register(0, url, mainModule)

  const asyncStart = wrapAsyncExport(mainModule.exports._start)
  asyncStart().then((ret) => {
    console.log(ret)
  })
})
