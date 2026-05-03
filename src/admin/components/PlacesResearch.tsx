import { useState } from ‘react’

const ASIAN_TYPES = new Set([
‘chinese_restaurant’,‘japanese_restaurant’,‘korean_restaurant’,
‘vietnamese_restaurant’,‘thai_restaurant’,‘indian_restaurant’,
‘ramen_restaurant’,‘sushi_restaurant’,‘dim_sum_restaurant’,
‘asian_restaurant’,‘indonesian_restaurant’,‘taiwanese_restaurant’,
‘filipino_restaurant’,‘malaysian_restaurant’,‘burmese_restaurant’,
‘asian_grocery_store’,‘chinese_supermarket’,‘asian_supermarket’,
‘acupuncture_clinic’,‘chinese_medicine_store’,‘asian_fusion_restaurant’,
‘hot_pot_restaurant’,‘bubble_tea_store’,‘boba_tea_restaurant’,
‘dumpling_restaurant’,‘noodle_restaurant’,‘pho_restaurant’,
])

function hasChinese(str: string | undefined | null): boolean {
if (!str) return false
return /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(str)
}

function findChineseInObject(obj: unknown, path = ‘’): { path: string; value: string }[] {
const hits: { path: string; value: string }[] = []
if (!obj || typeof obj !== ‘object’) return hits
for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
const fullPath = path ? `${path}.${k}` : k
if (typeof v === ‘string’ && hasChinese(v)) {
hits.push({ path: fullPath, value: v })
} else if (typeof v === ‘object’ && v !== null) {
hits.push(…findChineseInObject(v, fullPath))
}
}
return hits
}

interface PlaceResult {
id?: string
displayName?: { text: string }
formattedAddress?: string
primaryType?: string
primaryTypeDisplayName?: { text: string; languageCode: string }
types?: string[]
businessStatus?: string
rating?: number
userRatingCount?: number
priceLevel?: string
websiteUri?: string
nationalPhoneNumber?: string
editorialSummary?: { text: string }
generativeSummary?: { overview?: { text: string } }
photos?: unknown[]
reviews?: Array<{
rating?: number
text?: { text: string }
originalText?: { text: string }
authorAttribution?: { displayName: string }
}>
delivery?: boolean
dineIn?: boolean
takeout?: boolean
reservable?: boolean
}

export default function PlacesResearch() {
const [query, setQuery] = useState(’’)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(’’)
const [results, setResults] = useState<PlaceResult[]>([])
const [expandedRaw, setExpandedRaw] = useState<number | null>(null)

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY

const fieldMask = [
‘places.id’,‘places.displayName’,‘places.formattedAddress’,
‘places.primaryType’,‘places.primaryTypeDisplayName’,
‘places.types’,‘places.businessStatus’,
‘places.rating’,‘places.userRatingCount’,‘places.priceLevel’,
‘places.websiteUri’,‘places.nationalPhoneNumber’,
‘places.editorialSummary’,‘places.generativeSummary’,
‘places.photos’,‘places.reviews’,
‘places.delivery’,‘places.dineIn’,‘places.takeout’,‘places.reservable’,
‘places.googleMapsUri’,
].join(’,’)

async function handleSearch() {
if (!query.trim()) return
setLoading(true)
setError(’’)
setResults([])
setExpandedRaw(null)

```
try {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 5 }),
  })
  const data = await res.json()
  if (data.error) { setError(data.error.message); return }
  setResults(data.places || [])
  if ((data.places || []).length === 0) setError('No results found — try a different search term')
} catch (e) {
  setError('Network error — check your connection')
} finally {
  setLoading(false)
}
```

}

return (
<div style={{ maxWidth: 640 }}>
<div style={{ marginBottom: 20 }}>
<p style={{ fontSize: 13, color: ‘var(–color-muted)’, marginBottom: 16, lineHeight: 1.5 }}>
Research any business on Google Places — see all available fields including Asian business signals, Chinese characters in reviews, and place types.
</p>

```
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        placeholder="e.g. A&V Waterjet Tech Inc Wisconsin"
        style={{
          flex: 1,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: '10px 12px',
          color: 'var(--color-text)',
          fontSize: 14,
          outline: 'none',
        }}
      />
      <button
        onClick={handleSearch}
        disabled={loading || !query.trim()}
        style={{
          background: 'var(--color-red)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 18px',
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading || !query.trim() ? 0.5 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        {loading ? '⏳ Searching…' : '🔍 Search'}
      </button>
    </div>

    {error && (
      <div style={{
        marginTop: 10,
        padding: '8px 12px',
        background: 'rgba(185,28,28,0.1)',
        border: '1px solid rgba(185,28,28,0.3)',
        borderRadius: 6,
        fontSize: 13,
        color: '#f87171',
      }}>
        {error}
      </div>
    )}
  </div>

  {results.map((place, idx) => {
    const chineseHits = findChineseInObject(place)
    const asianTypes = (place.types || []).filter(t => ASIAN_TYPES.has(t))
    const isPrimaryAsian = ASIAN_TYPES.has(place.primaryType || '')
    const hasAsianSignal = asianTypes.length > 0 || isPrimaryAsian || chineseHits.length > 0

    return (
      <div key={idx} style={{
        background: 'var(--color-surface)',
        border: `1px solid ${hasAsianSignal ? 'rgba(185,28,28,0.4)' : 'var(--color-border)'}`,
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>
              {place.displayName?.text || 'Unknown'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
              {place.formattedAddress}
            </div>
          </div>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 4,
            background: hasAsianSignal ? 'rgba(185,28,28,0.2)' : 'rgba(100,100,100,0.2)',
            color: hasAsianSignal ? '#fca5a5' : 'var(--color-muted)',
            whiteSpace: 'nowrap',
            marginLeft: 8,
          }}>
            {hasAsianSignal ? '🀄 ASIAN SIGNAL' : 'No signal'}
          </span>
        </div>

        {/* Chinese characters alert */}
        {chineseHits.length > 0 && (
          <div style={{
            background: 'rgba(240,171,252,0.1)',
            border: '1px solid rgba(240,171,252,0.3)',
            borderRadius: 6,
            padding: '8px 10px',
            marginBottom: 10,
            fontSize: 12,
            color: '#f0abfc',
          }}>
            🈶 Chinese characters found in {chineseHits.length} field(s):
            {chineseHits.map(h => (
              <div key={h.path} style={{ marginTop: 4, paddingLeft: 8, borderLeft: '2px solid rgba(240,171,252,0.4)' }}>
                <span style={{ opacity: 0.7, fontFamily: 'monospace', fontSize: 10 }}>{h.path}: </span>
                <span style={{ fontSize: 14 }}>{h.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Type signals */}
        <Row label="primaryType">
          <TypePill value={place.primaryType} isAsian={isPrimaryAsian} />
        </Row>

        {place.types && place.types.length > 0 && (
          <Row label="types[]">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {place.types.map(t => <TypePill key={t} value={t} isAsian={ASIAN_TYPES.has(t)} />)}
            </div>
          </Row>
        )}

        {place.primaryTypeDisplayName && (
          <Row label="typeDisplayName">
            <span style={{ color: hasChinese(place.primaryTypeDisplayName.text) ? '#f0abfc' : 'var(--color-text)', fontSize: 14 }}>
              {place.primaryTypeDisplayName.text}
              <span style={{ color: 'var(--color-muted)', fontSize: 11, marginLeft: 4 }}>
                ({place.primaryTypeDisplayName.languageCode})
              </span>
            </span>
          </Row>
        )}

        {/* Key info */}
        {place.rating !== undefined && (
          <Row label="rating">⭐ {place.rating} ({place.userRatingCount?.toLocaleString()} reviews)</Row>
        )}
        {place.businessStatus && <Row label="businessStatus">{place.businessStatus}</Row>}
        {place.editorialSummary?.text && (
          <Row label="editorialSummary">
            <span style={{ color: hasChinese(place.editorialSummary.text) ? '#f0abfc' : 'var(--color-text)' }}>
              {place.editorialSummary.text}
            </span>
          </Row>
        )}
        {place.websiteUri && (
          <Row label="website">
            <a href={place.websiteUri} target="_blank" rel="noreferrer"
              style={{ color: '#60a5fa', fontSize: 13 }}>
              {place.websiteUri}
            </a>
          </Row>
        )}
        {place.nationalPhoneNumber && <Row label="phone">{place.nationalPhoneNumber}</Row>}
        {place.photos && <Row label="photos">{place.photos.length} available</Row>}

        {/* Reviews */}
        {place.reviews && place.reviews.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Reviews ({place.reviews.length})
            </div>
            {place.reviews.slice(0, 3).map((r, i) => {
              const hasCN = hasChinese(r.text?.text) || hasChinese(r.originalText?.text)
              return (
                <div key={i} style={{
                  background: 'var(--color-bg)',
                  border: `1px solid ${hasCN ? 'rgba(240,171,252,0.4)' : 'var(--color-border)'}`,
                  borderRadius: 6,
                  padding: '8px 10px',
                  marginBottom: 6,
                }}>
                  <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 4 }}>
                    ⭐ {r.rating} · {r.authorAttribution?.displayName || 'Anonymous'}
                  </div>
                  <div style={{ fontSize: 13, color: hasChinese(r.text?.text) ? '#f0abfc' : 'var(--color-text)', lineHeight: 1.4 }}>
                    {(r.text?.text || '').slice(0, 200)}{(r.text?.text || '').length > 200 ? '…' : ''}
                  </div>
                  {r.originalText?.text && r.originalText.text !== r.text?.text && (
                    <div style={{ fontSize: 13, color: '#f0abfc', marginTop: 4, paddingTop: 4, borderTop: '1px solid rgba(240,171,252,0.2)' }}>
                      {r.originalText.text.slice(0, 200)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Raw toggle */}
        <button
          onClick={() => setExpandedRaw(expandedRaw === idx ? null : idx)}
          style={{
            marginTop: 10,
            fontSize: 11,
            color: 'var(--color-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
            fontFamily: 'monospace',
          }}
        >
          {expandedRaw === idx ? 'Hide' : 'Show'} raw JSON
        </button>

        {expandedRaw === idx && (
          <pre style={{
            marginTop: 8,
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            padding: 10,
            fontSize: 10,
            fontFamily: 'monospace',
            overflow: 'auto',
            maxHeight: 300,
            color: '#a3a3a3',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
            {JSON.stringify(place, null, 2)}
          </pre>
        )}
      </div>
    )
  })}
</div>
```

)
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
return (
<div style={{
display: ‘flex’,
gap: 10,
padding: ‘6px 0’,
borderBottom: ‘1px solid var(–color-border)’,
alignItems: ‘flex-start’,
}}>
<span style={{
fontFamily: ‘monospace’,
fontSize: 11,
color: ‘#D97706’,
minWidth: 130,
flexShrink: 0,
paddingTop: 1,
}}>
{label}
</span>
<div style={{ fontSize: 13, color: ‘var(–color-text)’, lineHeight: 1.4, wordBreak: ‘break-all’ }}>
{children}
</div>
</div>
)
}

function TypePill({ value, isAsian }: { value?: string; isAsian?: boolean }) {
if (!value) return <span style={{ color: ‘var(–color-muted)’, fontSize: 12 }}>null</span>
return (
<span style={{
display: ‘inline-block’,
padding: ‘2px 8px’,
borderRadius: 100,
fontSize: 11,
fontFamily: ‘monospace’,
background: isAsian ? ‘rgba(185,28,28,0.2)’ : ‘var(–color-bg)’,
border: `1px solid ${isAsian ? 'rgba(185,28,28,0.4)' : 'var(--color-border)'}`,
color: isAsian ? ‘#fca5a5’ : ‘var(–color-text)’,
}}>
{value}
</span>
)
}
