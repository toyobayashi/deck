const { openSync, closeSync } = require('fs')

class File {
  #f
  #heldValue

  constructor (path, mode) {
    this.#f = openSync(path, mode)
    this.#heldValue = {
      fd: this.#f,
      closed: false
    }
    File.registry.register(this, this.#heldValue)
  }

  readToString () {
    // ...
  }

  static registry = new FinalizationRegistry(File.cleanup)

  static cleanup (heldValue) {
    console.log('~File()')
    if (!heldValue.closed) {
      console.warn('你忘了关闭文件！')
      closeSync(heldValue.fd)
    }
  }

  dispose () {
    if (this.#f) {
      closeSync(this.#f)
      this.#f = 0
      this.#heldValue.closed = true
      this.#heldValue = null
    }
  }
}

class Scope {
  #disposables
  constructor () {
    this.#disposables = new Set()
  }

  add (disposable) {
    if (typeof disposable.dispose !== 'function') {
      throw new TypeError('你传错了的嘛')
    }
    this.#disposables.add(disposable)
    return disposable
  }
  
  dispose () {
    if (!this.#disposables) return
    for (const disposable of this.#disposables) {
      disposable.dispose()
    }
    this.#disposables.clear()
    this.#disposables = null
  }
}

function openScope (f) {
  const scope = new Scope()
  let r
  try {
    r = f(scope)
  } finally {
    scope.dispose()
  }
  return r
}

const data = openScope((scope) => {
  const file = scope.add(new File('package.json', 'r'))
  // file 做各种各样的事情
  return file.readToString()
})
console.log(data)

// 命令行参数 --expose-gc
global.gc() // node 手动触发垃圾回收