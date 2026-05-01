import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { CATEGORY_CONFIG, BADGE_CONFIG, type TrustedResource, type ResourceCategory } from '../../modules/resources/TrustedResourcesModule'

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as ResourceCategory[]
const BADGES = [
  { value: '',                  label: 'No Badge' },
  { value: 'banking_partner',   label: '🏦 Trusted Banking Partner' },
  { value: 'legal_partner',     label: '⚖️ Trusted Legal Partner' },
  { value: 'healthcare_partner',label: '🏥 Trusted Healthcare Partner' },
  { value: 'verified',          label: '✅ WCCC Verified' },
]

function ResourceForm({ onSave, onCancel, initial }: {
  onSave: (data: Partial<TrustedResource>) => Promise<void>
  onCancel: () => void
  initial?: Partial<TrustedResource>
}) {
  const [name, setName]           = useState(initial?.name ?? '')
  const [category, setCategory]   = useState<ResourceCategory>(initial?.category ?? 'Banking & Finance')
  const [badge, setBadge]         = useState(initial?.badge ?? '')
  const [tagline, setTagline]     = useState(initial?.tagline ?? '')
  const [description, setDesc]    = useState(initial?.description ?? '')
  const [logo, setLogo]           = useState(initial?.logo ?? '')
  const [website, setWebsite]     = useState(initial?.website ?? '')
  const [email, setEmail]         = useState(initial?.email ?? '')
  const [phone, setPhone]         = useState(initial?.phone ?? '')
  const [address, setAddress]     = useState(initial?.address ?? '')
  const [memberOffer, setOffer]   = useState(initial?.memberOffer ?? '')
  const [servicesRaw, setServices] = useState((initial?.services ?? []).join('\n'))
  const [languagesRaw, setLangs]  = useState((initial?.languages ?? []).join('\n'))
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
      name, category, badge: (badge || null) as TrustedResource['badge'],
      tagline, description, logo, website, email, phone, address, memberOffer,
      services:  servicesRaw.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0),
      languages: languagesRaw.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0),
      gallery:   galleryRaw.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0),
      active: true,
    })
    setSaving(false)
  }

  return (
    <div className="rounded-xl p-4 space-y-3"
      style={{ background: 'var(--color-surface)', border: '1px solid rgba(185,28,28,0.2)' }}>
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
        {initial?.name ? `✏️ Edit — ${initial.name}` : '➕ Add Trusted Resource'}
      </p>

      {/* Category */}
      <div>
        <label style={lbl}>Category *</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => {
            const cfg = CATEGORY_CONFIG[cat]
            return (
              <button key={cat} onClick={() => setCategory(cat)}
                className="px-2 py-1 rounded-lg text-xs font-medium"
                style={{
                  background: category === cat ? cfg.bg : 'var(--color-bg)',
                  color: category === cat ? cfg.color : 'var(--color-muted)',
                  border: `1px solid ${category === cat ? cfg.color + '55' : 'var(--color-border)'}`,
                }}>
                {cfg.icon} {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Badge */}
      <div>
        <label style={lbl}>Partner Badge</label>
        <div className="flex flex-wrap gap-2">
          {BADGES.map(b => (
            <button key={b.value} onClick={() => setBadge(b.value)}
              className="px-2 py-1 rounded-lg text-xs font-medium"
              style={{
                background: badge === b.value ? 'rgba(185,28,28,0.15)' : 'var(--color-bg)',
                color: badge === b.value ? 'var(--color-red)' : 'var(--color-muted)',
                border: `1px solid ${badge === b.value ? 'rgba(185,28,28,0.3)' : 'var(--color-border)'}`,
              }}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div><label style={lbl}>Name *</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Organization or person name" style={inp} /></div>
      <div><label style={lbl}>Tagline</label><input type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Short description" style={inp} /></div>
      <div><label style={lbl}>Description</label><textarea value={description} onChange={e => setDesc(e.target.value)} rows={4} style={{ ...inp, resize: 'vertical' as const }} /></div>
      <div><label style={lbl}>🎁 Member Offer</label><textarea value={memberOffer} onChange={e => setOffer(e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' as const }} /></div>
      <div><label style={lbl}>Services (one per line)</label><textarea value={servicesRaw} onChange={e => setServices(e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' as const }} /></div>
      <div><label style={lbl}>Languages Spoken (one per line)</label><textarea value={languagesRaw} onChange={e => setLangs(e.target.value)} rows={2} placeholder={'English\nChinese\nSpanish'} style={{ ...inp, resize: 'vertical' as const }} /></div>
      <div>
        <label style={lbl}>Logo URL</label>
        <input type="url" value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://..." style={inp} />
        {logo && <img src={logo} alt="preview" style={{ height: 40, marginTop: 6, objectFit: 'contain', borderRadius: 6, background: '#f8fafc', padding: 4 }} />}
      </div>
      <div><label style={lbl}>Gallery URLs (one per line)</label><textarea value={galleryRaw} onChange={e => setGallery(e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' as const }} /></div>
      <div><label style={lbl}>Website</label><input type="url" value={website} onChange={e => setWebsite(e.target.value)} style={inp} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label style={lbl}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} /></div>
        <div><label style={lbl}>Phone</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inp} /></div>
      </div>
      <div><label style={lbl}>Address</label><input type="text" value={address} onChange={e => setAddress(e.target.value)} style={inp} /></div>

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

function ResourceRow({ resource, onEdit }: { resource: TrustedResource; onEdit: () => void }) {
  const catConfig = CATEGORY_CONFIG[resource.category]

  async function handleToggle() {
    await updateDoc(doc(db, 'trusted_resources', resource.id), { active: !resource.active })
  }
  async function handleDelete() {
    if (!confirm(`Delete ${resource.name}?`)) return
    await deleteDoc(doc(db, 'trusted_resources', resource.id))
  }

  return (
    <div className="rounded-xl p-3 space-y-2"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', opacity: resource.active ? 1 : 0.6 }}>
      <div className="flex items-center gap-3">
        {resource.logo ? (
          <img src={resource.logo} alt={resource.name} className="w-10 h-10 rounded-lg flex-shrink-0"
            style={{ objectFit: 'contain', background: '#f8fafc', padding: 2 }} />
        ) : (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xl"
            style={{ background: catConfig.bg }}>
            {catConfig.icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{resource.name}</p>
          <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
            {catConfig.icon} {resource.category}
            {resource.badge ? ` · ${BADGE_CONFIG[resource.badge]?.label}` : ''}
          </p>
        </div>
        <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{ background: resource.active ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)', color: resource.active ? '#22c55e' : '#6b7280' }}>
          {resource.active ? 'Live' : 'Hidden'}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={onEdit} className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
          ✏️ Edit
        </button>
        <button onClick={handleToggle} className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'rgba(66,133,244,0.1)', color: '#4285f4', border: '1px solid rgba(66,133,244,0.2)' }}>
          {resource.active ? '🙈 Hide' : '👁 Show'}
        </button>
        <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          🗑 Delete
        </button>
      </div>
    </div>
  )
}

export default function TrustedResourcesAdmin() {
  const [resources, setResources] = useState<TrustedResource[]>([])
  const [adding, setAdding]       = useState(false)
  const [editing, setEditing]     = useState<TrustedResource | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'trusted_resources')), snap => {
      setResources(snap.docs
        .map(d => ({ id: d.id, ...d.data() } as TrustedResource))
        .sort((a, b) => a.name.localeCompare(b.name)))
    })
    return unsub
  }, [])

  async function handleAdd(data: Partial<TrustedResource>) {
    await setDoc(doc(db, 'trusted_resources', `${Date.now()}`), {
      ...data, createdAt: new Date().toISOString(),
    })
    setAdding(false)
  }

  async function handleEdit(data: Partial<TrustedResource>) {
    if (!editing) return
    await updateDoc(doc(db, 'trusted_resources', editing.id), data)
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>🤝 Trusted Resources</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {resources.length} resources · {resources.filter(r => r.active).length} live
          </p>
        </div>
        {!adding && !editing && (
          <button onClick={() => setAdding(true)}
            className="px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--color-red)', color: '#fff' }}>
            + Add Resource
          </button>
        )}
      </div>

      {adding  && <ResourceForm onSave={handleAdd}  onCancel={() => setAdding(false)} />}
      {editing && <ResourceForm onSave={handleEdit} onCancel={() => setEditing(null)} initial={editing} />}

      {resources.length === 0 && !adding && (
        <div className="text-center py-8" style={{ color: 'var(--color-muted)' }}>
          <p className="text-3xl mb-2">🤝</p>
          <p className="text-xs">No resources yet. Click "Add Resource" to get started.</p>
        </div>
      )}

      <div className="space-y-2">
        {resources.map(r => editing?.id === r.id ? null : (
          <ResourceRow key={r.id} resource={r} onEdit={() => setEditing(r)} />
        ))}
      </div>
    </div>
  )
}
