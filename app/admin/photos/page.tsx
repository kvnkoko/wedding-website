'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Photo {
  id: string
  url: string
  alt?: string
  order: number
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [newPhotoAlt, setNewPhotoAlt] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/photos')
      if (res.ok) {
        const data = await res.json()
        setPhotos(data.sort((a: Photo, b: Photo) => a.order - b.order))
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const newPhotos = [...photos]
    const draggedPhoto = newPhotos[draggedIndex]

    newPhotos.splice(draggedIndex, 1)
    newPhotos.splice(index, 0, draggedPhoto)

    // Update order values
    const updatedPhotos = newPhotos.map((photo, idx) => ({
      ...photo,
      order: idx,
    }))

    setPhotos(updatedPhotos)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return

    try {
      const updatedPhotos = photos.map((photo, idx) => ({
        id: photo.id,
        order: idx,
      }))

      const res = await fetch('/api/photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: updatedPhotos }),
      })

      if (!res.ok) {
        throw new Error('Failed to update photo order')
      }

      await fetchPhotos()
    } catch (error) {
      console.error('Error updating photo order:', error)
      alert('Error updating photo order. Please try again.')
      await fetchPhotos()
    } finally {
      setDraggedIndex(null)
    }
  }

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPhotoUrl.trim()) {
      alert('Please enter a photo URL')
      return
    }

    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newPhotoUrl.trim(),
          alt: newPhotoAlt.trim() || null,
        }),
      })

      if (res.ok) {
        setNewPhotoUrl('')
        setNewPhotoAlt('')
        setShowAddForm(false)
        await fetchPhotos()
      } else {
        const error = await res.json()
        alert(error.error || 'Error adding photo')
      }
    } catch (error) {
      console.error('Error adding photo:', error)
      alert('Error adding photo. Please try again.')
    }
  }

  const handleDeletePhoto = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return
    }

    try {
      const res = await fetch(`/api/photos?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchPhotos()
      } else {
        alert('Error deleting photo')
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert('Error deleting photo. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-sans text-lg text-charcoal/70">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-5xl text-charcoal">Photo Gallery</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-sage text-white px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-sage/90 transition-all"
        >
          {showAddForm ? 'Cancel' : 'Add Photo'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-sm shadow-sm mb-6">
          <h2 className="font-serif text-2xl text-charcoal mb-4">Add New Photo</h2>
          <form onSubmit={handleAddPhoto} className="space-y-4">
            <div>
              <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                Photo URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                required
                className="w-full px-4 py-2 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
              />
              <p className="mt-1 font-sans text-xs text-charcoal/60">
                Enter the full URL of the image (e.g., from Imgur, Cloudinary, etc.)
              </p>
            </div>
            <div>
              <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                Alt Text (Optional)
              </label>
              <input
                type="text"
                value={newPhotoAlt}
                onChange={(e) => setNewPhotoAlt(e.target.value)}
                placeholder="Description of the photo"
                className="w-full px-4 py-2 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
              />
            </div>
            <button
              type="submit"
              className="bg-charcoal text-white px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-charcoal/90 transition-all"
            >
              Add Photo
            </button>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-sm shadow-sm mb-6">
        <p className="font-sans text-sm text-charcoal/70 mb-4">
          Drag and drop photos to reorder them. The order will be saved automatically.
        </p>
        {photos.length === 0 ? (
          <p className="font-sans text-lg text-charcoal/70 text-center py-12">
            No photos yet. Add your first photo above!
          </p>
        ) : (
          <div className="space-y-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 p-4 border-2 rounded-sm cursor-move transition-all ${
                  draggedIndex === index
                    ? 'border-sage bg-sage/10 opacity-50'
                    : 'border-taupe/30 hover:border-sage/50'
                }`}
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 md:w-24 md:h-24 relative rounded-sm overflow-hidden bg-taupe/20">
                    <Image
                      src={photo.url}
                      alt={photo.alt || `Photo ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium text-charcoal mb-1">
                    Order: {index + 1}
                  </p>
                  <p className="font-sans text-xs text-charcoal/60 truncate">
                    {photo.url}
                  </p>
                  {photo.alt && (
                    <p className="font-sans text-xs text-charcoal/50 mt-1">
                      Alt: {photo.alt}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-charcoal/40">⋮⋮</span>
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="bg-red-100 text-red-600 px-4 py-2 rounded-sm font-sans text-xs hover:bg-red-200 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

