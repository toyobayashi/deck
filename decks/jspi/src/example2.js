const fs = require('fs')
const path = require('path')

function wrapAsyncImport (f, parameterType, returnType) {
  return new WebAssembly.Function(
    { parameters: ['externref', ...parameterType], results: returnType },
    f,
    { suspending: 'first' }
  )
}

function wrapAsyncExport (f) {
  const parameterType = WebAssembly.Function.type(f).parameters
  return new WebAssembly.Function(
    { parameters: parameterType.slice(1), results: ['externref'] },
    f,
    { promising: 'first' }
  )
}

class Example2 {
  constructor () {
    this.instance = undefined
    this.memory = undefined
    this.exports = undefined
    this.globalSuspender = new WebAssembly.Global({
      mutable: true,
      value: 'externref'
    }, null)
    this.imports = {
      env: {
        suspender: this.globalSuspender,
        logCString: (addr) => {
          let end = addr
          const HEAPU8 = new Uint8Array(this.memory.buffer)
          while (HEAPU8[end]) {
            end++
          }
          const buffer = new Uint8Array(this.memory.buffer, addr, end - addr)
          const str = new TextDecoder().decode(buffer)
          console.log(str)
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
  }

  async instantiate () {
    const buffer = await fs.promises.readFile(path.join(__dirname, 'example2_c.wasm'))
    const result = await WebAssembly.instantiate(buffer, this.imports)
    const instance = result.instance
    this.instance = instance
    this.memory = instance.exports.memory
    this.exports = instance.exports
    return result
  }
}

const mod = new Example2()
mod.instantiate().then(() => {
  const asyncStart = wrapAsyncExport(mod.exports._start)
  asyncStart().then((res) => {
    console.log(res)
  })
  console.log('after _start')
})
