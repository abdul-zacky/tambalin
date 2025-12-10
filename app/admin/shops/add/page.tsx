'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import Link from 'next/link'
import Navigation from '@/components/shared/Navigation'

interface MechanicInput {
  name: string
  specialty: string
}

export default function AddShopPage() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [mechanics, setMechanics] = useState<MechanicInput[]>([{ name: '', specialty: '' }])
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreview, setPhotoPreview] = useState<string[]>([])

  useEffect(() => {
    if (!authLoading) {
      if (!profile) {
        router.push('/admin/auth/login')
      } else if (profile.role !== 'admin') {
        router.push('/')
      }
    }
  }, [profile, authLoading, router])

  const handleAddMechanic = () => {
    setMechanics([...mechanics, { name: '', specialty: '' }])
  }

  const handleRemoveMechanic = (index: number) => {
    setMechanics(mechanics.filter((_, i) => i !== index))
  }

  const handleMechanicChange = (index: number, field: keyof MechanicInput, value: string) => {
    const updated = [...mechanics]
    updated[index][field] = value
    setMechanics(updated)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPhotos(files)

    // Generate previews
    const previews = files.map(file => URL.createObjectURL(file))
    setPhotoPreview(previews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!name || !latitude || !longitude || !whatsappNumber) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      // Upload photos first if any
      let photoUrls: string[] = []
      if (photos.length > 0) {
        const formData = new FormData()
        photos.forEach(photo => formData.append('files', photo))

        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData
        })
        const uploadResult = await uploadResponse.json()

        if (uploadResult.success) {
          photoUrls = uploadResult.data.urls
        } else {
          setError(uploadResult.error || 'Failed to upload photos')
          setLoading(false)
          return
        }
      }

      // Filter out empty mechanics
      const validMechanics = mechanics.filter(m => m.name.trim() !== '')

      // Create shop
      const response = await fetch('/api/admin/shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          whatsapp_number: whatsappNumber,
          photo_urls: photoUrls,
          mechanics: validMechanics
        })
      })

      const result = await response.json()

      if (result.success) {
        router.push('/admin/shops')
      } else {
        setError(result.error || 'Failed to create shop')
      }
    } catch (err) {
      setError('Failed to create shop')
      console.error('Error creating shop:', err)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-100">
        <div className="text-[#274b76]">Loading...</div>
      </div>
    )
  }

  if (!profile || profile.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100">
      <Navigation />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-[#1e3a5f] to-[#274b76] bg-clip-text text-transparent">
                Add New Shop
              </h1>
              <p className="text-[#274b76]/70 mt-2">
                Create a new motorcycle repair shop
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
                href="/admin/shops"
                className="px-6 py-3 text-[#274b76] bg-white hover:bg-blue-50 border-2 border-[#274b76] rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View All Shops
              </Link>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-[#274b76]/10">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          {/* Shop Name */}
          <div className="mb-6">
            <label className="block text-[#274b76] font-semibold mb-2">
              Shop Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#274b76]/20 rounded-xl focus:outline-none focus:border-[#274b76] transition-colors"
              placeholder="Enter shop name"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-[#274b76] font-semibold mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border-2 border-[#274b76]/20 rounded-xl focus:outline-none focus:border-[#274b76] transition-colors resize-none"
              placeholder="Enter shop description"
            />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[#274b76] font-semibold mb-2">
                Latitude <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#274b76]/20 rounded-xl focus:outline-none focus:border-[#274b76] transition-colors"
                placeholder="-6.2088"
                required
              />
            </div>
            <div>
              <label className="block text-[#274b76] font-semibold mb-2">
                Longitude <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#274b76]/20 rounded-xl focus:outline-none focus:border-[#274b76] transition-colors"
                placeholder="106.8456"
                required
              />
            </div>
          </div>

          {/* WhatsApp Number */}
          <div className="mb-6">
            <label className="block text-[#274b76] font-semibold mb-2">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#274b76]/20 rounded-xl focus:outline-none focus:border-[#274b76] transition-colors"
              placeholder="6281234567890"
              required
            />
          </div>

          {/* Photos */}
          <div className="mb-6">
            <label className="block text-[#274b76] font-semibold mb-2">
              Photos
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="w-full px-4 py-3 border-2 border-[#274b76]/20 rounded-xl focus:outline-none focus:border-[#274b76] transition-colors"
            />
            {photoPreview.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {photoPreview.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-[#274b76]/20"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mechanics */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[#274b76] font-semibold">
                Mechanics
              </label>
              <button
                type="button"
                onClick={handleAddMechanic}
                className="px-4 py-2 bg-[#274b76] text-white rounded-lg text-sm font-medium hover:bg-[#1e3a5f] transition-colors"
              >
                Add Mechanic
              </button>
            </div>
            <div className="space-y-4">
              {mechanics.map((mechanic, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={mechanic.name}
                      onChange={(e) => handleMechanicChange(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#274b76]/20 rounded-xl focus:outline-none focus:border-[#274b76] transition-colors"
                      placeholder="Mechanic name"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={mechanic.specialty}
                      onChange={(e) => handleMechanicChange(index, 'specialty', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#274b76]/20 rounded-xl focus:outline-none focus:border-[#274b76] transition-colors"
                      placeholder="Specialty (optional)"
                    />
                  </div>
                  {mechanics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMechanic(index)}
                      className="px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Link
              href="/admin/shops"
              className="flex-1 px-6 py-3 text-center bg-gray-200 hover:bg-gray-300 text-[#274b76] rounded-xl font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-linear-to-r from-[#1e3a5f] to-[#274b76] text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Shop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
