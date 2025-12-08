'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'phosphor-react'

export default function FirstVisitIndicator() {
  const [show, setShow] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('hasVisited')
    
    if (!hasVisited) {
      // Show indicator after a short delay
      setTimeout(() => {
        setShow(true)
        setIsAnimating(true)
        localStorage.setItem('hasVisited', 'true')
      }, 1500)
    }
  }, [])

  const handleDismiss = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setShow(false)
    }, 300)
  }

  if (!show) return null

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out ${
        isAnimating
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95'
      }`}
    >
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-taupe/20 dark:border-dark-border p-6 max-w-sm backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-sage/20 dark:bg-sage/30 rounded-full animate-ping"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-sage to-mint rounded-full flex items-center justify-center">
                <Sun className="w-6 h-6 text-white dark:text-dark-text" weight="fill" />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-title text-lg text-charcoal dark:text-dark-text mb-2">
              Light & Dark Mode
            </h3>
            <p className="font-body text-sm text-charcoal/70 dark:text-dark-text-secondary mb-4 leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
              Toggle between light and dark mode using the icon in the navigation bar.
            </p>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-cream dark:bg-dark-surface rounded-lg">
                <Sun className="w-4 h-4 text-charcoal dark:text-dark-text-secondary" weight="duotone" />
                <span className="font-body text-xs text-charcoal dark:text-dark-text-secondary" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Light</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-surface rounded-lg">
                <Moon className="w-4 h-4 text-dark-text-secondary" weight="duotone" />
                <span className="font-body text-xs text-dark-text-secondary" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Dark</span>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="w-full bg-sage hover:bg-sage/90 text-white px-4 py-2 rounded-lg font-body text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
            >
              Got it!
            </button>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-charcoal/40 dark:text-dark-text-secondary/40 hover:text-charcoal dark:hover:text-dark-text transition-colors duration-300"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

