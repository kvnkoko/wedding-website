'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Question, Envelope, CheckCircle } from 'phosphor-react'

interface FAQ {
  id: string
  question: string
  answer: string
  colorHexCodes: string[] | null
  order: number
}

export default function FAQPage() {
  const pathname = usePathname()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            setVisibleItems((prev) => new Set(prev).add(index))
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    const elements = document.querySelectorAll('[data-faq-item]')
    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [faqs])

  useEffect(() => {
    // Get slug for FAQ filtering
    // Rules:
    // 1. If referrer is from /rsvp/[slug], use that slug
    // 2. If referrer is from main page (/) or /faq, DON'T use localStorage (public access)
    // 3. If no referrer or referrer from slug page, use localStorage if available
    let inviteLinkSlug: string | null = null
    
    if (typeof window !== 'undefined') {
      const referrer = document.referrer
      const referrerMatch = referrer ? referrer.match(/\/rsvp\/([^\/\?]+)/) : null
      const isFromMainPage = referrer && (referrer.endsWith('/') || referrer.includes('/faq') || referrer.match(/^https?:\/\/[^\/]+\/?$/))
      
      if (referrerMatch) {
        // Coming from a slug page - use that slug
        inviteLinkSlug = referrerMatch[1]
        console.log('[FAQ Page] Found slug from referrer (slug page):', inviteLinkSlug)
      } else if (!isFromMainPage) {
        // Not from main page - check localStorage (user might have navigated from slug page)
        const storedSlug = localStorage.getItem('rsvpSlug')
        if (storedSlug) {
          inviteLinkSlug = storedSlug.replace('/rsvp/', '')
          console.log('[FAQ Page] Using stored slug from localStorage:', inviteLinkSlug)
        } else {
          console.log('[FAQ Page] No slug - showing only General FAQs')
        }
      } else {
        // Coming from main page or /faq - show only General FAQs (public access)
        console.log('[FAQ Page] Access from main page - showing only General FAQs')
      }
    }

    // Decode the slug if it's URL-encoded (localStorage stores it encoded)
    // Then re-encode it properly for the URL
    let finalSlug = inviteLinkSlug
    if (finalSlug) {
      try {
        // Decode it fully (handles cases where it might be encoded multiple times)
        let decoded = finalSlug
        let previousDecoded = ''
        while (previousDecoded !== decoded) {
          previousDecoded = decoded
          try {
            decoded = decodeURIComponent(decoded)
          } catch (e) {
            decoded = previousDecoded
            break
          }
        }
        // Now encode it properly once for the URL
        finalSlug = encodeURIComponent(decoded)
        console.log('[FAQ Page] Decoded slug from:', inviteLinkSlug, 'to:', decoded, 'then encoded to:', finalSlug)
      } catch (e) {
        console.error('[FAQ Page] Error decoding slug:', e)
        // If decoding fails, just use it as-is
        finalSlug = inviteLinkSlug
      }
    }

    // Fetch FAQs based on invite link
    const url = finalSlug 
      ? `/api/faqs?inviteLinkSlug=${finalSlug}`
      : '/api/faqs'
    
    console.log('[FAQ Page] Fetching FAQs from:', url)
    
    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch FAQs')
        }
        return res.json()
      })
      .then((data: FAQ[]) => {
        console.log('[FAQ Page] Received FAQs:', data.length)
        console.log('[FAQ Page] FAQ details:', data.map(f => ({ 
          id: f.id, 
          question: f.question.substring(0, 50),
          inviteLinkConfigId: (f as any).inviteLinkConfigId 
        })))
        setFaqs(data.sort((a, b) => a.order - b.order))
      })
      .catch((error) => {
        console.error('[FAQ Page] Error fetching FAQs:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4 bg-cream dark:bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
          <div className="spinner w-8 h-8 border-3 border-charcoal/30 dark:border-dark-text-secondary/30 border-t-charcoal dark:border-t-dark-text rounded-full"></div>
          <p className="font-body text-lg text-charcoal/70 dark:text-dark-text-secondary animate-fade-in transition-colors duration-600" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-cream dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20 animate-fade-in-up">
          <h1 className="font-title text-5xl sm:text-6xl md:text-7xl text-charcoal dark:text-dark-text mb-4 tracking-tight">Frequently Asked Questions</h1>
          <div className="w-24 h-1 bg-sage dark:bg-sage/80 mx-auto mt-6 rounded-full"></div>
        </div>
        
        {faqs.length === 0 ? (
          <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm p-12 rounded-2xl shadow-xl dark:shadow-2xl border border-taupe/20 dark:border-dark-border text-center animate-fade-in-up animate-delay-200 card-hover">
            <div className="w-16 h-16 bg-taupe/10 dark:bg-dark-text/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Question className="w-8 h-8 text-charcoal/40 dark:text-dark-text-secondary/60" weight="duotone" />
            </div>
            <p className="font-body text-lg text-charcoal/70 dark:text-dark-text-secondary transition-colors duration-600" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
              No FAQs available at this time. Please check back later or contact us directly.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <div 
                  key={faq.id} 
                  data-faq-item
                  data-index={index}
                  className={`group relative bg-white/95 dark:bg-dark-card backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-2xl border border-taupe/10 dark:border-dark-border overflow-hidden transition-all duration-700 ease-out card-hover ${
                    visibleItems.has(index) 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-12 scale-95'
                  }`}
                  style={{ transitionDelay: `${index * 0.08}s` }}
                >
                  {/* Elegant top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sage via-sage/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="p-6 sm:p-8 md:p-10 lg:p-12">
                    {/* Question with elegant styling */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sage/10 dark:bg-sage/20 flex items-center justify-center mt-1 group-hover:bg-sage/20 dark:group-hover:bg-sage/30 transition-colors duration-300">
                        <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="font-title text-2xl md:text-3xl text-charcoal dark:text-dark-text leading-tight group-hover:text-sage transition-colors duration-300 flex-1">
                        {faq.question}
                      </h2>
                    </div>
                    
                    {/* Answer with beautiful typography */}
                    <div className="ml-14">
                      <p className="text-base md:text-lg text-charcoal/75 dark:text-dark-text leading-relaxed whitespace-pre-line mb-8 transition-colors duration-600" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                        {faq.answer}
                      </p>
                      
                      {/* Color swatches with premium design */}
                      {faq.colorHexCodes && faq.colorHexCodes.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-taupe/20 dark:border-dark-border">
                        <div className="flex items-center gap-6 flex-wrap">
                          <h3 className="text-sm font-semibold text-charcoal/60 dark:text-dark-text-secondary uppercase tracking-widest whitespace-nowrap flex items-center gap-2" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                            <span className="w-1 h-1 rounded-full bg-sage"></span>
                            Colors to Wear
                          </h3>
                            <div className="flex items-center gap-4">
                              {faq.colorHexCodes.map((hex, colorIndex) => (
                                <div
                                  key={colorIndex}
                                  className="relative group/color"
                                >
                                  <div
                                    className="relative w-14 h-14 rounded-full flex-shrink-0 cursor-pointer transition-all duration-500 hover:scale-125 hover:z-10 hover:shadow-2xl"
                                    style={{
                                      backgroundColor: hex,
                                      boxShadow: `
                                        0 4px 12px rgba(0, 0, 0, 0.15),
                                        inset 0 2px 4px rgba(255, 255, 255, 0.2),
                                        inset 0 -2px 4px rgba(0, 0, 0, 0.1)
                                      `,
                                    }}
                                    title={hex}
                                  >
                                    <div className="absolute inset-0 rounded-full bg-white/0 group-hover/color:bg-white/20 transition-all duration-300"></div>
                                    <div className="absolute -inset-1 rounded-full border-2 border-transparent group-hover/color:border-sage/30 transition-all duration-300"></div>
                                  </div>
                                  {/* Tooltip on hover */}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-charcoal text-white text-xs rounded opacity-0 group-hover/color:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                                    {hex}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sage/0 via-sage/0 to-sage/0 group-hover:from-sage/5 group-hover:via-sage/0 group-hover:to-sage/5 transition-all duration-700 pointer-events-none"></div>
                </div>
              ))}
            </div>

            {/* Contact card with premium design */}
            <div 
              className="mt-12 sm:mt-16 md:mt-20 relative bg-gradient-to-br from-white dark:from-dark-card via-white dark:via-dark-card to-taupe/5 dark:to-dark-surface backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-2xl border border-taupe/20 dark:border-dark-border p-6 sm:p-8 md:p-12 text-center animate-fade-in-up card-hover overflow-hidden" 
              style={{ animationDelay: `${(faqs.length + 1) * 0.08}s` }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sage to-transparent"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-sage/10 dark:bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Envelope className="w-10 h-10 text-sage" weight="duotone" />
                </div>
                <h2 className="font-title text-3xl text-charcoal dark:text-dark-text mb-4">Still have questions?</h2>
                <p className="text-lg text-charcoal/70 dark:text-dark-text-secondary max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                  Please do not hesitate to reach out to us directly. We are happy to help!
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

