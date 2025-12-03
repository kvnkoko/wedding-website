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
        {/* Elegant invitation card - redesigned from scratch to match invitation exactly */}
        <div className="relative w-full max-w-md mx-auto">
          {/* Card container with proper proportions */}
          <div className="relative bg-cream mx-auto" style={{
            aspectRatio: '2/3',
            maxWidth: '100%',
            clipPath: 'polygon(0 8%, 0 100%, 100% 100%, 100% 8%, 50% 0%, 0 8%)'
          }}>
            {/* Elegant border frame using SVG - matching invitation exactly */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} viewBox="0 0 400 600" preserveAspectRatio="none">
              {/* Outer perimeter border - curved top, straight sides and bottom */}
              <path 
                d="M 16,48 Q 16,16 200,16 Q 384,16 384,48 L 384,592 L 16,592 Z" 
                fill="none" 
                stroke="rgba(45, 45, 45, 0.2)" 
                strokeWidth="1.5"
              />
              {/* Inner border line */}
              <path 
                d="M 20,48 Q 20,20 200,20 Q 380,20 380,48 L 380,588 L 20,588 Z" 
                fill="none" 
                stroke="rgba(45, 45, 45, 0.15)" 
                strokeWidth="1"
              />
              {/* Vertical double lines on left side */}
              <line x1="32" y1="48" x2="32" y2="592" stroke="rgba(45, 45, 45, 0.15)" strokeWidth="1" />
              <line x1="36" y1="48" x2="36" y2="592" stroke="rgba(45, 45, 45, 0.1)" strokeWidth="0.5" />
              {/* Vertical double lines on right side */}
              <line x1="368" y1="48" x2="368" y2="592" stroke="rgba(45, 45, 45, 0.15)" strokeWidth="1" />
              <line x1="364" y1="48" x2="364" y2="592" stroke="rgba(45, 45, 45, 0.1)" strokeWidth="0.5" />
            </svg>
            
            {/* Content area with proper spacing - accounting for hashtag */}
            <div className="relative z-10 h-full flex flex-col justify-center text-center px-6 md:px-8 py-8 md:py-12 pl-16 md:pl-20">
              {/* Curved top text */}
              <p className="font-body text-[9px] md:text-[10px] text-charcoal/60 mb-4 md:mb-6 tracking-[0.12em] uppercase leading-tight">
                A Formal Celebration Between
              </p>
              
              {/* Main Names */}
              <div className="mb-3 md:mb-5 flex flex-col items-center">
                <h1 className="font-title text-2xl md:text-4xl lg:text-5xl text-charcoal mb-0 leading-tight">
                  Kevin Koko
                </h1>
                <p className="font-script text-lg md:text-xl text-charcoal/90 mt-2 md:mt-3 mb-0.5">And</p>
                <h1 className="font-title text-2xl md:text-4xl lg:text-5xl text-charcoal mt-0 leading-tight">
                  Tiffany Min
                </h1>
              </div>
              
              {/* Invitation line */}
              <p className="font-script text-base md:text-lg text-charcoal/80 mb-6 md:mb-8">
                invite you to celebrate with us
              </p>
              
              {/* Date */}
              <p className="font-title text-sm md:text-base text-charcoal/70 mb-5 md:mb-7">
                {dateRange}
              </p>
              
              <Link
                href={`${rsvpLink}?form=true`}
                className="inline-block bg-charcoal text-white px-6 md:px-8 py-2.5 md:py-3 rounded-sm font-sans text-[10px] md:text-xs tracking-[0.12em] uppercase hover:bg-charcoal/90 transition-all"
              >
                RSVP
              </Link>
            </div>
            
            {/* Hashtag - positioned on left edge, vertically oriented */}
            <div className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2" style={{ 
              transform: 'translateY(-50%) rotate(-90deg)',
              transformOrigin: 'center'
            }}>
              <p className="font-script text-xs md:text-sm text-charcoal/60 whitespace-nowrap">#tiffandko</p>
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
