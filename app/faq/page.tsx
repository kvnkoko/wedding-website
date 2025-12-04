'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

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

  useEffect(() => {
    // Get slug from multiple sources:
    // 1. Check localStorage for stored slug (most reliable)
    // 2. Check if we're on a slug page directly (from referrer)
    let inviteLinkSlug: string | null = null
    
    if (typeof window !== 'undefined') {
      // First, check localStorage (most reliable since it persists across navigation)
      const storedSlug = localStorage.getItem('rsvpSlug')
      console.log('[FAQ Page] Stored slug from localStorage:', storedSlug)
      if (storedSlug) {
        inviteLinkSlug = storedSlug.replace('/rsvp/', '')
        console.log('[FAQ Page] Extracted inviteLinkSlug from localStorage:', inviteLinkSlug)
      }
      
      // If not found in localStorage, try to get slug from document.referrer
      if (!inviteLinkSlug) {
        const referrer = document.referrer
        console.log('[FAQ Page] Referrer:', referrer)
        
        // Check if referrer contains /rsvp/ with a slug
        const referrerMatch = referrer.match(/\/rsvp\/([^\/\?]+)/)
        if (referrerMatch) {
          inviteLinkSlug = referrerMatch[1]
          console.log('[FAQ Page] Found slug from referrer:', inviteLinkSlug)
        }
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
      <div className="min-h-screen py-20 px-4 bg-cream flex items-center justify-center">
        <p className="font-sans text-lg text-charcoal/70">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-cream">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-6xl text-charcoal text-center mb-16">Frequently Asked Questions</h1>
        
        {faqs.length === 0 ? (
          <div className="bg-white p-8 rounded-sm shadow-sm text-center">
            <p className="font-sans text-base text-charcoal/70">
              No FAQs available at this time. Please check back later or contact us directly.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-white p-8 rounded-sm shadow-sm">
                  <h2 className="font-serif text-2xl text-charcoal mb-4">{faq.question}</h2>
                  <p className="font-sans text-base text-charcoal/70 leading-relaxed whitespace-pre-line mb-6">{faq.answer}</p>
                  {faq.colorHexCodes && faq.colorHexCodes.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-taupe/20">
                      <div className="flex items-center gap-6 flex-wrap">
                        <h3 className="font-sans text-base font-semibold text-charcoal uppercase tracking-wide whitespace-nowrap">
                          Colors to Wear
                        </h3>
                        <div className="flex items-center gap-3">
                          {faq.colorHexCodes.map((hex, index) => (
                            <div
                              key={index}
                              className="relative w-12 h-12 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: hex,
                                boxShadow: `
                                  inset 0 3px 6px rgba(0, 0, 0, 0.15),
                                  inset 0 -2px 3px rgba(0, 0, 0, 0.1),
                                  0 2px 6px rgba(0, 0, 0, 0.15)
                                `,
                              }}
                              title={hex}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-16 bg-white p-8 rounded-sm shadow-sm text-center">
              <h2 className="font-serif text-2xl text-charcoal mb-4">Still have questions?</h2>
              <p className="font-sans text-base text-charcoal/70">
                Please do not hesitate to reach out to us directly. We are happy to help!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

