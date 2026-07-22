import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getFirebaseStorage } from './firebase'

function resolveExtension(contentType: string): string {
  if (contentType.includes('png')) return 'png'
  if (contentType.includes('webp')) return 'webp'
  if (contentType.includes('gif')) return 'gif'
  return 'jpg'
}

export async function uploadBrandLogo(input: {
  userId: string
  localUri: string
  contentType?: string
}): Promise<string> {
  const contentType = input.contentType ?? 'image/jpeg'
  const extension = resolveExtension(contentType)
  const path = `users/${input.userId}/brand/logo.${extension}`
  const storageRef = ref(getFirebaseStorage(), path)

  const response = await fetch(input.localUri)
  const blob = await response.blob()

  await uploadBytes(storageRef, blob, { contentType })
  return getDownloadURL(storageRef)
}
