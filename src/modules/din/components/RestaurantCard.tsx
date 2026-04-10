import type { Restaurant } from '../../../hooks/useDine'

const CUISINE_ICONS: Record<string, string> = {
  'Chinese': '🥢', 'Vietnamese': '🍜', 'Japanese': '🍱',
  'Korean': '🥘', 'Thai': '🌶️', 'Filipino': '🍚', 'Asian Fusion': '🍽️',
}

interface RestaurantCardProps {
  restaurant: Restaurant
  onShare: () => void
}

export default function RestaurantCard({ restaurant, onShare }: RestaurantCardProps) {
  const isWCCC = restaurant.affiliation === 'wccc'

  return (
    <article className="rounded-xl overflow-hidden card-hover" style={{
      background: 'var(--color-surface)',
      border: `1px solid ${isWCCC ? 'rgba(185,28,28,0.3)' : 'rgba(251,191,36,0.2)'}`,
    }}>
      {/* Top accent */}
      <div className="h-1" style={{
        background: isWCCC ? 'var(--color-red)' : 'var(--color-gold)'
      }} />

      {/* Photo */}
      {restaurant.photoUrl ? (
        <div className="relative w-full" style={{ paddingBottom: '52%' }}>
          <img src={restaurant.photoUrl} alt={restaurant.name}
            className="absolute inset-0 w-full h-full object-cover" />
          {/* Affiliation badge */}
          <div className="absolute top-2 right-2">
            <span className="chip text-xs font-bold" style={{
              background: isWCCC ? 'rgba(185,28,28,0.9)' : 'rgba(180,83,9,0.9)',
              color: '#fff',
              backdropFilter: 'blur(4px)',
            }}>
              {isWCCC ? '🔴 WCCC' : '🟡 WDA'}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center text-5xl"
          style={{ height: 120, background: 'rgba(255,255,255,0.03)' }}>
          {CUISINE_ICONS[restaurant.cuisine] ?? '🍽️'}
        </div>
      )}

      <div className="p-4">
        {/* Name + badge (if no photo) */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-semibold text-sm leading-tight"
            style={{ color: 'var(--color-text)' }}>
            {restaurant.name}
          </h3>
          {!restaurant.photoUrl && (
            <span className="chip text-xs flex-shrink-0" style={{
              background: isWCCC ? 'rgba(185,28,28,0.12)' : 'rgba(251,191,36,0.12)',
              color: isWCCC ? 'var(--color-red)' : 'var(--color-gold)',
              border: `1px solid ${isWCCC ? 'rgba(185,28,28,0.3)' : 'rgba(251,191,36,0.3)'}`,
            }}>
              {isWCCC ? '🔴 WCCC' : '🟡 WDA'}
            </span>
          )}
        </div>

        {/* Cuisine + city */}
        <div className="flex items-center gap-2 mb-3">
          <span className="chip text-xs" style={{
            background: 'rgba(185,28,28,0.08)', color: 'var(--color-red)',
            border: '1px solid rgba(185,28,28,0.15)'
          }}>
            {CUISINE_ICONS[restaurant.cuisine]} {restaurant.cuisine}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>📍 {restaurant.city}</span>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--color-muted)' }}>
          {restaurant.description}
        </p>

        {/* Weekly deal — WCCC only */}
        {isWCCC && restaurant.weeklyDeal && (
          <div className="rounded-lg px-3 py-2 mb-3" style={{
            background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.2)'
          }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-red)' }}>
              🎟️ This Week's Deal
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text)' }}>
              {restaurant.weeklyDeal}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          {restaurant.phone && (
            <a href={`tel:${restaurant.phone}`}
              className="flex-1 text-center text-xs py-1.5 rounded-lg"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
              📞 Call
            </a>
          )}
          {restaurant.website && (
            <a href={restaurant.website.startsWith('http') ? restaurant.website : `https://${restaurant.website}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 text-center text-xs py-1.5 rounded-lg"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
              🌐 Visit
            </a>
          )}
          <button onClick={onShare}
            className="flex-1 text-center text-xs py-1.5 rounded-lg"
            style={{ background: 'rgba(185,28,28,0.1)', border: '1px solid rgba(185,28,28,0.2)', color: 'var(--color-red)' }}>
            📤 Share
          </button>
        </div>
      </div>
    </article>
  )
}
