import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

const PROJECT_ID = 'karen-rules-test'
const RULES_PATH = resolve(__dirname, '../firestore.rules')

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(RULES_PATH, 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

describe('Firestore security rules — isolamento', () => {
  it('User A lê conversa própria', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      await setDoc(doc(db, 'conversations/conv-a'), {
        id: 'conv-a',
        userId: 'user-a',
        contactName: 'Lead',
        preview: 'oi',
        updatedAt: new Date().toISOString(),
      })
    })

    const db = testEnv.authenticatedContext('user-a').firestore()
    await assertSucceeds(getDoc(doc(db, 'conversations/conv-a')))
  })

  it('User A NÃO lê conversa de User B', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      await setDoc(doc(db, 'conversations/conv-b'), {
        id: 'conv-b',
        userId: 'user-b',
        contactName: 'Outro',
        preview: 'segredo',
        updatedAt: new Date().toISOString(),
      })
    })

    const db = testEnv.authenticatedContext('user-a').firestore()
    await assertFails(getDoc(doc(db, 'conversations/conv-b')))
  })

  it('User A NÃO lê mensagens de User B', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      await setDoc(doc(db, 'conversations/conv-b'), {
        id: 'conv-b',
        userId: 'user-b',
      })
      await setDoc(doc(db, 'conversations/conv-b/messages/m1'), {
        id: 'm1',
        text: 'privado',
        role: 'contact',
        timestamp: '10:00',
      })
    })

    const db = testEnv.authenticatedContext('user-a').firestore()
    await assertFails(getDoc(doc(db, 'conversations/conv-b/messages/m1')))
  })

  it('User A NÃO escreve mensagens pelo cliente', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      await setDoc(doc(db, 'conversations/conv-a'), {
        id: 'conv-a',
        userId: 'user-a',
      })
    })

    const db = testEnv.authenticatedContext('user-a').firestore()
    await assertFails(
      setDoc(doc(db, 'conversations/conv-a/messages/m-new'), {
        id: 'm-new',
        text: 'tentativa',
        role: 'agent',
        timestamp: '10:01',
      }),
    )
  })

  it('Anônimo NÃO lê conversa', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      await setDoc(doc(db, 'conversations/conv-a'), {
        id: 'conv-a',
        userId: 'user-a',
      })
    })

    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, 'conversations/conv-a')))
  })

  it('User A NÃO lê integration_secrets', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      await setDoc(doc(db, 'integration_secrets/user-a/channels/whatsapp'), {
        pageAccessToken: 'secret',
      })
    })

    const db = testEnv.authenticatedContext('user-a').firestore()
    await assertFails(getDoc(doc(db, 'integration_secrets/user-a/channels/whatsapp')))
  })

  it('User A lê channel_connections próprio e NÃO escreve', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      await setDoc(doc(db, 'channel_connections/user-a/channels/whatsapp'), {
        status: 'connected',
      })
    })

    const db = testEnv.authenticatedContext('user-a').firestore()
    await assertSucceeds(getDoc(doc(db, 'channel_connections/user-a/channels/whatsapp')))
    await assertFails(
      setDoc(doc(db, 'channel_connections/user-a/channels/whatsapp'), {
        status: 'hacked',
      }),
    )
  })
})
