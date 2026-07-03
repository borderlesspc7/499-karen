import { useMemo } from 'react'
import { useTheme } from '@shared/contexts'
import { premiumColors, premiumShadows } from '@/constants/premium-theme'

export function useThemeClasses() {
  const { isDark } = useTheme()

  return useMemo(
    () => ({
      isDark,
      screen: isDark ? 'bg-navy' : 'bg-surface',
      shell: isDark ? 'bg-navy' : 'bg-surface',
      textPrimary: isDark ? 'text-white' : 'text-navy',
      textSecondary: isDark ? 'text-white/60' : 'text-slate-500',
      textMuted: isDark ? 'text-white/45' : 'text-slate-400',
      textSubtle: isDark ? 'text-white/50' : 'text-slate-500',
      textLabel: isDark ? 'text-white/70' : 'text-slate-600',
      textSection: isDark ? 'text-white/40' : 'text-slate-400',
      textOnAccent: 'text-white',
      card: isDark
        ? 'rounded-card border border-white/10 bg-white/5'
        : 'rounded-card border border-premiumBorder bg-white',
      cardLg: isDark
        ? 'rounded-3xl border border-white/10 bg-white/5'
        : 'rounded-card border border-premiumBorder bg-white',
      cardSm: isDark
        ? 'rounded-2xl border border-white/10 bg-white/5'
        : 'rounded-card border border-premiumBorder bg-white',
      panel: isDark
        ? 'bg-summus-900 border-white/10'
        : 'bg-white border-slate-200',
      chatBg: isDark ? 'bg-navy' : 'bg-[#ECEFF3]',
      toolbar: isDark
        ? 'border-white/10 bg-summus-900'
        : 'border-slate-200 bg-white',
      surfaceMuted: isDark ? 'bg-white/5' : 'bg-slate-50',
      surfaceInset: isDark ? 'bg-white/5 border-white/10' : 'bg-surface border-premiumBorder/60',
      listItem: isDark ? 'border-white/5 bg-transparent' : 'border-slate-50 bg-white',
      listItemActive: isDark ? 'bg-electricBlue/10' : 'bg-electricBlue/5',
      listItemPressed: isDark ? 'active:bg-white/5' : 'active:bg-slate-50',
      filterActive: isDark ? 'bg-gold/20 border border-gold/30' : 'bg-navy',
      filterInactive: isDark
        ? 'border border-white/10 bg-white/5'
        : 'border border-slate-200 bg-white',
      filterActiveText: isDark ? 'text-gold' : 'text-white',
      filterInactiveText: isDark ? 'text-white/70' : 'text-slate-600',
      filterBadgeActive: isDark ? 'bg-gold/20' : 'bg-white/20',
      filterBadgeInactive: isDark ? 'bg-white/10' : 'bg-slate-100',
      emptyState: isDark
        ? 'border border-dashed border-white/15 bg-white/5'
        : 'border border-dashed border-slate-200 bg-white',
      progressTrack: isDark ? 'bg-white/10' : 'bg-slate-100',
      incomingBubble: isDark
        ? 'border border-white/10 bg-white/10'
        : 'border border-slate-200 bg-white',
      iconButton: isDark
        ? 'border border-white/10 bg-white/5 active:bg-white/10'
        : 'border border-slate-200 bg-slate-50 active:bg-slate-100',
      highlightBox: isDark
        ? 'rounded-card border border-gold/15 bg-gold/10'
        : 'rounded-card border border-gold/15 bg-gold/5',
      divider: isDark ? 'border-b border-white/10' : 'border-b border-premiumBorder',
      footerBar: isDark
        ? 'border-t border-white/10 bg-navy/95'
        : 'border-t border-premiumBorder bg-white/95',
      tabInactive: isDark
        ? 'border border-white/10 bg-white/5'
        : 'border border-premiumBorder bg-white',
      tabInactiveText: isDark ? 'text-white/60' : 'text-slate-500',
      input: isDark
        ? 'rounded-2xl border border-white/10 bg-navy/60 px-4 py-4 text-base leading-6 text-white'
        : 'rounded-card border border-premiumBorder bg-white px-4 py-4 text-base leading-6 text-navy',
      inputInline: isDark
        ? 'rounded-2xl border border-white/10 bg-white/5 px-4'
        : 'rounded-2xl border border-slate-200 bg-slate-50 px-4',
      outlineButton: isDark
        ? 'rounded-2xl border border-white/25'
        : 'rounded-card border border-premiumBorder bg-white',
      outlineButtonText: isDark ? 'text-white' : 'text-navy',
      backText: isDark ? 'text-white/50' : 'text-slate-500',
      chevron: isDark ? '#64748B' : '#94A3B8',
      sceneBg: isDark ? premiumColors.navy : premiumColors.surface,
      tabBarBg: isDark ? premiumColors.navy : '#FFFFFF',
      tabBarBorder: isDark ? 'rgba(197, 160, 89, 0.12)' : 'rgba(237, 237, 237, 0.95)',
      tabBarClass: isDark ? 'border-t border-gold/10 bg-navy' : 'border-t border-premiumBorder bg-white',
      inactiveTabIcon: isDark ? '#64748B' : '#94A3B8',
      activeTabContainer: isDark
        ? 'border border-gold/25 bg-gold/10'
        : 'border border-gold/20 bg-gold/10',
      placeholderColor: isDark ? '#64748B' : '#94A3B8',
      cardShadow: isDark ? premiumShadows.navy : premiumShadows.card,
      rankBadge: isDark ? 'bg-white/10' : 'bg-slate-100',
      connectorLine: isDark ? 'bg-white/10' : 'bg-slate-200',
      glassCard: isDark
        ? 'rounded-3xl border border-white/10 bg-white/5'
        : 'rounded-3xl border border-white/60 bg-white/80',
      heroCard: isDark
        ? 'rounded-3xl border border-white/10 bg-white/[0.03]'
        : 'rounded-3xl border border-premiumBorder/50 bg-white',
      revenueMetric: isDark ? 'text-gold' : 'text-gold',
      sectionLabel: isDark
        ? 'text-[11px] font-semibold uppercase tracking-[1.2px] text-white/40'
        : 'text-[11px] font-semibold uppercase tracking-[1.2px] text-slate-400',
    }),
    [isDark],
  )
}
