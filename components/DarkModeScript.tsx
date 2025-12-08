'use client'

import { useEffect } from 'react'

export default function DarkModeScript() {
  useEffect(() => {
    // This runs immediately on mount to prevent flash
    const stored = localStorage.getItem('darkMode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    // Default to system preference on first visit
    const shouldBeDark = stored !== null ? stored === 'true' : prefersDark
    const bgColor = shouldBeDark ? '#1A1A1A' : '#FAF8F3'
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Only set background on the main layout container
    const mainDiv = document.querySelector('body > div')
    if (mainDiv) {
      (mainDiv as HTMLElement).style.setProperty('background-color', bgColor, 'important')
    }
  }, [])

  return null
}

