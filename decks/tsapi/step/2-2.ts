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
    }

    return (src) => {
      if (src.isDeclarationFile) return src
      return ts.visitEachChild(src, visitor, context)
    }
  }
}

export default defineTransformer