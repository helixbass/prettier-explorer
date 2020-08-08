const path = require('path')

const {getCopyTargetDirectory} = require('./scripts/utils')

const DOC_BUILDER_NAMES = ['concat', 'indent', 'align', 'group']

const getFilename = (state) => state.file.opts.filename
const getRelativeFilename = (state) =>
  path.relative(getCopyTargetDirectory(), getFilename(state))

const modifyDocBuilderDefinitions = (functionDeclarationPath, state, t) => {
  if (!/doc-builders\.js$/.test(getRelativeFilename(state))) return

  const {
    node: {id},
  } = functionDeclarationPath

  if (id.type === 'Identifier' && DOC_BUILDER_NAMES.includes(id.name)) {
    const callingLocationIdentifier = t.identifier('callingLocation')
    functionDeclarationPath.pushContainer('params', callingLocationIdentifier)

    functionDeclarationPath.traverse({
      ReturnStatement: (returnStatementPath) => {
        returnStatementPath
          .get('argument')
          .pushContainer(
            'properties',
            t.objectProperty(
              callingLocationIdentifier,
              callingLocationIdentifier,
            ),
          )
      },
    })
  }
}

const getAstLocationObjectProperties = ({start, end, loc}, t) => [
  t.objectProperty(t.identifier('start'), t.numericLiteral(start)),
  t.objectProperty(t.identifier('end'), t.numericLiteral(end)),
  t.objectProperty(
    t.identifier('loc'),
    t.objectExpression([
      t.objectProperty(
        t.identifier('start'),
        t.objectExpression([
          t.objectProperty(
            t.identifier('line'),
            t.numericLiteral(loc.start.line),
          ),
          t.objectProperty(
            t.identifier('column'),
            t.numericLiteral(loc.start.column),
          ),
        ]),
      ),
      t.objectProperty(
        t.identifier('end'),
        t.objectExpression([
          t.objectProperty(
            t.identifier('line'),
            t.numericLiteral(loc.end.line),
          ),
          t.objectProperty(
            t.identifier('column'),
            t.numericLiteral(loc.end.column),
          ),
        ]),
      ),
    ]),
  ),
]

const modifyDocBuilderCalls = (callExpressionPath, state, t) => {
  const {
    node: {callee},
    node,
  } = callExpressionPath

  if (callee.type !== 'Identifier') return
  if (!DOC_BUILDER_NAMES.includes(callee.name)) return

  const callingLocationObject = t.objectExpression([
    t.objectProperty(
      t.identifier('filename'),
      t.stringLiteral(getRelativeFilename(state)),
    ),
    ...getAstLocationObjectProperties(node, t),
  ])
  callExpressionPath.pushContainer('arguments', callingLocationObject)
}

module.exports = ({types: t}) => ({
  name: 'transform-prettier',
  visitor: {
    FunctionDeclaration: (path, state) => {
      modifyDocBuilderDefinitions(path, state, t)
    },
    CallExpression: (path, state) => {
      modifyDocBuilderCalls(path, state, t)
    },
  },
})
