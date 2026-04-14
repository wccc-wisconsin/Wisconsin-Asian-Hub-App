import { useState, useMemo } from 'react'
import { useMembers, type Member } from '../../hooks/useMembers'

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

function MemberCard({ member }: { member: Member }) {
  const photo = member.googlePhoto || member.photo
  const initial = member.name.charAt(0).toUpperCase()

  return (
    <article className="rounded-xl overflow-hidden" style={{
      background: 'var(--color-surface)',
      border: `1px solid ${member.wccc ? 'rgba(185,28,28,0.25)' : 'var(--color-border)'}`,
    }}>
      {/* Top accent */}
      <div className="h-1" style={{
        background: member.wccc
          ? 'linear-gradient(90deg, #B91C1C, #ef4444)'
          : 'var(--color-border)',
      }} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex gap-3 items-start">
          {/* Photo / Initial */}
          <div className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center text-lg font-bold text-white"
            style={{ background: member.wccc ? 'var(--color-red)' : 'var(--color-muted)' }}>
            {photo ? (
              <img src={photo} alt={member.name}
                className="w-full h-full object-cover" />
            ) : initial}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight truncate" style={{ color: 'var(--color-text)' }}>
              {member.name}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              {member.city}{member.city && ', '}WI
            </p>
            {member.rating && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-gold)' }}>
                ⭐ {member.rating.toFixed(1)}
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          {member.wccc && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(185,28,28,0.15)', color: '#ef4444' }}>
              WCCC Member
            </span>
          )}
          {member.category && (
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
              {member.category.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* Description */}
        {member.description && (
          <p className="text-xs" style={{
            color: 'var(--color-muted)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {member.description}
          </p>
        )}

        {/* Address */}
        {member.address && (
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            📍 {member.address}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {member.phone && (
            <a href={`tel:${member.phone}`}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium text-center"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
              📞 Call
            </a>
          )}
          {member.website && (
            <a href={member.website.startsWith('http') ? member.website : `https://${member.website}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 py-1.5 rounded-lg text-xs font-medium text-center"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
              🌐 Visit
            </a>
          )}
          {member.address && (
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(member.address)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 py-1.5 rounded-lg text-xs font-medium text-center"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
              🗺️ Map
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default function MembersModule() {
  const { members, loading } = useMembers()
  const [city, setCity]         = useState('')
  const [category, setCategory] = useState('')
  const [search, setSearch]     = useState('')
  const [wcccOnly, setWcccOnly] = useState(false)

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

      {/* Filters */}
      <div className="sticky top-14 z-40 px-4 py-3" style={{
        background: 'var(--color-bg)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search businesses..."
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

        {/* Filter row */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {/* WCCC toggle */}
          <button onClick={() => setWcccOnly(o => !o)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: wcccOnly ? 'var(--color-red)' : 'var(--color-surface)',
              color: wcccOnly ? '#fff' : 'var(--color-muted)',
              border: `1px solid ${wcccOnly ? 'var(--color-red)' : 'var(--color-border)'}`,
            }}>
            🔴 WCCC Only
          </button>

          {/* City filter */}
          <select value={city} onChange={e => setCity(e.target.value)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium outline-none"
            style={{
              background: city ? 'rgba(251,191,36,0.15)' : 'var(--color-surface)',
              color: city ? 'var(--color-gold)' : 'var(--color-muted)',
              border: `1px solid ${city ? 'rgba(251,191,36,0.4)' : 'var(--color-border)'}`,
            }}>
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Category filter */}
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium outline-none"
            style={{
              background: category ? 'rgba(251,191,36,0.15)' : 'var(--color-surface)',
              color: category ? 'var(--color-gold)' : 'var(--color-muted)',
              border: `1px solid ${category ? 'rgba(251,191,36,0.4)' : 'var(--color-border)'}`,
            }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
          <span style={{ color: 'var(--color-gold)' }}>{filtered.length}</span> results
        </p>
      </div>

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
