import { useState } from 'react'
import { useComments, addComment, type Post } from '../../../hooks/useBoard'
import type { Timestamp } from 'firebase/firestore'

interface CommentSheetProps {
  post: Post
  onClose: () => void
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

export default function CommentSheet({ post, onClose }: CommentSheetProps) {
  const { comments, loading } = useComments(post.id)
  const [author, setAuthor]   = useState('')
  const [body, setBody]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!author.trim() || !body.trim()) return
    setSubmitting(true)
    await addComment(post.id, body.trim(), author.trim())
    setBody('')
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={onClose} className="text-xl leading-none" style={{ color: 'var(--color-muted)' }}>←</button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{post.title}</p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{post.commentsCount} comments</p>
        </div>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 rounded skeleton w-24" />
                  <div className="h-2 rounded skeleton w-full" />
                  <div className="h-2 rounded skeleton w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && comments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No comments yet — be the first!</p>
          </div>
        )}

        {comments.map(c => (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'var(--color-red)' }}>
              {c.author[0]?.toUpperCase()}
            </div>
            <div className="flex-1 rounded-xl px-3 py-2.5" style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{c.author}</span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{timeAgo(c.createdAt)}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{c.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment composer */}
      <div className="border-t px-4 py-3 space-y-2 flex-shrink-0"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
        <input
          type="text" placeholder="Your name"
          value={author} onChange={e => setAuthor(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)', fontSize: '16px'
          }}
        />
        <div className="flex gap-2">
          <input
            type="text" placeholder="Write a comment…"
            value={body} onChange={e => setBody(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)', fontSize: '16px'
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!author.trim() || !body.trim() || submitting}
            className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
            style={{ background: 'var(--color-red)', color: '#fff' }}
          >
            {submitting ? '…' : '→'}
          </button>
        </div>
      </div>
    </div>
  )
}
