import { useState, useMemo, useEffect } from 'react'
import { useRestaurants, type Cuisine, type Restaurant } from '../../hooks/useDine'
import FeaturedSpotlight from './components/FeaturedSpotlight'
import RestaurantCard from './components/RestaurantCard'
import SubmitRestaurantForm from './components/SubmitRestaurantForm'
import ShareCard from './components/ShareCard'

const CUISINES: Cuisine[] = ['Chinese', 'Vietnamese', 'Japanese', 'Korean', 'Thai', 'Filipino', 'Asian Fusion']
const CUISINE_ICONS: Record<string, string> = {
  'Chinese': '🥢', 'Vietnamese': '🍜', 'Japanese': '🍱',
  'Korean': '🥘', 'Thai': '🌶️', 'Filipino': '🍚', 'Asian Fusion': '🍽️',
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
    if ('share' in navigator) {
      navigator.share({ title: restaurant.name, text, url: `https://hub.wcccbusinessnetwork.org/dine/${restaurant.id}` })
    } else {
      navigator.clipboard.writeText(`https://hub.wcccbusinessnetwork.org/dine/${restaurant.id}`)
      alert('Link copied!')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <button onClick={onClose} className="text-sm font-medium" style={{ color: 'var(--color-red)' }}>
          ← Back
        </button>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
          background: isWCCC ? 'rgba(185,28,28,0.15)' : 'rgba(251,191,36,0.15)',
          color: isWCCC ? 'var(--color-red)' : 'var(--color-gold)',
        }}>
          {isWCCC ? '🔴 WCCC' : '🟡 WDA'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Photo */}
        {restaurant.photoUrl && (
          <img src={restaurant.photoUrl} alt={restaurant.name}
            className="w-full h-48 object-cover rounded-xl" />
        )}

        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{restaurant.name}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-gold)' }}>
            {CUISINE_ICONS[restaurant.cuisine]} {restaurant.cuisine}
            {restaurant.rating && <span className="ml-2">⭐ {restaurant.rating}</span>}
          </p>
        </div>

        {restaurant.weeklyDeal && (
          <div className="p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>🔥 Weekly Deal</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text)' }}>{restaurant.weeklyDeal}</p>
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
  const [affiliation, setAffiliation]    = useState<'all' | 'wccc' | 'wda'>('all')
  const [city, setCity]                  = useState<string>('all')
  const [search, setSearch]              = useState('')
  const [submitting, setSubmitting]      = useState(false)
  const [sharing, setSharing]            = useState<Restaurant | null>(null)
  const [detail, setDetail]              = useState<Restaurant | null>(null)

  // Auto-open restaurant from deep link
  useEffect(() => {
    if (deepLinkId && restaurants.length > 0) {
      const found = restaurants.find(r => r.id === deepLinkId)
      if (found) setDetail(found)
    }
  }, [deepLinkId, restaurants])

  // Extract unique cities from restaurants for the city filter
  const cities = useMemo(() => {
    const citySet = new Set(restaurants.map(r => r.city).filter(Boolean))
    return Array.from(citySet).sort()
  }, [restaurants])

  const featured = restaurants.find(r => r.featured && r.affiliation === 'wccc')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return restaurants.filter(r => {
      if (r.featured && r.affiliation === 'wccc') return false
      if (cuisine !== 'all' && r.cuisine !== cuisine) return false
      if (affiliation !== 'all' && r.affiliation !== affiliation) return false
      if (city !== 'all' && r.city !== city) return false
      if (q) {
        const haystack = `${r.name} ${r.cuisine} ${r.city} ${r.address} ${r.description ?? ''}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [restaurants, cuisine, affiliation, city, search])

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

      {/* Partnership header */}
      <div className="px-4 pt-5 pb-3 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{
            background: 'rgba(185,28,28,0.12)', border: '1px solid rgba(185,28,28,0.3)'
          }}>
            <div className="w-5 h-5 rounded-sm flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'var(--color-red)' }}>亚</div>
            <span className="text-xs font-semibold" style={{ color: 'var(--color-red)' }}>WCCC</span>
          </div>
          <span className="text-sm" style={{ color: 'var(--color-muted)' }}>×</span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{
            background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)'
          }}>
            <span className="text-sm">🍽️</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
              Wisconsin Dinner Association
            </span>
          </div>
        </div>
        <h1 className="font-display text-xl font-bold" style={{ color: 'var(--color-text)' }}>
          Dine Asian Wisconsin
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
          Supporting Asian restaurants across Wisconsin
        </p>
      </div>

      {/* Search bar */}
      <div className="px-4 mt-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-muted)' }}>
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search restaurants, cuisines, cities..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              fontSize: '16px',
              outline: 'none',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: 'var(--color-muted)' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Featured spotlight */}
      {!loading && featured && !search && (
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
        background: 'color-mix(in srgb, var(--color-bg) 90%, transparent)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        {/* Affiliation filter */}
        <div className="flex gap-2 mb-2">
          {([['all', '🗂 All'], ['wccc', '🔴 WCCC'], ['wda', '🟡 WDA']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setAffiliation(val)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: affiliation === val ? 'var(--color-red)' : 'var(--color-surface)',
                color: affiliation === val ? '#fff' : 'var(--color-muted)',
                border: `1px solid ${affiliation === val ? 'var(--color-red)' : 'var(--color-border)'}`,
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* City filter */}
        {cities.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-2" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => setCity('all')}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: city === 'all' ? 'rgba(185,28,28,0.15)' : 'var(--color-surface)',
                color: city === 'all' ? 'var(--color-red)' : 'var(--color-muted)',
                border: `1px solid ${city === 'all' ? 'rgba(185,28,28,0.4)' : 'var(--color-border)'}`,
              }}>
              📍 All Cities
            </button>
            {cities.map(c => (
              <button key={c} onClick={() => setCity(c)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: city === c ? 'rgba(185,28,28,0.15)' : 'var(--color-surface)',
                  color: city === c ? 'var(--color-red)' : 'var(--color-muted)',
                  border: `1px solid ${city === c ? 'rgba(185,28,28,0.4)' : 'var(--color-border)'}`,
                }}>
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Cuisine filter */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => setCuisine('all')}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: cuisine === 'all' ? 'rgba(251,191,36,0.2)' : 'var(--color-surface)',
              color: cuisine === 'all' ? 'var(--color-gold)' : 'var(--color-muted)',
              border: `1px solid ${cuisine === 'all' ? 'rgba(251,191,36,0.4)' : 'var(--color-border)'}`,
            }}>
            All Cuisines
          </button>
          {CUISINES.map(c => (
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
          <span style={{ color: 'var(--color-gold)' }}>{filtered.length}</span> restaurant{filtered.length !== 1 ? 's' : ''}
          {search && <span> matching "<strong style={{ color: 'var(--color-text)' }}>{search}</strong>"</span>}
          {city !== 'all' && <span> in <strong style={{ color: 'var(--color-text)' }}>{city}</strong></span>}
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

        {!loading && filtered.length === 0 && restaurants.length > 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-medium" style={{ color: 'var(--color-text)' }}>No restaurants found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
              Try adjusting your search or filters
            </p>
            <button onClick={() => { setSearch(''); setCuisine('all'); setAffiliation('all'); setCity('all') }}
              className="mt-4 px-5 py-2 rounded-full text-sm font-medium"
              style={{ background: 'var(--color-surface)', color: 'var(--color-red)', border: '1px solid rgba(185,28,28,0.25)' }}>
              Clear all filters
            </button>
          </div>
        )}

        {filtered.map(r => (
          <div key={r.id} onClick={() => openDetail(r)} className="cursor-pointer">
            <RestaurantCard restaurant={r} onShare={() => { setSharing(r) }} />
          </div>
        ))}
      </div>
    </div>
  )
}
