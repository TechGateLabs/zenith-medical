import { describe, expect, test, mock } from 'bun:test'
import { LocationSchema, LocationUpdateSchema } from '../src/lib/locations/validation'

let session: any = null
mock.module('next-auth', () => ({ getServerSession: async () => session }))
mock.module('@/lib/auth/config', () => ({ authOptions: {} }))
const { requireLocationAdmin } = await import('../src/lib/locations/authorization')

describe('clinic publishing and email validation', () => {
  const clinic = { name: 'Ogilvie', address: 'Clinic address' }
  test('new clinics remain drafts until explicitly published', () => {
    expect(LocationSchema.parse(clinic).published).toBe(false)
    expect(LocationSchema.parse({ ...clinic, published: true }).published).toBe(true)
  })
  test('accepts public email and rejects malformed email', () => {
    expect(LocationSchema.parse({ ...clinic, email: ' clinic@example.com ' }).email).toBe('clinic@example.com')
    expect(LocationSchema.safeParse({ ...clinic, email: 'not-an-email' }).success).toBe(false)
  })
  test('partial updates preserve omitted fields and allow clearing email', () => {
    expect(LocationUpdateSchema.parse({ published: true })).toEqual({ published: true })
    expect(LocationUpdateSchema.parse({ email: '' })).toEqual({ email: '' })
  })
  test('requires a name and address', () => {
    expect(LocationSchema.safeParse({ name: ' ', address: ' ' }).success).toBe(false)
  })
})

describe('clinic administration authorization', () => {
  test('rejects missing sessions', async () => {
    session = null
    expect((await requireLocationAdmin())?.status).toBe(401)
  })
  test('rejects editor and unknown roles', async () => {
    for (const role of ['EDITOR', undefined, 'UNKNOWN']) {
      session = { user: { role } }
      expect((await requireLocationAdmin())?.status).toBe(403)
    }
  })
  test('allows administrator roles', async () => {
    for (const role of ['ADMIN', 'SUPER_ADMIN']) {
      session = { user: { role } }
      expect(await requireLocationAdmin()).toBeNull()
    }
  })
})
