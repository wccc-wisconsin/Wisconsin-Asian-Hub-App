import { useState, useMemo, useEffect } from 'react'
import { useRestaurants, type Cuisine, type Restaurant } from '../../hooks/useDine'
import FeaturedSpotlight from './components/FeaturedSpotlight'
import RestaurantCard from './components/RestaurantCard'
import SubmitRestaurantForm from './components/SubmitRestaurantForm'
import ShareCard from './components/ShareCard'

const CUISINE_ICONS: Record<string, string> = {
  'Chinese': '🥢', 'Vietnamese': '🍜', 'Japanese': '🍱',
  'Korean': '🥘', 'Thai': '🌶️', 'Filipino': '🍚', 'Asian Fusion': '🍽️',
  'American': '🍔', 'Italian': '🍝', 'Mexican': '🌮', 'Indian': '🍛',
  'Mediterranean': '🫒', 'Hawaiian': '🌺', 'Taiwanese': '🧋',
  'Singaporean': '🦀', 'Malaysian': '🍜', 'Indonesian': '🍚',
  'Cantonese': '🥢', 'Szechuan': '🌶️', 'Dim Sum': '🥟', 'BBQ': '🔥',
  'Seafood': '🦞', 'Vegetarian': '🥗', 'Vegan': '🌱', 'Bakery': '🥐',
  'Cafe': '☕', 'Bubble Tea': '🧋', 'Dessert': '🧁', 'Catering': '🍽️',
}

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="h-1 skeleton" />
      <div className="w-full skeleton" style={{ height: 160 }} />
      <div className="p-4 space-y-2">
        <div className="h-4 rounded skeleton w-3/4" />
        <div className="h-3 rounded skeleton w-1/2" />
        <div className="h-2 rounded skeleton w-full" />
        <div className="h-2 rounded skeleton w-4/5" />
      </div>
    </div>
  )
}

// Full-screen restaurant detail modal
function RestaurantDetail({ restaurant, onClose }: { restaurant: Restaurant; onClose: () => void }) {
  const isWCCC = restaurant.affiliation === 'wccc'
  const directionsUrl = restaurant.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address + ', ' + restaurant.city + ', WI')}`
    : null
  const url = restaurant.website
    ? restaurant.website.startsWith('http') ? restaurant.website : `https://${restaurant.website}`
    : null

  function handleShare() {
    const text = `🍽️ ${restaurant.name} — ${restaurant.cuisine} in ${restaurant.city}, WI\n\nhub.wcccbusinessnetwork.org/dine/${restaurant.id}`
    if (navigator.share) {
      navigator.share({ title: restaurant.name, text, url: `https://hub.wcccbusinessnetwork.org/dine/${restaurant.id}` })
    } else {
      navigator.clipboard.writeText(`https://hub.wcccbusinessnetwork.org/dine/${restaurant.id}`)
      alert('Link copied!')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 h-14 border-b"
        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
        <button onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>
          ←
        </button>
        <span className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
          {restaurant.name}
        </span>
        <button onClick={handleShare} className="ml-auto text-sm px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(185,28,28,0.1)', color: 'var(--color-red)', border: '1px solid rgba(185,28,28,0.2)' }}>
          📤 Share
        </button>
      </div>

      {/* Photo */}
      {restaurant.photoUrl ? (
        <div style={{ height: 240, overflow: 'hidden', background: 'var(--color-surface)' }}>
          <img src={restaurant.photoUrl} alt={restaurant.name}
            style={{ width: '100%', height: '100%', objectFit: restaurant.isLogo ? 'contain' : 'cover', padding: restaurant.isLogo ? '24px' : 0 }} />
        </div>
      ) : (
        <div className="flex items-center justify-center text-6xl"
          style={{ height: 200, background: 'var(--color-surface)' }}>
          {CUISINE_ICONS[restaurant.cuisine] ?? '🍽️'}
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-5 space-y-4 pb-24">
        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          {isWCCC && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(185,28,28,0.15)', color: '#ef4444' }}>WCCC Member</span>
          )}

          {restaurant.featured && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(124,58,237,0.15)', color: '#7c3aed' }}>⭐ Featured</span>
          )}
        </div>

        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {restaurant.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            {CUISINE_ICONS[restaurant.cuisine] ?? '🍽️'} {restaurant.cuisine} · {restaurant.city}, WI
          </p>
          {restaurant.rating && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-gold)' }}>⭐ {restaurant.rating.toFixed(1)} Google Rating</p>
          )}
        </div>

        {restaurant.weeklyDeal && (
          <div className="rounded-xl px-4 py-3"
            style={{ background: 'rgba(185,28,28,0.1)', border: '1px solid rgba(185,28,28,0.25)' }}>
            <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>🎟️ {restaurant.weeklyDeal}</p>
          </div>
        )}

        {restaurant.description && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)', whiteSpace: 'pre-wrap' }}>
            {restaurant.description}
          </p>
        )}

        {restaurant.address && (
          <div className="flex items-start gap-2">
            <span>📍</span>
            <p className="text-sm" style={{ color: 'var(--color-text)' }}>
              {restaurant.address}, {restaurant.city}, WI
            </p>
          </div>
        )}

        {restaurant.hours && (
          <div className="flex items-start gap-2">
            <span>🕐</span>
            <p className="text-sm" style={{ color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{restaurant.hours}</p>
          </div>
        )}

        {restaurant.phone && (
          <div className="flex items-center gap-2">
            <span>📞</span>
            <a href={`tel:${restaurant.phone}`} className="text-sm" style={{ color: 'var(--color-red)' }}>
              {restaurant.phone}
            </a>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {directionsUrl && (
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
              className="py-3 rounded-xl text-sm font-semibold text-center"
              style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
              🗺️ Directions
            </a>
          )}
          {restaurant.phone && (
            <a href={`tel:${restaurant.phone}`}
              className="py-3 rounded-xl text-sm font-semibold text-center"
              style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
              📞 Call
            </a>
          )}
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="py-3 rounded-xl text-sm font-semibold text-center"
              style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
              🌐 Website
            </a>
          )}
          <button onClick={handleShare}
            className="py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--color-red)', color: '#fff' }}>
            📤 Share Link
          </button>
        </div>
      </div>
    </div>
  )
}

interface DineModuleProps {
  deepLinkId?: string
}

export default function DineModule({ deepLinkId }: DineModuleProps) {
  const { restaurants, loading }         = useRestaurants()
  const [cuisine, setCuisine]            = useState<Cuisine | 'all'>('all')
  const [submitting, setSubmitting]      = useState(false)
  const [search, setSearch]              = useState('')
  const [sharing, setSharing]            = useState<Restaurant | null>(null)
  const [detail, setDetail]              = useState<Restaurant | null>(null)

  // Auto-open restaurant from deep link
  useEffect(() => {
    if (deepLinkId && restaurants.length > 0) {
      const found = restaurants.find(r => r.id === deepLinkId)
      if (found) setDetail(found)
    }
  }, [deepLinkId, restaurants])

  // Derive unique cuisines from actual data
  const availableCuisines = useMemo(() => {
    const seen = new Set<string>()
    restaurants.forEach(r => { if (r.cuisine) seen.add(r.cuisine) })
    const sorted = [...seen].filter(c => c !== 'Other').sort()
    if (seen.has('Other')) sorted.push('Other')
    return sorted
  }, [restaurants])

  const featured = restaurants.find(r => r.featured)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return restaurants.filter(r => {
      if (r.featured) return false
      if (cuisine !== 'all' && r.cuisine !== cuisine) return false
      if (q && !`${r.name} ${r.city} ${r.cuisine} ${r.description ?? ''}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [restaurants, cuisine, search])

  function openDetail(r: Restaurant) {
    setDetail(r)
    window.history.pushState({}, '', `/dine/${r.id}`)
  }

  function closeDetail() {
    setDetail(null)
    window.history.pushState({}, '', '/dine')
  }

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {submitting && <SubmitRestaurantForm onClose={() => setSubmitting(false)} />}
      {sharing    && <ShareCard restaurant={sharing} onClose={() => setSharing(null)} />}
      {detail     && <RestaurantDetail restaurant={detail} onClose={closeDetail} />}

      {/* Header */}
      <div className="px-4 pt-5 pb-3 text-center">
        <h1 className="font-display text-xl font-bold" style={{ color: 'var(--color-text)' }}>
          Dine Asian Wisconsin
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
          Supporting Asian restaurants across Wisconsin
        </p>
      </div>

      {/* Featured spotlight */}
      {!loading && featured && (
        <FeaturedSpotlight restaurant={featured} onShare={() => setSharing(featured)} />
      )}

      {/* Submit CTA */}
      <div className="px-4 mt-4">
        <button onClick={() => setSubmitting(true)}
          className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{
            background: 'rgba(185,28,28,0.08)', color: 'var(--color-red)',
            border: '1px solid rgba(185,28,28,0.25)'
          }}>
          🍜 List Your Restaurant
        </button>
      </div>

      {/* Filters */}
      <div className="sticky top-14 z-40 px-4 py-3 mt-4" style={{
        background: 'var(--color-bg)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div className="relative mb-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-muted)' }}>🔍</span>
          <input type="text" placeholder="Search restaurants..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: '16px' }} />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--color-muted)' }}>✕</button>
          )}
        </div>


        <div className="flex gap-2 overflow-x-auto pb-1">

          {availableCuisines.map(c => (
            <button key={c} onClick={() => setCuisine(c)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: cuisine === c ? 'rgba(251,191,36,0.2)' : 'var(--color-surface)',
                color: cuisine === c ? 'var(--color-gold)' : 'var(--color-muted)',
                border: `1px solid ${cuisine === c ? 'rgba(251,191,36,0.4)' : 'var(--color-border)'}`,
              }}>
              {CUISINE_ICONS[c]} {c}
            </button>
          ))}
        </div>

        <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
          <span style={{ color: 'var(--color-gold)' }}>{filtered.length}</span> restaurants
        </p>
      </div>

      {/* Grid */}
      <div className="px-4 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

        {!loading && filtered.length === 0 && restaurants.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-4xl mb-3">🍜</p>
            <p className="font-medium" style={{ color: 'var(--color-text)' }}>No restaurants yet</p>
            <p className="text-sm mt-1 mb-6" style={{ color: 'var(--color-muted)' }}>
              Be the first to list your restaurant!
            </p>
            <button onClick={() => setSubmitting(true)}
              className="px-6 py-2.5 rounded-full text-sm font-semibold"
              style={{ background: 'var(--color-red)', color: '#fff' }}>
              🍜 List Your Restaurant
            </button>
          </div>
        )}

        {filtered.map(r => (
          <RestaurantCard key={r.id} restaurant={r}
            onOpen={() => openDetail(r)}
          />
        ))}
      </div>
    </div>
  )
}
