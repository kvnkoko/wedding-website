'use client'

import { useState, useEffect } from 'react'
import PhotoCarousel from './PhotoCarousel'

export default function PhotoCarouselSection() {
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/photos')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch photos')
        }
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setPhotos(data)
        } else {
          setPhotos([])
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching photos:', err)
        setError('Failed to load photos')
        setLoading(false)
      })
  }, [])

  if (loading || error) {
    return null
  }

  if (!photos || photos.length === 0) {
    return null
  }

  return (
    <div className="animate-fade-in-up animate-delay-1000">
      <PhotoCarousel photos={photos} />
    </div>
  )
}

