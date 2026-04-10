import type { Restaurant } from '../../../hooks/useDine'

const CUISINE_ICONS: Record<string, string> = {
  'Chinese': '🥢', 'Vietnamese': '🍜', 'Japanese': '🍱',
  'Korean': '🥘', 'Thai': '🌶️', 'Filipino': '🍚', 'Asian Fusion': '🍽️',
}

interface FeaturedSpotlightProps {
  restaurant: Restaurant
  onShare: () => void
}

export default function FeaturedSpotlight({ restaurant, onShare }: FeaturedSpotlightProps) {
  return (
    <div className="mx-4 mt-4 rounded-2xl overflow-hidden" style={{
      border: '1px solid rgba(185,28,28,0.4)',
      boxShadow: '0 8px 32px rgba(185,28,28,0.2)'
    }}>
      {/* Photo or gradient */}
      <div className="relative w-full" style={{ paddingBottom: '52%' }}>
        {restaurant.photoUrl ? (
          <img src={restaurant.photoUrl} alt={restaurant.name}
            className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-7xl"
            style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #2d1010 100%)' }}>
            {CUISINE_ICONS[restaurant.cuisine] ?? '🍽️'}
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)'
        }} />
        {/* Featured badge */}
        <div className="absolute top-3 left-3">
          <span className="chip text-xs font-bold px-3 py-1" style={{
            background: 'var(--color-red)', color: '#fff',
            boxShadow: '0 2px 8px rgba(185,28,28,0.5)'
          }}>
            ⭐ Featured This Week
          </span>
        </div>
        {/* WCCC badge */}
        <div className="absolute top-3 right-3">
          <span className="chip text-xs font-bold" style={{
            background: 'rgba(185,28,28,0.9)', color: '#fff', backdropFilter: 'blur(4px)'
          }}>
            🔴 WCCC Member
          </span>
        </div>
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <h2 className="font-display font-bold text-xl text-white leading-tight">
            {restaurant.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-white opacity-80">
              {CUISINE_ICONS[restaurant.cuisine]} {restaurant.cuisine}
            </span>
            <span className="text-xs text-white opacity-60">·</span>
            <span className="text-xs text-white opacity-80">📍 {restaurant.city}</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3" style={{ background: 'var(--color-surface)' }}>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          {restaurant.description}
        </p>

        {/* Weekly deal */}
        {restaurant.weeklyDeal && (
          <div className="rounded-xl px-4 py-3" style={{
            background: 'rgba(185,28,28,0.1)', border: '1px solid rgba(185,28,28,0.25)'
          }}>
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-red)' }}>
              🎟️ Exclusive WCCC Deal This Week
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {restaurant.weeklyDeal}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {restaurant.phone && (
            <a href={`tel:${restaurant.phone}`}
              className="flex-1 text-center text-sm py-2.5 rounded-xl font-medium"
              style={{ background: 'var(--color-red)', color: '#fff' }}>
              📞 Reserve
            </a>
          )}
          {restaurant.website && (
            <a href={restaurant.website.startsWith('http') ? restaurant.website : `https://${restaurant.website}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 text-center text-sm py-2.5 rounded-xl font-medium"
              style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
              🌐 Menu
            </a>
          )}
          <button onClick={onShare}
            className="px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--color-gold)', border: '1px solid rgba(251,191,36,0.3)' }}>
            📤
          </button>
        </div>
      </div>
    </div>
  )
}
