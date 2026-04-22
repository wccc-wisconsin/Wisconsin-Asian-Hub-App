import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query } from 'firebase/firestore'
import { db } from '../../lib/firebase'

interface Sponsor {
  id: string
  name: string
  tier: 'title' | 'gold' | 'silver' | 'community'
  tagline?: string
  description?: string
  logo?: string
  website?: string
  email?: string
  phone?: string
  address?: string
  event?: string
  memberOffer?: string
  services?: string[]
  gallery?: string[]
  contactName?: string
  active: boolean
  status?: 'pending' | 'approved'
  createdAt?: string
}

const TIERS = [
  { value: 'title',     label: '🌟 Title Sponsor' },
  { value: 'gold',      label: '🥇 Gold Sponsor' },
  { value: 'silver',    label: '🥈 Silver Sponsor' },
  { value: 'community', label: '🤝 Community Partner' },
]

const TIER_ORDER: Record<string, number> = { title: 0, gold: 1, silver: 2, community: 3 }

function isPending(s: Sponsor): boolean {
  return s.status === 'pending' || s.active === false
}

function SponsorForm({ onSave, onCancel, initial }: {
  onSave: (data: Partial<Sponsor>) => Promise<void>
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
  const lbl = { fontSize: 11, fontWeight: 500, color: 'var(--color-muted)', marginBottom: 3, display: 'block' as const }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await onSave({
      name, tier, tagline, description, logo, website,
      email, phone, address, event, memberOffer,
      services: servicesRaw.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0),
      gallery:  galleryRaw.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0),
      active: true,
      status: 'approved',
    })
    setSaving(false)
  }

  return (
    <div className="rounded-xl p-4 space-y-3"
      style={{ background: 'var(--color-surface)', border: '1px solid rgba(185,28,28,0.2)' }}>
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
        {initial?.name ? `✏️ Edit — ${initial.name}` : '➕ Add Sponsor'}
      </p>

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

      <div><label style={lbl}>Name *</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Sponsor name" style={inp} /></div>
      <div><label style={lbl}>Tagline</label><input type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Short description" style={inp} /></div>
      <div><label style={lbl}>Description</label><textarea value={description} onChange={e => setDesc(e.target.value)} rows={4} style={{ ...inp, resize: 'vertical' as const }} /></div>
      <div><label style={lbl}>🎁 Member Offer</label><textarea value={memberOffer} onChange={e => setOffer(e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' as const }} /></div>
      <div><label style={lbl}>Services (one per line)</label><textarea value={servicesRaw} onChange={e => setServices(e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' as const }} /></div>
      <div>
        <label style={lbl}>Logo URL</label>
        <input type="url" value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://..." style={inp} />
        {logo && <img src={logo} alt="preview" style={{ height: 40, marginTop: 6, objectFit: 'contain', borderRadius: 6, background: 'var(--color-bg)', padding: 4 }} />}
      </div>
      <div><label style={lbl}>Gallery URLs (one per line)</label><textarea value={galleryRaw} onChange={e => setGallery(e.target.value)} rows={3} placeholder={'https://photo1.jpg\nhttps://photo2.jpg'} style={{ ...inp, resize: 'vertical' as const }} /></div>
      <div><label style={lbl}>Website</label><input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." style={inp} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label style={lbl}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} /></div>
        <div><label style={lbl}>Phone</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inp} /></div>
      </div>
      <div><label style={lbl}>Address</label><input type="text" value={address} onChange={e => setAddress(e.target.value)} style={inp} /></div>
      <div><label style={lbl}>Associated Event</label><input type="text" value={event} onChange={e => setEvent(e.target.value)} placeholder="e.g. Gateway to Asia Festival 2026" style={inp} /></div>

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={!name.trim() || saving}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40"
          style={{ background: 'var(--color-red)', color: '#fff' }}>
          {saving ? '...' : '💾 Save'}
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
  const pending = isPending(sponsor)

  async function handleApprove() {
    await updateDoc(doc(db, 'sponsors', sponsor.id), { active: true, status: 'approved' })
  }

  async function handleHide() {
    await updateDoc(doc(db, 'sponsors', sponsor.id), { active: false, status: 'approved' })
  }

  async function handleDelete() {
    if (!confirm(`Delete ${sponsor.name}?`)) return
    await deleteDoc(doc(db, 'sponsors', sponsor.id))
  }

  return (
    <div className="rounded-xl p-3 space-y-2" style={{
      background: 'var(--color-surface)',
      border: `1px solid ${pending ? 'rgba(251,191,36,0.3)' : 'var(--color-border)'}`,
      opacity: !sponsor.active && !pending ? 0.6 : 1,
    }}>
      <div className="flex items-center gap-3">
        {sponsor.logo ? (
          <img src={sponsor.logo} alt={sponsor.name} className="w-10 h-10 rounded-lg flex-shrink-0"
            style={{ objectFit: 'contain', background: 'var(--color-bg)', padding: 2 }} />
        ) : (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg font-bold text-white"
            style={{ background: '#6b7280' }}>
            {sponsor.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{sponsor.name}</p>
          <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
            {TIERS.find(t => t.value === sponsor.tier)?.label ?? sponsor.tier}
            {sponsor.event ? ` · ${sponsor.event}` : ''}
          </p>
          {sponsor.contactName && (
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Contact: {sponsor.contactName}</p>
          )}
        </div>
        <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: pending ? 'rgba(251,191,36,0.15)' : sponsor.active ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)',
            color: pending ? '#d97706' : sponsor.active ? '#22c55e' : '#6b7280',
          }}>
          {pending ? 'Pending' : sponsor.active ? 'Live' : 'Hidden'}
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
        {pending && (
          <button onClick={handleApprove}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
            ✅ Approve & Publish
          </button>
        )}
        {!pending && sponsor.active && (
          <button onClick={handleHide}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(107,114,128,0.1)', color: '#6b7280', border: '1px solid rgba(107,114,128,0.2)' }}>
            🙈 Hide
          </button>
        )}
        {!pending && !sponsor.active && (
          <button onClick={handleApprove}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(66,133,244,0.1)', color: '#4285f4', border: '1px solid rgba(66,133,244,0.2)' }}>
            👁 Show
          </button>
        )}
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
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Sponsor))
      docs.sort((a, b) => {
        // Pending first
        const aPending = isPending(a) ? 0 : 1
        const bPending = isPending(b) ? 0 : 1
        if (aPending !== bPending) return aPending - bPending
        // Then by tier
        return (TIER_ORDER[a.tier] ?? 99) - (TIER_ORDER[b.tier] ?? 99)
      })
      setSponsors(docs)
    })
    return unsub
  }, [])

  async function handleAdd(data: Partial<Sponsor>) {
    await setDoc(doc(db, 'sponsors', `${Date.now()}`), {
      ...data, createdAt: new Date().toISOString(),
    })
    setAdding(false)
  }

  async function handleEdit(data: Partial<Sponsor>) {
    if (!editing) return
    await updateDoc(doc(db, 'sponsors', editing.id), data)
    setEditing(null)
  }

  const pending  = sponsors.filter(s => isPending(s))
  const approved = sponsors.filter(s => !isPending(s))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>🤝 Sponsors & Partners</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {sponsors.length} total · {approved.filter(s => s.active).length} live
            {pending.length > 0 && <span style={{ color: '#d97706' }}> · {pending.length} pending</span>}
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

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold" style={{ color: '#d97706' }}>⏳ Pending Review ({pending.length})</p>
          {pending.map(s => editing?.id === s.id ? null : (
            <SponsorRow key={s.id} sponsor={s} onEdit={() => setEditing(s)} />
          ))}
        </div>
      )}

      {/* Approved */}
      {approved.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>
            All Sponsors ({approved.length})
          </p>
          {approved.map(s => editing?.id === s.id ? null : (
            <SponsorRow key={s.id} sponsor={s} onEdit={() => setEditing(s)} />
          ))}
        </div>
      )}

      {sponsors.length === 0 && !adding && (
        <div className="text-center py-8" style={{ color: 'var(--color-muted)' }}>
          <p className="text-3xl mb-2">🤝</p>
          <p className="text-xs">No sponsors yet. Click "Add Sponsor" to get started.</p>
        </div>
      )}
    </div>
  )
}
