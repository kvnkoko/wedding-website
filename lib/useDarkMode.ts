'use client'

import { useEffect, useState } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check localStorage first, default to light mode if not set
    const stored = localStorage.getItem('darkMode')
    
    if (stored !== null) {
      setIsDark(stored === 'true')
    } else {
      // Default to light mode on first visit
      setIsDark(false)
      localStorage.setItem('darkMode', 'false')
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    }
  }, [isDark, mounted])

  const toggle = () => {
    setIsDark(!isDark)
  }

  return { isDark, toggle, mounted }
}

