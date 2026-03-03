import type { CollectionConfig } from 'payload'

export const AgentRuns: CollectionConfig = {
  slug: 'agent-runs',
  admin: {
    useAsTitle: 'run_at',
    defaultColumns: ['run_at', 'status', 'posts_processed', 'events_created', 'events_updated', 'duration_ms'],
    group: 'System',
    description: 'AI agent pipeline execution logs — monitor agent health here',
    pagination: { defaultLimit: 25 },
  },
  access: {
    read: ({ req: { user } }) => !!user,
    create: ({ req: { user } }) =>
      user?.role === 'super_admin' || user?.role === 'moderator',
    update: ({ req: { user } }) =>
      user?.role === 'super_admin' || user?.role === 'moderator',
    delete: ({ req: { user } }) => user?.role === 'super_admin',
  },
  fields: [
    {
      name: 'run_at',
      type: 'date',
      required: true,
      admin: {
        description: 'When this agent run started',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'MMM d, yyyy HH:mm:ss' },
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'running',
      options: [
        { label: '🔄 Running', value: 'running' },
        { label: '✅ Completed', value: 'completed' },
        { label: '❌ Failed', value: 'failed' },
        { label: '⚠️ Completed with Errors', value: 'completed_with_errors' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'subreddits_checked',
      type: 'array',
      admin: { description: 'Subreddits polled in this run' },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'posts_fetched', type: 'number' },
        { name: 'posts_passed_filter', type: 'number' },
      ],
    },
    { name: 'posts_processed', type: 'number', admin: { description: 'Posts sent to Claude' } },
    { name: 'events_created', type: 'number', admin: { description: 'New events added' } },
    { name: 'events_updated', type: 'number', admin: { description: 'Existing events updated' } },
    { name: 'events_deduplicated', type: 'number', admin: { description: 'Posts identified as duplicates' } },
    { name: 'posts_skipped', type: 'number', admin: { description: 'Posts already processed previously' } },
    { name: 'duration_ms', type: 'number', admin: { description: 'Total run duration in milliseconds' } },
    { name: 'claude_api_calls', type: 'number' },
    { name: 'geocoding_calls', type: 'number' },
    {
      name: 'errors',
      type: 'array',
      admin: { description: 'Errors encountered during this run' },
      fields: [
        {
          name: 'stage',
          type: 'select',
          options: [
            { label: 'Reddit Fetch', value: 'reddit_fetch' },
            { label: 'Claude Extraction', value: 'claude_extraction' },
            { label: 'Geocoding', value: 'geocoding' },
            { label: 'Deduplication', value: 'deduplication' },
            { label: 'Database Write', value: 'database_write' },
            { label: 'Other', value: 'other' },
          ],
        },
        { name: 'message', type: 'text', required: true },
        { name: 'post_id', type: 'text' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { rows: 3 },
    },
  ],
  timestamps: true,
}
