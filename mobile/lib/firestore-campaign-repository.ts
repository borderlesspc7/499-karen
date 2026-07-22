import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore'
import { firestoreCollections } from '@shared/constants/firestore-collections'
import type { CreateSavedCampaignInput, SavedCampaign } from '@shared/types'
import { generateId } from '@shared/utils/generate-id'
import { getFirestoreDb } from './firebase'

const EMPTY_METRICS: SavedCampaign['metrics'] = {
  views: 0,
  leads: 0,
  costPerLead: 0,
}

function normalizeCampaign(
  id: string,
  data: Partial<SavedCampaign>,
): SavedCampaign | null {
  if (!data.userId || !data.title) {
    return null
  }

  const now = new Date().toISOString()

  return {
    id,
    userId: data.userId,
    title: data.title,
    objective: data.objective ?? 'promote',
    audience: data.audience ?? '',
    offer: data.offer ?? '',
    status: data.status ?? 'active',
    channels: data.channels ?? [],
    pieceCount: data.pieceCount ?? 0,
    estimatedLeads: data.estimatedLeads ?? 0,
    metrics: data.metrics ?? EMPTY_METRICS,
    prompt: data.prompt ?? '',
    publishedAt: data.publishedAt ?? now,
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
  }
}

export type FirestoreCampaignRepository = {
  listByUser(userId: string): Promise<SavedCampaign[]>
  listActiveByUser(userId: string): Promise<SavedCampaign[]>
  upsert(campaign: SavedCampaign): Promise<void>
  createActive(input: CreateSavedCampaignInput): Promise<SavedCampaign>
}

export function createFirestoreCampaignRepository(
  db: Firestore = getFirestoreDb(),
): FirestoreCampaignRepository {
  const campaignsRef = collection(db, firestoreCollections.campaigns)

  return {
    async listByUser(userId) {
      const snapshot = await getDocs(query(campaignsRef, where('userId', '==', userId)))
      const campaigns = snapshot.docs
        .map((document) =>
          normalizeCampaign(document.id, document.data() as Partial<SavedCampaign>),
        )
        .filter((campaign): campaign is SavedCampaign => campaign !== null)

      return campaigns.sort(
        (left, right) =>
          new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
      )
    },

    async listActiveByUser(userId) {
      const campaigns = await this.listByUser(userId)
      return campaigns.filter((campaign) => campaign.status === 'active')
    },

    async upsert(campaign) {
      await setDoc(
        doc(db, firestoreCollections.campaigns, campaign.id),
        campaign as DocumentData,
        { merge: true },
      )
    },

    async createActive(input) {
      const now = new Date().toISOString()
      const campaign: SavedCampaign = {
        id: generateId(),
        userId: input.userId,
        title: input.title,
        objective: input.objective,
        audience: input.audience,
        offer: input.offer,
        status: 'active',
        channels: input.channels,
        pieceCount: input.pieceCount,
        estimatedLeads: input.estimatedLeads,
        metrics: EMPTY_METRICS,
        prompt: input.prompt,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      }

      await this.upsert(campaign)
      return campaign
    },
  }
}

let campaignRepository: FirestoreCampaignRepository | null = null

export function getCampaignRepository() {
  if (!campaignRepository) {
    campaignRepository = createFirestoreCampaignRepository()
  }

  return campaignRepository
}
