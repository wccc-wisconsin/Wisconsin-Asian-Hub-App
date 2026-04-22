import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../lib/firebase'

interface ExtractedSponsor {
  name?: string
  tagline?: string
  description?: string
  website?: string
  email?: string
  phone?: string
  address?: string
  services?: string[]
  memberOffer?: string
}

type Phase = 'paste' | 'extracting' | 'review' | 'done'

interface SubmitSponsorFormProps {
  onClose: () => void
}

const inp = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1px solid var(--color-border)', background: 'var(--color-surface)',
  color: 'var(--color-text)', fontSize: '16px', outline: 'none',
  boxSizing: 'border-box' as const,
}
const inpAI      = { ...inp, border: '1px solid rgba(22,163,74,0.4)', background: 'rgba(22,163,74,0.05)' }
const inpMissing = { ...inp, border: '1px solid rgba(251,191,36,0.5)', background: 'rgba(251,191,36,0.05)' }
const lbl = { fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginBottom: 4, display: 'block' as const }

export default function SubmitSponsorForm({ onClose }: SubmitSponsorFormProps) {
  const [phase, setPhase]           = useState<Phase>('paste')
  const [pasteText, setPaste]       = useState('')
  const [extracted, setExtracted]   = useState<ExtractedSponsor>({})
  const [error, setError]           = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [name, setName]             = useState('')
  const [tagline, setTagline]       = useState('')
  const [description, setDesc]      = useState('')
  const [website, setWebsite]       = useState('')
  const [email, setEmail]           = useState('')
  const [phone, setPhone]           = useState('')
  const [address, setAddress]       = useState('')
  const [memberOffer, setOffer]     = useState('')
  const [servicesRaw, setServices]  = useState('')
  const [logo, setLogo]             = useState('')
  const [photo1, setPhoto1]         = useState('')
  const [photo2, setPhoto2]         = useState('')
  const [photo3, setPhoto3]         = useState('')
  const [photo4, setPhoto4]         = useState('')
  const [contactName, setContactName] = useState('')

  // All hooks above — no early returns before this point

  function populateFields(data: ExtractedSponsor) {
    if (data.name)        setName(data.name)
    if (data.tagline)     setTagline(data.tagline)
    if (data.description) setDesc(data.description)
    if (data.website)     setWebsite(data.website)
    if (data.email)       setEmail(data.email)
    if (data.phone)       setPhone(data.phone)
    if (data.address)     setAddress(data.address)
    if (data.memberOffer) setOffer(data.memberOffer)
    if (data.services)    setServices(data.services.join('\n'))
  }

  async function handleExtract() {
    if (!pasteText.trim()) { setError('Please paste some info first.'); return }
    setPhase('extracting')
    setError('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Extract business/sponsor details from this text and return ONLY a JSON object (no markdown):

"${pasteText}"

Return this exact structure (null for any field not found):
{
  "name": "company name or null",
  "tagline": "short catchy one-line description or null",
  "description": "2-3 paragraph description of the company or null",
  "website": "website URL or null",
  "email": "contact email or null",
  "phone": "phone number or null",
  "address": "full address or null",
  "services": ["service 1", "service 2", "service 3"] or null,
  "memberOffer": "any special offer or discount mentioned or null"
}

Return ONLY valid JSON, nothing else.`
          }]
        }),
      })
      const data = await res.json()
      const reply = data.reply ?? ''
      const jsonMatch = reply.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as ExtractedSponsor
        const clean: ExtractedSponsor = {}
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
    if (!name || !contactName) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await addDoc(collection(db, 'sponsors'), {
        name, tagline, description, website, email, phone, address,
        memberOffer, logo,
        services: servicesRaw.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0),
        gallery:  [photo1, photo2, photo3, photo4].filter((s: string) => s.length > 0),
        contactName,
        tier: 'community',
        active: false,
        status: 'pending',
        createdAt: serverTimestamp(),
      })
      setPhase('done')
    } catch {
      setError('Failed to submit. Please try again.')
      setSubmitting(false)
    }
  }

  const isValid = name && contactName

  // Done screen
  if (phase === 'done') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
        style={{ background: 'var(--color-bg)' }}>
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Submitted!
        </h2>
        <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: 'var(--color-muted)' }}>
          Thank you! Your sponsorship profile has been submitted for review. WCCC will be in touch shortly.
        </p>
        <button onClick={onClose} className="px-6 py-3 rounded-full text-sm font-semibold"
          style={{ background: 'var(--color-red)', color: '#fff' }}>
          Back to Sponsors
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={onClose} className="text-sm" style={{ color: 'var(--color-muted)' }}>Cancel</button>
        <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
          {phase === 'paste' ? 'Sponsor Profile' : phase === 'extracting' ? 'Extracting...' : 'Review & Submit'}
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
          width: phase === 'paste' ? '33%' : phase === 'extracting' ? '66%' : '100%',
        }} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">

        {/* PASTE */}
        {phase === 'paste' && (
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{
              background: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.15)'
            }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-red)' }}>
                🤖 Smart Paste — AI fills the form for you
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Copy your company info from your website, LinkedIn, or any source and paste below. AI extracts everything automatically.
              </p>
            </div>

            <div>
              <label style={lbl}>Paste your company info *</label>
              <textarea
                placeholder="Paste your company description, about page, or LinkedIn bio here..."
                value={pasteText}
                onChange={e => { setPaste(e.target.value); setError('') }}
                rows={8}
                style={{ ...inp, resize: 'vertical' as const, lineHeight: 1.6 }}
              />
            </div>

            {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

            <button onClick={handleExtract} disabled={!pasteText.trim()}
              className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
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

        {/* EXTRACTING */}
        {phase === 'extracting' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="text-4xl">🤖</div>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              AI is reading your company info...
            </p>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--color-red)', opacity: 0.7 + i * 0.1 }} />
              ))}
            </div>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Extracting name, description, services, contact...
            </p>
          </div>
        )}

        {/* REVIEW */}
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

            {/* Company Info */}
            <div className="space-y-3">
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>🏢 Company Info</p>

              <div>
                <label style={lbl}>Company Name *</label>
                <input type="text" placeholder="Company name" value={name}
                  onChange={e => setName(e.target.value)}
                  style={'name' in extracted ? inpAI : !name ? inpMissing : inp} />
              </div>

              <div>
                <label style={lbl}>Tagline</label>
                <input type="text" placeholder="Short catchy description" value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  style={'tagline' in extracted ? inpAI : inp} />
              </div>

              <div>
                <label style={lbl}>Description</label>
                <textarea placeholder="Full description of your company..."
                  value={description} onChange={e => setDesc(e.target.value)} rows={5}
                  style={{ ...('description' in extracted ? inpAI : inp), resize: 'vertical' as const }} />
              </div>

              <div>
                <label style={lbl}>🎁 Exclusive Offer for WCCC Members (optional)</label>
                <textarea placeholder="e.g. Free 30-min consultation · 10% discount on first engagement"
                  value={memberOffer} onChange={e => setOffer(e.target.value)} rows={2}
                  style={{ ...('memberOffer' in extracted ? inpAI : inp), resize: 'vertical' as const }} />
              </div>

              <div>
                <label style={lbl}>Services / Expertise (one per line)</label>
                <textarea placeholder={'Business Law\nReal Estate\nEmployment Law'}
                  value={servicesRaw} onChange={e => setServices(e.target.value)} rows={4}
                  style={{ ...('services' in extracted ? inpAI : inp), resize: 'vertical' as const }} />
              </div>
            </div>

            {/* Logo & Gallery */}
            <div className="space-y-3">
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>📸 Logo & Photos</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Paste public image URLs (right-click any image → Copy image address)
              </p>

              <div>
                <label style={lbl}>Logo URL</label>
                <input type="url" placeholder="https://..." value={logo}
                  onChange={e => setLogo(e.target.value)} style={inp} />
                {logo && (
                  <div className="mt-2 p-2 rounded-lg inline-block" style={{ background: 'var(--color-surface)' }}>
                    <img src={logo} alt="Logo preview" style={{ height: 48, objectFit: 'contain' }} />
                  </div>
                )}
              </div>

              {([
                { label: 'Gallery Photo 1', value: photo1, set: setPhoto1 },
                { label: 'Gallery Photo 2', value: photo2, set: setPhoto2 },
                { label: 'Gallery Photo 3', value: photo3, set: setPhoto3 },
                { label: 'Gallery Photo 4', value: photo4, set: setPhoto4 },
              ] as { label: string; value: string; set: (v: string) => void }[]).map(({ label, value, set }) => (
                <div key={label}>
                  <label style={lbl}>{label} (optional)</label>
                  <input type="url" placeholder="https://..." value={value}
                    onChange={e => set(e.target.value)} style={inp} />
                  {value && (
                    <img src={value} alt={label} className="mt-2 rounded-lg w-full object-cover"
                      style={{ maxHeight: 120 }} />
                  )}
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>📬 Contact Info</p>

              <div>
                <label style={lbl}>Website</label>
                <input type="url" placeholder="https://yourcompany.com" value={website}
                  onChange={e => setWebsite(e.target.value)}
                  style={'website' in extracted ? inpAI : inp} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={lbl}>Email</label>
                  <input type="email" placeholder="contact@company.com" value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={'email' in extracted ? inpAI : inp} />
                </div>
                <div>
                  <label style={lbl}>Phone</label>
                  <input type="tel" placeholder="(414) 555-0000" value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={'phone' in extracted ? inpAI : inp} />
                </div>
              </div>

              <div>
                <label style={lbl}>Address</label>
                <input type="text" placeholder="123 Main St, Milwaukee WI 53202" value={address}
                  onChange={e => setAddress(e.target.value)}
                  style={'address' in extracted ? inpAI : inp} />
              </div>
            </div>

            {/* Submitter */}
            <div className="rounded-xl p-4 space-y-3" style={{
              background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)'
            }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
                👤 Your Name (Sponsor Contact) *
              </p>
              <input type="text" placeholder="Your full name"
                value={contactName} onChange={e => setContactName(e.target.value)}
                style={!contactName ? inpMissing : inp} />
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                WCCC will use this to follow up before publishing
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
