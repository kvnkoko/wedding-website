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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/photos')
      if (res.ok) {
        const data = await res.json()
        console.log('Fetched photos:', data)
        setPhotos(data.sort((a: Photo, b: Photo) => a.order - b.order))
      } else {
        console.error('Failed to fetch photos:', res.status, res.statusText)
        const errorData = await res.json().catch(() => ({}))
        console.error('Error details:', errorData)
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

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const validFiles: File[] = []
    const urls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file. Skipping.`)
        continue
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large (max 10MB). Skipping.`)
        continue
      }
      validFiles.push(file)
      urls.push(URL.createObjectURL(file))
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles])
      setPreviewUrls(prev => [...prev, ...urls])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }

  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleFileDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      if (uploadMethod === 'upload') {
        if (selectedFiles.length === 0) {
          alert('Please select at least one file to upload')
          setUploading(false)
          return
        }

        // Upload all files
        const uploadPromises = selectedFiles.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)

          const uploadRes = await fetch('/api/photos/upload', {
            method: 'POST',
            body: formData,
          })

          if (!uploadRes.ok) {
            const error = await uploadRes.json()
            if (error.needsBlobSetup) {
              throw new Error('File upload requires Vercel Blob Storage setup. Please use the URL method or configure Blob Storage in Vercel.')
            }
            throw new Error(error.error || `Failed to upload ${file.name}`)
          }

          const uploadData = await uploadRes.json()
          return uploadData.url
        })

        const urls = await Promise.all(uploadPromises)

        // Add all photos to database
        const addPromises = urls.map(async (url) => {
          const res = await fetch('/api/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url,
              alt: newPhotoAlt.trim() || null,
            }),
          })

          if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || `Failed to save photo: ${url}`)
          }

          return res.json()
        })

        const results = await Promise.all(addPromises)
        console.log(`Successfully added ${results.length} photos to database`)
      } else {
        if (!newPhotoUrl.trim()) {
          alert('Please enter a photo URL')
          setUploading(false)
          return
        }

        const res = await fetch('/api/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: newPhotoUrl.trim(),
            alt: newPhotoAlt.trim() || null,
          }),
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || 'Error adding photo')
        }
      }

      // Reset form
      setNewPhotoUrl('')
      setNewPhotoAlt('')
      setSelectedFiles([])
      setPreviewUrls([])
      setShowAddForm(false)
      setUploadMethod('upload')
      await fetchPhotos()
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
                setSelectedFiles([])
                setPreviewUrls([])
              }}
              className={`px-4 py-2 rounded-sm font-sans text-sm transition-all ${
                uploadMethod === 'upload'
                  ? 'bg-sage text-white'
                  : 'bg-taupe/20 text-charcoal hover:bg-taupe/30'
              }`}
            >
              Upload Files
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadMethod('url')
                setSelectedFiles([])
                setPreviewUrls([])
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
                  Select Photos <span className="text-red-500">*</span>
                </label>
                <div
                  onDragOver={handleFileDragOver}
                  onDragLeave={handleFileDragLeave}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-sm p-6 text-center transition-colors ${
                    isDragging
                      ? 'border-sage bg-sage/10'
                      : 'border-taupe/30 hover:border-sage/50'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer block"
                  >
                    {selectedFiles.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-taupe/20">
                                <Image
                                  src={previewUrls[index]}
                                  alt={file.name}
                                  fill
                                  className="object-cover"
                                  sizes="200px"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  removeFile(index)
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                              >
                                ×
                              </button>
                              <p className="mt-1 font-sans text-xs text-charcoal/70 truncate">
                                {file.name}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 justify-center">
                          <label
                            htmlFor="file-upload"
                            className="bg-sage text-white px-4 py-2 rounded-sm font-sans text-sm hover:bg-sage/90 transition-all cursor-pointer"
                          >
                            Add More Photos
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFiles([])
                              setPreviewUrls([])
                              const input = document.getElementById('file-upload') as HTMLInputElement
                              if (input) input.value = ''
                            }}
                            className="bg-taupe/20 text-charcoal px-4 py-2 rounded-sm font-sans text-sm hover:bg-taupe/30 transition-all"
                          >
                            Clear All
                          </button>
                        </div>
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
                          PNG, JPG, GIF up to 10MB each (multiple files supported)
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
              disabled={uploading || (uploadMethod === 'upload' && selectedFiles.length === 0)}
              className="bg-charcoal text-white px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-charcoal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading 
                ? `Uploading ${selectedFiles.length > 0 ? `${selectedFiles.length} ` : ''}photo${selectedFiles.length > 1 ? 's' : ''}...` 
                : uploadMethod === 'upload' 
                  ? `Add ${selectedFiles.length > 0 ? `${selectedFiles.length} ` : ''}Photo${selectedFiles.length > 1 ? 's' : ''}`
                  : 'Add Photo'}
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
