import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query, updateDoc, deleteDoc, doc, where, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { CommunityEvent } from '../../hooks/useEvents'

type EventWithExtras = CommunityEvent & {
  contactEmail?: string
  contactPhone?: string
  flag?: string
  partnerName?: string
  status?: string
  createdAt?: { toDate: () => Date; toMillis: () => number } | null
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    })
  } catch { return dateStr }
}

function timeAgo(ts: EventWithExtras['createdAt']): string {
  if (!ts) return 'just now'
  const diff = Date.now() - ts.toMillis()
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 1) return 'just now'
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function EventsAdmin() {
  const [events, setEvents]   = useState<EventWithExtras[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<'pending' | 'approved' | 'all'>('pending')

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as EventWithExtras)))
      setLoading(false)
    })
    return unsub
  }, [])

  const filtered = events.filter(e => {
    if (filter === 'pending')  return e.status === 'pending' || !e.status
    if (filter === 'approved') return e.status === 'approved'
    return true
  })

  const pendingCount  = events.filter(e => e.status === 'pending' || !e.status).length
  const approvedCount = events.filter(e => e.status === 'approved').length

  async function approve(id: string) {
    await updateDoc(doc(db, 'events', id), { status: 'approved' })
  }

  async function reject(id: string) {
    if (!confirm('Delete this event?')) return
    await deleteDoc(doc(db, 'events', id))
  }

  async function updateFlag(id: string, flag: string) {
    await updateDoc(doc(db, 'events', id), { flag: flag || null })
  }

  async function exportAttendees(eventId: string, eventTitle: string) {
    const snap = await getDocs(
      query(collection(db, 'attendees'), where('eventId', '==', eventId), orderBy('createdAt', 'asc'))
    )
    if (snap.empty) { alert('No attendees yet for this event.'); return }
    const rows = [['Name', 'Email', 'Phone', 'City', 'Privacy', 'Registered']]
    snap.docs.forEach(d => {
      const a = d.data()
      rows.push([a.name, a.email, a.phone ?? '', a.city ?? '', a.privacy, a.createdAt?.toDate().toLocaleString() ?? ''])
    })
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendees-${eventTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const SOURCE_COLORS: Record<string, string> = {
    wccc: 'var(--color-red)', wedc: '#1d4ed8',
    eventbrite: '#f37335', community: '#16a34a'
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending',  count: pendingCount,  color: '#fbbf24' },
          { label: 'Approved', count: approvedCount, color: '#22c55e' },
          { label: 'Total',    count: events.length, color: 'var(--color-muted)' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)'
          }}>
            <p className="text-2xl font-bold font-display" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all"
            style={{
              background: filter === f ? 'var(--color-red)' : 'var(--color-surface)',
              color: filter === f ? '#fff' : 'var(--color-muted)',
              border: `1px solid ${filter === f ? 'var(--color-red)' : 'var(--color-border)'}`,
            }}>
            {f === 'pending' ? `⏳ Pending (${pendingCount})` : f === 'approved' ? '✅ Approved' : '🗂 All'}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-center" style={{ color: 'var(--color-muted)' }}>Loading...</p>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">📅</p>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No {filter} events</p>
        </div>
      )}

      {filtered.map(e => (
        <div key={e.id} className="rounded-xl p-4 space-y-3" style={{
          background: 'var(--color-surface)',
          border: `1px solid ${(e.status === 'pending' || !e.status) ? 'rgba(251,191,36,0.3)' : 'var(--color-border)'}`
        }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="chip text-xs" style={{
                  background: `${SOURCE_COLORS[e.source] ?? '#888'}20`,
                  color: SOURCE_COLORS[e.source] ?? '#888',
                  border: `1px solid ${SOURCE_COLORS[e.source] ?? '#888'}40`
                }}>
                  {e.source === 'wccc' ? '🔴 WCCC' : e.source === 'wedc' ? '🏛️ WEDC' : e.source === 'eventbrite' ? '🎟️ Eventbrite' : '🌏 Community'}
                </span>
                <span className="chip text-xs" style={{
                  background: (e.status === 'pending' || !e.status) ? 'rgba(251,191,36,0.1)' : 'rgba(34,197,94,0.1)',
                  color: (e.status === 'pending' || !e.status) ? '#fbbf24' : '#22c55e',
                  border: `1px solid ${(e.status === 'pending' || !e.status) ? 'rgba(251,191,36,0.3)' : 'rgba(34,197,94,0.3)'}`,
                }}>
                  {e.status ?? 'pending'}
                </span>
                {e.flag && (
                  <span className="chip text-xs" style={{
                    background: e.flag === 'wccc' ? 'rgba(185,28,28,0.1)' : e.flag === 'featured' ? 'rgba(251,191,36,0.1)' : 'rgba(29,78,216,0.1)',
                    color: e.flag === 'wccc' ? 'var(--color-red)' : e.flag === 'featured' ? 'var(--color-gold)' : '#1d4ed8',
                    border: '1px solid transparent'
                  }}>
                    {e.flag === 'wccc' ? '🔴 WCCC Official' : e.flag === 'featured' ? '⭐ Featured' : '🤝 Partner'}
                  </span>
                )}
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  {timeAgo(e.createdAt ?? null)}
                </span>
              </div>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{e.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                📅 {formatDate(e.startDate)} · 📍 {e.location}, {e.city}
              </p>
            </div>
          </div>

          {e.description && (
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--color-muted)' }}>
              {e.description}
            </p>
          )}

          {/* Contact info */}
          {(e.contactEmail || e.organizer) && (
            <div className="rounded-lg p-3 space-y-1" style={{
              background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)'
            }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>👤 Submitted by</p>
              {e.organizer && <p className="text-xs" style={{ color: 'var(--color-text)' }}>{e.organizer}</p>}
              {e.contactEmail && (
                <a href={`mailto:${e.contactEmail}`} className="text-xs block" style={{ color: 'var(--color-gold)' }}>
                  {e.contactEmail}
                </a>
              )}
              {e.contactPhone && (
                <a href={`tel:${e.contactPhone}`} className="text-xs block" style={{ color: 'var(--color-gold)' }}>
                  {e.contactPhone}
                </a>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap items-center">
            {(e.status === 'pending' || !e.status) && (
              <button onClick={() => approve(e.id)}
                className="text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                ✅ Approve
              </button>
            )}

            {/* Flag selector */}
            <select
              value={e.flag ?? ''}
              onChange={ev => updateFlag(e.id, ev.target.value)}
              className="text-xs px-2 py-1.5 rounded-full outline-none cursor-pointer"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
              <option value="">🏷️ No flag</option>
              <option value="wccc">🔴 WCCC Official</option>
              <option value="partner">🤝 Partner Event</option>
              <option value="featured">⭐ Featured</option>
            </select>

            <button onClick={() => exportAttendees(e.id, e.title)}
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(29,78,216,0.1)', color: '#1d4ed8', border: '1px solid rgba(29,78,216,0.2)' }}>
              📥 Attendees
            </button>

            {e.url && (
              <a href={e.url} target="_blank" rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                🔗 View
              </a>
            )}

            <button onClick={() => reject(e.id)}
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              🗑 Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
