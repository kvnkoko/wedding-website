'use client'

import { useEffect, useState, useRef } from 'react'
import { Sun, Moon, X } from 'phosphor-react'

export default function FirstVisitIndicator() {
  const [show, setShow] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const indicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('hasVisited')
    
    if (!hasVisited) {
      // Show indicator after a short delay
      setTimeout(() => {
        setShow(true)
        setIsAnimating(true)
        localStorage.setItem('hasVisited', 'true')
      }, 2000)
    }
  }, [])

  const handleDismiss = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setShow(false)
    }, 200)
  }

  if (!show) return null

  return (
    <div
      ref={indicatorRef}
      className={`fixed z-50 transition-all duration-300 ease-out ${
        isAnimating
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-95'
      }`}
      style={{ 
        top: '4.125rem',
        right: '3.125rem',
        transform: isAnimating ? 'translateX(50%)' : 'translateX(calc(50% + 1rem))',
      }}
    >
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl border border-taupe/20 dark:border-dark-border p-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-sage/20 dark:bg-sage/30 rounded-full animate-ping opacity-75"></div>
            <div className="relative w-6 h-6 bg-gradient-to-br from-sage to-mint rounded-full flex items-center justify-center">
              <Sun className="w-3 h-3 text-white" weight="fill" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-xs text-charcoal dark:text-dark-text leading-tight whitespace-nowrap" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
              <span className="font-semibold">Theme:</span> Click <Sun className="w-3 h-3 inline mx-0.5" weight="duotone" />/<Moon className="w-3 h-3 inline mx-0.5" weight="duotone" />
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-charcoal/40 dark:text-dark-text-secondary/40 hover:text-charcoal dark:hover:text-dark-text transition-colors duration-200 p-0.5"
            aria-label="Close"
          >
            <X className="w-3 h-3" weight="bold" />
          </button>
        </div>
      </div>
    </div>
  )
}

