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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    fetchPhotos()
    // Check if user has disabled delete confirmation
    const skipConfirm = localStorage.getItem('skipPhotoDeleteConfirm')
    if (skipConfirm === 'true') {
      setDontShowAgain(true)
    }
  }, [])

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/photos')
      if (res.ok) {
        const data = await res.json()
        console.log('Fetched photos:', data)
        // Transform URLs to use proxy for Vercel Blob Storage URLs
        const photosWithProxy = data.map((photo: Photo) => ({
          ...photo,
          url: photo.url.includes('blob.vercel-storage.com')
            ? `/api/photos/proxy?url=${encodeURIComponent(photo.url)}`
            : photo.url
        }))
        setPhotos(photosWithProxy.sort((a: Photo, b: Photo) => a.order - b.order))
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

    let successful = 0

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
        console.log(`Successfully uploaded ${urls.length} files, now saving to database...`)

        // Add all photos to database - use Promise.allSettled to continue even if some fail
        const addPromises = urls.map(async (url) => {
          try {
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

            return { success: true, data: await res.json() }
          } catch (error: any) {
            console.error(`Error saving photo ${url}:`, error)
            return { success: false, error: error.message, url }
          }
        })

        const results = await Promise.allSettled(addPromises)
        successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
        const failed = results.length - successful

        if (failed > 0) {
          console.warn(`${failed} photos failed to save to database`)
          alert(`Uploaded ${urls.length} photos, but ${failed} failed to save. Check console for details.`)
        } else {
          console.log(`Successfully added ${successful} photos to database`)
        }
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
        successful = 1
      }

      // Reset form
      setNewPhotoUrl('')
      setNewPhotoAlt('')
      setSelectedFiles([])
      setPreviewUrls([])
      
      // Small delay to ensure database has committed
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Refresh photos list
      await fetchPhotos()
      
      // Close form after successful upload
      setShowAddForm(false)
      setUploadMethod('upload')
      
      // Show success message
      if (successful > 0) {
        alert(`Successfully added ${successful} photo${successful > 1 ? 's' : ''}!`)
      }
    } catch (error: any) {
      console.error('Error adding photo:', error)
      alert(error.message || 'Error adding photo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    const skipConfirm = localStorage.getItem('skipPhotoDeleteConfirm')
    if (skipConfirm === 'true') {
      // Skip confirmation and delete directly
      handleDeletePhoto(id)
    } else {
      // Show confirmation dialog
      setPhotoToDelete(id)
      setShowDeleteConfirm(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (dontShowAgain) {
      localStorage.setItem('skipPhotoDeleteConfirm', 'true')
    }
    
    if (photoToDelete) {
      await handleDeletePhoto(photoToDelete)
    }
    
    setShowDeleteConfirm(false)
    setPhotoToDelete(null)
    setDontShowAgain(false)
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
    setPhotoToDelete(null)
    setDontShowAgain(false)
  }

  const handleDeletePhoto = async (id: string) => {
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
        <p className="font-sans text-lg text-charcoal/70 dark:text-dark-text-secondary">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal dark:text-dark-text">Photo Gallery</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-sage text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-sage/90 transition-all w-full sm:w-auto min-h-[44px]"
        >
          {showAddForm ? 'Cancel' : 'Add Photo'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-dark-card p-4 sm:p-6 rounded-sm shadow-sm mb-6 border border-taupe/20 dark:border-dark-border">
          <h2 className="font-serif text-xl sm:text-2xl text-charcoal dark:text-dark-text mb-4">Add New Photo</h2>
          
          {/* Upload Method Toggle */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6 border-b border-taupe/30 dark:border-dark-border pb-4">
            <button
              type="button"
              onClick={() => {
                setUploadMethod('upload')
                setNewPhotoUrl('')
                setSelectedFiles([])
                setPreviewUrls([])
              }}
              className={`px-4 py-2.5 rounded-sm font-sans text-sm transition-all min-h-[44px] ${
                uploadMethod === 'upload'
                  ? 'bg-sage text-white'
                  : 'bg-taupe/20 dark:bg-dark-border text-charcoal dark:text-dark-text hover:bg-taupe/30 dark:hover:bg-dark-border/80'
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
              className={`px-4 py-2.5 rounded-sm font-sans text-sm transition-all min-h-[44px] ${
                uploadMethod === 'url'
                  ? 'bg-sage text-white'
                  : 'bg-taupe/20 dark:bg-dark-border text-charcoal dark:text-dark-text hover:bg-taupe/30 dark:hover:bg-dark-border/80'
              }`}
            >
              Enter URL
            </button>
          </div>

          <form onSubmit={handleUploadPhoto} className="space-y-4">
            {uploadMethod === 'upload' ? (
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                  Select Photos <span className="text-red-500">*</span>
                </label>
                <div
                  onDragOver={handleFileDragOver}
                  onDragLeave={handleFileDragLeave}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-sm p-6 text-center transition-colors ${
                    isDragging
                      ? 'border-sage bg-sage/10 dark:bg-sage/20'
                      : 'border-taupe/30 dark:border-dark-border hover:border-sage/50'
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-taupe/20 dark:bg-dark-surface">
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
                              <p className="mt-1 font-sans text-xs text-charcoal/70 dark:text-dark-text-secondary truncate">
                                {file.name}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <label
                            htmlFor="file-upload"
                            className="bg-sage text-white px-4 py-2 rounded-sm font-sans text-sm hover:bg-sage/90 transition-all cursor-pointer text-center"
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
                            className="bg-taupe/20 dark:bg-dark-border text-charcoal dark:text-dark-text px-4 py-2 rounded-sm font-sans text-sm hover:bg-taupe/30 dark:hover:bg-dark-border/80 transition-all"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <svg
                          className="mx-auto h-12 w-12 text-charcoal/60 dark:text-dark-text-secondary"
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
                        <p className="font-sans text-sm text-charcoal/70 dark:text-dark-text-secondary">
                          Click to upload or drag and drop
                        </p>
                        <p className="font-sans text-xs text-charcoal/70 dark:text-dark-text-secondary">
                          PNG, JPG, GIF up to 10MB each (multiple files supported)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                  Photo URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  required={uploadMethod === 'url'}
                  className="w-full px-4 py-2 border border-taupe/30 dark:border-dark-border rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
                />
                <p className="mt-1 font-sans text-xs text-charcoal/70 dark:text-dark-text-secondary">
                  Enter the full URL of the image
                </p>
              </div>
            )}

            <div>
              <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                Alt Text (Optional)
              </label>
              <input
                type="text"
                value={newPhotoAlt}
                onChange={(e) => setNewPhotoAlt(e.target.value)}
                placeholder="Description of the photo"
                className="w-full px-4 py-2 border border-taupe/30 dark:border-dark-border rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              disabled={uploading || (uploadMethod === 'upload' && selectedFiles.length === 0)}
              className="bg-charcoal dark:bg-dark-text dark:text-dark-bg text-white px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-charcoal/90 dark:hover:bg-dark-text/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-h-[44px]"
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

      <div className="bg-white dark:bg-dark-card p-6 rounded-sm shadow-sm mb-6 border border-taupe/20 dark:border-dark-border">
        <p className="font-sans text-sm text-charcoal/70 dark:text-dark-text-secondary mb-4">
          Drag and drop photos to reorder them. The order will be saved automatically.
        </p>
        {photos.length === 0 ? (
          <p className="font-sans text-lg text-charcoal/70 dark:text-dark-text-secondary text-center py-12">
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
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 rounded-sm cursor-move transition-all ${
                  draggedIndex === index
                    ? 'border-sage bg-sage/10 dark:bg-sage/20 opacity-50'
                    : 'border-taupe/30 dark:border-dark-border hover:border-sage/50'
                }`}
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 relative rounded-sm overflow-hidden bg-taupe/20 dark:bg-dark-surface">
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
                  <p className="font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-1">
                    Order: {index + 1}
                  </p>
                  <p className="font-sans text-xs text-charcoal/70 dark:text-dark-text-secondary truncate">
                    {photo.url}
                  </p>
                  {photo.alt && (
                    <p className="font-sans text-xs text-charcoal/70 dark:text-dark-text-secondary mt-1">
                      Alt: {photo.alt}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-charcoal/60 dark:text-dark-text-secondary hidden sm:inline">⋮⋮</span>
                  <button
                    onClick={() => handleDeleteClick(photo.id)}
                    className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-sm font-sans text-xs hover:bg-red-200 dark:hover:bg-red-900/50 transition-all border border-red-200 dark:border-red-800 w-full sm:w-auto min-h-[44px]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-sm shadow-lg max-w-md w-full p-4 sm:p-6 border border-taupe/20 dark:border-dark-border">
            <h3 className="font-serif text-xl sm:text-2xl text-charcoal dark:text-dark-text mb-4">
              Delete Photo?
            </h3>
            <p className="font-sans text-sm text-charcoal/70 dark:text-dark-text-secondary mb-6">
              Are you sure you want to delete this photo? This action cannot be undone.
            </p>
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 text-sage border-taupe/30 dark:border-dark-border rounded focus:ring-sage dark:bg-dark-surface min-w-[44px] min-h-[44px]"
                />
                <span className="font-sans text-sm text-charcoal dark:text-dark-text">
                  Don't show this again
                </span>
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="bg-taupe/20 dark:bg-dark-border text-charcoal dark:text-dark-text px-6 py-2.5 rounded-sm font-sans text-sm hover:bg-taupe/30 dark:hover:bg-dark-border/80 transition-all min-h-[44px] w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 dark:bg-red-700 text-white px-6 py-2.5 rounded-sm font-sans text-sm hover:bg-red-700 dark:hover:bg-red-800 transition-all min-h-[44px] w-full sm:w-auto"
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
