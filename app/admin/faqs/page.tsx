'use client'

import { useEffect, useState } from 'react'

interface FAQ {
  id: string
  question: string
  answer: string
  colorHexCodes: string[] | null
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
    colorHexCodes: [] as string[],
    inviteLinkConfigId: '',
  })
  const [newColorHex, setNewColorHex] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchFAQs()
    fetchInviteLinks()
  }, [])

  const fetchFAQs = async () => {
    try {
      const res = await fetch('/api/faqs', {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setFaqs(data.sort((a: FAQ, b: FAQ) => a.order - b.order))
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Error fetching FAQs:', errorData)
        alert(`Error fetching FAQs: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      console.error('Error fetching FAQs:', error)
      alert(`Error fetching FAQs: ${error.message || 'Please try again.'}`)
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
    
    if (submitting) return
    
    // Validate required fields
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('Please fill in both question and answer fields.')
      return
    }
    
    setSubmitting(true)
    
    try {
      const payload = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        colorHexCodes: formData.colorHexCodes.length > 0 ? formData.colorHexCodes : null,
        inviteLinkConfigId: formData.inviteLinkConfigId || null,
      }

      console.log('Submitting FAQ:', payload)

      let res: Response
      if (editingFAQ) {
        // Update existing FAQ
        res = await fetch(`/api/faqs/${editingFAQ.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        })
      } else {
        // Create new FAQ
        res = await fetch('/api/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        })
      }

      console.log('Response status:', res.status, res.statusText)

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || errorData.details || `Failed to ${editingFAQ ? 'update' : 'create'} FAQ`)
      }

      const result = await res.json()
      console.log('Success:', result)
      
      // Reset form
      setFormData({ question: '', answer: '', colorHexCodes: [], inviteLinkConfigId: '' })
      setNewColorHex('')
      setShowAddForm(false)
      setEditingFAQ(null)
      await fetchFAQs()
      
      // Show success message
      alert(`FAQ ${editingFAQ ? 'updated' : 'created'} successfully!`)
    } catch (error: any) {
      console.error('Error saving FAQ:', error)
      const errorMessage = error?.message || 'Error saving FAQ. Please check the browser console for details.'
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      colorHexCodes: faq.colorHexCodes || [],
      inviteLinkConfigId: faq.inviteLinkConfigId || '',
    })
    setNewColorHex('')
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    console.log('=== DELETE BUTTON CLICKED ===')
    console.log('FAQ ID to delete:', id)
    
    // Temporarily skip confirm to test if delete works
    // TODO: Add back confirmation once delete is working
    console.log('Skipping confirmation for testing...')
    
    try {
      console.log('Making DELETE request to /api/faqs?id=' + id)

    try {
      console.log('Making DELETE request to /api/faqs?id=' + id)
      const url = `/api/faqs?id=${encodeURIComponent(id)}`
      console.log('Full URL:', url)
      
      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Response received')
      console.log('Status:', res.status)
      console.log('Status text:', res.statusText)
      console.log('OK?', res.ok)

      const responseText = await res.text()
      console.log('Response text:', responseText)

      if (res.ok) {
        let result
        try {
          result = JSON.parse(responseText)
        } catch {
          result = { success: true }
        }
        console.log('Delete successful, result:', result)
        await fetchFAQs()
        alert('FAQ deleted successfully!')
      } else {
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { error: responseText || 'Unknown error' }
        }
        console.error('Delete failed, error:', errorData)
        alert(`Error deleting FAQ: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      console.error('Exception during delete:', error)
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      alert(`Error deleting FAQ: ${error.message || 'Please try again.'}`)
    }
  }

  const handleCancel = () => {
    setFormData({ question: '', answer: '', colorHexCodes: [], inviteLinkConfigId: '' })
    setNewColorHex('')
    setShowAddForm(false)
    setEditingFAQ(null)
  }

  const handleAddColor = () => {
    const hex = newColorHex.trim()
    if (hex && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
      if (!formData.colorHexCodes.includes(hex)) {
        setFormData({
          ...formData,
          colorHexCodes: [...formData.colorHexCodes, hex],
        })
        setNewColorHex('')
      }
    }
  }

  const handleRemoveColor = (index: number) => {
    setFormData({
      ...formData,
      colorHexCodes: formData.colorHexCodes.filter((_, i) => i !== index),
    })
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
            setFormData({ question: '', answer: '', colorHexCodes: [], inviteLinkConfigId: '' })
            setNewColorHex('')
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
                Color Hex Codes (Optional)
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    placeholder="#A8D5BA"
                    className="flex-1 px-4 py-2 border border-taupe/30 rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-sage"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddColor()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="bg-sage/20 text-sage px-4 py-2 rounded-sm font-sans text-sm hover:bg-sage/30 transition-all"
                  >
                    Add Color
                  </button>
                </div>
                {formData.colorHexCodes.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-taupe/10 rounded-sm">
                    {formData.colorHexCodes.map((hex, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-white px-3 py-2 rounded-sm border border-taupe/20"
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-taupe/30"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="font-mono text-xs text-charcoal">{hex}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-1 font-sans text-xs text-charcoal/60">
                Add hex color codes (e.g., #A8D5BA) to display color swatches in the FAQ. These will appear below the answer.
              </p>
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
                disabled={submitting}
                className="bg-charcoal text-white px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-charcoal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : editingFAQ ? 'Update FAQ' : 'Add FAQ'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="bg-taupe/20 text-charcoal px-6 py-3 rounded-sm font-sans text-sm tracking-wider uppercase hover:bg-taupe/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                onDragStart={(e) => {
                  // Only allow drag from the drag handle (⋮⋮), not from buttons
                  const target = e.target as HTMLElement
                  if (target.closest('button') || target.tagName === 'BUTTON') {
                    e.preventDefault()
                    return false
                  }
                  handleDragStart(index)
                }}
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
                  <p className="font-sans text-sm text-charcoal/70 mb-2">
                    {faq.answer}
                  </p>
                  {faq.colorHexCodes && faq.colorHexCodes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {faq.colorHexCodes.map((hex, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-full border border-taupe/30"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-charcoal/40">⋮⋮</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Edit button clicked for FAQ:', faq.id)
                      handleEdit(faq)
                    }}
                    className="bg-sage/20 text-sage px-4 py-2 rounded-sm font-sans text-xs hover:bg-sage/30 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (e.nativeEvent) {
                        e.nativeEvent.stopImmediatePropagation()
                      }
                      console.log('=== DELETE BUTTON CLICKED ===')
                      console.log('FAQ ID:', faq.id)
                      handleDelete(faq.id)
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (e.nativeEvent) {
                        e.nativeEvent.stopImmediatePropagation()
                      }
                    }}
                    onDragStart={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    draggable={false}
                    className="bg-red-100 text-red-600 px-4 py-2 rounded-sm font-sans text-xs hover:bg-red-200 transition-all cursor-pointer"
                    style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1000 }}
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

