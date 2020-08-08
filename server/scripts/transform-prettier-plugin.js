const path = require('path')

const {getCopyTargetDirectory} = require('./utils')

const DOC_BUILDER_NAMES = ['concat', 'indent', 'align', 'group']

const getFilename = (state) => state.file.opts.filename
const getRelativeFilename = (state) =>
  path.relative(getCopyTargetDirectory(), getFilename(state))

const isDocBuildersDefinitionFile = (state) =>
  /\/doc-builders\.js$/.test(getRelativeFilename(state))

const GLOBAL_AST_NODE_NAME = '_globalAstNode'

const getShorthandObjectProperty = (identifierNode, t) =>
  t.objectProperty(identifierNode, identifierNode, false, true)

const addGlobalAstNodeDefinition = (assignmentExpressionPath, state, t) => {
  if (!isDocBuildersDefinitionFile(state)) return

  const {
    node: {left},
  } = assignmentExpressionPath

  if (left.type !== 'MemberExpression') return
  if (left.object.type !== 'Identifier') return
  if (left.object.name !== 'module') return
  if (left.property.type !== 'Identifier') return
  if (left.property.name !== 'exports') return

  const globalAstNodeIdentifier = t.identifier(GLOBAL_AST_NODE_NAME)
  assignmentExpressionPath.parentPath.parentPath.unshiftContainer(
    'body',
    t.variableDeclaration('const', [
      t.variableDeclarator(
        globalAstNodeIdentifier,
        t.objectExpression([
          t.objectProperty(t.identifier('value'), t.nullLiteral()),
        ]),
      ),
    ]),
  )
  assignmentExpressionPath
    .get('right')
    .pushContainer(
      'properties',
      getShorthandObjectProperty(globalAstNodeIdentifier, t),
    )
}

const modifyPrintAstToDocDefinition = (functionDeclarationPath, state, t) => {
  if (!/\/ast-to-doc\.js$/.test(getRelativeFilename(state))) return

  const {
    node: {id},
  } = functionDeclarationPath

  if (!(id.type === 'Identifier' && id.name === 'printGenerically')) return

  const globalAstNodeIdentifier = t.identifier(GLOBAL_AST_NODE_NAME)

  functionDeclarationPath.insertBefore(
    t.variableDeclaration('const', [
      t.variableDeclarator(
        globalAstNodeIdentifier,
        t.memberExpression(
          t.callExpression(t.identifier('require'), [
            t.stringLiteral('../document/doc-builders'),
          ]),
          globalAstNodeIdentifier,
        ),
      ),
    ]),
  )
  const nodeAssignmentPath = functionDeclarationPath.get('body.body.0')
  const globalAstNodeValueMemberExpression = t.memberExpression(
    globalAstNodeIdentifier,
    t.identifier('value'),
  )
  const previousGlobalAstNodeIdentifier = t.identifier('previousGlobalAstNode')
  nodeAssignmentPath.insertAfter(
    t.variableDeclaration('const', [
      t.variableDeclarator(
        previousGlobalAstNodeIdentifier,
        globalAstNodeValueMemberExpression,
      ),
    ]),
  )
  nodeAssignmentPath.insertAfter(
    t.expressionStatement(
      t.assignmentExpression(
        '=',
        globalAstNodeValueMemberExpression,
        t.identifier('node'),
      ),
    ),
  )
  functionDeclarationPath.traverse({
    ReturnStatement: (returnStatementPath) => {
      returnStatementPath.insertBefore(
        t.expressionStatement(
          t.assignmentExpression(
            '=',
            globalAstNodeValueMemberExpression,
            previousGlobalAstNodeIdentifier,
          ),
        ),
      )
    },
  })
}

const modifyCoreFormatDefinition = (functionDeclarationPath, state, t) => {
  if (!/main\/core\.js$/.test(getRelativeFilename(state))) return

  const {
    node: {id},
  } = functionDeclarationPath

  if (!(id.type === 'Identifier' && id.name === 'coreFormat')) return

  const astIdentifier = t.identifier('ast')
  const docIdentifier = t.identifier('doc')
  functionDeclarationPath.traverse({
    ReturnStatement: (returnStatementPath) => {
      const returnedObjectPath = returnStatementPath.get('argument')
      const isTrivialEarlyReturn =
        returnedObjectPath.node.properties[0].value.type === 'StringLiteral'
      returnedObjectPath.pushContainer(
        'properties',
        isTrivialEarlyReturn
          ? t.objectProperty(astIdentifier, t.objectExpression([]))
          : getShorthandObjectProperty(astIdentifier, t),
      )
      returnedObjectPath.pushContainer(
        'properties',
        isTrivialEarlyReturn
          ? t.objectProperty(docIdentifier, t.objectExpression([]))
          : getShorthandObjectProperty(docIdentifier, t),
      )
    },
  })
}

const modifyDocBuilderDefinitions = (functionDeclarationPath, state, t) => {
  if (!isDocBuildersDefinitionFile(state)) return

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
            getShorthandObjectProperty(callingLocationIdentifier, t),
          )
        const globalAstNodeValueMemberExpression = t.memberExpression(
          t.identifier(GLOBAL_AST_NODE_NAME),
          t.identifier('value'),
        )
        returnStatementPath
          .get('argument')
          .pushContainer(
            'properties',
            t.objectProperty(
              t.identifier('sourceAstNode'),
              t.conditionalExpression(
                globalAstNodeValueMemberExpression,
                t.objectExpression([
                  t.objectProperty(
                    t.identifier('type'),
                    t.memberExpression(
                      globalAstNodeValueMemberExpression,
                      t.identifier('type'),
                    ),
                  ),
                  t.objectProperty(
                    t.identifier('start'),
                    t.memberExpression(
                      globalAstNodeValueMemberExpression,
                      t.identifier('start'),
                    ),
                  ),
                  t.objectProperty(
                    t.identifier('end'),
                    t.memberExpression(
                      globalAstNodeValueMemberExpression,
                      t.identifier('end'),
                    ),
                  ),
                  t.objectProperty(
                    t.identifier('loc'),
                    t.memberExpression(
                      globalAstNodeValueMemberExpression,
                      t.identifier('loc'),
                    ),
                  ),
                ]),
                t.nullLiteral(),
              ),
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
      modifyCoreFormatDefinition(path, state, t)
      modifyPrintAstToDocDefinition(path, state, t)
    },
    CallExpression: (path, state) => {
      modifyDocBuilderCalls(path, state, t)
    },
    AssignmentExpression: (path, state) => {
      addGlobalAstNodeDefinition(path, state, t)
    },
  },
})
