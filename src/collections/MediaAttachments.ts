import type { CollectionConfig } from 'payload'

/**
 * MediaAttachments — links only for now, image-upload ready for Stage 5.
 * To enable in-app uploads later: uncomment the `upload` block and add
 * MEDIA_STORAGE_PATH to .env.local, then run a new Payload migration.
 */
export const MediaAttachments: CollectionConfig = {
  slug: 'media-attachments',
  admin: {
    useAsTitle: 'url',
    defaultColumns: ['media_type', 'platform', 'is_graphic', 'verified_authentic', 'createdAt'],
    group: 'Content',
    description: 'Media links associated with conflict events',
    pagination: { defaultLimit: 50 },
  },

  // Uncomment to enable in-app image uploads (Stage 5):
  // upload: {
  //   staticDir: process.env.MEDIA_STORAGE_PATH || './media',
  //   mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  //   imageSizes: [
  //     { name: 'thumbnail', width: 400, height: 300, crop: 'centre' },
  //     { name: 'card', width: 800, height: 600, crop: 'centre' },
  //   ],
  // },

  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) =>
      user?.role === 'super_admin' || user?.role === 'moderator',
    delete: ({ req: { user } }) => user?.role === 'super_admin',
  },
  fields: [
    {
      name: 'media_type',
      type: 'select',
      required: true,
      defaultValue: 'article_link',
      options: [
        { label: 'Article / Post Link', value: 'article_link' },
        { label: 'Image Link', value: 'image_link' },
        { label: 'Video Link', value: 'video_link' },
        // Enable when upload is activated:
        // { label: 'Uploaded Image', value: 'uploaded_image' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: { description: 'Full URL to the external media' },
    },
    {
      name: 'thumbnail_url',
      type: 'text',
      admin: { description: 'URL to a thumbnail/preview image' },
    },
    {
      name: 'platform',
      type: 'select',
      options: [
        { label: 'Reddit', value: 'reddit' },
        { label: 'YouTube', value: 'youtube' },
        { label: 'Twitter / X', value: 'twitter' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'News Site', value: 'news_site' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      admin: { description: 'Optional title or caption' },
    },
    {
      name: 'is_graphic',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Triggers content warning gate on the frontend' },
    },
    {
      name: 'content_warning',
      type: 'text',
      admin: { description: 'Specific warning text (e.g. "Graphic: combat footage, casualties")' },
    },
    {
      name: 'verified_authentic',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Manually verified as authentic by a moderator' },
    },
    {
      name: 'verification_notes',
      type: 'textarea',
      admin: { description: 'How authenticity was verified', rows: 2 },
    },
  ],
  timestamps: true,
}
