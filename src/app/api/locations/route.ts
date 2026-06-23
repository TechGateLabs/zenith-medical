import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const locations = await prisma.clinicLocation.findMany({
      where: { published: true },
      orderBy: [{ isPrimary: 'desc' }, { orderIndex: 'asc' }],
    })
    return NextResponse.json({ success: true, data: locations })
  } catch (error) {
    console.error('Failed to fetch clinic locations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clinic locations' },
      { status: 500 }
    )
  }
}
