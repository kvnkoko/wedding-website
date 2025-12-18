'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { formatDateRange } from '@/lib/utils'
import { useDarkMode } from '@/lib/useDarkMode'
import { Sun, Moon, Heart } from 'phosphor-react'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [rsvpLink, setRsvpLink] = useState('/rsvp')
  const [homeLink, setHomeLink] = useState('/')
  const [faqLink, setFaqLink] = useState('/faq')
  const [dateRange, setDateRange] = useState<string | null>(null) // Start with null - only show on slug pages
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isDark, toggle } = useDarkMode()

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (mobileMenuOpen && !target.closest('nav')) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileMenuOpen])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

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
      } else if (pathname === '/faq') {
        // On FAQ page - check if we have a stored slug to maintain context
        if (storedSlug) {
          // User came from a slug page - maintain slug context
          setHomeLink(storedSlug) // Home goes to slug home page
          setFaqLink('/faq')
          setRsvpLink(`${storedSlug}?form=true`) // RSVP goes to slug form
          setDateRange(null)
        } else {
          // No slug context - use main pages
          setHomeLink('/')
          setFaqLink('/faq')
          setRsvpLink('/rsvp')
          setDateRange(null)
        }
      } else if (pathname === '/rsvp') {
        // On generic RSVP page - always go to main homepage
        setHomeLink('/')
        setFaqLink('/faq')
        setRsvpLink('/rsvp')
        setDateRange(null)
        // Don't clear localStorage here - keep it for slug page navigation
      } else if (storedSlug) {
        // Other pages (like /travel) but we have a stored slug - keep slug context
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
    <div className="min-h-screen bg-cream dark:bg-dark-bg transition-colors duration-600 ease-in-out relative">
      <nav className="border-b border-taupe/30 dark:border-dark-border bg-white dark:bg-dark-surface/90 backdrop-blur-md sticky top-0 z-[100] shadow-sm transition-all duration-600 ease-in-out relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              href={homeLink} 
              className="flex items-center gap-3 group font-title text-2xl text-charcoal dark:text-dark-text hover:text-sage dark:hover:text-sage transition-all duration-500 ease-out"
            >
              <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                <img
                  src="/favicon.png"
                  alt=""
                  className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  }}
                />
              </div>
              <span className="relative text-lg sm:text-xl md:text-2xl">
                <span className="inline-block transition-transform duration-500 group-hover:scale-105">Kevin & Tiffany</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sage transition-all duration-500 group-hover:w-full"></span>
              </span>
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex space-x-8">
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
                      className={`group font-body text-sm tracking-wide transition-all duration-500 ease-out relative py-2 ${
                        isActive
                          ? 'text-charcoal dark:text-dark-text'
                          : 'text-charcoal/70 dark:text-dark-text-secondary hover:text-charcoal dark:hover:text-dark-text'
                      }`}
                    >
                      <span className="relative z-10 inline-block transition-transform duration-300 group-hover:translate-y-[-2px]">
                        {item.label}
                      </span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage transition-all duration-500 shadow-[0_0_8px_rgba(10,186,181,0.4)]" />
                      )}
                      {!isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage scale-x-0 transition-transform duration-500 hover:scale-x-100 origin-left group-hover:shadow-[0_0_8px_rgba(10,186,181,0.4)]" />
                      )}
                    </Link>
                  )
                })}
              </div>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggle}
                className="p-2 rounded-lg transition-all duration-300 hover:bg-taupe/30 dark:hover:bg-dark-border active:scale-95 text-charcoal dark:text-dark-text group"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" weight="duotone" />
                ) : (
                  <Moon className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-12" weight="duotone" />
                )}
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-3">
              {/* Dark Mode Toggle - Mobile */}
              <button
                onClick={toggle}
                className="p-2.5 rounded-xl transition-all duration-300 hover:bg-taupe/30 dark:hover:bg-dark-border active:scale-95 text-charcoal dark:text-dark-text touch-ripple relative overflow-hidden group"
                aria-label="Toggle dark mode"
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <Sun 
                    className={`absolute w-5 h-5 transition-all duration-500 ${isDark ? 'rotate-180 opacity-100 scale-100' : 'rotate-0 opacity-0 scale-0'}`}
                    weight="duotone" 
                  />
                  <Moon 
                    className={`absolute w-5 h-5 transition-all duration-500 ${!isDark ? 'rotate-0 opacity-100 scale-100' : '-rotate-180 opacity-0 scale-0'}`}
                    weight="duotone" 
                  />
                </div>
              </button>
              
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-charcoal dark:text-dark-text p-2.5 rounded-xl transition-all duration-300 hover:bg-taupe/30 dark:hover:bg-dark-border active:scale-95 touch-ripple relative overflow-hidden"
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
              >
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <svg 
                    className={`absolute w-6 h-6 transition-all duration-300 ${mobileMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <svg 
                    className={`absolute w-6 h-6 transition-all duration-300 ${mobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu Dropdown with Backdrop */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-[9999]">
              {/* Backdrop - covers entire screen */}
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />
              {/* Menu Container - positioned below nav */}
              <div className="absolute top-16 left-0 right-0 bg-white dark:bg-dark-surface backdrop-blur-xl border-b border-taupe/30 dark:border-dark-border shadow-2xl mobile-menu-container">
                <div className="px-4 py-3 space-y-0.5">
                  {navItems.map((item, index) => {
                    let isActive = item.href === pathname || item.href.split('?')[0] === pathname
                    
                    if (item.label === 'Home') {
                      if (pathname === '/' || (pathname?.startsWith('/rsvp/') && !searchParams?.get('form'))) {
                        isActive = true
                      } else {
                        isActive = false
                      }
                    } else if (item.label === 'RSVP') {
                      if (pathname === '/rsvp') {
                        isActive = true
                      } else if (pathname?.startsWith('/rsvp/')) {
                        isActive = searchParams?.get('form') === 'true'
                      }
                    } else if (item.label === 'FAQ') {
                      isActive = pathname === '/faq'
                    }
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`mobile-menu-item block font-body text-base tracking-wide transition-all duration-200 py-3.5 px-4 rounded-lg touch-ripple ${
                          isActive
                            ? 'text-charcoal dark:text-dark-text bg-sage/15 dark:bg-sage/25 border-l-[3px] border-sage'
                            : 'text-charcoal/80 dark:text-dark-text-secondary active:text-charcoal dark:active:text-dark-text active:bg-taupe/10 dark:active:bg-dark-border/30'
                        }`}
                        style={{ animationDelay: `${index * 0.04}s` }}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`w-1.5 h-1.5 rounded-full bg-sage transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-0'}`}></span>
                          <span className="font-medium">{item.label}</span>
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="relative z-0">{children}</main>
      <footer className="bg-charcoal dark:bg-dark-surface text-white dark:text-dark-text py-16 sm:py-20 mt-20 transition-all duration-600 ease-in-out border-t border-white/10 dark:border-dark-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            {/* With Love Section */}
            <div className="flex items-center justify-center gap-3 mb-4 animate-fade-in-up">
              <Heart className="w-4 h-4 text-white/60 dark:text-dark-text-secondary/60" weight="fill" />
              <p className="font-script text-xl sm:text-2xl text-white/90 dark:text-dark-text/90 tracking-wide">With Love,</p>
            </div>
            
            {/* Names */}
            <p className="font-title text-2xl sm:text-3xl text-white dark:text-dark-text mb-3 animate-fade-in-up animate-delay-200 tracking-tight">Kevin & Tiffany</p>
            
            {/* Date Range */}
            {dateRange && (
              <p className="font-body text-xs sm:text-sm text-white/60 dark:text-dark-text-secondary/70 tracking-widest uppercase animate-fade-in-up animate-delay-300 letter-spacing-wider">
                {dateRange}
              </p>
            )}
            
            {/* Divider */}
            <div className="flex items-center justify-center gap-4 my-6 animate-fade-in-up animate-delay-350">
              <div className="h-px w-12 bg-white/20 dark:bg-dark-text-secondary/20"></div>
              <div className="w-1 h-1 rounded-full bg-white/40 dark:bg-dark-text-secondary/40"></div>
              <div className="h-px w-12 bg-white/20 dark:bg-dark-text-secondary/20"></div>
            </div>
            
            {/* Hashtag */}
            <p className="font-script text-sm sm:text-base text-white/50 dark:text-dark-text-secondary/60 mt-6 animate-fade-in-up animate-delay-400 tracking-wide">
              #tiffandko
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream dark:bg-dark-bg transition-colors duration-500">
        <nav className="border-b border-taupe/30 dark:border-dark-border bg-white/80 dark:bg-dark-surface/90 backdrop-blur-md sticky top-0 z-50 shadow-sm transition-all duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-3 font-title text-2xl text-charcoal dark:text-dark-text">
                <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                  <img
                    src="/favicon.png"
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
                <span>Kevin & Tiffany</span>
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

