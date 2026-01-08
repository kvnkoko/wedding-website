'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Trash, Key, X } from 'phosphor-react'

interface AdminUser {
  id: string
  email: string
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.users)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      setSuccess('User created successfully!')
      setFormData({ email: '', password: '', confirmPassword: '' })
      setShowAddForm(false)
      fetchUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
    }
  }

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}?`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete user')
      }

      setSuccess('User deleted successfully!')
      fetchUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to delete user')
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent, userId: string) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordData.password !== passwordData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: passwordData.password,
        }),
        credentials: 'include',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update password')
      }

      setSuccess('Password updated successfully!')
      setPasswordData({ password: '', confirmPassword: '' })
      setShowPasswordForm(null)
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-sans text-lg text-charcoal dark:text-dark-text">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-title text-3xl sm:text-4xl text-charcoal dark:text-dark-text mb-2">
              Admin Users
            </h1>
            <p className="font-sans text-base text-charcoal/70 dark:text-dark-text-secondary">
              Manage admin user accounts
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true)
              setError('')
              setSuccess('')
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-sage text-white rounded-lg font-sans text-sm font-medium hover:bg-sage/90 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <UserPlus className="w-5 h-5" weight="duotone" />
            Add New User
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="font-sans text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="font-sans text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* Add User Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-title text-2xl text-charcoal dark:text-dark-text">Add New User</h2>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setFormData({ email: '', password: '', confirmPassword: '' })
                    setError('')
                  }}
                  className="p-1 hover:bg-taupe/10 dark:hover:bg-dark-border rounded transition-colors"
                >
                  <X className="w-6 h-6 text-charcoal dark:text-dark-text" />
                </button>
              </div>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-charcoal dark:text-dark-text font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 dark:focus:ring-sage/30"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-charcoal dark:text-dark-text font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 dark:focus:ring-sage/30"
                    placeholder="Minimum 8 characters"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-charcoal dark:text-dark-text font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 dark:focus:ring-sage/30"
                    placeholder="Confirm password"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setFormData({ email: '', password: '', confirmPassword: '' })
                      setError('')
                    }}
                    className="flex-1 px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg font-sans text-sm font-medium text-charcoal dark:text-dark-text hover:bg-taupe/10 dark:hover:bg-dark-border transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-sage text-white rounded-lg font-sans text-sm font-medium hover:bg-sage/90 transition-colors"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-taupe/20 dark:border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-taupe/5 dark:bg-dark-border/30 border-b border-taupe/20 dark:border-dark-border">
                <tr>
                  <th className="px-6 py-4 text-left font-sans text-xs font-semibold text-charcoal dark:text-dark-text uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left font-sans text-xs font-semibold text-charcoal dark:text-dark-text uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right font-sans text-xs font-semibold text-charcoal dark:text-dark-text uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-taupe/20 dark:divide-dark-border">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <p className="font-sans text-sm text-charcoal/70 dark:text-dark-text-secondary">
                        No users found
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-taupe/5 dark:hover:bg-dark-border/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-sans text-sm font-medium text-charcoal dark:text-dark-text">
                          {user.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-sans text-sm text-charcoal/70 dark:text-dark-text-secondary">
                          {formatDate(user.createdAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setShowPasswordForm(user.id)
                              setPasswordData({ password: '', confirmPassword: '' })
                              setError('')
                              setSuccess('')
                            }}
                            className="p-2 text-sage hover:bg-sage/10 dark:hover:bg-sage/20 rounded-lg transition-colors"
                            title="Change Password"
                          >
                            <Key className="w-5 h-5" weight="duotone" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash className="w-5 h-5" weight="duotone" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordForm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-title text-2xl text-charcoal dark:text-dark-text">Change Password</h2>
                <button
                  onClick={() => {
                    setShowPasswordForm(null)
                    setPasswordData({ password: '', confirmPassword: '' })
                    setError('')
                  }}
                  className="p-1 hover:bg-taupe/10 dark:hover:bg-dark-border rounded transition-colors"
                >
                  <X className="w-6 h-6 text-charcoal dark:text-dark-text" />
                </button>
              </div>
              <form onSubmit={(e) => handleUpdatePassword(e, showPasswordForm)} className="space-y-4">
                <div>
                  <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-charcoal dark:text-dark-text font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 dark:focus:ring-sage/30"
                    placeholder="Minimum 8 characters"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium text-charcoal dark:text-dark-text mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-charcoal dark:text-dark-text font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 dark:focus:ring-sage/30"
                    placeholder="Confirm password"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(null)
                      setPasswordData({ password: '', confirmPassword: '' })
                      setError('')
                    }}
                    className="flex-1 px-4 py-2.5 border border-taupe/30 dark:border-dark-border rounded-lg font-sans text-sm font-medium text-charcoal dark:text-dark-text hover:bg-taupe/10 dark:hover:bg-dark-border transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-sage text-white rounded-lg font-sans text-sm font-medium hover:bg-sage/90 transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
