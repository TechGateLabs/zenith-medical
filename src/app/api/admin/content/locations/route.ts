import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

const LocationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  address: z.string().min(1, 'Address is required').max(500),
  phone: z.string().max(50).optional().or(z.literal('')),
  fax: z.string().max(50).optional().or(z.literal('')),
  hours: z.string().max(500).optional().or(z.literal('')),
  mapsQuery: z.string().max(500).optional().or(z.literal('')),
  orderIndex: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
  published: z.boolean().default(true),
})

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  return null
}

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const locations = await prisma.clinicLocation.findMany({
      orderBy: [{ isPrimary: 'desc' }, { orderIndex: 'asc' }],
    })
    return NextResponse.json({ success: true, data: locations })
  } catch (error) {
    console.error('Failed to list clinic locations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to list clinic locations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const data = LocationSchema.parse(body)

    const location = await prisma.$transaction(async (tx) => {
      if (data.isPrimary) {
        await tx.clinicLocation.updateMany({
          where: { isPrimary: true },
          data: { isPrimary: false },
        })
      }
      return tx.clinicLocation.create({
        data: {
          name: data.name,
          address: data.address,
          phone: data.phone || null,
          fax: data.fax || null,
          hours: data.hours || null,
          mapsQuery: data.mapsQuery || null,
          orderIndex: data.orderIndex,
          isPrimary: data.isPrimary,
          published: data.published,
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
    console.error('Failed to create clinic location:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create clinic location' },
      { status: 500 }
    )
  }
}
