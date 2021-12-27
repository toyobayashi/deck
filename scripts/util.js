const path = require('path')
const fs = require('fs-extra')
const childProcess = require('child_process')

const DECKS_DIR = getPath('decks')

function getPath (...args) {
  if (args.length && path.isAbsolute(args[0])) {
    return path.join(...args)
  }
  return path.join(__dirname, '..', ...args)
}

function spawn (command, args, cwd = getPath()) {
  const cp = childProcess.spawn(command, args, {
    env: process.env,
    cwd,
    stdio: 'inherit'
  })
  return new Promise((resolve, reject) => {
    cp.once('exit', (code, reason) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Child process exit: ${code}. Reason: ${reason}\n\n${command} ${args.join(' ')}\n`))
      }
    })
  })
}

function npm (args, cwd = getPath()) {
  return spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, cwd)
}

function npmRunLocalBin (bin, args, cwd = getPath()) {
  return spawn(getPath(`node_modules/.bin/${process.platform === 'win32' ? bin + '.cmd' : bin}`), args, cwd)
}

async function gatsby (prefix, deck, filename, ...args) {
  const mdxDeckDir = path.dirname(require.resolve('mdx-deck'))
  const node = process.platform === 'win32' ? 'node.exe' : 'node'
  const bin = getPath('./scripts/gatsby.js')
  await spawn(node, [bin, prefix, deck, filename, 'clean'], mdxDeckDir)
  await spawn(node, [bin, prefix, deck, filename, ...args.filter(Boolean)], mdxDeckDir)
  // await npmRunLocalBin('gatsby', ['clean'], mdxDeckDir)
  // await npmRunLocalBin('gatsby', args.filter(Boolean), mdxDeckDir)
}

function getMain (deck) {
  const dir = getPath(DECKS_DIR, deck)
  let main
  try {
    main = require.resolve(dir)
  } catch {
    main = getPath(dir, 'index.mdx')
  }
  if (!fs.existsSync(main)) {
    throw new Error('No entry found')
  }
  return main
}

async function gatsbyDev (deck, opts) {
  const main = getMain(deck)
  await gatsby(
    opts.prefix || '',
    deck,
    main,
    'develop',
    '--host',
    opts.host || '127.0.0.1',
    '--port',
    opts.port || 8000,
    opts.open && '--open'
  )
}

async function gatsbyBuild (deck, opts) {
  const mdxDeckDir = path.dirname(require.resolve('mdx-deck'))
  const main = getMain(deck)
  await gatsby(
    opts.prefix || '',
    deck,
    main,
    'build',
    ...(opts.prefixPaths ? ['--prefix-paths'] : [])
  ).then(() => {
    const public = path.join(mdxDeckDir, 'public')
    const dist = getPath(DECKS_DIR, deck, 'public')
    if (public === dist) return
    fs.copySync(public, dist)
  })
}

exports.DECKS_DIR = DECKS_DIR
exports.getPath = getPath
exports.spawn = spawn
exports.npm = npm
exports.gatsbyDev = gatsbyDev
exports.gatsbyBuild = gatsbyBuild
