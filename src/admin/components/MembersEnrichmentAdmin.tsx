import { useState, useEffect } from 'react'
import { collection, doc, setDoc, getDocs, deleteDoc, onSnapshot, query } from 'firebase/firestore'
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

// Member row — edit name/city/delete only, no Google Places calls
function MemberRow({ member }: { member: Member }) {
  const [msg, setMsg]           = useState('')
  const [editing, setEditing]   = useState(false)
  const [name, setName]         = useState(member.name)
  const [city, setCity]         = useState(member.city)
  const [category, setCategory] = useState(member.category ?? '')
  const [saving, setSaving]     = useState(false)

  const isPending = (member as any).status === 'pending'

  async function handleSave() {
    setSaving(true)
    const { updateDoc, doc: firestoreDoc } = await import('firebase/firestore')
    await updateDoc(firestoreDoc(db, 'members', member.id), { name, city, category })
    setMsg('✅ Saved')
    setEditing(false)
    setSaving(false)
  }

  async function handleApprove() {
    const { updateDoc, doc: firestoreDoc } = await import('firebase/firestore')
    await updateDoc(firestoreDoc(db, 'members', member.id), { status: 'approved', wccc: false })
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
      <div className="flex items-center gap-3">
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

      {editing && (
        <div className="space-y-2 pt-1">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Business name" style={inp} />
          <input value={city} onChange={e => setCity(e.target.value)} placeholder="City" style={inp} />
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" style={inp} />
          <button onClick={handleSave} disabled={saving}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
            style={{ background: 'var(--color-red)', color: '#fff' }}>
            {saving ? '...' : '💾 Save'}
          </button>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
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
  const [stats, setStats]               = useState({ saved: 0, skipped: 0, error: 0 })
  const [rerun, setRerun]               = useState(false)
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
    setStats(prev => ({ ...prev, [entry.status === 'found' ? 'saved' : entry.status === 'skipped' ? 'skipped' : 'error']: (prev[entry.status === 'found' ? 'saved' : entry.status === 'skipped' ? 'skipped' : 'error'] ?? 0) + 1 }))
  }

  async function runEnrichment() {
    const msg = rerun
      ? 'This will DELETE all existing WCCC members and reload from Google Sheet. Continue?'
      : 'Load all WCCC members from Google Sheet and save to Firestore. Continue?'
    if (!confirm(msg)) return
    setRunning(true)
    setDone(false)
    setLog([])
    setStats({ saved: 0, skipped: 0, error: 0 })

    try {
      if (rerun) {
        const existingSnap = await getDocs(collection(db, 'members'))
        for (const d of existingSnap.docs) {
          if (d.data().wccc === true) await deleteDoc(d.ref)
        }
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

        const docId = member.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 60)
        await setDoc(doc(db, 'members', docId), {
          id: docId, name: member.name, city: member.city, category: member.category,
          email: member.email ?? '', phone: member.phone ?? '',
          website: member.website ?? '', photo: member.photo ?? '',
          description: member.description ?? '',
          wccc: true, enriched: false,
          placeId: '', rating: null,
          googlePhoto: '', googleWebsite: '', address: member.city + ', WI',
        })
        addLog({ name: member.name, status: 'found', message: 'Saved from sheet' })
        await new Promise(r => setTimeout(r, 50))
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
      <div className="flex gap-2">
        {(['bulk', 'records'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: view === v ? 'var(--color-red)' : 'var(--color-surface)',
              color: view === v ? '#fff' : 'var(--color-muted)',
              border: `1px solid ${view === v ? 'var(--color-red)' : 'var(--color-border)'}`,
            }}>
            {v === 'bulk' ? '📥 Bulk Import' : `📋 Records (${members.length})`}
          </button>
        ))}
      </div>

      {view === 'bulk' && (
        <div className="space-y-4">
          <div className="rounded-xl p-4 space-y-3"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>📥 WCCC Member Import</h3>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Reads all members from Google Sheet and saves to Firestore with <code>wccc: true</code> flag.
              Google Places enrichment is disabled to save API costs.
            </p>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={rerun} onChange={e => setRerun(e.target.checked)} />
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                ⚠️ Re-run (deletes existing WCCC members and reimports from sheet)
              </span>
            </label>

            <button onClick={runEnrichment} disabled={running}
              className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
              style={{ background: 'var(--color-red)', color: '#fff' }}>
              {running ? `⏳ Processing ${progress.current} / ${progress.total}...` : '▶ Import from Sheet'}
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
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Saved',   count: stats.saved,   color: '#22c55e' },
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

          {log.length > 0 && (
            <div className="rounded-xl overflow-hidden"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>Log</p>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
                {log.map((entry, i) => (
                  <div key={i} className="px-4 py-2 border-b flex items-start gap-3"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-xs flex-shrink-0">
                      {entry.status === 'found' ? '✅' : entry.status === 'skipped' ? '⏭' : '❌'}
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
