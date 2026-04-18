import { useState, useMemo } from 'react'
import { useOpportunities, matchWCCCCategories, isUrgent, daysUntilClose, type Opportunity } from '../../hooks/useOpportunities'

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

function formatDate(dateStr: string): string {
  if (!dateStr) return 'TBD'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return dateStr }
}

function OpportunityCard({ opp }: { opp: Opportunity }) {
  const [expanded, setExpanded] = useState(false)
  const urgent      = isUrgent(opp)
  const days        = daysUntilClose(opp)
  const wcccMatches = matchWCCCCategories(opp)

  return (
    <article className="rounded-xl overflow-hidden" style={{
      background: 'var(--color-surface)',
      border: `1px solid ${urgent ? 'rgba(239,68,68,0.4)' : 'var(--color-border)'}`,
      boxShadow: urgent ? '0 0 0 1px rgba(239,68,68,0.15)' : 'none',
    }}>
      {/* Top accent */}
      <div className="h-1" style={{
        background: urgent
          ? 'linear-gradient(90deg, #ef4444, #f97316)'
          : 'linear-gradient(90deg, #B91C1C, #ef4444)',
      }} />

      <div className="p-4 space-y-3">
        {/* Header badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {urgent && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold animate-pulse"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
              🔥 Closing {days === 0 ? 'Today' : `in ${days}d`}
            </span>
          )}
          {opp.categories?.map(cat => (
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
              <p className="text-xs font-medium" style={{ color: urgent ? '#ef4444' : 'var(--color-text)' }}>
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
          style={{ background: urgent ? 'var(--color-red)' : 'rgba(185,28,28,0.1)', color: urgent ? '#fff' : 'var(--color-red)', border: urgent ? 'none' : '1px solid rgba(185,28,28,0.2)' }}>
          View Bid Details →
        </a>
      </div>
    </article>
  )
}

function WeChatDigest({ opportunities }: { opportunities: Opportunity[] }) {
  const [generating, setGenerating] = useState(false)
  const [digest, setDigest]         = useState('')
  const [copied, setCopied]         = useState(false)

  async function generateDigest() {
    setGenerating(true)
    setDigest('')
    try {
      const urgent   = opportunities.filter(isUrgent)
      const regular  = opportunities.filter(o => !isUrgent(o)).slice(0, 5)
      const featured = [...urgent, ...regular].slice(0, 8)

      const summary = featured.map(o => {
        const matches = matchWCCCCategories(o)
        const days    = daysUntilClose(o)
        return `- ${o.title}${o.department ? ` (${o.department})` : ''}${days !== null ? `, closes in ${days} days` : ''}${matches.length ? `, relevant to: ${matches.join(', ')}` : ''}`
      }).join('\n')

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Create a bilingual (English + Chinese) WeChat digest for Wisconsin Chinese Chamber of Commerce (WCCC) members about these Milwaukee County bid opportunities. Format it nicely for WeChat with emojis. Keep it concise and actionable. Highlight urgent ones closing soon.

Opportunities:
${summary}

Format:
1. Brief English intro (2-3 sentences)
2. List of opportunities with key details in English
3. Chinese translation of the full message
4. Call to action to visit hub.wcccbusinessnetwork.org for more details

Return only the digest text, ready to copy into WeChat.`
          }]
        }),
      })
      const data = await res.json()
      setDigest(data.reply ?? 'Failed to generate digest.')
    } catch {
      setDigest('Failed to generate digest. Please try again.')
    }
    setGenerating(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(digest)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: 'var(--color-surface)', border: '1px solid rgba(251,191,36,0.3)' }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.05)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>
          💬 WeChat Digest Generator
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
          AI generates a bilingual weekly summary ready to share
        </p>
      </div>
      <div className="p-4 space-y-3">
        <button onClick={generateDigest} disabled={generating}
          className="w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: 'var(--color-gold)', color: '#000' }}>
          {generating ? '⏳ Generating...' : '🤖 Generate WeChat Digest'}
        </button>

        {digest && (
          <>
            <div className="rounded-xl p-3 text-xs leading-relaxed"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>
              {digest}
            </div>
            <button onClick={handleCopy}
              className="w-full py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: copied ? '#22c55e' : 'var(--color-surface)', color: copied ? '#fff' : 'var(--color-text)', border: '1px solid var(--color-border)' }}>
              {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function OpportunitiesModule() {
  const { opportunities, loading } = useOpportunities()
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showUrgentOnly, setShowUrgentOnly] = useState(false)
  const [showDigest, setShowDigest]         = useState(false)

  const urgentCount = opportunities.filter(isUrgent).length

  const filtered = useMemo(() => {
    return opportunities.filter(o => {
      if (showUrgentOnly && !isUrgent(o)) return false
      if (categoryFilter) {
        const matches = matchWCCCCategories(o)
        if (!matches.includes(categoryFilter)) return false
      }
      return true
    })
  }, [opportunities, showUrgentOnly, categoryFilter])

  const allWCCCCategories = useMemo(() => {
    const cats = new Set<string>()
    opportunities.forEach(o => matchWCCCCategories(o).forEach(c => cats.add(c)))
    return [...cats].sort()
  }, [opportunities])

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            Opportunities
          </h1>
          <button onClick={() => setShowDigest(d => !d)}
            className="text-xs px-3 py-1.5 rounded-full font-medium"
            style={{ background: showDigest ? 'var(--color-gold)' : 'rgba(251,191,36,0.1)', color: showDigest ? '#000' : 'var(--color-gold)', border: '1px solid rgba(251,191,36,0.3)' }}>
            💬 WeChat Digest
          </button>
        </div>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Milwaukee County bids & RFPs · <span style={{ color: 'var(--color-gold)' }}>{opportunities.length}</span> active
          {urgentCount > 0 && <span style={{ color: '#ef4444' }}> · 🔥 {urgentCount} urgent</span>}
        </p>
      </div>

      {/* WeChat Digest */}
      {showDigest && (
        <div className="px-4 mb-4">
          <WeChatDigest opportunities={opportunities} />
        </div>
      )}

      {/* Filters */}
      <div className="sticky top-14 z-40 px-4 py-3" style={{
        background: 'var(--color-bg)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {/* Urgent toggle */}
          <button onClick={() => setShowUrgentOnly(u => !u)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: showUrgentOnly ? '#ef4444' : 'var(--color-surface)',
              color: showUrgentOnly ? '#fff' : 'var(--color-muted)',
              border: `1px solid ${showUrgentOnly ? '#ef4444' : 'var(--color-border)'}`,
            }}>
            🔥 Urgent Only
          </button>

          {/* All categories */}
          <button onClick={() => setCategoryFilter('')}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: !categoryFilter ? 'rgba(185,28,28,0.15)' : 'var(--color-surface)',
              color: !categoryFilter ? 'var(--color-red)' : 'var(--color-muted)',
              border: `1px solid ${!categoryFilter ? 'rgba(185,28,28,0.3)' : 'var(--color-border)'}`,
            }}>
            All Categories
          </button>

          {/* WCCC category filters */}
          {allWCCCCategories.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === categoryFilter ? '' : cat)}
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
          <span style={{ color: 'var(--color-gold)' }}>{filtered.length}</span> opportunities
        </p>
      </div>

      {/* List */}
      <div className="px-4 pt-4 space-y-4">
        {loading && (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl p-4 space-y-3"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="h-3 rounded skeleton w-3/4" />
              <div className="h-2 rounded skeleton w-1/2" />
              <div className="h-2 rounded skeleton w-full" />
            </div>
          ))
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium" style={{ color: 'var(--color-text)' }}>No opportunities found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Try adjusting your filters</p>
          </div>
        )}

        {filtered.map(opp => <OpportunityCard key={opp.id} opp={opp} />)}
      </div>
    </div>
  )
}
