import { useState } from 'react'
import { addEvent } from '../../../hooks/useEvents'

interface SubmitEventFormProps { onClose: () => void }

export default function SubmitEventForm({ onClose }: SubmitEventFormProps) {
  const [title, setTitle]         = useState('')
  const [description, setDesc]    = useState('')
  const [startDate, setStart]     = useState('')
  const [endDate, setEnd]         = useState('')
  const [location, setLocation]   = useState('')
  const [city, setCity]           = useState('')
  const [format, setFormat]       = useState<'in-person'|'virtual'|'hybrid'>('in-person')
  const [url, setUrl]             = useState('')
  const [isFree, setIsFree]       = useState(true)
  const [price, setPrice]         = useState('')
  const [organizer, setOrganizer] = useState('')
  const [contactEmail, setEmail]  = useState('')
  const [contactPhone, setPhone]  = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState('')

  const isValid = title && startDate && location && city && organizer && contactEmail

  async function handleSubmit() {
    if (!isValid) return
    setSubmitting(true)
    setError('')
    try {
      await addEvent({
        title,
        description,
        source: 'community',
        format,
        startDate,
        endDate: endDate || undefined,
        location,
        city,
        url: url || undefined,
        isFree,
        price: isFree ? undefined : price,
        organizer,
        contactEmail,
        contactPhone: contactPhone || undefined,
        status: 'pending',
      })
      setDone(true)
    } catch {
      setError('Failed to submit. Please try again.')
      setSubmitting(false)
    }
  }

  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid var(--color-border)', background: 'var(--color-surface)',
    color: 'var(--color-text)', fontSize: '16px', outline: 'none',
    boxSizing: 'border-box' as const
  }
  const lbl = { fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginBottom: 4, display: 'block' as const }

  if (done) return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--color-bg)' }}>
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
        Event Submitted!
      </h2>
      <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: 'var(--color-muted)' }}>
        Thank you! Your event is pending review. WCCC admin will approve it shortly and it will appear in the events feed.
      </p>
      <button onClick={onClose}
        className="px-6 py-3 rounded-full text-sm font-semibold"
        style={{ background: 'var(--color-red)', color: '#fff' }}>
        Back to Events
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={onClose} className="text-sm" style={{ color: 'var(--color-muted)' }}>Cancel</button>
        <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Submit an Event</h2>
        <button onClick={handleSubmit} disabled={!isValid || submitting}
          className="text-sm font-semibold px-4 py-1.5 rounded-full disabled:opacity-40"
          style={{ background: 'var(--color-red)', color: '#fff' }}>
          {submitting ? '...' : 'Submit'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Format */}
        <div>
          <label style={lbl}>Event Format *</label>
          <div className="grid grid-cols-3 gap-2">
            {([['in-person', '📍 In-Person'], ['virtual', '💻 Virtual'], ['hybrid', '🔀 Hybrid']] as const).map(([val, label]) => (
              <button key={val} onClick={() => setFormat(val)}
                className="py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: format === val ? 'rgba(185,28,28,0.15)' : 'var(--color-surface)',
                  border: `1px solid ${format === val ? 'var(--color-red)' : 'var(--color-border)'}`,
                  color: format === val ? 'var(--color-red)' : 'var(--color-muted)',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Event details */}
        <div>
          <label style={lbl}>Event Title *</label>
          <input type="text" placeholder="e.g. WCCC Spring Networking Night" value={title}
            onChange={e => setTitle(e.target.value)} style={inp} />
        </div>

        <div>
          <label style={lbl}>Description</label>
          <textarea placeholder="Tell people what to expect..." value={description}
            onChange={e => setDesc(e.target.value)} rows={3}
            style={{ ...inp, resize: 'vertical' as const }} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={lbl}>Start Date & Time *</label>
            <input type="datetime-local" value={startDate}
              onChange={e => setStart(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>End Date & Time</label>
            <input type="datetime-local" value={endDate}
              onChange={e => setEnd(e.target.value)} style={inp} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={lbl}>Location / Venue *</label>
            <input type="text" placeholder="e.g. Milwaukee Art Museum" value={location}
              onChange={e => setLocation(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>City *</label>
            <input type="text" placeholder="e.g. Milwaukee" value={city}
              onChange={e => setCity(e.target.value)} style={inp} />
          </div>
        </div>

        <div>
          <label style={lbl}>Event URL / Registration Link</label>
          <input type="url" placeholder="https://..." value={url}
            onChange={e => setUrl(e.target.value)} style={inp} />
        </div>

        {/* Pricing */}
        <div>
          <label style={lbl}>Admission</label>
          <div className="flex gap-2 mb-2">
            {([true, false] as const).map(f => (
              <button key={String(f)} onClick={() => setIsFree(f)}
                className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: isFree === f ? 'rgba(185,28,28,0.15)' : 'var(--color-surface)',
                  border: `1px solid ${isFree === f ? 'var(--color-red)' : 'var(--color-border)'}`,
                  color: isFree === f ? 'var(--color-red)' : 'var(--color-muted)',
                }}>
                {f ? '✅ Free' : '💰 Paid'}
              </button>
            ))}
          </div>
          {!isFree && (
            <input type="text" placeholder="e.g. $25 per person" value={price}
              onChange={e => setPrice(e.target.value)} style={inp} />
          )}
        </div>

        {/* Organizer contact */}
        <div className="rounded-xl p-4 space-y-3" style={{
          background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)'
        }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
            👤 Organizer Contact Info
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Required for admin review — not shown publicly
          </p>
          <input type="text" placeholder="Organization / Your name *" value={organizer}
            onChange={e => setOrganizer(e.target.value)} style={inp} />
          <input type="email" placeholder="Contact email *" value={contactEmail}
            onChange={e => setEmail(e.target.value)} style={inp} />
          <input type="tel" placeholder="Contact phone (optional)" value={contactPhone}
            onChange={e => setPhone(e.target.value)} style={inp} />
        </div>

        {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

        <div className="rounded-lg px-3 py-2.5" style={{
          background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.15)'
        }}>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            📋 Your event will be reviewed by WCCC admin before appearing in the feed. This usually takes less than 24 hours.
          </p>
        </div>
      </div>
    </div>
  )
}
