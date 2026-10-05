import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function readPkgVersion(modulePath, fallback) {
  const pkgFile = join(root, 'node_modules', modulePath, 'package.json')
  if (!existsSync(pkgFile)) return fallback
  return JSON.parse(readFileSync(pkgFile, 'utf8')).version
}

function installViaPack(pkgName, version, targetDir) {
  if (existsSync(targetDir)) return true

  const tmp = join(tmpdir(), `native-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  mkdirSync(tmp, { recursive: true })

  console.log(`解压安装原生模块: ${pkgName}@${version}`)
  const pack = spawnSync(
    npmCmd,
    ['pack', `${pkgName}@${version}`, '--pack-destination', tmp],
    { cwd: root, stdio: 'pipe', shell: true, encoding: 'utf8' }
  )

  if (pack.status !== 0) {
    console.warn(`警告: 无法下载 ${pkgName}@${version}`)
    rmSync(tmp, { recursive: true, force: true })
    return false
  }

  const tgzFiles = readdirSync(tmp).filter((name) => name.endsWith('.tgz'))
  if (tgzFiles.length === 0) {
    rmSync(tmp, { recursive: true, force: true })
    return false
  }

  mkdirSync(targetDir, { recursive: true })
  const tar = spawnSync('tar', ['-xf', join(tmp, tgzFiles[0]), '-C', targetDir, '--strip-components=1'], {
    cwd: root,
    stdio: 'inherit',
    shell: true
  })

  rmSync(tmp, { recursive: true, force: true })
  return tar.status === 0
}

function ensureWindowsNativePackages() {
  const esbuildVersion = readPkgVersion('esbuild', '0.25.12')
  const rollupVersion = readPkgVersion('rollup', '4.64.0')

  const packages = [
    {
      pkg: `@esbuild/win32-x64`,
      version: esbuildVersion,
      dir: join(root, 'node_modules', '@esbuild', 'win32-x64')
    },
    {
      pkg: `@esbuild/win32-ia32`,
      version: esbuildVersion,
      dir: join(root, 'node_modules', '@esbuild', 'win32-ia32')
    },
    {
      pkg: `@rollup/rollup-win32-x64-msvc`,
      version: rollupVersion,
      dir: join(root, 'node_modules', '@rollup', 'rollup-win32-x64-msvc')
    },
    {
      pkg: `@rollup/rollup-win32-ia32-msvc`,
      version: rollupVersion,
      dir: join(root, 'node_modules', '@rollup', 'rollup-win32-ia32-msvc')
    }
  ]

  for (const item of packages) {
    installViaPack(item.pkg, item.version, item.dir)
  }
}

if (process.platform === 'win32') {
  ensureWindowsNativePackages()
}

console.log('[fix-native-deps] 原生依赖检查完成')
