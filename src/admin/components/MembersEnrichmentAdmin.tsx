import { useState } from 'react'
import { collection, doc, setDoc, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'

// Separate from Member interface to avoid [key: string] index signature conflict
interface SheetMember {
  name: string
  city: string
  category: string
  email?: string
  phone?: string
  website?: string
  photo?: string
  description?: string
  [key: string]: string | undefined
}

// Firestore document — no index signature, explicit types only
interface FirestoreMember {
  id: string
  name: string
  city: string
  category: string
  email: string
  phone: string
  website: string
  photo: string
  description: string
  wccc: boolean
  enriched: boolean
  placeId: string
  rating: number | null
  googlePhoto: string
  address: string
}

interface LogEntry {
  name: string
  status: 'found' | 'not_found' | 'error' | 'skipped'
  message: string
}

const COLUMN_MAP: Record<string, string> = {
  name: 'name', 'business name': 'name', organization: 'name', org: 'name', company: 'name',
  city: 'city', location: 'city', town: 'city',
  category: 'category', type: 'category', industry: 'category', sector: 'category',
  'business type': 'category', category_key: 'category',
  email: 'email', 'e-mail': 'email', 'contact email': 'email',
  phone: 'phone', telephone: 'phone', cell: 'phone', mobile: 'phone',
  website: 'website', url: 'website', web: 'website', site: 'website',
  photo: 'photo', image: 'photo', logo: 'photo', 'photo url': 'photo', 'image url': 'photo',
  description: 'description', bio: 'description', about: 'description',
  details: 'description', desc_en: 'description',
}

function normalizeKey(raw: string): string {
  const lower = raw.trim().toLowerCase()
  return COLUMN_MAP[lower] ?? lower
}

async function fetchSheetMembers(): Promise<SheetMember[]> {
  const sheetId   = import.meta.env.VITE_SHEET_ID
  const apiKey    = import.meta.env.VITE_SHEETS_API_KEY
  const sheetName = import.meta.env.VITE_SHEET_NAME ?? 'Sheet1'

  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!A:Z`
  )
  url.searchParams.set('key', apiKey)
  url.searchParams.set('valueRenderOption', 'UNFORMATTED_VALUE')

  const res  = await fetch(url.toString())
  const data = await res.json() as { values?: (string | number | boolean)[][] }
  const rows = data.values ?? []
  if (rows.length < 2) return []

  const headers           = rows[0].map(h => String(h))
  const normalizedHeaders = headers.map(normalizeKey)

  return rows.slice(1).map((row, i) => {
    const member: SheetMember = { name: '', city: '', category: '' }
    normalizedHeaders.forEach((key, colIdx) => {
      const val = row[colIdx] != null ? String(row[colIdx]).trim() : ''
      member[key] = val
    })
    if (!member.name)     member.name     = `Member ${i + 1}`
    if (!member.city)     member.city     = 'Wisconsin'
    if (!member.category) member.category = 'General'
    return member
  }).filter(m => m.name.trim() !== '')
}

async function searchGooglePlaces(name: string, city: string): Promise<{
  placeId: string
  rating: number | null
  photoUrl: string
  address: string
} | null> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY
  if (!apiKey) return null

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.photos,places.formattedAddress',
      },
      body: JSON.stringify({
        textQuery: `${name} ${city} Wisconsin`,
        maxResultCount: 1,
      }),
    })

    const data = await res.json() as {
      places?: Array<{
        id?: string
        rating?: number
        formattedAddress?: string
        photos?: Array<{ name: string }>
      }>
    }

    const place = data.places?.[0]
    if (!place) return null

    const photoName = place.photos?.[0]?.name ?? null
    const photoUrl  = photoName
      ? `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${apiKey}`
      : ''

    return {
      placeId: place.id ?? '',
      rating:  place.rating ?? null,
      photoUrl,
      address: place.formattedAddress ?? '',
    }
  } catch {
    return null
  }
}

export default function MembersEnrichmentAdmin() {
  const [running, setRunning]   = useState(false)
  const [done, setDone]         = useState(false)
  const [log, setLog]           = useState<LogEntry[]>([])
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [stats, setStats]       = useState({ found: 0, not_found: 0, error: 0, skipped: 0 })

  function addLog(entry: LogEntry) {
    setLog(prev => [entry, ...prev])
    setStats(prev => ({ ...prev, [entry.status]: prev[entry.status] + 1 }))
  }

  async function runEnrichment() {
    if (!confirm('This will load all WCCC members from Google Sheet, enrich with Google Places data, and save to Firestore. Continue?')) return

    setRunning(true)
    setDone(false)
    setLog([])
    setStats({ found: 0, not_found: 0, error: 0, skipped: 0 })

    try {
      // Check existing Firestore members to avoid re-processing
      const existingSnap  = await getDocs(collection(db, 'members'))
      const existingNames = new Set(
        existingSnap.docs.map(d => (d.data().name as string)?.toLowerCase().trim())
      )

      // Fetch sheet members
      const sheetMembers = await fetchSheetMembers()
      setProgress({ current: 0, total: sheetMembers.length })

      for (let i = 0; i < sheetMembers.length; i++) {
        const member = sheetMembers[i]
        setProgress({ current: i + 1, total: sheetMembers.length })

        // Skip if already in Firestore
        if (existingNames.has(member.name.toLowerCase().trim())) {
          addLog({ name: member.name, status: 'skipped', message: 'Already in Firestore' })
          continue
        }

        // Search Google Places
        const places = await searchGooglePlaces(member.name, member.city)

        const docId = member.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 60)

        const firestoreDoc: FirestoreMember = {
          id:          docId,
          name:        member.name,
          city:        member.city,
          category:    member.category,
          email:       member.email       ?? '',
          phone:       member.phone       ?? '',
          website:     member.website     ?? '',
          photo:       member.photo       ?? '',
          description: member.description ?? '',
          wccc:        true,
          enriched:    !!places,
          placeId:     places?.placeId    ?? '',
          rating:      places?.rating     ?? null,
          googlePhoto: places?.photoUrl   ?? '',
          address:     places?.address    ?? member.city + ', WI',
        }

        await setDoc(doc(db, 'members', docId), firestoreDoc)

        if (places) {
          addLog({ name: member.name, status: 'found', message: `⭐ ${places.rating ?? 'N/A'} · ${places.address}` })
        } else {
          addLog({ name: member.name, status: 'not_found', message: 'Not found on Google Places — saved from sheet' })
        }

        // Rate limit — stay under 10 req/sec for Places API
        await new Promise(r => setTimeout(r, 120))
      }

      setDone(true)
    } catch (err) {
      addLog({ name: 'SYSTEM', status: 'error', message: String(err) })
    } finally {
      setRunning(false)
    }
  }

  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-4 space-y-3"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
          📥 WCCC Member Enrichment
        </h3>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Reads all members from Google Sheet, enriches with Google Places data (photo, rating, address),
          and saves to Firestore with <code>wccc: true</code> flag. Run once.
        </p>
        <button onClick={runEnrichment} disabled={running}
          className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
          style={{ background: 'var(--color-red)', color: '#fff' }}>
          {running ? `⏳ Processing ${progress.current} / ${progress.total}...` : '▶ Run Enrichment'}
        </button>
        {done && (
          <p className="text-xs text-center font-semibold" style={{ color: '#22c55e' }}>
            ✅ Complete! {progress.total} members processed.
          </p>
        )}
      </div>

      {/* Progress bar */}
      {running && (
        <div className="rounded-xl p-4 space-y-2"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex justify-between text-xs" style={{ color: 'var(--color-muted)' }}>
            <span>Progress</span><span>{pct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg)' }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: 'var(--color-red)' }} />
          </div>
        </div>
      )}

      {/* Stats */}
      {log.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Found',     count: stats.found,     color: '#22c55e' },
            { label: 'Not Found', count: stats.not_found, color: '#fbbf24' },
            { label: 'Skipped',   count: stats.skipped,   color: '#60a5fa' },
            { label: 'Errors',    count: stats.error,     color: '#ef4444' },
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
            <p className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>Processing Log</p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 400 }}>
            {log.map((entry, i) => (
              <div key={i} className="px-4 py-2 border-b flex items-start gap-3"
                style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-xs flex-shrink-0" style={{
                  color: entry.status === 'found' ? '#22c55e'
                    : entry.status === 'not_found' ? '#fbbf24'
                    : entry.status === 'skipped' ? '#60a5fa' : '#ef4444'
                }}>
                  {entry.status === 'found' ? '✅' : entry.status === 'not_found' ? '⚠️' : entry.status === 'skipped' ? '⏭' : '❌'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{entry.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{entry.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
