import type { InboxConversation } from '@shared/types'
import { getInboxRepository } from './repositories'

export async function loadInboxConversations(userId: string): Promise<InboxConversation[]> {
  return getInboxRepository().listByUser(userId)
}
