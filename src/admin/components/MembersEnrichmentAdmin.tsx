import { useState, useEffect } from 'react'
import { collection, doc, setDoc, getDocs, deleteDoc, onSnapshot, updateDoc, query } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Member } from '../../hooks/useMembers'

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

interface LogEntry {
  name: string
  status: 'found' | 'not_found' | 'error' | 'skipped' | 'rejected'
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

function nameSimilarity(original: string, matched: string): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  const stopWords = new Set(['of', 'the', 'and', 'inc', 'llc', 'co', 'ltd', 'corp', 'for'])
  const origWords    = normalize(original).split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w))
  const matchedWords = normalize(matched).split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w))
  if (origWords.length === 0 || matchedWords.length === 0) return 0
  const forward  = origWords.filter(w => matchedWords.includes(w)).length / origWords.length
  const backward = matchedWords.filter(w => origWords.includes(w)).length / matchedWords.length
  return (forward + backward) / 2
}

async function fetchSheetMembers(): Promise<SheetMember[]> {
  const sheetId   = import.meta.env.VITE_SHEET_ID
  const apiKey    = import.meta.env.VITE_SHEETS_API_KEY
  const sheetName = import.meta.env.VITE_SHEET_NAME ?? 'Sheet1'
  const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!A:Z`)
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
      member[key] = row[colIdx] != null ? String(row[colIdx]).trim() : ''
    })
    if (!member.name)     member.name     = `Member ${i + 1}`
    if (!member.city)     member.city     = 'Wisconsin'
    if (!member.category) member.category = 'General'
    return member
  }).filter(m => m.name.trim() !== '')
}

async function searchGooglePlaces(name: string, city: string): Promise<{
  placeId: string; matchedName: string; rating: number | null
  photoUrl: string; address: string; website: string
} | null> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY
  if (!apiKey) return null
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.photos,places.formattedAddress,places.websiteUri',
      },
      body: JSON.stringify({ textQuery: `${name} ${city} Wisconsin`, maxResultCount: 1 }),
    })
    const data = await res.json() as {
      places?: Array<{
        id?: string; displayName?: { text: string }; rating?: number
        formattedAddress?: string; websiteUri?: string; photos?: Array<{ name: string }>
      }>
    }
    const place = data.places?.[0]
    if (!place) return null
    const photoName = place.photos?.[0]?.name ?? null
    return {
      placeId:     place.id ?? '',
      matchedName: place.displayName?.text ?? '',
      rating:      place.rating ?? null,
      photoUrl:    photoName ? `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${apiKey}` : '',
      address:     place.formattedAddress ?? '',
      website:     place.websiteUri ?? '',
    }
  } catch { return null }
}

function MemberRow({ member }: { member: Member }) {
  const [refreshing, setRefreshing] = useState(false)
  const [msg, setMsg]               = useState('')
  const [editing, setEditing]       = useState(false)
  const [searchName, setSearchName] = useState(member.name)
  const [searchCity, setSearchCity] = useState(member.city)
  const [photoUrl, setPhotoUrl]     = useState(member.googlePhoto || '')

  const isPending      = (member as any).status === 'pending'
  const originalPhoto  = member.googlePhoto || ''
  const photoChanged   = photoUrl !== originalPhoto

  async function handleRefresh() {
    setRefreshing(true)
    setMsg('')
    const places = await searchGooglePlaces(searchName, searchCity)
    if (places) {
      const similarity = nameSimilarity(searchName, places.matchedName)
      if (similarity >= 0.4) {
        await updateDoc(doc(db, 'members', member.id), {
          name:          searchName,
          city:          searchCity,
          placeId:       places.placeId,
          rating:        places.rating,
          googlePhoto:   places.photoUrl,
          googleWebsite: places.website,
          address:       places.address,
          enriched:      true,
        })
        setPhotoUrl(places.photoUrl)
        setMsg(`✅ Updated · ⭐ ${places.rating ?? 'N/A'} · "${places.matchedName}"`)
        setEditing(false)
      } else {
        setMsg(`🚫 Rejected · "${places.matchedName}" (${Math.round(similarity * 100)}% match) — try a different name`)
      }
    } else {
      setMsg('⚠️ Not found on Google Places — try a different name')
    }
    setRefreshing(false)
  }

  async function handleSavePhoto() {
    await updateDoc(doc(db, 'members', member.id), { googlePhoto: photoUrl })
    setMsg('✅ Photo updated')
  }

  async function handleApprove() {
    await updateDoc(doc(db, 'members', member.id), { status: 'approved', wccc: false })
  }

  async function handleDelete() {
    if (!confirm(`Delete ${member.name}?`)) return
    await deleteDoc(doc(db, 'members', member.id))
  }

  const inp = {
    width: '100%', padding: '6px 10px', borderRadius: 8, fontSize: 12, outline: 'none',
    border: '1px solid var(--color-border)', background: 'var(--color-bg)',
    color: 'var(--color-text)', boxSizing: 'border-box' as const,
  }

  return (
    <div className="rounded-xl p-3 space-y-2" style={{
      background: 'var(--color-surface)',
      border: `1px solid ${isPending ? 'rgba(251,191,36,0.3)' : member.wccc ? 'rgba(185,28,28,0.2)' : 'var(--color-border)'}`,
    }}>
      {/* Header row */}
      <div className="flex items-center gap-3">
        {(member.googlePhoto || member.photo) && (
          <img src={member.googlePhoto || member.photo} alt={member.name}
            className="w-10 h-10 rounded-lg flex-shrink-0"
            style={{ objectFit: 'contain', background: 'var(--color-bg)' }} />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{member.name}</p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            {member.city}, WI · {member.category}
            {member.rating ? ` · ⭐ ${member.rating.toFixed(1)}` : ''}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0 items-center">
          {member.wccc && (
            <span className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(185,28,28,0.15)', color: '#ef4444' }}>WCCC</span>
          )}
          {isPending && (
            <span className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>Pending</span>
          )}
          <button onClick={() => setEditing(e => !e)}
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: editing ? 'var(--color-red)' : 'var(--color-bg)', color: editing ? '#fff' : 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
            ✏️
          </button>
        </div>
      </div>

      {/* Editable fields */}
      {editing && (
        <div className="space-y-2 pt-1">
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--color-muted)' }}>Search name (for Google Places)</p>
            <input value={searchName} onChange={e => setSearchName(e.target.value)}
              placeholder="Business name to search" style={inp} />
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--color-muted)' }}>City</p>
            <input value={searchCity} onChange={e => setSearchCity(e.target.value)}
              placeholder="City" style={inp} />
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--color-muted)' }}>Photo URL (paste to override)</p>
            <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)}
              placeholder="https://..." style={inp} />
          </div>
          {photoUrl && (
            <img src={photoUrl} alt="preview" className="rounded-lg"
              style={{ width: 80, height: 80, objectFit: 'contain', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} />
          )}
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Edit name/city to improve Google matching, or paste a photo URL directly.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={handleRefresh} disabled={refreshing}
          className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
          style={{ background: 'rgba(66,133,244,0.15)', color: '#4285f4', border: '1px solid rgba(66,133,244,0.3)' }}>
          {refreshing ? '⏳' : '🔄'} Refresh from Google
        </button>
        {photoChanged && (
          <button onClick={handleSavePhoto}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(124,58,237,0.15)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.3)' }}>
            💾 Save Photo
          </button>
        )}
        {isPending && (
          <button onClick={handleApprove}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
            ✅ Approve
          </button>
        )}
        <button onClick={handleDelete}
          className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          🗑 Delete
        </button>
      </div>

      {msg && <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{msg}</p>}
    </div>
  )
}

export default function MembersEnrichmentAdmin() {
  const [running, setRunning]           = useState(false)
  const [done, setDone]                 = useState(false)
  const [log, setLog]                   = useState<LogEntry[]>([])
  const [progress, setProgress]         = useState({ current: 0, total: 0 })
  const [stats, setStats]               = useState({ found: 0, not_found: 0, error: 0, skipped: 0, rejected: 0 })
  const [rerun, setRerun]               = useState(false)
  const [threshold, setThreshold]       = useState(0.5)
  const [members, setMembers]           = useState<Member[]>([])
  const [view, setView]                 = useState<'bulk' | 'records'>('bulk')
  const [memberSearch, setMemberSearch] = useState('')

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'members')), snap => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Member))
        .sort((a, b) => a.name.localeCompare(b.name)))
    })
    return unsub
  }, [])

  function addLog(entry: LogEntry) {
    setLog(prev => [entry, ...prev])
    setStats(prev => ({ ...prev, [entry.status]: (prev[entry.status] ?? 0) + 1 }))
  }

  async function runEnrichment() {
    const msg = rerun
      ? 'This will DELETE all existing members and re-enrich from scratch. Continue?'
      : 'Load all WCCC members from Google Sheet and enrich with Google Places. Continue?'
    if (!confirm(msg)) return
    setRunning(true)
    setDone(false)
    setLog([])
    setStats({ found: 0, not_found: 0, error: 0, skipped: 0, rejected: 0 })

    try {
      if (rerun) {
        const existingSnap = await getDocs(collection(db, 'members'))
        for (const d of existingSnap.docs) await deleteDoc(d.ref)
      }
      const existingSnap  = await getDocs(collection(db, 'members'))
      const existingNames = new Set(existingSnap.docs.map(d => (d.data().name as string)?.toLowerCase().trim()))
      const sheetMembers  = await fetchSheetMembers()
      setProgress({ current: 0, total: sheetMembers.length })

      for (let i = 0; i < sheetMembers.length; i++) {
        const member = sheetMembers[i]
        setProgress({ current: i + 1, total: sheetMembers.length })

        if (!rerun && existingNames.has(member.name.toLowerCase().trim())) {
          addLog({ name: member.name, status: 'skipped', message: 'Already in Firestore' })
          continue
        }

        const places = await searchGooglePlaces(member.name, member.city)
        let acceptedPlaces = places
        if (places) {
          const similarity = nameSimilarity(member.name, places.matchedName)
          if (similarity < threshold) {
            addLog({ name: member.name, status: 'rejected',
              message: `Google matched "${places.matchedName}" (${Math.round(similarity * 100)}% — below ${Math.round(threshold * 100)}% threshold)` })
            acceptedPlaces = null
          }
        }

        const docId = member.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 60)
        await setDoc(doc(db, 'members', docId), {
          id: docId, name: member.name, city: member.city, category: member.category,
          email: member.email ?? '', phone: member.phone ?? '',
          website: member.website ?? '', photo: member.photo ?? '',
          description: member.description ?? '',
          wccc: true, enriched: !!acceptedPlaces,
          placeId:       acceptedPlaces?.placeId  ?? '',
          rating:        acceptedPlaces?.rating   ?? null,
          googlePhoto:   acceptedPlaces?.photoUrl ?? '',
          googleWebsite: acceptedPlaces?.website  ?? '',
          address:       acceptedPlaces?.address  ?? member.city + ', WI',
        })

        if (acceptedPlaces) {
          addLog({ name: member.name, status: 'found',
            message: `"${places!.matchedName}" · ⭐ ${acceptedPlaces.rating ?? 'N/A'} · ${acceptedPlaces.website ? '🌐' : ''}` })
        } else if (!places) {
          addLog({ name: member.name, status: 'not_found', message: 'Not found on Google Places' })
        }

        await new Promise(r => setTimeout(r, 120))
      }
      setDone(true)
    } catch (err) {
      addLog({ name: 'SYSTEM', status: 'error', message: String(err) })
    } finally {
      setRunning(false)
    }
  }

  const pct     = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0
  const pending = members.filter(m => (m as any).status === 'pending')
  const rest    = members.filter(m => (m as any).status !== 'pending')
  const filteredRest = memberSearch
    ? rest.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()))
    : rest

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex gap-2">
        {(['bulk', 'records'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: view === v ? 'var(--color-red)' : 'var(--color-surface)',
              color: view === v ? '#fff' : 'var(--color-muted)',
              border: `1px solid ${view === v ? 'var(--color-red)' : 'var(--color-border)'}`,
            }}>
            {v === 'bulk' ? '📥 Bulk Enrichment' : `📋 Records (${members.length})`}
          </button>
        ))}
      </div>

      {/* BULK VIEW */}
      {view === 'bulk' && (
        <div className="space-y-4">
          <div className="rounded-xl p-4 space-y-3"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>📥 WCCC Member Enrichment</h3>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Reads members from Google Sheet, enriches with Google Places (photo, rating, address, website).
              Uses bidirectional name matching to avoid false matches.
            </p>

            <div className="space-y-1">
              <div className="flex justify-between text-xs" style={{ color: 'var(--color-muted)' }}>
                <span>Name match threshold</span>
                <span style={{ color: 'var(--color-gold)' }}>{Math.round(threshold * 100)}%</span>
              </div>
              <input type="range" min={0.2} max={1} step={0.1} value={threshold}
                onChange={e => setThreshold(parseFloat(e.target.value))} className="w-full" />
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Higher = stricter. 50% recommended.</p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={rerun} onChange={e => setRerun(e.target.checked)} />
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                ⚠️ Re-run from scratch (deletes existing members first)
              </span>
            </label>

            <button onClick={runEnrichment} disabled={running}
              className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
              style={{ background: 'var(--color-red)', color: '#fff' }}>
              {running ? `⏳ Processing ${progress.current} / ${progress.total}...` : '▶ Run Enrichment'}
            </button>
            {done && <p className="text-xs text-center font-semibold" style={{ color: '#22c55e' }}>✅ Complete! {progress.total} members processed.</p>}
          </div>

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

          {log.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'Found',    count: stats.found,     color: '#22c55e' },
                { label: 'Rejected', count: stats.rejected,  color: '#f97316' },
                { label: 'No Match', count: stats.not_found, color: '#fbbf24' },
                { label: 'Skipped',  count: stats.skipped,   color: '#60a5fa' },
                { label: 'Errors',   count: stats.error,     color: '#ef4444' },
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
                <p className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>Processing Log</p>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 400 }}>
                {log.map((entry, i) => (
                  <div key={i} className="px-4 py-2 border-b flex items-start gap-3"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-xs flex-shrink-0">
                      {entry.status === 'found' ? '✅' : entry.status === 'not_found' ? '⚠️' :
                       entry.status === 'skipped' ? '⏭' : entry.status === 'rejected' ? '🚫' : '❌'}
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
      )}

      {/* RECORDS VIEW */}
      {view === 'records' && (
        <div className="space-y-4">
          {pending.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-3" style={{ color: '#fbbf24' }}>
                ⏳ Pending Review ({pending.length})
              </h3>
              <div className="space-y-2">{pending.map(m => <MemberRow key={m.id} member={m} />)}</div>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--color-muted)' }}>
              All Members ({rest.length})
            </h3>
            <input type="text" placeholder="Search members..." value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-3"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: 16 }} />
            <div className="space-y-2">
              {filteredRest.map(m => <MemberRow key={m.id} member={m} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
