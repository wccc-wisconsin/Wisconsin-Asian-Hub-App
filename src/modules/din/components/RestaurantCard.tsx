import { useState, useEffect } from 'react'
import type { Restaurant } from '../../../hooks/useDine'
import { fetchPlaceDetails } from '../../../hooks/useGooglePlaces'
import ShareCard from './ShareCard'

interface RestaurantCardProps { restaurant: Restaurant }

const CUISINE_COLORS: Record<string, { bg: string; color: string }> = {
  'Chinese':      { bg: 'rgba(185,28,28,0.1)',   color: '#B91C1C' },
  'Vietnamese':   { bg: 'rgba(234,88,12,0.1)',   color: '#EA580C' },
  'Japanese':     { bg: 'rgba(219,39,119,0.1)',  color: '#DB2777' },
  'Korean':       { bg: 'rgba(124,58,237,0.1)',  color: '#7C3AED' },
  'Thai':         { bg: 'rgba(16,185,129,0.1)',  color: '#10B981' },
  'Filipino':     { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B' },
  'Asian Fusion': { bg: 'rgba(59,130,246,0.1)',  color: '#3B82F6' },
}

const CUISINE_ICONS: Record<string, string> = {
  'Chinese': '🥢', 'Vietnamese': '🍜', 'Japanese': '🍱',
  'Korean': '🥘', 'Thai': '🌶️', 'Filipino': '🍚', 'Asian Fusion': '🍽️',
}

export default function RestaurantCard({ restaurant: r }: RestaurantCardProps) {
  const [sharing, setSharing]     = useState(false)
  const [photoUrl, setPhotoUrl]   = useState(r.photoUrl ?? '')
  const [rating, setRating]       = useState<number | undefined>()
  const [googleUrl, setGoogleUrl] = useState<string | undefined>()
  const [imgError, setImgError]   = useState(false)

  const cuisine = CUISINE_COLORS[r.cuisine] ?? { bg: 'rgba(185,28,28,0.1)', color: '#B91C1C' }

  // Auto-fetch Google photo if no photoUrl
  useEffect(() => {
    if (!r.photoUrl && import.meta.env.VITE_GOOGLE_MAPS_KEY) {
      fetchPlaceDetails(r.name, r.city).then(details => {
        if (details.photoUrl) setPhotoUrl(details.photoUrl)
        if (details.rating)   setRating(details.rating)
        if (details.googleMapsUrl) setGoogleUrl(details.googleMapsUrl)
      })
    }
  }, [r.name, r.city, r.photoUrl])

  return (
    <>
      <div className="rounded-2xl overflow-hidden card-hover" style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}>
        {/* Photo */}
        <div className="relative w-full" style={{ paddingBottom: '56%' }}>
          {photoUrl && !imgError ? (
            <img src={photoUrl} alt={r.name}
              onError={() => setImgError(true)}
              className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl"
              style={{ background: cuisine.bg }}>
              {CUISINE_ICONS[r.cuisine] ?? '🍽️'}
            </div>
          )}

          {/* Affiliation badge */}
          <div className="absolute top-2 right-2 flex gap-1">
            {r.affiliation === 'wccc' && (
              <span className="chip text-xs font-bold px-2 py-0.5"
                style={{ background: '#B91C1C', color: '#fff' }}>
                🔴 WCCC
              </span>
            )}
            {r.affiliation === 'wda' && (
              <span className="chip text-xs font-bold px-2 py-0.5"
                style={{ background: '#D97706', color: '#fff' }}>
                🍽️ WDA
              </span>
            )}
          </div>

          {/* Weekly deal badge */}
          {r.weeklyDeal && (
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2" style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
            }}>
              <p className="text-xs font-semibold text-white">🎯 {r.weeklyDeal}</p>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Name */}
          <h3 className="font-display font-semibold text-base leading-snug mb-1"
            style={{ color: 'var(--color-text)' }}>
            {r.name}
          </h3>

          {/* Cuisine + city + rating */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="chip text-xs font-medium" style={{
              background: cuisine.bg, color: cuisine.color,
              border: `1px solid ${cuisine.color}30`
            }}>
              {CUISINE_ICONS[r.cuisine]} {r.cuisine}
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-muted)' }}>
              📍 {r.city}
            </span>
            {rating && (
              <span className="text-xs flex items-center gap-1" style={{ color: '#F59E0B' }}>
                ⭐ {rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs leading-relaxed mb-4 line-clamp-2"
            style={{ color: 'var(--color-muted)' }}>
            {r.description}
          </p>

          {/* Hours */}
          {r.hours && (
            <p className="text-xs mb-3 flex items-center gap-1.5" style={{ color: 'var(--color-muted)' }}>
              🕐 {r.hours}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <a href={`tel:${r.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
              📞 Call
            </a>
            {(r.website || googleUrl) && (
              <a href={r.website || googleUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                🌐 Visit
              </a>
            )}
            <button onClick={() => setSharing(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.2)', color: 'var(--color-red)' }}>
              🔗 Share
            </button>
          </div>
        </div>
      </div>

      {sharing && <ShareCard restaurant={r} onClose={() => setSharing(false)} />}
    </>
  )
}
