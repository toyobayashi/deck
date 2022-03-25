const { openSync, closeSync } = require('fs')

class File {
  #f

  constructor (path, mode) {
    this.#f = openSync(path, mode)
    File.registry.register(this, this.#f)
  }

  readToString () {
    // ...
  }

  static registry = new FinalizationRegistry(File.cleanup)

  static cleanup (fd) {
    closeSync(fd)
    console.log('~File()')
  }
}

let file = new File('package.json', 'r')
console.log(file.readToString())
file = null // File 准备好被回收了

// 命令行参数 --expose-gc
global.gc() // node 手动触发垃圾回收