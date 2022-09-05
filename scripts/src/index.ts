import * as path from 'path'
import * as url from 'url'
import { run } from './utils/script'

const filePath = url.fileURLToPath(import.meta.url)
const dirPath = path.join(filePath, '..')

run({
  scriptDir: dirPath,
  bin: path.join(dirPath, '../bin/workspace-script'),
  binName: 'workspace-script',
})
