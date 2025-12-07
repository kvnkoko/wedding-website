'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { formatDateRange } from '@/lib/utils'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [rsvpLink, setRsvpLink] = useState('/rsvp')
  const [homeLink, setHomeLink] = useState('/')
  const [faqLink, setFaqLink] = useState('/faq')
  const [dateRange, setDateRange] = useState<string | null>(null) // Start with null - only show on slug pages

  // Determine navigation links based on current route
  // IMPORTANT: If user is on a slug page, all links should keep them in their slug context
  useEffect(() => {
    const updateLinksAndDates = () => {
      if (typeof window === 'undefined') return

      // Check if we have a slug in localStorage (user is in slug context)
      const storedSlug = localStorage.getItem('rsvpSlug')
      const slugPath = storedSlug || (pathname?.startsWith('/rsvp/') ? pathname : null)

      // Only set slug-based links and dates if we're actually on a slug page or have stored slug
      // Main page (/) should not show any event information
      if (pathname?.startsWith('/rsvp/')) {
        // Extract slug from pathname (e.g., /rsvp/abc123 -> /rsvp/abc123)
        const currentSlugPath = pathname
        // Store in localStorage for navigation within slug pages
        localStorage.setItem('rsvpSlug', currentSlugPath)
        
        // Set all links to slug context
        setHomeLink(currentSlugPath) // Home goes to slug home page
        setFaqLink('/faq') // FAQ can stay as /faq (it will use localStorage)
        setRsvpLink(`${currentSlugPath}?form=true`) // RSVP goes to slug form
        
        // Fetch event dates only for slug pages
        const slug = currentSlugPath.replace('/rsvp/', '')
        fetch(`/api/rsvp/config/${slug}`)
          .then(res => res.json())
          .then(data => {
            if (data.events && data.events.length > 0) {
              setDateRange(formatDateRange(data.events))
            } else {
              setDateRange(null)
            }
          })
          .catch(() => {
            setDateRange(null)
          })
      } else if (pathname === '/') {
        // ONLY clear on main page (/) - not on /faq
        // This allows slug pages to work when navigating to /faq
        setHomeLink('/')
        setFaqLink('/faq')
        setRsvpLink('/rsvp')
        setDateRange(null) // No dates on main page
        localStorage.removeItem('rsvpSlug') // Clear only on main page
      } else if (storedSlug) {
        // Other pages (like /faq) but we have a stored slug - keep slug context
        setHomeLink(storedSlug) // Home goes to slug home page
        setFaqLink('/faq') // FAQ stays as /faq (will use localStorage)
        setRsvpLink(`${storedSlug}?form=true`) // RSVP goes to slug form
        setDateRange(null) // Don't show dates on non-slug pages
        // Keep localStorage intact so slug pages can still access their FAQs
      } else {
        // Other pages without slug context
        setHomeLink('/')
        setFaqLink('/faq')
        setRsvpLink('/rsvp')
        setDateRange(null)
      }
    }

    updateLinksAndDates()
  }, [pathname])

  const navItems = [
    { href: homeLink, label: 'Home' },
    { href: faqLink, label: 'FAQ' },
    { href: rsvpLink, label: 'RSVP' },
  ]

  return (
    <div className="min-h-screen bg-cream">
      <nav className="border-b border-taupe/30 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={homeLink} className="font-title text-2xl text-charcoal hover:text-sage transition-all duration-300 hover:scale-105">
              Kevin & Tiffany
            </Link>
            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => {
                // Check if current path matches the nav item
                let isActive = item.href === pathname || item.href.split('?')[0] === pathname
                
                if (item.label === 'Home') {
                  // Home is active if we're on the home page (main or slug)
                  if (pathname === '/' || (pathname?.startsWith('/rsvp/') && !searchParams?.get('form'))) {
                    isActive = true
                  } else {
                    isActive = false
                  }
                } else if (item.label === 'RSVP') {
                  // Only highlight RSVP if:
                  // 1. We're on /rsvp (generic page)
                  // 2. We're on /rsvp/[slug] with ?form=true (form page)
                  // Don't highlight if we're on /rsvp/[slug] without ?form=true (home screen)
                  if (pathname === '/rsvp') {
                    isActive = true
                  } else if (pathname?.startsWith('/rsvp/')) {
                    // Check if we have the form parameter
                    isActive = searchParams?.get('form') === 'true'
                  }
                } else if (item.label === 'FAQ') {
                  // FAQ is active if we're on /faq
                  isActive = pathname === '/faq'
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`font-body text-sm tracking-wide transition-all duration-300 relative ${
                      isActive
                        ? 'text-charcoal'
                        : 'text-charcoal/70 hover:text-charcoal'
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage transition-all duration-300" />
                    )}
                    {!isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage scale-x-0 transition-transform duration-300 hover:scale-x-100 origin-left" />
                    )}
                  </Link>
                )
              })}
            </div>
            <div className="md:hidden">
              <button className="text-charcoal">☰</button>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
      <footer className="bg-charcoal text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-script text-2xl mb-2">With Love,</p>
          <p className="font-title text-lg mb-2">Kevin & Tiffany</p>
          {dateRange && (
            <p className="font-body text-sm text-white/70 tracking-wider">{dateRange}</p>
          )}
          <p className="font-script text-base text-white/60 mt-4">#tiffandko</p>
        </div>
      </footer>
    </div>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream">
        <nav className="border-b border-taupe/30 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="font-title text-2xl text-charcoal">
                Kevin & Tiffany
              </Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </div>
    }>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  )
}

