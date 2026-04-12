import { useState } from 'react'
import { useEventComments, addEventComment } from '../../../hooks/useEventComments'
import type { Timestamp } from 'firebase/firestore'

interface EventCommentsProps {
  eventId: string
}

function timeAgo(ts: Timestamp | null): string {
  if (!ts) return 'just now'
  const diff = Date.now() - ts.toMillis()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function getColor(name: string): string {
  const colors = ['#B91C1C','#C2410C','#B45309','#15803D','#0F766E','#0369A1','#6D28D9','#9D174D']
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return colors[Math.abs(hash) % colors.length]
}

export default function EventComments({ eventId }: EventCommentsProps) {
  const { comments, loading: rawLoading } = useEventComments(eventId)
  const [timedOut, setTimedOut] = useState(false)
  const loading = rawLoading && !timedOut

  // Never show skeleton for more than 3 seconds
  useState(() => {
    const t = setTimeout(() => setTimedOut(true), 3000)
    return () => clearTimeout(t)
  })
  const [expanded, setExpanded] = useState(false)
  const [name, setName]         = useState(() => localStorage.getItem('comment_name') ?? '')
  const [body, setBody]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm]     = useState(false)

  async function handleSubmit() {
    if (!name.trim() || !body.trim()) return
    setSubmitting(true)
    localStorage.setItem('comment_name', name.trim())
    await addEventComment(eventId, name.trim(), body.trim())
    setBody('')
    setSubmitting(false)
    setShowForm(false)
    setExpanded(true)
  }

  const visibleComments = expanded ? comments : comments.slice(-2)
  const hiddenCount = comments.length - 2

  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setExpanded(e => !e)}
          className="text-xs font-semibold flex items-center gap-1"
          style={{ color: 'var(--color-muted)' }}>
          💬 {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          {comments.length > 2 && !expanded && (
            <span style={{ color: 'var(--color-gold)' }}> · See all</span>
          )}
        </button>
        <button onClick={() => setShowForm(f => !f)}
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{
            background: showForm ? 'var(--color-surface)' : 'rgba(185,28,28,0.08)',
            color: showForm ? 'var(--color-muted)' : 'var(--color-red)',
            border: `1px solid ${showForm ? 'var(--color-border)' : 'rgba(185,28,28,0.2)'}`,
          }}>
          {showForm ? 'Cancel' : '+ Comment'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[1,2].map(i => (
            <div key={i} className="flex gap-2">
              <div className="w-6 h-6 rounded-full skeleton flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-2 rounded skeleton w-20" />
                <div className="h-2 rounded skeleton w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comments */}
      {!loading && (
        <div className="space-y-3 mb-3">
          {comments.length === 0 && !showForm && (
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              No comments yet — be the first!
            </p>
          )}

          {/* Show hidden count */}
          {!expanded && hiddenCount > 0 && (
            <button onClick={() => setExpanded(true)}
              className="text-xs" style={{ color: 'var(--color-gold)' }}>
              ↑ See {hiddenCount} earlier {hiddenCount === 1 ? 'comment' : 'comments'}
            </button>
          )}

          {visibleComments.map(c => (
            <div key={c.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: getColor(c.authorName) }}>
                {c.authorName[0]?.toUpperCase()}
              </div>
              <div className="flex-1 rounded-xl px-3 py-2" style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)'
              }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                    {c.authorName}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    {timeAgo(c.createdAt)}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>
                  {c.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      {showForm && (
        <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <input type="text" placeholder="Your name *" value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-xs outline-none"
            style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              color: 'var(--color-text)', fontSize: '16px'
            }} />
          <div className="flex gap-2">
            <input type="text" placeholder="Write a comment…" value={body}
              onChange={e => setBody(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
              style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                color: 'var(--color-text)', fontSize: '16px'
              }} />
            <button onClick={handleSubmit}
              disabled={!name.trim() || !body.trim() || submitting}
              className="px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-40"
              style={{ background: 'var(--color-red)', color: '#fff' }}>
              {submitting ? '…' : '→'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
