import { join as joinPaths } from 'path'
import { readFile, writeFile } from 'fs/promises'

export interface SrcPkgMeta {
  buildConfig?: BuildConfig
  publishConfig?: {
    directory?: string
    linkDirectory?: boolean
  }
  [standardProps: string]: any
}

export interface BuildConfig {
  exports?: EntryConfigMap
  esm?: boolean
  cjs?: boolean
  types?: boolean
  min?: boolean
}

export type EntryConfigMap = { [entryId: string]: EntryConfig }

export interface EntryConfig {
  typesPath?: string
  generator?: string
  iife?: {
    name?: string
    globals?: { [pkgName: string]: string }
    generator?: string
  }
}

export default async function(...args: string[]) {
  const pkgDir = process.cwd()
  const isDev = args.indexOf('--dev') !== -1

  const srcMeta = await readSrcPkgMeta(pkgDir)

  // TODO: more DRY with meta's main
  if (
    srcMeta.buildConfig &&
    srcMeta.publishConfig?.linkDirectory
  ) {
    const distMeta = generateDistPkgMeta(srcMeta, isDev)
    await writeDistPkgMeta(pkgDir, distMeta)
  }
}

export function generateDistPkgMeta(srcMeta: SrcPkgMeta, isDev: boolean): any {
  const buildConfig: BuildConfig = srcMeta.buildConfig || {}
  const exportConfigs = buildConfig.exports || {}
  const defaultExportConfig = exportConfigs['.']

  if (!defaultExportConfig) {
    throw new Error('Must have default export')
  }

  const distMeta = { ...srcMeta }
  delete distMeta.scripts
  delete distMeta.devDependencies
  delete distMeta.buildConfig
  delete distMeta.publishConfig

  distMeta.main = 'index' + (
    (!isDev && (buildConfig.cjs ?? true)) ? '.cjs' :
    (buildConfig.esm ?? true) ? '.mjs' :
    (defaultExportConfig.iife) ? '.js' : '' // TODO: otherwise throw error
  )

  if (buildConfig.esm ?? true) {
    distMeta.module = 'index.mjs'
  }
  if (buildConfig.types ?? true) {
    distMeta.types = (isDev ? '.tsc/' : '') + 'index.d.ts'
  }
  if (defaultExportConfig.iife) {
    distMeta.jsdelivr = 'index.js'
  }

  const exportEntries: any = {
    './package.json': './package.json'
  }

  for (const exportPath in exportConfigs) {
    const exportConfig = exportConfigs[exportPath]

    if (
      !isDev ||
      exportPath === '.' ||
      exportConfig.typesPath
    ) {
      const entryFilePath = exportPath === '.' ? './index' : exportPath
      const exportEntry: any = {}

      if (buildConfig.cjs ?? true) {
        exportEntry.require = entryFilePath + '.cjs'
      }
      if (buildConfig.esm ?? true) {
        exportEntry.import = entryFilePath + '.mjs'
      }
      if (buildConfig.types ?? true) {
        let typesPath = (exportConfig.typesPath || entryFilePath) + '.d.ts'

        if (isDev) {
          typesPath = typesPath.replace(/^\.\//, './.tsc/')
        }

        exportEntry.types = typesPath
      }
      if (exportConfig.iife) {
        exportEntry.default = entryFilePath + '.js'
      }

      exportEntries[exportPath] = exportEntry
    }
  }

  if (isDev) {
    const genericEntry: any = {}

    if (buildConfig.cjs ?? true) {
      genericEntry.require = './*.cjs'
    }
    if (buildConfig.esm ?? true) {
      genericEntry.import = './*.mjs'
    }
    if (buildConfig.types ?? true) {
      genericEntry.types = './.tsc/*.d.ts'
    }

    exportEntries['./*'] = genericEntry
  }

  distMeta.exports = exportEntries

  return distMeta
}

export async function readSrcPkgMeta(pkgDir: string): Promise<SrcPkgMeta> {
  const jsonPath = joinPaths(pkgDir, 'package.json')
  const srcJson = await readFile(jsonPath, 'utf8')
  const srcMeta = JSON.parse(srcJson)
  return srcMeta
}

export async function writeDistPkgMeta(pkgDir: string, distMeta: any): Promise<void> {
  const jsonPath = joinPaths(pkgDir, 'dist', 'package.json')
  const distJson = JSON.stringify(distMeta, undefined, 2)
  await writeFile(jsonPath, distJson)
}
