const path = require('path')

module.exports = {
  extends: [
    'plugin:react/recommended',
    'standard-with-typescript'
  ],
  parserOptions: {
    project: path.join(__dirname, './tsconfig.json')
  }
}
