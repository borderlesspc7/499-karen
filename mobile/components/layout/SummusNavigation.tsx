import { Pressable, ScrollView, Text, View } from 'react-native'
import { Link, usePathname } from 'expo-router'
import { summusNavItems } from '@/constants/summus-nav-items'
import { premiumColors } from '@/constants/premium-theme'
import { SummusLogo } from '@/components/ui/SummusLogo'
import { SidebarUserProfile } from './SidebarUserProfile'

type SummusNavigationProps = {
  onNavigate?: () => void
}

export function SummusNavigation({ onNavigate }: SummusNavigationProps) {
  const pathname = usePathname()

  return (
    <View className="h-full w-[272px] border-r border-gold/10 bg-navy">
      <View className="items-center border-b border-gold/10 px-4 py-5">
        <SummusLogo variant="full" compact centered />
      </View>

      <ScrollView
        className="flex-1 px-3 py-3"
        contentContainerClassName="gap-0.5 pb-3"
        showsVerticalScrollIndicator={false}
      >
        {summusNavItems.map((item) => {
          const isActive = item.match(pathname)
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href} asChild>
              <Pressable
                onPress={onNavigate}
                className={[
                  'flex-row items-center gap-3 rounded-card py-2.5 pl-3 pr-3',
                  isActive ? 'border border-gold/20 bg-gold/10' : 'bg-transparent',
                ].join(' ')}
              >
                {isActive ? (
                  <View className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-gold" />
                ) : null}
                <Icon
                  size={18}
                  color={isActive ? premiumColors.gold : '#94A3B8'}
                  strokeWidth={1.5}
                />
                <Text
                  className={[
                    'flex-1 text-[13px] font-medium',
                    isActive ? 'font-semibold text-gold' : 'text-white/50',
                  ].join(' ')}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </Pressable>
            </Link>
          )
        })}
      </ScrollView>

      <View className="border-t border-gold/10 p-4">
        <SidebarUserProfile />
      </View>
    </View>
  )
}
