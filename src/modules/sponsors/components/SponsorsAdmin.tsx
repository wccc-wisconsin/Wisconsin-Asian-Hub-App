import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Sponsor } from '../../modules/sponsors/SponsorsModule'

const TIERS = [
  { value: 'title',     label: '🌟 Title Sponsor' },
  { value: 'gold',      label: '🥇 Gold Sponsor' },
  { value: 'silver',    label: '🥈 Silver Sponsor' },
  { value: 'community', label: '🤝 Community Partner' },
]

function SponsorForm({ onSave, onCancel, initial }: {
  onSave: (data: Omit<Sponsor, 'id'>) => Promise<void>
  onCancel: () => void
  initial?: Partial<Sponsor>
}) {
  const [name, setName]           = useState(initial?.name ?? '')
  const [tier, setTier]           = useState<Sponsor['tier']>(initial?.tier ?? 'community')
  const [tagline, setTagline]     = useState(initial?.tagline ?? '')
  const [description, setDesc]    = useState(initial?.description ?? '')
  const [logo, setLogo]           = useState(initial?.logo ?? '')
  const [website, setWebsite]     = useState(initial?.website ?? '')
  const [email, setEmail]         = useState(initial?.email ?? '')
  const [phone, setPhone]         = useState(initial?.phone ?? '')
  const [address, setAddress]     = useState(initial?.address ?? '')
  const [event, setEvent]         = useState(initial?.event ?? '')
  const [memberOffer, setOffer]   = useState(initial?.memberOffer ?? '')
  const [servicesRaw, setServices] = useState((initial?.services ?? []).join('\n'))
  const [galleryRaw, setGallery]  = useState((initial?.gallery ?? []).join('\n'))
  const [saving, setSaving]       = useState(false)

  const inp = {
    width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 14, outline: 'none',
    border: '1px solid var(--color-border)', background: 'var(--color-bg)',
    color: 'var(--color-text)', boxSizing: 'border-box' as const,
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await onSave({
      name, tier, tagline, description, logo, website,
      email, phone, address, event, memberOffer,
      services: servicesRaw.split('\n').map(s => s.trim()).filter(Boolean),
      gallery:  galleryRaw.split('\n').map(s => s.trim()).filter(Boolean),
      active: true,
    })
    setSaving(false)
  }

  const lbl = { fontSize: 11, fontWeight: 500, color: 'var(--color-muted)', marginBottom: 3, display: 'block' as const }

  return (
    <div className="rounded-xl p-4 space-y-3"
      style={{ background: 'var(--color-surface)', border: '1px solid rgba(185,28,28,0.2)' }}>
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
        {initial?.name ? `✏️ Edit — ${initial.name}` : '➕ Add Sponsor'}
      </p>

      {/* Tier */}
      <div>
        <label style={lbl}>Tier *</label>
        <div className="grid grid-cols-2 gap-2">
          {TIERS.map(t => (
            <button key={t.value} onClick={() => setTier(t.value as Sponsor['tier'])}
              className="py-2 rounded-lg text-xs font-medium"
              style={{
                background: tier === t.value ? 'rgba(185,28,28,0.15)' : 'var(--color-bg)',
                color: tier === t.value ? 'var(--color-red)' : 'var(--color-muted)',
                border: `1px solid ${tier === t.value ? 'rgba(185,28,28,0.3)' : 'var(--color-border)'}`,
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Core info */}
      <div><label style={lbl}>Name *</label><input type="text" placeholder="Sponsor name" value={name} onChange={e => setName(e.target.value)} style={inp} /></div>
      <div><label style={lbl}>Tagline</label><input type="text" placeholder="Short catchy line" value={tagline} onChange={e => setTagline(e.target.value)} style={inp} /></div>
      <div>
        <label style={lbl}>Description</label>
        <textarea placeholder="Full description of the sponsor..." value={description} onChange={e => setDesc(e.target.value)} rows={4} style={{ ...inp, resize: 'vertical' as const }} />
      </div>

      {/* Member Offer */}
      <div>
        <label style={lbl}>🎁 Exclusive WCCC Member Offer</label>
        <textarea placeholder="e.g. Free 30-min consultation for WCCC members" value={memberOffer} onChange={e => setOffer(e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' as const }} />
      </div>

      {/* Services */}
      <div>
        <label style={lbl}>Services / Expertise (one per line)</label>
        <textarea placeholder={"Real Estate\nProperty Management\nInvestment Consulting"} value={servicesRaw} onChange={e => setServices(e.target.value)} rows={4} style={{ ...inp, resize: 'vertical' as const }} />
      </div>

      {/* Logo */}
      <div>
        <label style={lbl}>Logo URL</label>
        <input type="url" placeholder="https://..." value={logo} onChange={e => setLogo(e.target.value)} style={inp} />
        {logo && (
          <div className="mt-2 p-2 rounded-lg inline-block" style={{ background: 'var(--color-bg)' }}>
            <img src={logo} alt="Logo preview" style={{ height: 48, objectFit: 'contain' }} />
          </div>
        )}
      </div>

      {/* Gallery */}
      <div>
        <label style={lbl}>Gallery Photo URLs (one per line)</label>
        <textarea placeholder={"https://photo1.jpg\nhttps://photo2.jpg"} value={galleryRaw} onChange={e => setGallery(e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' as const }} />
      </div>

      {/* Contact */}
      <div className="rounded-lg p-3 space-y-2" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
        <p style={{ ...lbl, marginBottom: 6 }}>Contact Info</p>
        <input type="url"   placeholder="Website URL"   value={website} onChange={e => setWebsite(e.target.value)} style={inp} />
        <input type="email" placeholder="Email"         value={email}   onChange={e => setEmail(e.target.value)}   style={{ ...inp, marginTop: 6 }} />
        <input type="tel"   placeholder="Phone"         value={phone}   onChange={e => setPhone(e.target.value)}   style={{ ...inp, marginTop: 6 }} />
        <input type="text"  placeholder="Address"       value={address} onChange={e => setAddress(e.target.value)} style={{ ...inp, marginTop: 6 }} />
      </div>

      {/* Event */}
      <div><label style={lbl}>Associated Event</label><input type="text" placeholder="e.g. Gateway to Asia Festival 2026" value={event} onChange={e => setEvent(e.target.value)} style={inp} /></div>

      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} disabled={!name.trim() || saving}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40"
          style={{ background: 'var(--color-red)', color: '#fff' }}>
          {saving ? '...' : '💾 Save Sponsor'}
        </button>
        <button onClick={onCancel}
          className="px-4 py-2.5 rounded-lg text-sm"
          style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

function SponsorRow({ sponsor, onEdit }: { sponsor: Sponsor; onEdit: () => void }) {
  const tierColors: Record<string, string> = {
    title: '#d97706', gold: '#b45309', silver: '#6b7280', community: '#059669'
  }

  async function handleToggle() {
    await updateDoc(doc(db, 'sponsors', sponsor.id), { active: !sponsor.active })
  }
  async function handleDelete() {
    if (!confirm(`Delete ${sponsor.name}?`)) return
    await deleteDoc(doc(db, 'sponsors', sponsor.id))
  }

  return (
    <div className="rounded-xl p-3 space-y-2"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', opacity: sponsor.active ? 1 : 0.6 }}>
      <div className="flex items-center gap-3">
        {sponsor.logo ? (
          <img src={sponsor.logo} alt={sponsor.name} className="w-10 h-10 rounded-lg flex-shrink-0"
            style={{ objectFit: 'contain', background: 'var(--color-bg)', padding: 2 }} />
        ) : (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg font-bold text-white"
            style={{ background: tierColors[sponsor.tier] }}>
            {sponsor.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{sponsor.name}</p>
          <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
            {TIERS.find(t => t.value === sponsor.tier)?.label}
            {sponsor.event ? ` · ${sponsor.event}` : ''}
          </p>
        </div>
        <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{ background: sponsor.active ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)', color: sponsor.active ? '#22c55e' : '#6b7280' }}>
          {sponsor.active ? 'Live' : 'Hidden'}
        </span>
      </div>
      {sponsor.memberOffer && (
        <p className="text-xs truncate" style={{ color: '#d97706' }}>🎁 {sponsor.memberOffer}</p>
      )}
      <div className="flex gap-2 flex-wrap">
        <button onClick={onEdit}
          className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
          ✏️ Edit
        </button>
        <button onClick={handleToggle}
          className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'rgba(66,133,244,0.1)', color: '#4285f4', border: '1px solid rgba(66,133,244,0.2)' }}>
          {sponsor.active ? '🙈 Hide' : '👁 Show'}
        </button>
        <button onClick={handleDelete}
          className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          🗑 Delete
        </button>
      </div>
    </div>
  )
}

export default function SponsorsAdmin() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [adding, setAdding]     = useState(false)
  const [editing, setEditing]   = useState<Sponsor | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'sponsors')), snap => {
      setSponsors(snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Sponsor))
        .sort((a, b) => {
          const order = { title: 0, gold: 1, silver: 2, community: 3 }
          return order[a.tier] - order[b.tier]
        }))
    })
    return unsub
  }, [])

  async function handleAdd(data: Omit<Sponsor, 'id'>) {
    await setDoc(doc(db, 'sponsors', `${Date.now()}`), {
      ...data, createdAt: new Date().toISOString(),
    })
    setAdding(false)
  }

  async function handleEdit(data: Omit<Sponsor, 'id'>) {
    if (!editing) return
    await updateDoc(doc(db, 'sponsors', editing.id), data)
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>🤝 Sponsors & Partners</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {sponsors.length} sponsors · {sponsors.filter(s => s.active).length} live
          </p>
        </div>
        {!adding && !editing && (
          <button onClick={() => setAdding(true)}
            className="px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--color-red)', color: '#fff' }}>
            + Add Sponsor
          </button>
        )}
      </div>

      {adding  && <SponsorForm onSave={handleAdd}  onCancel={() => setAdding(false)} />}
      {editing && <SponsorForm onSave={handleEdit} onCancel={() => setEditing(null)} initial={editing} />}

      {sponsors.length === 0 && !adding && (
        <div className="text-center py-8" style={{ color: 'var(--color-muted)' }}>
          <p className="text-3xl mb-2">🤝</p>
          <p className="text-xs">No sponsors yet. Click "Add Sponsor" to get started.</p>
        </div>
      )}

      <div className="space-y-2">
        {sponsors.map(s =>
          editing?.id === s.id ? null :
          <SponsorRow key={s.id} sponsor={s} onEdit={() => setEditing(s)} />
        )}
      </div>
    </div>
  )
}
