'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/dashboard')
        if (res.ok) {
          setAuthenticated(true)
        } else {
          if (pathname !== '/admin/login') {
            router.push('/admin/login')
          }
        }
      } catch {
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-sans text-lg text-charcoal/70">Loading...</p>
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
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/rsvps', label: 'RSVPs' },
    { href: '/admin/events', label: 'Events' },
    { href: '/admin/invite-links', label: 'Invite Links' },
  ]

  return (
    <div className="min-h-screen bg-cream">
      <nav className="bg-white border-b border-taupe/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-sans text-sm tracking-wide transition-colors ${
                    pathname === item.href
                      ? 'text-charcoal border-b-2 border-sage'
                      : 'text-charcoal/70 hover:text-charcoal'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="font-sans text-sm text-charcoal/70 hover:text-charcoal"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="py-8">{children}</main>
    </div>
  )
}

