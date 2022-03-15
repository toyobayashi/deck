const path = require('path')

module.exports = {
  extends: [
    'plugin:vue/vue3-recommended',
    // 'plugin:vue/recommended', // Vue 2
    'standard-with-typescript'
  ],
  parserOptions: {
    project: path.join(__dirname, './tsconfig.json')
  }
}
