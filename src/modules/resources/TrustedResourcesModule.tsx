import { useState, useEffect, useMemo } from 'react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export interface TrustedResource {
  id: string
  name: string
  category: ResourceCategory
  badge?: 'banking_partner' | 'legal_partner' | 'healthcare_partner' | 'verified' | null
  tagline: string
  description: string
  logo: string
  website: string
  email: string
  phone: string
  address: string
  services: string[]
  languages: string[]
  memberOffer: string
  gallery: string[]
  contactName: string
  active: boolean
  createdAt?: string
}

export type ResourceCategory =
  | 'Banking & Finance'
  | 'Legal'
  | 'Real Estate'
  | 'Insurance'
  | 'Healthcare'
  | 'Marketing'
  | 'IT & Technology'
  | 'Other'

export const CATEGORY_CONFIG: Record<ResourceCategory, { icon: string; color: string; bg: string }> = {
  'Banking & Finance': { icon: '🏦', color: '#0369a1', bg: 'rgba(3,105,161,0.1)'   },
  'Legal':             { icon: '⚖️', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)'  },
  'Real Estate':       { icon: '🏢', color: '#b45309', bg: 'rgba(180,83,9,0.1)'    },
  'Insurance':         { icon: '🛡️', color: '#0f766e', bg: 'rgba(15,118,110,0.1)'  },
  'Healthcare':        { icon: '🏥', color: '#dc2626', bg: 'rgba(220,38,38,0.1)'   },
  'Marketing':         { icon: '📣', color: '#d97706', bg: 'rgba(217,119,6,0.1)'   },
  'IT & Technology':   { icon: '💻', color: '#2563eb', bg: 'rgba(37,99,235,0.1)'   },
  'Other':             { icon: '🌟', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
}

export const BADGE_CONFIG = {
  banking_partner:    { label: '🏦 Trusted Banking Partner',    bg: 'rgba(3,105,161,0.15)',   color: '#0369a1', border: 'rgba(3,105,161,0.3)'   },
  legal_partner:      { label: '⚖️ Trusted Legal Partner',      bg: 'rgba(124,58,237,0.15)',  color: '#7c3aed', border: 'rgba(124,58,237,0.3)'  },
  healthcare_partner: { label: '🏥 Trusted Healthcare Partner', bg: 'rgba(220,38,38,0.15)',   color: '#dc2626', border: 'rgba(220,38,38,0.3)'   },
  verified:           { label: '✅ WCCC Verified',               bg: 'rgba(185,28,28,0.12)',   color: '#B91C1C', border: 'rgba(185,28,28,0.25)'  },
}

// ── Resource Detail Page ──────────────────────────────────────────────────────

function ResourceDetailPage({ resource, onBack }: { resource: TrustedResource; onBack: () => void }) {
  const catConfig   = CATEGORY_CONFIG[resource.category]
  const badgeConfig = resource.badge ? BADGE_CONFIG[resource.badge] : null
  const [copied, setCopied] = useState(false)

  function handleShare() {
    const text = `${resource.name} — WCCC Trusted Resource\n${resource.website || ''}`
    if (navigator.share) {
      navigator.share({ title: resource.name, text, url: resource.website || window.location.href })
    } else {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const heroGradient = `linear-gradient(135deg, ${catConfig.color}dd 0%, ${catConfig.color}88 100%)`

  return (
    <div className="pb-24">
      {/* Hero */}
      <div className="relative" style={{ background: heroGradient, minHeight: 220 }}>
        <div className="px-4 pt-4 pb-2">
          <button onClick={onBack} className="text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.85)' }}>← Back</button>
        </div>
        <div className="px-6 pb-8 flex flex-col items-center text-center gap-4">
          {resource.logo ? (
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: '#f8fafc', padding: 10 }}>
              <img src={resource.logo} alt={resource.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl shadow-xl"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
              {catConfig.icon}
            </div>
          )}
          <div>
            {badgeConfig && (
              <span className="text-xs px-3 py-1 rounded-full font-semibold mb-2 inline-block"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                {badgeConfig.label}
              </span>
            )}
            <h1 className="font-display text-2xl font-bold text-white mt-1 leading-tight">{resource.name}</h1>
            {resource.tagline && (
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>{resource.tagline}</p>
            )}
            <span className="text-xs mt-2 inline-block px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
              {catConfig.icon} {resource.category}
            </span>
          </div>
        </div>
        <div className="absolute top-4 right-4 opacity-20">
          {[0,1,2].map(r => (
            <div key={r} className="flex gap-1.5 mb-1.5">
              {[0,1,2].map(c => <div key={c} className="w-1.5 h-1.5 rounded-full bg-white" />)}
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 -mt-4 mb-4 flex gap-2">
        {resource.website && (
          <a href={resource.website} target="_blank" rel="noopener noreferrer"
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-center shadow-lg"
            style={{ background: 'var(--color-red)', color: '#fff' }}>
            🌐 Visit Website
          </a>
        )}
        <button onClick={handleShare}
          className="px-4 py-3 rounded-xl text-sm font-semibold shadow-lg"
          style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
          {copied ? '✅' : '📤'}
        </button>
      </div>

      <div className="px-4 space-y-4">
        {/* Member Offer */}
        {resource.memberOffer && (
          <div className="rounded-2xl p-4 space-y-2"
            style={{ background: 'rgba(185,28,28,0.06)', border: '2px solid rgba(185,28,28,0.2)' }}>
            <p className="text-sm font-bold" style={{ color: 'var(--color-red)' }}>🎁 Exclusive WCCC Member Offer</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{resource.memberOffer}</p>
          </div>
        )}

        {/* About */}
        {resource.description && (
          <div className="rounded-2xl p-4 space-y-2"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>About</h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{resource.description}</p>
          </div>
        )}

        {/* Services */}
        {resource.services && resource.services.filter(Boolean).length > 0 && (
          <div className="rounded-2xl p-4 space-y-3"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>💼 Services</h2>
            <div className="flex flex-wrap gap-2">
              {resource.services.filter(Boolean).map((s, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: catConfig.bg, color: catConfig.color, border: `1px solid ${catConfig.color}33` }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {resource.languages && resource.languages.filter(Boolean).length > 0 && (
          <div className="rounded-2xl p-4 space-y-2"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>🌏 Languages Spoken</h2>
            <div className="flex flex-wrap gap-2">
              {resource.languages.filter(Boolean).map((l, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full"
                  style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {resource.gallery && resource.gallery.filter(Boolean).length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>📸 Gallery</h2>
            <div className="grid grid-cols-2 gap-2">
              {resource.gallery.filter(Boolean).map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden aspect-video"
                  style={{ background: 'var(--color-surface)' }}>
                  <img src={url} alt={`${resource.name} ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="rounded-2xl p-4 space-y-3"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>📬 Contact</h2>
          <div className="space-y-2">
            {resource.phone && (
              <a href={`tel:${resource.phone}`} className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-muted)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-bg)' }}>📞</span>
                {resource.phone}
              </a>
            )}
            {resource.email && (
              <a href={`mailto:${resource.email}`} className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-muted)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-bg)' }}>📧</span>
                {resource.email}
              </a>
            )}
            {resource.address && (
              <div className="flex items-start gap-3 text-xs" style={{ color: 'var(--color-muted)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--color-bg)' }}>📍</span>
                {resource.address}
              </div>
            )}
            {resource.website && (
              <a href={resource.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-muted)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-bg)' }}>🌐</span>
                {resource.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            {resource.phone && (
              <a href={`tel:${resource.phone}`} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>📞 Call</a>
            )}
            {resource.email && (
              <a href={`mailto:${resource.email}`} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>📧 Email</a>
            )}
            {resource.website && (
              <a href={resource.website} target="_blank" rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center"
                style={{ background: catConfig.bg, color: catConfig.color, border: `1px solid ${catConfig.color}33` }}>
                🌐 Visit
              </a>
            )}
          </div>
        </div>

        {/* WCCC endorsement */}
        <div className="rounded-2xl p-4 text-center space-y-1"
          style={{ background: 'rgba(185,28,28,0.04)', border: '1px solid rgba(185,28,28,0.12)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-red)' }}>🤝 WCCC Trusted Resource</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            {resource.name} has been vetted and endorsed by the Wisconsin Chinese Chamber of Commerce as a trusted partner for our members.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Resource Card ─────────────────────────────────────────────────────────────

function ResourceCard({ resource, onOpen }: { resource: TrustedResource; onOpen: () => void }) {
  const catConfig   = CATEGORY_CONFIG[resource.category]
  const badgeConfig = resource.badge ? BADGE_CONFIG[resource.badge] : null

  return (
    <button onClick={onOpen} className="w-full rounded-2xl overflow-hidden text-left"
      style={{ background: 'var(--color-surface)', border: `1px solid ${catConfig.color}33` }}>
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${catConfig.color}, ${catConfig.color}88)` }} />
      <div className="p-4 space-y-3">
        {/* Logo banner */}
        <div className="w-full rounded-xl flex items-center justify-center"
          style={{ background: '#f8fafc', height: 72, padding: 10, border: '1px solid var(--color-border)' }}>
          {resource.logo ? (
            <img src={resource.logo} alt={resource.name}
              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          ) : (
            <span className="text-3xl">{catConfig.icon}</span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {badgeConfig && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: badgeConfig.bg, color: badgeConfig.color, border: `1px solid ${badgeConfig.border}` }}>
              {badgeConfig.label}
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: catConfig.bg, color: catConfig.color, border: `1px solid ${catConfig.color}33` }}>
            {catConfig.icon} {resource.category}
          </span>
        </div>

        {/* Name + tagline */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight" style={{ color: 'var(--color-text)' }}>{resource.name}</h3>
            {resource.tagline && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{resource.tagline}</p>
            )}
          </div>
          <span className="text-lg flex-shrink-0 mt-0.5" style={{ color: 'var(--color-muted)' }}>›</span>
        </div>

        {/* Description preview */}
        {resource.description && (
          <p className="text-xs leading-relaxed" style={{
            color: 'var(--color-muted)',
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {resource.description}
          </p>
        )}

        {/* Member offer */}
        {resource.memberOffer && (
          <div className="rounded-lg px-3 py-2"
            style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.15)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-red)' }}>
              🎁 {resource.memberOffer.slice(0, 80)}{resource.memberOffer.length > 80 ? '...' : ''}
            </p>
          </div>
        )}

        {/* Languages */}
        {resource.languages && resource.languages.filter(Boolean).length > 0 && (
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            🌏 {resource.languages.join(' · ')}
          </p>
        )}
      </div>
    </button>
  )
}

// ── Main Module ───────────────────────────────────────────────────────────────

export default function TrustedResourcesModule() {
  const [resources, setResources]       = useState<TrustedResource[]>([])
  const [loading, setLoading]           = useState(true)
  const [categoryFilter, setCategory]   = useState<ResourceCategory | 'all'>('all')
  const [selectedResource, setSelected] = useState<TrustedResource | null>(null)
  const [search, setSearch]             = useState('')

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'trusted_resources')),
      snap => {
        setResources(
          snap.docs
            .map(d => ({ id: d.id, ...d.data() } as TrustedResource))
            .filter(r => r.active !== false)
            .sort((a, b) => {
              // Badged resources first
              if (a.badge && !b.badge) return -1
              if (!a.badge && b.badge) return 1
              return a.name.localeCompare(b.name)
            })
        )
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [])

  // All hooks before early returns
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return resources.filter(r => {
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false
      if (q && !`${r.name} ${r.tagline} ${r.description} ${r.services?.join(' ')}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [resources, categoryFilter, search])

  const activeCategories = useMemo(() => {
    const cats = new Set(resources.map(r => r.category))
    return Object.keys(CATEGORY_CONFIG).filter(c => cats.has(c as ResourceCategory)) as ResourceCategory[]
  }, [resources])

  if (selectedResource) {
    return <ResourceDetailPage resource={selectedResource} onBack={() => setSelected(null)} />
  }

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          Trusted Resources
        </h1>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          WCCC-vetted partners and professionals for our members
        </p>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <input type="text" placeholder="Search resources..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: 16 }} />
      </div>

      {/* Category filter */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setCategory('all')}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: categoryFilter === 'all' ? 'var(--color-red)' : 'var(--color-surface)',
              color: categoryFilter === 'all' ? '#fff' : 'var(--color-muted)',
              border: `1px solid ${categoryFilter === 'all' ? 'var(--color-red)' : 'var(--color-border)'}`,
            }}>
            All ({resources.length})
          </button>
          {activeCategories.map(cat => {
            const cfg = CATEGORY_CONFIG[cat]
            const count = resources.filter(r => r.category === cat).length
            return (
              <button key={cat} onClick={() => setCategory(cat)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: categoryFilter === cat ? cfg.bg : 'var(--color-surface)',
                  color: categoryFilter === cat ? cfg.color : 'var(--color-muted)',
                  border: `1px solid ${categoryFilter === cat ? cfg.color + '55' : 'var(--color-border)'}`,
                }}>
                {cfg.icon} {cat} ({count})
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Loading */}
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-4 space-y-3"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="h-16 rounded-xl skeleton w-full" />
            <div className="h-3 rounded skeleton w-2/3" />
            <div className="h-2 rounded skeleton w-full" />
          </div>
        ))}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium" style={{ color: 'var(--color-text)' }}>No resources found</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              {search ? 'Try different search terms' : 'Check back soon'}
            </p>
          </div>
        )}

        {/* Resources */}
        {filtered.map(r => (
          <ResourceCard key={r.id} resource={r} onOpen={() => setSelected(r)} />
        ))}

        {/* Submit CTA */}
        {!loading && (
          <div className="rounded-2xl p-5 space-y-3 text-center"
            style={{ background: 'rgba(185,28,28,0.04)', border: '2px dashed rgba(185,28,28,0.2)' }}>
            <p className="text-3xl">🤝</p>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              Want to be listed as a Trusted Resource?
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              WCCC members and partners can apply to be featured in our Trusted Resource directory.
            </p>
            <a href="mailto:info@wisccc.org?subject=Trusted Resource Listing"
              className="inline-block px-4 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'var(--color-red)', color: '#fff' }}>
              Apply to be Listed →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
