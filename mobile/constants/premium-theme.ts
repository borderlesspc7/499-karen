/** Tokens visuais premium — alinhados ao design SUMMUS EDGE (Linear / Stripe style) */
export const premiumColors = {
  navy: '#0A1128',
  navyLight: '#131F35',
  gold: '#C5A059',
  goldMuted: 'rgba(197, 160, 89, 0.15)',
  surface: '#F8F9FB',
  surfaceAlt: '#F3F6FA',
  border: '#EDEDED',
  borderSubtle: 'rgba(237, 237, 237, 0.7)',
  textPrimary: '#0A1128',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  emerald: '#10B981',
  forest: '#1B4332',
  glassLight: 'rgba(255, 255, 255, 0.80)',
  glassDark: 'rgba(255, 255, 255, 0.05)',
} as const

/** Espaçamento generoso — estilo Linear / Apple */
export const premiumSpacing = {
  screenX: 20,
  screenXDesktop: 32,
  sectionGap: 32,
  cardGap: 16,
  cardPadding: 24,
  heroPadding: 28,
} as const

/** Hierarquia tipográfica Revenue First */
export const premiumTypography = {
  hero: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const },
  heroMetric: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  metric: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const, letterSpacing: 1.2 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
} as const

/** Superfícies glass para cards premium */
export const premiumGlass = {
  light: {
    backgroundColor: premiumColors.glassLight,
    borderColor: 'rgba(237, 237, 237, 0.6)',
  },
  dark: {
    backgroundColor: premiumColors.glassDark,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
} as const

export const premiumShadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#0A1128',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  gold: {
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  navy: {
    shadowColor: '#0A1128',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 5,
  },
} as const
