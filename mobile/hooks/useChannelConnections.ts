import { useCallback, useEffect, useState } from 'react'
import * as WebBrowser from 'expo-web-browser'
import { useAuth } from '@shared/contexts'
import type { ChannelConnectionsSnapshot, MessagingChannel } from '@shared/types'
import { DEFAULT_CHANNEL_CONNECTIONS } from '@shared/types'
import {
  disconnectChannelConnection,
  fetchChannelConnections,
  startChannelOAuth,
} from '@/lib/messaging-service'

WebBrowser.maybeCompleteAuthSession()

export function useChannelConnections() {
  const { currentUser } = useAuth()
  const [connections, setConnections] = useState<ChannelConnectionsSnapshot>(
    DEFAULT_CHANNEL_CONNECTIONS,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState<MessagingChannel | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!currentUser?.id) {
      setConnections(DEFAULT_CHANNEL_CONNECTIONS)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchChannelConnections()
      setConnections(data)
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Não foi possível carregar conexões.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    void reload()
  }, [reload])

  const connectChannel = useCallback(
    async (channel: MessagingChannel) => {
      setIsConnecting(channel)
      setError(null)

      try {
        const { authUrl, redirectUri } = await startChannelOAuth(channel)
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri)

        if (result.type !== 'success') {
          throw new Error('Conexão cancelada pelo usuário.')
        }

        await reload()
      } catch (connectError) {
        const message =
          connectError instanceof Error ? connectError.message : 'Falha ao conectar canal.'
        setError(message)
        throw connectError
      } finally {
        setIsConnecting(null)
      }
    },
    [reload],
  )

  const disconnectChannel = useCallback(
    async (channel: MessagingChannel) => {
      setError(null)
      try {
        await disconnectChannelConnection(channel)
        await reload()
      } catch (disconnectError) {
        const message =
          disconnectError instanceof Error ? disconnectError.message : 'Falha ao desconectar.'
        setError(message)
        throw disconnectError
      }
    },
    [reload],
  )

  return {
    connections,
    isLoading,
    isConnecting,
    error,
    reload,
    connectChannel,
    disconnectChannel,
  }
}
