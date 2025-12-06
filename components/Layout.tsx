'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { formatDateRange } from '@/lib/utils'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [rsvpLink, setRsvpLink] = useState('/rsvp')
  const [dateRange, setDateRange] = useState<string | null>(null) // Start with null - only show on slug pages

  // Determine RSVP link based on current route
  // IMPORTANT: Main page should NOT show event dates or RSVP links
  // Only show dates/RSVP when actually on a slug page
  useEffect(() => {
    const updateRsvpLinkAndDates = () => {
      if (typeof window === 'undefined') return

      // Only set RSVP link and dates if we're actually on a slug page
      // Main page (/) should not show any event information
      if (pathname?.startsWith('/rsvp/')) {
        // Extract slug from pathname (e.g., /rsvp/abc123 -> /rsvp/abc123)
        const slugPath = pathname
        // Store in localStorage for navigation within slug pages
        localStorage.setItem('rsvpSlug', slugPath)
        
        // Add ?form=true to show the form instead of redirecting
        setRsvpLink(`${slugPath}?form=true`)
        
        // Fetch event dates only for slug pages
        const slug = slugPath.replace('/rsvp/', '')
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
        setRsvpLink('/rsvp')
        setDateRange(null) // No dates on main page
        localStorage.removeItem('rsvpSlug') // Clear only on main page
      } else {
        // Other pages (like /faq) - don't clear localStorage, but don't show dates
        setRsvpLink('/rsvp')
        setDateRange(null)
        // Keep localStorage intact so slug pages can still access their FAQs
      }
    }

    updateRsvpLinkAndDates()
  }, [pathname])

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/faq', label: 'FAQ' },
    { href: rsvpLink, label: 'RSVP' },
  ]

  return (
    <div className="min-h-screen bg-cream">
      <nav className="border-b border-taupe/30 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-title text-2xl text-charcoal hover:text-sage transition-colors">
              Kevin & Tiffany
            </Link>
            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => {
                // Check if current path matches the nav item
                // For RSVP, only highlight if we're on the form page (with ?form=true) or the generic /rsvp page
                // Don't highlight if we're on a slug home page (without ?form=true)
                let isActive = item.href === pathname
                
                if (item.label === 'RSVP') {
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
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`font-body text-sm tracking-wide transition-colors ${
                      isActive
                        ? 'text-charcoal border-b-2 border-sage'
                        : 'text-charcoal/70 hover:text-charcoal'
                    }`}
                  >
                    {item.label}
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

