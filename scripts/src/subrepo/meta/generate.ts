import * as path from 'path'
import { copyFile, writeFile } from 'fs/promises'
import { spawnParallel } from '../../utils/script'
import { getSubrepoDir, metaFileInfo, parseSubrepoArgs, rootDir } from '../../utils/subrepo'

export default async function(...rawArgs: string[]): Promise<void> {
  const { subrepos, flagArgs } = await parseSubrepoArgs(rawArgs)

  return spawnParallel('.:each', subrepos, flagArgs)
}

export function each(subrepo: string): Promise<void> {
  const subrepoDir = getSubrepoDir(subrepo)

  return Promise.all(
    metaFileInfo.map(async (fileInfo) => {
      if (fileInfo.generator) {
        const contents = await fileInfo.generator(subrepo)

        if (typeof contents === 'string') {
          await writeFile(
            path.join(subrepoDir, fileInfo.path),
            contents,
          )
        }
      } else {
        await copyFile(
          path.join(rootDir, fileInfo.path),
          path.join(subrepoDir, fileInfo.path),
        )
      }
    })
  ).then()
}
