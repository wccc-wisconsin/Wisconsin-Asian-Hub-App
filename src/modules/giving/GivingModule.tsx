import { useState, useMemo } from 'react'
import { useDonationItems, type DonationItem, type ItemCategory } from '../../hooks/useGiving'
import ItemCard from './components/ItemCard'
import DonateForm from './components/DonateForm'
import RequestForm from './components/RequestForm'

const CATEGORIES: ItemCategory[] = [
  'Equipment & Tools', 'Office Supplies', 'Furniture', 'Technology / Electronics'
]

const CATEGORY_ICONS: Record<string, string> = {
  'Equipment & Tools': '🔧', 'Office Supplies': '📎',
  'Furniture': '🪑', 'Technology / Electronics': '💻',
}

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="h-1 skeleton" />
      <div className="p-4 space-y-3">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg skeleton flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 rounded skeleton w-3/4" />
            <div className="h-2 rounded skeleton w-1/2" />
          </div>
        </div>
        <div className="h-2 rounded skeleton w-full" />
        <div className="h-2 rounded skeleton w-4/5" />
      </div>
    </div>
  )
}

export default function GivingModule() {
  const { items, loading }             = useDonationItems()
  const [donating, setDonating]         = useState(false)
  const [requesting, setRequesting]     = useState<DonationItem | null>(null)
  const [filterCat, setFilterCat]       = useState<ItemCategory | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'available'>('available')

  const filtered = useMemo(() => items.filter(item => {
    if (filterCat !== 'all' && item.category !== filterCat) return false
    if (filterStatus === 'available' && item.status !== 'available') return false
    return true
  }), [items, filterCat, filterStatus])

  const availableCount = items.filter(i => i.status === 'available').length

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {donating   && <DonateForm onClose={() => setDonating(false)} />}
      {requesting && <RequestForm item={requesting} onClose={() => setRequesting(null)} />}

      {/* Hero */}
      <div className="px-4 pt-6 pb-4 text-center">
        <div className="text-4xl mb-3">🤝</div>
        <h1 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          WCCC Community Giving
        </h1>
        <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--color-muted)' }}>
          Donate items you no longer need. WCCC matches them with member businesses who can put them to good use.
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="chip text-xs" style={{
            background: 'rgba(34,197,94,0.1)', color: '#22c55e',
            border: '1px solid rgba(34,197,94,0.3)'
          }}>
            {availableCount} items available
          </span>
        </div>
      </div>

      {/* Donate CTA */}
      <div className="px-4 mb-4">
        <button onClick={() => setDonating(true)}
          className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          style={{ background: 'var(--color-red)', color: '#fff',
            boxShadow: '0 4px 20px rgba(185,28,28,0.3)' }}>
          <span>🎁</span> Donate an Item
        </button>
      </div>

      {/* Filters */}
      <div className="sticky top-14 z-40 px-4 py-3" style={{
        background: 'rgba(12,10,9,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        {/* Status filter */}
        <div className="flex gap-2 mb-2">
          {(['available', 'all'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: filterStatus === s ? 'var(--color-red)' : 'var(--color-surface)',
                color: filterStatus === s ? '#fff' : 'var(--color-muted)',
                border: `1px solid ${filterStatus === s ? 'var(--color-red)' : 'var(--color-border)'}`,
              }}>
              {s === 'available' ? '✅ Available' : '🗂 All Items'}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setFilterCat('all')}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: filterCat === 'all' ? 'rgba(251,191,36,0.2)' : 'var(--color-surface)',
              color: filterCat === 'all' ? 'var(--color-gold)' : 'var(--color-muted)',
              border: `1px solid ${filterCat === 'all' ? 'rgba(251,191,36,0.4)' : 'var(--color-border)'}`,
            }}>
            All Categories
          </button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: filterCat === c ? 'rgba(251,191,36,0.2)' : 'var(--color-surface)',
                color: filterCat === c ? 'var(--color-gold)' : 'var(--color-muted)',
                border: `1px solid ${filterCat === c ? 'rgba(251,191,36,0.4)' : 'var(--color-border)'}`,
              }}>
              {CATEGORY_ICONS[c]} {c}
            </button>
          ))}
        </div>

        <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
          <span style={{ color: 'var(--color-gold)' }}>{filtered.length}</span> items shown
        </p>
      </div>

      {/* Items grid */}
      <div className="px-4 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-medium" style={{ color: 'var(--color-text)' }}>No items yet</p>
            <p className="text-sm mt-1 mb-6" style={{ color: 'var(--color-muted)' }}>
              Be the first to donate something!
            </p>
            <button onClick={() => setDonating(true)}
              className="px-6 py-2.5 rounded-full text-sm font-semibold"
              style={{ background: 'var(--color-red)', color: '#fff' }}>
              🎁 Donate an Item
            </button>
          </div>
        )}

        {filtered.map(item => (
          <ItemCard key={item.id} item={item} onRequest={() => setRequesting(item)} />
        ))}
      </div>

      {/* How it works */}
      <div className="px-4 mt-8">
        <div className="rounded-xl p-4" style={{
          background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)'
        }}>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-gold)' }}>
            💡 How it works
          </p>
          <div className="space-y-2">
            {[
              ['🎁', 'Anyone donates items they no longer need'],
              ['👀', 'WCCC members browse available items'],
              ['✋', 'Members request items their business needs'],
              ['🤝', 'WCCC coordinates the match & pickup'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
