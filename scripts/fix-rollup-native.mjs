import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const rollupDir = join(root, 'node_modules', 'rollup')

if (!existsSync(join(rollupDir, 'package.json'))) {
  process.exit(0)
}

const version = JSON.parse(readFileSync(join(rollupDir, 'package.json'), 'utf8')).version
const { platform, arch } = process

const targets = []
if (platform === 'win32') {
  if (arch === 'x64') targets.push('win32-x64-msvc', 'win32-x64-gnu')
  if (arch === 'ia32') targets.push('win32-ia32-msvc')
  if (arch === 'arm64') targets.push('win32-arm64-msvc')
}

for (const base of targets) {
  const pkgName = `@rollup/rollup-${base}`
  const pkgDir = join(root, 'node_modules', '@rollup', `rollup-${base}`)
  if (existsSync(pkgDir)) continue

  console.log(`补装 Rollup 原生模块: ${pkgName}@${version}`)
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const result = spawnSync(
    npmCmd,
    ['install', `${pkgName}@${version}`, '--no-save', '--force'],
    { cwd: root, stdio: 'inherit', shell: true }
  )
  if (result.status !== 0) {
    console.warn(`警告: ${pkgName} 安装失败`)
  }
}
