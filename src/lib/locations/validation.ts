import { z } from 'zod'

export const LocationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  address: z.string().trim().min(1, 'Address is required').max(500),
  phone: z.string().trim().max(50).optional(),
  email: z.union([z.string().trim().email('Enter a valid public email address').max(254), z.literal('')]).optional(),
  fax: z.string().trim().max(50).optional(),
  hours: z.string().trim().max(500).optional(),
  mapsQuery: z.string().trim().max(500).optional(),
  orderIndex: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
  published: z.boolean().default(false),
})

export const LocationUpdateSchema = LocationSchema.partial()
