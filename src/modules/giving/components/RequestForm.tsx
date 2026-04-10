import { useState } from 'react'
import { requestItem, type DonationItem } from '../../../hooks/useGiving'

interface RequestFormProps {
  item: DonationItem
  onClose: () => void
}

export default function RequestForm({ item, onClose }: RequestFormProps) {
  const [name, setName]         = useState('')
  const [business, setBusiness] = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [note, setNote]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState('')

  const isValid = name && business && email && phone

  async function handleSubmit() {
    if (!isValid) return
    setSubmitting(true)
    setError('')
    try {
      await requestItem(item.id, {
        requestedBy: name,
        requestedByBusiness: business,
        requestedByEmail: email,
        requestedByPhone: phone,
        requestNote: note,
      })
      setDone(true)
    } catch {
      setError('Failed to submit request. Please try again.')
      setSubmitting(false)
    }
  }

  const inputStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    fontSize: '16px',
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
        style={{ background: 'var(--color-bg)' }}>
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Request Submitted!
        </h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-muted)' }}>
          WCCC will review your request and connect you with the donor to arrange pickup.
        </p>
        <button onClick={onClose}
          className="px-6 py-3 rounded-full text-sm font-semibold"
          style={{ background: 'var(--color-red)', color: '#fff' }}>
          Back to Giving
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={onClose} className="text-sm" style={{ color: 'var(--color-muted)' }}>Cancel</button>
        <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Request Item</h2>
        <button onClick={handleSubmit} disabled={!isValid || submitting}
          className="text-sm font-semibold px-4 py-1.5 rounded-full disabled:opacity-40"
          style={{ background: 'var(--color-red)', color: '#fff' }}>
          {submitting ? '...' : 'Request'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Item summary */}
        <div className="rounded-xl p-4" style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)'
        }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-muted)' }}>Requesting</p>
          <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{item.title}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {item.category} · {item.city}
          </p>
        </div>

        {/* Member info */}
        <div className="rounded-xl p-4 space-y-3" style={{
          background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)'
        }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
            👤 Your WCCC Member Info
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Must be a WCCC member to request items
          </p>
          <input type="text" placeholder="Your name *"
            value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          <input type="text" placeholder="Business name *"
            value={business} onChange={e => setBusiness(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          <input type="email" placeholder="Email *"
            value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          <input type="tel" placeholder="Phone *"
            value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-muted)' }}>
            Why does your business need this item?
          </label>
          <textarea placeholder="Tell us how this item will help your business..."
            value={note} onChange={e => setNote(e.target.value)}
            rows={3} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
        </div>

        {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
      </div>
    </div>
  )
}
