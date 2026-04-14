import { useState, useMemo } from 'react'
import { useMembers } from '../../hooks/useMembers'
import MemberCard from './components/MemberCard'
import FilterBar from './components/FilterBar'
import SubmitMemberForm from './components/SubmitMemberForm'

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
  const { members, loading } = useMembers()
  const [city, setCity]         = useState('')
  const [category, setCategory] = useState('')
  const [search, setSearch]     = useState('')
  const [wcccOnly, setWcccOnly] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const cities = useMemo(() =>
    [...new Set(members.map(m => m.city).filter(Boolean))].sort(), [members])

  const categories = useMemo(() =>
    [...new Set(members.map(m => m.category).filter(Boolean))].sort(), [members])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return members.filter(m => {
      if (wcccOnly && !m.wccc) return false
      if (city && m.city !== city) return false
      if (category && m.category !== category) return false
      if (q && !`${m.name} ${m.city} ${m.category} ${m.description ?? ''}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [members, city, category, search, wcccOnly])

  const wcccCount = members.filter(m => m.wccc).length

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {submitting && <SubmitMemberForm onClose={() => setSubmitting(false)} />}

      {/* Header */}
      <div className="px-4 pt-5 pb-3 text-center">
        <h1 className="font-display text-xl font-bold" style={{ color: 'var(--color-text)' }}>
          Asian Business Directory
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
          Wisconsin's Asian business community
        </p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
            <span style={{ color: 'var(--color-gold)' }}>{members.length}</span> businesses
          </span>
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
            <span style={{ color: 'var(--color-red)' }}>{wcccCount}</span> WCCC members
          </span>
        </div>
      </div>

      {/* Submit CTA */}
      <div className="px-4 mb-2">
        <button onClick={() => setSubmitting(true)}
          className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{
            background: 'rgba(185,28,28,0.08)', color: 'var(--color-red)',
            border: '1px solid rgba(185,28,28,0.25)',
          }}>
          🏢 Add Your Business
        </button>
      </div>

      <FilterBar
        cities={cities}
        categories={categories}
        selectedCity={city}
        selectedCategory={category}
        search={search}
        wcccOnly={wcccOnly}
        total={members.length}
        filtered={filtered.length}
        onCity={setCity}
        onCategory={setCategory}
        onSearch={setSearch}
        onWcccOnly={setWcccOnly}
      />

      {/* Grid */}
      <div className="px-4 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full text-center py-20">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium" style={{ color: 'var(--color-text)' }}>No businesses found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Try adjusting your filters</p>
          </div>
        )}

        {filtered.map(m => <MemberCard key={m.id} member={m} />)}
      </div>
    </div>
  )
}
