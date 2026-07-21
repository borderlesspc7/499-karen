import { createFirestoreClientRepository } from './firestore-client-repository'
import { createFirestoreCrmRepository } from './firestore-crm-repository'
import { createFirestoreInboxRepository } from './firestore-inbox-repository'
import { createFirestoreUserSettingsRepository } from './firestore-user-settings-repository'
import { getFirestoreDb } from './firebase'

let clientRepository: ReturnType<typeof createFirestoreClientRepository> | null = null
let crmRepository: ReturnType<typeof createFirestoreCrmRepository> | null = null
let inboxRepository: ReturnType<typeof createFirestoreInboxRepository> | null = null
let userSettingsRepository: ReturnType<typeof createFirestoreUserSettingsRepository> | null = null

export function getClientRepository() {
  if (!clientRepository) {
    clientRepository = createFirestoreClientRepository(getFirestoreDb())
  }

  return clientRepository
}

export function getCrmRepository() {
  if (!crmRepository) {
    crmRepository = createFirestoreCrmRepository(getFirestoreDb())
  }

  return crmRepository
}

export function getInboxRepository() {
  if (!inboxRepository) {
    inboxRepository = createFirestoreInboxRepository(getFirestoreDb())
  }

  return inboxRepository
}

export function getUserSettingsRepository() {
  if (!userSettingsRepository) {
    userSettingsRepository = createFirestoreUserSettingsRepository(getFirestoreDb())
  }

  return userSettingsRepository
}
