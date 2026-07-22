import { useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { Palette } from 'lucide-react-native'
import { useAuth } from '@shared/contexts'
import type { BrandColors, BrandIdentity, TargetClientType } from '@shared/types/brand-identity'
import type { UserProfile } from '@shared/types/gamification'
import {
  createBrandIdentity,
  DEFAULT_BRAND_COLORS,
  isBrandIdentityComplete,
} from '@shared/utils/brand-identity'
import { AudienceStep } from '@/components/onboarding/AudienceStep'
import { CompanyStep } from '@/components/onboarding/CompanyStep'
import { VisualStep } from '@/components/onboarding/VisualStep'
import { uploadBrandLogo } from '@/lib/storage-service'

type BrandIdentityEditorProps = {
  initialIdentity: BrandIdentity | null
  userProfile: UserProfile | null
  onSave: (identity: BrandIdentity) => void
  onSaveStatusChange?: (status: 'idle' | 'saved') => void
  saveTrigger?: number
}

type EditorDraft = {
  companyName: string
  servicesDescription: string
  targetClientType: TargetClientType | null
  targetClientDescription: string
  logoUri: string | null
  colors: BrandColors
}

function createDraftFromIdentity(identity: BrandIdentity | null): EditorDraft {
  if (!identity) {
    return {
      companyName: '',
      servicesDescription: '',
      targetClientType: null,
      targetClientDescription: '',
      logoUri: null,
      colors: {
        primary: DEFAULT_BRAND_COLORS.primary,
        secondary: DEFAULT_BRAND_COLORS.secondary,
        accent: DEFAULT_BRAND_COLORS.accent,
      },
    }
  }

  return {
    companyName: identity.companyName,
    servicesDescription: identity.servicesDescription,
    targetClientType: identity.targetClientType,
    targetClientDescription: identity.targetClientDescription,
    logoUri: identity.logoUri,
    colors: { ...identity.colors },
  }
}

async function resolvePersistedLogoUri(
  userId: string | undefined,
  logoUri: string | null,
): Promise<string | null> {
  if (!logoUri || !userId) {
    return logoUri
  }

  if (logoUri.startsWith('https://') || logoUri.startsWith('http://')) {
    return logoUri
  }

  return uploadBrandLogo({ userId, localUri: logoUri })
}

export function BrandIdentityEditor({
  initialIdentity,
  userProfile,
  onSave,
  onSaveStatusChange,
  saveTrigger = 0,
}: BrandIdentityEditorProps) {
  const { currentUser } = useAuth()
  const [draft, setDraft] = useState<EditorDraft>(() => createDraftFromIdentity(initialIdentity))
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(createDraftFromIdentity(initialIdentity))
    setValidationError(null)
  }, [initialIdentity])

  useEffect(() => {
    if (saveTrigger === 0) {
      return
    }

    let isCancelled = false

    async function persist() {
      const businessProfile = userProfile ?? 'Empresário'
      const identityDraft = {
        businessProfile,
        companyName: draft.companyName,
        servicesDescription: draft.servicesDescription,
        targetClientType: draft.targetClientType ?? 'outro',
        targetClientDescription: draft.targetClientDescription,
        logoUri: draft.logoUri,
        colors: draft.colors,
      }

      if (!isBrandIdentityComplete(identityDraft)) {
        setValidationError('Preencha nome da empresa, serviços, público-alvo e cores da marca.')
        onSaveStatusChange?.('idle')
        return
      }

      try {
        const logoUri = await resolvePersistedLogoUri(currentUser?.id, draft.logoUri)
        if (isCancelled) {
          return
        }

        setValidationError(null)
        onSave(createBrandIdentity({ ...identityDraft, logoUri }))
        onSaveStatusChange?.('saved')
      } catch (error) {
        if (isCancelled) {
          return
        }
        setValidationError(
          error instanceof Error ? error.message : 'Falha ao enviar o logo para o Storage.',
        )
        onSaveStatusChange?.('idle')
      }
    }

    void persist()

    return () => {
      isCancelled = true
    }
  }, [saveTrigger, draft, onSave, onSaveStatusChange, userProfile, currentUser?.id])

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-8 pb-4"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <Palette size={18} color="#7c3aed" />
          <Text className="text-lg font-semibold text-slate-900">Identidade da marca</Text>
        </View>
        <Text className="text-sm leading-5 text-slate-500">
          A IA usa essas informações para personalizar campanhas, conteúdos e automações. O logo é
          enviado ao Firebase Storage.
        </Text>
      </View>

      <View className="gap-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <Text className="text-sm font-semibold text-slate-800">Empresa e serviços</Text>
        <CompanyStep
          companyName={draft.companyName}
          servicesDescription={draft.servicesDescription}
          onChangeCompanyName={(value) => setDraft((current) => ({ ...current, companyName: value }))}
          onChangeServicesDescription={(value) =>
            setDraft((current) => ({ ...current, servicesDescription: value }))
          }
          variant="embedded"
        />
      </View>

      <View className="gap-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <Text className="text-sm font-semibold text-slate-800">Público-alvo</Text>
        <AudienceStep
          targetClientType={draft.targetClientType}
          targetClientDescription={draft.targetClientDescription}
          onSelectTarget={(type) => setDraft((current) => ({ ...current, targetClientType: type }))}
          onChangeDescription={(value) =>
            setDraft((current) => ({ ...current, targetClientDescription: value }))
          }
          variant="embedded"
        />
      </View>

      <View className="gap-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <Text className="text-sm font-semibold text-slate-800">Visual da marca</Text>
        <VisualStep
          colors={draft.colors}
          logoUri={draft.logoUri}
          onChangeColors={(colors) => setDraft((current) => ({ ...current, colors }))}
          onChangeLogoUri={(uri) => setDraft((current) => ({ ...current, logoUri: uri }))}
          variant="embedded"
        />
      </View>

      {validationError ? <Text className="text-sm text-red-600">{validationError}</Text> : null}
    </ScrollView>
  )
}
