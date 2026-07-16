import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const imagesDir = path.join(__dirname, '../assets/images')

const NAVY_LOGO = path.join(__dirname, '../assets/brand/summus-logo-navy.png')

/** Fundo oficial da logo Summus Edge */
const BRAND_BG = '#04122C'
const BRAND_BG_RGBA = { r: 4, g: 18, b: 44, alpha: 1 }

/**
 * Extrai só o símbolo "S" (topo da arte), remove padding do navy
 * e centraliza em canvas quadrado com fundo da marca.
 */
async function buildCenteredSymbolIcon({
  size,
  paddingRatio,
  transparent = false,
}) {
  const meta = await sharp(NAVY_LOGO).metadata()
  const width = meta.width ?? 1024
  const height = meta.height ?? 1024

  // S fica na metade superior; evita capturar o wordmark "SUMMUS EDGE"
  const symbolRegionHeight = Math.round(height * 0.48)

  const cropped = await sharp(NAVY_LOGO)
    .extract({ left: 0, top: 0, width, height: symbolRegionHeight })
    .png()
    .toBuffer()

  // Remove faixa vazia do navy ao redor do S
  const trimmed = await sharp(cropped)
    .trim({ background: BRAND_BG, threshold: 14 })
    .png()
    .toBuffer()

  const padding = Math.round(size * paddingRatio)
  const inner = size - padding * 2

  const symbolResized = await sharp(trimmed)
    .resize(inner, inner, {
      fit: 'contain',
      background: transparent
        ? { r: 0, g: 0, b: 0, alpha: 0 }
        : BRAND_BG_RGBA,
    })
    .png()
    .toBuffer()

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: transparent
        ? { r: 0, g: 0, b: 0, alpha: 0 }
        : BRAND_BG_RGBA,
    },
  })
    .composite([{ input: symbolResized, gravity: 'centre' }])
    .png()
    .toBuffer()
}

async function generateAssets() {
  const iconSize = 1024
  // ~16% de padding: S grande e bem legível no centro
  const iconBuffer = await buildCenteredSymbolIcon({
    size: iconSize,
    paddingRatio: 0.16,
    transparent: false,
  })

  await sharp(iconBuffer).toFile(path.join(imagesDir, 'icon.png'))

  // Android adaptive: foreground transparente, S centralizado com safe zone
  const androidFg = await buildCenteredSymbolIcon({
    size: iconSize,
    paddingRatio: 0.22,
    transparent: true,
  })

  await sharp(androidFg).toFile(path.join(imagesDir, 'android-icon-foreground.png'))
  await sharp(androidFg).toFile(path.join(imagesDir, 'android-icon-monochrome.png'))

  await sharp({
    create: {
      width: iconSize,
      height: iconSize,
      channels: 4,
      background: BRAND_BG_RGBA,
    },
  })
    .png()
    .toFile(path.join(imagesDir, 'android-icon-background.png'))

  // Splash — logo completa centralizada
  const splashWidth = 900
  const splashLogo = await sharp(NAVY_LOGO)
    .resize(splashWidth, null, { fit: 'inside' })
    .png()
    .toBuffer()

  const splashMeta = await sharp(splashLogo).metadata()
  const splashH = splashMeta.height ?? 600

  await sharp({
    create: {
      width: splashWidth,
      height: splashH,
      channels: 4,
      background: BRAND_BG_RGBA,
    },
  })
    .composite([{ input: splashLogo, gravity: 'centre' }])
    .png()
    .toFile(path.join(imagesDir, 'splash-icon.png'))

  // Logo in-app (wordmark completo)
  await sharp(NAVY_LOGO)
    .resize(640, null, { fit: 'inside' })
    .png()
    .toFile(path.join(imagesDir, 'summus-logo.png'))

  // Ícone compacto in-app (só símbolo S, centrado)
  await sharp(iconBuffer)
    .resize(256, 256)
    .png()
    .toFile(path.join(imagesDir, 'summus-logo-icon.png'))

  // Favicon web
  await sharp(iconBuffer).resize(48, 48).png().toFile(path.join(imagesDir, 'favicon.png'))

  console.log('Brand assets generated successfully.')
  console.log(`Icon: S centrado em ${BRAND_BG}, 1024x1024`)
}

generateAssets().catch((error) => {
  console.error(error)
  process.exit(1)
})
