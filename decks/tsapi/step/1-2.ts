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
}

function compile (
  tsconfig: string
): void {
  const parsedCommandLine = parseTsConfigToCommandLine(tsconfig)
}