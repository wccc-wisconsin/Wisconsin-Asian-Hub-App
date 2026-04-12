import { useState } from 'react'
import { rsvpEvent, type Privacy, type Attendee } from '../../../hooks/useAttendees'

interface RSVPFormProps {
  eventId: string
  eventTitle: string
  onClose: () => void
}

export default function RSVPForm({ eventId, eventTitle, onClose }: RSVPFormProps) {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [phone, setPhone]     = useState('')
  const [city, setCity]       = useState('')
  const [privacy, setPrivacy] = useState<Privacy>('public')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState('')

  const isValid = name.trim() && email.trim()

  async function handleSubmit() {
    if (!isValid) return
    setSubmitting(true)
    setError('')
    try {
      await rsvpEvent({
        eventId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        privacy,
      } as Omit<Attendee, 'id' | 'createdAt'>)
      setDone(true)
    } catch (err) {
      if (err instanceof Error && err.message === 'already_registered') {
        setError("You're already registered for this event!")
      } else {
        setError('Failed to register. Please try again.')
      }
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
        You're going!
      </h2>
      <p className="text-sm leading-relaxed mb-2 max-w-xs" style={{ color: 'var(--color-muted)' }}>
        You're registered for <strong style={{ color: 'var(--color-text)' }}>{eventTitle}</strong>
      </p>
      <p className="text-xs mb-6" style={{ color: 'var(--color-muted)' }}>
        A confirmation will be sent to {email}
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
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={onClose} className="text-sm" style={{ color: 'var(--color-muted)' }}>Cancel</button>
        <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--color-text)' }}>RSVP</h2>
        <button onClick={handleSubmit} disabled={!isValid || submitting}
          className="text-sm font-semibold px-4 py-1.5 rounded-full disabled:opacity-40"
          style={{ background: 'var(--color-red)', color: '#fff' }}>
          {submitting ? '...' : "I'm Going!"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Event summary */}
        <div className="rounded-xl p-3" style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)'
        }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>Registering for</p>
          <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-text)' }}>{eventTitle}</p>
        </div>

        {/* Name & email */}
        <div>
          <label style={lbl}>Your Name *</label>
          <input type="text" placeholder="e.g. Sarah Chen" value={name}
            onChange={e => setName(e.target.value)} style={inp} />
        </div>
        <div>
          <label style={lbl}>Email *</label>
          <input type="email" placeholder="your@email.com" value={email}
            onChange={e => setEmail(e.target.value)} style={inp} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={lbl}>Phone (optional)</label>
            <input type="tel" placeholder="(414) 555-0000" value={phone}
              onChange={e => setPhone(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>City (optional)</label>
            <input type="text" placeholder="Milwaukee" value={city}
              onChange={e => setCity(e.target.value)} style={inp} />
          </div>
        </div>

        {/* Privacy */}
        <div>
          <label style={lbl}>Show me on the attendee list as</label>
          <div className="space-y-2">
            {([
              ['public',  '🌏 Show my name', 'Your name is visible to everyone'],
              ['city',    '📍 Show my city only', 'Shows "Someone from Milwaukee is going"'],
              ['private', '🔒 Keep me private', 'Just adds to the headcount'],
            ] as [Privacy, string, string][]).map(([val, label, desc]) => (
              <button key={val} onClick={() => setPrivacy(val)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                style={{
                  background: privacy === val ? 'rgba(185,28,28,0.08)' : 'var(--color-surface)',
                  border: `1px solid ${privacy === val ? 'rgba(185,28,28,0.3)' : 'var(--color-border)'}`,
                }}>
                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: privacy === val ? 'var(--color-red)' : 'var(--color-muted)' }}>
                  {privacy === val && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-red)' }} />}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

        <p className="text-xs text-center" style={{ color: 'var(--color-muted)' }}>
          Your contact info is only shared with the event organizer and WCCC admin.
        </p>
      </div>
    </div>
  )
}
