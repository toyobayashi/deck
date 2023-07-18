const fs = require('fs')
const path = require('path')

class Example1 {
  constructor () {
    this.instance = undefined
    this.memory = undefined
    this.exports = undefined
    this.imports = {
      env: {
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
        sleep (ms) {
          const end = Date.now() + ms
          while (Date.now() < end) {}
        }
      }
    }
  }

  async instantiate () {
    const buffer = await fs.promises.readFile(path.join(__dirname, 'example1.wasm'))
    const result = await WebAssembly.instantiate(buffer, this.imports)
    const instance = result.instance
    this.instance = instance
    this.memory = instance.exports.memory
    this.exports = instance.exports
    return result
  }
}

const mod = new Example1()
mod.instantiate().then(() => {
  mod.exports._start()
  console.log('after _start')
})
