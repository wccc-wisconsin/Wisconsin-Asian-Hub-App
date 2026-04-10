import { useState } from 'react'
import { useAllRestaurants, updateRestaurantStatus, toggleFeatured, updateWeeklyDeal, submitRestaurant, type Restaurant, type Cuisine } from '../../hooks/useDine'

const CUISINES: Cuisine[] = ['Chinese', 'Vietnamese', 'Japanese', 'Korean', 'Thai', 'Filipino', 'Asian Fusion']

function RestaurantRow({ r }: { r: Restaurant }) {
  const [deal, setDeal]         = useState(r.weeklyDeal ?? '')
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)

  async function saveDeal() {
    setSaving(true)
    await updateWeeklyDeal(r.id, deal)
    setEditing(false)
    setSaving(false)
  }

  return (
    <div className="rounded-xl p-4 space-y-3" style={{
      background: 'var(--color-surface)', border: `1px solid ${r.status === 'pending' ? 'rgba(251,191,36,0.3)' : 'var(--color-border)'}`
    }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="chip text-xs" style={{
              background: r.affiliation === 'wccc' ? 'rgba(185,28,28,0.12)' : 'rgba(251,191,36,0.12)',
              color: r.affiliation === 'wccc' ? 'var(--color-red)' : 'var(--color-gold)',
              border: `1px solid ${r.affiliation === 'wccc' ? 'rgba(185,28,28,0.3)' : 'rgba(251,191,36,0.3)'}`,
            }}>
              {r.affiliation === 'wccc' ? '🔴 WCCC' : '🟡 WDA'}
            </span>
            {r.featured && (
              <span className="chip text-xs" style={{
                background: 'rgba(185,28,28,0.12)', color: 'var(--color-red)',
                border: '1px solid rgba(185,28,28,0.3)'
              }}>⭐ Featured</span>
            )}
            <span className="chip text-xs" style={{
              background: r.status === 'pending' ? 'rgba(251,191,36,0.1)' : r.status === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: r.status === 'pending' ? '#fbbf24' : r.status === 'approved' ? '#22c55e' : '#ef4444',
              border: `1px solid ${r.status === 'pending' ? 'rgba(251,191,36,0.3)' : r.status === 'approved' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {r.status}
            </span>
          </div>
          <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{r.name}</p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            {r.cuisine} · {r.city} {r.submittedBy ? `· by ${r.submittedBy}` : ''}
          </p>
        </div>
      </div>

      {/* Weekly deal editor — WCCC only */}
      {r.affiliation === 'wccc' && r.status === 'approved' && (
        <div>
          {editing ? (
            <div className="flex gap-2">
              <input type="text" value={deal} onChange={e => setDeal(e.target.value)}
                placeholder="e.g. 10% off for WCCC members"
                className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: '16px' }} />
              <button onClick={saveDeal} disabled={saving}
                className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-40"
                style={{ background: 'var(--color-red)', color: '#fff' }}>
                {saving ? '...' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)} className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--color-surface)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-xs flex-1" style={{ color: r.weeklyDeal ? 'var(--color-gold)' : 'var(--color-muted)' }}>
                🎟️ {r.weeklyDeal || 'No weekly deal set'}
              </p>
              <button onClick={() => setEditing(true)} className="text-xs px-2 py-1 rounded"
                style={{ color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                Edit deal
              </button>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {r.status === 'pending' && (
          <>
            <button onClick={() => updateRestaurantStatus(r.id, 'approved')}
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
              ✅ Approve
            </button>
            <button onClick={() => updateRestaurantStatus(r.id, 'rejected')}
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              ❌ Reject
            </button>
          </>
        )}
        {r.status === 'approved' && r.affiliation === 'wccc' && (
          <button onClick={() => toggleFeatured(r.id, !r.featured)}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{
              background: r.featured ? 'rgba(185,28,28,0.15)' : 'rgba(251,191,36,0.1)',
              color: r.featured ? 'var(--color-red)' : 'var(--color-gold)',
              border: `1px solid ${r.featured ? 'rgba(185,28,28,0.3)' : 'rgba(251,191,36,0.3)'}`,
            }}>
            {r.featured ? '⭐ Unfeature' : '⭐ Set as Featured'}
          </button>
        )}
        {r.status === 'approved' && (
          <button onClick={() => updateRestaurantStatus(r.id, 'rejected')}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            Remove
          </button>
        )}
      </div>
    </div>
  )
}

// Add WDA restaurant form
function AddWDAForm({ onClose }: { onClose: () => void }) {
  const [name, setName]       = useState('')
  const [cuisine, setCuisine] = useState<Cuisine | ''>('')
  const [city, setCity]       = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone]     = useState('')
  const [website, setWebsite] = useState('')
  const [desc, setDesc]       = useState('')
  const [saving, setSaving]   = useState(false)

  const isValid = name && cuisine && city && address && phone

  async function handleAdd() {
    if (!isValid || !cuisine) return
    setSaving(true)
    await submitRestaurant({
      name, cuisine, city, address, phone, website,
      description: desc, affiliation: 'wda',
    })
    // auto-approve WDA restaurants added by admin
    onClose()
  }

  const inputStyle = {
    background: 'var(--color-bg)', border: '1px solid var(--color-border)',
    color: 'var(--color-text)', fontSize: '16px',
  }

  return (
    <div className="rounded-xl p-4 space-y-3" style={{
      background: 'var(--color-surface)', border: '1px solid rgba(251,191,36,0.2)'
    }}>
      <p className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
        🟡 Add Wisconsin Dinner Association Restaurant
      </p>
      <div className="grid grid-cols-2 gap-2">
        {CUISINES.map(c => (
          <button key={c} onClick={() => setCuisine(c)}
            className="text-xs px-2 py-1.5 rounded-lg text-left transition-all"
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

export default function DineAdmin() {
  const { restaurants, loading } = useAllRestaurants()
  const [showAddWDA, setShowAddWDA] = useState(false)

  const pending  = restaurants.filter(r => r.status === 'pending')
  const approved = restaurants.filter(r => r.status === 'approved')

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending',  count: pending.length,  color: '#fbbf24' },
          { label: 'Live',     count: approved.length, color: '#22c55e' },
          { label: 'Featured', count: restaurants.filter(r => r.featured).length, color: 'var(--color-red)' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)'
          }}>
            <p className="text-2xl font-bold font-display" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add WDA restaurant */}
      {showAddWDA
        ? <AddWDAForm onClose={() => setShowAddWDA(false)} />
        : (
          <button onClick={() => setShowAddWDA(true)}
            className="w-full py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--color-gold)', border: '1px solid rgba(251,191,36,0.2)' }}>
            + Add Wisconsin Dinner Association Restaurant
          </button>
        )
      }

      {loading && <p className="text-sm text-center" style={{ color: 'var(--color-muted)' }}>Loading...</p>}

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-sm mb-3" style={{ color: '#fbbf24' }}>
            ⏳ Pending Review
          </h3>
          <div className="space-y-3">{pending.map(r => <RestaurantRow key={r.id} r={r} />)}</div>
        </div>
      )}

      {/* Approved */}
      {approved.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-sm mb-3" style={{ color: '#22c55e' }}>
            ✅ Live Restaurants
          </h3>
          <div className="space-y-3">{approved.map(r => <RestaurantRow key={r.id} r={r} />)}</div>
        </div>
      )}
    </div>
  )
}
