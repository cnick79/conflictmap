import type { CollectionAfterChangeHook } from 'payload'

export const cacheInvalidationHook: CollectionAfterChangeHook = async ({ doc, previousDoc, operation }) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const revalidateSecret = process.env.REVALIDATE_SECRET

  const isBeingPublished =
    doc.status === 'published' &&
    (operation === 'create' || previousDoc?.status !== 'published')

  const isPublishedAndUpdated =
    doc.status === 'published' &&
    operation === 'update' &&
    previousDoc?.status === 'published'

  if (!isBeingPublished && !isPublishedAndUpdated) return doc

  if (revalidateSecret && process.env.NODE_ENV === 'production') {
    try {
      await fetch(`${appUrl}/api/revalidate?secret=${revalidateSecret}&tag=events`, {
        method: 'POST',
      })
      console.log(`[Cache] Revalidated events cache for event: ${doc.id}`)
    } catch (err) {
      console.error('[Cache] Failed to revalidate cache:', err)
    }
  } else {
    console.log(`[Cache] Event ${doc.id} published — cache revalidation skipped in dev`)
  }

  return doc
}
