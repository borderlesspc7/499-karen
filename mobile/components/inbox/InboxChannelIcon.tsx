import { View } from 'react-native'
import { Facebook, Instagram, Linkedin, Mail, MessageCircle, Smartphone } from 'lucide-react-native'
import type { InboxChannel } from '@shared/types'

type ChannelVisual = {
  Icon: typeof MessageCircle
  backgroundColor: string
  iconColor: string
}

const CHANNEL_VISUALS: Record<InboxChannel, ChannelVisual> = {
  whatsapp: {
    Icon: MessageCircle,
    backgroundColor: '#DCFCE7',
    iconColor: '#16A34A',
  },
  instagram: {
    Icon: Instagram,
    backgroundColor: '#FCE7F3',
    iconColor: '#DB2777',
  },
  facebook: {
    Icon: Facebook,
    backgroundColor: '#DBEAFE',
    iconColor: '#1877F2',
  },
  linkedin: {
    Icon: Linkedin,
    backgroundColor: '#E0F2FE',
    iconColor: '#0A66C2',
  },
  email: {
    Icon: Mail,
    backgroundColor: '#DBEAFE',
    iconColor: '#2563EB',
  },
  sms: {
    Icon: Smartphone,
    backgroundColor: '#F1F5F9',
    iconColor: '#475569',
  },
}

type InboxChannelIconProps = {
  channel: InboxChannel
  size?: 'sm' | 'md' | 'lg'
}

export function InboxChannelIcon({ channel, size = 'md' }: InboxChannelIconProps) {
  const visual = CHANNEL_VISUALS[channel]
  const Icon = visual.Icon
  const dimension = size === 'sm' ? 32 : size === 'lg' ? 48 : 40
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 22 : 18

  return (
    <View
      className="items-center justify-center rounded-full"
      style={{
        width: dimension,
        height: dimension,
        backgroundColor: visual.backgroundColor,
      }}
    >
      <Icon size={iconSize} color={visual.iconColor} />
    </View>
  )
}
