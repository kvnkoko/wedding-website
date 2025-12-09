'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

interface Event {
  id: string
  name: string
  dateTime: string
  venueName: string
  city: string
}

interface FormData {
  name: string
  phone: string
  email: string
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

export default function RSVPEditForm({ editToken }: { editToken: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submissionData, setSubmissionData] = useState<any>(null)
  const [rsvpData, setRsvpData] = useState<any>(null)
  const [events, setEvents] = useState<Event[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      eventResponses: {},
      eventPlusOnes: {},
    },
  })

  useEffect(() => {
    async function fetchRsvp() {
      try {
        const res = await fetch(`/api/rsvp/edit?token=${editToken}`)
        if (!res.ok) {
          router.push('/')
          return
        }
        const data = await res.json()
        setRsvpData(data.rsvp)
        setEvents(data.config.events)

        // Set form values
        setValue('name', data.rsvp.name)
        setValue('phone', data.rsvp.phone)
        setValue('email', data.rsvp.email || '')
        setValue('side', data.rsvp.side)
        setValue('notes', data.rsvp.notes || '')

        // Set event responses and plus ones
        const responses: Record<string, string> = {}
        const plusOnes: Record<string, any> = {}
        data.eventResponses.forEach((er: any) => {
          responses[er.eventId] = er.status
          if (er.plusOne) {
            plusOnes[er.eventId] = {
              plusOne: true,
              plusOneName: er.plusOneName || '',
              plusOneRelation: er.plusOneRelation || '',
            }
          }
        })
        setValue('eventResponses', responses)
        setValue('eventPlusOnes', plusOnes)
      } catch (error) {
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    fetchRsvp()
  }, [editToken, router, setValue])

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      // Prepare event responses with plus one data
      const eventResponsesWithPlusOnes: Record<string, any> = {}
      Object.entries(data.eventResponses || {}).forEach(([eventId, status]) => {
        const plusOneData = data.eventPlusOnes?.[eventId]
        eventResponsesWithPlusOnes[eventId] = {
          status,
          plusOne: plusOneData?.plusOne || false,
          plusOneName: plusOneData?.plusOneName || null,
          plusOneRelation: plusOneData?.plusOneRelation || null,
        }
      })

      const res = await fetch('/api/rsvp/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email,
          side: data.side,
          dietaryRequirements: data.dietaryRequirements,
          notes: data.notes,
          eventResponses: eventResponsesWithPlusOnes,
          editToken,
        }),
      })

      if (!res.ok) throw new Error('Update failed')

      const result = await res.json()
      setSubmissionData(result)
      setSubmitted(true)
    } catch (error) {
      alert('There was an error updating your RSVP. Please try again.')
    } finally {
      setSubmitting(false)
    }
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

  if (!rsvpData) {
    return (
      <div className="min-h-screen py-20 px-4 bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="font-sans text-lg text-charcoal/70">Invalid edit link</p>
        </div>
      </div>
    )
  }

  if (submitted && submissionData) {
    return (
      <div className="min-h-screen py-20 px-4 bg-cream">
        <div className="max-w-3xl mx-auto py-20">
          <div className="bg-white p-12 rounded-sm shadow-sm">
            <h1 className="font-serif text-5xl text-charcoal mb-8 text-center">RSVP Updated!</h1>
            <p className="font-sans text-lg text-charcoal/70 mb-8 text-center">
              Your RSVP has been successfully updated. Thank you!
            </p>

            <div className="space-y-6 mb-8">
              <div>
                <h2 className="font-serif text-2xl text-charcoal mb-4">Your Details</h2>
                <div className="space-y-2 font-sans text-base text-charcoal/70">
                  <p><strong>Name:</strong> {submissionData.name}</p>
                  <p><strong>Phone:</strong> {submissionData.phone}</p>
                  {submissionData.email && <p><strong>Email:</strong> {submissionData.email}</p>}
                  <p><strong>Side:</strong> {submissionData.side}</p>
                </div>
              </div>

              <div>
                <h2 className="font-serif text-2xl text-charcoal mb-4">Your Responses</h2>
                <div className="space-y-3">
                  {submissionData.eventResponses?.map((er: any) => (
                    <div key={er.eventId} className="border-l-4 border-sage pl-4">
                      <p className="font-sans font-semibold text-charcoal">{er.eventName}</p>
                      <p className="font-sans text-sm text-charcoal/70 mb-2">
                        Status: <span className="uppercase">{er.status}</span>
                      </p>
                      {/* Show plus one info for this event if attending with plus one */}
                      {er.status === 'YES' && er.plusOne && (
                        <div className="mt-2 pt-2 border-t border-taupe/20">
                          <p className="font-sans text-xs text-charcoal/50 uppercase tracking-wide mb-1">Plus One</p>
                          <p className="font-sans text-sm text-charcoal font-medium">
                            {er.plusOneName || 'Name not provided'}
                          </p>
                          {er.plusOneRelation && (
                            <p className="font-sans text-xs text-charcoal/60 mt-1">
                              {er.plusOneRelation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => router.push('/')}
                className="bg-charcoal text-white px-8 py-4 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-charcoal/90 transition-all"
              >
                Return to Home
              </button>
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
          <h1 className="font-serif text-5xl text-charcoal mb-4">Edit RSVP</h1>
          <p className="font-sans text-base text-charcoal/70 mb-8">
            Update your RSVP information below.
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
                    placeholder="(678) 999-8212"
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
              <div className="space-y-6">
                {events.map((event) => (
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
                    
                    {/* Plus One for this event - only show if attending */}
                    {watch(`eventResponses.${event.id}`) === 'YES' && (
                      <div className="mt-6 pt-6 border-t border-taupe/30">
                        <label className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            {...register(`eventPlusOnes.${event.id}.plusOne`)}
                            className="mr-2"
                          />
                          <span className="font-sans text-sm text-charcoal">I will be bringing a plus-one to this event</span>
                        </label>

                        {watch(`eventPlusOnes.${event.id}.plusOne`) && (
                          <div className="ml-6 space-y-4">
                            <div>
                              <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                                Plus-One Name
                              </label>
                              <input
                                {...register(`eventPlusOnes.${event.id}.plusOneName`)}
                                className="w-full px-4 py-3 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
                                placeholder="Enter their full name"
                              />
                            </div>
                            <div>
                              <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                                Relationship
                              </label>
                              <input
                                {...register(`eventPlusOnes.${event.id}.plusOneRelation`)}
                                className="w-full px-4 py-3 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
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
              {submitting ? 'Updating...' : 'Update RSVP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

