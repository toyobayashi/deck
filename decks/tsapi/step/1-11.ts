import {
  dirname,
  basename,
  resolve
} from 'path'
import * as ts from 'typescript'
import { createRequire } from 'module'

interface PluginConfig {
  transform: string
  import?: string
  type?: 'program' | 'config' | 'checker' | 'raw' | 'compilerOptions'
  after?: boolean
  afterDeclarations?: boolean
  [options: string]: any
}

function getTransformers (
  customTransformers: ts.CustomTransformers,
  tsconfig: string,
  compilerOptions: ts.CompilerOptions,
  program: ts.Program
): void {
  const _require = createRequire(resolve(tsconfig))
  if (Array.isArray(compilerOptions.plugins)) {
    const plugins = compilerOptions.plugins as any as Array<PluginConfig | string>
    for (let i = 0; i < plugins.length; ++i) {
      let plugin = plugins[i]
      if (typeof plugin === 'string') plugin = { transform: plugin }
      const { transform, type, after, afterDeclarations, ...config } = plugin
      delete config.import
      const mod = _require(transform)
      const target = plugin.import ? mod[plugin.import] : getDefault(mod)
      const timing = after ? 'after' : (afterDeclarations ? 'afterDeclarations' : 'before')
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      ;(customTransformers[timing] || (customTransformers[timing] = [])).push(
        getTransformer(target, type, config, compilerOptions, program)
      )
    }
  }
}

function getTransformer (
  target: any,
  type: string | undefined,
  config: Record<string, any>,
  compilerOptions: ts.CompilerOptions,
  program: ts.Program
): ts.TransformerFactory<any> | ts.CustomTransformerFactory {
  if (type === undefined || type === 'program') {
    return target(program, config)
  }
  if (type === 'config') {
    return target(config)
  }
  if (type === 'checker') {
    return target(program.getTypeChecker(), config)
  }
  if (type === 'raw') {
    return target
  }
  if (type === 'compilerOptions') {
    return target(compilerOptions, config)
  }
  throw new TypeError(`Unsupport plugin type: ${type}`)
}

function getDefault (mod: any): any {
  const esModuleDesc = Object.getOwnPropertyDescriptor(mod, '__esModule')
  if (
    esModuleDesc &&
    !esModuleDesc.enumerable &&
    !esModuleDesc.configurable &&
    !esModuleDesc.writable &&
    esModuleDesc.value === true
  ) {
    return mod.default
  }
  return mod
}

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

  host.afterProgramCreate = builderProgram => {
    const writeFileName = (s: string): void => ts.sys.write(s + ts.sys.newLine)
    const compilerOptions = builderProgram.getCompilerOptions()
    const newLine = (ts as any).getNewLineCharacter(
      compilerOptions,
      function () { return ts.sys.newLine }
    )
    ;(ts as any).emitFilesAndReportErrors(
      builderProgram,
      reportDiagnostic,
      writeFileName,
      function (errorCount: any) {
        return host.onWatchStatusChange?.(
          (ts as any).createCompilerDiagnostic(
            (ts as any).getWatchErrorSummaryDiagnosticMessage(errorCount),
            errorCount
          ),
          newLine,
          compilerOptions,
          errorCount
        )
      },
      undefined,
      undefined,
      !!compilerOptions.emitDeclarationOnly,
      undefined
    )
  }

  return ts.createWatchProgram(host)
}