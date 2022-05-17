function defineTransformer (
  program: Program,
  config: DefineOptions
): TransformerFactory<SourceFile> {
  return (context) => {
    const visitor: Visitor = (node) => {

    }

    return (src) => {
      if (src.isDeclarationFile) return src
      return ts.visitEachChild(src, visitor, context)
    }
  }
}

export default defineTransformer