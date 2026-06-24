/**
 * Usage: node scripts/apply-coords.mjs scripts/coords.json
 *
 * coords.json shape:
 * {
 *   "boss-id": { "mapX": 48.2, "mapY": 47.1 },
 *   ...
 * }
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const coordsPath = resolve(process.argv[2] ?? 'scripts/coords.json')
const bossesPath = resolve('src/data/bosses.ts')

const coords = JSON.parse(readFileSync(coordsPath, 'utf8'))
let src = readFileSync(bossesPath, 'utf8')

let updated = 0
let missing = []

for (const [id, { mapX, mapY }] of Object.entries(coords)) {
  // Match the id line, then find the next mapX / mapY pair and replace them
  const pattern = new RegExp(
    `(id:\\s*'${id}'[\\s\\S]*?mapX:\\s*)([\\d.]+)(,[\\s\\n]+mapY:\\s*)([\\d.]+)`,
  )
  if (!pattern.test(src)) {
    missing.push(id)
    continue
  }
  src = src.replace(pattern, `$1${mapX}$3${mapY}`)
  updated++
}

writeFileSync(bossesPath, src, 'utf8')

console.log(`✓ Updated ${updated} bosses.`)
if (missing.length) {
  console.warn(`⚠ Not found in bosses.ts: ${missing.join(', ')}`)
}
