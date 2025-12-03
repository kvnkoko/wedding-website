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
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [imageAspectRatios, setImageAspectRatios] = useState<Map<string, number>>(new Map())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Safely sort photos
  const sortedPhotos = photos && Array.isArray(photos) 
    ? [...photos].sort((a, b) => (a.order || 0) - (b.order || 0))
    : []

  const [photosToShow, setPhotosToShow] = useState(3)

  useEffect(() => {
    const updatePhotosToShow = () => {
      if (typeof window !== 'undefined') {
        setPhotosToShow(window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1)
      }
    }
    
    updatePhotosToShow()
    window.addEventListener('resize', updatePhotosToShow)
    return () => window.removeEventListener('resize', updatePhotosToShow)
  }, [])

  // Preload upcoming photos
  useEffect(() => {
    const preloadImages = () => {
      const maxIndex = Math.max(0, sortedPhotos.length - photosToShow)
      const nextIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1
      const prevIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1

      // Preload next set of photos
      for (let i = 0; i < photosToShow; i++) {
        const nextPhotoIndex = (nextIndex + i) % sortedPhotos.length
        if (sortedPhotos[nextPhotoIndex]?.url) {
          const img = new window.Image()
          img.src = sortedPhotos[nextPhotoIndex].url
        }
      }

      // Preload previous set of photos
      for (let i = 0; i < photosToShow; i++) {
        const prevPhotoIndex = prevIndex - i >= 0 ? prevIndex - i : sortedPhotos.length + (prevIndex - i)
        if (sortedPhotos[prevPhotoIndex]?.url) {
          const img = new window.Image()
          img.src = sortedPhotos[prevPhotoIndex].url
        }
      }
    }

    if (sortedPhotos.length > 0) {
      preloadImages()
    }
  }, [currentIndex, sortedPhotos, photosToShow])

  useEffect(() => {
    if (isAutoPlaying && sortedPhotos.length > photosToShow && !isTransitioning) {
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentIndex((prev) => {
            const maxIndex = Math.max(0, sortedPhotos.length - photosToShow)
            return prev >= maxIndex ? 0 : prev + 1
          })
          setTimeout(() => setIsTransitioning(false), 100)
        }, 300)
      }, 5000) // Change photos every 5 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoPlaying, sortedPhotos.length, photosToShow, isTransitioning])

  // Reset index if photos change
  useEffect(() => {
    const maxIndex = Math.max(0, sortedPhotos.length - photosToShow)
    if (sortedPhotos.length > 0 && currentIndex > maxIndex) {
      setCurrentIndex(0)
    }
  }, [sortedPhotos.length, currentIndex, photosToShow])

  const goToSlide = (index: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      const maxIndex = Math.max(0, sortedPhotos.length - photosToShow)
      setCurrentIndex(Math.min(index, maxIndex))
      setTimeout(() => setIsTransitioning(false), 50)
    }, 300)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000) // Resume auto-play after 10 seconds
  }

  const navigatePhotos = (direction: 'next' | 'prev') => {
    setIsTransitioning(true)
    setTimeout(() => {
      const maxIndex = Math.max(0, sortedPhotos.length - photosToShow)
      if (direction === 'next') {
        setCurrentIndex((prev) => prev >= maxIndex ? 0 : prev + 1)
      } else {
        setCurrentIndex((prev) => prev <= 0 ? maxIndex : prev - 1)
      }
      setTimeout(() => setIsTransitioning(false), 50)
    }, 300)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
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
      navigatePhotos('next')
    }
    if (isRightSwipe && sortedPhotos.length > photosToShow) {
      navigatePhotos('prev')
    }
  }

  if (sortedPhotos.length === 0) {
    return null
  }

  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden bg-charcoal/5">
      {/* Main Carousel Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center gap-4 md:gap-6 lg:gap-8 px-4 md:px-8 lg:px-12"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Photo Slides - Multiple Visible with Smooth Transitions */}
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transition: 'transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center gap-4 md:gap-6 lg:gap-8 px-4 md:px-8" style={{ width: '100%', maxWidth: '100%' }}>
            {sortedPhotos.map((photo, index) => {
              // Calculate if this photo should be visible
              const isInRange = index >= currentIndex && index < currentIndex + photosToShow
              const isWrapped = currentIndex + photosToShow > sortedPhotos.length && 
                               index < (currentIndex + photosToShow - sortedPhotos.length)
              const isVisible = isInRange || isWrapped
              
              // Calculate position relative to current index
              let position = index - currentIndex
              if (position < 0 && currentIndex + photosToShow > sortedPhotos.length) {
                // Handle wrapping
                position = sortedPhotos.length - currentIndex + index
              }

              return (
                <div
                  key={photo.id}
                  className={`relative transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isVisible
                      ? 'opacity-100 scale-100 z-10'
                      : 'opacity-0 scale-95 z-0 pointer-events-none'
                  }`}
                  style={{
                    width: photosToShow === 1 ? '100%' : photosToShow === 2 ? 'calc(50% - 12px)' : 'calc(33.333% - 16px)',
                    height: '100%',
                    flex: photosToShow === 1 ? '1 1 100%' : photosToShow === 2 ? '1 1 calc(50% - 12px)' : '1 1 calc(33.333% - 16px)',
                    maxWidth: '100%',
                    minWidth: photosToShow === 1 ? '100%' : photosToShow === 2 ? '300px' : '250px',
                    transform: isVisible 
                      ? `translateX(0) scale(1)` 
                      : position < 0 
                      ? `translateX(-20px) scale(0.95)`
                      : `translateX(20px) scale(0.95)`,
                    transition: 'opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1), transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div className="relative w-full h-full rounded-sm overflow-hidden shadow-lg bg-taupe/20">
                    {photo.url && (
                      <>
                        <Image
                          src={photo.url}
                          alt={photo.alt || `Photo ${index + 1}`}
                          fill
                          className={`${
                            imageAspectRatios.get(photo.id) && imageAspectRatios.get(photo.id)! > 1.3
                              ? 'object-cover pan-zoom-horizontal'
                              : 'object-contain'
                          }`}
                          priority={isVisible && (position === 0 || (position === 1 && photosToShow > 1))}
                          sizes={photosToShow === 1 ? "100vw" : photosToShow === 2 ? "50vw" : "33vw"}
                          onError={(e) => {
                            console.error('Error loading image:', photo.url)
                            const target = e.target as HTMLImageElement
                            if (target) {
                              target.style.display = 'none'
                            }
                          }}
                          onLoad={(e) => {
                            // Calculate and store aspect ratio
                            const img = e.target as HTMLImageElement
                            if (img.naturalWidth && img.naturalHeight) {
                              const aspectRatio = img.naturalWidth / img.naturalHeight
                              setImageAspectRatios(prev => {
                                const newMap = new Map(prev)
                                newMap.set(photo.id, aspectRatio)
                                return newMap
                              })
                            }
                          }}
                        />
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
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
              onClick={() => navigatePhotos('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-charcoal p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
              aria-label="Previous photos"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => navigatePhotos('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-charcoal p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
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

      <style jsx global>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        @keyframes panZoomHorizontal {
          0%, 100% {
            transform: scale(1.1) translateX(0%);
          }
          50% {
            transform: scale(1.15) translateX(-5%);
          }
        }
        .pan-zoom-horizontal {
          animation: panZoomHorizontal 20s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}

