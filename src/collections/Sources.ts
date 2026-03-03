import type { CollectionConfig } from 'payload'

export const Sources: CollectionConfig = {
  slug: 'sources',
  admin: {
    useAsTitle: 'post_title',
    defaultColumns: ['subreddit', 'post_id', 'platform', 'posted_at', 'upvotes', 'createdAt'],
    group: 'Content',
    description: 'Reddit posts and other sources linked to conflict events',
    pagination: { defaultLimit: 50 },
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) =>
      user?.role === 'super_admin' || user?.role === 'moderator',
    delete: ({ req: { user } }) => user?.role === 'super_admin',
  },
  fields: [
    {
      name: 'platform',
      type: 'select',
      required: true,
      defaultValue: 'reddit',
      options: [
        { label: 'Reddit', value: 'reddit' },
        { label: 'Twitter / X', value: 'twitter' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'News Wire', value: 'news_wire' },
        { label: 'Other', value: 'other' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'post_id',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Unique post ID from the platform (e.g. Reddit post ID "1abc23")' },
    },
    {
      name: 'post_url',
      type: 'text',
      required: true,
      admin: { description: 'Full URL to the original post' },
    },
    {
      name: 'subreddit',
      type: 'text',
      admin: { description: 'Subreddit name without r/ prefix (e.g. "CombatFootage")' },
    },
    {
      name: 'post_title',
      type: 'text',
      admin: { description: 'Original post title from Reddit' },
    },
    {
      name: 'post_body',
      type: 'textarea',
      admin: { description: 'Post body text — stored for audit trail', rows: 4 },
    },
    {
      name: 'posted_at',
      type: 'date',
      admin: { description: 'When the post was published on Reddit' },
    },
    {
      name: 'upvotes',
      type: 'number',
      admin: { description: 'Upvote count at time of ingestion' },
    },
    {
      name: 'upvote_ratio',
      type: 'number',
      min: 0,
      max: 1,
      admin: { description: 'Upvote ratio 0.0–1.0', step: 0.01 },
    },
    {
      name: 'flair',
      type: 'text',
      admin: { description: 'Post flair tag from Reddit (e.g. "Breaking", "Geolocated")' },
    },
    {
      name: 'raw_extraction_input',
      type: 'textarea',
      admin: {
        description: 'Exact text sent to Claude — stored for debugging and audit trail',
        rows: 6,
      },
    },
    // Author handle intentionally omitted for GDPR compliance.
    // Uncomment only if you have legal basis to store this:
    // { name: 'author_handle', type: 'text' },
  ],
  timestamps: true,
}
