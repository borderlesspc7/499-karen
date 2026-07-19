import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const imagesDir = path.join(__dirname, '../assets/images')

const NAVY_LOGO = path.join(__dirname, '../assets/brand/summus-logo-navy.png')

/** Fundo oficial da marca — cor única do ícone */
const BRAND_BG = '#04122C'
const BRAND_BG_RGBA = { r: 4, g: 18, b: 44, alpha: 1 }
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 }

/**
 * Isola o símbolo (ouro) do fundo navy da arte por luminância.
 * O navy da arte tem gradiente/vinheta, então recortar por cor deixa
 * uma "caixa" visível. Aqui geramos um alpha por brilho: ouro → opaco,
 * navy → transparente. Assim o S pode ser composto sobre qualquer navy
 * sólido sem retângulo.
 */
async function keySymbol(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height, channels } = info
  const alpha = Buffer.alloc(width * height)

  // rampa de luminância: navy (~17) → transparente, ouro (>=85) → opaco
  const LOW = 30
  const HIGH = 85
  const span = HIGH - LOW

  for (let p = 0, a = 0; a < alpha.length; p += channels, a++) {
    const lum = 0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]
    let v = Math.round(((lum - LOW) * 255) / span)
    if (v < 0) v = 0
    else if (v > 255) v = 255
    alpha[a] = v
  }

  const keyed = await sharp(data, { raw: { width, height, channels } })
    .joinChannel(alpha, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer()

  // remove sobras totalmente transparentes ao redor do símbolo
  return sharp(keyed).trim({ threshold: 1 }).png().toBuffer()
}

/** Recolore um símbolo com alpha para branco sólido (ícone monocromático). */
async function tintWhite(keyedBuffer) {
  const { data: alphaData, info } = await sharp(keyedBuffer)
    .ensureAlpha()
    .extractChannel(3)
    .raw()
    .toBuffer({ resolveWithObject: true })

  return sharp({
    create: { width: info.width, height: info.height, channels: 3, background: '#FFFFFF' },
  })
    .joinChannel(alphaData, {
      raw: { width: info.width, height: info.height, channels: 1 },
    })
    .png()
    .toBuffer()
}

/** Centraliza um símbolo em um canvas quadrado com padding e fundo definidos. */
async function composeSquare({ size, paddingRatio, background, symbol }) {
  const inner = size - Math.round(size * paddingRatio) * 2

  const resized = await sharp(symbol)
    .resize(inner, inner, { fit: 'contain', background: TRANSPARENT })
    .png()
    .toBuffer()

  return sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: resized, gravity: 'centre' }])
    .png()
    .toBuffer()
}

async function generateAssets() {
  const meta = await sharp(NAVY_LOGO).metadata()
  const width = meta.width ?? 1024
  const height = meta.height ?? 1024

  // Símbolo "S" fica na metade superior; evita capturar o wordmark
  const symbolRegionHeight = Math.round(height * 0.48)
  const symbolRegion = await sharp(NAVY_LOGO)
    .extract({ left: 0, top: 0, width, height: symbolRegionHeight })
    .png()
    .toBuffer()

  const symbol = await keySymbol(symbolRegion)
  const symbolWhite = await tintWhite(symbol)
  const fullLogo = await keySymbol(await sharp(NAVY_LOGO).png().toBuffer())

  const size = 1024

  // Ícone principal — navy sólido + S centralizado
  const icon = await composeSquare({
    size,
    paddingRatio: 0.16,
    background: BRAND_BG_RGBA,
    symbol,
  })
  await sharp(icon).toFile(path.join(imagesDir, 'icon.png'))

  // Android adaptive foreground — S limpo, sem caixa, com safe zone
  const foreground = await composeSquare({
    size,
    paddingRatio: 0.24,
    background: TRANSPARENT,
    symbol,
  })
  await sharp(foreground).toFile(path.join(imagesDir, 'android-icon-foreground.png'))

  const monochrome = await composeSquare({
    size,
    paddingRatio: 0.24,
    background: TRANSPARENT,
    symbol: symbolWhite,
  })
  await sharp(monochrome).toFile(path.join(imagesDir, 'android-icon-monochrome.png'))

  // Android adaptive background — cor única da marca
  await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_BG_RGBA },
  })
    .png()
    .toFile(path.join(imagesDir, 'android-icon-background.png'))

  // Splash — logo completa sobre navy sólido (sem caixa)
  const splash = await composeSquare({
    size,
    paddingRatio: 0.18,
    background: BRAND_BG_RGBA,
    symbol: fullLogo,
  })
  await sharp(splash).toFile(path.join(imagesDir, 'splash-icon.png'))

  // Ícone compacto in-app (S sobre navy sólido)
  await sharp(icon).resize(256, 256).png().toFile(path.join(imagesDir, 'summus-logo-icon.png'))

  // Wordmark in-app — logo completa transparente (adapta a telas escuras)
  const wordmark = await composeSquare({
    size,
    paddingRatio: 0.06,
    background: TRANSPARENT,
    symbol: fullLogo,
  })
  await sharp(wordmark).toFile(path.join(imagesDir, 'summus-logo.png'))

  // Favicon web
  await sharp(icon).resize(48, 48).png().toFile(path.join(imagesDir, 'favicon.png'))

  console.log('Brand assets gerados com sucesso.')
  console.log(`Ícone: S sobre ${BRAND_BG} (cor única), 1024x1024`)
}

generateAssets().catch((error) => {
  console.error(error)
  process.exit(1)
})
