'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AdminRole } from '@prisma/client'
import LocationManager from '@/components/Admin/LocationManager'
import { TableSkeleton } from '@/components/UI/SkeletonLoader'

export default function ClinicLocationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/admin/login')
      return
    }

    if (
      session.user.role !== AdminRole.ADMIN &&
      session.user.role !== AdminRole.SUPER_ADMIN
    ) {
      router.push('/admin/dashboard')
      return
    }

    setLoading(false)
  }, [session, status, router])

  if (loading) {
    return <TableSkeleton rows={4} columns={5} />
  }

  return <LocationManager />
}
