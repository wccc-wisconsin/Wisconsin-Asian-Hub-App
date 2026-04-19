import { useState, useMemo } from 'react'
import {
  useOpportunities, matchWCCCCategories,
  isUrgent, isClosed, isDueToday, daysUntilClose,
  formatDate, getStatus,
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

function getDifficulty(opp: Opportunity): 'beginner' | 'intermediate' | 'advanced' {
  const text = `${opp.title} ${opp.summary} ${(opp.business_type ?? []).join(' ')}`.toLowerCase()
  if (
    text.includes('large') || text.includes('major') || text.includes('capital') ||
    text.includes('million') || text.includes('infrastructure') || text.includes('complex') ||
    text.includes('design-build') || text.includes('architect') || text.includes('engineer')
  ) return 'advanced'
  if (
    text.includes('construction') || text.includes('renovation') || text.includes('install') ||
    text.includes('consulting') || text.includes('professional services') || text.includes('audit') ||
    text.includes('technology') || text.includes('software') || text.includes('system')
  ) return 'intermediate'
  return 'beginner'
}

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner:     '🟢 Beginner Friendly',
  intermediate: '🟡 Intermediate',
  advanced:     '🔴 Advanced',
}

const DIFFICULTY_STYLE: Record<string, { bg: string; color: string }> = {
  beginner:     { bg: 'rgba(34,197,94,0.12)',  color: '#16a34a' },
  intermediate: { bg: 'rgba(251,191,36,0.15)', color: '#d97706' },
  advanced:     { bg: 'rgba(239,68,68,0.12)',  color: '#dc2626' },
}

function WhoShouldApply({ matches }: { matches: string[] }) {
  if (matches.length === 0) return null
  const profiles: Record<string, string> = {
    'Construction':          '🔨 Construction or trades business',
    'IT & Technology':       '💻 IT, software, or tech provider',
    'Professional Services': '📋 Consulting, accounting, or legal firm',
    'Food & Beverage':       '🍽️ Food service or catering business',
    'Healthcare':            '🏥 Healthcare or clinical services provider',
    'Retail & Wholesale':    '📦 Supplier or distributor',
    'Transportation':        '🚛 Transportation or logistics company',
    'Real Estate':           '🏢 Real estate or property management firm',
    'Marketing & Media':     '📣 Marketing, design, or media agency',
    'Education & Training':  '📚 Training or education provider',
  }
  const applicable = matches.map(m => profiles[m]).filter(Boolean)
  if (applicable.length === 0) return null
  return (
    <div className="rounded-lg px-3 py-2 space-y-1.5"
      style={{ background: 'rgba(66,133,244,0.06)', border: '1px solid rgba(66,133,244,0.15)' }}>
      <p className="text-xs font-semibold" style={{ color: '#4285f4' }}>👥 Who Should Apply?</p>
      <div className="space-y-0.5">
        {applicable.map((p, i) => (
          <p key={i} className="text-xs" style={{ color: 'var(--color-muted)' }}>{p}</p>
        ))}
      </div>
    </div>
  )
}

function OpportunityCard({ opp, featured }: { opp: Opportunity; featured?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const status      = getStatus(opp)
  const closed      = status === 'closed'
  const dueToday    = status === 'due_today'
  const urgent      = status === 'urgent'
  const inactive    = status === 'inactive'
  const days        = daysUntilClose(opp)
  const wcccMatches = matchWCCCCategories(opp)
  const difficulty  = getDifficulty(opp)
  const diffStyle   = DIFFICULTY_STYLE[difficulty]

  const borderColor =
    featured  ? 'rgba(251,191,36,0.5)'    :
    closed    ? 'rgba(156,163,175,0.3)'   :
    dueToday  ? 'rgba(220,38,38,0.6)'     :
    urgent    ? 'rgba(239,68,68,0.4)'     :
    inactive  ? 'rgba(107,114,128,0.25)'  :
    'var(--color-border)'

  const accentColor =
    featured  ? 'linear-gradient(90deg, #d97706, #fbbf24)' :
    closed    ? 'linear-gradient(90deg, #6b7280, #9ca3af)' :
    dueToday  ? 'linear-gradient(90deg, #dc2626, #ef4444)' :
    urgent    ? 'linear-gradient(90deg, #ef4444, #f97316)' :
    inactive  ? 'linear-gradient(90deg, #6b7280, #9ca3af)' :
    'linear-gradient(90deg, #B91C1C, #ef4444)'

  return (
    <article className="rounded-xl overflow-hidden" style={{
      background: 'var(--color-surface)',
      border: `1px solid ${borderColor}`,
      opacity: closed || inactive ? 0.75 : 1,
      boxShadow: featured ? '0 0 0 2px rgba(251,191,36,0.2)' : 'none',
    }}>
      <div className="h-1" style={{ background: accentColor }} />

      <div className="p-4 space-y-3">
        {/* Status + difficulty badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {featured && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(251,191,36,0.2)', color: '#d97706' }}>
              ⭐ Featured
            </span>
          )}
          {closed && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(107,114,128,0.15)', color: '#6b7280' }}>
              🔒 Closed
            </span>
          )}
          {dueToday && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(220,38,38,0.2)', color: '#dc2626' }}>
              ⚠️ Due Today
            </span>
          )}
          {urgent && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
              🔥 Closing in {days}d
            </span>
          )}
          {inactive && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(107,114,128,0.15)', color: '#6b7280' }}>
              ⏸ Inactive
            </span>
          )}
          {!closed && !inactive && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: diffStyle.bg, color: diffStyle.color }}>
              {DIFFICULTY_LABEL[difficulty]}
            </span>
          )}
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

        {/* Quick snapshot */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {(opp.categories ?? []).filter(Boolean).slice(0, 2).map(cat => (
            <div key={cat}>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Category</p>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{cat}</p>
            </div>
          ))}
          {opp.close_date && (
            <div>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Deadline</p>
              <p className="text-xs font-medium" style={{
                color: closed ? '#6b7280' : dueToday ? '#dc2626' : urgent ? '#ef4444' : 'var(--color-text)'
              }}>
                {formatDate(opp.close_date)}
              </p>
            </div>
          )}
          {opp.open_date && (
            <div>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Opens</p>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{formatDate(opp.open_date)}</p>
            </div>
          )}
          {opp.questions_due_date && (
            <div>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Q&A Due</p>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{formatDate(opp.questions_due_date)}</p>
            </div>
          )}
          {opp.content_type && opp.content_type.length > 0 && (
            <div>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Platform</p>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{opp.content_type[0]}</p>
            </div>
          )}
        </div>

        {/* WCCC matches */}
        {wcccMatches.length > 0 && !closed && !inactive && (
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

        {/* Who Should Apply */}
        {!closed && !inactive && <WhoShouldApply matches={wcccMatches} />}

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

        {/* Actions */}
        <div className="flex gap-2">
          <a href={opp.url} target="_blank" rel="noopener noreferrer"
            className="flex-1 py-2 rounded-lg text-xs font-semibold text-center"
            style={{
              background: closed || inactive ? 'var(--color-bg)' : dueToday ? '#dc2626' : urgent ? 'var(--color-red)' : 'rgba(185,28,28,0.1)',
              color: closed || inactive ? 'var(--color-muted)' : dueToday || urgent ? '#fff' : 'var(--color-red)',
              border: `1px solid ${closed || inactive ? 'var(--color-border)' : dueToday || urgent ? 'transparent' : 'rgba(185,28,28,0.2)'}`,
            }}>
            {closed ? 'View Closed Bid' : inactive ? 'View Bid' : dueToday ? '⚠️ Submit Now' : 'View Bid →'}
          </a>
          {!closed && !inactive && (
            <a href="mailto:info@wisccc.org?subject=Help with Bid Opportunity"
              className="px-3 py-2 rounded-lg text-xs font-semibold text-center"
              style={{ background: 'rgba(66,133,244,0.1)', color: '#4285f4', border: '1px solid rgba(66,133,244,0.2)' }}>
              Get Help
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

function HowToBidGuide() {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl overflow-hidden mx-4 mb-4"
      style={{ background: 'var(--color-surface)', border: '1px solid rgba(66,133,244,0.25)' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
        style={{ color: 'var(--color-text)' }}>
        <div>
          <p className="text-sm font-semibold">🏛️ How to Bid on Milwaukee County Contracts</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Step-by-step guide for WCCC members</p>
        </div>
        <span className="text-lg" style={{
          color: 'var(--color-muted)',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
          display: 'inline-block',
        }}>⌄</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="space-y-3 pt-3">
            {[
              { step: '1', icon: '📋', title: 'Register as a Vendor', desc: 'Create an account on the Milwaukee County procurement portal to receive bid notifications and submit proposals.' },
              { step: '2', icon: '📄', title: 'Get Required Documents', desc: 'Prepare your business license, insurance certificate, W-9, and any trade-specific licenses.' },
              { step: '3', icon: '🔍', title: 'Review the Bid Documents', desc: 'Download the full RFP/ITB from the bid page. Read all requirements carefully before submitting.' },
              { step: '4', icon: '🤝', title: 'Consider Partnering', desc: 'Large contracts may require collaboration. WCCC can help connect you with partner businesses.' },
              { step: '5', icon: '📬', title: 'Submit Before Deadline', desc: 'Submit via the platform listed (Bonfire, Public Purchase, etc.) before the close date.' },
            ].map(s => (
              <div key={s.step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(185,28,28,0.15)', color: 'var(--color-red)' }}>
                  {s.step}
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{s.icon} {s.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg p-3 space-y-2"
            style={{ background: 'rgba(66,133,244,0.06)', border: '1px solid rgba(66,133,244,0.15)' }}>
            <p className="text-xs font-semibold" style={{ color: '#4285f4' }}>👥 Who Should Apply?</p>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>These opportunities may be a good fit if you are:</p>
            {[
              '🔨 A construction or trades business',
              '💻 A service provider (IT, marketing, consulting, cleaning)',
              '📦 A supplier or distributor',
              '📋 A professional services firm (legal, accounting, HR)',
              '🍽️ A food service or catering business',
              '🚛 A transportation or logistics company',
            ].map((item, i) => (
              <p key={i} className="text-xs" style={{ color: 'var(--color-text)' }}>{item}</p>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a href="https://county.milwaukee.gov/EN/Admin-Services/Bids-and-RFPs"
              target="_blank" rel="noopener noreferrer"
              className="py-2.5 rounded-lg text-xs font-semibold text-center"
              style={{ background: 'rgba(185,28,28,0.1)', color: 'var(--color-red)', border: '1px solid rgba(185,28,28,0.2)' }}>
              🔗 Vendor Portal
            </a>
            <a href="mailto:info@wisccc.org?subject=Help with Procurement"
              className="py-2.5 rounded-lg text-xs font-semibold text-center"
              style={{ background: 'rgba(66,133,244,0.1)', color: '#4285f4', border: '1px solid rgba(66,133,244,0.2)' }}>
              💬 Ask WCCC
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function PartnershipBanner() {
  return (
    <div className="mx-4 mb-4 rounded-xl p-4 space-y-2"
      style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
      <p className="text-sm font-semibold" style={{ color: '#16a34a' }}>🤝 Looking for Partners?</p>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
        Many contracts require collaboration or subcontracting. If you're interested in teaming up with other WCCC members on a bid, we can help connect you.
      </p>
      <a href="mailto:info@wisccc.org?subject=Looking for Bid Partners"
        className="inline-block px-4 py-2 rounded-lg text-xs font-semibold"
        style={{ background: 'rgba(34,197,94,0.15)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.3)' }}>
        Contact WCCC to Find Partners →
      </a>
    </div>
  )
}

export default function OpportunitiesModule() {
  const { opportunities, loading }          = useOpportunities()
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showClosed, setShowClosed]         = useState(false)
  const [showUrgentOnly, setShowUrgentOnly] = useState(false)
  const [search, setSearch]                 = useState('')

  const dueTodayCount = useMemo(() => opportunities.filter(o => isDueToday(o)).length, [opportunities])
  const urgentCount   = useMemo(() => opportunities.filter(o => isUrgent(o)).length, [opportunities])
  const closedCount   = useMemo(() => opportunities.filter(o => isClosed(o)).length, [opportunities])
  const inactiveCount = useMemo(() => opportunities.filter(o => getStatus(o) === 'inactive').length, [opportunities])

  // Featured: first open/urgent/due_today bid only — never closed or inactive
  const featuredOpp = useMemo(() => {
    return opportunities.find(o => {
      const status = getStatus(o)
      return status === 'open' || status === 'urgent' || status === 'due_today'
    }) ?? null
  }, [opportunities])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return opportunities.filter(o => {
      const status = getStatus(o)
      if (!showClosed && (status === 'closed' || status === 'inactive')) return false
      if (showUrgentOnly && status !== 'urgent' && status !== 'due_today') return false
      if (categoryFilter && !matchWCCCCategories(o).includes(categoryFilter)) return false
      if (q && !`${o.title} ${o.summary} ${o.department} ${(o.categories ?? []).join(' ')}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [opportunities, showClosed, showUrgentOnly, categoryFilter, search])

  const visibleForCategories = useMemo(() => {
    return opportunities.filter(o => {
      const status = getStatus(o)
      if (!showClosed && (status === 'closed' || status === 'inactive')) return false
      return true
    })
  }, [opportunities, showClosed])

  const allWCCCCategories = useMemo(() => {
    const cats = new Set<string>()
    visibleForCategories.forEach(o => matchWCCCCategories(o).forEach(c => cats.add(c)))
    return [...cats].sort()
  }, [visibleForCategories])

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          Opportunities
        </h1>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Milwaukee County bids & RFPs · <span style={{ color: 'var(--color-gold)' }}>{opportunities.length}</span> total
          {dueTodayCount > 0 && <span style={{ color: '#dc2626' }}> · ⚠️ {dueTodayCount} due today</span>}
          {urgentCount > 0 && <span style={{ color: '#ef4444' }}> · 🔥 {urgentCount} urgent</span>}
          {inactiveCount > 0 && <span style={{ color: '#6b7280' }}> · ⏸ {inactiveCount} inactive</span>}
          {closedCount > 0 && <span style={{ color: '#6b7280' }}> · 🔒 {closedCount} closed</span>}
        </p>
      </div>

      {/* Featured Opportunity */}
      {featuredOpp && !search && !categoryFilter && !showUrgentOnly && (
        <div className="px-4 mb-2">
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-gold)' }}>⭐ Featured Opportunity</p>
          <OpportunityCard opp={featuredOpp} featured />
        </div>
      )}

      {/* How to Bid Guide */}
      <HowToBidGuide />

      {/* Partnership Banner */}
      <PartnershipBanner />

      {/* Filters */}
      <div className="sticky top-14 z-40 px-4 py-3" style={{
        background: 'var(--color-bg)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
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

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setShowUrgentOnly(u => !u)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: showUrgentOnly ? '#ef4444' : 'var(--color-surface)',
              color: showUrgentOnly ? '#fff' : 'var(--color-muted)',
              border: `1px solid ${showUrgentOnly ? '#ef4444' : 'var(--color-border)'}`,
            }}>
            🔥 Urgent & Due
          </button>

          <button onClick={() => setShowClosed(c => !c)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: showClosed ? '#6b7280' : 'var(--color-surface)',
              color: showClosed ? '#fff' : 'var(--color-muted)',
              border: `1px solid ${showClosed ? '#6b7280' : 'var(--color-border)'}`,
            }}>
            🔒 Show Closed
          </button>

          <button onClick={() => setCategoryFilter('')}
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

      {/* CTA Bar */}
      <div className="px-4 pt-4 grid grid-cols-3 gap-2">
        {[
          { icon: '🔵', label: 'Get Help from WCCC', href: 'mailto:info@wisccc.org?subject=Help with Bid Opportunity' },
          { icon: '📋', label: 'Register as Vendor', href: 'https://county.milwaukee.gov/EN/Admin-Services/Bids-and-RFPs' },
          { icon: '🎓', label: 'Join Bid Workshop', href: 'mailto:info@wisccc.org?subject=Bid Workshop' },
        ].map(cta => (
          <a key={cta.label} href={cta.href}
            target={cta.href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="py-2.5 rounded-xl text-center space-y-0.5"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg">{cta.icon}</p>
            <p className="text-xs font-medium leading-tight" style={{ color: 'var(--color-text)' }}>{cta.label}</p>
          </a>
        ))}
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
