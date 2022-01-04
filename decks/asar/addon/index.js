// 禁止调试
for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i].startsWith('--inspect') ||
      process.argv[i].startsWith('--remote-debugging-port')) {
    throw new Error('Not allow debugging this program.')
  }
}

const { app, dialog } = require('electron')
const Module = require('module')

const moduleParent = module.parent;
if (module !== process.mainModule ||
  (moduleParent !== Module && moduleParent !== undefined && moduleParent !== null)
) {
  // 确保该原生模块是入口
  dialog.showErrorBox('Error', 'This program has been changed by others.')
  app.quit()
}

const oldCompile = Module.prototype._compile

Object.defineProperty(Module.prototype, '_compile', {
  enumerable: true,
  value: function (content, filename) {
    if (filename.indexOf('app.asar') !== -1) {
      return oldCompile.call(this,
        decrypt(Buffer.from(content, 'base64')), filename)
    }
    return oldCompile.call(this, content, filename)
  }
})

try {
  require('./originalEntry.js')
} catch (err) {
  dialog.showErrorBox('Error', err.stack)
  app.quit()
}