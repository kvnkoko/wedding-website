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
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'url'>('upload')
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let photoUrl = ''

      if (uploadMethod === 'upload') {
        if (!selectedFile) {
          alert('Please select a file to upload')
          setUploading(false)
          return
        }

        // Upload file
        const formData = new FormData()
        formData.append('file', selectedFile)

        const uploadRes = await fetch('/api/photos/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          const error = await uploadRes.json()
          throw new Error(error.error || 'Failed to upload file')
        }

        const uploadData = await uploadRes.json()
        photoUrl = uploadData.url
      } else {
        if (!newPhotoUrl.trim()) {
          alert('Please enter a photo URL')
          setUploading(false)
          return
        }
        photoUrl = newPhotoUrl.trim()
      }

      // Add photo to database
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: photoUrl,
          alt: newPhotoAlt.trim() || null,
        }),
      })

      if (res.ok) {
        // Reset form
        setNewPhotoUrl('')
        setNewPhotoAlt('')
        setSelectedFile(null)
        setPreviewUrl(null)
        setShowAddForm(false)
        setUploadMethod('upload')
        await fetchPhotos()
      } else {
        const error = await res.json()
        alert(error.error || 'Error adding photo')
      }
    } catch (error: any) {
      console.error('Error adding photo:', error)
      alert(error.message || 'Error adding photo. Please try again.')
    } finally {
      setUploading(false)
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
          
          {/* Upload Method Toggle */}
          <div className="flex gap-4 mb-6 border-b border-taupe/30 pb-4">
            <button
              type="button"
              onClick={() => {
                setUploadMethod('upload')
                setNewPhotoUrl('')
                setSelectedFile(null)
                setPreviewUrl(null)
              }}
              className={`px-4 py-2 rounded-sm font-sans text-sm transition-all ${
                uploadMethod === 'upload'
                  ? 'bg-sage text-white'
                  : 'bg-taupe/20 text-charcoal hover:bg-taupe/30'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadMethod('url')
                setSelectedFile(null)
                setPreviewUrl(null)
              }}
              className={`px-4 py-2 rounded-sm font-sans text-sm transition-all ${
                uploadMethod === 'url'
                  ? 'bg-sage text-white'
                  : 'bg-taupe/20 text-charcoal hover:bg-taupe/30'
              }`}
            >
              Enter URL
            </button>
          </div>

          <form onSubmit={handleUploadPhoto} className="space-y-4">
            {uploadMethod === 'upload' ? (
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                  Select Photo <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-taupe/30 rounded-sm p-6 text-center hover:border-sage/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    required={uploadMethod === 'upload'}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer block"
                  >
                    {previewUrl ? (
                      <div className="space-y-2">
                        <div className="relative w-full max-w-xs mx-auto h-48 rounded-sm overflow-hidden bg-taupe/20">
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            fill
                            className="object-contain"
                            sizes="400px"
                          />
                        </div>
                        <p className="font-sans text-sm text-charcoal/70">
                          {selectedFile?.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null)
                            setPreviewUrl(null)
                            const input = document.getElementById('file-upload') as HTMLInputElement
                            if (input) input.value = ''
                          }}
                          className="text-sm text-charcoal/60 hover:text-charcoal"
                        >
                          Change photo
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <svg
                          className="mx-auto h-12 w-12 text-charcoal/40"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="font-sans text-sm text-charcoal/70">
                          Click to upload or drag and drop
                        </p>
                        <p className="font-sans text-xs text-charcoal/50">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                  Photo URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  required={uploadMethod === 'url'}
                  className="w-full px-4 py-2 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
                />
                <p className="mt-1 font-sans text-xs text-charcoal/60">
                  Enter the full URL of the image
                </p>
              </div>
            )}

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
              disabled={uploading}
              className="bg-charcoal text-white px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-charcoal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Add Photo'}
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

