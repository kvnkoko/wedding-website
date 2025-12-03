'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [rsvpLink, setRsvpLink] = useState('/rsvp')
  const [dateRange, setDateRange] = useState('January - March 2025')

  // Determine RSVP link based on current route
  // If on a slug page, link to that slug's RSVP form
  // Also store it in localStorage so it persists across navigation
  useEffect(() => {
    const updateRsvpLinkAndDates = () => {
      if (typeof window === 'undefined') return

      let slugPath: string | null = null

      if (pathname?.startsWith('/rsvp/')) {
        // Extract slug from pathname (e.g., /rsvp/abc123 -> /rsvp/abc123)
        slugPath = pathname
        // Store in localStorage so we remember it even when navigating away
        localStorage.setItem('rsvpSlug', slugPath)
      } else {
        // Check if we have a stored slug
        slugPath = localStorage.getItem('rsvpSlug')
      }

      if (slugPath) {
        // Add ?form=true to show the form instead of redirecting
        setRsvpLink(`${slugPath}?form=true`)
        
        // Fetch event dates
        const slug = slugPath.replace('/rsvp/', '')
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
      } else {
        setRsvpLink('/rsvp')
        setDateRange('January - March 2025')
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
                    if (typeof window !== 'undefined') {
                      const searchParams = new URLSearchParams(window.location.search)
                      isActive = searchParams.get('form') === 'true'
                    } else {
                      // Server-side: don't highlight slug pages without form param
                      isActive = false
                    }
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
          <p className="font-body text-sm text-white/70 tracking-wider">{dateRange}</p>
          <p className="font-script text-base text-white/60 mt-4">#tiffandko</p>
        </div>
      </footer>
    </div>
  )
}

