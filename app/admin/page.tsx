'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import React from 'react'
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  ChartLineUp,
  ArrowRight,
  Lock
} from 'phosphor-react'

interface DashboardStats {
  stats: Array<{
    eventId: string
    eventName: string
    capacity: number
    yes: number
    no: number
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-sans text-lg text-charcoal dark:text-dark-text">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <p className="font-sans text-lg text-red-700 dark:text-red-400">Error loading dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-title text-4xl sm:text-5xl text-charcoal dark:text-dark-text mb-2">Dashboard</h1>
        <p className="font-sans text-base text-charcoal/60 dark:text-dark-text-secondary">
          Overview of your wedding RSVPs and event statistics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-taupe/20 dark:border-dark-border group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage to-sage/70 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 text-white" weight="duotone" />
            </div>
            <div className="text-right">
              <p className="font-sans text-xs uppercase tracking-wider text-charcoal/70 dark:text-dark-text-secondary mb-1">
                Total RSVPs
              </p>
              <p className="font-title text-4xl text-sage dark:text-sage/90">{stats.totals.totalRsvps}</p>
            </div>
          </div>
          <div className="h-1 bg-taupe/20 dark:bg-dark-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sage to-sage/70 rounded-full transition-all duration-500"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-taupe/20 dark:border-dark-border group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage/80 to-sage/60 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              <UserPlus className="w-6 h-6 text-white" weight="duotone" />
            </div>
            <div className="text-right">
              <p className="font-sans text-xs uppercase tracking-wider text-charcoal/70 dark:text-dark-text-secondary mb-1">
                Total Plus-Ones
              </p>
              <p className="font-title text-4xl text-sage dark:text-sage/90">{stats.totals.totalPlusOnes}</p>
            </div>
          </div>
          <div className="h-1 bg-taupe/20 dark:bg-dark-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sage/80 to-sage/60 rounded-full transition-all duration-500"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Event Statistics */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-title text-2xl sm:text-3xl text-charcoal dark:text-dark-text">Event Statistics</h2>
          <Link
            href="/admin/events"
            className="flex items-center gap-2 text-sage hover:text-sage/80 font-sans text-sm font-medium transition-colors duration-200"
          >
            Manage Events
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid gap-6">
          {stats.stats.map((stat, index) => {
            const capacityPercent = (stat.totalAttendees / stat.capacity) * 100
            const isNearCapacity = capacityPercent > 80
            
            return (
              <div 
                key={stat.eventId} 
                className="bg-white dark:bg-dark-card rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-taupe/20 dark:border-dark-border overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Event Header */}
                <div className="bg-gradient-to-r from-sage/10 to-sage/5 dark:from-sage/20 dark:to-sage/10 px-6 py-4 border-b border-taupe/20 dark:border-dark-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sage/20 dark:bg-sage/30 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-sage dark:text-sage/90" weight="duotone" />
                      </div>
                      <h3 className="font-title text-xl sm:text-2xl text-charcoal dark:text-dark-text">{stat.eventName}</h3>
                    </div>
                    {isNearCapacity && (
                      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-sans font-medium">
                        {capacityPercent.toFixed(0)}% Full
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" weight="duotone" />
                      <p className="font-sans text-xs text-charcoal/60 dark:text-dark-text-secondary mb-1">Attending</p>
                      <p className="font-title text-2xl text-green-600 dark:text-green-400">{stat.yes}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" weight="duotone" />
                      <p className="font-sans text-xs text-charcoal/60 dark:text-dark-text-secondary mb-1">Declined</p>
                      <p className="font-title text-2xl text-red-600 dark:text-red-400">{stat.no}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-sage/10 dark:bg-sage/20 border border-sage/30 dark:border-sage/40">
                      <UserPlus className="w-6 h-6 text-sage dark:text-sage/90 mx-auto mb-2" weight="duotone" />
                      <p className="font-sans text-xs text-charcoal/60 dark:text-dark-text-secondary mb-1">Plus-Ones</p>
                      <p className="font-title text-2xl text-sage dark:text-sage/90">{stat.plusOnes}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <ChartLineUp className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" weight="duotone" />
                      <p className="font-sans text-xs text-charcoal/60 dark:text-dark-text-secondary mb-1">Total</p>
                      <p className="font-title text-2xl text-blue-600 dark:text-blue-400">{stat.totalAttendees}</p>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-sans text-sm font-medium text-charcoal dark:text-dark-text">Capacity</p>
                      <p className="font-sans text-sm text-charcoal/70 dark:text-dark-text-secondary">
                        {stat.totalAttendees} / {stat.capacity} guests
                      </p>
                    </div>
                    <div className="h-3 bg-taupe/20 dark:bg-dark-border rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isNearCapacity 
                            ? 'bg-gradient-to-r from-amber-500 to-amber-400' 
                            : 'bg-gradient-to-r from-sage to-sage/70'
                        }`}
                        style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                      ></div>
                    </div>
                    <p className="font-sans text-xs text-charcoal/70 dark:text-dark-text-secondary text-right">
                      {capacityPercent.toFixed(1)}% capacity
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/admin/rsvps"
          className="group bg-white dark:bg-dark-card p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-taupe/20 dark:border-dark-border flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-charcoal to-charcoal/80 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 text-white" weight="duotone" />
            </div>
            <div>
              <h3 className="font-title text-lg text-charcoal dark:text-dark-text mb-1">View All RSVPs</h3>
              <p className="font-sans text-sm text-charcoal/60 dark:text-dark-text-secondary">
                Manage and review all guest responses
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-charcoal/60 dark:text-dark-text-secondary group-hover:text-sage transition-colors duration-200" />
        </Link>

        <Link
          href="/admin/photos"
          className="group bg-white dark:bg-dark-card p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-taupe/20 dark:border-dark-border flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage to-sage/70 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              <ChartLineUp className="w-6 h-6 text-white" weight="duotone" />
            </div>
            <div>
              <h3 className="font-title text-lg text-charcoal dark:text-dark-text mb-1">Manage Photos</h3>
              <p className="font-sans text-sm text-charcoal/60 dark:text-dark-text-secondary">
                Update your photo gallery
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-charcoal/60 dark:text-dark-text-secondary group-hover:text-sage transition-colors duration-200" />
        </Link>
      </div>

      {/* Change Password Section */}
      <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md border border-taupe/20 dark:border-dark-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-charcoal/10 dark:bg-dark-border flex items-center justify-center">
            <Lock className="w-5 h-5 text-charcoal dark:text-dark-text" weight="duotone" />
          </div>
          <h2 className="font-title text-xl text-charcoal dark:text-dark-text">Change Password</h2>
        </div>
        <ChangePasswordForm />
      </div>
    </div>
  )
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Error changing password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error changing password. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
            Current Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
          />
        </div>
        <div>
          <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
            New Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
          />
          <p className="mt-1 font-sans text-xs text-charcoal/60 dark:text-dark-text-secondary">
            Must be at least 8 characters
          </p>
        </div>
        <div>
          <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg font-sans focus:outline-none focus:ring-2 focus:ring-sage dark:bg-dark-surface dark:text-dark-text transition-all duration-200"
          />
        </div>
      </div>
      {message && (
        <div
          className={`p-4 rounded-lg font-sans text-sm border ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="bg-charcoal dark:bg-dark-text dark:text-dark-bg text-white px-6 py-3 rounded-lg font-sans text-sm font-medium hover:bg-charcoal/90 dark:hover:bg-dark-text/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
      >
        {loading ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  )
}
