const path = require('path')

const getCopyTargetDirectory = () =>
  path.join(__dirname, '../prettier-tmp/copy')

const getTransformedTargetDirectory = () =>
  path.join(__dirname, '../prettier-tmp/transformed')

const getBabelPluginPath = () =>
  path.join(__dirname, './transform-prettier-plugin.js')

module.exports = {
  getCopyTargetDirectory,
  getTransformedTargetDirectory,
  getBabelPluginPath,
}
