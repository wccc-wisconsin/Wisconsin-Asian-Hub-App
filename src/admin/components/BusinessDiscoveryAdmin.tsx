import { useState } from 'react'
import { collection, doc, setDoc, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'

const WI_CITIES = [
  'Milwaukee WI', 'Madison WI', 'Green Bay WI', 'Kenosha WI', 'Racine WI',
  'Appleton WI', 'Waukesha WI', 'Oshkosh WI', 'Eau Claire WI', 'Janesville WI',
  'La Crosse WI', 'Sheboygan WI', 'Wausau WI', 'Fond du Lac WI', 'Mequon WI',
  'Brookfield WI', 'Wauwatosa WI', 'West Allis WI',
]

const SEARCH_TERMS = [
  // Restaurants
  'Chinese restaurant', 'Vietnamese restaurant', 'Korean restaurant',
  'Japanese restaurant', 'Thai restaurant', 'Filipino restaurant',
  'Indian restaurant', 'Asian restaurant', 'Asian fusion restaurant',
  'Dim sum', 'Sushi', 'Pho restaurant', 'Ramen',
  // Grocery & Retail
  'Asian grocery', 'Asian supermarket', 'Asian market',
  'Chinese grocery', 'Korean grocery', 'Asian bakery',
  // Professional Services
  'Asian insurance', 'Asian real estate agent', 'Asian accounting',
  'Asian financial advisor', 'Asian law office',
  // Health & Beauty
  'Asian spa', 'Asian nail salon', 'Chinese medicine',
  'Acupuncture clinic', 'Asian massage',
  // Manufacturing & Other
  'Asian manufacturing', 'Asian import export', 'Asian wholesale',
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
  phone: string
  email: string
  website: string
  photo: string
  description: string
}

interface SearchLog {
  query: string
  status: 'found' | 'empty' | 'error'
  count: number
  message?: string
}

async function searchPlaces(
  term: string,
  city: string,
  existingPlaceIds: Set<string>
): Promise<{ results: DiscoveredBusiness[]; error?: string }> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY
  if (!apiKey) return { results: [], error: 'No API key' }

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.photos,places.formattedAddress,places.websiteUri,places.primaryTypeDisplayName,places.nationalPhoneNumber',
      },
      body: JSON.stringify({
        textQuery: `${term} ${city}`,
        maxResultCount: 20,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return { results: [], error: JSON.stringify(err) }
    }

    const data = await res.json() as {
      places?: Array<{
        id?: string
        displayName?: { text: string }
        rating?: number
        formattedAddress?: string
        websiteUri?: string
        nationalPhoneNumber?: string
        primaryTypeDisplayName?: { text: string }
        photos?: Array<{ name: string }>
      }>
    }

    const results: DiscoveredBusiness[] = []

    for (const place of data.places ?? []) {
      if (!place.id || !place.displayName?.text) continue
      if (existingPlaceIds.has(place.id)) continue

      const photoName = place.photos?.[0]?.name ?? null
      const photoUrl  = photoName
        ? `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${apiKey}`
        : ''

      // Extract city name without " WI" suffix
      const cityName = city.replace(' WI', '')

      const docId = (place.displayName.text + '-' + cityName)
        .toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 60)

      results.push({
        id:            docId,
        name:          place.displayName.text,
        city:          cityName,
        category:      place.primaryTypeDisplayName?.text ?? term,
        address:       place.formattedAddress ?? cityName + ', WI',
        rating:        place.rating ?? null,
        googlePhoto:   photoUrl,
        googleWebsite: place.websiteUri ?? '',
        placeId:       place.id,
        wccc:          false,
        enriched:      true,
        source:        'phase2_discovery',
        phone:         place.nationalPhoneNumber ?? '',
        email:         '',
        website:       place.websiteUri ?? '',
        photo:         '',
        description:   '',
      })

      existingPlaceIds.add(place.id)
    }

    return { results }
  } catch (err) {
    return { results: [], error: String(err) }
  }
}

export default function BusinessDiscoveryAdmin() {
  const [running, setRunning]   = useState(false)
  const [done, setDone]         = useState(false)
  const [log, setLog]           = useState<SearchLog[]>([])
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [stats, setStats]       = useState({ added: 0, skipped: 0, empty: 0, error: 0 })
  const [selectedCities, setSelectedCities] = useState<string[]>(['Milwaukee WI'])
  const [selectedTerms, setSelectedTerms]   = useState<string[]>(SEARCH_TERMS)

  function toggleCity(city: string) {
    setSelectedCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city])
  }

  function toggleTerm(term: string) {
    setSelectedTerms(prev => prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term])
  }

  async function runDiscovery() {
    if (!confirm(`Search ${selectedTerms.length} categories × ${selectedCities.length} cities = ~${selectedTerms.length * selectedCities.length} API calls. Continue?`)) return

    setRunning(true)
    setDone(false)
    setLog([])
    setStats({ added: 0, skipped: 0, empty: 0, error: 0 })

    const existingSnap    = await getDocs(collection(db, 'members'))
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

        const { results, error } = await searchPlaces(term, city, existingPlaceIds)

        if (error) {
          setLog(prev => [{ query: `${term} ${city}`, status: 'error', count: 0, message: error }, ...prev])
          setStats(prev => ({ ...prev, error: prev.error + 1 }))
        } else if (results.length === 0) {
          setLog(prev => [{ query: `${term} ${city}`, status: 'empty', count: 0 }, ...prev])
          setStats(prev => ({ ...prev, empty: prev.empty + 1 }))
        } else {
          for (const biz of results) {
            await setDoc(doc(db, 'members', biz.id), biz)
          }
          setLog(prev => [{ query: `${term} ${city}`, status: 'found', count: results.length }, ...prev])
          setStats(prev => ({ ...prev, added: prev.added + results.length }))
        }

        await new Promise(r => setTimeout(r, 150))
      }
    }

    setDone(true)
    setRunning(false)
  }

  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 space-y-2"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>🔍 Asian Business Discovery — Phase 2</h3>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Searches Google Places for Asian businesses across Wisconsin. Skips businesses already in the database by Place ID.
        </p>
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
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
            Cities ({selectedCities.length}/{WI_CITIES.length})
          </p>
          <div className="flex gap-2">
            <button onClick={() => setSelectedCities(WI_CITIES)}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>All</button>
            <button onClick={() => setSelectedCities([])}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>None</button>
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
              {city.replace(' WI', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Search terms selector */}
      <div className="rounded-xl p-4 space-y-3"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
            Categories ({selectedTerms.length}/{SEARCH_TERMS.length})
          </p>
          <div className="flex gap-2">
            <button onClick={() => setSelectedTerms(SEARCH_TERMS)}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>All</button>
            <button onClick={() => setSelectedTerms([])}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>None</button>
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

      {(running || done) && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Added',  count: stats.added,   color: '#22c55e' },
            { label: 'Empty',  count: stats.empty,   color: '#fbbf24' },
            { label: 'Skip',   count: stats.skipped, color: '#60a5fa' },
            { label: 'Errors', count: stats.error,   color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.count}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

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
                  {entry.status === 'found' ? '✅' : entry.status === 'empty' ? '◯' : '❌'}
                </span>
                <p className="text-xs flex-1 truncate" style={{ color: 'var(--color-text)' }}>
                  {entry.query}
                  {entry.message ? ` — ${entry.message}` : ''}
                </p>
                {entry.count > 0 && (
                  <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#22c55e' }}>+{entry.count}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
