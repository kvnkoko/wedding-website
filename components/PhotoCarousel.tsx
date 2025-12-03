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

  const sortedPhotos = [...photos].sort((a, b) => a.order - b.order)

  useEffect(() => {
    if (isAutoPlaying && sortedPhotos.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % sortedPhotos.length)
      }, 5000) // Change photo every 5 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoPlaying, sortedPhotos.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
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

    if (isLeftSwipe && sortedPhotos.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % sortedPhotos.length)
    }
    if (isRightSwipe && sortedPhotos.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + sortedPhotos.length) % sortedPhotos.length)
    }
  }

  if (sortedPhotos.length === 0) {
    return null
  }

  return (
    <section className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden bg-charcoal/5">
      {/* Main Carousel Container */}
      <div 
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Photo Slides with Beautiful Transitions */}
        <div className="relative w-full h-full">
          {sortedPhotos.map((photo, index) => {
            const isActive = index === currentIndex
            const isPrev = index === (currentIndex - 1 + sortedPhotos.length) % sortedPhotos.length
            const isNext = index === (currentIndex + 1) % sortedPhotos.length

            return (
              <div
                key={photo.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  isActive
                    ? 'opacity-100 scale-100 z-10'
                    : isPrev || isNext
                    ? 'opacity-30 scale-95 z-5'
                    : 'opacity-0 scale-90 z-0'
                }`}
                style={{
                  transform: isActive
                    ? 'translateX(0) scale(1)'
                    : isPrev
                    ? 'translateX(-20%) scale(0.95)'
                    : isNext
                    ? 'translateX(20%) scale(0.95)'
                    : 'translateX(0) scale(0.9)',
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={photo.url}
                    alt={photo.alt || `Photo ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={isActive}
                    sizes="100vw"
                  />
                  {/* Elegant Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation Dots */}
        {sortedPhotos.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
            {sortedPhotos.map((_, index) => (
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
        {sortedPhotos.length > 1 && (
          <>
            <button
              onClick={() => {
                setCurrentIndex((prev) => (prev - 1 + sortedPhotos.length) % sortedPhotos.length)
                setIsAutoPlaying(false)
                setTimeout(() => setIsAutoPlaying(true), 10000)
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-charcoal p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
              aria-label="Previous photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => {
                setCurrentIndex((prev) => (prev + 1) % sortedPhotos.length)
                setIsAutoPlaying(false)
                setTimeout(() => setIsAutoPlaying(true), 10000)
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-charcoal p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
              aria-label="Next photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Progress Bar */}
        {isAutoPlaying && sortedPhotos.length > 1 && (
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

