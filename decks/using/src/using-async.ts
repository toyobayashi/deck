import type { PathLike, OpenMode } from 'node:fs'
import * as fsPromises from 'node:fs/promises'

// @ts-expect-error
Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose')

async function openFile (
  path: PathLike,
  flags: OpenMode,
  customDispose?: () => void
): Promise<FileHandle> {
  return new FileHandle(await fsPromises.open(path, flags), customDispose)
}

class FileHandle {
  public constructor (
    public fd: fsPromises.FileHandle,
    private customDispose?: () => void | Promise<void>
  ) {}

  public async [Symbol.asyncDispose] () {
    if (typeof this.customDispose === 'function') {
      await Promise.resolve(this.customDispose())
    }
    await this.fd.close()
  }
}

async function main () {
  await using fdA = await openFile('./a.txt', 'a+')
  await using fdB = await openFile('./b.txt', 'a+', async () => {
    await fdA.fd.write(Buffer.from('some content\n'))
  })
}

main()
