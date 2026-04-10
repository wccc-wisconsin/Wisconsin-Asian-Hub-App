import { useState } from 'react'
import { likePost, rsvpEvent, type Post } from '../../../hooks/useBoard'
import type { Timestamp } from 'firebase/firestore'

interface PostCardProps {
  post: Post
  onComment: () => void
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

function formatEventDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    })
  } catch { return dateStr }
}

export default function PostCard({ post, onComment }: PostCardProps) {
  const [liked, setLiked]   = useState(false)
  const [rsvpd, setRsvpd]   = useState(false)
  const [likeCount, setLikeCount] = useState(post.likesCount)

  async function handleLike() {
    if (liked) return
    setLiked(true)
    setLikeCount(c => c + 1)
    await likePost(post.id)
  }

  async function handleRsvp() {
    if (rsvpd) return
    setRsvpd(true)
    await rsvpEvent(post.id)
  }

  const isEvent = post.type === 'event'

  return (
    <article className="rounded-xl overflow-hidden" style={{
      background: 'var(--color-surface)',
      border: `1px solid ${isEvent ? 'rgba(251,191,36,0.25)' : 'var(--color-border)'}`,
    }}>
      {/* Top accent */}
      <div className="h-1" style={{
        background: isEvent ? 'var(--color-gold)' : 'var(--color-red)'
      }} />

      <div className="p-4">
        {/* Author + time */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: isEvent ? '#b45309' : 'var(--color-red)' }}>
            {post.author[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{post.author}</p>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{timeAgo(post.createdAt)}</p>
          </div>
          <span className="chip text-xs flex-shrink-0" style={{
            background: isEvent ? 'rgba(251,191,36,0.12)' : 'rgba(185,28,28,0.12)',
            color: isEvent ? 'var(--color-gold)' : 'var(--color-red)',
            border: `1px solid ${isEvent ? 'rgba(251,191,36,0.3)' : 'rgba(185,28,28,0.3)'}`,
          }}>
            {isEvent ? '📅 Event' : '💬 General'}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-base mb-2 leading-snug"
          style={{ color: 'var(--color-text)' }}>
          {post.title}
        </h3>

        {/* Body */}
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-muted)' }}>
          {post.body}
        </p>

        {/* Event details */}
        {isEvent && post.event && (
          <div className="rounded-lg p-3 mb-3 space-y-1.5" style={{
            background: 'rgba(251,191,36,0.06)',
            border: '1px solid rgba(251,191,36,0.15)'
          }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-gold)' }}>
              <span>🗓</span>
              <span>{formatEventDate(post.event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-gold)' }}>
              <span>📍</span>
              <span>{post.event.location}</span>
            </div>
            {post.event.seats > 0 && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-gold)' }}>
                <span>🪑</span>
                <span>{(post.event.seats ?? 0) - (post.event.rsvpCount ?? 0)} seats left · {post.event.rsvpCount ?? 0} going</span>
              </div>
            )}
            {post.event.seats === 0 && post.event.rsvpCount > 0 && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-gold)' }}>
                <span>✅</span>
                <span>{post.event.rsvpCount} going</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 text-xs transition-all"
            style={{ color: liked ? '#ef4444' : 'var(--color-muted)' }}
          >
            <span>{liked ? '❤️' : '🤍'}</span>
            <span>{likeCount}</span>
          </button>

          {/* Comment */}
          <button
            onClick={onComment}
            className="flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--color-muted)' }}
          >
            <span>💬</span>
            <span>{post.commentsCount}</span>
          </button>

          {/* RSVP for events */}
          {isEvent && (
            <button
              onClick={handleRsvp}
              disabled={rsvpd || ((post.event?.seats ?? 0) > 0 && (post.event?.rsvpCount ?? 0) >= (post.event?.seats ?? 0))}
              className="ml-auto px-3 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-50"
              style={{
                background: rsvpd ? 'rgba(34,197,94,0.15)' : 'var(--color-red)',
                color: rsvpd ? '#22c55e' : '#fff',
                border: rsvpd ? '1px solid rgba(34,197,94,0.3)' : 'none',
              }}
            >
              {rsvpd ? '✓ Going' : 'RSVP'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
