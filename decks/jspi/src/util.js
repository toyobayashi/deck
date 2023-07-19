const textDecoder = new TextDecoder()

export function decodeCString (memory, addr) {
  let end = addr
  const HEAPU8 = new Uint8Array(memory.buffer)
  while (HEAPU8[end]) {
    end++
  }
  const buffer = new Uint8Array(
    memory.buffer, addr, end - addr)
  return textDecoder.decode(buffer)
}

export class WasmModule {
  constructor (url, imports = {}) {
    this.url = url
    this.imports = imports
    const env = imports.env
    this.memory = env && env.memory
    this.table = env && env.__indirect_function_table
    this.module = undefined
    this.instance = undefined
  }

  get exports () {
    return this.instance.exports
  }

  async instantiate () {
    if (this.instance && this.module) return
    const url = this.url
    let buffer
    if (typeof window !== 'undefined') {
      buffer = (await fetch(url).then(r => r.arrayBuffer()))
    } else {
      const { readFile } = await import('fs/promises')
      buffer = await readFile(url)
    }
    const result = await WebAssembly.instantiate(
      buffer, this.imports)
    const instance = result.instance
    this.instance = instance
    this.module = result.module
    const exports = instance.exports
    if (!this.memory) this.memory = exports.memory
    if (!this.table) {
      this.table = exports.__indirect_function_table
    }
  }
}

export function wrapAsyncImport (f, parameters, results) {
  return new WebAssembly.Function(
    {
      parameters: ['externref', ...parameters],
      results
    },
    f,
    { suspending: 'first' }
  )
}

export function wrapAsyncExport (f) {
  const { parameters } = WebAssembly.Function.type(f)
  return new WebAssembly.Function(
    {
      parameters: parameters.slice(1),
      results: ['externref']
    },
    f,
    { promising: 'first' }
  )
}
