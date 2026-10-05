import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const rootDir = dirname(fileURLToPath(import.meta.url))
const shouldBump =
  process.argv.some((arg) => arg === 'dev' || arg === 'build') &&
  !process.env.MYSQL_VISUALIZER_VERSION_BUMPED

if (shouldBump) {
  spawnSync(process.execPath, [join(rootDir, 'scripts/bump-version.mjs')], {
    stdio: 'inherit',
    cwd: rootDir
  })
  process.env.MYSQL_VISUALIZER_VERSION_BUMPED = '1'
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
