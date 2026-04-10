import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useDonationItems, type DonationItem, type ItemStatus } from '../../hooks/useGiving'

const STATUS_STYLES: Record<ItemStatus, { bg: string; color: string; border: string }> = {
  available: { bg: 'rgba(34,197,94,0.1)',   color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  requested: { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
  matched:   { bg: 'rgba(156,163,175,0.1)', color: '#9ca3af', border: 'rgba(156,163,175,0.2)' },
}

async function updateStatus(id: string, status: ItemStatus) {
  await updateDoc(doc(db, 'donations', id), { status })
}

function ItemRow({ item }: { item: DonationItem }) {
  const st = STATUS_STYLES[item.status]
  return (
    <div className="rounded-xl p-4 space-y-3" style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)'
    }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{item.title}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {item.category} · {item.city}
          </p>
        </div>
        <span className="chip text-xs flex-shrink-0" style={{
          background: st.bg, color: st.color, border: `1px solid ${st.border}`
        }}>
          {item.status}
        </span>
      </div>

      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{item.description}</p>

      {/* Donor */}
      <div className="rounded-lg p-3 space-y-1" style={{
        background: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.15)'
      }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--color-red)' }}>🎁 Donor</p>
        <p className="text-xs font-semibold" style={{ color: "var(--color-gold)" }}>{item.donorOrg}</p>
            <p className="text-xs" style={{ color: "var(--color-text)" }}>Contact: {item.donorName}</p>
        <a href={`mailto:${item.donorEmail}`} className="text-xs block" style={{ color: 'var(--color-gold)' }}>
          {item.donorEmail}
        </a>
        <a href={`tel:${item.donorPhone}`} className="text-xs block" style={{ color: 'var(--color-gold)' }}>
          {item.donorPhone}
        </a>
      </div>

      {/* Requester */}
      {item.requestedBy && (
        <div className="rounded-lg p-3 space-y-1" style={{
          background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)'
        }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>✋ Requester</p>
          <p className="text-xs" style={{ color: 'var(--color-text)' }}>
            {item.requestedBy} — {item.requestedByBusiness}
          </p>
          <a href={`mailto:${item.requestedByEmail}`} className="text-xs block" style={{ color: 'var(--color-gold)' }}>
            {item.requestedByEmail}
          </a>
          <a href={`tel:${item.requestedByPhone}`} className="text-xs block" style={{ color: 'var(--color-gold)' }}>
            {item.requestedByPhone}
          </a>
          {item.requestNote && (
            <p className="text-xs italic mt-1" style={{ color: 'var(--color-muted)' }}>"{item.requestNote}"</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {item.status !== 'available' && (
          <button onClick={() => updateStatus(item.id, 'available')}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
            Mark Available
          </button>
        )}
        {item.status !== 'matched' && (
          <button onClick={() => updateStatus(item.id, 'matched')}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(156,163,175,0.1)', color: '#9ca3af', border: '1px solid rgba(156,163,175,0.2)' }}>
            Mark Matched ✓
          </button>
        )}
      </div>
    </div>
  )
}

export default function GivingAdmin() {
  const { items, loading } = useDonationItems()
  const requested  = items.filter(i => i.status === 'requested')
  const available  = items.filter(i => i.status === 'available')
  const matched    = items.filter(i => i.status === 'matched')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Available', count: available.length, color: '#22c55e' },
          { label: 'Requested', count: requested.length, color: '#fbbf24' },
          { label: 'Matched',   count: matched.length,   color: '#9ca3af' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)'
          }}>
            <p className="text-2xl font-bold font-display" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {loading && <p className="text-sm text-center" style={{ color: 'var(--color-muted)' }}>Loading...</p>}

      {requested.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-sm mb-3" style={{ color: 'var(--color-gold)' }}>
            ⏳ Needs Action — Requested Items
          </h3>
          <div className="space-y-3">{requested.map(i => <ItemRow key={i.id} item={i} />)}</div>
        </div>
      )}

      {available.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-sm mb-3" style={{ color: '#22c55e' }}>
            ✅ Available Items
          </h3>
          <div className="space-y-3">{available.map(i => <ItemRow key={i.id} item={i} />)}</div>
        </div>
      )}

      {matched.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-sm mb-3" style={{ color: 'var(--color-muted)' }}>
            🤝 Matched Items
          </h3>
          <div className="space-y-3">{matched.map(i => <ItemRow key={i.id} item={i} />)}</div>
        </div>
      )}
    </div>
  )
}
