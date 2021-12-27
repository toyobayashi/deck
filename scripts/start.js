const path = require('path')
const fs = require('fs')
const { getPath, gatsbyDev, DECKS_DIR } = require('./util.js')

async function main (argv) {
  if (!argv[0]) {
    throw new Error('Invalid argument')
  }
  await gatsbyDev(argv[0], {})
  // await npm(['start'], getPath(DECKS_DIR, argv[0] || ''))
}

main(process.argv.slice(2)).catch(err => {
  console.error(err)
  process.exit(1)
})
