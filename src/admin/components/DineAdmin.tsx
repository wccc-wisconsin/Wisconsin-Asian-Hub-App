import { useState } from 'react'
import { useAllRestaurants, updateRestaurantStatus, toggleFeatured, updateWeeklyDeal, type Restaurant, type Cuisine } from '../../hooks/useDine'

const CUISINES: Cuisine[] = ['Chinese', 'Vietnamese', 'Japanese', 'Korean', 'Thai', 'Filipino', 'Asian Fusion']

  const inputStyle = {
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  }

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--color-surface)', border: '1px solid rgba(251,191,36,0.2)' }}>
      <p className="text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>+ Add WDA Restaurant</p>
      <div className="flex gap-2 flex-wrap">
        {CUISINES.map(c => (
          <button key={c} onClick={() => setCuisine(c)}
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: cuisine === c ? 'rgba(251,191,36,0.15)' : 'var(--color-bg)',
              border: `1px solid ${cuisine === c ? 'rgba(251,191,36,0.4)' : 'var(--color-border)'}`,
              color: cuisine === c ? 'var(--color-gold)' : 'var(--color-muted)',
            }}>
            {c}
          </button>
        ))}
      </div>
      {[
        { p: 'Restaurant name *', v: name, s: setName },
        { p: 'City *', v: city, s: setCity },
        { p: 'Address *', v: address, s: setAddress },
        { p: 'Phone *', v: phone, s: setPhone },
        { p: 'Website', v: website, s: setWebsite },
        { p: 'Description', v: desc, s: setDesc },
      ].map(({ p, v, s }) => (
        <input key={p} type="text" placeholder={p} value={v} onChange={e => s(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
      ))}
      <div className="flex gap-2">
        <button onClick={handleAdd} disabled={!isValid || saving}
          className="flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
          style={{ background: 'var(--color-gold)', color: '#000' }}>
          {saving ? '...' : 'Add WDA Restaurant'}
        </button>
        <button onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm"
          style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

function RestaurantRow({ r }: { r: Restaurant }) {
  const [deal, setDeal]           = useState(r.weeklyDeal ?? '')
  const [editingDeal, setEditing] = useState(false)

  return (
    <div className="rounded-xl p-4 space-y-3" style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
    }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(185,28,28,0.15)', color: '#ef4444' }}>
              {r.affiliation === 'wccc' ? 'WCCC Member' : 'Community'}
            </span>
            {r.featured && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(124,58,237,0.15)', color: '#7c3aed' }}>
                ⭐ Featured
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: r.status === 'approved' ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)',
                color: r.status === 'approved' ? '#22c55e' : '#fbbf24',
              }}>
              {r.status === 'approved' ? '✅ Live' : '⏳ Pending'}
            </span>
          </div>
          <p className="font-semibold mt-1.5" style={{ color: 'var(--color-text)' }}>{r.name}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {r.cuisine} · {r.city}, WI
            {r.rating && <span style={{ color: 'var(--color-gold)' }}> · ⭐ {r.rating.toFixed(1)}</span>}
          </p>
          {r.submittedBy && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Submitted by: {r.submittedBy}</p>
          )}
        </div>
      </div>

      {/* Weekly deal */}
      <div className="flex items-center gap-2">
        {editingDeal ? (
          <>
            <input value={deal} onChange={e => setDeal(e.target.value)} placeholder="e.g. 10% off for WCCC members"
              className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
            <button onClick={async () => { await updateWeeklyDeal(r.id, deal); setEditing(false) }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--color-red)', color: '#fff' }}>
              Save
            </button>
          </>
        ) : (
          <button onClick={() => setEditing(true)}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
            🎟️ {deal || 'Add weekly deal'}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {r.status !== 'approved' && (
          <button onClick={() => updateRestaurantStatus(r.id, 'approved')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
            ✅ Approve
          </button>
        )}
        {r.status === 'approved' && (
          <button onClick={() => updateRestaurantStatus(r.id, 'pending')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
            ⏸ Unpublish
          </button>
        )}
        <button onClick={() => toggleFeatured(r.id, !r.featured)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: 'rgba(124,58,237,0.15)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.3)' }}>
          {r.featured ? '★ Unfeature' : '☆ Feature'}
        </button>
      </div>
    </div>
  )
}

export default function DineAdmin() {
  const { restaurants, loading } = useAllRestaurants()
  const pending  = restaurants.filter(r => r.status === 'pending')
  const approved = restaurants.filter(r => r.status === 'approved')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending',  count: pending.length,  color: '#fbbf24' },
          { label: 'Live',     count: approved.length, color: '#22c55e' },
          { label: 'Featured', count: restaurants.filter(r => r.featured).length, color: 'var(--color-red)' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-2xl font-bold font-display" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>



      {loading && <p className="text-sm text-center" style={{ color: 'var(--color-muted)' }}>Loading...</p>}

      {pending.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-sm mb-3" style={{ color: '#fbbf24' }}>⏳ Pending Review</h3>
          <div className="space-y-3">{pending.map(r => <RestaurantRow key={r.id} r={r} />)}</div>
        </div>
      )}

      {approved.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-sm mb-3" style={{ color: '#22c55e' }}>✅ Live Restaurants</h3>
          <div className="space-y-3">{approved.map(r => <RestaurantRow key={r.id} r={r} />)}</div>
        </div>
      )}
    </div>
  )
}
