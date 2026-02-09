'use client'

import { useState, useEffect } from 'react'
import PhotoCarousel from './PhotoCarousel'

export default function PhotoCarouselSection() {
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch('/api/photos')
        
        if (!res.ok) {
          const errorText = await res.text()
          console.error('Failed to fetch photos:', res.status, res.statusText, errorText)
          throw new Error(`Failed to fetch photos: ${res.status} ${res.statusText}`)
        }
        
        const data = await res.json()
        console.log('Fetched photos data:', data)
        
        if (Array.isArray(data)) {
          // Filter out any photos without a valid URL and transform URLs to use proxy
          const validPhotos = data
            .filter((photo: any) => photo && photo.url && photo.id)
            .map((photo: any) => ({
              ...photo,
              // Use proxy route with optimization params for faster loading
              url: photo.url.includes('blob.vercel-storage.com')
                ? `/api/photos/proxy?url=${encodeURIComponent(photo.url)}&w=1200&q=85`
                : photo.url
            }))
          console.log('Valid photos:', validPhotos.length, 'out of', data.length)
          setPhotos(validPhotos)
        } else {
          console.warn('Photos data is not an array:', data)
          setPhotos([])
        }
        setLoading(false)
      } catch (err) {
        console.error('Error fetching photos:', err)
        setError(err instanceof Error ? err.message : 'Failed to load photos')
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  // Show nothing while loading or on error (silent fail for better UX)
  if (loading) {
    return null
  }

  if (error) {
    console.error('PhotoCarouselSection error:', error)
    return null
  }

  if (!photos || photos.length === 0) {
    console.log('No photos to display')
    return null
  }

  return (
    <div className="animate-fade-in-up animate-delay-1000">
      <PhotoCarousel photos={photos} />
    </div>
  )
}

