module.exports = (request, response, next) => {
  const unformattedSource = request.body.unformattedSource
  const prettier = require('../prettier-tmp/transformed')
  const ret = prettier.formatWithCursor(unformattedSource, {
    parser: 'babel',
  })
  response.json(ret)
}
