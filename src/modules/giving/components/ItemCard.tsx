import type { DonationItem } from '../../../hooks/useGiving'

const CATEGORY_ICONS: Record<string, string> = {
  'Equipment & Tools': '🔧',
  'Office Supplies': '📎',
  'Furniture': '🪑',
  'Technology / Electronics': '💻',
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  available: {
    bg: 'rgba(34,197,94,0.1)', color: '#22c55e',
    border: 'rgba(34,197,94,0.3)', label: '✅ Available'
  },
  requested: {
    bg: 'rgba(251,191,36,0.1)', color: '#fbbf24',
    border: 'rgba(251,191,36,0.3)', label: '⏳ Requested'
  },
  matched: {
    bg: 'rgba(156,163,175,0.1)', color: '#9ca3af',
    border: 'rgba(156,163,175,0.2)', label: '🤝 Matched'
  },
}

interface ItemCardProps {
  item: DonationItem
  onRequest: () => void
}

export default function ItemCard({ item, onRequest }: ItemCardProps) {
  const status = STATUS_STYLES[item.status]
  const icon   = CATEGORY_ICONS[item.category] ?? '📦'

  return (
    <article className="rounded-xl overflow-hidden card-hover" style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
    }}>
      <div className="h-1" style={{ background: 'var(--color-red)' }} />
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="font-semibold text-sm leading-tight" style={{ color: 'var(--color-text)' }}>
                {item.title}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                📍 {item.city}
              </p>
            </div>
          </div>
          <span className="chip text-xs flex-shrink-0" style={{
            background: status.bg, color: status.color, border: `1px solid ${status.border}`
          }}>
            {status.label}
          </span>
        </div>

        {/* Category */}
        <span className="chip text-xs mb-3" style={{
          background: 'rgba(185,28,28,0.1)',
          color: 'var(--color-red)',
          border: '1px solid rgba(185,28,28,0.2)'
        }}>
          {item.category}
        </span>

        {/* Description */}
        <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--color-muted)' }}>
          {item.description}
        </p>

        {/* Donor */}
        <div className="flex items-center justify-between pt-3 border-t"
          style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Donated by <span style={{ color: 'var(--color-text)' }}>{item.donorName}</span>
          </p>
          {item.status === 'available' && (
            <button onClick={onRequest}
              className="text-xs px-3 py-1.5 rounded-full font-semibold"
              style={{ background: 'var(--color-red)', color: '#fff' }}>
              Request →
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
