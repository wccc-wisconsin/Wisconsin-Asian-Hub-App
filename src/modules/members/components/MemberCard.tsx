import type { Member } from '../../../hooks/useMembers'

interface MemberCardProps {
  member: Member
}

export default function MemberCard({ member }: MemberCardProps) {
  const photo = member.googlePhoto || member.photo
  const initial = member.name.charAt(0).toUpperCase()

  return (
    <article className="rounded-xl overflow-hidden" style={{
      background: 'var(--color-surface)',
      border: `1px solid ${member.wccc ? 'rgba(185,28,28,0.25)' : 'var(--color-border)'}`,
    }}>
      {/* Top accent */}
      <div className="h-1" style={{
        background: member.wccc
          ? 'linear-gradient(90deg, #B91C1C, #ef4444)'
          : 'var(--color-border)',
      }} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex gap-3 items-start">
          <div className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center text-lg font-bold text-white"
            style={{ background: member.wccc ? 'var(--color-red)' : 'var(--color-muted)' }}>
            {photo ? (
              <img src={photo} alt={member.name} className="w-full h-full object-cover" />
            ) : initial}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight truncate" style={{ color: 'var(--color-text)' }}>
              {member.name}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              {member.city}{member.city ? ', ' : ''}WI
            </p>
            {member.rating && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-gold)' }}>
                ⭐ {member.rating.toFixed(1)}
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
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

        {/* Description */}
        {member.description && (
          <p className="text-xs" style={{
            color: 'var(--color-muted)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {member.description}
          </p>
        )}

        {/* Address */}
        {member.address && (
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            📍 {member.address}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {member.phone && (
            <a href={`tel:${member.phone}`}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium text-center"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
              📞 Call
            </a>
          )}
          {member.website && (
            <a href={member.website.startsWith('http') ? member.website : `https://${member.website}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 py-1.5 rounded-lg text-xs font-medium text-center"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
              🌐 Visit
            </a>
          )}
          {member.address && (
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(member.address)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 py-1.5 rounded-lg text-xs font-medium text-center"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
              🗺️ Map
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
