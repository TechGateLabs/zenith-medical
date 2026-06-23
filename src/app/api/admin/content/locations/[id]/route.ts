import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

const LocationUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  address: z.string().min(1).max(500).optional(),
  phone: z.string().max(50).optional().or(z.literal('')),
  fax: z.string().max(50).optional().or(z.literal('')),
  hours: z.string().max(500).optional().or(z.literal('')),
  mapsQuery: z.string().max(500).optional().or(z.literal('')),
  orderIndex: z.number().int().min(0).optional(),
  isPrimary: z.boolean().optional(),
  published: z.boolean().optional(),
})

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  return null
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  const { id } = await context.params

  try {
    const location = await prisma.clinicLocation.findUnique({ where: { id } })
    if (!location) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: location })
  } catch (error) {
    console.error('Failed to fetch clinic location:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clinic location' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  const { id } = await context.params

  try {
    const body = await request.json()
    const data = LocationUpdateSchema.parse(body)

    const location = await prisma.$transaction(async (tx) => {
      if (data.isPrimary === true) {
        await tx.clinicLocation.updateMany({
          where: { isPrimary: true, NOT: { id } },
          data: { isPrimary: false },
        })
      }
      return tx.clinicLocation.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.address !== undefined && { address: data.address }),
          ...(data.phone !== undefined && { phone: data.phone || null }),
          ...(data.fax !== undefined && { fax: data.fax || null }),
          ...(data.hours !== undefined && { hours: data.hours || null }),
          ...(data.mapsQuery !== undefined && { mapsQuery: data.mapsQuery || null }),
          ...(data.orderIndex !== undefined && { orderIndex: data.orderIndex }),
          ...(data.isPrimary !== undefined && { isPrimary: data.isPrimary }),
          ...(data.published !== undefined && { published: data.published }),
        },
      })
    })

    return NextResponse.json({ success: true, data: location })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Failed to update clinic location:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update clinic location' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  const { id } = await context.params

  try {
    await prisma.clinicLocation.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete clinic location:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete clinic location' },
      { status: 500 }
    )
  }
}
