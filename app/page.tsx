'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import RSVPEditForm from '@/components/RSVPEditForm'

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
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-cream overflow-hidden py-8 px-4">
        {/* Elegant invitation card with proper arch shape - curved top/bottom, straight sides */}
        <div className="relative w-full max-w-md mx-auto my-8">
          {/* Card container with proper arch shape using CSS clip-path */}
          <div className="relative bg-cream" style={{
            clipPath: 'polygon(0 12%, 0 88%, 100% 88%, 100% 12%, 50% 0%, 0 12%)'
          }}>
            {/* SVG for elegant arched borders - curved top and bottom, straight sides */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} viewBox="0 0 400 600" preserveAspectRatio="none">
              {/* Outer arch border - curved top and bottom with straight sides */}
              <path 
                d="M 20,80 Q 20,20 200,20 L 200,20 Q 380,20 380,80 L 380,520 Q 380,580 200,580 L 200,580 Q 20,580 20,520 Z" 
                fill="none" 
                stroke="rgba(45, 45, 45, 0.2)" 
                strokeWidth="2"
              />
              {/* Inner border lines */}
              <path 
                d="M 24,80 Q 24,24 200,24 L 200,24 Q 376,24 376,80 L 376,520 Q 376,576 200,576 L 200,576 Q 24,576 24,520 Z" 
                fill="none" 
                stroke="rgba(45, 45, 45, 0.15)" 
                strokeWidth="1"
              />
              <path 
                d="M 28,80 Q 28,28 200,28 L 200,28 Q 372,28 372,80 L 372,520 Q 372,572 200,572 L 200,572 Q 28,572 28,520 Z" 
                fill="none" 
                stroke="rgba(45, 45, 45, 0.1)" 
                strokeWidth="1"
              />
              {/* Vertical double lines on left and right sides */}
              <line x1="40" y1="80" x2="40" y2="520" stroke="rgba(45, 45, 45, 0.15)" strokeWidth="1" />
              <line x1="44" y1="80" x2="44" y2="520" stroke="rgba(45, 45, 45, 0.1)" strokeWidth="1" />
              <line x1="360" y1="80" x2="360" y2="520" stroke="rgba(45, 45, 45, 0.15)" strokeWidth="1" />
              <line x1="356" y1="80" x2="356" y2="520" stroke="rgba(45, 45, 45, 0.1)" strokeWidth="1" />
            </svg>
            
            {/* Inner content area with proper padding - extra left padding for hashtag */}
            <div className="relative z-10 text-center px-8 md:px-12 py-12 md:py-16 pl-20 md:pl-24">
              {/* Curved top text - positioned near the arch */}
              <p className="font-body text-[10px] md:text-xs text-charcoal/60 mb-6 md:mb-8 tracking-[0.15em] uppercase leading-tight">
                A Formal Celebration Between
              </p>
              
              {/* Main Names */}
              <div className="mb-4 md:mb-6 flex flex-col items-center">
                <h1 className="font-title text-3xl md:text-5xl lg:text-6xl text-charcoal mb-0 leading-tight">
                  Kevin Koko
                </h1>
                <p className="font-script text-xl md:text-2xl text-charcoal/90 mt-3 md:mt-4 mb-1">And</p>
                <h1 className="font-title text-3xl md:text-5xl lg:text-6xl text-charcoal mt-0 leading-tight">
                  Tiffany Min
                </h1>
              </div>
              
              {/* Invitation line */}
              <p className="font-script text-lg md:text-xl text-charcoal/80 mb-8 md:mb-10">
                invite you to celebrate with us
              </p>
              
              {/* Date */}
              <p className="font-title text-base md:text-lg text-charcoal/70 mb-6 md:mb-8">
                {dateRange}
              </p>
              
              <Link
                href={`${rsvpLink}?form=true`}
                className="inline-block bg-charcoal text-white px-8 md:px-10 py-3 md:py-4 rounded-sm font-sans text-xs md:text-sm tracking-[0.15em] uppercase hover:bg-charcoal/90 transition-all"
              >
                RSVP
              </Link>
            </div>
            
            {/* Hashtag - positioned on left edge, vertically oriented from bottom to top */}
            <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2" style={{ 
              transform: 'translateY(-50%) rotate(-90deg)',
              transformOrigin: 'center'
            }}>
              <p className="font-script text-sm md:text-base text-charcoal/60 whitespace-nowrap">#tiffandko</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-4 bg-white relative">
        {/* Elegant side borders */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-charcoal/10"></div>
        <div className="absolute right-8 top-0 bottom-0 w-px bg-charcoal/10"></div>
        <div className="absolute left-12 top-0 bottom-0 w-px bg-charcoal/5"></div>
        <div className="absolute right-12 top-0 bottom-0 w-px bg-charcoal/5"></div>
        
        <div className="max-w-4xl mx-auto">
          <h2 className="font-title text-5xl text-charcoal text-center mb-4">Our Story</h2>
          <p className="font-script text-3xl text-charcoal/70 text-center mb-12">A Journey Together</p>
          <div className="prose prose-lg mx-auto text-charcoal/80 font-body leading-relaxed">
            <p className="text-center mb-6">
              Our journey together began with a chance encounter that felt like destiny. From the bustling streets of Yangon to quiet moments in Mandalay, we have built a love story that spans cities and cultures.
            </p>
            <p className="text-center mb-6">
              We are thrilled to share this special time with our family and friends, celebrating not just our union, but the beautiful connections that have shaped our lives.
            </p>
            <p className="text-center font-script text-xl text-charcoal/70">
              Join us as we begin this new chapter together, surrounded by the people we love most.
            </p>
          </div>
        </div>
      </section>

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
