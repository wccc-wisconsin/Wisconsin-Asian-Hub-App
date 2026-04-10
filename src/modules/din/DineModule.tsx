import { useState, useMemo } from 'react'
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
      <div className="w-full skeleton" style={{ height: 120 }} />
      <div className="p-4 space-y-2">
        <div className="h-4 rounded skeleton w-3/4" />
        <div className="h-3 rounded skeleton w-1/2" />
        <div className="h-2 rounded skeleton w-full" />
        <div className="h-2 rounded skeleton w-4/5" />
      </div>
    </div>
  )
}

export default function DineModule() {
  const { restaurants, loading }         = useRestaurants()
  const [cuisine, setCuisine]            = useState<Cuisine | 'all'>('all')
  const [affiliation, setAffiliation]    = useState<'all' | 'wccc' | 'wda'>('all')
  const [submitting, setSubmitting]      = useState(false)
  const [sharing, setSharing]            = useState<Restaurant | null>(null)

  const featured = restaurants.find(r => r.featured && r.affiliation === 'wccc')

  const filtered = useMemo(() => restaurants.filter(r => {
    if (r.featured && r.affiliation === 'wccc') return false // excluded from grid, shown in spotlight
    if (cuisine !== 'all' && r.cuisine !== cuisine) return false
    if (affiliation !== 'all' && r.affiliation !== affiliation) return false
    return true
  }), [restaurants, cuisine, affiliation])

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {submitting && <SubmitRestaurantForm onClose={() => setSubmitting(false)} />}
      {sharing    && <ShareCard restaurant={sharing} onClose={() => setSharing(null)} />}

      {/* Partnership header */}
      <div className="px-4 pt-5 pb-3 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          {/* WCCC logo */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{
            background: 'rgba(185,28,28,0.12)', border: '1px solid rgba(185,28,28,0.3)'
          }}>
            <div className="w-5 h-5 rounded-sm flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'var(--color-red)' }}>亚</div>
            <span className="text-xs font-semibold" style={{ color: 'var(--color-red)' }}>WCCC</span>
          </div>
          <span className="text-sm" style={{ color: 'var(--color-muted)' }}>×</span>
          {/* WDA logo */}
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
        background: 'rgba(12,10,9,0.9)', backdropFilter: 'blur(12px)',
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

        {/* Cuisine filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
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
          <RestaurantCard key={r.id} restaurant={r} onShare={() => setSharing(r)} />
        ))}
      </div>
    </div>
  )
}
