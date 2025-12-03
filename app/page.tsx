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
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 md:space-y-12 py-4 sm:py-8 md:py-20 lg:py-32 -mt-16 sm:mt-0">
            {/* Subtitle */}
            <p className="font-body text-xs md:text-sm text-charcoal/50 tracking-[0.2em] uppercase mb-4">
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
