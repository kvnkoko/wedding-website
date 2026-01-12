'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { formatDate, formatDateRange } from '@/lib/utils'
import PhotoCarouselSection from '@/components/PhotoCarouselSection'
import { User, Calendar, Note, CheckCircle, Phone, X, Copy, Check, UserPlus } from 'phosphor-react'

// Parallax scroll effect
function useParallax() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollY
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const dynamicParams = true

interface Event {
  id: string
  name: string
  dateTime: string
  venueName: string
  city: string
}

interface InviteLinkConfig {
  id: string
  slug: string
  label: string
  events: Event[]
}

interface FormData {
  name: string
  phone: string
  side: string
  dietaryRequirements: string
  notes: string
  eventResponses: Record<string, string>
  eventPlusOnes: Record<string, {
    plusOne: boolean
    plusOneName: string
    plusOneRelation: string
  }>
}


function HomeScreenWithCarousel({ slug, config }: { slug: string; config: InviteLinkConfig | null }) {
  const scrollY = useParallax()
  // Calculate dateRange directly from config, don't use state to avoid flash
  const dateRange = config && config.events && config.events.length > 0 
    ? formatDateRange(config.events)
    : null // Don't show default date, show nothing until we have real data

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-cream dark:bg-dark-bg overflow-visible px-4 sm:px-6 lg:px-8">
        {/* Background Calla Lilies - Filling the space with elegant botanical illustrations */}
        {/* Mobile: Single large calla lily filling entire background */}
        <div 
          className="lg:hidden absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
          style={{ 
            opacity: 0.25,
          }}
        >
          <img
            src="/calla lily 1.png"
            alt=""
            className="object-contain w-full h-full"
            style={{ 
              minWidth: '100%',
              minHeight: '100%',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (target) {
                target.style.display = 'none'
              }
            }}
          />
        </div>

        {/* Desktop: Left Calla Lily Illustration */}
        <div 
          className="hidden lg:block absolute left-0 top-[15%] -translate-y-1/2 -translate-x-[12%] z-0 pointer-events-none parallax-slow"
          style={{ 
            opacity: 0.25,
            width: 'clamp(600px, 50vw, 900px)',
            height: 'auto',
            willChange: 'transform',
            transform: `rotate(-2deg) translateY(${scrollY * 0.3}px)`,
          }}
        >
          <img
            src="/calla lily 1.png"
            alt=""
            className="object-contain w-full h-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (target) {
                target.style.display = 'none'
              }
            }}
          />
        </div>

        {/* Right Calla Lily Illustration - Desktop only (both would be too crowded on mobile) */}
        <div 
          className="hidden lg:block absolute right-0 top-[20%] -translate-y-1/2 translate-x-[12%] z-0 pointer-events-none parallax-slow"
          style={{ 
            opacity: 0.25,
            width: 'clamp(580px, 48vw, 880px)',
            height: 'auto',
            willChange: 'transform',
            transform: `rotate(3deg) translateY(${scrollY * 0.2}px)`,
          }}
        >
          <img
            src="/calla lilly 2.png"
            alt=""
            className="object-contain w-full h-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (target) {
                target.style.display = 'none'
              }
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="flex flex-col items-center justify-center">
            {/* Center Content */}
            <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 md:space-y-12 py-4 sm:py-4 md:py-12 lg:py-20 -mt-16 sm:-mt-8 md:mt-0 w-full">
              <p className="text-charcoal/70 dark:text-dark-text-secondary tracking-[0.2em] uppercase mb-4 animate-fade-in-up animate-delay-300 scale-on-hover hero-float-delayed mobile-text-reveal" style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1.5rem)', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                Together with our families
              </p>
              
              {/* Main Names - Large Impactful Typography */}
              <div className="flex flex-col items-center space-y-4 md:space-y-6">
                <h1 className="font-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-charcoal dark:text-dark-text leading-[0.9] tracking-tight animate-fade-in-up animate-delay-400 hover:scale-105 transition-transform duration-500 hero-float-delayed mobile-text-reveal" style={{ fontSize: 'clamp(5.5rem, 18vw, 9rem)' }}>
                  <span className="block sm:inline" style={{ fontSize: 'inherit !important' }}>Kevin</span> <span className="block sm:inline" style={{ fontSize: 'inherit !important' }}>Koko</span>
                </h1>
                <p className="font-script text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-charcoal dark:text-dark-text mt-4 sm:mt-6 md:mt-8 lg:mt-10 xl:mt-12 relative z-20 animate-fade-in-up animate-delay-600 hero-float-delayed mobile-text-reveal" style={{ fontSize: 'clamp(2.25rem, 6vw, 3rem)' }}>
                  And
                </p>
                <h1 className="font-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-charcoal dark:text-dark-text leading-[0.9] tracking-tight animate-fade-in-up animate-delay-700 hover:scale-105 transition-transform duration-500 hero-float-delayed mobile-text-reveal" style={{ fontSize: 'clamp(5.5rem, 18vw, 9rem)' }}>
                  <span className="block sm:inline" style={{ fontSize: 'inherit !important' }}>Tiffany</span> <span className="block sm:inline" style={{ fontSize: 'inherit !important' }}>Min</span>
                </h1>
              </div>
              
              {/* Invitation Line */}
              <p className="font-script text-charcoal/70 dark:text-dark-text-secondary mt-4 md:mt-8 animate-fade-in-up animate-delay-800 scale-on-hover hero-float-delayed mobile-text-reveal" style={{ fontSize: 'clamp(1.875rem, 5.5vw, 2.5rem)' }}>
                Invite you to celebrate with us
              </p>
              
              {/* Date - Reserve space to prevent layout shift */}
              <div className="font-title text-charcoal/60 dark:text-dark-text-secondary mt-6 md:mt-10 tracking-wide min-h-[1.5em] animate-fade-in-up animate-delay-900 hero-float-delayed" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
                {dateRange ? (
                  <p style={{ fontSize: 'inherit' }}>{dateRange}</p>
                ) : (
                  <p className="invisible" style={{ fontSize: 'inherit' }}>January 22 - March 22, 2025</p>
                )}
              </div>
              
              <div className="mt-8 md:mt-12 animate-fade-in-up animate-delay-1000 hero-float-delayed">
                <Link
                  href={`/rsvp/${slug}?form=true`}
                  className="inline-block bg-charcoal dark:bg-dark-text dark:text-dark-bg text-white px-6 md:px-12 py-3 md:py-4 rounded-sm tracking-[0.15em] uppercase btn-hover-lift btn-glow magnetic shadow-lift ripple transition-all duration-300"
                  style={{ 
                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
                  }}
                >
                  RSVP
                </Link>
              </div>
              
              <p className="font-script text-charcoal/70 dark:text-dark-text-secondary mt-12 md:mt-16 animate-fade-in-up animate-delay-1000 scale-on-hover hero-float-delayed" style={{ fontSize: 'clamp(0.875rem, 2vw, 1.125rem)' }}>
                #tiffandko
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Information Section - Elegant & Compact - Overlaps hero to show graphics */}
      <section className="relative -mt-32 md:-mt-40 lg:-mt-48 py-12 md:py-16 bg-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-visible">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-sage rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-taupe rounded-full blur-3xl"></div>
            </div>
            
            {/* Main Content Card */}
            <div className="relative bg-white/70 dark:bg-dark-card/70 backdrop-blur-md border border-taupe/30 dark:border-dark-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group pointer-events-auto">
              {/* Elegant top accent line */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-sage/40 to-transparent"></div>
              
              <div className="p-6 md:p-8 lg:p-10">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                  {/* Icon/Visual Element */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-sage/10 dark:bg-sage/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 md:w-10 md:h-10 text-sage dark:text-sage/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-title text-xl md:text-2xl text-charcoal dark:text-dark-text mb-2 md:mb-3 tracking-tight">
                      Have Questions About Our Events?
                    </h3>
                    <p className="font-body text-sm md:text-base text-charcoal/70 dark:text-dark-text-secondary mb-4 md:mb-6 leading-relaxed">
                      Find detailed information about venues, dates, travel, and more in our FAQ section.
                    </p>
                    
                    {/* CTA Button */}
                    <Link
                      href="/faq"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal dark:bg-dark-text dark:text-dark-bg text-white rounded-sm tracking-[0.1em] uppercase text-xs md:text-sm font-medium hover:bg-sage dark:hover:bg-sage transition-all duration-300 shadow-sm hover:shadow-md group/btn"
                      style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                    >
                      <span>View FAQ</span>
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Subtle bottom accent line */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-sage/40 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Carousel Section - Transparent background to show hero graphics */}
      <section className="relative bg-transparent">
        <PhotoCarouselSection />
      </section>
    </div>
  )
}

export default function RSVPFormPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const [config, setConfig] = useState<InviteLinkConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submissionData, setSubmissionData] = useState<any>(null)
  const [plusOneCopied, setPlusOneCopied] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      side: 'Both',
      eventResponses: {},
      eventPlusOnes: {},
    },
  })

  // Fetch config when page loads
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch(`/api/rsvp/config/${slug}`)
        if (!res.ok) {
          // If slug doesn't exist, redirect to generic RSVP page
          if (res.status === 404) {
            router.push('/rsvp')
            return
          }
          // For other errors, still try to show something
          setLoading(false)
          return
        }
        const data = await res.json()
        setConfig(data)
      } catch (error) {
        console.error('Error fetching config:', error)
        router.push('/rsvp')
      } finally {
        setLoading(false)
      }
    }
    
    if (slug) {
      fetchConfig()
    }
  }, [slug, router])

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      // CRITICAL: Log the raw form data first to see what we're getting
      console.log('[Form Submit] RAW FORM DATA:', {
        eventResponses: data.eventResponses,
        eventPlusOnes: data.eventPlusOnes,
        allEventPlusOnesKeys: Object.keys(data.eventPlusOnes || {}),
        fullEventPlusOnes: JSON.stringify(data.eventPlusOnes, null, 2),
      })
      
      // Prepare event responses with plus one data
      const eventResponsesWithPlusOnes: Record<string, any> = {}
      Object.entries(data.eventResponses || {}).forEach(([eventId, status]) => {
        const plusOneData = data.eventPlusOnes?.[eventId]
        
        // CRITICAL: Log what we're getting for this specific event
        console.log(`[Form Submit] Event ${eventId} Plus One Data:`, {
          plusOneData,
          plusOneDataKeys: plusOneData ? Object.keys(plusOneData) : [],
          plusOneNameRaw: plusOneData?.plusOneName,
          plusOneRelationRaw: plusOneData?.plusOneRelation,
          plusOneCheckboxRaw: plusOneData?.plusOne,
          plusOneNameType: typeof plusOneData?.plusOneName,
          plusOneRelationType: typeof plusOneData?.plusOneRelation,
        })
        
        // Extract Plus One values - send raw values, don't filter them
        // The API will handle validation, we just need to send what the user entered
        // IMPORTANT: Don't check for empty string - send whatever we get
        const plusOneName = plusOneData?.plusOneName != null 
          ? String(plusOneData.plusOneName).trim() 
          : null
        const plusOneRelation = plusOneData?.plusOneRelation != null
          ? String(plusOneData.plusOneRelation).trim()
          : null
        // Handle checkbox value - can be boolean or string from form submission
        const plusOneValue = plusOneData?.plusOne
        const plusOneCheckbox = plusOneValue === true || 
                                 (typeof plusOneValue === 'number' && plusOneValue === 1) ||
                                 (typeof plusOneValue === 'string' && (plusOneValue === 'true' || plusOneValue === 'on' || plusOneValue === '1'))
        
        // Set plusOne to true if checkbox is checked OR if we have name/relation
        const plusOne = plusOneCheckbox || (plusOneName != null && plusOneName !== '') || (plusOneRelation != null && plusOneRelation !== '')
        
        // ALWAYS send the raw values - don't filter them out
        // The API will handle any necessary validation
        eventResponsesWithPlusOnes[eventId] = {
          status,
          plusOne: plusOne,
          plusOneName: plusOneName,  // Send the value, even if it might be empty
          plusOneRelation: plusOneRelation,  // Send the value, even if it might be empty
        }
        
        console.log(`[Form Submit] Processing event ${eventId}:`, {
          status,
          plusOneData: plusOneData,
          plusOneValue,
          plusOneCheckbox,
          plusOneName,
          plusOneRelation,
          finalPlusOne: plusOne,
          finalData: eventResponsesWithPlusOnes[eventId],
          allEventPlusOnes: data.eventPlusOnes,
        })
      })

      console.log('Submitting RSVP with event responses:', {
        eventResponses: eventResponsesWithPlusOnes,
        sampleEvent: Object.entries(eventResponsesWithPlusOnes)[0],
        allEvents: Object.entries(eventResponsesWithPlusOnes).map(([id, resp]: [string, any]) => ({
          eventId: id,
          status: resp.status,
          plusOne: resp.plusOne,
          plusOneName: resp.plusOneName,
          plusOneRelation: resp.plusOneRelation,
        })),
        rawFormData: {
          eventResponses: data.eventResponses,
          eventPlusOnes: data.eventPlusOnes,
        },
      })

      const res = await fetch('/api/rsvp/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: null,
          side: data.side,
          dietaryRequirements: data.dietaryRequirements,
          notes: data.notes,
          eventResponses: eventResponsesWithPlusOnes,
          inviteLinkConfigId: config?.id,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('RSVP submission failed:', res.status, errorData)
        // Show more detailed error message
        const errorMsg = errorData.details || errorData.error || 'Submission failed'
        console.error('Full error details:', JSON.stringify(errorData, null, 2))
        throw new Error(errorMsg)
      }

      const result = await res.json()
      
      // CRITICAL: Log the raw API response to see exactly what we're getting
      console.log('[RSVP Form] RAW API RESPONSE:', JSON.stringify(result, null, 2))
      console.log('[RSVP Form] Received submission result:', {
        hasEventResponses: !!result.eventResponses,
        eventResponsesCount: result.eventResponses?.length || 0,
        eventResponses: result.eventResponses?.map((er: any) => ({
          eventId: er.eventId,
          eventName: er.eventName,
          status: er.status,
          plusOne: er.plusOne,
          plusOneName: er.plusOneName,
          plusOneRelation: er.plusOneRelation,
          hasPlusOneData: !!(er.plusOne || er.plusOneName),
          allKeys: Object.keys(er),
          fullEventResponse: JSON.stringify(er, null, 2),
        })),
        fullResult: result,
      })
      setSubmissionData(result)
      setSubmitted(true)
    } catch (error: any) {
      console.error('RSVP submission error:', error)
      alert(error?.message || 'There was an error submitting your RSVP. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Check for edit token - if someone tries to edit, show message to contact directly
  const editToken = searchParams.get('edit')
  if (editToken) {
    return (
      <div className="min-h-screen py-20 px-4 bg-cream dark:bg-dark-bg flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center bg-white dark:bg-dark-card p-12 rounded-2xl shadow-xl dark:shadow-2xl border border-taupe/20 dark:border-dark-border">
          <h1 className="font-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-charcoal dark:text-dark-text mb-6">RSVP Changes</h1>
          <p className="text-lg text-charcoal/70 dark:text-dark-text-secondary mb-4 leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
            To make changes to your RSVP, please contact us directly.
          </p>
          <p className="text-base text-charcoal/60 dark:text-dark-text-secondary" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
            We'll be happy to help you update your RSVP or answer any questions you may have.
          </p>
        </div>
      </div>
    )
  }

  // Show form only if ?form=true is in URL (explicit request)
  // The Layout component ensures RSVP links include ?form=true when in slug context
  const showForm = searchParams.get('form') === 'true'
  
  if (!showForm) {
    // Don't render until we have config to avoid flash of incorrect content
    if (loading) {
      return (
        <div className="min-h-screen bg-cream dark:bg-dark-bg flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 animate-fade-in-up">
            <div className="spinner w-8 h-8 border-3 border-charcoal/30 dark:border-dark-text-secondary/30 border-t-charcoal dark:border-t-dark-text rounded-full"></div>
            <p className="text-lg text-charcoal/70 dark:text-dark-text-secondary" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Loading...</p>
          </div>
        </div>
      )
    }
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-cream dark:bg-dark-bg flex items-center justify-center">
          <p className="text-lg text-charcoal/70 dark:text-dark-text-secondary" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Loading...</p>
        </div>
      }>
        <HomeScreenWithCarousel slug={slug} config={config} />
      </Suspense>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4 bg-cream dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="flex flex-col items-center gap-4">
            <div className="spinner w-8 h-8 border-3 border-charcoal/30 dark:border-dark-text-secondary/30 border-t-charcoal dark:border-t-dark-text rounded-full"></div>
            <p className="text-lg text-charcoal/70 dark:text-dark-text-secondary" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen py-20 px-4 bg-cream dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-charcoal/70 dark:text-dark-text-secondary" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Invalid RSVP link</p>
        </div>
      </div>
    )
  }

  if (submitted && submissionData) {
    return (
      <div className="min-h-screen py-8 sm:py-12 md:py-20 px-4 bg-cream dark:bg-dark-bg flex items-center transition-colors duration-500">
        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-white/95 dark:bg-dark-card backdrop-blur-sm rounded-2xl shadow-2xl dark:shadow-2xl border border-taupe/10 dark:border-dark-border overflow-hidden animate-scale-in-bounce">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-sage/20 dark:from-sage/30 via-sage/10 dark:via-sage/20 to-transparent px-6 sm:px-8 md:px-12 pt-8 sm:pt-10 md:pt-12 pb-6 sm:pb-8 text-center border-b border-taupe/20 dark:border-dark-border">
              <div className="w-24 h-24 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-fade-in-up">
                <svg className="w-12 h-12 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
                <h1 className="font-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-charcoal dark:text-dark-text mb-4 animate-fade-in-up animate-delay-200">Thank You!</h1>
              <p className="text-lg text-charcoal/70 dark:text-dark-text-secondary animate-fade-in-up animate-delay-300" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
              Your RSVP has been received. We are looking forward to celebrating with you!
            </p>
            </div>
            
            <div className="p-6 sm:p-8 md:p-12">
              <div className="space-y-8">
                <div className="form-section">
                  <h2 className="form-section-title flex items-center gap-3">
                    <User className="w-6 h-6 text-sage" weight="duotone" />
                    Your Details
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-taupe/5 dark:bg-dark-surface p-4 rounded-xl">
                      <p className="text-xs uppercase tracking-wider text-charcoal/70 dark:text-dark-text-secondary mb-1">Name</p>
                      <p className="text-base text-charcoal dark:text-dark-text font-semibold" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>{submissionData.name}</p>
                    </div>
                    <div className="bg-taupe/5 dark:bg-dark-surface p-4 rounded-xl">
                      <p className="text-xs uppercase tracking-wider text-charcoal/70 dark:text-dark-text-secondary mb-1">Phone</p>
                      <p className="text-base text-charcoal dark:text-dark-text font-semibold" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>{submissionData.phone}</p>
                    </div>
                    <div className="bg-taupe/5 dark:bg-dark-surface p-4 rounded-xl">
                      <p className="text-xs uppercase tracking-wider text-charcoal/70 dark:text-dark-text-secondary mb-1">Side</p>
                      <p className="text-base text-charcoal dark:text-dark-text font-semibold" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>{submissionData.side}</p>
                    </div>
                </div>
              </div>

                <div className="form-section">
                  <h2 className="form-section-title flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-sage" weight="duotone" />
                    Your Responses
                  </h2>
                  <div className="space-y-3">
                    {(() => {
                      console.log('[RSVP Success Page] Rendering event responses:', {
                        eventResponses: submissionData.eventResponses,
                        count: submissionData.eventResponses?.length || 0,
                        sample: submissionData.eventResponses?.[0],
                      })
                      return null
                    })()}
                    {submissionData.eventResponses?.map((er: any, index: number) => {
                      // Log all available fields to debug - check multiple possible field names
                      const plusOneFromResponse = er.plusOne !== undefined ? er.plusOne : (er.plus_one !== undefined ? er.plus_one : false)
                      const plusOneNameFromResponse = er.plusOneName !== undefined ? er.plusOneName : (er.plus_one_name !== undefined ? er.plus_one_name : null)
                      const plusOneRelationFromResponse = er.plusOneRelation !== undefined ? er.plusOneRelation : (er.plus_one_relation !== undefined ? er.plus_one_relation : null)
                      
                      console.log(`[RSVP Success Page] Event response ${index}:`, {
                        eventId: er.eventId,
                        eventName: er.eventName,
                        status: er.status,
                        plusOne: er.plusOne,
                        plusOneName: er.plusOneName,
                        plusOneRelation: er.plusOneRelation,
                        plusOneFromResponse,
                        plusOneNameFromResponse,
                        plusOneRelationFromResponse,
                        hasPlusOne: plusOneFromResponse || (plusOneNameFromResponse && String(plusOneNameFromResponse).trim()),
                        allKeys: Object.keys(er),
                        rawData: JSON.stringify(er, null, 2),
                        // Check if Plus One fields exist at all
                        hasPlusOneField: 'plusOne' in er,
                        hasPlusOneNameField: 'plusOneName' in er,
                        hasPlusOneRelationField: 'plusOneRelation' in er,
                        // Check actual values
                        plusOneNameType: typeof er.plusOneName,
                        plusOneRelationType: typeof er.plusOneRelation,
                        plusOneNameLength: er.plusOneName ? String(er.plusOneName).length : 0,
                        plusOneRelationLength: er.plusOneRelation ? String(er.plusOneRelation).length : 0,
                      })
                      
                      // Normalize the data to use consistent field names
                      const normalizedEr = {
                        ...er,
                        plusOne: plusOneFromResponse,
                        plusOneName: plusOneNameFromResponse,
                        plusOneRelation: plusOneRelationFromResponse,
                      }
                      
                      return (
                      <div 
                        key={normalizedEr.eventId} 
                        className="event-card"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center justify-between mb-3">
              <div>
                            <p className="event-card-title">{normalizedEr.eventName}</p>
                            <p className="text-sm text-charcoal/60 dark:text-dark-text-secondary mt-1">
                              Status: <span className="font-semibold text-sage uppercase">{normalizedEr.status}</span>
                            </p>
                          </div>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            normalizedEr.status === 'YES' ? 'bg-sage/20 dark:bg-sage/30' : 'bg-taupe/20 dark:bg-dark-surface'
                          }`}>
                            {normalizedEr.status === 'YES' ? (
                              <CheckCircle className="w-6 h-6 text-sage" weight="fill" />
                            ) : (
                              <X className="w-6 h-6 text-charcoal/60 dark:text-dark-text-secondary/80" weight="bold" />
                            )}
                          </div>
                        </div>
                        {/* Show plus one info for this event if attending with plus one */}
                        {(() => {
                          // NUCLEAR OPTION: Check if fields exist in object AT ALL, regardless of value
                          const rawPlusOneName = normalizedEr.plusOneName
                          const rawPlusOneRelation = normalizedEr.plusOneRelation
                          const rawPlusOneFlag = normalizedEr.plusOne
                          
                          // Check if fields exist in the object itself (using 'in' operator)
                          const hasNameField = 'plusOneName' in normalizedEr
                          const hasRelationField = 'plusOneRelation' in normalizedEr
                          const hasFlagField = 'plusOne' in normalizedEr
                          
                          // Also check if values are truthy or non-empty strings
                          const hasNameValue = rawPlusOneName != null && rawPlusOneName !== undefined && String(rawPlusOneName).trim() !== ''
                          const hasRelationValue = rawPlusOneRelation != null && rawPlusOneRelation !== undefined && String(rawPlusOneRelation).trim() !== ''
                          const hasFlagValue = rawPlusOneFlag === true || rawPlusOneFlag === 1 || rawPlusOneFlag === 'true' || rawPlusOneFlag === '1'
                          
                          // Show if status is YES and (field exists OR value exists)
                          // This is the most permissive check possible
                          const shouldShow = normalizedEr.status === 'YES' && (
                            hasNameField || hasRelationField || hasFlagField || 
                            hasNameValue || hasRelationValue || hasFlagValue
                          )
                          
                          // Debug: log even when not showing to help diagnose
                          if (normalizedEr.status === 'YES' && !shouldShow) {
                            console.warn(`[RSVP Success Page] Plus One data exists but not showing for event ${normalizedEr.eventId}:`, {
                              status: normalizedEr.status,
                              plusOneFlag: rawPlusOneFlag,
                              plusOneName: rawPlusOneName,
                              plusOneRelation: rawPlusOneRelation,
                              hasNameField,
                              hasRelationField,
                              hasFlagField,
                              hasNameValue,
                              hasRelationValue,
                              hasFlagValue,
                              shouldShow,
                              allKeys: Object.keys(normalizedEr),
                            })
                          }
                          
                          // ALWAYS log for debugging - this is critical
                          console.log(`[RSVP Success Page] Plus One check for event ${normalizedEr.eventId} (${normalizedEr.eventName}):`, {
                            status: normalizedEr.status,
                            rawPlusOneFlag,
                            rawPlusOneName,
                            rawPlusOneRelation,
                            hasNameField,
                            hasRelationField,
                            hasFlagField,
                            hasNameValue,
                            hasRelationValue,
                            hasFlagValue,
                            shouldShow,
                            allKeys: Object.keys(normalizedEr),
                            fullEventResponse: JSON.stringify(normalizedEr, null, 2),
                          })
                          
                          // Show Plus One section - ALWAYS show if shouldShow is true
                          if (shouldShow) {
                            // Convert to strings for display
                            const plusOneNameValue = rawPlusOneName != null && rawPlusOneName !== undefined ? String(rawPlusOneName).trim() : null
                            const plusOneRelationValue = rawPlusOneRelation != null && rawPlusOneRelation !== undefined ? String(rawPlusOneRelation).trim() : null
                            
                            // Use the values we have - show them even if they're empty strings
                            const displayName = hasNameValue ? plusOneNameValue : (hasNameField ? (plusOneNameValue || 'Not provided') : null)
                            const displayRelation = hasRelationValue ? plusOneRelationValue : null
                            
                            // Always render the section if shouldShow is true
                            // Show name/relation fields even if values are empty - user submitted something
                            return (
                              <div className="mt-4 pt-4 border-t border-taupe/20 dark:border-dark-border">
                                <div className="bg-sage/10 dark:bg-sage/20 rounded-lg p-4 border border-sage/20 dark:border-sage/30">
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sage/20 dark:bg-sage/30 flex items-center justify-center">
                                      <UserPlus className="w-4 h-4 text-sage dark:text-sage/90" weight="duotone" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs uppercase tracking-wider text-sage dark:text-sage/90 font-semibold mb-2">Plus One</p>
                                      <div className="space-y-1.5">
                                        <div>
                                          <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-dark-text-secondary mb-0.5">Name</p>
                                          {displayName && displayName.length > 0 ? (
                                            <p className="text-sm text-charcoal dark:text-dark-text font-semibold" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                                              {displayName}
                                            </p>
                                          ) : (
                                            <p className="text-sm text-charcoal/60 dark:text-dark-text-secondary italic" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                                              Not provided
                                            </p>
                                          )}
                                        </div>
                                        {displayRelation && displayRelation.length > 0 && (
                                          <div>
                                            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-dark-text-secondary mb-0.5">Relationship</p>
                                            <p className="text-sm text-charcoal/80 dark:text-dark-text-secondary" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                                              {displayRelation}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          
                          // If we get here and status is YES, log why we're not showing
                          if (normalizedEr.status === 'YES' && !shouldShow) {
                            console.error(`[RSVP Success Page] NOT showing Plus One for event ${normalizedEr.eventId} even though status is YES:`, {
                              shouldShow,
                              hasNameField,
                              hasRelationField,
                              hasFlagField,
                              hasNameValue,
                              hasRelationValue,
                              hasFlagValue,
                              rawPlusOneName,
                              rawPlusOneRelation,
                              rawPlusOneFlag,
                              allKeys: Object.keys(normalizedEr),
                              normalizedEr: JSON.stringify(normalizedEr, null, 2),
                            })
                          }
                          
                          return null
                        })()}
                    </div>
                      )
                    })}
                </div>
              </div>

              {submissionData.notes && (
                  <div className="form-section">
                    <h2 className="form-section-title flex items-center gap-3">
                      <Note className="w-6 h-6 text-sage" weight="duotone" />
                      Note for the Bride & Groom
                    </h2>
                    <div className="bg-taupe/5 dark:bg-dark-surface p-6 rounded-xl border border-taupe/20 dark:border-dark-border">
                      <p className="text-base text-charcoal/80 dark:text-dark-text-secondary leading-relaxed italic" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>"{submissionData.notes}"</p>
                    </div>
                </div>
              )}
            </div>

              <div className="mt-12 pt-8 border-t border-taupe/20 dark:border-dark-border bg-gradient-to-r from-sage/5 dark:from-sage/10 via-transparent to-sage/5 dark:to-sage/10 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sage/20 dark:bg-sage/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal dark:text-dark-text mb-1" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Need to make changes?</p>
                    <p className="text-sm text-charcoal/70 dark:text-dark-text-secondary" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                      Please contact us directly if you need to update your RSVP or have any questions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 md:py-20 px-4 bg-cream dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/95 dark:bg-dark-card backdrop-blur-sm rounded-2xl shadow-2xl dark:shadow-2xl border border-taupe/10 dark:border-dark-border overflow-hidden animate-fade-in-up">
          {/* Header with gradient accent */}
          <div className="bg-gradient-to-r from-sage/10 dark:from-sage/20 via-taupe/5 dark:via-dark-surface to-transparent px-6 sm:px-8 md:px-12 pt-8 sm:pt-10 md:pt-12 pb-6 sm:pb-8 border-b border-taupe/20 dark:border-dark-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-sage/20 dark:bg-sage/30 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-sage" weight="fill" />
              </div>
              <div>
                <h1 className="font-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-charcoal dark:text-dark-text mb-2">RSVP</h1>
          {config.label && (
                  <p className="text-sm text-charcoal/60 dark:text-dark-text-secondary uppercase tracking-widest" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    {config.label.replace(/\s+Only\s*$/i, '')}
            </p>
          )}
              </div>
            </div>
            <p className="text-base text-charcoal/70 dark:text-dark-text-secondary mt-4" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
              Please fill out the form below to RSVP. We can't wait to celebrate with you!
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 md:p-12">
            {/* Personal Information */}
            <section className="form-section">
              <h2 className="form-section-title flex items-center gap-3">
                <User className="w-6 h-6 text-sage" weight="duotone" />
                Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="form-input-wrapper md:col-span-2">
                  <label className="form-label form-label-required">Full Name</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="form-input touch-ripple"
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="error-message mobile-shake">{errors.name.message}</p>
                  )}
                </div>

                <div className="form-input-wrapper md:col-span-2">
                  <label className="form-label form-label-required">Phone</label>
                  <input
                    {...register('phone', { required: 'Phone is required' })}
                    type="tel"
                    className="form-input touch-ripple"
                    placeholder="(678) 999-8212"
                  />
                  {errors.phone && (
                    <p className="error-message mobile-shake">{errors.phone.message}</p>
                  )}
                </div>

                <div className="form-input-wrapper md:col-span-2">
                  <label className="form-label">Side</label>
                  <select
                    {...register('side')}
                    className="form-select touch-ripple"
                  >
                    <option value="Bride">Bride</option>
                    <option value="Groom">Groom</option>
                    <option value="Both">Both</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Event Responses */}
            <section className="form-section">
              <h2 className="form-section-title flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-sage" weight="duotone" />
                Event Responses
              </h2>
              {config && config.events && config.events.length > 0 ? (
              <div className="space-y-4">
                {config.events.map((event, index) => (
                  <div 
                    key={event.id} 
                    className="event-card"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <h3 className="event-card-title">{event.name}</h3>
                    <p className="event-card-details">
                      {formatDate(event.dateTime)} • {event.venueName}, {event.city}
                    </p>
                    <div className="radio-group">
                      <label className="radio-option">
                        <input
                          type="radio"
                          {...register(`eventResponses.${event.id}`, { required: 'Please select a response' })}
                          value="YES"
                        />
                        <span>Yes, I'll be there!</span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          {...register(`eventResponses.${event.id}`)}
                          value="NO"
                        />
                        <span>Sorry, can't make it</span>
                      </label>
                    </div>
                    
                    {/* Plus One for this event - only show if attending */}
                    {watch(`eventResponses.${event.id}`) === 'YES' && (
                      <div className="mt-6 pt-6 border-t border-taupe/20 dark:border-dark-border animate-fade-in-up">
                        {/* Show "Add Same Plus One" button if there's a previous event with plus one info */}
                        {(() => {
                          const eventResponses = watch('eventResponses') || {}
                          const eventPlusOnes = watch('eventPlusOnes') || {}
                          
                          // Find a previous event (earlier in the list) with complete plus one info
                          const currentEventIndex = config.events.findIndex(e => e.id === event.id)
                          const previousEventWithPlusOne = config.events
                            .slice(0, currentEventIndex)
                            .find(prevEvent => {
                              const prevResponse = eventResponses[prevEvent.id]
                              const prevPlusOne = eventPlusOnes[prevEvent.id]
                              return prevResponse === 'YES' && 
                                     prevPlusOne?.plusOne && 
                                     prevPlusOne?.plusOneName && 
                                     prevPlusOne.plusOneName.trim()
                            })
                          
                          // Check if current event doesn't already have the same plus one info
                          const currentPlusOne = eventPlusOnes[event.id]
                          const currentResponse = eventResponses[event.id]
                          const needsCopy = previousEventWithPlusOne && 
                                           currentResponse === 'YES' && (
                            !currentPlusOne?.plusOne || 
                            !currentPlusOne?.plusOneName ||
                            currentPlusOne.plusOneName.trim() === '' ||
                            currentPlusOne.plusOneName !== eventPlusOnes[previousEventWithPlusOne.id]?.plusOneName
                          )
                          
                          const handleCopyFromPrevious = () => {
                            if (!previousEventWithPlusOne) return
                            
                            const sourcePlusOne = eventPlusOnes[previousEventWithPlusOne.id]
                            if (!sourcePlusOne?.plusOneName) return
                            
                            setValue(`eventPlusOnes.${event.id}.plusOne`, true)
                            setValue(`eventPlusOnes.${event.id}.plusOneName`, sourcePlusOne.plusOneName)
                            setValue(`eventPlusOnes.${event.id}.plusOneRelation`, sourcePlusOne.plusOneRelation || '')
                            
                            setPlusOneCopied(true)
                            setTimeout(() => setPlusOneCopied(false), 2000)
                          }
                          
                          if (needsCopy) {
                            return (
                              <div className="mb-4">
                                <button
                                  type="button"
                                  onClick={handleCopyFromPrevious}
                                  className="flex items-center gap-2 px-3 py-2 bg-sage/10 dark:bg-sage/20 hover:bg-sage/20 dark:hover:bg-sage/30 text-sage dark:text-sage/90 rounded-lg text-sm font-medium transition-all duration-200 border border-sage/30 dark:border-sage/40 shadow-sm hover:shadow-md touch-ripple w-full sm:w-auto"
                                >
                                  {plusOneCopied ? (
                                    <>
                                      <Check className="w-4 h-4" weight="bold" />
                                      <span>Added!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-4 h-4" weight="duotone" />
                                      <span>Add Same Plus One to This Event</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )
                          }
                          return null
                        })()}
                        
                        <label className="checkbox-option mb-4">
                          <input
                            type="checkbox"
                            {...register(`eventPlusOnes.${event.id}.plusOne`)}
                          />
                          <span className="text-base text-charcoal dark:text-dark-text" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                            I will be bringing a plus-one to this event
                          </span>
                        </label>

                        {watch(`eventPlusOnes.${event.id}.plusOne`) && (
                          <div className="ml-8 space-y-4 animate-fade-in-up bg-taupe/5 dark:bg-dark-surface p-4 rounded-xl border border-taupe/20 dark:border-dark-border">
                            <div className="form-input-wrapper">
                              <label className="form-label">Plus-One Name</label>
                              <input
                                {...register(`eventPlusOnes.${event.id}.plusOneName`)}
                                className="form-input touch-ripple"
                                placeholder="Enter their full name"
                              />
                            </div>
                            <div className="form-input-wrapper">
                              <label className="form-label">Relationship</label>
                              <input
                                {...register(`eventPlusOnes.${event.id}.plusOneRelation`)}
                                className="form-input touch-ripple"
                                placeholder="e.g., Spouse, Partner, Friend"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              ) : (
                <div className="border-2 border-taupe/30 border-dashed p-8 rounded-xl text-center bg-taupe/5">
                  <p className="text-base text-charcoal/70 dark:text-dark-text-secondary" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    No events found for this invitation. Please contact the administrator.
                  </p>
                </div>
              )}
            </section>

            {/* Additional Information */}
            <section className="form-section">
              <h2 className="form-section-title flex items-center gap-3">
                <Note className="w-6 h-6 text-sage" weight="duotone" />
                Additional Information
              </h2>
              <div className="form-input-wrapper">
                <label className="form-label">Leave a note for the Bride & Groom!</label>
                  <textarea
                    {...register('notes')}
                  rows={5}
                  className="form-textarea touch-ripple"
                  placeholder="Share your excitement, dietary restrictions, or any special requests..."
                />
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-taupe/20">
            <button
              type="submit"
              disabled={submitting}
                className="submit-button touch-ripple mobile-touch-glow"
            >
              {submitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>Submitting your RSVP...</span>
                </span>
              ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit RSVP
                  </span>
              )}
            </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

