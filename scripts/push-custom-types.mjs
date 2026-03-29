/**
 * Push les custom types vers Prismic via la Custom Types API
 *
 * Usage : PRISMIC_WRITE_TOKEN=xxx node scripts/push-custom-types.mjs
 */

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const TOKEN = process.env.PRISMIC_WRITE_TOKEN
const REPO = 'prado-nuxt'

if (!TOKEN) {
  console.error('PRISMIC_WRITE_TOKEN is required')
  process.exit(1)
}

const API_BASE = 'https://customtypes.prismic.io/customtypes'

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  repository: REPO,
  'Content-Type': 'application/json',
}

async function getExistingTypes() {
  const res = await fetch(API_BASE, { headers })
  if (!res.ok) throw new Error(`Failed to list types: ${res.status}`)
  return await res.json()
}

async function createType(definition) {
  const res = await fetch(API_BASE + '/insert', {
    method: 'POST',
    headers,
    body: JSON.stringify(definition),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to create ${definition.id}: ${res.status} ${text}`)
  }
  console.log(`  Created: ${definition.id}`)
}

async function updateType(definition) {
  const res = await fetch(API_BASE + '/update', {
    method: 'POST',
    headers,
    body: JSON.stringify(definition),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to update ${definition.id}: ${res.status} ${text}`)
  }
  console.log(`  Updated: ${definition.id}`)
}

async function main() {
  const customtypesDir = join(import.meta.dirname, '..', 'customtypes')
  const dirs = readdirSync(customtypesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  console.log(`Found ${dirs.length} custom types: ${dirs.join(', ')}\n`)

  const existing = await getExistingTypes()
  const existingIds = new Set(existing.map(t => t.id))

  for (const dir of dirs) {
    const filePath = join(customtypesDir, dir, 'index.json')
    const definition = JSON.parse(readFileSync(filePath, 'utf-8'))

    if (existingIds.has(definition.id)) {
      await updateType(definition)
    } else {
      await createType(definition)
    }
  }

  console.log('\nDone! All custom types are synced with Prismic.')
}

main().catch(err => {
  console.error('Push failed:', err)
  process.exit(1)
})
