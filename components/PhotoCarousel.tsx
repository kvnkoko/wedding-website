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
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Safely sort photos
  const sortedPhotos = photos && Array.isArray(photos) 
    ? [...photos].sort((a, b) => (a.order || 0) - (b.order || 0))
    : []

  const [photosToShow, setPhotosToShow] = useState(3)

  useEffect(() => {
    const updatePhotosToShow = () => {
      if (typeof window !== 'undefined') {
        // Desktop: always show 3 photos
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

  // Continuous smooth scrolling animation
  useEffect(() => {
    if (isAutoPlaying && sortedPhotos.length > photosToShow && !isTransitioning) {
      // Smooth scroll every 4 seconds
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentIndex((prev) => {
            const maxIndex = Math.max(0, sortedPhotos.length - photosToShow)
            return prev >= maxIndex ? 0 : prev + 1
          })
          setTimeout(() => setIsTransitioning(false), 100)
        }, 300)
      }, 4000) // Change photos every 4 seconds for smoother experience
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
    <section className="relative w-full h-[85vh] md:h-[80vh] lg:h-[90vh] xl:h-[92vh] overflow-hidden bg-gradient-to-b from-cream via-cream to-cream/95 dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg/95">
      {/* Main Carousel Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center gap-0 md:gap-6 lg:gap-8 px-4 md:px-8 lg:px-12"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Photo Slides - Multiple Visible with Smooth Transitions */}
        <div 
          className="relative w-full h-full overflow-hidden flex items-center justify-center"
        >
          <div 
            className="relative h-full flex items-start md:px-0"
            style={{
              transform: photosToShow === 1
                ? `translateX(calc(-${currentIndex * 100}vw + ${currentIndex * 2}rem + 1rem))`
                : `translateX(calc(-${currentIndex * (100 / photosToShow)}vw - ${currentIndex * (photosToShow === 2 ? 12 : 16)}px))`,
              transition: 'transform 1200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              width: photosToShow === 1
                ? `calc(${sortedPhotos.length * 100}vw - ${sortedPhotos.length * 2}rem)`
                : `calc(${sortedPhotos.length * (100 / photosToShow)}vw + ${sortedPhotos.length * (photosToShow === 2 ? 12 : 16)}px)`,
              willChange: 'transform',
            }}
          >
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

              // Container width - each photo takes up 1/photosToShow of the viewport width
              // On mobile, account for padding to center the photo
              const gapSize = photosToShow === 1 ? 0 : photosToShow === 2 ? 12 : 16
              const containerWidth = photosToShow === 1
                ? `calc(${100 / photosToShow}vw - 2rem)`
                : `calc(${100 / photosToShow}vw - ${gapSize * (photosToShow - 1) / photosToShow}px)`
              
              // Standard portrait aspect ratio (3:4) for consistent sizing across all photos
              // All photos will have identical dimensions regardless of their original aspect ratio
              const portraitAspectRatio = 3 / 4
              
              return (
                <div
                  key={photo.id}
                  className="relative"
                  style={{
                    width: containerWidth,
                    aspectRatio: '3 / 4',
                    maxHeight: '85vh',
                    flexShrink: 0,
                    marginRight: index < sortedPhotos.length - 1 ? `${gapSize}px` : '0',
                  }}
                >
                  <div className="relative w-full h-full rounded-none md:rounded-lg overflow-hidden shadow-xl md:shadow-2xl dark:shadow-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 transition-all duration-500 hover:shadow-3xl dark:hover:shadow-4xl group">
                    {photo.url && (
                      <>
                        {/* Low-quality blurred placeholder - shows immediately while loading */}
                        {!loadedImages.has(photo.id) && !imageErrors.has(photo.id) && (
                          <img
                            src={photo.url}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center',
                              filter: 'blur(20px)',
                              transform: 'scale(1.05)',
                              opacity: 0.5,
                            }}
                            loading="eager"
                          />
                        )}
                        {/* Full-quality image with fade-in - all portraits use cover for consistent sizing */}
                        <img
                          src={photo.url}
                          alt={photo.alt || `Photo ${index + 1}`}
                          className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                            loadedImages.has(photo.id)
                              ? 'opacity-100 scale-100'
                              : 'opacity-0 scale-105'
                          } group-hover:scale-[1.02]`}
                          style={{
                            objectFit: 'cover',
                            objectPosition: 'center center',
                          }}
                          loading={isVisible && position === 0 ? 'eager' : 'lazy'}
                          fetchPriority={isVisible && position === 0 ? 'high' : isVisible ? 'auto' : 'low'}
                          decoding={isVisible && position === 0 ? 'sync' : 'async'}
                          onError={(e) => {
                            console.error('Error loading image:', photo.url)
                            setImageErrors(prev => new Set(prev).add(photo.id))
                            const target = e.target as HTMLImageElement
                            if (target) {
                              target.style.display = 'none'
                            }
                          }}
                          onLoad={(e) => {
                            // Mark as loaded
                            setLoadedImages(prev => new Set(prev).add(photo.id))
                            
                            // Calculate and store aspect ratio (for potential future use)
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
                        {/* Subtle gradient overlay for depth and polish */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Navigation Dots - Hidden on mobile, shown on desktop */}
        {sortedPhotos.length > photosToShow && (
          <div className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 z-20 space-x-3 px-4 py-2 rounded-full bg-black/20 dark:bg-white/10 backdrop-blur-md">
            {Array.from({ length: Math.max(1, sortedPhotos.length - photosToShow + 1) }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-500 ease-out rounded-full ${
                  index === currentIndex
                    ? 'w-3 h-3 bg-white dark:bg-dark-text shadow-lg dark:shadow-2xl scale-110 ring-2 ring-white/50'
                    : 'w-2 h-2 bg-white/60 dark:bg-dark-text/60 hover:bg-white/90 dark:hover:bg-dark-text/90 hover:scale-110'
                }`}
                style={{
                  minWidth: '0 !important',
                  minHeight: '0 !important',
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Navigation Arrows - Minimal on mobile, full on desktop */}
        {sortedPhotos.length > photosToShow && (
          <>
            {/* Mobile: Minimal arrows */}
            <button
              onClick={() => navigatePhotos('prev')}
              className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 dark:bg-dark-card/80 text-charcoal dark:text-dark-text p-2 rounded-full transition-all duration-300 active:scale-95 backdrop-blur-sm"
              aria-label="Previous photos"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => navigatePhotos('next')}
              className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 dark:bg-dark-card/80 text-charcoal dark:text-dark-text p-2 rounded-full transition-all duration-300 active:scale-95 backdrop-blur-sm"
              aria-label="Next photos"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Desktop: Full arrows */}
            <button
              onClick={() => navigatePhotos('prev')}
              className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 dark:bg-dark-card/90 hover:bg-white dark:hover:bg-dark-card text-charcoal dark:text-dark-text p-3 rounded-full transition-all duration-500 hover:scale-110 active:scale-95 shadow-lg dark:shadow-2xl backdrop-blur-md magnetic glass group"
              aria-label="Previous photos"
            >
              <svg className="w-6 h-6 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => navigatePhotos('next')}
              className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 dark:bg-dark-card/90 hover:bg-white dark:hover:bg-dark-card text-charcoal dark:text-dark-text p-3 rounded-full transition-all duration-500 hover:scale-110 active:scale-95 shadow-lg dark:shadow-2xl backdrop-blur-md magnetic glass group"
              aria-label="Next photos"
            >
              <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Progress Bar - Hidden on mobile, shown on desktop */}
        {isAutoPlaying && sortedPhotos.length > photosToShow && (
          <div className="hidden md:block absolute bottom-0 left-0 right-0 h-0.5 bg-black/10 dark:bg-white/10 z-20">
            <div
              className="h-full bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-dark-text/80 transition-all duration-5000 ease-linear"
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

