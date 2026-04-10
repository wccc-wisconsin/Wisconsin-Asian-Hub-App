import { useState } from 'react'
import { submitRestaurant, type Cuisine } from '../../../hooks/useDine'

const CUISINES: Cuisine[] = ['Chinese', 'Vietnamese', 'Japanese', 'Korean', 'Thai', 'Filipino', 'Asian Fusion']
const CUISINE_ICONS: Record<string, string> = {
  'Chinese': '🥢', 'Vietnamese': '🍜', 'Japanese': '🍱',
  'Korean': '🥘', 'Thai': '🌶️', 'Filipino': '🍚', 'Asian Fusion': '🍽️',
}

interface SubmitRestaurantFormProps { onClose: () => void }

export default function SubmitRestaurantForm({ onClose }: SubmitRestaurantFormProps) {
  const [name, setName]             = useState('')
  const [cuisine, setCuisine]       = useState<Cuisine | ''>('')
  const [city, setCity]             = useState('')
  const [address, setAddress]       = useState('')
  const [phone, setPhone]           = useState('')
  const [website, setWebsite]       = useState('')
  const [description, setDesc]      = useState('')
  const [photoUrl, setPhoto]        = useState('')
  const [hours, setHours]           = useState('')
  const [submittedBy, setSubmitter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState('')

  const isValid = name && cuisine && city && address && phone && description && submittedBy

  async function handleSubmit() {
    if (!isValid || !cuisine) return
    setSubmitting(true)
    setError('')
    try {
      await submitRestaurant({
        name, cuisine, city, address, phone,
        website, description, photoUrl, hours,
        affiliation: 'wccc',
        submittedBy,
      })
      setDone(true)
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

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
        style={{ background: 'var(--color-bg)' }}>
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Submitted!
        </h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-muted)' }}>
          Your restaurant has been submitted for review. WCCC admin will approve it shortly.
        </p>
        <button onClick={onClose}
          className="px-6 py-3 rounded-full text-sm font-semibold"
          style={{ background: 'var(--color-red)', color: '#fff' }}>
          Back to Dine
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={onClose} className="text-sm" style={{ color: 'var(--color-muted)' }}>Cancel</button>
        <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
          List Your Restaurant
        </h2>
        <button onClick={handleSubmit} disabled={!isValid || submitting}
          className="text-sm font-semibold px-4 py-1.5 rounded-full disabled:opacity-40"
          style={{ background: 'var(--color-red)', color: '#fff' }}>
          {submitting ? '...' : 'Submit'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Cuisine */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-muted)' }}>
            Cuisine Type *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CUISINES.map(c => (
              <button key={c} onClick={() => setCuisine(c)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all"
                style={{
                  background: cuisine === c ? 'rgba(185,28,28,0.15)' : 'var(--color-surface)',
                  border: `1px solid ${cuisine === c ? 'var(--color-red)' : 'var(--color-border)'}`,
                  color: cuisine === c ? 'var(--color-red)' : 'var(--color-muted)',
                }}>
                <span>{CUISINE_ICONS[c]}</span><span>{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Restaurant info */}
        {[
          { label: 'Restaurant Name *', value: name, set: setName, placeholder: 'e.g. Golden Dragon Restaurant' },
          { label: 'City *', value: city, set: setCity, placeholder: 'e.g. Milwaukee' },
          { label: 'Address *', value: address, set: setAddress, placeholder: 'Full street address' },
          { label: 'Phone *', value: phone, set: setPhone, placeholder: '(414) 555-0000' },
          { label: 'Website', value: website, set: setWebsite, placeholder: 'www.yourrestaurant.com' },
          { label: 'Photo URL', value: photoUrl, set: setPhoto, placeholder: 'https://...' },
          { label: 'Hours', value: hours, set: setHours, placeholder: 'e.g. Mon-Sun 11am-9pm' },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label}>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-muted)' }}>{label}</label>
            <input type="text" placeholder={placeholder} value={value}
              onChange={e => set(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>
        ))}

        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-muted)' }}>
            About your restaurant *
          </label>
          <textarea placeholder="Tell your story — cuisine style, history, what makes you special..."
            value={description} onChange={e => setDesc(e.target.value)}
            rows={4} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
        </div>

        {/* Submitter */}
        <div className="rounded-xl p-4 space-y-3" style={{
          background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)'
        }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
            👤 Your WCCC Member Name *
          </p>
          <input type="text" placeholder="Your name (must be a WCCC member)"
            value={submittedBy} onChange={e => setSubmitter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            WCCC admin will verify your membership before approving
          </p>
        </div>

        {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
      </div>
    </div>
  )
}
