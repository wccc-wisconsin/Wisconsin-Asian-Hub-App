import { useState } from 'react'
import { collection, doc, setDoc, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'

const WI_CITIES = [
  'Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine',
  'Appleton', 'Waukesha', 'Oshkosh', 'Eau Claire', 'Janesville',
  'La Crosse', 'Sheboygan', 'Wausau', 'Fond du Lac', 'Mequon',
  'Brookfield', 'Wauwatosa', 'West Allis',
]

const SEARCH_TERMS = [
  // Restaurants
  'Chinese restaurant', 'Vietnamese restaurant', 'Korean restaurant',
  'Japanese restaurant', 'Thai restaurant', 'Filipino restaurant',
  'Indian restaurant', 'Asian restaurant', 'Asian fusion restaurant',
  'Dim sum restaurant', 'Sushi restaurant', 'Pho restaurant',
  // Grocery & Retail
  'Asian grocery store', 'Asian supermarket', 'Asian market',
  'Chinese grocery', 'Korean grocery', 'Asian bakery',
  // Professional Services
  'Asian insurance agency', 'Asian real estate', 'Asian accounting',
  'Chinese accounting', 'Asian financial services', 'Asian law',
  // Health & Beauty
  'Asian spa', 'Asian salon', 'Asian nail salon',
  'Chinese medicine', 'Acupuncture', 'Asian massage',
  // Manufacturing & Other
  'Asian manufacturing', 'Chinese manufacturing',
  'Asian import export', 'Asian wholesale',
]

interface DiscoveredBusiness {
  id: string
  name: string
  city: string
  category: string
  address: string
  rating: number | null
  googlePhoto: string
  googleWebsite: string
  placeId: string
  wccc: boolean
  enriched: boolean
  source: string
}

interface SearchLog {
  query: string
  status: 'found' | 'empty' | 'error' | 'skipped'
  count: number
}

async function searchPlaces(query: string, city: string, existingPlaceIds: Set<string>): Promise<DiscoveredBusiness[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY
  if (!apiKey) return []

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.photos,places.formattedAddress,places.websiteUri,places.primaryTypeDisplayName',
      },
      body: JSON.stringify({
        textQuery: `${query} in ${city} Wisconsin`,
        maxResultCount: 20,
        locationBias: {
          circle: {
            center: { latitude: 43.0731, longitude: -89.4012 }, // Wisconsin center
            radius: 300000,
          }
        }
      }),
    })

    const data = await res.json() as {
      places?: Array<{
        id?: string
        displayName?: { text: string }
        rating?: number
        formattedAddress?: string
        websiteUri?: string
        primaryTypeDisplayName?: { text: string }
        photos?: Array<{ name: string }>
      }>
    }

    const results: DiscoveredBusiness[] = []
    const apiKey2 = apiKey

    for (const place of data.places ?? []) {
      if (!place.id || !place.displayName?.text) continue
      if (existingPlaceIds.has(place.id)) continue

      const photoName = place.photos?.[0]?.name ?? null
      const photoUrl  = photoName
        ? `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${apiKey2}`
        : ''

      const docId = place.id.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 60)

      results.push({
        id:            docId,
        name:          place.displayName.text,
        city,
        category:      place.primaryTypeDisplayName?.text ?? query,
        address:       place.formattedAddress ?? city + ', WI',
        rating:        place.rating ?? null,
        googlePhoto:   photoUrl,
        googleWebsite: place.websiteUri ?? '',
        placeId:       place.id,
        wccc:          false,
        enriched:      true,
        source:        'phase2_discovery',
      })

      existingPlaceIds.add(place.id)
    }

    return results
  } catch {
    return []
  }
}

export default function BusinessDiscoveryAdmin() {
  const [running, setRunning]     = useState(false)
  const [done, setDone]           = useState(false)
  const [log, setLog]             = useState<SearchLog[]>([])
  const [progress, setProgress]   = useState({ current: 0, total: 0 })
  const [stats, setStats]         = useState({ added: 0, skipped: 0, empty: 0, error: 0 })
  const [selectedCities, setSelectedCities]   = useState<string[]>(WI_CITIES)
  const [selectedTerms, setSelectedTerms]     = useState<string[]>(SEARCH_TERMS)

  function toggleCity(city: string) {
    setSelectedCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city])
  }

  function toggleTerm(term: string) {
    setSelectedTerms(prev => prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term])
  }

  async function runDiscovery() {
    if (!confirm(`This will search Google Places for ${selectedTerms.length} categories × ${selectedCities.length} cities = ~${selectedTerms.length * selectedCities.length} API calls. This may use Google Maps API quota. Continue?`)) return

    setRunning(true)
    setDone(false)
    setLog([])
    setStats({ added: 0, skipped: 0, empty: 0, error: 0 })

    // Load existing placeIds to avoid duplicates
    const existingSnap = await getDocs(collection(db, 'members'))
    const existingPlaceIds = new Set(
      existingSnap.docs.map(d => d.data().placeId as string).filter(Boolean)
    )

    const total = selectedTerms.length * selectedCities.length
    setProgress({ current: 0, total })
    let current = 0

    for (const city of selectedCities) {
      for (const term of selectedTerms) {
        current++
        setProgress({ current, total })

        try {
          const results = await searchPlaces(term, city, existingPlaceIds)

          if (results.length === 0) {
            setLog(prev => [{ query: `${term} in ${city}`, status: 'empty', count: 0 }, ...prev])
            setStats(prev => ({ ...prev, empty: prev.empty + 1 }))
          } else {
            // Save all new results to Firestore
            for (const biz of results) {
              await setDoc(doc(db, 'members', biz.id), biz)
            }
            setLog(prev => [{ query: `${term} in ${city}`, status: 'found', count: results.length }, ...prev])
            setStats(prev => ({ ...prev, added: prev.added + results.length }))
          }
        } catch {
          setLog(prev => [{ query: `${term} in ${city}`, status: 'error', count: 0 }, ...prev])
          setStats(prev => ({ ...prev, error: prev.error + 1 }))
        }

        // Rate limit — 10 req/sec
        await new Promise(r => setTimeout(r, 120))
      }
    }

    setDone(true)
    setRunning(false)
  }

  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 space-y-3"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
          🔍 Asian Business Discovery — Phase 2
        </h3>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Searches Google Places for Asian businesses across Wisconsin and adds them to the directory.
          Skips businesses already in the database by Place ID.
        </p>

        {/* Estimated calls */}
        <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--color-gold)' }}>
            ⚡ ~{selectedTerms.length * selectedCities.length} API calls · {selectedCities.length} cities · {selectedTerms.length} categories
          </p>
        </div>
      </div>

      {/* City selector */}
      <div className="rounded-xl p-4 space-y-3"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>Cities ({selectedCities.length}/{WI_CITIES.length})</p>
          <div className="flex gap-2">
            <button onClick={() => setSelectedCities(WI_CITIES)}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
              All
            </button>
            <button onClick={() => setSelectedCities([])}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
              None
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {WI_CITIES.map(city => (
            <button key={city} onClick={() => toggleCity(city)}
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                background: selectedCities.includes(city) ? 'var(--color-red)' : 'var(--color-bg)',
                color: selectedCities.includes(city) ? '#fff' : 'var(--color-muted)',
                border: `1px solid ${selectedCities.includes(city) ? 'var(--color-red)' : 'var(--color-border)'}`,
              }}>
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Search terms selector */}
      <div className="rounded-xl p-4 space-y-3"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>Categories ({selectedTerms.length}/{SEARCH_TERMS.length})</p>
          <div className="flex gap-2">
            <button onClick={() => setSelectedTerms(SEARCH_TERMS)}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
              All
            </button>
            <button onClick={() => setSelectedTerms([])}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
              None
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {SEARCH_TERMS.map(term => (
            <button key={term} onClick={() => toggleTerm(term)}
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                background: selectedTerms.includes(term) ? 'rgba(251,191,36,0.2)' : 'var(--color-bg)',
                color: selectedTerms.includes(term) ? 'var(--color-gold)' : 'var(--color-muted)',
                border: `1px solid ${selectedTerms.includes(term) ? 'rgba(251,191,36,0.4)' : 'var(--color-border)'}`,
              }}>
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Run button */}
      <button onClick={runDiscovery} disabled={running || selectedCities.length === 0 || selectedTerms.length === 0}
        className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
        style={{ background: 'var(--color-red)', color: '#fff' }}>
        {running ? `⏳ Searching ${progress.current} / ${progress.total}...` : '🔍 Start Discovery'}
      </button>

      {done && (
        <p className="text-xs text-center font-semibold" style={{ color: '#22c55e' }}>
          ✅ Complete! Added {stats.added} new businesses to the directory.
        </p>
      )}

      {/* Progress bar */}
      {running && (
        <div className="rounded-xl p-4 space-y-2"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex justify-between text-xs" style={{ color: 'var(--color-muted)' }}>
            <span>Progress</span><span>{pct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--color-red)' }} />
          </div>
        </div>
      )}

      {/* Stats */}
      {(running || done) && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Added',   count: stats.added,   color: '#22c55e' },
            { label: 'Empty',   count: stats.empty,   color: '#fbbf24' },
            { label: 'Skipped', count: stats.skipped, color: '#60a5fa' },
            { label: 'Errors',  count: stats.error,   color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.count}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div className="rounded-xl overflow-hidden"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>Search Log</p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
            {log.map((entry, i) => (
              <div key={i} className="px-4 py-2 border-b flex items-center gap-3"
                style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-xs">
                  {entry.status === 'found' ? '✅' : entry.status === 'empty' ? '◯' : entry.status === 'skipped' ? '⏭' : '❌'}
                </span>
                <p className="text-xs flex-1 truncate" style={{ color: 'var(--color-text)' }}>{entry.query}</p>
                {entry.count > 0 && (
                  <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>+{entry.count}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
