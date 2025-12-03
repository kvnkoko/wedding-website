'use client'

import { useEffect, useState } from 'react'

interface FAQ {
  id: string
  question: string
  answer: string
  order: number
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get stored slug from localStorage to determine which FAQs to show
    let inviteLinkSlug: string | null = null
    
    if (typeof window !== 'undefined') {
      const storedSlug = localStorage.getItem('rsvpSlug')
      if (storedSlug) {
        inviteLinkSlug = storedSlug.replace('/rsvp/', '')
      }
    }

    // Fetch FAQs based on invite link
    const url = inviteLinkSlug 
      ? `/api/faqs?inviteLinkSlug=${inviteLinkSlug}`
      : '/api/faqs'
    
    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch FAQs')
        }
        return res.json()
      })
      .then((data: FAQ[]) => {
        setFaqs(data.sort((a, b) => a.order - b.order))
      })
      .catch((error) => {
        console.error('Error fetching FAQs:', error)
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
                  <p className="font-sans text-base text-charcoal/70 leading-relaxed whitespace-pre-line">{faq.answer}</p>
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

