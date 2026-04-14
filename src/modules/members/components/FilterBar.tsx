interface FilterBarProps {
  cities: string[]
  categories: string[]
  selectedCity: string
  selectedCategory: string
  search: string
  wcccOnly: boolean
  total: number
  filtered: number
  onCity: (v: string) => void
  onCategory: (v: string) => void
  onSearch: (v: string) => void
  onWcccOnly: (v: boolean) => void
}

export default function FilterBar({
  cities, categories,
  selectedCity, selectedCategory, search, wcccOnly,
  total, filtered,
  onCity, onCategory, onSearch, onWcccOnly,
}: FilterBarProps) {
  return (
    <div className="sticky top-14 z-40 px-4 py-3" style={{
      background: 'var(--color-bg)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      {/* Search */}
      <input
        type="text"
        placeholder="Search businesses..."
        value={search}
        onChange={e => onSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-2"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
          fontSize: 16,
        }}
      />

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => onWcccOnly(!wcccOnly)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: wcccOnly ? 'var(--color-red)' : 'var(--color-surface)',
            color: wcccOnly ? '#fff' : 'var(--color-muted)',
            border: `1px solid ${wcccOnly ? 'var(--color-red)' : 'var(--color-border)'}`,
          }}>
          🔴 WCCC Only
        </button>

        <select value={selectedCity} onChange={e => onCity(e.target.value)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium outline-none"
          style={{
            background: selectedCity ? 'rgba(251,191,36,0.15)' : 'var(--color-surface)',
            color: selectedCity ? 'var(--color-gold)' : 'var(--color-muted)',
            border: `1px solid ${selectedCity ? 'rgba(251,191,36,0.4)' : 'var(--color-border)'}`,
          }}>
          <option value="">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={selectedCategory} onChange={e => onCategory(e.target.value)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium outline-none"
          style={{
            background: selectedCategory ? 'rgba(251,191,36,0.15)' : 'var(--color-surface)',
            color: selectedCategory ? 'var(--color-gold)' : 'var(--color-muted)',
            border: `1px solid ${selectedCategory ? 'rgba(251,191,36,0.4)' : 'var(--color-border)'}`,
          }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
        <span style={{ color: 'var(--color-gold)' }}>{filtered}</span> of {total} businesses
      </p>
    </div>
  )
}
