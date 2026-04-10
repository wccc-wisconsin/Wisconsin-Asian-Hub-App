import type { Member } from '../../../hooks/useMembers'

interface MemberCardProps {
  member: Member
  style?: React.CSSProperties
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function getColor(name: string): string {
  const colors = [
    '#B91C1C', '#C2410C', '#B45309', '#15803D', '#0F766E',
    '#0369A1', '#6D28D9', '#9D174D', '#7C3AED', '#1D4ED8'
  ]
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return colors[Math.abs(hash) % colors.length]
}

export default function MemberCard({ member, style }: MemberCardProps) {
  const color = getColor(member.name)
  const initials = getInitials(member.name)

  return (
    <article 
      className="card-hover rounded-xl overflow-hidden cursor-pointer"
      style={{ 
        background: 'var(--color-surface)', 
        border: '1px solid var(--color-border)',
        ...style 
      }}
    >
      {/* Top accent strip */}
      <div className="h-1" style={{ background: color }} />

      <div className="p-4">
        {/* Avatar + Name */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            {member.photo ? (
              <img 
                src={member.photo} 
                alt={member.name}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-display font-bold text-lg"
                style={{ background: color }}
              >
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm leading-tight truncate" style={{ color: 'var(--color-text)' }}>
              {member.name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>📍</span>
              <span className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{member.city}</span>
            </div>
          </div>
        </div>

        {/* Category */}
        <span className="chip text-xs mb-3" style={{ 
          background: `${color}20`, 
          color, 
          border: `1px solid ${color}40` 
        }}>
          {member.category}
        </span>

        {/* Description */}
        {member.description && (
          <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--color-muted)' }}>
            {member.description}
          </p>
        )}

        {/* Contact links */}
        <div className="flex items-center gap-2 mt-2">
          {member.website && (
            <a 
              href={member.website.startsWith('http') ? member.website : `https://${member.website}`}
              target="_blank" rel="noopener noreferrer"
              className="text-xs px-2 py-1 rounded-md transition-colors"
              style={{ 
                background: 'rgba(185,28,28,0.12)', 
                color: '#ef4444',
                border: '1px solid rgba(185,28,28,0.2)'
              }}
              onClick={e => e.stopPropagation()}
            >
              🌐 Website
            </a>
          )}
          {member.email && (
            <a 
              href={`mailto:${member.email}`}
              className="text-xs px-2 py-1 rounded-md transition-colors"
              style={{ 
                background: 'rgba(251,191,36,0.08)', 
                color: 'var(--color-gold)',
                border: '1px solid rgba(251,191,36,0.2)'
              }}
              onClick={e => e.stopPropagation()}
            >
              ✉️ Email
            </a>
          )}
          {member.phone && (
            <a 
              href={`tel:${member.phone}`}
              className="text-xs px-2 py-1 rounded-md"
              style={{ 
                background: 'rgba(156,163,175,0.08)', 
                color: 'var(--color-muted)',
                border: '1px solid rgba(156,163,175,0.15)'
              }}
              onClick={e => e.stopPropagation()}
            >
              📞
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
