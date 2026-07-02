/** Tokens visuais premium — alinhados ao design SUMMUS EDGE */
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
