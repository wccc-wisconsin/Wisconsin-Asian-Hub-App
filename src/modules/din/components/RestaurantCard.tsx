import { useState } from 'react'
import type { Restaurant } from '../../../hooks/useDine'

const CUISINE_ICONS: Record<string, string> = {
  Chinese: '🥢',
  Vietnamese: '🍜',
  Japanese: '🍱',
  Korean: '🥘',
  Thai: '🌶️',
  Filipino: '🍚',
  'Asian Fusion': '🍽️',
}

interface RestaurantCardProps {
  restaurant: Restaurant
  onShare: () => void
}

export default function RestaurantCard({ restaurant, onShare }: RestaurantCardProps) {
  const isWCCC = restaurant.affiliation === 'wccc'
  const [expanded, setExpanded] = useState(false)

  return (
    <article
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--color-surface)',
        border: `1px solid ${isWCCC ? 'rgba(185,28,28,0.3)' : 'rgba(251,191,36,0.2)'}`,
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-1"
        style={{
          background: isWCCC
            ? 'linear-gradient(90deg, #B91C1C, #ef4444)'
            : 'linear-gradient(90deg, #d97706, #fbbf24)',
        }}
      />

      {/* Photo */}
      {restaurant.photoUrl ? (
        <img
          src={restaurant.photoUrl}
          alt={restaurant.name}
          className="w-full object-cover"
          style={{ height: 120 }}
        />
      ) : (
        <div
          className="w-full flex items-center justify-center text-4xl"
          style={{ height: 120, background: 'var(--color-bg)' }}
        >
          {CUISINE_ICONS[restaurant.cuisine] ?? '🍽️'}
        </div>
      )}

      {/* Body */}
      <div className="p-4 space-y-2">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {isWCCC && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(185,28,28,0.15)', color: '#ef4444' }}
            >
              WCCC Member
            </span>
          )}
          {restaurant.affiliation === 'wda' && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#d97706' }}
            >
              WDA Partner
            </span>
          )}
          {restaurant.featured && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(124,58,237,0.15)', color: '#7c3aed' }}
            >
              ⭐ Featured
            </span>
          )}
        </div>

        <h3 className="font-semibold text-base leading-tight" style={{ color: 'var(--color-text)' }}>
          {restaurant.name}
        </h3>

        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          {CUISINE_ICONS[restaurant.cuisine] ?? '🍽️'} {restaurant.cuisine} · {restaurant.city}, WI
        </p>

        {restaurant.rating && (
          <p className="text-xs" style={{ color: 'var(--color-gold)' }}>
            ⭐ {restaurant.rating.toFixed(1)}
          </p>
        )}

        {restaurant.weeklyDeal && (
          <div
            className="rounded-lg px-3 py-2"
            style={{ background: 'rgba(185,28,28,0.1)', border: '1px solid rgba(185,28,28,0.25)' }}
          >
            <p className="text-xs font-medium" style={{ color: '#ef4444' }}>
              🎟️ {restaurant.weeklyDeal}
            </p>
          </div>
        )}

        {/* Description with expand/collapse */}
        {restaurant.description && (
          <div>
            <p
              className="text-xs"
              style={{
                color: 'var(--color-muted)',
                display: '-webkit-box',
                WebkitLineClamp: expanded ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: expanded ? 'visible' : 'hidden',
              }}
            >
              {restaurant.description}
            </p>
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs mt-1 font-medium"
              style={{ color: 'var(--color-red)' }}
            >
              {expanded ? 'Show less ↑' : 'Read more ↓'}
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone}`}
              className="flex-1 py-2 rounded-lg text-xs font-medium text-center"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            >
              📞 Call
            </a>
          )}
          {restaurant.website && (
            <a
              href={restaurant.website.startsWith('http') ? restaurant.website : `https://${restaurant.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 rounded-lg text-xs font-medium text-center"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            >
              🌐 Visit
            </a>
          )}
          <button
            onClick={onShare}
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
