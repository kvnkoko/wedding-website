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
  Moon
} from 'phosphor-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check system preference
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

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
  ]

  return (
    <div className="admin-portal min-h-screen bg-cream dark:bg-dark-bg transition-colors duration-300">
      {/* Top Header */}
      <header className="bg-white dark:bg-dark-surface border-b border-taupe/30 dark:border-dark-border shadow-sm sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage to-sage/70 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                K&T
              </div>
              <span className="font-title text-xl text-charcoal dark:text-dark-text group-hover:text-sage transition-colors duration-300">
                Admin Portal
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-taupe/20 dark:hover:bg-dark-border transition-colors duration-200"
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-sm text-charcoal/70 dark:text-dark-text-secondary hover:text-charcoal dark:hover:text-dark-text hover:bg-taupe/10 dark:hover:bg-dark-border transition-all duration-200"
              >
                <SignOut className="w-4 h-4" weight="duotone" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm border-b border-taupe/20 dark:border-dark-border sticky top-16 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 font-sans text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-sage border-b-2 border-sage bg-sage/5 dark:bg-sage/10'
                      : 'text-charcoal/70 dark:text-dark-text-secondary hover:text-charcoal dark:hover:text-dark-text hover:bg-taupe/10 dark:hover:bg-dark-border'
                  }`}
                >
                  <Icon className="w-4 h-4" weight={isActive ? 'duotone' : 'regular'} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8 transition-colors duration-300">
        {children}
      </main>
    </div>
  )
}
