'use client'

import { useEffect, useState } from 'react'

function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

interface Event {
  id: string
  name: string
  slug: string
  dateTime: string
  venueName: string
  city: string
  capacity: number
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Event | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      dateTime: formData.get('dateTime'),
      venueName: formData.get('venueName'),
      city: formData.get('city'),
      capacity: formData.get('capacity'),
    }

    try {
      const url = editing ? '/api/admin/events' : '/api/admin/events'
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
        fetchEvents()
      } else {
        alert('Error saving event')
      }
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Error saving event')
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
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal dark:text-dark-text">Events</h1>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="bg-charcoal dark:bg-dark-text dark:text-dark-bg text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-charcoal/90 dark:hover:bg-dark-text/90 transition-all w-full sm:w-auto min-h-[44px]"
        >
          Add Event
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-dark-card p-4 sm:p-6 lg:p-8 rounded-sm shadow-sm mb-6 sm:mb-8 border border-taupe/20 dark:border-dark-border">
          <h2 className="font-serif text-xl sm:text-2xl text-charcoal dark:text-dark-text mb-4 sm:mb-6">
            {editing ? 'Edit Event' : 'Create Event'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editing?.name || ''}
                  required
                  className="w-full px-4 py-2 border border-taupe/30 dark:border-dark-border rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  defaultValue={editing?.slug || ''}
                  required
                  className="w-full px-4 py-2 border border-taupe/30 dark:border-dark-border rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  defaultValue={
                    editing
                      ? new Date(editing.dateTime).toISOString().slice(0, 16)
                      : ''
                  }
                  required
                  className="w-full px-4 py-2 border border-taupe/30 dark:border-dark-border rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                  Venue Name
                </label>
                <input
                  type="text"
                  name="venueName"
                  defaultValue={editing?.venueName || ''}
                  required
                  className="w-full px-4 py-2 border border-taupe/30 dark:border-dark-border rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  defaultValue={editing?.city || ''}
                  required
                  className="w-full px-4 py-2 border border-taupe/30 dark:border-dark-border rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  defaultValue={editing?.capacity || ''}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-taupe/30 dark:border-dark-border rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
                />
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
        {events.map((event) => (
          <div key={event.id} className="bg-white dark:bg-dark-card p-4 sm:p-6 rounded-sm shadow-sm border border-taupe/20 dark:border-dark-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-xl sm:text-2xl text-charcoal dark:text-dark-text mb-2">{event.name}</h3>
                <div className="space-y-1 font-sans text-sm text-charcoal/70 dark:text-dark-text-secondary">
                  <p>{formatDateTime(event.dateTime)}</p>
                  <p>{event.venueName}, {event.city}</p>
                  <p>Capacity: {event.capacity} guests</p>
                  <p className="text-xs text-charcoal/70 dark:text-dark-text-secondary">Slug: {event.slug}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditing(event)
                  setShowForm(true)
                }}
                className="bg-sage text-white px-4 py-2.5 rounded-sm font-sans text-xs tracking-wider uppercase hover:bg-sage/90 transition-all w-full sm:w-auto min-h-[44px]"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

