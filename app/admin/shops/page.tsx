'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import Link from 'next/link'
import { Shop } from '@/lib/types'

export default function AdminShopsPage() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    if (!authLoading) {
      if (!profile) {
        router.push('/admin/auth/login')
      } else if (profile.role !== 'admin') {
        router.push('/')
      }
    }
  }, [profile, authLoading, router])

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchShops()
    }
  }, [profile])

  const fetchShops = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/shops')
      const result = await response.json()

      if (result.success) {
        setShops(result.data)
      } else {
        setError(result.error || 'Failed to fetch shops')
      }
    } catch (err) {
      setError('Failed to fetch shops')
      console.error('Error fetching shops:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (shopId: string) => {
    try {
      const response = await fetch(`/api/admin/shops/${shopId}`, {
        method: 'DELETE'
      })
      const result = await response.json()

      if (result.success) {
        setShops(shops.filter(shop => shop.id !== shopId))
        setDeleteConfirm(null)
      } else {
        alert(result.error || 'Failed to delete shop')
      }
    } catch (err) {
      alert('Failed to delete shop')
      console.error('Error deleting shop:', err)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-100">
        <div className="text-[#274b76]">Loading...</div>
      </div>
    )
  }

  if (!profile || profile.role !== 'admin') {
    return null
  }

  // Filter shops based on search query
  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredShops.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentShops = filteredShops.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-[#1e3a5f] to-[#274b76] bg-clip-text text-transparent">
                Manage Shops
              </h1>
              <p className="text-[#274b76]/70 mt-2">
                Manage all motorcycle repair shops
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin"
                className="px-6 py-3 text-[#274b76] bg-white hover:bg-blue-50 border-2 border-[#274b76] rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Back to Dashboard
              </Link>
              <Link
                href="/admin/shops/add"
                className="px-6 py-3 bg-linear-to-r from-[#1e3a5f] to-[#274b76] text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Add New Shop
              </Link>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search shops by name or description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full px-4 py-3 border-2 border-[#274b76]/20 rounded-xl focus:outline-none focus:border-[#274b76] transition-colors"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {/* Shops Table */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-[#274b76]/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-[#1e3a5f] to-[#274b76] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Mechanics</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Photos</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#274b76]/10">
                {currentShops.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#274b76]/70">
                      {searchQuery ? 'No shops found matching your search' : 'No shops available'}
                    </td>
                  </tr>
                ) : (
                  currentShops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 text-[#274b76] font-medium">
                        {shop.name}
                      </td>
                      <td className="px-6 py-4 text-[#274b76]/70 text-sm max-w-xs truncate">
                        {shop.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-[#274b76]/70 text-sm">
                        {shop.latitude.toFixed(4)}, {shop.longitude.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 text-[#274b76]/70 text-sm">
                        {shop.mechanics?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-[#274b76]/70 text-sm">
                        {shop.photos?.length || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <Link
                            href={`/admin/shops/edit/${shop.id}`}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(shop.id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-transparent border-t border-[#274b76]/10">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#274b76]/70">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredShops.length)} of {filteredShops.length} shops
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border-2 border-[#274b76] text-[#274b76] rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-[#274b76] font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border-2 border-[#274b76] text-[#274b76] rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-[#274b76] mb-4">
              Confirm Delete
            </h2>
            <p className="text-[#274b76]/70 mb-6">
              Are you sure you want to delete this shop? This action cannot be undone and will also delete all associated mechanics and reviews.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-[#274b76] rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
