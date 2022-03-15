const path = require('path')

module.exports = {
  extends: 'standard-with-typescript',
  parserOptions: {
    project: path.join(__dirname, './tsconfig.json')
  }
}
