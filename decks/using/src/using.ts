import {
  openSync,
  closeSync,
  fstatSync,
  writeSync,
  PathLike, OpenMode, Mode
} from 'node:fs'
import { strictEqual } from 'node:assert'

// @ts-expect-error
Symbol.dispose ??= Symbol('Symbol.dispose')

function openFile (path: PathLike, flags: OpenMode, customDispose?: () => void): FileHandle {
  return new FileHandle(openSync(path, flags), customDispose)
}

class FileHandle {
  public constructor (
    private fd: number,
    private customDispose?: () => void
  ) {}

  public valueOf (): number {
    return this.fd
  }

  public write (data: Buffer): number {
    return writeSync(this.fd, data)
  }

  public close (): void {
    closeSync(this.fd)
  }

  public [Symbol.dispose] () {
    if (typeof this.customDispose === 'function') {
      this.customDispose()
    }
    this.close()
  }
}

function main () {
  using x = {
    [Symbol.dispose]() {
      console.log('x dispose')
    }
  }
  {
    using fdA = openFile('./a.txt', 'a+')
    using fdB = openFile('./b.txt', 'a+', () => {
      fdA.write(Buffer.from('some content\n'))
    })
  }
}

main()