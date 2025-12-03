'use client'

import { useEffect, useState } from 'react'

interface Event {
  id: string
  name: string
}

interface InviteLinkConfig {
  id: string
  slug: string
  label: string
  notes: string | null
  events: Array<{
    event: Event
  }>
}

export default function AdminInviteLinksPage() {
  const [configs, setConfigs] = useState<InviteLinkConfig[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<InviteLinkConfig | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [configsRes, eventsRes] = await Promise.all([
        fetch('/api/admin/invite-links'),
        fetch('/api/admin/events'),
      ])

      if (configsRes.ok) {
        const data = await configsRes.json()
        setConfigs(data)
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const selectedEvents = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[name="events"]:checked')
    ).map((input) => input.value)

    const data = {
      slug: formData.get('slug'),
      label: formData.get('label'),
      notes: formData.get('notes'),
      eventIds: selectedEvents,
    }

    try {
      const url = '/api/admin/invite-links'
      const method = editing ? 'PUT' : 'POST'
      const body = editing ? { ...data, id: editing.id } : data

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowForm(false)
        setEditing(null)
        fetchData()
      } else {
        alert('Error saving invite link config')
      }
    } catch (error) {
      console.error('Error saving invite link config:', error)
      alert('Error saving invite link config')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-sans text-lg text-charcoal/70">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-5xl text-charcoal">Invite Links</h1>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="bg-charcoal text-white px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-charcoal/90 transition-all"
        >
          Create Link
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-sm shadow-sm mb-8" key={editing?.id || 'new'}>
          <h2 className="font-serif text-2xl text-charcoal mb-6">
            {editing ? 'Edit Invite Link' : 'Create Invite Link'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  key={`slug-${editing?.id || 'new'}`}
                  defaultValue={editing?.slug || ''}
                  required
                  className="w-full px-4 py-2 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
                />
                <p className="mt-1 text-xs text-charcoal/60">
                  Used in URL: /rsvp/[slug]
                </p>
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                  Label
                </label>
                <input
                  type="text"
                  name="label"
                  key={`label-${editing?.id || 'new'}`}
                  defaultValue={editing?.label || ''}
                  required
                  className="w-full px-4 py-2 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </div>
            </div>
            <div>
              <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                key={`notes-${editing?.id || 'new'}`}
                defaultValue={editing?.notes || ''}
                rows={3}
                className="w-full px-4 py-2 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
              />
            </div>
            <div>
              <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                Events
              </label>
              <div className="grid md:grid-cols-3 gap-3 border border-taupe/30 rounded-sm p-4">
                {events.map((event) => (
                  <label key={event.id} className="flex items-center">
                    <input
                      type="checkbox"
                      name="events"
                      value={event.id}
                      key={`event-${event.id}-${editing?.id || 'new'}`}
                      defaultChecked={
                        editing?.events.some((e) => e.event.id === event.id) || false
                      }
                      className="mr-2"
                    />
                    <span className="font-sans text-sm text-charcoal">{event.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-charcoal text-white px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-charcoal/90 transition-all"
              >
                {editing ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
                className="bg-taupe text-charcoal px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-taupe/90 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {configs.map((config) => (
          <div key={config.id} className="bg-white p-6 rounded-sm shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-serif text-2xl text-charcoal mb-2">{config.label.replace(/\s+Only\s*$/i, '')}</h3>
                <p className="font-sans text-sm text-charcoal/70 mb-2">
                  Slug: <span className="font-mono text-sage">{config.slug}</span>
                </p>
                {config.notes && (
                  <p className="font-sans text-sm text-charcoal/60">{config.notes.replace(/\s+only\s*$/i, '')}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setEditing(config)
                  setShowForm(true)
                }}
                className="bg-sage text-white px-4 py-2 rounded-sm font-sans text-xs tracking-wider uppercase hover:bg-sage/90 transition-all"
              >
                Edit
              </button>
            </div>
            <div className="mb-4">
              <p className="font-sans text-sm font-medium text-charcoal mb-2">Events:</p>
              <div className="flex flex-wrap gap-2">
                {config.events.map((e) => (
                  <span
                    key={e.event.id}
                    className="bg-beige px-3 py-1 rounded-sm font-sans text-xs text-charcoal"
                  >
                    {e.event.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-beige p-4 rounded-sm">
              <p className="font-sans text-xs text-charcoal/70 mb-1">RSVP URL:</p>
              <p className="font-mono text-sm text-sage break-all mb-2">
                {typeof window !== 'undefined' &&
                  (() => {
                    // Use production URL if available, otherwise use current origin
                    const origin = window.location.origin
                    // Remove preview deployment hash if present (e.g., wedding-website-faz2o1kdc-kevin-kokos-projects.vercel.app -> wedding-website.vercel.app)
                    const productionUrl = origin.replace(/-[a-z0-9]+-kevin-kokos-projects\.vercel\.app$/, '.vercel.app')
                    return `${productionUrl}/rsvp/${config.slug}`
                  })()}
              </p>
              {typeof window !== 'undefined' && window.location.hostname.includes('-kevin-kokos-projects.vercel.app') && (
                <p className="font-sans text-xs text-charcoal/50 italic">
                  ⚠️ Preview URLs require Vercel login. Use production URL above for sharing.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

