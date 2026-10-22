'use client'

import { useEffect, useState } from 'react'

export interface ClinicLocation {
  id: string
  name: string
  address: string
  phone: string | null
  email: string | null
  fax: string | null
  hours: string | null
  mapsQuery: string | null
  orderIndex: number
  isPrimary: boolean
  published: boolean
}

let cache: { data: ClinicLocation[] | null } = { data: null }

export function useClinicLocations(): {
  locations: ClinicLocation[]
  loading: boolean
} {
  const [locations, setLocations] = useState<ClinicLocation[]>(
    cache.data ?? []
  )
  const [loading, setLoading] = useState(cache.data === null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/locations', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load clinic locations')
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        const data: ClinicLocation[] = json?.data ?? []
        cache = { data }
        setLocations(data)
      })
      .catch((err) => console.error('Failed to fetch clinic locations:', err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { locations, loading }
}

export function primaryLocation(
  locations: ClinicLocation[]
): ClinicLocation | undefined {
  return locations.find((l) => l.isPrimary) ?? locations[0]
}
