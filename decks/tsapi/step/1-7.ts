import {
  dirname,
  basename
} from 'path'
import * as ts from 'typescript'

function parseTsConfigToCommandLine (
  tsconfig: string
): ts.ParsedCommandLine {
  const configFileName = ts.findConfigFile(
    dirname(tsconfig),
    ts.sys.fileExists,
    basename(tsconfig)
  )
  if (!configFileName) {
    throw new Error(`TSConfig not found: ${tsconfig}`)
  }

  const parseConfigHost = {
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    useCaseSensitiveFileNames: true,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    onUnRecoverableConfigFileDiagnostic: (diagnostic: ts.Diagnostic) => {
      reportDiagnostics([diagnostic])
      throw new TSError(
        typeof diagnostic.messageText === 'string'
          ? diagnostic.messageText
          : diagnostic.messageText.messageText,
        diagnostic.code
      )
    }
  }

  const parsedCommandLine = ts.getParsedCommandLineOfConfigFile(
    configFileName, undefined, parseConfigHost, undefined, undefined, undefined)!
  if (parsedCommandLine.errors.length) {
    reportDiagnostics(parsedCommandLine.errors)
    const messageText = typeof parsedCommandLine.errors[0].messageText === 'string'
      ? parsedCommandLine.errors[0].messageText
      : parsedCommandLine.errors[0].messageText.messageText
    throw new TSError(messageText, parsedCommandLine.errors[0].code)
  }
  return parsedCommandLine
}

class TSError extends Error {
  constructor (msg: string, public code: number) {
    super(msg)
  }
}

Object.defineProperty(TSError.prototype, 'name', {
  configurable: true,
  value: 'TSError'
})

function reportDiagnostics (diagnostics: ts.Diagnostic[]): void {
  if (diagnostics.length) {
    const host = {
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      getCanonicalFileName: (_: any) => _,
      getNewLine: () => ts.sys.newLine
    }
    console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, host))
  }
}

function compile (
  tsconfig: string
): void {
  const parsedCommandLine = parseTsConfigToCommandLine(tsconfig)

  const compilerHost = ts.createCompilerHost(parsedCommandLine.options)

  const program = ts.createProgram(
    parsedCommandLine.fileNames,
    parsedCommandLine.options, compilerHost
  )
  const emitResult = program.emit(undefined, undefined, undefined,
    !!parsedCommandLine.options.emitDeclarationOnly,
    undefined
  )

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)

  reportDiagnostics(allDiagnostics)

  if (emitResult.emitSkipped && !parsedCommandLine.options.noEmit) {
    throw new Error('TypeScript compile failed.')
  }
}

function watch (
  tsconfig: string
): ts.WatchOfConfigFile<ts.SemanticDiagnosticsBuilderProgram> {
  const configPath = ts.findConfigFile(
    dirname(tsconfig),
    ts.sys.fileExists,
    basename(tsconfig)
  )

  if (!configPath) {
    throw new Error(`TSConfig not found: ${tsconfig}`)
  }

  function reportDiagnostic (diagnostic: ts.Diagnostic): void {
    reportDiagnostics([diagnostic])
  }

  const host = ts.createWatchCompilerHost(
    configPath,
    undefined,
    ts.sys,
    ts.createSemanticDiagnosticsBuilderProgram,
    reportDiagnostic,
    reportDiagnostic
  )
}