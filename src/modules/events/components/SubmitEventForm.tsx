import { useState } from 'react'
import { addEvent } from '../../../hooks/useEvents'

interface SubmitEventFormProps { onClose: () => void }

interface ExtractedEvent {
  title?: string
  startDate?: string
  endDate?: string
  location?: string
  address?: string
  city?: string
  format?: 'in-person' | 'virtual' | 'hybrid'
  isFree?: boolean
  price?: string
  url?: string
  description?: string
  organizer?: string
  contactEmail?: string
  contactPhone?: string
}

type Phase = 'paste' | 'extracting' | 'review' | 'submitting' | 'done'

export default function SubmitEventForm({ onClose }: SubmitEventFormProps) {
  const [phase, setPhase]       = useState<Phase>('paste')
  const [pasteText, setPaste]   = useState('')
  const [extracted, setExtracted] = useState<ExtractedEvent>({})
  const [error, setError]       = useState('')

  // Editable fields after extraction
  const [title, setTitle]         = useState('')
  const [startDate, setStart]     = useState('')
  const [endDate, setEnd]         = useState('')
  const [location, setLocation]   = useState('')
  const [address, setAddress]     = useState('')
  const [city, setCity]           = useState('')
  const [format, setFormat]       = useState<'in-person'|'virtual'|'hybrid'>('in-person')
  const [isFree, setIsFree]       = useState(true)
  const [price, setPrice]         = useState('')
  const [url, setUrl]             = useState('')
  const [description, setDesc]    = useState('')
  const [organizer, setOrganizer] = useState('')
  const [contactEmail, setEmail]  = useState('')
  const [contactPhone, setPhone]  = useState('')

  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid var(--color-border)', background: 'var(--color-surface)',
    color: 'var(--color-text)', fontSize: '16px', outline: 'none',
    boxSizing: 'border-box' as const
  }
  const inpAI = { ...inp, border: '1px solid rgba(22,163,74,0.4)', background: 'rgba(22,163,74,0.05)' }
  const inpMissing = { ...inp, border: '1px solid rgba(251,191,36,0.5)', background: 'rgba(251,191,36,0.05)' }
  const lbl = { fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginBottom: 4, display: 'block' as const }

  function populateFields(data: ExtractedEvent) {
    if (data.title)        setTitle(data.title)
    if (data.startDate)    setStart(data.startDate)
    if (data.endDate)      setEnd(data.endDate)
    if (data.location)     setLocation(data.location)
    if (data.address)      setAddress(data.address)
    if (data.city)         setCity(data.city)
    if (data.format)       setFormat(data.format)
    if (data.isFree !== undefined) setIsFree(data.isFree)
    if (data.price)        setPrice(data.price)
    if (data.url)          setUrl(data.url)
    if (data.description)  setDesc(data.description)
    if (data.organizer)    setOrganizer(data.organizer)
    if (data.contactEmail) setEmail(data.contactEmail)
    if (data.contactPhone) setPhone(data.contactPhone)
  }

  async function handleExtract() {
    if (!pasteText.trim()) { setError('Please paste some event text first.'); return }
    setPhase('extracting')
    setError('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Extract event details from this text and return ONLY a JSON object (no markdown, no explanation):

"${pasteText}"

Return this exact JSON structure (use null for any field not found):
{
  "title": "event title or null",
  "startDate": "YYYY-MM-DDTHH:MM format or null",
  "endDate": "YYYY-MM-DDTHH:MM format or null",
  "location": "venue name or null",
  "address": "full street address or null",
  "city": "city name only or null",
  "format": "in-person" or "virtual" or "hybrid" or null,
  "isFree": true or false or null,
  "price": "price string or null",
  "url": "registration URL or null",
  "description": "clean 2-3 sentence description or null",
  "organizer": "organization name or null",
  "contactEmail": "email or null",
  "contactPhone": "phone or null"
}

For year: if no year mentioned, use 2026. Return ONLY valid JSON.`
          }]
        }),
      })
      const data = await res.json()
      const reply = data.reply ?? ''
      const jsonMatch = reply.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as ExtractedEvent
        // Clean nulls
        const clean: ExtractedEvent = {}
        for (const [k, v] of Object.entries(parsed)) {
          if (v !== null && v !== undefined) (clean as Record<string, unknown>)[k] = v
        }
        setExtracted(clean)
        populateFields(clean)
        setPhase('review')
      } else {
        setError('Could not extract event details. Please fill in manually.')
        setPhase('review')
      }
    } catch {
      setError('Extraction failed. Please fill in manually.')
      setPhase('review')
    }
  }

  async function handleSubmit() {
    if (!title || !startDate || !city || !organizer || !contactEmail) {
      setError('Please fill in all required fields.')
      return
    }
    setPhase('submitting')
    setError('')
    try {
      const clean: Record<string, unknown> = {}
      const data = {
        title, startDate, endDate, location, address, city,
        format, isFree, price, url, description, organizer,
        contactEmail, contactPhone, source: 'community' as const, status: 'pending'
      }
      for (const [k, v] of Object.entries(data)) {
        if (v !== undefined && v !== '') clean[k] = v
      }
      await addEvent(clean as Parameters<typeof addEvent>[0])
      setPhase('done')
    } catch (err) {
      setError(`Failed: ${err instanceof Error ? err.message : String(err)}`)
      setPhase('review')
    }
  }

  const isMissing = (val: string) => !val.trim()

  // ── Done ─────────────────────────────────────────────────────────────────
  if (phase === 'done') return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--color-bg)' }}>
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Submitted!</h2>
      <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: 'var(--color-muted)' }}>
        Your event is pending review. WCCC admin will approve it shortly.
      </p>
      <button onClick={onClose} className="px-6 py-3 rounded-full text-sm font-semibold"
        style={{ background: 'var(--color-red)', color: '#fff' }}>Back to Events</button>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={onClose} className="text-sm" style={{ color: 'var(--color-muted)' }}>Cancel</button>
        <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
          {phase === 'paste' ? 'Submit an Event' : phase === 'extracting' ? 'Extracting...' : 'Review & Submit'}
        </h2>
        {phase === 'review' && (
          <button onClick={handleSubmit} disabled={phase === 'submitting'}
            className="text-sm font-semibold px-4 py-1.5 rounded-full disabled:opacity-40"
            style={{ background: 'var(--color-red)', color: '#fff' }}>
            Submit
          </button>
        )}
        {phase === 'paste' && <div style={{ width: 60 }} />}
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--color-border)' }}>
        <div style={{
          height: '100%', background: 'var(--color-red)', transition: 'width 0.4s',
          width: phase === 'paste' ? '33%' : phase === 'extracting' ? '66%' : '100%'
        }} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">

        {/* ── PHASE: PASTE ── */}
        {phase === 'paste' && (
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{
              background: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.15)'
            }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-red)' }}>
                🤖 Smart Paste — AI fills the form for you
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Paste your event announcement from email, WeChat, Facebook or anywhere. AI will extract all the details automatically — in English, Chinese or Vietnamese.
              </p>
            </div>

            <div>
              <label style={lbl}>Paste your event announcement *</label>
              <textarea
                placeholder={`Paste event text here...\n\nExample:\n"Join us May 8th at 6pm at Milwaukee Art Museum for WCCC Spring Business Mixer. Free networking event. Register at wccc.org/mixer"`}
                value={pasteText}
                onChange={e => { setPaste(e.target.value); setError('') }}
                rows={8}
                style={{ ...inp, resize: 'vertical' as const, lineHeight: 1.6 }}
              />
            </div>

            {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

            <button onClick={handleExtract} disabled={!pasteText.trim()}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'var(--color-red)', color: '#fff' }}>
              🤖 Extract with AI →
            </button>

            <div className="text-center">
              <button onClick={() => setPhase('review')}
                className="text-xs underline" style={{ color: 'var(--color-muted)' }}>
                Skip — fill in manually instead
              </button>
            </div>
          </div>
        )}

        {/* ── PHASE: EXTRACTING ── */}
        {phase === 'extracting' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="text-4xl">🤖</div>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              AI is reading your event...
            </p>
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full" style={{
                  background: 'var(--color-red)',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                }} />
              ))}
            </div>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Extracting title, date, address, contact info...
            </p>
          </div>
        )}

        {/* ── PHASE: REVIEW ── */}
        {phase === 'review' && (
          <div className="space-y-4">
            {Object.keys(extracted).length > 0 && (
              <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{
                background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)'
              }}>
                <span className="text-lg">✅</span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#16a34a' }}>
                    AI extracted {Object.keys(extracted).length} fields
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    Green = auto-filled · Yellow = needs your input
                  </p>
                </div>
              </div>
            )}

            {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

            {/* Title */}
            <div>
              <label style={lbl}>
                Event Title * {isMissing(title) && <span style={{ color: '#f59e0b' }}>⚠️ Required</span>}
              </label>
              <input type="text" placeholder="Event title *" value={title}
                onChange={e => setTitle(e.target.value)}
                style={'title' in extracted ? inpAI : isMissing(title) ? inpMissing : inp} />
            </div>

            {/* Description */}
            <div>
              <label style={lbl}>Description</label>
              <textarea placeholder="Event description..." value={description}
                onChange={e => setDesc(e.target.value)} rows={3}
                style={{ ...(extracted.description ? inpAI : inp), resize: 'vertical' as const }} />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={lbl}>
                  Start * {isMissing(startDate) && <span style={{ color: '#f59e0b' }}>⚠️</span>}
                </label>
                <input type="datetime-local" value={startDate}
                  onChange={e => setStart(e.target.value)}
                  style={'startDate' in extracted ? inpAI : isMissing(startDate) ? inpMissing : inp} />
              </div>
              <div>
                <label style={lbl}>End time</label>
                <input type="datetime-local" value={endDate}
                  onChange={e => setEnd(e.target.value)}
                  style={'endDate' in extracted ? inpAI : inp} />
              </div>
            </div>

            {/* Venue & Address */}
            <div>
              <label style={lbl}>Venue / Location name</label>
              <input type="text" placeholder="e.g. Milwaukee Art Museum" value={location}
                onChange={e => setLocation(e.target.value)}
                style={'location' in extracted ? inpAI : inp} />
            </div>
            <div>
              <label style={lbl}>Street Address</label>
              <input type="text" placeholder="e.g. 700 N Art Museum Dr, Milwaukee WI 53202" value={address}
                onChange={e => setAddress(e.target.value)}
                style={'address' in extracted ? inpAI : inp} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={lbl}>
                  City * {isMissing(city) && <span style={{ color: '#f59e0b' }}>⚠️</span>}
                </label>
                <input type="text" placeholder="Milwaukee" value={city}
                  onChange={e => setCity(e.target.value)}
                  style={'city' in extracted ? inpAI : isMissing(city) ? inpMissing : inp} />
              </div>
              <div>
                <label style={lbl}>Format</label>
                <select value={format} onChange={e => setFormat(e.target.value as typeof format)}
                  style={{ ...('format' in extracted ? inpAI : inp), cursor: 'pointer' }}>
                  <option value="in-person">📍 In-Person</option>
                  <option value="virtual">💻 Virtual</option>
                  <option value="hybrid">🔀 Hybrid</option>
                </select>
              </div>
            </div>

            {/* Admission */}
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
                  onChange={e => setPrice(e.target.value)}
                  style={'price' in extracted ? inpAI : inp} />
              )}
            </div>

            {/* URL */}
            <div>
              <label style={lbl}>Registration / Info URL</label>
              <input type="url" placeholder="https://..." value={url}
                onChange={e => setUrl(e.target.value)}
                style={'url' in extracted ? inpAI : inp} />
            </div>

            {/* Organizer contact */}
            <div className="rounded-xl p-4 space-y-3" style={{
              background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)'
            }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
                👤 Organizer Contact (for admin review — not shown publicly)
              </p>
              <input type="text" placeholder="Organization / Your name *" value={organizer}
                onChange={e => setOrganizer(e.target.value)}
                style={'organizer' in extracted ? inpAI : isMissing(organizer) ? inpMissing : inp} />
              <input type="email" placeholder="Contact email *" value={contactEmail}
                onChange={e => setEmail(e.target.value)}
                style={'contactEmail' in extracted ? inpAI : isMissing(contactEmail) ? inpMissing : inp} />
              <input type="tel" placeholder="Contact phone" value={contactPhone}
                onChange={e => setPhone(e.target.value)}
                style={'contactPhone' in extracted ? inpAI : inp} />
            </div>

            <div className="rounded-lg px-3 py-2.5" style={{
              background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.15)'
            }}>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                📋 Your event will be reviewed by WCCC admin before appearing. Usually within 24 hours.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0) }
          30% { transform: translateY(-6px) }
        }
      `}</style>
    </div>
  )
}
