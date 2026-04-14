import { useState, useRef, useLayoutEffect } from 'react'
import type { Member } from '../../../hooks/useMembers'

interface MemberCardProps {
  member: Member
}

export default function MemberCard({ member }: MemberCardProps) {
  const photo = member.googlePhoto || member.photo
  const initial = member.name.charAt(0).toUpperCase()
  const [expanded, setExpanded] = useState(false)
  const [isClamped, setIsClamped] = useState(false)
  const descRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const el = descRef.current
    if (el) setIsClamped(el.scrollHeight > el.clientHeight + 2)
  }, [member.description])

  const directionsUrl = member.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(member.address)}`
    : null

  // Website URL
  const rawWebsite = member.googleWebsite || member.website
  const websiteUrl = rawWebsite
    ? rawWebsite.startsWith('http') ? rawWebsite : `https://${rawWebsite}`
    : null

  // Google Maps Business Profile URL
  const googleMapsUrl = member.placeId
    ? `https://www.google.com/maps/place/?q=place_id:${member.placeId}`
    : null

  // Primary link — website first, Google Maps profile as fallback
  const primaryUrl = websiteUrl || googleMapsUrl

  function handleShare() {
    const text = `${member.name} — ${member.city}, WI\nhub.wcccbusinessnetwork.org`
    if (navigator.share) {
      navigator.share({ title: member.name, text })
    } else {
      navigator.clipboard.writeText(text)
      alert('Copied!')
    }
  }

  return (
    <article
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--color-surface)',
        border: `1px solid ${member.wccc ? 'rgba(185,28,28,0.3)' : 'var(--color-border)'}`,
      }}
    >
      {/* Top accent bar */}
      <div className="h-1" style={{
        background: member.wccc
          ? 'linear-gradient(90deg, #B91C1C, #ef4444)'
          : 'linear-gradient(90deg, #6b7280, #9ca3af)',
      }} />

      {/* Photo — links to primary URL */}
      {primaryUrl ? (
        <a href={primaryUrl} target="_blank" rel="noopener noreferrer">
          <div
            className="w-full flex items-center justify-center"
            style={{ height: 160, background: 'var(--color-bg)', overflow: 'hidden' }}
          >
            {photo ? (
              <img
                src={photo}
                alt={member.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', padding: '8px' }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold text-white"
                style={{ background: member.wccc ? 'var(--color-red)' : 'var(--color-muted)' }}
              >
                {initial}
              </div>
            )}
          </div>
        </a>
      ) : (
        <div
          className="w-full flex items-center justify-center"
          style={{ height: 160, background: 'var(--color-bg)', overflow: 'hidden' }}
        >
          {photo ? (
            <img
              src={photo}
              alt={member.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', padding: '8px' }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold text-white"
              style={{ background: member.wccc ? 'var(--color-red)' : 'var(--color-muted)' }}
            >
              {initial}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="p-4 space-y-2">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {member.wccc && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(185,28,28,0.15)', color: '#ef4444' }}>
              WCCC Member
            </span>
          )}
          {member.category && (
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
              {member.category.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* Name — links to primary URL */}
        {primaryUrl ? (
          <a href={primaryUrl} target="_blank" rel="noopener noreferrer">
            <h3 className="font-semibold text-base leading-tight" style={{ color: 'var(--color-text)' }}>
              {member.name} <span className="text-xs" style={{ color: 'var(--color-muted)' }}>↗</span>
            </h3>
          </a>
        ) : (
          <h3 className="font-semibold text-base leading-tight" style={{ color: 'var(--color-text)' }}>
            {member.name}
          </h3>
        )}

        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          📍 {member.city}{member.city ? ', ' : ''}WI
        </p>

        {member.rating && (
          <p className="text-xs" style={{ color: 'var(--color-gold)' }}>
            ⭐ {member.rating.toFixed(1)}
          </p>
        )}

        {/* Description */}
        {member.description && (
          <div>
            <p
              ref={descRef}
              className="text-xs"
              style={{
                color: 'var(--color-muted)',
                display: '-webkit-box',
                WebkitLineClamp: expanded ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: expanded ? 'visible' : 'hidden',
                whiteSpace: 'pre-wrap',
              }}
            >
              {member.description}
            </p>
            {(isClamped || expanded) && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="text-xs mt-1 font-medium"
                style={{ color: 'var(--color-red)' }}
              >
                {expanded ? 'Show less ↑' : 'Read more ↓'}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {member.phone && (
            <a href={`tel:${member.phone}`}
              className="flex-1 py-2 rounded-lg text-xs font-medium text-center"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
              📞 Call
            </a>
          )}
          {directionsUrl && (
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 py-2 rounded-lg text-xs font-medium text-center"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
              🗺️ Directions
            </a>
          )}

          <button
            onClick={handleShare}
            className="flex-1 py-2 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(185,28,28,0.1)', border: '1px solid rgba(185,28,28,0.2)', color: 'var(--color-red)' }}
          >
            📤 Share
          </button>
        </div>
      </div>
    </article>
  )
}
