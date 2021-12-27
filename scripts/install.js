const path = require('path')
const fs = require('fs')
const { getPath, npm, DECKS_DIR } = require('./util.js')

async function main () {
  if (fs.existsSync(getPath('package-lock.json'))) {
    await npm(['ci'])
  } else {
    await npm(['install'])
  }

  const items = await fs.promises.readdir(DECKS_DIR)
  for (let i = 0; i < items.length; ++i) {
    const dir = getPath(DECKS_DIR, items[i])
    const packageJson = getPath(dir, 'package.json')
    const packageLockJson = getPath(dir, 'package-lock.json')
    if (fs.existsSync(packageJson)) {
      if (fs.existsSync(packageLockJson)) {
        await npm(['ci'], dir)
      } else {
        await npm(['install'], dir)
      }
    }
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
