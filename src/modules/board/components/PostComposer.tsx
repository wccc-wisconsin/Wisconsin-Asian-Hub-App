import { useState } from 'react'
import { createPost, type PostType } from '../../../hooks/useBoard'

interface PostComposerProps {
  onClose: () => void
}

export default function PostComposer({ onClose }: PostComposerProps) {
  const [type, setType]       = useState<PostType>('general')
  const [author, setAuthor]   = useState('')
  const [title, setTitle]     = useState('')
  const [body, setBody]       = useState('')
  const [eventDate, setEventDate]         = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [eventSeats, setEventSeats]       = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [error, setError]                 = useState('')

  const isValid = author.trim() && title.trim() && body.trim() &&
    (type === 'general' || (eventDate && eventLocation))

  async function handleSubmit() {
    if (!isValid) return
    setSubmitting(true)
    setError('')
    try {
      await createPost({
        type,
        title: title.trim(),
        body: body.trim(),
        author: author.trim(),
        ...(type === 'event' ? {
          event: {
            date: eventDate,
            location: eventLocation.trim(),
            seats: parseInt(eventSeats) || 0,
          }
        } : {})
      })
      onClose()
    } catch (e) {
      setError('Failed to post. Please try again.')
      setSubmitting(false)
    }
  }

  const inputStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    fontSize: '16px',
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={onClose} className="text-sm" style={{ color: 'var(--color-muted)' }}>
          Cancel
        </button>
        <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
          New Post
        </h2>
        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="text-sm font-semibold px-4 py-1.5 rounded-full disabled:opacity-40 transition-all"
          style={{ background: 'var(--color-red)', color: '#fff' }}
        >
          {submitting ? '...' : 'Post'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Post type toggle */}
        <div className="flex gap-2">
          {(['general', 'event'] as PostType[]).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-all capitalize"
              style={{
                background: type === t ? 'var(--color-red)' : 'var(--color-surface)',
                color: type === t ? '#fff' : 'var(--color-muted)',
                border: `1px solid ${type === t ? 'var(--color-red)' : 'var(--color-border)'}`,
              }}
            >
              {t === 'general' ? '💬 General' : '📅 Event / Workshop'}
            </button>
          ))}
        </div>

        {/* Author */}
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-muted)' }}>
            Your Name *
          </label>
          <input
            type="text" placeholder="e.g. Jane Smith"
            value={author} onChange={e => setAuthor(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-muted)' }}>
            {type === 'event' ? 'Event Title *' : 'Title *'}
          </label>
          <input
            type="text"
            placeholder={type === 'event' ? 'e.g. Spring Business Workshop' : 'e.g. Community announcement'}
            value={title} onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
        </div>

        {/* Body */}
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-muted)' }}>
            Message *
          </label>
          <textarea
            placeholder="Share something with the community…"
            value={body} onChange={e => setBody(e.target.value)}
            rows={5}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
            style={inputStyle}
          />
        </div>

        {/* Event fields */}
        {type === 'event' && (
          <div className="space-y-3 rounded-xl p-4" style={{
            background: 'rgba(251,191,36,0.05)',
            border: '1px solid rgba(251,191,36,0.15)'
          }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
              📅 Event Details
            </p>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-muted)' }}>
                Date & Time *
              </label>
              <input
                type="datetime-local"
                value={eventDate} onChange={e => setEventDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-muted)' }}>
                Location *
              </label>
              <input
                type="text" placeholder="e.g. Madison Community Center"
                value={eventLocation} onChange={e => setEventLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-muted)' }}>
                Available Seats (0 = unlimited)
              </label>
              <input
                type="number" placeholder="0"
                value={eventSeats} onChange={e => setEventSeats(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
      </div>
    </div>
  )
}
