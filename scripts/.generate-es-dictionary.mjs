import fs from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url))
const rootDirectory = path.resolve(scriptsDirectory, '..')
const sourcePath = path.join(rootDirectory, 'shared/i18n/dictionaries/pt-BR.ts')
const outputPath = path.join(rootDirectory, 'shared/i18n/dictionaries/es-ES.ts')

const source = await fs.readFile(sourcePath, 'utf8')
const executableSource = source
  .replace('export const ptBR =', 'globalThis.ptBR =')
  .replace(/}\s+as const\s*$/, '}')
const context = {}
vm.runInNewContext(executableSource, context)

const protectedTerms = [
  'Summus',
  'Meridian',
  'Inbox',
  'Firestore',
  'Firebase',
  'Meta Ads',
  'LinkedIn',
  'Instagram',
  'Facebook',
  'WhatsApp',
  'Stripe',
  'Google Cloud',
  'Expo',
  'EAS Build',
]

function protectText(text) {
  const replacements = []
  const patterns = [/\{\{\w+\}\}/g, ...protectedTerms.map((term) => new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))]
  const protectedText = patterns.reduce(
    (result, pattern) =>
      result.replace(pattern, (match) => {
        const token = `ZXQ${replacements.length}QXZ`
        replacements.push([token, match])
        return token
      }),
    text,
  )

  return { protectedText, replacements }
}

function restoreText(text, replacements) {
  return replacements.reduce(
    (result, [token, value]) =>
      result.replace(new RegExp(token.replace(/\s+/g, '\\s*'), 'gi'), value),
    text,
  )
}

async function translateText(text, attempt = 0) {
  const { protectedText, replacements } = protectText(text)
  const endpoint = new URL('https://translate.googleapis.com/translate_a/single')
  endpoint.searchParams.set('client', 'gtx')
  endpoint.searchParams.set('sl', 'pt')
  endpoint.searchParams.set('tl', 'es')
  endpoint.searchParams.set('dt', 't')
  endpoint.searchParams.set('q', protectedText)

  try {
    const response = await fetch(endpoint)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const payload = await response.json()
    const translated = payload[0].map(([chunk]) => chunk).join('')
    const restored = restoreText(translated, replacements)

    if (restored.includes('ZXQ')) {
      throw new Error(`Unrestored placeholder in: ${text}`)
    }

    return restored
  } catch (error) {
    if (attempt >= 4) throw error
    await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt))
    return translateText(text, attempt + 1)
  }
}

const entries = Object.entries(context.ptBR).flatMap(([section, values]) =>
  Object.entries(values).map(([key, value]) => ({ section, key, value })),
)
const translations = new Array(entries.length)
let cursor = 0

async function worker() {
  while (cursor < entries.length) {
    const index = cursor
    cursor += 1
    translations[index] = await translateText(entries[index].value)
  }
}

await Promise.all(Array.from({ length: 8 }, () => worker()))

const manualOverrides = {
  'language.description': 'Elige el idioma de la interfaz. Puedes cambiarlo cuando quieras.',
  'language.portuguese': 'Português',
  'language.english': 'English',
  'language.spanish': 'Español',
}

function escape(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')
}

const lines = ['export const esES = {']
let currentSection

for (const [index, entry] of entries.entries()) {
  if (entry.section !== currentSection) {
    if (currentSection) lines.push('  },')
    currentSection = entry.section
    lines.push(`  ${currentSection}: {`)
  }

  const translated = manualOverrides[`${entry.section}.${entry.key}`] ?? translations[index]
  lines.push(`    ${entry.key}: '${escape(translated)}',`)
}

lines.push('  },', '} as const', '')
await fs.writeFile(outputPath, lines.join('\n'))
console.log(`Wrote ${entries.length} Spanish translations`)
