import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const imagesDir = path.join(__dirname, '../assets/images')

const NAVY_LOGO = path.join(__dirname, '../assets/brand/summus-logo-navy.png')

const BRAND_BG = '#04122C'

async function generateAssets() {
  const meta = await sharp(NAVY_LOGO).metadata()
  const width = meta.width ?? 1024
  const height = meta.height ?? 1024

  // Crop apenas o símbolo "S" (parte superior ~46% da arte)
  const iconCropHeight = Math.round(height * 0.46)
  const iconSymbol = sharp(NAVY_LOGO).extract({
    left: 0,
    top: 0,
    width,
    height: iconCropHeight,
  })

  const iconSize = 1024
  const iconPadding = Math.round(iconSize * 0.14)
  const iconInner = iconSize - iconPadding * 2

  const iconBuffer = await iconSymbol
    .resize(iconInner, iconInner, { fit: 'contain', background: BRAND_BG })
    .extend({
      top: iconPadding,
      bottom: iconPadding,
      left: iconPadding,
      right: iconPadding,
      background: BRAND_BG,
    })
    .png()
    .toBuffer()

  await sharp(iconBuffer).toFile(path.join(imagesDir, 'icon.png'))

  // Android adaptive foreground (mesmo símbolo, fundo transparente via flatten depois no bg)
  const androidFg = await iconSymbol
    .resize(820, 820, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 102,
      bottom: 102,
      left: 102,
      right: 102,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()

  await sharp(androidFg).toFile(path.join(imagesDir, 'android-icon-foreground.png'))
  await sharp(androidFg).toFile(path.join(imagesDir, 'android-icon-monochrome.png'))

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
      background: BRAND_BG,
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

  // Ícone compacto in-app (só símbolo S)
  await sharp(iconBuffer)
    .resize(256, 256)
    .png()
    .toFile(path.join(imagesDir, 'summus-logo-icon.png'))

  // Favicon web
  await sharp(iconBuffer).resize(48, 48).png().toFile(path.join(imagesDir, 'favicon.png'))

  console.log('Brand assets generated successfully.')
}

generateAssets().catch((error) => {
  console.error(error)
  process.exit(1)
})
