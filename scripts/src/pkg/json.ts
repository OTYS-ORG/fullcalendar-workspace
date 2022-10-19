import { join as joinPaths, relative as relativizePath } from 'path'
import { mkdir } from 'fs/promises'
import { analyzePkg } from '../utils/pkg-analysis.js'
import { readPkgJson, writePkgJson } from '../utils/pkg-json.js'
import { mapHash } from '../utils/lang.js'
import { ScriptContext } from '../utils/script-runner.js'

export default async function(this: ScriptContext, ...args: string[]) {
  const isDev = args.includes('--dev')
  const pkgDir = this.cwd
  const pkgJson = this.monorepoStruct.pkgDirToJson[pkgDir]

  await writeDistPkgJson(pkgDir, pkgJson, isDev)
}

export async function writeDistPkgJson(
  pkgDir: string,
  pkgJson: any,
  isDev = false,
): Promise<void> {
  const { buildConfig } = pkgJson

  if (buildConfig) {
    const pkgAnalysis = analyzePkg(pkgDir)
    const basePkgJson = await readPkgJson(pkgAnalysis.metaRootDir)
    const typesRoot = isDev ? './.tsout' : '.'

    const finalPkgJson = {
      ...basePkgJson,
      ...pkgJson,
      main: './index.cjs',
      module: './index.mjs',
      types: `${typesRoot}/index.d.ts`,
      exports: {
        './package.json': './package.json',
        ...mapHash(buildConfig.exports, (entryConfig, entryName) => {
          const entrySubpath = entryName === '.' ? './index' : entryName

          return {
            require: entrySubpath + '.cjs',
            import: entrySubpath + '.mjs',
            types: entrySubpath.replace(/^\./, typesRoot) + '.d.ts',
          }
        }),
      },
    }

    delete finalPkgJson.scripts
    delete finalPkgJson.devDependencies
    delete finalPkgJson.tsConfig
    delete finalPkgJson.buildConfig
    delete finalPkgJson.publishConfig
    delete finalPkgJson.private

    finalPkgJson.repository.directory = relativizePath(pkgAnalysis.metaRootDir, pkgDir)

    const distDir = joinPaths(pkgDir, 'dist')
    await mkdir(distDir, { recursive: true })
    await writePkgJson(distDir, finalPkgJson)
  }
}