import { useState, useMemo } from 'react'
import { useFirestoreEvents, groupEventsByPeriod, type CommunityEvent } from '../../hooks/useEvents'
import EventCard from './components/EventCard'
import SubmitEventForm from './components/SubmitEventForm'

type FilterCategory = 'all' | 'networking' | 'business' | 'community'

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="skeleton w-full" style={{ height: 120 }} />
      <div className="p-4 space-y-3">
        <div className="h-3 rounded skeleton w-3/4" />
        <div className="h-2 rounded skeleton w-1/2" />
        <div className="h-2 rounded skeleton w-2/3" />
        <div className="h-7 rounded skeleton w-full" />
      </div>

    </div>
  )
}

export default function EventsModule() {
  const { events: firestoreEvents, loading: fsLoading } = useFirestoreEvents()
  const [category, setCategory]   = useState<FilterCategory>('all')
  const [search, setSearch]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loading = fsLoading

  // Merge & deduplicate all events
  const allEvents = useMemo(() => {
    return [...firestoreEvents].sort((a, b) => a.startDate.localeCompare(b.startDate))
  }, [firestoreEvents])

  // Filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allEvents.filter(e => {
      if (category !== 'all') {
        const cats = (e as CommunityEvent & { category?: string[] }).category ?? []
        if (!cats.includes(category)) return false
      }
      if (q && !`${e.title} ${e.location} ${e.description} ${e.organizer ?? ''}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [allEvents, category, search])

  const sorted = useMemo(() => {
    const flagged = filtered.filter(e => (e as CommunityEvent & { flag?: string }).flag)
    const rest = filtered.filter(e => !(e as CommunityEvent & { flag?: string }).flag)
    return [...flagged, ...rest]
  }, [filtered])
  const grouped = useMemo(() => groupEventsByPeriod(sorted), [sorted])

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {submitting && <SubmitEventForm onClose={() => setSubmitting(false)} />}

      {/* Header */}
      <div className="px-4 pt-5 pb-2">
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Events
        </h1>
        <p className="text-sm mt-1 mb-3" style={{ color: 'var(--color-muted)' }}>
          WCCC, WEDC & Wisconsin Asian community events
        </p>
        <button onClick={() => setSubmitting(true)}
          className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ background: 'rgba(185,28,28,0.08)', color: 'var(--color-red)', border: '1px solid rgba(185,28,28,0.2)' }}>
          📅 Submit an Event
        </button>
      </div>

      {/* Filters */}
      <div className="sticky top-14 z-40 px-4 py-3" style={{
        background: 'var(--color-bg)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        {/* Search */}
        <div className="relative mb-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: 'var(--color-muted)' }}>🔍</span>
          <input type="text" placeholder="Search events…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: '16px' }} />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--color-muted)' }}>✕</button>
          )}
        </div>


        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {([
            ['all',         '🗂 All'],
            ['networking',  '🤝 Networking'],
            ['business',    '💼 Business'],
            ['community',   '🌏 Community Mixer'],
          ] as const).map(([val, label]) => (
            <button key={val} onClick={() => setCategory(val as FilterCategory)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: category === val ? 'rgba(251,191,36,0.2)' : 'var(--color-surface)',
                color: category === val ? 'var(--color-gold)' : 'var(--color-muted)',
                border: `1px solid ${category === val ? 'rgba(251,191,36,0.4)' : 'var(--color-border)'}`,
              }}>
              {label}
            </button>
          ))}
        </div>

        <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
          <span style={{ color: 'var(--color-gold)' }}>{filtered.length}</span> events
        </p>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-medium" style={{ color: 'var(--color-text)' }}>No events found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
              Try adjusting your filters or check back soon
            </p>
          </div>
        )}

        {/* Grouped events */}
        {!loading && grouped.map(group => (
          <section key={group.label} className="mb-8">
            {/* Period header */}
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display font-semibold text-base"
                style={{ color: 'var(--color-text)' }}>
                {group.label === 'This Week' ? '🔥' : group.label === 'Coming Up' ? '🗓' : '📁'} {group.label}
              </h2>
              <span className="chip text-xs" style={{
                background: 'rgba(185,28,28,0.1)', color: 'var(--color-red)',
                border: '1px solid rgba(185,28,28,0.2)'
              }}>
                {group.events.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.events.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          </section>
        ))}
      </div>

    </div>
  )
}
