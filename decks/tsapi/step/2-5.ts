function defineTransformer (
  program: Program,
  config: DefineOptions
): TransformerFactory<SourceFile> {
  const defines = resolveDefines(config.defines ?? {})
  const defineKeys = Object.keys(defines)
  const typeChecker = program.getTypeChecker()
  return (context) => {
    const factory = context.factory

    const visitor: Visitor = (node) => {
      if (defineKeys.length === 0) return node

      // ignore import and export
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        return node
      }

      // let name = initializer, name = initializer
      if (ts.isVariableDeclaration(node) && node.initializer) {
        return factory.createVariableDeclaration(
          node.name,
          node.exclamationToken,
          node.type,
          ts.visitNode(node.initializer, visitor)
        )
      }
      // left = right
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      ) {
        return factory.createBinaryExpression(
          node.left,
          ts.SyntaxKind.EqualsToken,
          ts.visitNode(node.right, visitor)
        )
      }

      // { name: initializer, name: initializer }
      if (ts.isPropertyAssignment(node)) {
        return factory.createPropertyAssignment(
          node.name,
          ts.visitNode(node.initializer, visitor)
        )
      }

      // expression(...arguments)
      if (ts.isCallExpression(node)) {
        if (ts.isCallChain(node)) {
          return factory.createCallChain(
            tryApply(
              node.expression, typeChecker, defines, defineKeys,
              (check) => (
                check.result && typeof check.value === 'function'
                  ? toExpression(check.value, factory, true)!
                  : (check.stop ? node.expression : undefined)
              )
            ) ?? ts.visitNode(node.expression, visitor),
            node.questionDotToken,
            node.typeArguments,
            node.arguments.map(e => ts.visitNode(e, visitor))
          )
        }
        return factory.createCallExpression(
          tryApply(
            node.expression, typeChecker, defines, defineKeys,
            (check) => (
              check.result && typeof check.value === 'function'
                ? toExpression(check.value, factory, true)!
                : (check.stop ? node.expression : undefined)
            )
          ) ?? ts.visitNode(node.expression, visitor),
          node.typeArguments,
          node.arguments.map(e => ts.visitNode(e, visitor))
        )
      }

      // typeof (identifier)
      if (ts.isTypeOfExpression(node)) {
        return tryApply(
          node.expression, typeChecker, defines, defineKeys,
          (check) => (
            check.result
              ? toTypeof(check.value, factory, true)
              : (check.stop ? node.expression : undefined)
          )
        ) ?? ts.visitEachChild(node, visitor, context)
      }

      return tryApply(
        node, typeChecker, defines, defineKeys,
        (check) => (
          check.result
            ? toExpression(check.value, factory, true)
            : (check.stop ? node : undefined)
        )
      ) ?? ts.visitEachChild(node, visitor, context)
    }

    return (src) => {
      if (src.isDeclarationFile) return src
      return ts.visitEachChild(src, visitor, context)
    }
  }
}

export default defineTransformer