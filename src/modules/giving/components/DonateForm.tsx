import { useState } from 'react'
import { submitDonation, type ItemCategory } from '../../../hooks/useGiving'

const CATEGORIES: ItemCategory[] = [
  'Equipment & Tools', 'Office Supplies', 'Furniture', 'Technology / Electronics',
]

const CATEGORY_ICONS: Record<ItemCategory, string> = {
  'Equipment & Tools': '🔧', 'Office Supplies': '📎',
  'Furniture': '🪑', 'Technology / Electronics': '💻',
}

interface DonateFormProps { onClose: () => void }

export default function DonateForm({ onClose }: DonateFormProps) {
  const [title, setTitle]         = useState('')
  const [description, setDesc]    = useState('')
  const [category, setCategory]   = useState<ItemCategory | ''>('')
  const [city, setCity]           = useState('')
  const [orgName, setOrgName]     = useState('')
  const [contactName, setContact] = useState('')
  const [email, setEmail]         = useState('')
  const [phone, setPhone]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  const isValid = title && description && category && city && orgName && contactName && email && phone

  async function handleSubmit() {
    if (!isValid || !category) return
    setSubmitting(true)
    setError('')
    try {
      await submitDonation({
        title, description, category, city,
        donorName: contactName,
        donorOrg: orgName,
        donorEmail: email,
        donorPhone: phone,
      })
      onClose()
    } catch {
      setError('Failed to submit. Please try again.')
      setSubmitting(false)
    }
  }

  const inputStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    fontSize: '16px',
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={onClose} className="text-sm" style={{ color: 'var(--color-muted)' }}>Cancel</button>
        <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Donate an Item</h2>
        <button onClick={handleSubmit} disabled={!isValid || submitting}
          className="text-sm font-semibold px-4 py-1.5 rounded-full disabled:opacity-40"
          style={{ background: 'var(--color-red)', color: '#fff' }}>
          {submitting ? '...' : 'Submit'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Category */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-muted)' }}>Category *</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all"
                style={{
                  background: category === c ? 'rgba(185,28,28,0.15)' : 'var(--color-surface)',
                  border: `1px solid ${category === c ? 'var(--color-red)' : 'var(--color-border)'}`,
                  color: category === c ? 'var(--color-red)' : 'var(--color-muted)',
                }}>
                <span>{CATEGORY_ICONS[c]}</span><span>{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Item details */}
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-muted)' }}>Item Title *</label>
          <input type="text" placeholder="e.g. Office desk chair"
            value={title} onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-muted)' }}>Description *</label>
          <textarea placeholder="Condition, dimensions, quantity, any relevant details..."
            value={description} onChange={e => setDesc(e.target.value)}
            rows={3} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-muted)' }}>City *</label>
          <input type="text" placeholder="e.g. Milwaukee"
            value={city} onChange={e => setCity(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
        </div>

        {/* Donor / Org info */}
        <div className="rounded-xl p-4 space-y-3" style={{
          background: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.15)'
        }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-red)' }}>🏢 Donor Information</p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Organization name will be shown publicly on the listing
          </p>
          <input type="text" placeholder="Organization / Nonprofit name *"
            value={orgName} onChange={e => setOrgName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          <input type="text" placeholder="Contact person name *"
            value={contactName} onChange={e => setContact(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          <input type="email" placeholder="Contact email *"
            value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          <input type="tel" placeholder="Contact phone *"
            value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
        </div>

        {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
      </div>
    </div>
  )
}
