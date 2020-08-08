const modifyDocBuilderDefinitions = (functionDeclarationPath, state, t) => {
  if (!/doc-builders\.js$/.test(state.file.opts.filename)) return

  const {
    node: {id},
  } = functionDeclarationPath

  if (id.type === 'Identifier' && id.name === 'concat') {
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

module.exports = ({types: t}) => ({
  name: 'transform-prettier',
  visitor: {
    FunctionDeclaration: (path, state) => {
      modifyDocBuilderDefinitions(path, state, t)
    },
  },
})
