import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const versionPath = join(root, 'version.json')

export function bumpVersion() {
  const version = JSON.parse(readFileSync(versionPath, 'utf8'))
  version.build = Number(version.build ?? 0) + 1
  writeFileSync(versionPath, `${JSON.stringify(version, null, 2)}\n`, 'utf8')

  const versionLabel = `V${version.major}.${version.minor}.${version.build}`
  console.log(`[version] bumped to ${versionLabel}`)
  return versionLabel
}

const isCli = process.argv[1]?.endsWith('bump-version.mjs')
if (isCli) {
  bumpVersion()
}
