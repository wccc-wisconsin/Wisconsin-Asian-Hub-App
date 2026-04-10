import { useState, useMemo } from 'react'
import { useMembers, type SheetConfig } from '../../hooks/useMembers'
import MemberCard from './components/MemberCard'
import FilterBar from './components/FilterBar'
import SheetConfigScreen from './components/SheetConfig'

const STORAGE_KEY = 'wccc_sheet_config'

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="h-1 skeleton" />
      <div className="p-4 space-y-3">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-lg skeleton flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 rounded skeleton w-3/4" />
            <div className="h-2 rounded skeleton w-1/2" />
          </div>
        </div>
        <div className="h-5 rounded-full skeleton w-24" />
        <div className="space-y-1">
          <div className="h-2 rounded skeleton w-full" />
          <div className="h-2 rounded skeleton w-4/5" />
        </div>
      </div>
    </div>
  )
}

export default function MembersModule() {
const [config, setConfig] = useState<SheetConfig | null>({
  sheetId:   import.meta.env.VITE_SHEET_ID   ?? '',
  apiKey:    import.meta.env.VITE_SHEETS_API_KEY ?? '',
  sheetName: import.meta.env.VITE_SHEET_NAME ?? 'Sheet1',
})
  const [city, setCity]         = useState('')
  const [category, setCategory] = useState('')
  const [search, setSearch]     = useState('')

  const { members, loading, error } = useMembers(config)

  function handleSaveConfig(cfg: SheetConfig) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
    setConfig(cfg)
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY)
    setConfig(null)
  }

  const cities = useMemo(() =>
    [...new Set(members.map(m => m.city).filter(Boolean))].sort(), [members])

  const categories = useMemo(() =>
    [...new Set(members.map(m => m.category).filter(Boolean))].sort(), [members])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return members.filter(m => {
      if (city && m.city !== city) return false
      if (category && m.category !== category) return false
      if (q && !`${m.name} ${m.city} ${m.category} ${m.description ?? ''}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [members, city, category, search])

  if (!config) return <SheetConfigScreen onSave={handleSaveConfig} />

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <FilterBar
        cities={cities} categories={categories}
        selectedCity={city} selectedCategory={category} search={search}
        onCity={setCity} onCategory={setCategory} onSearch={setSearch}
        total={members.length} filtered={filtered.length}
      />

      <div className="px-4 pt-4">
        {error && (
          <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(185,28,28,0.1)', border: '1px solid rgba(185,28,28,0.3)' }}>
            <p className="text-sm" style={{ color: '#ef4444' }}>⚠️ {error}</p>
            <button onClick={handleReset} className="text-xs mt-2 underline" style={{ color: 'var(--color-muted)' }}>
              Update credentials
            </button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-medium" style={{ color: 'var(--color-text)' }}>No members found</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Try adjusting your filters</p>
              </div>
) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((m, i) => (
                  <MemberCard key={m.id} member={m}
                    style={{ animationDelay: `${i * 40}ms`, animation: 'fadeUp 0.4s ease forwards' }} />
                ))}
              </div>
            )}
          </>
        )}

        {!loading && (
          <div className="mt-8 text-center">
            <button onClick={handleReset} className="text-xs underline" style={{ color: 'var(--color-muted)' }}>
              Change sheet credentials
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
