const prefix = process.argv[2]
const deck = process.argv[3]
const filename = process.argv[4]
process.argv.splice(2, 3)

process.env.__SRC__ = filename

const config = require('mdx-deck/gatsby-config.js')
config.pathPrefix = `${prefix}/${deck}` 

require('gatsby/cli.js')
