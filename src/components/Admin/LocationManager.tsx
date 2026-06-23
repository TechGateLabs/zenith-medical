'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  MapPin,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../UI/Modal'
import { useApiAuth } from '@/lib/auth/use-api-auth'
import { TableSkeleton } from '@/components/UI/SkeletonLoader'

interface ClinicLocation {
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
  createdAt: string
  updatedAt: string
}

interface LocationFormData {
  name: string
  address: string
  phone: string
  fax: string
  hours: string
  mapsQuery: string
  orderIndex: number
  isPrimary: boolean
  published: boolean
}

const emptyForm: LocationFormData = {
  name: '',
  address: '',
  phone: '',
  fax: '',
  hours: '',
  mapsQuery: '',
  orderIndex: 0,
  isPrimary: false,
  published: true,
}

export default function LocationManager() {
  const [locations, setLocations] = useState<ClinicLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<LocationFormData>(emptyForm)
  const { handleApiError } = useApiAuth()

  const apiCall = useCallback(
    async (
      url: string,
      method: 'GET' | 'POST' | 'PUT' | 'DELETE',
      body?: unknown
    ) => {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(errorData.error || `HTTP ${response.status}`)
        if (handleApiError(error, response)) throw error
        throw error
      }
      return response.json()
    },
    [handleApiError]
  )

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiCall('/api/admin/content/locations', 'GET')
      if (response.success) setLocations(response.data)
    } catch (error) {
      console.error('Failed to fetch clinic locations:', error)
      toast.error('Failed to fetch clinic locations')
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  const openCreate = () => {
    setEditingId(null)
    setFormData({
      ...emptyForm,
      orderIndex: locations.length,
      isPrimary: locations.length === 0,
    })
    setShowModal(true)
  }

  const openEdit = (location: ClinicLocation) => {
    setEditingId(location.id)
    setFormData({
      name: location.name,
      address: location.address,
      phone: location.phone || '',
      fax: location.fax || '',
      hours: location.hours || '',
      mapsQuery: location.mapsQuery || '',
      orderIndex: location.orderIndex,
      isPrimary: location.isPrimary,
      published: location.published,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        const response = await apiCall(
          `/api/admin/content/locations/${editingId}`,
          'PUT',
          formData
        )
        if (response.success) {
          toast.success('Clinic location updated')
          setShowModal(false)
          fetchLocations()
        }
      } else {
        const response = await apiCall(
          '/api/admin/content/locations',
          'POST',
          formData
        )
        if (response.success) {
          toast.success('Clinic location created')
          setShowModal(false)
          fetchLocations()
        }
      }
    } catch (error) {
      console.error('Failed to save clinic location:', error)
      toast.error('Failed to save clinic location')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this clinic location? This cannot be undone.')) return
    try {
      const response = await apiCall(
        `/api/admin/content/locations/${id}`,
        'DELETE'
      )
      if (response.success) {
        toast.success('Clinic location deleted')
        fetchLocations()
      }
    } catch (error) {
      console.error('Failed to delete clinic location:', error)
      toast.error('Failed to delete clinic location')
    }
  }

  const handleTogglePublished = async (
    id: string,
    currentPublished: boolean
  ) => {
    try {
      await apiCall(`/api/admin/content/locations/${id}`, 'PUT', {
        published: !currentPublished,
      })
      toast.success(currentPublished ? 'Unpublished' : 'Published')
      fetchLocations()
    } catch (error) {
      console.error('Failed to toggle published:', error)
      toast.error('Failed to update status')
    }
  }

  const handleMakePrimary = async (id: string) => {
    try {
      await apiCall(`/api/admin/content/locations/${id}`, 'PUT', {
        isPrimary: true,
      })
      toast.success('Marked as primary location')
      fetchLocations()
    } catch (error) {
      console.error('Failed to set primary:', error)
      toast.error('Failed to set primary')
    }
  }

  if (loading) return <TableSkeleton rows={4} columns={5} />

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinic Locations</h1>
          <p className="text-gray-600">
            Manage all clinic locations shown on the website. The location marked
            as primary appears in the footer and as the default contact address.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLocations}
            className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            title="Refresh"
          >
            <Loader2 className="w-4 h-4" />
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {loc.name}
                          </span>
                          {loc.isPrimary && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3" />
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{loc.address}</div>
                        {loc.hours && (
                          <div className="text-xs text-gray-500 mt-1">
                            {loc.hours}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {loc.phone && <div>Tel: {loc.phone}</div>}
                    {loc.fax && <div>Fax: {loc.fax}</div>}
                    {!loc.phone && !loc.fax && (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {loc.orderIndex}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        loc.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {loc.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {!loc.isPrimary && (
                        <button
                          onClick={() => handleMakePrimary(loc.id)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Mark as primary"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleTogglePublished(loc.id, loc.published)
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          loc.published
                            ? 'text-yellow-600 hover:bg-yellow-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={loc.published ? 'Unpublish' : 'Publish'}
                      >
                        {loc.published ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(loc)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {locations.length === 0 && (
          <div className="text-center py-12 px-6">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No clinic locations yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add your first clinic location to begin showing it on the website.
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Clinic Location' : 'Add Clinic Location'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Main Clinic — Ogilvie Road"
            />
            <p className="text-xs text-gray-500 mt-1">
              A short label patients will see (e.g., the branch name).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Unit 216, 1980 Ogilvie Road, Gloucester, Ottawa, K1J 9L3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="613-212-7433"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fax Number
              </label>
              <input
                type="text"
                value={formData.fax}
                onChange={(e) =>
                  setFormData({ ...formData, fax: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="613-212-1234"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Hours
            </label>
            <textarea
              value={formData.hours}
              onChange={(e) =>
                setFormData({ ...formData, hours: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mon-Fri 8AM-6PM, Sat 9AM-2PM"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Maps Search (optional)
            </label>
            <input
              type="text"
              value={formData.mapsQuery}
              onChange={(e) =>
                setFormData({ ...formData, mapsQuery: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Leave blank to use the address above"
            />
            <p className="text-xs text-gray-500 mt-1">
              Override the address used for the embedded map. Useful if the map
              search needs a different format than the displayed address.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                min={0}
                value={formData.orderIndex}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    orderIndex: parseInt(e.target.value || '0', 10),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first.
              </p>
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={(e) =>
                    setFormData({ ...formData, isPrimary: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Primary location
                </span>
              </label>
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Published</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {editingId ? 'Update Location' : 'Create Location'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
