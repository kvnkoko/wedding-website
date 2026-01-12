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
      <section className="relative min-h-screen flex items-center justify-center bg-cream dark:bg-dark-bg overflow-visible px-4 sm:px-6 lg:px-8">
        {/* Background Calla Lilies - Filling the space with elegant botanical illustrations */}
        {/* Mobile: Single large calla lily filling entire background */}
        <div 
          className="lg:hidden absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
          style={{ 
            opacity: 0,
            animation: 'fadeInToQuarter 0.8s ease-out 0.1s forwards',
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
            opacity: 0,
            width: 'clamp(600px, 50vw, 900px)',
            height: 'auto',
            willChange: 'transform, opacity',
            transform: `rotate(-2deg) translateY(${scrollY * 0.3}px)`,
            animation: 'fadeInToQuarter 0.8s ease-out 0.1s forwards',
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
            opacity: 0,
            width: 'clamp(580px, 48vw, 880px)',
            height: 'auto',
            willChange: 'transform, opacity',
            transform: `rotate(3deg) translateY(${scrollY * 0.2}px)`,
            animation: 'fadeInToQuarter 0.8s ease-out 0.2s forwards',
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
            <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 md:space-y-12 py-4 sm:py-4 md:py-12 lg:py-20 -mt-16 sm:-mt-8 md:mt-0 w-full">
              {/* Subtitle */}
              <p className="font-body text-charcoal/70 dark:text-dark-text-secondary tracking-[0.2em] uppercase mb-4 animate-fade-in-up scale-on-hover hero-float-delayed mobile-text-reveal" style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1.5rem)', animationDelay: '0.1s', animationDuration: '0.8s', '--fade-delay': '0.1s', fontFamily: 'var(--font-artica), system-ui, sans-serif' } as React.CSSProperties}>
                Together with our families
              </p>
              
              {/* Main Names - Large Impactful Typography */}
              <div className="flex flex-col items-center space-y-4 md:space-y-6">
                <h1 className="font-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-charcoal dark:text-dark-text leading-[0.9] tracking-tight animate-fade-in-up hover:scale-105 transition-transform duration-500 hero-float-delayed mobile-text-reveal" style={{ fontSize: 'clamp(5.5rem, 18vw, 9rem)', animationDelay: '0.2s', animationDuration: '0.8s', '--fade-delay': '0.2s' } as React.CSSProperties}>
                  <span className="block sm:inline" style={{ fontSize: 'inherit !important' }}>Kevin</span> <span className="block sm:inline" style={{ fontSize: 'inherit !important' }}>Koko</span>
                </h1>
                <p className="font-script text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-charcoal dark:text-dark-text mt-4 sm:mt-6 md:mt-8 lg:mt-10 xl:mt-12 relative z-20 animate-fade-in-up hero-float-delayed mobile-text-reveal" style={{ fontSize: 'clamp(2.25rem, 6vw, 3rem)', animationDelay: '0.35s', animationDuration: '0.8s', '--fade-delay': '0.35s' } as React.CSSProperties}>
                  And
                </p>
                <h1 className="font-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-charcoal dark:text-dark-text leading-[0.9] tracking-tight animate-fade-in-up hover:scale-105 transition-transform duration-500 hero-float-delayed mobile-text-reveal" style={{ fontSize: 'clamp(5.5rem, 18vw, 9rem)', animationDelay: '0.5s', animationDuration: '0.8s', '--fade-delay': '0.5s' } as React.CSSProperties}>
                  <span className="block sm:inline" style={{ fontSize: 'inherit !important' }}>Tiffany</span> <span className="block sm:inline" style={{ fontSize: 'inherit !important' }}>Min</span>
                </h1>
              </div>
              
              {/* Invitation Line */}
              <p className="font-script text-charcoal/70 dark:text-dark-text-secondary mt-4 md:mt-8 animate-fade-in-up scale-on-hover hero-float-delayed mobile-text-reveal" style={{ fontSize: 'clamp(1.875rem, 5.5vw, 2.5rem)', animationDelay: '0.65s', animationDuration: '0.8s', '--fade-delay': '0.65s' } as React.CSSProperties}>
                Invite you to celebrate with us
              </p>
              
              {/* No date or RSVP button on main page - this is the public site */}
              {/* Event information is only shown on personalized slug pages */}
              
              {/* Hashtag - Subtle bottom placement, balanced size */}
              <p className="font-script text-charcoal/70 dark:text-dark-text-secondary mt-12 md:mt-16 animate-fade-in-up scale-on-hover hero-float-delayed mobile-text-reveal" style={{ fontSize: 'clamp(0.875rem, 2vw, 1.125rem)', animationDelay: '0.8s', animationDuration: '0.8s', '--fade-delay': '0.8s' } as React.CSSProperties}>
                #tiffandko
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Information Section - Elegant & Compact - Overlaps hero to show graphics */}
      <section className="relative -mt-24 md:-mt-32 lg:-mt-40 py-8 md:py-12 bg-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-visible">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-sage rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-taupe rounded-full blur-3xl"></div>
            </div>
            
            {/* Main Content Card */}
            <div className="relative bg-white/70 dark:bg-dark-card/70 backdrop-blur-md border border-taupe/30 dark:border-dark-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group pointer-events-auto">
              {/* Elegant top accent line */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-sage/40 to-transparent"></div>
              
              <div className="p-6 md:p-8 lg:p-10">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                  {/* Icon/Visual Element */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-sage/10 dark:bg-sage/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 md:w-10 md:h-10 text-sage dark:text-sage/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-title text-xl md:text-2xl text-charcoal dark:text-dark-text mb-2 md:mb-3 tracking-tight">
                      Have Questions About Our Events?
                    </h3>
                    <p className="font-body text-sm md:text-base text-charcoal/70 dark:text-dark-text-secondary mb-4 md:mb-6 leading-relaxed">
                      Find detailed information about venues, dates, travel, and more in our FAQ section.
                    </p>
                    
                    {/* CTA Button */}
                    <Link
                      href="/faq"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal dark:bg-dark-text dark:text-dark-bg text-white rounded-sm tracking-[0.1em] uppercase text-xs md:text-sm font-medium hover:bg-sage dark:hover:bg-sage transition-all duration-300 shadow-sm hover:shadow-md group/btn"
                      style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                    >
                      <span>View FAQ</span>
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Subtle bottom accent line */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-sage/40 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Carousel Section - Transparent background to show hero graphics */}
      <section className="relative bg-transparent">
        <PhotoCarouselSection />
      </section>

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
