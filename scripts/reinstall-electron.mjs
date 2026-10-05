import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const electronDir = join(root, 'node_modules', 'electron')
const electronExe = join(electronDir, 'dist', 'electron.exe')

if (!existsSync(join(electronDir, 'install.js'))) {
  console.log('electron 未安装，跳过二进制下载')
  process.exit(0)
}

if (existsSync(electronExe)) {
  console.log('Electron 二进制已存在')
  process.exit(0)
}

const version = JSON.parse(readFileSync(join(electronDir, 'package.json'), 'utf8')).version
process.env.ELECTRON_MIRROR = process.env.ELECTRON_MIRROR || 'https://npmmirror.com/mirrors/electron/'
process.env.ELECTRON_CUSTOM_DIR = process.env.ELECTRON_CUSTOM_DIR || `v${version}`

console.log(`正在从国内镜像下载 Electron v${version}...`)
const result = spawnSync(process.execPath, [join(electronDir, 'install.js')], {
  stdio: 'inherit',
  cwd: root,
  env: process.env
})

process.exit(result.status ?? 1)
