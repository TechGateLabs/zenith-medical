import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { LocationSchema } from '@/lib/locations/validation'
import { requireLocationAdmin } from '@/lib/locations/authorization'

export async function GET() {
  const unauthorized = await requireLocationAdmin()
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
  const unauthorized = await requireLocationAdmin()
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
          email: data.email || null,
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
