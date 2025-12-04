'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { formatDate, formatDateRange } from '@/lib/utils'
import PhotoCarouselSection from '@/components/PhotoCarouselSection'
import RSVPEditForm from '@/components/RSVPEditForm'

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
  email: string
  side: string
  plusOne: boolean
  plusOneName: string
  plusOneRelation: string
  dietaryRequirements: string
  notes: string
  eventResponses: Record<string, string>
}


function HomeScreenWithCarousel({ slug, config }: { slug: string; config: InviteLinkConfig | null }) {
  // Calculate dateRange directly from config, don't use state to avoid flash
  const dateRange = config && config.events && config.events.length > 0 
    ? formatDateRange(config.events)
    : null // Don't show default date, show nothing until we have real data

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-cream overflow-hidden px-4 sm:px-6 lg:px-8">
        {/* Background Tulips - Filling the space with elegant botanical illustrations */}
        {/* Left Tulip Illustration - Extended to fill more vertical space */}
        <div 
          className="hidden lg:block absolute left-0 top-[20%] -translate-y-1/2 -translate-x-[12%] z-0 pointer-events-none"
          style={{ 
            opacity: 0.1,
            width: 'clamp(600px, 50vw, 900px)',
            height: 'auto',
            filter: 'invert(1)',
            willChange: 'transform',
            transform: 'rotate(-2deg)',
            transition: 'opacity 0.3s ease',
          }}
        >
          <img
            src="/tulips.png"
            alt=""
            className="object-contain w-full h-auto"
            style={{ 
              filter: 'invert(1)',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (target) {
                target.style.display = 'none'
              }
            }}
          />
        </div>

        {/* Right Tulip Illustration - Extended to fill more vertical space */}
        <div 
          className="hidden lg:block absolute right-0 top-[25%] -translate-y-1/2 translate-x-[12%] z-0 pointer-events-none"
          style={{ 
            opacity: 0.1,
            width: 'clamp(580px, 48vw, 880px)',
            height: 'auto',
            filter: 'invert(1)',
            willChange: 'transform',
            transform: 'rotate(3deg)',
            transition: 'opacity 0.3s ease',
          }}
        >
          <img
            src="/tulips2.png"
            alt=""
            className="object-contain w-full h-auto"
            style={{ 
              filter: 'invert(1)',
            }}
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
            <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 md:space-y-12 py-4 sm:py-8 md:py-20 lg:py-32 -mt-16 sm:mt-0 w-full">
              <p className="font-body text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-charcoal/50 tracking-[0.2em] uppercase mb-4">
                Together with our families
              </p>
              
              <div className="flex flex-col items-center space-y-4 md:space-y-6">
                <h1 className="font-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-charcoal leading-[0.9] tracking-tight whitespace-nowrap">
                  Kevin Koko
                </h1>
                <p className="font-script text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-charcoal/80 mt-16 md:mt-20 lg:mt-24 xl:mt-28">
                  And
                </p>
                <h1 className="font-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-charcoal leading-[0.9] tracking-tight whitespace-nowrap">
                  Tiffany Min
                </h1>
              </div>
              
              <p className="font-script text-xl sm:text-2xl md:text-3xl lg:text-4xl text-charcoal/70 mt-4 md:mt-8">
                Invite you to celebrate with us
              </p>
              
              {/* Date - Reserve space to prevent layout shift */}
              <div className="font-title text-base sm:text-lg md:text-xl lg:text-2xl text-charcoal/60 mt-6 md:mt-10 tracking-wide min-h-[1.5em]">
                {dateRange ? (
                  <p>{dateRange}</p>
                ) : (
                  <p className="invisible">January 22 - March 22, 2025</p>
                )}
              </div>
              
              <div className="mt-8 md:mt-12">
                <Link
                  href={`/rsvp/${slug}?form=true`}
                  className="inline-block bg-charcoal text-white px-8 md:px-12 py-3 md:py-4 rounded-sm font-body text-xs md:text-sm tracking-[0.15em] uppercase hover:bg-charcoal/90 transition-all duration-300"
                >
                  RSVP
                </Link>
              </div>
              
              <p className="font-script text-sm md:text-base lg:text-lg text-charcoal/50 mt-12 md:mt-16">
                #tiffandko
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Carousel Section */}
      <PhotoCarouselSection />
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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      plusOne: false,
      side: 'Both',
      eventResponses: {},
    },
  })

  const plusOne = watch('plusOne')

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
      const res = await fetch('/api/rsvp/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          inviteLinkConfigId: config?.id,
        }),
      })

      if (!res.ok) throw new Error('Submission failed')

      const result = await res.json()
      setSubmissionData(result)
      setSubmitted(true)
    } catch (error) {
      alert('There was an error submitting your RSVP. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Check for edit token
  const editToken = searchParams.get('edit')
  if (editToken) {
    return <RSVPEditForm editToken={editToken} />
  }

  // If no form param, show home screen with hero section
  const showForm = searchParams.get('form') === 'true'
  if (!showForm) {
    // Don't render until we have config to avoid flash of incorrect content
    if (loading) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <p className="font-sans text-lg text-charcoal/70">Loading...</p>
        </div>
      )
    }
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <p className="font-sans text-lg text-charcoal/70">Loading...</p>
        </div>
      }>
        <HomeScreenWithCarousel slug={slug} config={config} />
      </Suspense>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4 bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="font-sans text-lg text-charcoal/70">Loading...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen py-20 px-4 bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="font-sans text-lg text-charcoal/70">Invalid RSVP link</p>
        </div>
      </div>
    )
  }

  if (submitted && submissionData) {
    return (
      <div className="min-h-screen py-20 px-4 bg-cream">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-12 rounded-sm shadow-sm">
            <h1 className="font-serif text-5xl text-charcoal mb-8 text-center">Thank You!</h1>
            <p className="font-sans text-lg text-charcoal/70 mb-8 text-center">
              Your RSVP has been received. We are looking forward to celebrating with you!
            </p>

            <div className="space-y-6 mb-8">
              <div>
                <h2 className="font-serif text-2xl text-charcoal mb-4">Your Details</h2>
                <div className="space-y-2 font-sans text-base text-charcoal/70">
                  <p><strong>Name:</strong> {submissionData.name}</p>
                  <p><strong>Phone:</strong> {submissionData.phone}</p>
                  {submissionData.email && <p><strong>Email:</strong> {submissionData.email}</p>}
                  <p><strong>Side:</strong> {submissionData.side}</p>
                  {submissionData.plusOne && (
                    <>
                      <p><strong>Plus One:</strong> {submissionData.plusOneName}</p>
                      {submissionData.plusOneRelation && (
                        <p><strong>Relationship:</strong> {submissionData.plusOneRelation}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div>
                <h2 className="font-serif text-2xl text-charcoal mb-4">Your Responses</h2>
                <div className="space-y-3">
                  {submissionData.eventResponses?.map((er: any) => (
                    <div key={er.eventId} className="border-l-4 border-sage pl-4">
                      <p className="font-sans font-semibold text-charcoal">{er.eventName}</p>
                      <p className="font-sans text-sm text-charcoal/70">
                        Status: <span className="uppercase">{er.status}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {submissionData.notes && (
                <div>
                  <h2 className="font-serif text-2xl text-charcoal mb-4">Note for the Bride & Groom</h2>
                  <p className="font-sans text-base text-charcoal/70">{submissionData.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-beige p-6 rounded-sm">
              <p className="font-sans text-sm text-charcoal/70 mb-2">
                <strong>Edit Link:</strong> You can edit your RSVP using this link:
              </p>
              <p className="font-sans text-xs text-sage break-all">
                {typeof window !== 'undefined' && `${window.location.origin}/?edit=${submissionData.editToken}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-cream">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-12 rounded-sm shadow-sm">
          <h1 className="font-serif text-5xl text-charcoal mb-4">RSVP</h1>
          {config.label && (
            <p className="font-sans text-sm text-charcoal/60 mb-4 uppercase tracking-wider">
              Invitation: {config.label.replace(/\s+Only\s*$/i, '')}
            </p>
          )}
          <p className="font-sans text-base text-charcoal/70 mb-8">
            Please fill out the form below to RSVP for your invited events.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-6">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-3 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('phone', { required: 'Phone is required' })}
                    type="tel"
                    className="w-full px-4 py-3 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                    Email
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-4 py-3 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>

                <div>
                  <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                    Side
                  </label>
                  <select
                    {...register('side')}
                    className="w-full px-4 py-3 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
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
            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-6">Event Responses</h2>
              {config && config.events && config.events.length > 0 ? (
              <div className="space-y-6">
                {config.events.map((event) => (
                  <div key={event.id} className="border border-taupe/30 p-6 rounded-sm">
                    <h3 className="font-serif text-xl text-charcoal mb-2">{event.name}</h3>
                    <p className="font-sans text-sm text-charcoal/70 mb-4">
                      {formatDate(event.dateTime)} • {event.venueName}, {event.city}
                    </p>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...register(`eventResponses.${event.id}`, { required: 'Please select a response' })}
                          value="YES"
                          className="mr-2"
                        />
                        <span className="font-sans text-sm text-charcoal">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...register(`eventResponses.${event.id}`)}
                          value="NO"
                          className="mr-2"
                        />
                        <span className="font-sans text-sm text-charcoal">No</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                <div className="border border-taupe/30 p-6 rounded-sm">
                  <p className="font-sans text-sm text-charcoal/70">
                    No events found for this invitation. Please contact the administrator.
                  </p>
                </div>
              )}
            </section>

            {/* Plus One */}
            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-6">Plus One</h2>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('plusOne')}
                    className="mr-2"
                  />
                  <span className="font-sans text-sm text-charcoal">I will be bringing a plus-one</span>
                </label>

                {plusOne && (
                  <>
                    <div>
                      <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                        Plus-One Name
                      </label>
                      <input
                        {...register('plusOneName')}
                        className="w-full px-4 py-3 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                        Relationship
                      </label>
                      <input
                        {...register('plusOneRelation')}
                        placeholder="e.g., Spouse, Partner, Friend"
                        className="w-full px-4 py-3 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
                      />
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Additional Information */}
            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-6">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                    Leave a note for the Bride & Groom!
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={4}
                    placeholder="Any additional notes or messages..."
                    className="w-full px-4 py-3 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-charcoal text-white px-8 py-4 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-charcoal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit RSVP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

