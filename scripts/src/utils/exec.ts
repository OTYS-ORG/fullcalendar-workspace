import { promisify } from 'util'
import {
  exec as execCb,
  execFile as execFileCb,
  spawn,
  ChildProcess,
  ExecOptions,
  StdioOptions,
} from 'child_process'

const exec = promisify(execCb)
const execFile = promisify(execFileCb)

export function execCapture(
  command: string | string[],
  options: ExecOptions = {},
): Promise<string> {
  if (typeof command === 'string') {
    return exec(command, options)
      .then((res) => res.stdout)
  } else if (Array.isArray(command)) {
    return execFile(command[0], command.slice(1), options)
      .then((res) => res.stdout)
  } else {
    throw new Error('Invalid command type for execCapture()')
  }
}

export function execLive(
  command: string | string[],
  options: ExecOptions = {},
): Promise<void> {
  return execWithStdio(command, options, 'inherit')
}

export function execSilent(
  command: string | string[],
  options: ExecOptions = {},
): Promise<void> {
  return execWithStdio(command, options, 'ignore')
}

export function spawnLive(
  command: string | string[],
  options: ExecOptions = {},
): () => void {
  const child = spawnWithStdio(command, options, 'inherit')
  return () => child.disconnect()
}

export function spawnSilent(
  command: string | string[],
  options: ExecOptions = {},
): () => void {
  const child = spawnWithStdio(command, options, 'ignore')
  return () => child.disconnect()
}

function execWithStdio(
  command: string | string[],
  options: ExecOptions,
  stdio: StdioOptions,
): Promise<void> {
  const childProcess = spawnWithStdio(command, options, stdio)

  return new Promise((resolve, reject) => {
    childProcess.on('close', (exitCode) => {
      if (exitCode === 0) {
        resolve()
      } else {
        reject(new SpawnError(exitCode))
      }
    })
  })
}

function spawnWithStdio(
  command: string | string[],
  options: ExecOptions,
  stdio: StdioOptions,
): ChildProcess {
  let commandPath: string
  let commandArgs: string[]
  let shell: boolean

  if (typeof command === 'string') {
    commandPath = command
    commandArgs = []
    shell = true
  } else if (Array.isArray(command)) {
    commandPath = command[0]
    commandArgs = command.slice(1)
    shell = false
  } else {
    throw new Error('Invalid command type for execLive()')
  }

  return spawn(commandPath, commandArgs, {
    ...options,
    shell,
    stdio,
  })
}

export class SpawnError extends Error {
  constructor(
    public exitCode: number | null,
  ) {
    super(`Exited with error code ${exitCode}`)
  }
}
