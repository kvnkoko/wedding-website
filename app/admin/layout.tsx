'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  ChartBar, 
  Users, 
  Calendar, 
  Link as LinkIcon, 
  Question, 
  Image as Images,
  SignOut,
  Sun,
  Moon,
  List,
  X,
  UserCircle
} from 'phosphor-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check system preference
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

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
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/dashboard', {
          credentials: 'include',
        })
        if (res.ok) {
          setAuthenticated(true)
        } else {
          router.push('/admin/login')
        }
      } catch {
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [pathname, router])

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const toggleDarkMode = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-dark-bg flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-sans text-lg text-charcoal dark:text-dark-text">Loading...</p>
        </div>
      </div>
    )
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!authenticated) {
    return null
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: ChartBar },
    { href: '/admin/rsvps', label: 'RSVPs', icon: Users },
    { href: '/admin/events', label: 'Events', icon: Calendar },
    { href: '/admin/invite-links', label: 'Invite Links', icon: LinkIcon },
    { href: '/admin/faqs', label: 'FAQs', icon: Question },
    { href: '/admin/photos', label: 'Photos', icon: Images },
    { href: '/admin/users', label: 'Users', icon: UserCircle },
  ]

  return (
    <div className="admin-portal min-h-screen bg-cream dark:bg-dark-bg transition-colors duration-300">
      {/* Top Header */}
      <header className="bg-white dark:bg-dark-surface border-b border-taupe/30 dark:border-dark-border shadow-sm sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/admin" className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-shrink">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-sage to-sage/70 flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 flex-shrink-0">
                K&T
              </div>
              <span className="font-title text-base sm:text-xl text-charcoal dark:text-dark-text group-hover:text-sage transition-colors duration-300 truncate">
                Admin Portal
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <button
                onClick={toggleDarkMode}
                className="p-2 sm:p-2.5 rounded-lg hover:bg-taupe/20 dark:hover:bg-dark-border transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-charcoal dark:text-dark-text" weight="duotone" />
                ) : (
                  <Moon className="w-5 h-5 text-charcoal dark:text-dark-text" weight="duotone" />
                )}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-sans text-xs sm:text-sm text-charcoal/70 dark:text-dark-text-secondary hover:text-charcoal dark:hover:text-dark-text hover:bg-taupe/10 dark:hover:bg-dark-border transition-all duration-200 min-h-[44px]"
              >
                <SignOut className="w-4 h-4 flex-shrink-0" weight="duotone" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm border-b border-taupe/20 dark:border-dark-border sticky top-16 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: Hamburger Menu Button */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-taupe/20 dark:border-dark-border">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-sans text-sm font-medium text-charcoal dark:text-dark-text hover:bg-taupe/10 dark:hover:bg-dark-border transition-all duration-200 min-h-[44px]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" weight="bold" />
              ) : (
                <List className="w-5 h-5" weight="bold" />
              )}
              <span>Menu</span>
            </button>
            {/* Show current page on mobile */}
            <span className="text-sm font-medium text-charcoal dark:text-dark-text">
              {navItems.find(item => item.href === pathname)?.label || 'Admin'}
            </span>
          </div>

          {/* Mobile: Dropdown Menu with Animation */}
          <div 
            className={`md:hidden border-b border-taupe/20 dark:border-dark-border bg-white dark:bg-dark-surface transition-all duration-300 ease-in-out overflow-hidden ${
              mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-2 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-sans text-sm font-medium transition-all duration-200 min-h-[44px] ${
                      isActive
                        ? 'text-sage bg-sage/10 dark:bg-sage/20 border-l-4 border-sage'
                        : 'text-charcoal/70 dark:text-dark-text-secondary hover:text-charcoal dark:hover:text-dark-text hover:bg-taupe/10 dark:hover:bg-dark-border active:bg-taupe/20 dark:active:bg-dark-border'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" weight={isActive ? 'duotone' : 'regular'} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Desktop: Horizontal Tab Navigation */}
          <div className="hidden md:block px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-3 font-sans text-sm font-medium transition-all duration-200 whitespace-nowrap min-h-[44px] ${
                      isActive
                        ? 'text-sage border-b-2 border-sage bg-sage/5 dark:bg-sage/10'
                        : 'text-charcoal/70 dark:text-dark-text-secondary hover:text-charcoal dark:hover:text-dark-text hover:bg-taupe/10 dark:hover:bg-dark-border'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" weight={isActive ? 'duotone' : 'regular'} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-4 sm:py-8 transition-colors duration-300">
        {children}
      </main>
    </div>
  )
}
