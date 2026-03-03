import type { CollectionAfterChangeHook } from 'payload'

const HIGH_SEVERITY_THRESHOLD = 8

export const severityAlertHook: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  const isHighSeverity = doc.severity >= HIGH_SEVERITY_THRESHOLD
  const isBeingPublished = doc.status === 'published' && previousDoc?.status !== 'published'

  if (!isHighSeverity || !isBeingPublished) return doc

  const message = [
    `🚨 HIGH SEVERITY EVENT (${doc.severity}/10)`,
    `Title: ${doc.title}`,
    `Type: ${doc.conflict_type}`,
    `Location: ${doc.location_name || 'Unknown'} (${doc.country || '?'})`,
    `Confidence: ${doc.confidence_score ? Math.round(doc.confidence_score * 100) + '%' : 'Unknown'}`,
    `Admin: ${process.env.NEXT_PUBLIC_APP_URL}/admin/collections/events/${doc.id}`,
  ].join('\n')

  console.log(`[Alert]\n${message}`)

  const webhookUrl = process.env.ALERT_WEBHOOK_URL
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      })
    } catch (err) {
      console.error('[Alert] Webhook failed:', err)
    }
  }

  return doc
}
