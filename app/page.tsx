'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import RSVPEditForm from '@/components/RSVPEditForm'
import PhotoCarouselSection from '@/components/PhotoCarouselSection'
import { formatDateRange } from '@/lib/utils'

function HomeContent() {
  const searchParams = useSearchParams()
  const editToken = searchParams.get('edit')
  const [rsvpLink, setRsvpLink] = useState('/rsvp')
  const [dateRange, setDateRange] = useState<string | null>(null) // Start with null, don't show default
  const [dateLoading, setDateLoading] = useState(true)

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
              setDateRange(formatDateRange(data.events))
            } else {
              // If no events, don't show date
              setDateRange(null)
            }
          })
          .catch(() => {
            // If fetch fails, don't show date
            setDateRange(null)
          })
          .finally(() => {
            setDateLoading(false)
          })
      } else {
        // No slug stored, don't show date
        setDateRange(null)
        setDateLoading(false)
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
        {/* Background Calla Lilies - Filling the space with elegant botanical illustrations */}
        {/* Mobile: Single large calla lily filling entire background */}
        <div 
          className="lg:hidden absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
          style={{ 
            opacity: 0.08,
          }}
        >
          <img
            src="/calla lily 1.png"
            alt=""
            className="object-contain w-full h-full"
            style={{ 
              minWidth: '100%',
              minHeight: '100%',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (target) {
                target.style.display = 'none'
              }
            }}
          />
        </div>

        {/* Desktop: Left Calla Lily Illustration */}
        <div 
          className="hidden lg:block absolute left-0 top-[20%] -translate-y-1/2 -translate-x-[12%] z-0 pointer-events-none"
          style={{ 
            opacity: 0.12,
            width: 'clamp(600px, 50vw, 900px)',
            height: 'auto',
            willChange: 'transform',
            transform: 'rotate(-2deg)',
            transition: 'opacity 0.3s ease',
          }}
        >
          <img
            src="/calla lily 1.png"
            alt=""
            className="object-contain w-full h-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (target) {
                target.style.display = 'none'
              }
            }}
          />
        </div>

        {/* Right Calla Lily Illustration - Desktop only (both would be too crowded on mobile) */}
        <div 
          className="hidden lg:block absolute right-0 top-[25%] -translate-y-1/2 translate-x-[12%] z-0 pointer-events-none"
          style={{ 
            opacity: 0.12,
            width: 'clamp(580px, 48vw, 880px)',
            height: 'auto',
            willChange: 'transform',
            transform: 'rotate(3deg)',
            transition: 'opacity 0.3s ease',
          }}
        >
          <img
            src="/calla lilly 2.png"
            alt=""
            className="object-contain w-full h-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (target) {
                target.style.display = 'none'
              }
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="flex flex-col items-center justify-center">
            {/* Center Content */}
            <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 md:space-y-12 py-4 sm:py-8 md:py-20 lg:py-32 -mt-16 sm:mt-0 w-full">
              {/* Subtitle */}
              <p className="font-body text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-charcoal/50 tracking-[0.2em] uppercase mb-4">
                Together with our families
              </p>
              
              {/* Main Names - Large Impactful Typography */}
              <div className="flex flex-col items-center space-y-4 md:space-y-6">
                <h1 className="font-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-charcoal leading-[0.9] tracking-tight whitespace-nowrap">
                  Kevin Koko
                </h1>
                <p className="font-script text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-charcoal/80 mt-16 md:mt-20 lg:mt-[calc(6rem+30px)] xl:mt-[calc(7rem+30px)]">
                  And
                </p>
                <h1 className="font-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-charcoal leading-[0.9] tracking-tight whitespace-nowrap">
                  Tiffany Min
                </h1>
              </div>
              
              {/* Invitation Line */}
              <p className="font-script text-xl sm:text-2xl md:text-3xl lg:text-4xl text-charcoal/70 mt-4 md:mt-8">
                Invite you to celebrate with us
              </p>
              
              {/* Date - Reserve space to prevent layout shift */}
              <div className="font-title text-base sm:text-lg md:text-xl lg:text-2xl text-charcoal/60 mt-6 md:mt-10 tracking-wide min-h-[1.5em]">
                {!dateLoading && dateRange ? (
                  <p>{dateRange}</p>
                ) : (
                  <p className="invisible">January 22 - March 22, 2025</p>
                )}
              </div>
              
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
