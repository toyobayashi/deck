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

    }
  }

  const parsedCommandLine = ts.getParsedCommandLineOfConfigFile(
    configFileName, undefined, parseConfigHost, undefined, undefined, undefined)!
  if (parsedCommandLine.errors.length) {

  }
  return parsedCommandLine
}

function compile (
  tsconfig: string
): void {
  const parsedCommandLine = parseTsConfigToCommandLine(tsconfig)
}