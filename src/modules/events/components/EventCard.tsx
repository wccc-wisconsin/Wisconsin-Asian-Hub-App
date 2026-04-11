import type { CommunityEvent } from '../../../hooks/useEvents'

const SOURCE_STYLES = {
  wccc:       { bg: 'rgba(185,28,28,0.12)',  color: 'var(--color-red)',  border: 'rgba(185,28,28,0.3)',  label: '🔴 WCCC'       },
  wedc:       { bg: 'rgba(29,78,216,0.12)',  color: '#1d4ed8',           border: 'rgba(29,78,216,0.3)',  label: '🏛️ WEDC'       },
  eventbrite: { bg: 'rgba(243,115,53,0.12)', color: '#f37335',           border: 'rgba(243,115,53,0.3)', label: '🎟️ Eventbrite' },
  community:  { bg: 'rgba(22,163,74,0.12)',  color: '#16a34a',           border: 'rgba(22,163,74,0.3)',  label: '🌏 Community'  },
}

const FORMAT_LABELS = {
  'in-person': '📍 In-Person',
  'virtual':   '💻 Virtual',
  'hybrid':    '🔀 Hybrid',
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    })
  } catch { return dateStr }
}

interface EventCardProps {
  event: CommunityEvent
}

export default function EventCard({ event }: EventCardProps) {
  const src = SOURCE_STYLES[event.source]

  return (
    <article className="rounded-xl overflow-hidden card-hover" style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
    }}>
      {/* Image */}
      {event.imageUrl && (
        <div className="w-full relative" style={{ paddingBottom: '45%' }}>
          <img src={event.imageUrl} alt={event.title}
            className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)'
          }} />
          {/* Source badge on image */}
          <div className="absolute top-2 left-2">
            <span className="chip text-xs font-semibold" style={{
              background: src.bg, color: src.color, border: `1px solid ${src.border}`,
              backdropFilter: 'blur(4px)'
            }}>{src.label}</span>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Source badge (no image) */}
        {!event.imageUrl && (
          <span className="chip text-xs font-semibold mb-2 inline-block" style={{
            background: src.bg, color: src.color, border: `1px solid ${src.border}`
          }}>{src.label}</span>
        )}

        {/* Title */}
        <h3 className="font-display font-semibold text-sm leading-snug mb-2"
          style={{ color: 'var(--color-text)' }}>
          {event.title}
        </h3>

        {/* Date & location */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-gold)' }}>
            <span>📅</span>
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
            <span>📍</span>
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="chip text-xs" style={{
            background: 'rgba(255,255,255,0.05)',
            color: 'var(--color-muted)',
            border: '1px solid var(--color-border)'
          }}>
            {FORMAT_LABELS[event.format]}
          </span>
          <span className="chip text-xs" style={{
            background: event.isFree ? 'rgba(22,163,74,0.1)' : 'rgba(251,191,36,0.1)',
            color: event.isFree ? '#16a34a' : 'var(--color-gold)',
            border: `1px solid ${event.isFree ? 'rgba(22,163,74,0.25)' : 'rgba(251,191,36,0.25)'}`
          }}>
            {event.isFree ? '✅ Free' : `💰 ${event.price ?? 'Paid'}`}
          </span>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-xs leading-relaxed line-clamp-2 mb-3"
            style={{ color: 'var(--color-muted)' }}>
            {event.description}
          </p>
        )}

        {/* CTA */}
        {event.url && (
          <a href={event.url} target="_blank" rel="noopener noreferrer"
            className="block w-full text-center text-xs font-semibold py-2 rounded-lg"
            style={{ background: src.bg, color: src.color, border: `1px solid ${src.border}` }}>
            {event.source === 'eventbrite' ? '🎟️ Get Tickets' : '📋 View Event'} →
          </a>
        )}
      </div>
    </article>
  )
}
