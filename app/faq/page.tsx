'use client'

import { useEffect, useState } from 'react'

interface Event {
  id: string
  name: string
  slug: string
}

export default function FAQPage() {
  const [attireAnswer, setAttireAnswer] = useState('We recommend semi-formal attire for all events. For the civil signing, business casual is appropriate. For the Mandalay celebration and Yangon reception, we suggest cocktail or semi-formal wear.')

  useEffect(() => {
    // Get stored slug from localStorage
    if (typeof window !== 'undefined') {
      const storedSlug = localStorage.getItem('rsvpSlug')
      if (storedSlug) {
        const slug = storedSlug.replace('/rsvp/', '')
        // Fetch events for this invite link
        fetch(`/api/rsvp/config/${slug}`)
          .then(res => res.json())
          .then(data => {
            if (data.events && data.events.length > 0) {
              // Determine attire based on events
              const eventNames = data.events.map((e: any) => e.name)
              const attireParts: string[] = []

              // Check for Civil Signing
              if (eventNames.some((name: string) => name === 'Civil Signing' || name.toLowerCase().includes('civil signing'))) {
                attireParts.push('For the Civil Signing ceremony, our theme is 70s Vintage Elegance in formal attire.')
              }
              
              // Check for Mandalay Celebration
              if (eventNames.some((name: string) => name === 'Mandalay Celebration' || name.toLowerCase().includes('mandalay'))) {
                attireParts.push('For our Myanmar traditional event in Mandalay, please wear Myanmar Traditional attire.')
              }
              
              // Check for Yangon Reception
              if (eventNames.some((name: string) => name === 'Yangon Reception' || (name.toLowerCase().includes('yangon') && name.toLowerCase().includes('reception')))) {
                attireParts.push('For the Yangon Reception, please wear formal western attire.')
              }

              if (attireParts.length > 0) {
                setAttireAnswer(attireParts.join(' '))
              }
            }
          })
          .catch(() => {
            // Keep default answer if fetch fails
          })
      }
    }
  }, [])

  const faqs = [
    {
      question: 'What should I wear?',
      answer: attireAnswer,
    },
    {
      question: 'Can I bring a plus-one?',
      answer: 'Plus-ones are welcome if indicated on your invitation. Please include your plus-one information when you RSVP.',
    },
    {
      question: 'What about dietary restrictions?',
      answer: 'Please let us know about any dietary restrictions or allergies when you RSVP. We will do our best to accommodate all dietary needs.',
    },
    {
      question: 'Will there be parking available?',
      answer: 'Yes, all venues have parking available. Please check with the venue directly for specific parking instructions.',
    },
    {
      question: 'What if I can only attend one event?',
      answer: 'That&apos;s perfectly fine! Please RSVP for the events you can attend. Each event is special and we&apos;d love to see you at whichever ones work for your schedule.',
    },
    {
      question: 'How do I update my RSVP?',
      answer: 'If you need to update your RSVP, please use the edit link provided in your confirmation email, or contact us directly.',
    },
    {
      question: 'What time should I arrive?',
      answer: 'We recommend arriving 15-30 minutes before the scheduled start time to allow for parking and seating.',
    },
    {
      question: 'Are children welcome?',
      answer: 'Children are welcome at all events. Please include them in your RSVP so we can plan accordingly.',
    },
  ]

  return (
    <div className="min-h-screen py-20 px-4 bg-cream">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-6xl text-charcoal text-center mb-16">Frequently Asked Questions</h1>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-8 rounded-sm shadow-sm">
              <h2 className="font-serif text-2xl text-charcoal mb-4">{faq.question}</h2>
              <p className="font-sans text-base text-charcoal/70 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white p-8 rounded-sm shadow-sm text-center">
          <h2 className="font-serif text-2xl text-charcoal mb-4">Still have questions?</h2>
          <p className="font-sans text-base text-charcoal/70">
            Please do not hesitate to reach out to us directly. We are happy to help!
          </p>
        </div>
      </div>
    </div>
  )
}

