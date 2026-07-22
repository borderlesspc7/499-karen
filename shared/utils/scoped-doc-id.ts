/** Document ID estável e isolado por usuário em collections multi-tenant. */
export function scopedDocId(userId: string, entityId: string): string {
  return `${userId}__${entityId}`
}
