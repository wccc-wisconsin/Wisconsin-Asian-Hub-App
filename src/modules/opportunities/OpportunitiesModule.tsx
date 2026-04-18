import { useState, useMemo } from 'react'
import {
  useOpportunities, matchWCCCCategories,
  isUrgent, isClosed, daysUntilClose, formatDate, cleanDateStr,
  type Opportunity
} from '../../hooks/useOpportunities'

const CATEGORY_ICONS: Record<string, string> = {
  'Construction':          '🏗️',
  'Food & Beverage':       '🍽️',
  'IT & Technology':       '💻',
  'Professional Services': '💼',
  'Healthcare':            '🏥',
  'Retail & Wholesale':    '🛒',
  'Transportation':        '🚛',
  'Real Estate':           '🏢',
  'Marketing & Media':     '📱',
  'Education & Training':  '📚',
}

function OpportunityCard({ opp }: { opp: Opportunity }) {
  const [expanded, setExpanded] = useState(false)
  const urgent      = isUrgent(opp)
  const closed      = isClosed(opp)
  const inactive    = !opp.active && !closed
  const days        = daysUntilClose(opp)
  const wcccMatches = matchWCCCCategories(opp)

  const borderColor = closed
    ? 'rgba(156,163,175,0.3)'
    : inactive
    ? 'rgba(251,191,36,0.25)'
    : urgent
    ? 'rgba(239,68,68,0.4)'
    : 'var(--color-border)'

  const accentColor = closed
    ? 'linear-gradient(90deg, #6b7280, #9ca3af)'
    : inactive
    ? 'linear-gradient(90deg, #d97706, #fbbf24)'
    : urgent
    ? 'linear-gradient(90deg, #ef4444, #f97316)'
    : 'linear-gradient(90deg, #B91C1C, #ef4444)'

  return (
    <article className="rounded-xl overflow-hidden" style={{
      background: 'var(--color-surface)',
      border: `1px solid ${borderColor}`,
      opacity: closed || inactive ? 0.75 : 1,
    }}>
      <div className="h-1" style={{ background: accentColor }} />

      <div className="p-4 space-y-3">
        {/* Status badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {closed && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(107,114,128,0.15)', color: '#6b7280' }}>
              🔒 Closed
            </span>
          )}
          {inactive && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#d97706' }}>
              ⏸ Inactive
            </span>
          )}
          {urgent && !closed && !inactive && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
              🔥 Closing {days === 0 ? 'Today' : `in ${days}d`}
            </span>
          )}
          {opp.categories?.filter(Boolean).map(cat => (
            <span key={cat} className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
              {cat}
            </span>
          ))}
        </div>

        {/* Title */}
        <div>
          <a href={opp.url} target="_blank" rel="noopener noreferrer">
            <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--color-text)' }}>
              {opp.title} <span className="text-xs" style={{ color: 'var(--color-muted)' }}>↗</span>
            </h3>
          </a>
          {opp.department && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              🏛️ {opp.department} · {opp.source}
            </p>
          )}
        </div>

        {/* Dates */}
        {(opp.open_date || opp.close_date || opp.questions_due_date) && (
          <div className="flex gap-4 flex-wrap">
            {opp.open_date && (
              <div>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Opens</p>
                <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{formatDate(opp.open_date)}</p>
              </div>
            )}
            {opp.close_date && (
              <div>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Closes</p>
                <p className="text-xs font-medium" style={{
                  color: closed ? '#6b7280' : urgent ? '#ef4444' : 'var(--color-text)'
                }}>
                  {formatDate(opp.close_date)}
                </p>
              </div>
            )}
            {opp.questions_due_date && (
              <div>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Q&A Due</p>
                <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{formatDate(opp.questions_due_date)}</p>
              </div>
            )}
          </div>
        )}

        {/* WCCC matches */}
        {wcccMatches.length > 0 && (
          <div className="rounded-lg px-3 py-2 space-y-1"
            style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.15)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-red)' }}>
              🎯 Relevant to WCCC members:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {wcccMatches.map(cat => (
                <span key={cat} className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(185,28,28,0.12)', color: '#ef4444' }}>
                  {CATEGORY_ICONS[cat]} {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {opp.summary && (
          <div>
            <p className="text-xs" style={{
              color: 'var(--color-muted)',
              display: '-webkit-box',
              WebkitLineClamp: expanded ? 'unset' : 2,
              WebkitBoxOrient: 'vertical',
              overflow: expanded ? 'visible' : 'hidden',
            }}>
              {opp.summary}
            </p>
            <button onClick={() => setExpanded(e => !e)}
              className="text-xs mt-1 font-medium"
              style={{ color: 'var(--color-red)' }}>
              {expanded ? 'Show less ↑' : 'Read more ↓'}
            </button>
          </div>
        )}

        {/* Action */}
        <a href={opp.url} target="_blank" rel="noopener noreferrer"
          className="block w-full py-2 rounded-lg text-xs font-semibold text-center"
          style={{
            background: closed || inactive ? 'var(--color-bg)' : urgent ? 'var(--color-red)' : 'rgba(185,28,28,0.1)',
            color: closed || inactive ? 'var(--color-muted)' : urgent ? '#fff' : 'var(--color-red)',
            border: `1px solid ${closed || inactive ? 'var(--color-border)' : urgent ? 'transparent' : 'rgba(185,28,28,0.2)'}`,
          }}>
          {closed ? 'View Closed Bid' : inactive ? 'View Bid' : 'View Bid Details →'}
        </a>
      </div>
    </article>
  )
}

export default function OpportunitiesModule() {
  const { opportunities, loading }          = useOpportunities()
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showClosed, setShowClosed]         = useState(false)
  const [showUrgentOnly, setShowUrgentOnly] = useState(false)
  const [search, setSearch]                 = useState('')

  const urgentCount   = useMemo(() => opportunities.filter(o => isUrgent(o) && !isClosed(o) && o.active).length, [opportunities])
  const closedCount   = useMemo(() => opportunities.filter(isClosed).length, [opportunities])
  const inactiveCount = useMemo(() => opportunities.filter(o => !o.active && !isClosed(o)).length, [opportunities])

  // Sorting: urgent open → regular open → inactive → closed
  const sorted = useMemo(() => [...opportunities].sort((a, b) => {
    const aClosed   = isClosed(a) ? 3 : 0
    const bClosed   = isClosed(b) ? 3 : 0
    const aInactive = !a.active && !isClosed(a) ? 2 : 0
    const bInactive = !b.active && !isClosed(b) ? 2 : 0
    const aUrgent   = isUrgent(a) && a.active ? 0 : 1
    const bUrgent   = isUrgent(b) && b.active ? 0 : 1
    const aScore    = aClosed || aInactive || aUrgent
    const bScore    = bClosed || bInactive || bUrgent
    if (aScore !== bScore) return aScore - bScore
    if (a.close_date && b.close_date) {
      return new Date(cleanDateStr(a.close_date)).getTime() - new Date(cleanDateStr(b.close_date)).getTime()
    }
    return 0
  }), [opportunities])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return sorted.filter(o => {
      // By default hide closed and inactive
      if (!showClosed && isClosed(o)) return false
      if (!showClosed && !o.active) return false
      if (showUrgentOnly && !isUrgent(o)) return false
      if (categoryFilter) {
        if (!matchWCCCCategories(o).includes(categoryFilter)) return false
      }
      if (q && !`${o.title} ${o.summary} ${o.department} ${(o.categories ?? []).join(' ')}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [sorted, showClosed, showUrgentOnly, categoryFilter, search])

  const allWCCCCategories = useMemo(() => {
    const cats = new Set<string>()
    opportunities.forEach(o => matchWCCCCategories(o).forEach(c => cats.add(c)))
    return [...cats].sort()
  }, [opportunities])

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          Opportunities
        </h1>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Milwaukee County bids & RFPs · <span style={{ color: 'var(--color-gold)' }}>{opportunities.length}</span> total
          {urgentCount > 0 && <span style={{ color: '#ef4444' }}> · 🔥 {urgentCount} urgent</span>}
          {inactiveCount > 0 && <span style={{ color: '#d97706' }}> · ⏸ {inactiveCount} inactive</span>}
          {closedCount > 0 && <span style={{ color: '#6b7280' }}> · 🔒 {closedCount} closed</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="sticky top-14 z-40 px-4 py-3" style={{
        background: 'var(--color-bg)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search opportunities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-2"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            fontSize: 16,
          }}
        />

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setShowUrgentOnly(u => !u)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: showUrgentOnly ? '#ef4444' : 'var(--color-surface)',
              color: showUrgentOnly ? '#fff' : 'var(--color-muted)',
              border: `1px solid ${showUrgentOnly ? '#ef4444' : 'var(--color-border)'}`,
            }}>
            🔥 Urgent
          </button>

          <button
            onClick={() => setShowClosed(c => !c)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: showClosed ? '#6b7280' : 'var(--color-surface)',
              color: showClosed ? '#fff' : 'var(--color-muted)',
              border: `1px solid ${showClosed ? '#6b7280' : 'var(--color-border)'}`,
            }}>
            🔒 Show Closed & Inactive
          </button>

          <button
            onClick={() => setCategoryFilter('')}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: !categoryFilter ? 'rgba(185,28,28,0.15)' : 'var(--color-surface)',
              color: !categoryFilter ? 'var(--color-red)' : 'var(--color-muted)',
              border: `1px solid ${!categoryFilter ? 'rgba(185,28,28,0.3)' : 'var(--color-border)'}`,
            }}>
            All
          </button>

          {allWCCCCategories.map(cat => (
            <button key={cat}
              onClick={() => setCategoryFilter(cat === categoryFilter ? '' : cat)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: categoryFilter === cat ? 'rgba(185,28,28,0.15)' : 'var(--color-surface)',
                color: categoryFilter === cat ? 'var(--color-red)' : 'var(--color-muted)',
                border: `1px solid ${categoryFilter === cat ? 'rgba(185,28,28,0.3)' : 'var(--color-border)'}`,
              }}>
              {CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>

        <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
          <span style={{ color: 'var(--color-gold)' }}>{filtered.length}</span> showing
          {!showClosed && ' · closed & inactive hidden'}
        </p>
      </div>

      {/* List */}
      <div className="px-4 pt-4 space-y-4">
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 space-y-3"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="h-3 rounded skeleton w-3/4" />
            <div className="h-2 rounded skeleton w-1/2" />
            <div className="h-2 rounded skeleton w-full" />
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium" style={{ color: 'var(--color-text)' }}>No opportunities found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
              {search ? 'Try different search terms' : 'Try adjusting your filters'}
            </p>
          </div>
        )}

        {filtered.map(opp => <OpportunityCard key={opp.id} opp={opp} />)}
      </div>
    </div>
  )
}
