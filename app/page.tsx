'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import PhotoCarouselSection from '@/components/PhotoCarouselSection'

// Parallax scroll effect
function useParallax() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollY
}

function HomeContent() {
  const searchParams = useSearchParams()
  const editToken = searchParams.get('edit')
  const scrollY = useParallax()

  // Main page should not show any event information or RSVP links
  // This is the public site - event details are only shown on slug-specific pages

  // If someone tries to use an edit link, show message to contact directly
  if (editToken) {
    return (
      <div className="min-h-screen py-20 px-4 bg-cream dark:bg-dark-bg flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center bg-white dark:bg-dark-card p-12 rounded-2xl shadow-xl dark:shadow-2xl border border-taupe/20 dark:border-dark-border">
          <h1 className="font-title text-5xl text-charcoal dark:text-dark-text mb-6">RSVP Changes</h1>
          <p className="font-body text-lg text-charcoal/70 dark:text-dark-text-secondary mb-4 leading-relaxed">
            To make changes to your RSVP, please contact us directly.
          </p>
          <p className="font-body text-base text-charcoal/60 dark:text-dark-text-secondary">
            We'll be happy to help you update your RSVP or answer any questions you may have.
          </p>
        </div>
      </div>
    )
  }

  // Server component content moved to client for simplicity
  return (
    <div className="min-h-screen">
      {/* Hero Section - Clean Minimal Design Without Arch */}
      <section className="relative min-h-screen flex items-center justify-center bg-cream dark:bg-dark-bg overflow-hidden px-4 sm:px-6 lg:px-8">
        {/* Background Calla Lilies - Filling the space with elegant botanical illustrations */}
        {/* Mobile: Single large calla lily filling entire background */}
        <div 
          className="lg:hidden absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
          style={{ 
            opacity: 0.25,
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
          className="hidden lg:block absolute left-0 top-[20%] -translate-y-1/2 -translate-x-[12%] z-0 pointer-events-none parallax-slow"
          style={{ 
            opacity: 0.25,
            width: 'clamp(600px, 50vw, 900px)',
            height: 'auto',
            willChange: 'transform',
            transform: `rotate(-2deg) translateY(${scrollY * 0.3}px)`,
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
          className="hidden lg:block absolute right-0 top-[25%] -translate-y-1/2 translate-x-[12%] z-0 pointer-events-none parallax-slow"
          style={{ 
            opacity: 0.25,
            width: 'clamp(580px, 48vw, 880px)',
            height: 'auto',
            willChange: 'transform',
            transform: `rotate(3deg) translateY(${scrollY * 0.2}px)`,
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
            <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 md:space-y-12 py-8 sm:py-12 md:py-12 lg:py-20 -mt-8 sm:-mt-4 md:mt-0 w-full px-4">
              {/* Subtitle - Mobile optimized */}
              <p className="font-body text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-charcoal/70 dark:text-dark-text-secondary tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-2 sm:mb-4 animate-fade-in-up animate-delay-300 scale-on-hover hero-float-delayed mobile-text-reveal px-2">
                Together with our families
              </p>
              
              {/* Main Names - Mobile-first responsive typography */}
              <div className="flex flex-col items-center space-y-3 sm:space-y-4 md:space-y-6 px-2">
                <h1 className="font-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] text-charcoal dark:text-dark-text leading-[0.85] sm:leading-[0.9] tracking-tight animate-fade-in-up animate-delay-400 hover:scale-105 transition-transform duration-500 hero-float-delayed mobile-text-reveal">
                  <span className="block sm:inline">Kevin</span> <span className="block sm:inline">Koko</span>
                </h1>
                <p className="font-script text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-charcoal dark:text-dark-text mt-2 sm:mt-4 md:mt-6 lg:mt-8 xl:mt-10 relative z-20 animate-fade-in-up animate-delay-600 hero-float-delayed mobile-text-reveal">
                  And
                </p>
                <h1 className="font-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] text-charcoal dark:text-dark-text leading-[0.85] sm:leading-[0.9] tracking-tight animate-fade-in-up animate-delay-700 hover:scale-105 transition-transform duration-500 hero-float-delayed mobile-text-reveal">
                  <span className="block sm:inline">Tiffany</span> <span className="block sm:inline">Min</span>
                </h1>
              </div>
              
              {/* Invitation Line - Mobile optimized */}
              <p className="font-script text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-charcoal/70 dark:text-dark-text-secondary mt-3 sm:mt-4 md:mt-6 lg:mt-8 animate-fade-in-up animate-delay-800 scale-on-hover hero-float-delayed mobile-text-reveal px-2">
                Invite you to celebrate with us
              </p>
              
              {/* No date or RSVP button on main page - this is the public site */}
              {/* Event information is only shown on personalized slug pages */}
              
              {/* Hashtag - Mobile optimized spacing */}
              <p className="font-script text-xs sm:text-sm md:text-base lg:text-lg text-charcoal/70 dark:text-dark-text-secondary mt-8 sm:mt-12 md:mt-16 animate-fade-in-up animate-delay-1000 scale-on-hover hero-float-delayed mobile-text-reveal px-2">
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
      <div className="min-h-screen bg-cream dark:bg-dark-bg flex items-center justify-center">
        <p className="font-body text-lg text-charcoal/70 dark:text-dark-text-secondary">Loading...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
