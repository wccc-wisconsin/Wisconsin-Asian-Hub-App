import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import type { Cuisine } from '../../../hooks/useDine'

const CUISINES: Cuisine[] = [
  'Chinese', 'Vietnamese', 'Japanese', 'Korean', 'Thai', 'Filipino', 'Asian Fusion',
  'Taiwanese', 'Cantonese', 'Szechuan', 'Dim Sum', 'Malaysian', 'Indonesian',
  'Singaporean', 'Hawaiian', 'Indian', 'Bubble Tea', 'Dessert', 'BBQ', 'Seafood',
]
const CUISINE_ICONS: Record<string, string> = {
  'Chinese': '🥢', 'Vietnamese': '🍜', 'Japanese': '🍱',
  'Korean': '🥘', 'Thai': '🌶️', 'Filipino': '🍚', 'Asian Fusion': '🍽️',
  'Taiwanese': '🧋', 'Cantonese': '🥢', 'Szechuan': '🌶️', 'Dim Sum': '🥟',
  'Malaysian': '🍜', 'Indonesian': '🍚', 'Singaporean': '🦀', 'Hawaiian': '🌺',
  'Indian': '🍛', 'Bubble Tea': '🧋', 'Dessert': '🧁', 'BBQ': '🔥', 'Seafood': '🦞',
}

interface ExtractedRestaurant {
  name?: string
  cuisine?: string
  city?: string
  address?: string
  phone?: string
  website?: string
  description?: string
  photoUrl?: string
  hours?: string
}

type Phase = 'paste' | 'extracting' | 'review' | 'done'

interface SubmitRestaurantFormProps { onClose: () => void }

export default function SubmitRestaurantForm({ onClose }: SubmitRestaurantFormProps) {
  const [phase, setPhase]       = useState<Phase>('paste')
  const [pasteText, setPaste]   = useState('')
  const [extracted, setExtracted] = useState<ExtractedRestaurant>({})
  const [error, setError]       = useState('')

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

  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid var(--color-border)', background: 'var(--color-surface)',
    color: 'var(--color-text)', fontSize: '16px', outline: 'none',
    boxSizing: 'border-box' as const
  }
  const inpAI     = { ...inp, border: '1px solid rgba(22,163,74,0.4)', background: 'rgba(22,163,74,0.05)' }
  const inpMissing = { ...inp, border: '1px solid rgba(251,191,36,0.5)', background: 'rgba(251,191,36,0.05)' }
  const lbl = { fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginBottom: 4, display: 'block' as const }

  function populateFields(data: ExtractedRestaurant) {
    if (data.name)        setName(data.name)
    if (data.city)        setCity(data.city)
    if (data.address)     setAddress(data.address)
    if (data.phone)       setPhone(data.phone)
    if (data.website)     setWebsite(data.website)
    if (data.description) setDesc(data.description)
    if (data.photoUrl)    setPhoto(data.photoUrl)
    if (data.hours)       setHours(data.hours)
    if (data.cuisine) {
      const match = CUISINES.find(c =>
        c.toLowerCase() === data.cuisine!.toLowerCase() ||
        data.cuisine!.toLowerCase().includes(c.toLowerCase())
      )
      if (match) setCuisine(match)
    }
  }

  async function handleExtract() {
    if (!pasteText.trim()) { setError('Please paste some restaurant info first.'); return }
    setPhase('extracting')
    setError('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Extract restaurant details from this text and return ONLY a JSON object (no markdown):

"${pasteText}"

Return this exact structure (null for any field not found):
{
  "name": "restaurant name or null",
  "cuisine": "one of: Chinese, Vietnamese, Japanese, Korean, Thai, Filipino, Asian Fusion, or null",
  "city": "city name only or null",
  "address": "full street address or null",
  "phone": "phone number or null",
  "website": "website URL or null",
  "description": "2-3 sentence description of the restaurant or null",
  "photoUrl": "image URL if found or null",
  "hours": "business hours or null"
}

Return ONLY valid JSON, nothing else.`
          }]
        }),
      })
      const data = await res.json()
      const reply = data.reply ?? ''
      const jsonMatch = reply.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as ExtractedRestaurant
        const clean: ExtractedRestaurant = {}
        for (const [k, v] of Object.entries(parsed)) {
          if (v !== null && v !== undefined) (clean as Record<string, unknown>)[k] = v
        }
        setExtracted(clean)
        populateFields(clean)
      }
      setPhase('review')
    } catch {
      setError('Extraction failed. Please fill in manually.')
      setPhase('review')
    }
  }

  async function handleSubmit() {
    if (!name || !cuisine || !city || !address || !phone || !description || !submittedBy) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await addDoc(collection(db, 'members'), {
        name,
        cuisine,
        city,
        address,
        phone,
        website:     website || '',
        description: description || '',
        hours:       hours || '',
        category:    'Restaurant',
        wccc:        false,
        status:      'pending',
        submittedBy,
        createdAt:   serverTimestamp(),
      })
      setPhase('done')
    } catch {
      setError('Failed to submit. Please try again.')
      setSubmitting(false)
    }
  }

  const isValid = name && cuisine && city && address && phone && description && submittedBy

  if (phase === 'done') return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--color-bg)' }}>
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Submitted!</h2>
      <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: 'var(--color-muted)' }}>
        Your restaurant has been submitted for review. WCCC admin will approve it shortly.
      </p>
      <button onClick={onClose} className="px-6 py-3 rounded-full text-sm font-semibold"
        style={{ background: 'var(--color-red)', color: '#fff' }}>Back to Dine</button>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={onClose} className="text-sm" style={{ color: 'var(--color-muted)' }}>Cancel</button>
        <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
          {phase === 'paste' ? 'List Your Restaurant' : phase === 'extracting' ? 'Extracting...' : 'Review & Submit'}
        </h2>
        {phase === 'review' ? (
          <button onClick={handleSubmit} disabled={!isValid || submitting}
            className="text-sm font-semibold px-4 py-1.5 rounded-full disabled:opacity-40"
            style={{ background: 'var(--color-red)', color: '#fff' }}>
            {submitting ? '...' : 'Submit'}
          </button>
        ) : <div style={{ width: 60 }} />}
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--color-border)' }}>
        <div style={{
          height: '100%', background: 'var(--color-red)', transition: 'width 0.4s',
          width: phase === 'paste' ? '33%' : phase === 'extracting' ? '66%' : '100%'
        }} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">

        {/* ── PASTE ── */}
        {phase === 'paste' && (
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{
              background: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.15)'
            }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-red)' }}>
                🤖 Smart Paste — AI fills the form for you
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Paste your restaurant info from Google Maps, Yelp, your website, or anywhere. AI extracts all details automatically.
              </p>
            </div>

            <div>
              <label style={lbl}>Paste your restaurant info *</label>
              <textarea
                placeholder={`Paste restaurant details here...\n\nExample:\n"Golden Dragon Restaurant\n123 N Water St, Milwaukee WI 53202\n(414) 555-1234\nwww.goldendragonmke.com\nAuthentic Cantonese cuisine since 1985. Famous for dim sum and Peking duck. Open daily 11am-10pm."`}
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
                Skip — fill in manually
              </button>
            </div>
          </div>
        )}

        {/* ── EXTRACTING ── */}
        {phase === 'extracting' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="text-4xl">🤖</div>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              AI is reading your restaurant info...
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
              Extracting name, address, hours, cuisine...
            </p>
          </div>
        )}

        {/* ── REVIEW ── */}
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

            {/* Cuisine */}
            <div>
              <label style={lbl}>Cuisine Type *</label>
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

            {/* Name */}
            <div>
              <label style={lbl}>Restaurant Name * {'name' in extracted ? '' : !name ? '⚠️' : ''}</label>
              <input type="text" placeholder="Restaurant name *" value={name}
                onChange={e => setName(e.target.value)}
                style={'name' in extracted ? inpAI : !name ? inpMissing : inp} />
            </div>

            {/* Description */}
            <div>
              <label style={lbl}>About your restaurant *</label>
              <textarea placeholder="Tell your story — cuisine style, history, what makes you special..."
                value={description} onChange={e => setDesc(e.target.value)} rows={3}
                style={{ ...('description' in extracted ? inpAI : !description ? inpMissing : inp), resize: 'vertical' as const }} />
            </div>

            {/* Address & City */}
            <div>
              <label style={lbl}>Street Address *</label>
              <input type="text" placeholder="Full street address *" value={address}
                onChange={e => setAddress(e.target.value)}
                style={'address' in extracted ? inpAI : !address ? inpMissing : inp} />
            </div>
            <div>
              <label style={lbl}>City *</label>
              <input type="text" placeholder="Milwaukee" value={city}
                onChange={e => setCity(e.target.value)}
                style={'city' in extracted ? inpAI : !city ? inpMissing : inp} />
            </div>

            {/* Phone & Website */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={lbl}>Phone *</label>
                <input type="tel" placeholder="(414) 555-0000" value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={'phone' in extracted ? inpAI : !phone ? inpMissing : inp} />
              </div>
              <div>
                <label style={lbl}>Website</label>
                <input type="url" placeholder="www.restaurant.com" value={website}
                  onChange={e => setWebsite(e.target.value)}
                  style={'website' in extracted ? inpAI : inp} />
              </div>
            </div>

            {/* Hours & Photo */}
            <div>
              <label style={lbl}>Hours</label>
              <input type="text" placeholder="e.g. Mon-Sun 11am-9pm" value={hours}
                onChange={e => setHours(e.target.value)}
                style={'hours' in extracted ? inpAI : inp} />
            </div>
            <div>
              <label style={lbl}>Photo URL</label>
              <input type="url" placeholder="https://..." value={photoUrl}
                onChange={e => setPhoto(e.target.value)}
                style={'photoUrl' in extracted ? inpAI : inp} />
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
                style={!submittedBy ? inpMissing : inp} />
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                WCCC admin will verify your membership before approving
              </p>
            </div>
          </div>
        )}
      </div>


    </div>
  )
}
