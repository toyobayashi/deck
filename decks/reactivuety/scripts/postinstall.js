const { readFileSync, readdirSync, writeFileSync } = require('fs')
const { join } = require('path')
const runtime = require.resolve('@vue/runtime-core')
const runtimeDist = join(runtime, '../dist')
const files = (readdirSync(runtimeDist)).filter(file => file.endsWith('.js'))
const exp = ['setCurrentInstance', 'unsetCurrentInstance', 'currentInstance', 'createHook', 'queuePreFlushCb']
const getExports = isEsm => exp.map(e => isEsm ? `export { ${e} };` : `exports.${e} = ${e};`).join('\n')
for (const file of files) {
  let content = readFileSync(join(runtimeDist, file), 'utf8')
  if (content.match(/export.*setCurrentInstance/)) {
    continue
  }
  content += `\n${getExports(file.includes('esm'))}`
  writeFileSync(join(runtimeDist, file), content, 'utf8')
}
