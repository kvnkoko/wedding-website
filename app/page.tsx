'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import RSVPEditForm from '@/components/RSVPEditForm'

function HomeContent() {
  const searchParams = useSearchParams()
  const editToken = searchParams.get('edit')

  if (editToken) {
    return <RSVPEditForm editToken={editToken} />
  }

  // Server component content moved to client for simplicity
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-cream overflow-hidden">
        {/* Elegant border frame */}
        <div className="absolute inset-8 border-2 border-charcoal/20 rounded-t-[50%] rounded-b-none"></div>
        <div className="absolute inset-12 border border-charcoal/10 rounded-t-[50%] rounded-b-none"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Curved top text */}
          <p className="font-body text-xs md:text-sm text-charcoal/60 mb-8 tracking-[0.2em] uppercase">
            A Formal Celebration Between
          </p>
          
          {/* Main Names */}
          <div className="mb-6">
            <h1 className="font-title text-5xl md:text-7xl lg:text-8xl text-charcoal mb-2">
              Kevin Koko
            </h1>
            <p className="font-script text-3xl md:text-4xl text-charcoal/90 mb-2">And</p>
            <h1 className="font-title text-5xl md:text-7xl lg:text-8xl text-charcoal">
              Tiffany Min
            </h1>
          </div>
          
          {/* Invitation line */}
          <p className="font-script text-2xl md:text-3xl text-charcoal/80 mb-12">
            invite you to celebrate with us
          </p>
          
          {/* Date */}
          <p className="font-title text-xl md:text-2xl text-charcoal/70 mb-8">
            January - March 2025
          </p>
          
          <Link
            href="/rsvp"
            className="inline-block bg-charcoal text-white px-10 py-4 rounded-sm font-sans text-sm tracking-[0.2em] uppercase hover:bg-charcoal/90 transition-all"
          >
            RSVP
          </Link>
          
          {/* Hashtag */}
          <div className="absolute bottom-8 left-8 transform -rotate-90 origin-left">
            <p className="font-script text-lg text-charcoal/60">#tiffanyandko</p>
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
              Our journey together began with a chance encounter that felt like destiny. From the bustling streets of Yangon to quiet moments in Mandalay, we've built a love story that spans cities and cultures.
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

      {/* Event Summary Section */}
      <section className="py-20 px-4 bg-beige relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-title text-5xl text-charcoal text-center mb-4">Our Celebrations</h2>
          <p className="font-script text-3xl text-charcoal/70 text-center mb-16">Three Special Events</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 border-2 border-charcoal/10 hover:border-charcoal/20 transition-all relative">
              <div className="absolute top-4 right-4 w-2 h-2 bg-charcoal/20 rounded-full"></div>
              <h3 className="font-title text-2xl text-charcoal mb-2">Civil Signing</h3>
              <p className="font-script text-lg text-charcoal/80 mb-4">Formal Ceremony</p>
              <p className="font-body text-sm text-charcoal/70 mb-2">
                January 22, 2025
              </p>
              <p className="font-body text-sm text-charcoal/70 mb-4">
                The Strand Hotel Yangon
              </p>
              <Link
                href="/events"
                className="font-body text-xs text-charcoal/60 hover:text-charcoal transition-colors tracking-wider uppercase"
              >
                Learn more →
              </Link>
            </div>
            <div className="bg-white p-8 border-2 border-charcoal/10 hover:border-charcoal/20 transition-all relative">
              <div className="absolute top-4 right-4 w-2 h-2 bg-charcoal/20 rounded-full"></div>
              <h3 className="font-title text-2xl text-charcoal mb-2">Mandalay Celebration</h3>
              <p className="font-script text-lg text-charcoal/80 mb-4">Grand Celebration</p>
              <p className="font-body text-sm text-charcoal/70 mb-2">
                February 12, 2025
              </p>
              <p className="font-body text-sm text-charcoal/70 mb-4">
                Mingalar Mandalay Hotel
              </p>
              <Link
                href="/events"
                className="font-body text-xs text-charcoal/60 hover:text-charcoal transition-colors tracking-wider uppercase"
              >
                Learn more →
              </Link>
            </div>
            <div className="bg-white p-8 border-2 border-charcoal/10 hover:border-charcoal/20 transition-all relative">
              <div className="absolute top-4 right-4 w-2 h-2 bg-charcoal/20 rounded-full"></div>
              <h3 className="font-title text-2xl text-charcoal mb-2">Yangon Reception</h3>
              <p className="font-script text-lg text-charcoal/80 mb-4">Elegant Reception</p>
              <p className="font-body text-sm text-charcoal/70 mb-2">
                March 22, 2025
              </p>
              <p className="font-body text-sm text-charcoal/70 mb-4">
                Lotte Hotel Yangon
              </p>
              <Link
                href="/events"
                className="font-body text-xs text-charcoal/60 hover:text-charcoal transition-colors tracking-wider uppercase"
              >
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-cream relative">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-script text-3xl text-charcoal/80 mb-4">We Hope to See You There</p>
          <h2 className="font-title text-4xl text-charcoal mb-6">Join Us in Celebration</h2>
          <p className="font-body text-base text-charcoal/70 mb-8 leading-relaxed">
            Please use the unique link sent to you to RSVP for the events you're invited to.
          </p>
          <Link
            href="/rsvp"
            className="inline-block bg-charcoal text-white px-10 py-4 rounded-sm font-body text-sm tracking-[0.2em] uppercase hover:bg-charcoal/90 transition-all"
          >
            RSVP Now
          </Link>
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
