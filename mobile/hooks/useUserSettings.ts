import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@shared/contexts'
import type { TeamMember, UserIntegrations, UserSettings } from '@shared/types'
import { getUserSettingsRepository } from '@/lib/repositories'

export function useUserSettings() {
  const { currentUser } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!currentUser?.id) {
      setSettings(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await getUserSettingsRepository().load(currentUser.id)
      setSettings(data)
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Não foi possível carregar configurações.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    void load()
  }, [load])

  const updateIntegrations = useCallback(
    async (integrations: UserIntegrations) => {
      if (!currentUser?.id) {
        return
      }

      await getUserSettingsRepository().saveIntegrations(currentUser.id, integrations)
      setSettings((current) =>
        current ? { ...current, integrations } : { integrations, teamMembers: [] },
      )
    },
    [currentUser?.id],
  )

  const updateTeamMembers = useCallback(
    async (teamMembers: TeamMember[]) => {
      if (!currentUser?.id) {
        return
      }

      await getUserSettingsRepository().saveTeamMembers(currentUser.id, teamMembers)
      setSettings((current) =>
        current
          ? { ...current, teamMembers }
          : { integrations: { instagram: false, facebook: false, linkedin: false, google: false, whatsapp: false, email: false }, teamMembers },
      )
    },
    [currentUser?.id],
  )

  return {
    settings,
    isLoading,
    error,
    reload: load,
    updateIntegrations,
    updateTeamMembers,
  }
}
