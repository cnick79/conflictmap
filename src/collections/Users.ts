import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'createdAt'],
    group: 'Admin',
  },
  access: {
    create: ({ req: { user } }) => user?.role === 'super_admin',
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super_admin') return true
      return { id: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super_admin') return true
      return { id: { equals: user.id } }
    },
    delete: ({ req: { user } }) => user?.role === 'super_admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'moderator',
      options: [
        { label: 'Super Admin', value: 'super_admin' },
        { label: 'Moderator', value: 'moderator' },
        { label: 'API User', value: 'api_user' },
      ],
      admin: {
        position: 'sidebar',
        description: 'super_admin: full access | moderator: review/publish events | api_user: read-only',
      },
    },
  ],
  timestamps: true,
}
