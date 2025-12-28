'use client'

import { useEffect, useState } from 'react'
import { Copy, Check } from 'phosphor-react'

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
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const copyToClipboard = async (url: string, configId: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(configId)
      setTimeout(() => setCopiedUrl(null), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy URL. Please copy manually.')
    }
  }

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
        <p className="font-sans text-lg text-charcoal/70 dark:text-dark-text-secondary">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal dark:text-dark-text">Invite Links</h1>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="bg-charcoal dark:bg-dark-text dark:text-dark-bg text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-charcoal/90 dark:hover:bg-dark-text/90 transition-all w-full sm:w-auto min-h-[44px]"
        >
          Create Link
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-dark-card p-4 sm:p-6 lg:p-8 rounded-sm shadow-sm mb-6 sm:mb-8 border border-taupe/20 dark:border-dark-border" key={editing?.id || 'new'}>
          <h2 className="font-serif text-xl sm:text-2xl text-charcoal dark:text-dark-text mb-4 sm:mb-6">
            {editing ? 'Edit Invite Link' : 'Create Invite Link'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  key={`slug-${editing?.id || 'new'}`}
                  defaultValue={editing?.slug || ''}
                  required
                  className="w-full px-4 py-2 border border-taupe/30 dark:border-dark-border rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
                />
                <p className="mt-1 text-xs text-charcoal/70 dark:text-dark-text-secondary">
                  Used in URL: /rsvp/[slug]
                </p>
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                  Label
                </label>
                <input
                  type="text"
                  name="label"
                  key={`label-${editing?.id || 'new'}`}
                  defaultValue={editing?.label || ''}
                  required
                  className="w-full px-4 py-2 border border-taupe/30 dark:border-dark-border rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                key={`notes-${editing?.id || 'new'}`}
                defaultValue={editing?.notes || ''}
                rows={3}
                className="w-full px-4 py-2 border border-taupe/30 dark:border-dark-border rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
              />
            </div>
            <div>
              <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                Events
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border border-taupe/30 dark:border-dark-border rounded-sm p-4 bg-taupe/5 dark:bg-dark-surface">
                {events.map((event) => (
                  <label key={event.id} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="events"
                      value={event.id}
                      key={`event-${event.id}-${editing?.id || 'new'}`}
                      defaultChecked={
                        editing?.events.some((e) => e.event.id === event.id) || false
                      }
                      className="mr-2 w-4 h-4 text-sage border-taupe/30 dark:border-dark-border rounded focus:ring-sage"
                    />
                    <span className="font-sans text-sm text-charcoal dark:text-dark-text">{event.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                className="bg-charcoal dark:bg-dark-text dark:text-dark-bg text-white px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-charcoal/90 dark:hover:bg-dark-text/90 transition-all w-full sm:w-auto min-h-[44px]"
              >
                {editing ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
                className="bg-taupe/20 dark:bg-dark-border text-charcoal dark:text-dark-text px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-taupe/30 dark:hover:bg-dark-border/80 transition-all w-full sm:w-auto min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {configs.map((config) => (
          <div key={config.id} className="bg-white dark:bg-dark-card p-4 sm:p-6 rounded-sm shadow-sm border border-taupe/20 dark:border-dark-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-xl sm:text-2xl text-charcoal dark:text-dark-text mb-2">{config.label.replace(/\s+Only\s*$/i, '')}</h3>
                <p className="font-sans text-sm text-charcoal/70 dark:text-dark-text-secondary mb-2 break-all">
                  Slug: <span className="font-mono text-sage dark:text-sage/90">{config.slug}</span>
                </p>
                {config.notes && (
                  <p className="font-sans text-sm text-charcoal/70 dark:text-dark-text-secondary">{config.notes.replace(/\s+only\s*$/i, '')}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setEditing(config)
                  setShowForm(true)
                }}
                className="bg-sage text-white px-4 py-2.5 rounded-sm font-sans text-xs tracking-wider uppercase hover:bg-sage/90 transition-all w-full sm:w-auto min-h-[44px]"
              >
                Edit
              </button>
            </div>
            <div className="mb-4">
              <p className="font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">Events:</p>
              <div className="flex flex-wrap gap-2">
                {config.events.map((e) => (
                  <span
                    key={e.event.id}
                    className="bg-beige dark:bg-dark-surface px-3 py-1 rounded-sm font-sans text-xs text-charcoal dark:text-dark-text border border-taupe/20 dark:border-dark-border"
                  >
                    {e.event.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-beige dark:bg-dark-surface p-3 sm:p-4 rounded-sm border border-taupe/20 dark:border-dark-border">
              <p className="font-sans text-xs text-charcoal/70 dark:text-dark-text-secondary mb-2">RSVP URL:</p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                <p className="font-mono text-xs sm:text-sm text-sage dark:text-sage/90 break-all flex-1 min-w-0">
                  {typeof window !== 'undefined' &&
                    (() => {
                      // Use production URL if available, otherwise use current origin
                      const origin = window.location.origin
                      // Remove preview deployment hash if present (e.g., wedding-website-faz2o1kdc-kevin-kokos-projects.vercel.app -> wedding-website.vercel.app)
                      const productionUrl = origin.replace(/-[a-z0-9]+-kevin-kokos-projects\.vercel\.app$/, '.vercel.app')
                      return `${productionUrl}/rsvp/${config.slug}`
                    })()}
                </p>
                {typeof window !== 'undefined' && (
                  <button
                    onClick={() => {
                      const origin = window.location.origin
                      const productionUrl = origin.replace(/-[a-z0-9]+-kevin-kokos-projects\.vercel\.app$/, '.vercel.app')
                      const url = `${productionUrl}/rsvp/${config.slug}`
                      copyToClipboard(url, config.id)
                    }}
                    className="bg-sage text-white p-2.5 rounded-sm hover:bg-sage/90 transition-all flex-shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px]"
                    title={copiedUrl === config.id ? 'Copied!' : 'Copy URL'}
                  >
                    {copiedUrl === config.id ? (
                      <Check size={18} weight="bold" />
                    ) : (
                      <Copy size={18} weight="bold" />
                    )}
                  </button>
                )}
              </div>
              {typeof window !== 'undefined' && window.location.hostname.includes('-kevin-kokos-projects.vercel.app') && (
                <p className="font-sans text-xs text-charcoal/70 dark:text-dark-text-secondary italic">
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

