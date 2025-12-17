'use client'

import { useEffect, useState } from 'react'
import { 
  MagnifyingGlass, 
  Funnel, 
  Download, 
  Pencil, 
  Trash, 
  User, 
  Users,
  Phone, 
  Envelope,
  Calendar,
  UserPlus,
  CheckCircle,
  XCircle,
  X
} from 'phosphor-react'

interface Rsvp {
  id: string
  name: string
  phone: string
  email: string | null
  side: string
  plusOne: boolean
  plusOneName: string | null
  plusOneRelation: string | null
  dietaryRequirements: string | null
  notes: string | null
  createdAt: string
  inviteLinkConfig: {
    slug: string
    label: string
  }
  eventResponses: Array<{
    event: {
      id: string
      name: string
    }
    status: string
    plusOne?: boolean
    plusOneName?: string | null
    plusOneRelation?: string | null
  }>
}

export default function AdminRSVPsPage() {
  const [rsvps, setRsvps] = useState<Rsvp[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [eventFilter, setEventFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([])
  const [editing, setEditing] = useState<Rsvp | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [rsvpsRes, eventsRes] = await Promise.all([
          fetch('/api/admin/rsvps'),
          fetch('/api/admin/events'),
        ])

        if (rsvpsRes.ok) {
          const data = await rsvpsRes.json()
          console.log('[Admin RSVPs Page] Fetched RSVPs:', {
            count: data.length,
            sampleRsvp: data[0],
            sampleEventResponse: data[0]?.eventResponses?.[0],
            allEventResponses: data.flatMap((r: Rsvp) => 
              r.eventResponses.map(er => ({
                rsvpName: r.name,
                eventName: er.event.name,
                status: er.status,
                plusOne: er.plusOne,
                plusOneName: er.plusOneName,
                plusOneRelation: er.plusOneRelation,
                hasPlusOneData: !!(er.plusOne || er.plusOneName),
              }))
            ),
            responsesWithPlusOne: data.flatMap((r: Rsvp) => 
              r.eventResponses
                .filter(er => er.plusOne || er.plusOneName)
                .map(er => ({
                  rsvpName: r.name,
                  eventName: er.event.name,
                  status: er.status,
                  plusOne: er.plusOne,
                  plusOneName: er.plusOneName,
                  plusOneRelation: er.plusOneRelation,
                }))
            ),
          })
          setRsvps(data)
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
    fetchData()
  }, [])

  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (eventFilter) params.set('eventId', eventFilter)
        if (statusFilter) params.set('status', statusFilter)

        const res = await fetch(`/api/admin/rsvps?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setRsvps(data)
        }
      } catch (error) {
        console.error('Error fetching filtered RSVPs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFiltered()
  }, [search, eventFilter, statusFilter])

  const handleExport = async () => {
    const params = new URLSearchParams()
    if (eventFilter) params.set('eventId', eventFilter)
    if (statusFilter) params.set('status', statusFilter)

    const res = await fetch(`/api/admin/export?${params.toString()}`)
    if (res.ok) {
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rsvps-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this RSVP?')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/rsvps?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (eventFilter) params.set('eventId', eventFilter)
        if (statusFilter) params.set('status', statusFilter)

        const fetchRes = await fetch(`/api/admin/rsvps?${params.toString()}`)
        if (fetchRes.ok) {
          const data = await fetchRes.json()
          setRsvps(data)
        }
      } else {
        alert('Error deleting RSVP')
      }
    } catch (error) {
      console.error('Error deleting RSVP:', error)
      alert('Error deleting RSVP')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const eventResponses: Record<string, string> = {}

    editing?.eventResponses.forEach((er) => {
      const value = formData.get(`event-${er.event.id}`) as string
      if (value) {
        eventResponses[er.event.id] = value
      }
    })

    const data = {
      id: editing?.id,
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email') || null,
      side: formData.get('side'),
      plusOne: formData.get('plusOne') === 'on',
      plusOneName: formData.get('plusOneName') || null,
      plusOneRelation: formData.get('plusOneRelation') || null,
      notes: formData.get('notes') || null,
      eventResponses,
    }

    try {
      const res = await fetch('/api/admin/rsvps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setShowForm(false)
        setEditing(null)
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (eventFilter) params.set('eventId', eventFilter)
        if (statusFilter) params.set('status', statusFilter)

        const fetchRes = await fetch(`/api/admin/rsvps?${params.toString()}`)
        if (fetchRes.ok) {
          const data = await fetchRes.json()
          setRsvps(data)
        }
      } else {
        alert('Error updating RSVP')
      }
    } catch (error) {
      console.error('Error updating RSVP:', error)
      alert('Error updating RSVP')
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'YES') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-sans font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
          <CheckCircle className="w-3 h-3" weight="fill" />
          Yes
        </span>
      )
    } else if (status === 'NO') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-sans font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          <XCircle className="w-3 h-3" weight="fill" />
          No
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-sans font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
        {status}
      </span>
    )
  }

  if (loading && rsvps.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-sans text-lg text-charcoal dark:text-dark-text">Loading RSVPs...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-title text-4xl sm:text-5xl text-charcoal dark:text-dark-text mb-2">RSVPs</h1>
          <p className="font-sans text-base text-charcoal/60 dark:text-dark-text-secondary">
            Manage and review all guest responses
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-sage text-white px-6 py-3 rounded-lg font-sans text-sm font-medium hover:bg-sage/90 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Download className="w-4 h-4" weight="duotone" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md border border-taupe/20 dark:border-dark-border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Funnel className="w-5 h-5 text-charcoal dark:text-dark-text" weight="duotone" />
          <h2 className="font-title text-lg text-charcoal dark:text-dark-text">Filters</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40 dark:text-dark-text-secondary" weight="duotone" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, email, phone..."
                className="w-full pl-10 pr-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
              />
            </div>
          </div>
          <div>
            <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
              Event
            </label>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
            >
              <option value="">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
            >
              <option value="">All Statuses</option>
              <option value="YES">Attending</option>
              <option value="NO">Declined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {showForm && editing && (
        <div className="bg-white dark:bg-dark-card p-8 rounded-xl shadow-lg border border-taupe/20 dark:border-dark-border mb-8" key={editing.id}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-title text-2xl text-charcoal dark:text-dark-text">Edit RSVP</h2>
            <button
              onClick={() => {
                setShowForm(false)
                setEditing(null)
              }}
              className="p-2 hover:bg-taupe/10 dark:hover:bg-dark-border rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-charcoal dark:text-dark-text" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editing.name}
                  required
                  className="w-full px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editing.phone}
                  required
                  className="w-full px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editing.email || ''}
                  className="w-full px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                  Side
                </label>
                <select
                  name="side"
                  defaultValue={editing.side}
                  className="w-full px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
                >
                  <option value="Bride">Bride</option>
                  <option value="Groom">Groom</option>
                  <option value="Both">Both</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-4">
                Event Responses
              </label>
              <div className="grid md:grid-cols-2 gap-3 border border-taupe/30 dark:border-dark-border rounded-lg p-4 bg-taupe/5 dark:bg-dark-surface">
                {editing.eventResponses.map((er) => (
                  <div key={er.event.id} className="flex items-center gap-3">
                    <span className="font-sans text-sm text-charcoal dark:text-dark-text w-32 flex-shrink-0">{er.event.name}:</span>
                    <select
                      name={`event-${er.event.id}`}
                      defaultValue={er.status}
                      className="flex-1 px-3 py-2 border border-taupe/30 dark:border-dark-border rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-bg dark:text-dark-text transition-all duration-200"
                    >
                      <option value="YES">Yes</option>
                      <option value="NO">No</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                defaultValue={editing.notes || ''}
                rows={3}
                className="w-full px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-charcoal dark:bg-dark-text dark:text-dark-bg text-white px-6 py-3 rounded-lg font-sans text-sm font-medium hover:bg-charcoal/90 dark:hover:bg-dark-text/90 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Update RSVP
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
                className="bg-taupe/20 dark:bg-dark-border text-charcoal dark:text-dark-text px-6 py-3 rounded-lg font-sans text-sm font-medium hover:bg-taupe/30 dark:hover:bg-dark-border/80 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RSVPs List */}
      {rsvps.length === 0 ? (
        <div className="bg-white dark:bg-dark-card p-12 rounded-xl shadow-md border border-taupe/20 dark:border-dark-border text-center">
          <Users className="w-16 h-16 text-charcoal/30 dark:text-dark-text-secondary mx-auto mb-4" weight="duotone" />
          <p className="font-sans text-lg text-charcoal/70 dark:text-dark-text-secondary">No RSVPs found</p>
          {(search || eventFilter || statusFilter) && (
            <p className="font-sans text-sm text-charcoal/50 dark:text-dark-text-secondary mt-2">
              Try adjusting your filters
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {rsvps.map((rsvp) => (
            <div
              key={rsvp.id}
              className="bg-white dark:bg-dark-card rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-taupe/20 dark:border-dark-border overflow-hidden"
            >
              {/* RSVP Header */}
              <div className="bg-gradient-to-r from-sage/10 to-sage/5 dark:from-sage/20 dark:to-sage/10 px-6 py-4 border-b border-taupe/20 dark:border-dark-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sage to-sage/70 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {rsvp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-title text-xl text-charcoal dark:text-dark-text">{rsvp.name}</h3>
                      <p className="font-sans text-sm text-charcoal/60 dark:text-dark-text-secondary">
                        {rsvp.inviteLinkConfig.label} • {new Date(rsvp.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(rsvp)
                        setShowForm(true)
                      }}
                      className="flex items-center gap-2 bg-sage text-white px-4 py-2 rounded-lg font-sans text-sm font-medium hover:bg-sage/90 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Pencil className="w-4 h-4" weight="duotone" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rsvp.id)}
                      className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-sans text-sm font-medium hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Trash className="w-4 h-4" weight="duotone" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* RSVP Content */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Contact Info */}
                  <div>
                    <h4 className="font-sans text-sm font-semibold text-charcoal dark:text-dark-text mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-sage" weight="duotone" />
                      Contact Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-charcoal/70 dark:text-dark-text-secondary">
                        <Phone className="w-4 h-4" weight="duotone" />
                        <span>{rsvp.phone}</span>
                      </div>
                      {rsvp.email && (
                        <div className="flex items-center gap-2 text-sm text-charcoal/70 dark:text-dark-text-secondary">
                          <Envelope className="w-4 h-4" weight="duotone" />
                          <span>{rsvp.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-charcoal/60 dark:text-dark-text-secondary">Side:</span>
                        <span className="px-2 py-1 bg-taupe/20 dark:bg-dark-border rounded text-charcoal dark:text-dark-text text-xs font-medium">
                          {rsvp.side}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Event Responses */}
                  <div>
                    <h4 className="font-sans text-sm font-semibold text-charcoal dark:text-dark-text mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-sage" weight="duotone" />
                      Event Responses
                    </h4>
                    <div className="space-y-3">
                      {(() => {
                        console.log(`[Admin Frontend] Rendering event responses for RSVP ${rsvp.name}:`, {
                          eventResponses: rsvp.eventResponses,
                          count: rsvp.eventResponses?.length || 0,
                          sample: rsvp.eventResponses?.[0],
                        })
                        return null
                      })()}
                      {(rsvp.eventResponses || []).map((er, idx) => {
                        console.log(`[Admin Frontend] Event response ${idx} for ${rsvp.name}:`, {
                          eventId: er.eventId,
                          eventName: er.event?.name,
                          status: er.status,
                          plusOne: er.plusOne,
                          plusOneName: er.plusOneName,
                          plusOneRelation: er.plusOneRelation,
                        })
                        return (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-taupe/5 dark:bg-dark-surface border border-taupe/20 dark:border-dark-border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-sans text-sm font-medium text-charcoal dark:text-dark-text">
                              {er.event.name}
                            </span>
                            {getStatusBadge(er.status)}
                          </div>
                          {/* Per-Event Plus One */}
                          {(() => {
                            const hasPlusOne = er.plusOne || (er.plusOneName && er.plusOneName.trim())
                            const plusOneName = er.plusOneName?.trim() || null
                            
                            if (er.status === 'YES' && hasPlusOne) {
                              return (
                                <div className="mt-2 pt-2 border-t border-taupe/20 dark:border-dark-border">
                                  <div className="flex items-start gap-2">
                                    <UserPlus className="w-4 h-4 text-sage dark:text-sage/90 flex-shrink-0 mt-0.5" weight="duotone" />
                                    <div className="flex-1">
                                      <div className="text-xs font-semibold text-charcoal dark:text-dark-text mb-1">
                                        Plus One
                                      </div>
                                      <div className="text-sm text-charcoal dark:text-dark-text font-medium">
                                        {plusOneName || 'Name not provided'}
                                      </div>
                                      {er.plusOneRelation && er.plusOneRelation.trim() && (
                                        <div className="text-xs text-charcoal/70 dark:text-dark-text-secondary mt-1">
                                          {er.plusOneRelation}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            } else if (er.status === 'YES') {
                              return (
                                <div className="mt-2 pt-2 border-t border-taupe/20 dark:border-dark-border">
                                  <div className="text-xs text-charcoal/50 dark:text-dark-text-secondary/70 italic">
                                    No plus one
                                  </div>
                                </div>
                              )
                            }
                            return null
                          })()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {rsvp.notes && (
                  <div className="pt-4 border-t border-taupe/20 dark:border-dark-border">
                    <h4 className="font-sans text-sm font-semibold text-charcoal dark:text-dark-text mb-2">
                      Notes
                    </h4>
                    <p className="font-sans text-sm text-charcoal/70 dark:text-dark-text-secondary italic">
                      {rsvp.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
