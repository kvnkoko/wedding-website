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
      {/* Hero Section - Clean Minimal Design Without Arch */}
      <section className="relative min-h-screen flex items-center justify-center bg-cream overflow-hidden px-4 sm:px-6 lg:px-8">
        {/* Elegant Tulip Illustrations - Left Side (Vintage Botanical Style) */}
        <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-40 lg:w-56 xl:w-72 opacity-8 lg:opacity-12 pointer-events-none" style={{ zIndex: 0 }}>
          <svg viewBox="0 0 180 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Detailed Tulip Flower - Vintage Botanical Style */}
            <g opacity="0.4">
              {/* Outer Petals */}
              <path d="M 90,35 Q 75,15 60,28 Q 50,40 55,60 Q 60,75 70,82 Q 80,88 90,85 Q 100,88 110,82 Q 120,75 125,60 Q 130,40 120,28 Q 105,15 90,35" 
                    fill="none" stroke="rgba(44, 44, 44, 0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Inner Petal Details */}
              <path d="M 90,35 Q 85,50 90,65 Q 95,50 90,35" 
                    fill="none" stroke="rgba(44, 44, 44, 0.35)" strokeWidth="1.2"/>
              <path d="M 75,50 Q 80,55 85,50" 
                    fill="none" stroke="rgba(44, 44, 44, 0.3)" strokeWidth="0.8"/>
              <path d="M 105,50 Q 100,55 95,50" 
                    fill="none" stroke="rgba(44, 44, 44, 0.3)" strokeWidth="0.8"/>
              {/* Stem with natural curve */}
              <path d="M 90,88 Q 88,130 85,200 Q 82,270 78,340 Q 75,400 72,450" 
                    fill="none" stroke="rgba(44, 44, 44, 0.35)" strokeWidth="2.2" strokeLinecap="round"/>
              {/* Large Wrapping Leaf 1 - Detailed Veins */}
              <path d="M 75,220 Q 40,240 25,280 Q 18,320 30,350 Q 50,365 70,360 Q 85,355 95,340 Q 100,320 95,300 Q 88,280 80,260 Q 77,240 75,220" 
                    fill="none" stroke="rgba(44, 44, 44, 0.3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 50,280 Q 45,295 50,310" 
                    fill="none" stroke="rgba(44, 44, 44, 0.25)" strokeWidth="1"/>
              <path d="M 60,300 Q 55,310 60,320" 
                    fill="none" stroke="rgba(44, 44, 44, 0.2)" strokeWidth="0.8"/>
              {/* Large Wrapping Leaf 2 */}
              <path d="M 105,240 Q 140,260 155,300 Q 162,340 150,370 Q 130,385 110,380 Q 95,375 85,360 Q 80,340 85,320 Q 92,300 100,280 Q 103,260 105,240" 
                    fill="none" stroke="rgba(44, 44, 44, 0.3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 130,300 Q 135,315 130,330" 
                    fill="none" stroke="rgba(44, 44, 44, 0.25)" strokeWidth="1"/>
              <path d="M 120,320 Q 125,330 120,340" 
                    fill="none" stroke="rgba(44, 44, 44, 0.2)" strokeWidth="0.8"/>
              {/* Small Decorative Elements */}
              <circle cx="55" cy="160" r="1.5" fill="rgba(44, 44, 44, 0.2)"/>
              <circle cx="125" cy="190" r="1.2" fill="rgba(44, 44, 44, 0.18)"/>
            </g>
          </svg>
        </div>

        {/* Elegant Tulip Illustrations - Right Side (Vintage Botanical Style) */}
        <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-40 lg:w-56 xl:w-72 opacity-8 lg:opacity-12 pointer-events-none" style={{ zIndex: 0 }}>
          <svg viewBox="0 0 180 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Detailed Tulip Flower - Vintage Botanical Style */}
            <g opacity="0.4">
              {/* Outer Petals */}
              <path d="M 90,35 Q 105,15 120,28 Q 130,40 125,60 Q 120,75 110,82 Q 100,88 90,85 Q 80,88 70,82 Q 60,75 55,60 Q 50,40 60,28 Q 75,15 90,35" 
                    fill="none" stroke="rgba(44, 44, 44, 0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Inner Petal Details */}
              <path d="M 90,35 Q 95,50 90,65 Q 85,50 90,35" 
                    fill="none" stroke="rgba(44, 44, 44, 0.35)" strokeWidth="1.2"/>
              <path d="M 105,50 Q 100,55 95,50" 
                    fill="none" stroke="rgba(44, 44, 44, 0.3)" strokeWidth="0.8"/>
              <path d="M 75,50 Q 80,55 85,50" 
                    fill="none" stroke="rgba(44, 44, 44, 0.3)" strokeWidth="0.8"/>
              {/* Stem with natural curve */}
              <path d="M 90,88 Q 92,130 95,200 Q 98,270 102,340 Q 105,400 108,450" 
                    fill="none" stroke="rgba(44, 44, 44, 0.35)" strokeWidth="2.2" strokeLinecap="round"/>
              {/* Large Wrapping Leaf 1 */}
              <path d="M 105,220 Q 140,240 155,280 Q 162,320 150,350 Q 130,365 110,360 Q 95,355 85,340 Q 80,320 85,300 Q 92,280 100,260 Q 103,240 105,220" 
                    fill="none" stroke="rgba(44, 44, 44, 0.3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 130,280 Q 135,295 130,310" 
                    fill="none" stroke="rgba(44, 44, 44, 0.25)" strokeWidth="1"/>
              <path d="M 120,300 Q 125,310 120,320" 
                    fill="none" stroke="rgba(44, 44, 44, 0.2)" strokeWidth="0.8"/>
              {/* Large Wrapping Leaf 2 */}
              <path d="M 75,240 Q 40,260 25,300 Q 18,340 30,370 Q 50,385 70,380 Q 85,375 95,360 Q 100,340 95,320 Q 88,300 80,280 Q 77,260 75,240" 
                    fill="none" stroke="rgba(44, 44, 44, 0.3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 50,300 Q 45,315 50,330" 
                    fill="none" stroke="rgba(44, 44, 44, 0.25)" strokeWidth="1"/>
              <path d="M 60,320 Q 55,330 60,340" 
                    fill="none" stroke="rgba(44, 44, 44, 0.2)" strokeWidth="0.8"/>
              {/* Small Decorative Elements */}
              <circle cx="125" cy="160" r="1.5" fill="rgba(44, 44, 44, 0.2)"/>
              <circle cx="55" cy="190" r="1.2" fill="rgba(44, 44, 44, 0.18)"/>
            </g>
          </svg>
        </div>

        <div className="max-w-5xl mx-auto w-full relative z-10">
          <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 md:space-y-12 py-4 sm:py-8 md:py-20 lg:py-32 -mt-16 sm:mt-0">
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
