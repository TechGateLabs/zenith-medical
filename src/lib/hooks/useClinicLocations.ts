'use client'

import { useEffect, useState } from 'react'

export interface ClinicLocation {
  id: string
  name: string
  address: string
  phone: string | null
  fax: string | null
  hours: string | null
  mapsQuery: string | null
  orderIndex: number
  isPrimary: boolean
  published: boolean
}

let cache: { data: ClinicLocation[] | null; expiry: number } = {
  data: null,
  expiry: 0,
}
const TTL = 5 * 60 * 1000

export function useClinicLocations(): {
  locations: ClinicLocation[]
  loading: boolean
} {
  const [locations, setLocations] = useState<ClinicLocation[]>(
    cache.data ?? []
  )
  const [loading, setLoading] = useState(cache.data === null)

  useEffect(() => {
    const now = Date.now()
    if (cache.data && now < cache.expiry) {
      setLocations(cache.data)
      setLoading(false)
      return
    }

    let cancelled = false
    fetch('/api/locations')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        const data: ClinicLocation[] = json?.data ?? []
        cache = { data, expiry: Date.now() + TTL }
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
