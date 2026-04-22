import { useState, useEffect, useMemo } from 'react'
import SubmitSponsorForm from './components/SubmitSponsorForm'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export interface Sponsor {
  id: string
  name: string
  tier: 'title' | 'gold' | 'silver' | 'community'
  tagline: string
  description: string
  logo: string
  website: string
  email: string
  phone: string
  address: string
  event: string
  services: string[]
  gallery: string[]
  memberOffer: string
  active: boolean
  createdAt?: string
}

export const TIER_CONFIG = {
  title: {
    label:      '🌟 Title Sponsor',
    gradient:   'linear-gradient(135deg, #92400e, #d97706, #fbbf24)',
    badge:      { bg: 'rgba(251,191,36,0.2)', color: '#d97706', border: 'rgba(251,191,36,0.4)' },
    cardBorder: 'rgba(251,191,36,0.4)',
    heroBg:     'linear-gradient(135deg, #78350f 0%, #d97706 50%, #fbbf24 100%)',
  },
  gold: {
    label:      '🥇 Gold Sponsor',
    gradient:   'linear-gradient(135deg, #78350f, #b45309, #d97706)',
    badge:      { bg: 'rgba(217,119,6,0.15)', color: '#b45309', border: 'rgba(217,119,6,0.3)' },
    cardBorder: 'rgba(217,119,6,0.3)',
    heroBg:     'linear-gradient(135deg, #451a03 0%, #b45309 50%, #d97706 100%)',
  },
  silver: {
    label:      '🥈 Silver Sponsor',
    gradient:   'linear-gradient(135deg, #374151, #6b7280, #9ca3af)',
    badge:      { bg: 'rgba(107,114,128,0.15)', color: '#6b7280', border: 'rgba(107,114,128,0.3)' },
    cardBorder: 'rgba(107,114,128,0.25)',
    heroBg:     'linear-gradient(135deg, #111827 0%, #374151 50%, #6b7280 100%)',
  },
  community: {
    label:      '🤝 Community Partner',
    gradient:   'linear-gradient(135deg, #065f46, #059669, #34d399)',
    badge:      { bg: 'rgba(5,150,105,0.12)', color: '#059669', border: 'rgba(5,150,105,0.25)' },
    cardBorder: 'rgba(5,150,105,0.25)',
    heroBg:     'linear-gradient(135deg, #022c22 0%, #065f46 50%, #059669 100%)',
  },
}

// ── Sponsor Detail (Luxury Page) ──────────────────────────────────────────────

function SponsorDetailPage({ sponsor, onBack }: { sponsor: Sponsor; onBack: () => void }) {
  const config = TIER_CONFIG[sponsor.tier]
  const [copied, setCopied] = useState(false)

  function handleShare() {
    const text = `${sponsor.name} — WCCC Sponsor\n${sponsor.website || ''}`
    if (navigator.share) {
      navigator.share({ title: sponsor.name, text, url: sponsor.website || window.location.href })
    } else {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="pb-24">
      {/* Hero */}
      <div className="relative" style={{ background: config.heroBg, minHeight: 220 }}>
        {/* Back button */}
        <div className="px-4 pt-4 pb-2">
          <button onClick={onBack} className="text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.85)' }}>
            ← Back
          </button>
        </div>

        {/* Logo + Name */}
        <div className="px-6 pb-8 flex flex-col items-center text-center gap-4">
          {sponsor.logo ? (
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: 'rgba(255,255,255,0.95)', padding: 8 }}>
              <img src={sponsor.logo} alt={sponsor.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-xl"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
              {sponsor.name.charAt(0)}
            </div>
          )}
          <div>
            <span className="text-xs px-3 py-1 rounded-full font-semibold mb-2 inline-block"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)' }}>
              {config.label}
            </span>
            <h1 className="font-display text-2xl font-bold text-white mt-1 leading-tight">
              {sponsor.name}
            </h1>
            {sponsor.tagline && (
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {sponsor.tagline}
              </p>
            )}
            {sponsor.event && (
              <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                📅 Sponsor of {sponsor.event}
              </p>
            )}
          </div>
        </div>

        {/* Decorative dots */}
        <div className="absolute top-4 right-4 opacity-20">
          {[0,1,2].map(r => (
            <div key={r} className="flex gap-1.5 mb-1.5">
              {[0,1,2].map(c => (
                <div key={c} className="w-1.5 h-1.5 rounded-full bg-white" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 -mt-4 mb-4 flex gap-2">
        {sponsor.website && (
          <a href={sponsor.website} target="_blank" rel="noopener noreferrer"
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
        {/* Member Offer — highlight box */}
        {sponsor.memberOffer && (
          <div className="rounded-2xl p-4 space-y-2"
            style={{ background: config.badge.bg, border: `2px solid ${config.badge.border}` }}>
            <p className="text-sm font-bold" style={{ color: config.badge.color }}>
              🎁 Exclusive WCCC Member Offer
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
              {sponsor.memberOffer}
            </p>
          </div>
        )}

        {/* About */}
        {sponsor.description && (
          <div className="rounded-2xl p-4 space-y-2"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>About</h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              {sponsor.description}
            </p>
          </div>
        )}

        {/* Services */}
        {sponsor.services && sponsor.services.filter(Boolean).length > 0 && (
          <div className="rounded-2xl p-4 space-y-3"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              💼 Services & Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {sponsor.services.filter(Boolean).map((s, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: config.badge.bg, color: config.badge.color, border: `1px solid ${config.badge.border}` }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Photo Gallery */}
        {sponsor.gallery && sponsor.gallery.filter(Boolean).length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>📸 Gallery</h2>
            <div className="grid grid-cols-2 gap-2">
              {sponsor.gallery.filter(Boolean).map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden aspect-video"
                  style={{ background: 'var(--color-surface)' }}>
                  <img src={url} alt={`${sponsor.name} ${i + 1}`}
                    className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact info */}
        <div className="rounded-2xl p-4 space-y-3"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>📬 Contact</h2>
          <div className="space-y-2">
            {sponsor.phone && (
              <a href={`tel:${sponsor.phone}`} className="flex items-center gap-3 text-xs"
                style={{ color: 'var(--color-muted)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--color-bg)' }}>📞</span>
                {sponsor.phone}
              </a>
            )}
            {sponsor.email && (
              <a href={`mailto:${sponsor.email}`} className="flex items-center gap-3 text-xs"
                style={{ color: 'var(--color-muted)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--color-bg)' }}>📧</span>
                {sponsor.email}
              </a>
            )}
            {sponsor.address && (
              <div className="flex items-start gap-3 text-xs"
                style={{ color: 'var(--color-muted)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--color-bg)' }}>📍</span>
                {sponsor.address}
              </div>
            )}
            {sponsor.website && (
              <a href={sponsor.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-xs"
                style={{ color: 'var(--color-muted)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--color-bg)' }}>🌐</span>
                {sponsor.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            {sponsor.phone && (
              <a href={`tel:${sponsor.phone}`}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                📞 Call
              </a>
            )}
            {sponsor.email && (
              <a href={`mailto:${sponsor.email}`}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                📧 Email
              </a>
            )}
            {sponsor.website && (
              <a href={sponsor.website} target="_blank" rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center"
                style={{ background: config.badge.bg, color: config.badge.color, border: `1px solid ${config.badge.border}` }}>
                🌐 Visit
              </a>
            )}
          </div>
        </div>

        {/* Thank you note */}
        <div className="rounded-2xl p-4 text-center space-y-1"
          style={{ background: 'rgba(185,28,28,0.04)', border: '1px solid rgba(185,28,28,0.12)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-red)' }}>
            🙏 Thank You
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            {sponsor.name} makes WCCC's mission possible. We are grateful for their continued support of Wisconsin's Asian business community.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Sponsor Card (List View) ──────────────────────────────────────────────────

function SponsorCard({ sponsor, onOpen }: { sponsor: Sponsor; onOpen: () => void }) {
  const config = TIER_CONFIG[sponsor.tier]
  return (
    <button onClick={onOpen} className="w-full rounded-2xl overflow-hidden text-left"
      style={{ background: 'var(--color-surface)', border: `1px solid ${config.cardBorder}` }}>
      <div className="h-1" style={{ background: config.gradient }} />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          {sponsor.logo ? (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-bg)', padding: 4 }}>
              <img src={sponsor.logo} alt={sponsor.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
              style={{ background: config.gradient }}>
              {sponsor.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold inline-block mb-1"
              style={{ background: config.badge.bg, color: config.badge.color, border: `1px solid ${config.badge.border}` }}>
              {config.label}
            </span>
            <h3 className="font-semibold text-sm leading-tight" style={{ color: 'var(--color-text)' }}>
              {sponsor.name}
            </h3>
            {sponsor.tagline && (
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>
                {sponsor.tagline}
              </p>
            )}
          </div>
          <span className="text-lg flex-shrink-0" style={{ color: 'var(--color-muted)' }}>›</span>
        </div>

        {sponsor.description && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--color-muted)' }}>
            {sponsor.description}
          </p>
        )}

        {sponsor.memberOffer && (
          <div className="rounded-lg px-3 py-2"
            style={{ background: config.badge.bg, border: `1px solid ${config.badge.border}` }}>
            <p className="text-xs font-semibold" style={{ color: config.badge.color }}>
              🎁 {sponsor.memberOffer.slice(0, 80)}{sponsor.memberOffer.length > 80 ? '...' : ''}
            </p>
          </div>
        )}

        {sponsor.event && (
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>📅 {sponsor.event}</p>
        )}
      </div>
    </button>
  )
}

// ── Main Module ───────────────────────────────────────────────────────────────

export default function SponsorsModule() {
  const [sponsors, setSponsors]       = useState<Sponsor[]>([])
  const [loading, setLoading]         = useState(true)
  const [tierFilter, setTierFilter]   = useState<'all' | Sponsor['tier']>('all')
  const [selectedSponsor, setSelected] = useState<Sponsor | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'sponsors')),
      snap => {
        const all = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Sponsor))
          .filter(s => s.active !== false)
          .sort((a, b) => {
            const order = { title: 0, gold: 1, silver: 2, community: 3 }
            return order[a.tier] - order[b.tier]
          })
        setSponsors(all)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [])

  // All hooks must be before any early returns
  const filtered = useMemo(() => {
    if (tierFilter === 'all') return sponsors
    return sponsors.filter(s => s.tier === tierFilter)
  }, [sponsors, tierFilter])

  const counts = {
    all:       sponsors.length,
    title:     sponsors.filter(s => s.tier === 'title').length,
    gold:      sponsors.filter(s => s.tier === 'gold').length,
    silver:    sponsors.filter(s => s.tier === 'silver').length,
    community: sponsors.filter(s => s.tier === 'community').length,
  }

  const grouped = useMemo(() => {
    const tiers: Sponsor['tier'][] = ['title', 'gold', 'silver', 'community']
    return tiers
      .map(tier => ({ tier, sponsors: filtered.filter(s => s.tier === tier) }))
      .filter(g => g.sponsors.length > 0)
  }, [filtered])

  // Early returns after all hooks
  if (submitting) return <SubmitSponsorForm onClose={() => setSubmitting(false)} />

  if (selectedSponsor) {
    return <SponsorDetailPage sponsor={selectedSponsor} onBack={() => setSelected(null)} />
  }

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          Sponsors & Partners
        </h1>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Thank you to our generous sponsors who make WCCC possible
        </p>
      </div>

      {/* Sponsor CTA */}
      <div className="px-4 mb-2">
        <button onClick={() => setSubmitting(true)}
          className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ background: 'rgba(185,28,28,0.08)', color: 'var(--color-red)', border: '1px solid rgba(185,28,28,0.2)' }}>
          🤝 Submit Your Sponsor Profile
        </button>
      </div>

      {/* Tier filter */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {([
            ['all',       'All'],
            ['title',     '🌟 Title'],
            ['gold',      '🥇 Gold'],
            ['silver',    '🥈 Silver'],
            ['community', '🤝 Community'],
          ] as const).map(([val, label]) => {
            const count = counts[val as keyof typeof counts]
            if (val !== 'all' && count === 0) return null
            return (
              <button key={val} onClick={() => setTierFilter(val as typeof tierFilter)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: tierFilter === val ? 'var(--color-red)' : 'var(--color-surface)',
                  color: tierFilter === val ? '#fff' : 'var(--color-muted)',
                  border: `1px solid ${tierFilter === val ? 'var(--color-red)' : 'var(--color-border)'}`,
                }}>
                {label}
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                  style={{
                    background: tierFilter === val ? 'rgba(255,255,255,0.25)' : 'var(--color-bg)',
                    color: tierFilter === val ? '#fff' : 'var(--color-muted)',
                  }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Loading */}
        {loading && Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-4 space-y-3"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-xl skeleton flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 rounded skeleton w-2/3" />
                <div className="h-2 rounded skeleton w-1/2" />
              </div>
            </div>
            <div className="h-2 rounded skeleton w-full" />
            <div className="h-2 rounded skeleton w-4/5" />
          </div>
        ))}

        {/* Empty */}
        {!loading && sponsors.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🤝</p>
            <p className="font-medium" style={{ color: 'var(--color-text)' }}>No sponsors yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Sponsors will appear here once added by the admin
            </p>
          </div>
        )}

        {/* Grouped by tier */}
        {!loading && grouped.map(({ tier, sponsors: tierSponsors }) => (
          <div key={tier}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                {TIER_CONFIG[tier].label}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: TIER_CONFIG[tier].badge.bg,
                  color: TIER_CONFIG[tier].badge.color,
                  border: `1px solid ${TIER_CONFIG[tier].badge.border}`,
                }}>
                {tierSponsors.length}
              </span>
            </div>
            <div className="space-y-3">
              {tierSponsors.map(s => (
                <SponsorCard key={s.id} sponsor={s} onOpen={() => setSelected(s)} />
              ))}
            </div>
          </div>
        ))}

        {/* Become a Sponsor CTA */}
        {!loading && (
          <div className="rounded-2xl p-5 space-y-3 text-center"
            style={{ background: 'rgba(185,28,28,0.04)', border: '2px dashed rgba(185,28,28,0.2)' }}>
            <p className="text-3xl">🤝</p>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              Become a WCCC Sponsor
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Partner with Wisconsin's leading Asian business community. Sponsorship opportunities available for events, programs, and digital platforms.
            </p>
            <div className="flex gap-2">
              <a href="mailto:info@wisccc.org?subject=Sponsorship Inquiry"
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center"
                style={{ background: 'var(--color-red)', color: '#fff' }}>
                📧 Contact Us
              </a>
              <a href="https://wisccc.org" target="_blank" rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center"
                style={{ background: 'rgba(185,28,28,0.1)', color: 'var(--color-red)', border: '1px solid rgba(185,28,28,0.2)' }}>
                🌐 Learn More
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
