'use client'

import { useEffect, useState } from 'react'

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
  }>
}

export default function AdminRSVPsPage() {
  const [rsvps, setRsvps] = useState<Rsvp[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [eventFilter, setEventFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [rsvpsRes, eventsRes] = await Promise.all([
          fetch('/api/admin/rsvps'),
          fetch('/api/admin/events'),
        ])

        if (rsvpsRes.ok) {
          const data = await rsvpsRes.json()
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

  const getStatusBadge = (status: string) => {
    const colors = {
      YES: 'bg-green-100 text-green-800',
      NO: 'bg-red-100 text-red-800',
      MAYBE: 'bg-yellow-100 text-yellow-800',
    }
    return (
      <span
        className={`px-2 py-1 rounded-sm text-xs font-sans font-medium ${
          colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status}
      </span>
    )
  }

  if (loading && rsvps.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-sans text-lg text-charcoal/70">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-5xl text-charcoal">RSVPs</h1>
        <button
          onClick={handleExport}
          className="bg-sage text-white px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-sage/90 transition-all"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-sm shadow-sm mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block font-sans text-sm font-medium text-charcoal mb-2">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email, phone..."
              className="w-full px-4 py-2 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>
          <div>
            <label className="block font-sans text-sm font-medium text-charcoal mb-2">
              Event
            </label>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full px-4 py-2 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
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
            <label className="block font-sans text-sm font-medium text-charcoal mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
            >
              <option value="">All Statuses</option>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
              <option value="MAYBE">Maybe</option>
            </select>
          </div>
        </div>
      </div>

      {/* RSVPs Table */}
      <div className="bg-white rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-taupe/30">
            <thead className="bg-beige">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-charcoal uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-charcoal uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-charcoal uppercase tracking-wider">
                  Side
                </th>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-charcoal uppercase tracking-wider">
                  Plus One
                </th>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-charcoal uppercase tracking-wider">
                  Event Responses
                </th>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-charcoal uppercase tracking-wider">
                  Invite Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-charcoal uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-taupe/30">
              {rsvps.map((rsvp) => (
                <tr key={rsvp.id} className="hover:bg-beige/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-sans text-sm font-medium text-charcoal">{rsvp.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-sans text-sm text-charcoal/70">{rsvp.phone}</div>
                    {rsvp.email && (
                      <div className="font-sans text-xs text-charcoal/60">{rsvp.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-sans text-sm text-charcoal/70">{rsvp.side}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {rsvp.plusOne ? (
                      <div className="font-sans text-sm text-charcoal/70">
                        {rsvp.plusOneName || 'Yes'}
                        {rsvp.plusOneRelation && (
                          <div className="text-xs text-charcoal/60">({rsvp.plusOneRelation})</div>
                        )}
                      </div>
                    ) : (
                      <span className="font-sans text-sm text-charcoal/40">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {rsvp.eventResponses.map((er, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="font-sans text-xs text-charcoal/70">{er.event.name}:</span>
                          {getStatusBadge(er.status)}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-sans text-xs text-sage">{rsvp.inviteLinkConfig.slug}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-sans text-xs text-charcoal/60">
                      {new Date(rsvp.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rsvps.length === 0 && (
          <div className="text-center py-12">
            <p className="font-sans text-lg text-charcoal/70">No RSVPs found</p>
          </div>
        )}
      </div>
    </div>
  )
}

