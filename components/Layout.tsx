'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/travel', label: 'Travel' },
    { href: '/faq', label: 'FAQ' },
    { href: '/rsvp', label: 'RSVP' },
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
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-body text-sm tracking-wide transition-colors ${
                    pathname === item.href
                      ? 'text-charcoal border-b-2 border-sage'
                      : 'text-charcoal/70 hover:text-charcoal'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
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
          <p className="font-body text-sm text-white/70 tracking-wider">January - March 2025</p>
          <p className="font-script text-base text-white/60 mt-4">#tiffanyandko</p>
        </div>
      </footer>
    </div>
  )
}

