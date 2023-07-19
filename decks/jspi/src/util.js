const textDecoder = new TextDecoder()

export function decodeCString (memory, addr) {
  let end = addr
  const HEAPU8 = new Uint8Array(memory.buffer)
  while (HEAPU8[end]) {
    end++
  }
  const buffer = new Uint8Array(memory.buffer, addr, end - addr)
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
    const result = await WebAssembly.instantiate(buffer, this.imports)
    const instance = result.instance
    this.instance = instance
    if (!this.memory) this.memory = instance.exports.memory
    if (!this.table) this.table = instance.exports.__indirect_function_table
  }
}

export function wrapAsyncImport (f, parameterType, returnType) {
  return new WebAssembly.Function(
    { parameters: ['externref', ...parameterType], results: returnType },
    f,
    { suspending: 'first' }
  )
}

export function wrapAsyncExport (f) {
  const parameterType = WebAssembly.Function.type(f).parameters
  return new WebAssembly.Function(
    { parameters: parameterType.slice(1), results: ['externref'] },
    f,
    { promising: 'first' }
  )
}
