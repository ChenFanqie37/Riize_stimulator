import { spawn } from 'node:child_process'

const children = new Set()
let shuttingDown = false

function run(name, command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  })

  children.add(child)

  child.on('exit', (code, signal) => {
    children.delete(child)
    if (!shuttingDown) {
      shuttingDown = true
      for (const other of children) other.kill()
      if (signal) {
        process.kill(process.pid, signal)
      } else {
        process.exit(code ?? 0)
      }
    }
  })

  child.on('error', (error) => {
    console.error(`[dev] failed to start ${name}:`, error)
    process.exit(1)
  })

  return child
}

function shutdown() {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) child.kill()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

run('proxy', process.execPath, ['server/proxy.js'], {
  env: { ...process.env, NODE_ENV: 'development' },
})

run('vite', process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev:client'])
