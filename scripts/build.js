const path = require('path')
const fs = require('fs-extra')
const { getPath, gatsbyBuild, DECKS_DIR } = require('./util.js')

async function build (deck, prefix) {
  await gatsbyBuild(deck, {
    prefix,
    prefixPaths: true
  })
  fs.mkdirsSync(getPath('public'))
  fs.copySync(getPath(DECKS_DIR, deck, 'public'), getPath('public', deck))
}

class BuildError extends Error {
  get name () {
    return 'BuildError'
  }

  constructor (errors, message) {
    super(message)
    this.errors = errors
  }
}

async function main (argv) {
  // let patched = false
  // const deckjs = getPath('node_modules/@mdx-deck/gatsby-plugin/src/deck.js')
  // const deckjsBackup = getPath('node_modules/@mdx-deck/gatsby-plugin/src/deck.js.backup')
  // if (fs.existsSync(deckjsBackup)) {
  //   patched = true
  // } else {
  //   fs.copySync(deckjs, deckjsBackup)
  //   let code = fs.readFileSync(deckjs, 'utf8')
  //   code = code.replace(/props\.navigate\('\/#' \+ index/, "props.navigate(props.location.pathname + '#' + index")
  //   fs.writeFileSync(deckjs, code, 'utf8')
  // }
  const items = await fs.promises.readdir(DECKS_DIR)
  const successed = []
  if (argv.length) {
    await build(argv[0], process.env.DECK_PREFIX || '')
    successed.push(argv[0])
  } else {
    let errors = []
    for (let i = 0; i < items.length; ++i) {
      try {
        await build(items[i], process.env.DECK_PREFIX || '')
        successed.push(items[i])
      } catch (err) {
        errors.push(err)
        continue
      }
    }
    if (errors.length) {
      throw new BuildError(errors)
    }
  }
  fs.writeFileSync(getPath('public', 'index.html'), `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>decks</title>
</head>
<body>
  <ul>
    ${successed.map(deck => `    <li><a href="./${deck}/">${deck}</a></li>`).join('\n')}
  </ul>
</body>
</html>
`, 'utf8')
}

module.exports = main

if (require.main === module) {
  main(process.argv.slice(2)).catch(err => {
    console.error(err)
    process.exit(1)
  })
}
