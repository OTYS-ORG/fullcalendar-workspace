import { writeDistPkgJsons } from './json.js'
import { writeDistLicense, writeDistReadme } from './pkg/build.js'
import { watchBundles } from './pkg/bundle.js'
import {
  MonorepoStruct,
  PkgStruct,
  traverseMonorepo,
  watchMonorepo,
} from './utils/monorepo-struct.js'
import { watchTs, writeTsconfigs } from './utils/monorepo-ts.js'
import { analyzePkg } from './utils/pkg-analysis.js'
import { untilSigInt } from './utils/process.js'
import { ScriptContext } from './utils/script-runner.js'

export default async function(this: ScriptContext) {
  const monorepoDir = this.cwd
  const initialMonorepoStruct = this.monorepoStruct

  async function handleMonorepo(monorepoStruct: MonorepoStruct) {
    await writeTsconfigs(monorepoStruct)
    await writeDistPkgJsons(monorepoStruct, true) // isDev=true

    // tsc needs tsconfig.json and package.json from above
    const stopTs = await watchTs(monorepoDir, ['--pretty', '--preserveWatchOutput'])

    const stopPkgs = await traverseMonorepo(monorepoStruct, async (pkgStruct: PkgStruct) => {
      const { pkgDir, pkgJson } = pkgStruct

      // consider this pkg buildable if has buildConfig
      if (pkgJson.buildConfig) {
        const pkgAnalysis = analyzePkg(pkgDir)

        const [stopBundles] = await Promise.all([
          watchBundles({ pkgJson, ...pkgAnalysis, isDev: true }),
          writeDistReadme(pkgDir),
          writeDistLicense(pkgAnalysis),
        ])

        return stopBundles
      }
    })

    return () => { // a "stop" function
      stopTs()
      stopPkgs()
    }
  }

  const stopMonorepo = await watchMonorepo(
    monorepoDir,
    handleMonorepo,
    initialMonorepoStruct,
  )

  await untilSigInt()
  stopMonorepo()
}
