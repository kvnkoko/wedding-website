'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import RSVPEditForm from '@/components/RSVPEditForm'
import PhotoCarousel from '@/components/PhotoCarousel'

function PhotoCarouselSection() {
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

  return <PhotoCarousel photos={photos} />
}

function HomeContent() {
  const searchParams = useSearchParams()
  const editToken = searchParams.get('edit')
  const [rsvpLink, setRsvpLink] = useState('/rsvp')
  const [dateRange, setDateRange] = useState('January - March 2025')

  // Get RSVP link from localStorage if available and fetch event dates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSlug = localStorage.getItem('rsvpSlug')
      if (storedSlug) {
        setRsvpLink(storedSlug)
        // Extract slug from path (e.g., /rsvp/abc123 -> abc123)
        const slug = storedSlug.replace('/rsvp/', '')
        // Fetch event dates
        fetch(`/api/rsvp/config/${slug}`)
          .then(res => res.json())
          .then(data => {
            if (data.events && data.events.length > 0) {
              // Sort events by date
              const sortedEvents = [...data.events].sort((a, b) => 
                new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
              )
              // Get first and last event dates
              const firstDate = new Date(sortedEvents[0].dateTime)
              const lastDate = new Date(sortedEvents[sortedEvents.length - 1].dateTime)
              
              // Format date range
              const firstMonth = firstDate.toLocaleDateString('en-US', { month: 'long' })
              const firstDay = firstDate.getDate()
              const lastMonth = lastDate.toLocaleDateString('en-US', { month: 'long' })
              const lastDay = lastDate.getDate()
              const year = firstDate.getFullYear()
              
              // Check if it's a single date
              if (firstDate.getTime() === lastDate.getTime()) {
                // Single date: "February 12, 2026"
                setDateRange(`${firstMonth} ${firstDay}, ${year}`)
              } else if (firstMonth === lastMonth && firstDate.getFullYear() === lastDate.getFullYear()) {
                // Same month, different days: "January 22 - 25, 2025"
                setDateRange(`${firstMonth} ${firstDay} - ${lastDay}, ${year}`)
              } else if (firstDate.getFullYear() === lastDate.getFullYear()) {
                // Different months, same year: "January 22 - March 25, 2025"
                setDateRange(`${firstMonth} ${firstDay} - ${lastMonth} ${lastDay}, ${year}`)
              } else {
                // Different years: "January 22, 2025 - March 25, 2026"
                setDateRange(`${firstMonth} ${firstDay}, ${firstDate.getFullYear()} - ${lastMonth} ${lastDay}, ${lastDate.getFullYear()}`)
              }
            }
          })
          .catch(() => {
            // If fetch fails, keep default date
          })
      }
    }
  }, [])

  if (editToken) {
    return <RSVPEditForm editToken={editToken} />
  }

  // Server component content moved to client for simplicity
  return (
    <div className="min-h-screen">
      {/* Hero Section - Clean Minimal Design Without Arch */}
      <section className="relative min-h-screen flex items-center justify-center bg-cream overflow-hidden px-4 sm:px-6 lg:px-8">

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 xl:gap-16">
            {/* Left Tulip - Hidden on mobile, visible on desktop */}
            <div className="hidden lg:block lg:flex-shrink-0 lg:w-48 xl:w-64 relative opacity-60">
              <img
                src="/tulips.png"
                alt=""
                className="object-contain w-full h-auto"
                style={{ filter: 'invert(1) opacity(0.15)' }}
                onError={(e) => {
                  // Hide if image fails to load
                  const target = e.target as HTMLImageElement
                  if (target) {
                    target.style.display = 'none'
                  }
                }}
              />
            </div>

            {/* Center Content */}
            <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 md:space-y-12 py-4 sm:py-8 md:py-20 lg:py-32 -mt-16 sm:mt-0 flex-1">
              {/* Subtitle */}
              <p className="font-body text-xs sm:text-sm md:text-base lg:text-lg text-charcoal/50 tracking-[0.2em] uppercase mb-4">
                A Formal Celebration Between
              </p>
              
              {/* Main Names - Large Impactful Typography */}
              <div className="flex flex-col items-center space-y-4 md:space-y-6">
                <h1 className="font-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-charcoal leading-[0.9] tracking-tight">
                  Kevin Koko
                </h1>
                <p className="font-script text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-charcoal/80 -mt-2 md:-mt-4">
                  &amp;
                </p>
                <h1 className="font-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-charcoal leading-[0.9] tracking-tight">
                  Tiffany Min
                </h1>
              </div>
              
              {/* Invitation Line */}
              <p className="font-script text-xl sm:text-2xl md:text-3xl lg:text-4xl text-charcoal/70 mt-4 md:mt-8">
                invite you to celebrate with us
              </p>
              
              {/* Date */}
              <p className="font-title text-base sm:text-lg md:text-xl lg:text-2xl text-charcoal/60 mt-6 md:mt-10 tracking-wide">
                {dateRange}
              </p>
              
              {/* CTA Button */}
              <div className="mt-8 md:mt-12">
                <Link
                  href={`${rsvpLink}?form=true`}
                  className="inline-block bg-charcoal text-white px-8 md:px-12 py-3 md:py-4 rounded-sm font-body text-xs md:text-sm tracking-[0.15em] uppercase hover:bg-charcoal/90 transition-all duration-300"
                >
                  RSVP
                </Link>
              </div>
              
              {/* Hashtag - Subtle bottom placement, balanced size */}
              <p className="font-script text-sm md:text-base lg:text-lg text-charcoal/50 mt-12 md:mt-16">
                #tiffandko
              </p>
            </div>

            {/* Right Tulip - Hidden on mobile, visible on desktop */}
            <div className="hidden lg:block lg:flex-shrink-0 lg:w-48 xl:w-64 relative opacity-60">
              <img
                src="/tulips.png"
                alt=""
                className="object-contain w-full h-auto"
                style={{ filter: 'invert(1) opacity(0.15)', transform: 'scaleX(-1)' }}
                onError={(e) => {
                  // Hide if image fails to load
                  const target = e.target as HTMLImageElement
                  if (target) {
                    target.style.display = 'none'
                  }
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Photo Carousel Section */}
      <PhotoCarouselSection />

    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-sans text-lg text-charcoal/70">Loading...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
