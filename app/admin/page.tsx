'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardStats {
  stats: Array<{
    eventId: string
    eventName: string
    capacity: number
    yes: number
    no: number
    maybe: number
    totalAttendees: number
    plusOnes: number
  }>
  totals: {
    totalRsvps: number
    totalPlusOnes: number
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/dashboard')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-sans text-lg text-charcoal/70">Loading...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-sans text-lg text-charcoal/70">Error loading dashboard</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="font-serif text-5xl text-charcoal mb-8">Dashboard</h1>

      {/* Totals */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-6 rounded-sm shadow-sm">
          <h2 className="font-serif text-2xl text-charcoal mb-2">Total RSVPs</h2>
          <p className="font-sans text-4xl text-sage">{stats.totals.totalRsvps}</p>
        </div>
        <div className="bg-white p-6 rounded-sm shadow-sm">
          <h2 className="font-serif text-2xl text-charcoal mb-2">Total Plus-Ones</h2>
          <p className="font-sans text-4xl text-sage">{stats.totals.totalPlusOnes}</p>
        </div>
      </div>

      {/* Event Stats */}
      <div className="space-y-6">
        <h2 className="font-serif text-3xl text-charcoal">Event Statistics</h2>
        {stats.stats.map((stat) => (
          <div key={stat.eventId} className="bg-white p-6 rounded-sm shadow-sm">
            <h3 className="font-serif text-2xl text-charcoal mb-4">{stat.eventName}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="font-sans text-sm text-charcoal/70 mb-1">Yes</p>
                <p className="font-sans text-2xl text-green-600">{stat.yes}</p>
              </div>
              <div>
                <p className="font-sans text-sm text-charcoal/70 mb-1">No</p>
                <p className="font-sans text-2xl text-red-600">{stat.no}</p>
              </div>
              <div>
                <p className="font-sans text-sm text-charcoal/70 mb-1">Maybe</p>
                <p className="font-sans text-2xl text-yellow-600">{stat.maybe}</p>
              </div>
              <div>
                <p className="font-sans text-sm text-charcoal/70 mb-1">Plus-Ones</p>
                <p className="font-sans text-2xl text-sage">{stat.plusOnes}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-taupe/30">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-sans text-sm text-charcoal/70 mb-1">Total Attendees</p>
                  <p className="font-sans text-2xl text-charcoal">{stat.totalAttendees}</p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-sm text-charcoal/70 mb-1">Capacity</p>
                  <p className="font-sans text-2xl text-charcoal">
                    {stat.totalAttendees} / {stat.capacity}
                  </p>
                  <p className="font-sans text-xs text-charcoal/60 mt-1">
                    {((stat.totalAttendees / stat.capacity) * 100).toFixed(1)}% full
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Link
          href="/admin/rsvps"
          className="inline-block bg-charcoal text-white px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-charcoal/90 transition-all"
        >
          View All RSVPs →
        </Link>
      </div>
    </div>
  )
}

