import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import {
  Building2,
  Check,
  CreditCard,
  Link2,
  LogOut,
  Mail,
  MessageCircle,
  Palette,
  Save,
  Shield,
  Users,
} from 'lucide-react-native'
import { useAuth, useGamification } from '@shared/contexts'
import { AppScreen } from '@/components/layout/AppScreen'
import { PageScroll } from '@/components/layout/PageScroll'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { BrandIdentityEditor } from '@/components/brand/BrandIdentityEditor'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

type SettingsSection = 'geral' | 'marca' | 'seguranca' | 'integracoes' | 'equipe' | 'faturamento'

const sections: { id: SettingsSection; label: string; icon: typeof Building2 }[] = [
  { id: 'geral', label: 'Geral', icon: Building2 },
  { id: 'marca', label: 'Identidade', icon: Palette },
  { id: 'seguranca', label: 'Segurança', icon: Shield },
  { id: 'integracoes', label: 'Integrações', icon: Link2 },
  { id: 'equipe', label: 'Equipe', icon: Users },
  { id: 'faturamento', label: 'Faturamento', icon: CreditCard },
]

const teamMembers = [
  { name: 'Karen Silva', role: 'Administradora', status: 'Ativo' },
  { name: 'Lucas Ferreira', role: 'Gerente Comercial', status: 'Ativo' },
  { name: 'Marina Costa', role: 'Operações', status: 'Pendente' },
]

const integrations = [
  { id: 'whatsapp', name: 'WhatsApp Business', icon: MessageCircle, connected: true },
  { id: 'email', name: 'E-mail Marketing', icon: Mail, connected: false },
]

export default function SettingsScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const { signOutUser } = useAuth()
  const { brandIdentity, userProfile, setBrandIdentity } = useGamification()
  const [activeSection, setActiveSection] = useState<SettingsSection>('geral')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')
  const [brandSaveTrigger, setBrandSaveTrigger] = useState(0)
  const [connected, setConnected] = useState<Record<string, boolean>>({
    whatsapp: true,
    email: false,
  })

  function handleSave() {
    if (activeSection === 'marca') {
      setBrandSaveTrigger((current) => current + 1)
      return
    }

    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  function handleBrandSaveStatusChange(status: 'idle' | 'saved') {
    setSaveStatus(status)
    if (status === 'saved') {
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  async function handleSignOut() {
    await signOutUser()
  }

  const sectionNav = (
    <View className={isWebDesktop ? 'w-56 shrink-0 gap-1' : 'flex-row gap-2'}>
      {sections.map((section) => {
        const Icon = section.icon
        const isActive = activeSection === section.id

        return (
          <Pressable
            key={section.id}
            onPress={() => setActiveSection(section.id)}
            className={[
              'flex-row items-center gap-2 rounded-2xl border px-3 py-2',
              isActive ? 'border-violet-200 bg-white' : 'border-transparent bg-white/70',
              isWebDesktop ? 'w-full' : '',
            ].join(' ')}
          >
            <Icon size={16} color={isActive ? '#7c3aed' : '#64748b'} />
            <Text
              className={[
                'text-sm font-medium',
                isActive ? 'text-violet-700' : 'text-slate-600',
              ].join(' ')}
            >
              {section.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )

  const sectionContent = (
    <View className="flex-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      {activeSection === 'geral' ? (
        <View className="gap-4">
          <Text className="text-lg font-semibold text-slate-900">Informações gerais</Text>
          <View>
            <Text className="text-sm font-medium text-slate-700">Nome da empresa</Text>
            <View className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Text className="text-slate-900">
                {brandIdentity?.companyName ?? 'Não configurado'}
              </Text>
            </View>
          </View>
          <View>
            <Text className="text-sm font-medium text-slate-700">Fuso horário</Text>
            <View className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Text className="text-slate-900">América/São Paulo (GMT-3)</Text>
            </View>
          </View>
        </View>
      ) : null}

      {activeSection === 'marca' ? (
        <BrandIdentityEditor
          initialIdentity={brandIdentity}
          userProfile={userProfile}
          onSave={setBrandIdentity}
          onSaveStatusChange={handleBrandSaveStatusChange}
          saveTrigger={brandSaveTrigger}
        />
      ) : null}

      {activeSection === 'seguranca' ? (
        <View className="gap-4">
          <Text className="text-lg font-semibold text-slate-900">Segurança</Text>
          <Pressable className="rounded-2xl border border-slate-200 py-3">
            <Text className="text-center text-sm font-semibold text-slate-700">Trocar senha</Text>
          </Pressable>
          <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <Text className="font-medium text-slate-900">Chrome · Windows</Text>
            <Text className="mt-1 text-sm text-slate-500">São Paulo, BR · Sessão atual</Text>
          </View>
        </View>
      ) : null}

      {activeSection === 'integracoes' ? (
        <View className="gap-3">
          <Text className="text-lg font-semibold text-slate-900">Integrações</Text>
          {integrations.map((integration) => {
            const Icon = integration.icon
            const isConnected = connected[integration.id]

            return (
              <View
                key={integration.id}
                className="flex-row items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <View className="flex-row items-center gap-3">
                  <View className="rounded-xl bg-white p-2">
                    <Icon size={18} color="#7c3aed" />
                  </View>
                  <Text className="font-medium text-slate-900">{integration.name}</Text>
                </View>
                <Pressable
                  onPress={() =>
                    setConnected((current) => ({
                      ...current,
                      [integration.id]: !current[integration.id],
                    }))
                  }
                  className={[
                    'rounded-2xl px-3 py-2',
                    isConnected ? 'bg-white' : 'bg-violet-600',
                  ].join(' ')}
                >
                  <Text
                    className={[
                      'text-xs font-semibold',
                      isConnected ? 'text-slate-700' : 'text-white',
                    ].join(' ')}
                  >
                    {isConnected ? 'Conectado' : 'Conectar'}
                  </Text>
                </Pressable>
              </View>
            )
          })}
        </View>
      ) : null}

      {activeSection === 'equipe' ? (
        <View className="gap-3">
          <Text className="text-lg font-semibold text-slate-900">Equipe</Text>
          {teamMembers.map((member) => (
            <View key={member.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <Text className="font-semibold text-slate-900">{member.name}</Text>
              <Text className="mt-1 text-sm text-slate-500">{member.role}</Text>
              <Text className="mt-2 text-xs font-medium text-emerald-700">{member.status}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {activeSection === 'faturamento' ? (
        <View className="gap-4">
          <View className="rounded-3xl bg-violet-600 p-5">
            <Text className="text-sm text-violet-100">Plano atual</Text>
            <Text className="mt-2 text-2xl font-semibold text-white">Borderless Pro</Text>
            <Text className="mt-2 text-sm text-violet-100">R$ 297 / mês</Text>
            <Pressable className="mt-4 rounded-2xl bg-white py-3">
              <Text className="text-center text-sm font-semibold text-violet-700">Upgrade</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  )

  return (
    <AppScreen>
      <PageScroll>
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <ScreenHeader badge="Administração" title="Configurações" />
          </View>
          <Pressable
            onPress={handleSave}
            className={[
              'rounded-2xl px-4 py-3',
              saveStatus === 'saved' ? 'bg-emerald-600' : 'bg-violet-600',
            ].join(' ')}
          >
            <View className="flex-row items-center gap-2">
              {saveStatus === 'saved' ? (
                <Check size={14} color="#ffffff" />
              ) : (
                <Save size={14} color="#ffffff" />
              )}
              <Text className="text-sm font-semibold text-white">
                {saveStatus === 'saved' ? 'Salvo' : 'Salvar'}
              </Text>
            </View>
          </Pressable>
        </View>

        {isWebDesktop ? (
          <View className="flex-row gap-6">
            {sectionNav}
            {sectionContent}
          </View>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sectionNav}
            </ScrollView>
            {sectionContent}
          </>
        )}

        <Pressable
          onPress={handleSignOut}
          className="flex-row items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 active:bg-slate-50"
        >
          <LogOut size={16} color="#64748b" />
          <Text className="text-sm font-semibold text-slate-700">Sair da conta</Text>
        </Pressable>
      </PageScroll>
    </AppScreen>
  )
}
