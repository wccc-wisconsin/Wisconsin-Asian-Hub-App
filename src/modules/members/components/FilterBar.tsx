interface FilterBarProps {
  cities: string[]
  categories: string[]
  selectedCity: string
  selectedCategory: string
  search: string
  onCity: (v: string) => void
  onCategory: (v: string) => void
  onSearch: (v: string) => void
  total: number
  filtered: number
}

export default function FilterBar({
  cities, categories, selectedCity, selectedCategory, search,
  onCity, onCategory, onSearch, total, filtered
}: FilterBarProps) {
  return (
    <div className="sticky top-14 z-40 py-3 px-4" style={{ 
      background: 'var(--color-bg)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)'
    }}>
      {/* Search */}
      <div className="max-w-6xl mx-auto space-y-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-muted)' }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search members, businesses…"
            value={search}
            onChange={e => onSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
          {search && (
            <button 
              onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--color-muted)' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {/* City filter */}
          <select
            value={selectedCity}
            onChange={e => onCity(e.target.value)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full outline-none cursor-pointer"
            style={{
              background: selectedCity ? 'var(--color-red)' : 'var(--color-surface)',
              color: selectedCity ? '#fff' : 'var(--color-muted)',
              border: `1px solid ${selectedCity ? 'var(--color-red)' : 'var(--color-border)'}`,
            }}
          >
            <option value="">📍 All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={e => onCategory(e.target.value)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full outline-none cursor-pointer"
            style={{
              background: selectedCategory ? 'rgba(251,191,36,0.2)' : 'var(--color-surface)',
              color: selectedCategory ? 'var(--color-gold)' : 'var(--color-muted)',
              border: `1px solid ${selectedCategory ? 'rgba(251,191,36,0.4)' : 'var(--color-border)'}`,
            }}
          >
            <option value="">🏷️ All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Clear all */}
          {(selectedCity || selectedCategory || search) && (
            <button
              onClick={() => { onCity(''); onCategory(''); onSearch('') }}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{ 
                background: 'rgba(156,163,175,0.1)',
                color: 'var(--color-muted)',
                border: '1px solid var(--color-border)'
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {/* Count */}
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Showing <span style={{ color: 'var(--color-gold)' }}>{filtered}</span> of {total} members
        </p>
      </div>
    </div>
  )
}
