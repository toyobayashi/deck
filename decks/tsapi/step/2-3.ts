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
    }

    return (src) => {
      if (src.isDeclarationFile) return src
      return ts.visitEachChild(src, visitor, context)
    }
  }
}

export default defineTransformer