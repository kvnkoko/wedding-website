'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface FAQ {
  id: string
  question: string
  answer: string
  inviteLinkConfigId: string | null
  order: number
  inviteLinkConfig?: {
    slug: string
    label: string
  }
}

interface InviteLinkConfig {
  id: string
  slug: string
  label: string
}

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [inviteLinks, setInviteLinks] = useState<InviteLinkConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    inviteLinkConfigId: '',
  })
  const router = useRouter()

  useEffect(() => {
    fetchFAQs()
    fetchInviteLinks()
  }, [])

  const fetchFAQs = async () => {
    try {
      const res = await fetch('/api/faqs')
      if (res.ok) {
        const data = await res.json()
        setFaqs(data.sort((a: FAQ, b: FAQ) => a.order - b.order))
      } else {
        alert('Error fetching FAQs')
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      alert('Error fetching FAQs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchInviteLinks = async () => {
    try {
      const res = await fetch('/api/admin/invite-links')
      if (res.ok) {
        const data = await res.json()
        // Map the data to the expected format
        const mappedLinks = data.map((link: any) => ({
          id: link.id,
          slug: link.slug,
          label: link.label,
        }))
        setInviteLinks(mappedLinks)
      }
    } catch (error) {
      console.error('Error fetching invite links:', error)
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const newFAQs = [...faqs]
    const draggedFAQ = newFAQs[draggedIndex]

    newFAQs.splice(draggedIndex, 1)
    newFAQs.splice(index, 0, draggedFAQ)

    const updatedFAQs = newFAQs.map((faq, idx) => ({
      ...faq,
      order: idx,
    }))

    setFaqs(updatedFAQs)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return

    try {
      const updatedFAQs = faqs.map((faq, idx) => ({
        id: faq.id,
        order: idx,
      }))

      const res = await fetch('/api/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqs: updatedFAQs }),
      })

      if (!res.ok) {
        throw new Error('Failed to update FAQ order')
      }
    } catch (error) {
      console.error('Error updating FAQ order:', error)
      alert('Error updating FAQ order. Please try again.')
      await fetchFAQs()
    } finally {
      setDraggedIndex(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        inviteLinkConfigId: formData.inviteLinkConfigId || null,
      }

      if (editingFAQ) {
        // Update existing FAQ
        const res = await fetch(`/api/faqs/${editingFAQ.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          throw new Error('Failed to update FAQ')
        }
      } else {
        // Create new FAQ
        const res = await fetch('/api/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          throw new Error('Failed to create FAQ')
        }
      }

      // Reset form
      setFormData({ question: '', answer: '', inviteLinkConfigId: '' })
      setShowAddForm(false)
      setEditingFAQ(null)
      await fetchFAQs()
    } catch (error) {
      console.error('Error saving FAQ:', error)
      alert('Error saving FAQ. Please try again.')
    }
  }

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      inviteLinkConfigId: faq.inviteLinkConfigId || '',
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) {
      return
    }

    try {
      const res = await fetch(`/api/faqs?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchFAQs()
      } else {
        alert('Error deleting FAQ')
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      alert('Error deleting FAQ. Please try again.')
    }
  }

  const handleCancel = () => {
    setFormData({ question: '', answer: '', inviteLinkConfigId: '' })
    setShowAddForm(false)
    setEditingFAQ(null)
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
        <h1 className="font-serif text-5xl text-charcoal">FAQs</h1>
        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingFAQ(null)
            setFormData({ question: '', answer: '', inviteLinkConfigId: '' })
          }}
          className="bg-sage text-white px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-sage/90 transition-all"
        >
          {showAddForm ? 'Cancel' : 'Add FAQ'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-sm shadow-sm mb-6">
          <h2 className="font-serif text-2xl text-charcoal mb-4">
            {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                Question <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter the question"
                required
                className="w-full px-4 py-2 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
              />
            </div>

            <div>
              <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                Answer <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Enter the answer"
                required
                rows={4}
                className="w-full px-4 py-2 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
              />
            </div>

            <div>
              <label className="block font-sans text-sm font-medium text-charcoal mb-2">
                Event/Invite Link (Optional)
              </label>
              <select
                value={formData.inviteLinkConfigId}
                onChange={(e) => setFormData({ ...formData, inviteLinkConfigId: e.target.value })}
                className="w-full px-4 py-2 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
              >
                <option value="">All Events (Global FAQ)</option>
                {inviteLinks.map((link) => (
                  <option key={link.id} value={link.id}>
                    {link.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 font-sans text-xs text-charcoal/60">
                Leave blank for global FAQs that show for all events, or select a specific event to show only for that invite link.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-charcoal text-white px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-charcoal/90 transition-all"
              >
                {editingFAQ ? 'Update FAQ' : 'Add FAQ'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-taupe/20 text-charcoal px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-taupe/30 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-sm shadow-sm mb-6">
        <p className="font-sans text-sm text-charcoal/70 mb-4">
          Drag and drop FAQs below to reorder them. The order will be saved automatically.
        </p>
        {faqs.length === 0 ? (
          <p className="font-sans text-lg text-charcoal/70 text-center py-12">
            No FAQs yet. Add your first FAQ above!
          </p>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-start gap-4 p-4 border-2 rounded-sm cursor-move transition-all ${
                  draggedIndex === index
                    ? 'border-sage bg-sage/10 opacity-50'
                    : 'border-taupe/30 hover:border-sage/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-sans text-sm font-medium text-charcoal">
                      Order: {index + 1}
                    </p>
                    {faq.inviteLinkConfig && (
                      <span className="px-2 py-1 bg-sage/20 text-sage text-xs rounded-sm">
                        {faq.inviteLinkConfig.label}
                      </span>
                    )}
                    {!faq.inviteLinkConfig && (
                      <span className="px-2 py-1 bg-charcoal/20 text-charcoal text-xs rounded-sm">
                        Global (All Events)
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-lg text-charcoal mb-2">
                    {faq.question}
                  </h3>
                  <p className="font-sans text-sm text-charcoal/70">
                    {faq.answer}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-charcoal/40">⋮⋮</span>
                  <button
                    onClick={() => handleEdit(faq)}
                    className="bg-sage/20 text-sage px-4 py-2 rounded-sm font-sans text-xs hover:bg-sage/30 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="bg-red-100 text-red-600 px-4 py-2 rounded-sm font-sans text-xs hover:bg-red-200 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

