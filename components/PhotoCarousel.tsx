'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface Photo {
  id: string
  url: string
  alt?: string
  order: number
}

interface PhotoCarouselProps {
  photos: Photo[]
}

export default function PhotoCarousel({ photos }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Safely sort photos
  const sortedPhotos = photos && Array.isArray(photos) 
    ? [...photos].sort((a, b) => (a.order || 0) - (b.order || 0))
    : []

  // Show 3 photos on desktop, 2 on tablet, 1 on mobile
  const photosToShow = typeof window !== 'undefined' 
    ? window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1
    : 3

  useEffect(() => {
    if (isAutoPlaying && sortedPhotos.length > photosToShow) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const maxIndex = Math.max(0, sortedPhotos.length - photosToShow)
          return prev >= maxIndex ? 0 : prev + 1
        })
      }, 5000) // Change photos every 5 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoPlaying, sortedPhotos.length, photosToShow])

  // Reset index if photos change
  useEffect(() => {
    const maxIndex = Math.max(0, sortedPhotos.length - photosToShow)
    if (sortedPhotos.length > 0 && currentIndex > maxIndex) {
      setCurrentIndex(0)
    }
  }, [sortedPhotos.length, currentIndex, photosToShow])

  const goToSlide = (index: number) => {
    const maxIndex = Math.max(0, sortedPhotos.length - photosToShow)
    setCurrentIndex(Math.min(index, maxIndex))
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000) // Resume auto-play after 10 seconds
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    const maxIndex = Math.max(0, sortedPhotos.length - photosToShow)

    if (isLeftSwipe && sortedPhotos.length > photosToShow) {
      setCurrentIndex((prev) => prev >= maxIndex ? 0 : prev + 1)
    }
    if (isRightSwipe && sortedPhotos.length > photosToShow) {
      setCurrentIndex((prev) => prev <= 0 ? maxIndex : prev - 1)
    }
  }

  if (sortedPhotos.length === 0) {
    return null
  }

  // Get visible photos
  const visiblePhotos = sortedPhotos.slice(currentIndex, currentIndex + photosToShow)
  // If we're near the end and need to wrap, show some from the beginning
  const needsWrap = currentIndex + photosToShow > sortedPhotos.length
  const wrappedPhotos = needsWrap 
    ? [...visiblePhotos, ...sortedPhotos.slice(0, photosToShow - visiblePhotos.length)]
    : visiblePhotos

  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden bg-charcoal/5">
      {/* Main Carousel Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center gap-4 md:gap-6 lg:gap-8 px-4 md:px-8 lg:px-12"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Photo Slides - Multiple Visible */}
        <div className="relative w-full h-full flex items-center justify-center gap-4 md:gap-6 lg:gap-8">
          {wrappedPhotos.map((photo, displayIndex) => {
            const actualIndex = currentIndex + displayIndex >= sortedPhotos.length
              ? displayIndex - (sortedPhotos.length - currentIndex)
              : currentIndex + displayIndex
            const isVisible = displayIndex < photosToShow

            return (
              <div
                key={photo.id}
                className={`relative transition-all duration-700 ease-in-out ${
                  isVisible
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95'
                }`}
                style={{
                  width: photosToShow === 1 ? '100%' : photosToShow === 2 ? 'calc(50% - 12px)' : 'calc(33.333% - 16px)',
                  height: '100%',
                  maxWidth: photosToShow === 1 ? '100%' : photosToShow === 2 ? '600px' : '500px',
                }}
              >
                <div className="relative w-full h-full rounded-sm overflow-hidden shadow-lg bg-taupe/20">
                  {photo.url && (
                    <Image
                      src={photo.url}
                      alt={photo.alt || `Photo ${actualIndex + 1}`}
                      fill
                      className="object-contain"
                      priority={displayIndex === 0}
                      sizes={photosToShow === 1 ? "100vw" : photosToShow === 2 ? "50vw" : "33vw"}
                      onError={(e) => {
                        console.error('Error loading image:', photo.url)
                        const target = e.target as HTMLImageElement
                        if (target) {
                          target.style.display = 'none'
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation Dots */}
        {sortedPhotos.length > photosToShow && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
            {Array.from({ length: Math.max(1, sortedPhotos.length - photosToShow + 1) }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-3 h-3 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Navigation Arrows */}
        {sortedPhotos.length > photosToShow && (
          <>
            <button
              onClick={() => {
                const maxIndex = Math.max(0, sortedPhotos.length - photosToShow)
                setCurrentIndex((prev) => prev <= 0 ? maxIndex : prev - 1)
                setIsAutoPlaying(false)
                setTimeout(() => setIsAutoPlaying(true), 10000)
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-charcoal p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
              aria-label="Previous photos"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => {
                const maxIndex = Math.max(0, sortedPhotos.length - photosToShow)
                setCurrentIndex((prev) => prev >= maxIndex ? 0 : prev + 1)
                setIsAutoPlaying(false)
                setTimeout(() => setIsAutoPlaying(true), 10000)
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-charcoal p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
              aria-label="Next photos"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Progress Bar */}
        {isAutoPlaying && sortedPhotos.length > photosToShow && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
            <div
              className="h-full bg-white transition-all duration-5000 ease-linear"
              style={{
                width: '100%',
                animation: 'progress 5s linear infinite',
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </section>
  )
}

