const fs = require('fs-extra')
const build = require('./build.js')
const { getPath } = require('./util.js')

build(process.argv.slice(2)).then(() => {
  fs.renameSync(getPath('public'), getPath('www'))
}).catch(err => {
  console.error(err)
  process.exit(1)
})
