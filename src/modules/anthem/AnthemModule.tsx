import { useState } from 'react'

const PASSWORD = 'rita2026'

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [shaking, setShake] = useState(false)

  function handleSubmit() {
    if (input === PASSWORD) { onUnlock() }
    else { setError(true); setShake(true); setTimeout(() => setShake(false), 500) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ padding: '6px 14px', borderRadius: 8, background: '#B91C1C', color: '#fff', fontSize: 13, fontWeight: 600 }}>亚 WCCC</div>
          <span style={{ color: 'var(--color-muted)' }}>×</span>
          <div style={{ padding: '6px 14px', borderRadius: 8, background: '#1a5fa8', color: '#fff', fontSize: 13, fontWeight: 600 }}>Anthem</div>
        </div>
        <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>Partnership Preview</h2>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 24, lineHeight: 1.6 }}>This page is shared for review only.</p>
        <div style={{ animation: shaking ? 'shake 0.5s ease' : 'none' }}>
          <input type="password" placeholder="Enter preview password" value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${error ? '#ef4444' : 'var(--color-border)'}`, background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 16, textAlign: 'center', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
          {error && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>Incorrect password.</p>}
          <button onClick={handleSubmit} style={{ width: '100%', padding: '12px', borderRadius: 12, background: '#1a5fa8', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            View Partnership Page →
          </button>
        </div>
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }`}</style>
    </div>
  )
}

const FAQS = [
  { q: 'Who can attend the June summit?', a: 'Everyone! The WCCC Financial & Wellness Summit is open to all Wisconsin residents — WCCC members and the general public alike. No membership or registration fee required.' },
  { q: 'Who can participate in the ongoing programs?', a: 'All programs are open to all Wisconsin residents — WCCC members and the general public alike. No membership or health insurance required.' },
  { q: 'Are the workshops and summit free?', a: 'Yes, 100% free. All educational workshops and the June summit are completely free of charge to all participants.' },
  { q: 'What languages are sessions offered in?', a: 'Sessions are currently offered in English. Chinese and Vietnamese language sessions are being planned — register to be notified when multilingual sessions launch.' },
  { q: 'Do I need health insurance through Anthem to participate?', a: 'No. All programs are open to everyone regardless of your current health insurance provider.' },
  { q: 'Can I bring my employees or family members?', a: 'Absolutely! Everyone is welcome. Business owners are encouraged to bring their team members and family. Contact Rita at Anthem for group arrangements.' },
]

const PROGRAMS = [
  { icon: '💰', title: 'Financial Planning', desc: 'Retirement strategies, insurance planning, and long-term financial protection for individuals and families.', color: '#1d4ed8', bg: '#eff6ff', tag: 'Northwestern Mutual + Anthem' },
  { icon: '⚖️', title: 'Legal Protection', desc: 'Understand your legal rights, create essential documents, and protect your family and business with affordable legal plans.', color: '#7c3aed', bg: '#f5f3ff', tag: 'LegalShield' },
  { icon: '❤️', title: 'Preventative Health Care', desc: 'Wellness screenings, annual checkups, and preventative health resources to keep you and your family healthy year-round.', color: '#16a34a', bg: '#f0fdf4', tag: 'Anthem' },
  { icon: '🛡️', title: 'Long-Term Care Planning', desc: 'Understand long-term care insurance options and plan ahead for yourself and your loved ones.', color: '#d97706', bg: '#fffbeb', tag: 'Anthem' },
]

const PARTNERS = [
  { name: 'Anthem', desc: 'Health insurance & wellness programs', color: '#1a5fa8' },
  { name: 'Northwestern Mutual', desc: 'Financial planning & retirement', color: '#2d6a1f' },
  { name: 'LegalShield', desc: 'Legal protection & planning', color: '#7c3aed' },
  { name: 'More TBA', desc: 'Additional partners coming soon', color: '#6b7280' },
]
const WORKSHOPS = [
  { date: 'June 2026 · Date TBD',     title: 'WCCC Financial & Wellness Summit',                       type: 'All Topics · Keynote Event',     location: 'Milwaukee, WI + Virtual', featured: true  },
  { date: 'July 2026 · Date TBD',     title: 'Financial Planning for Individuals & Small Businesses',  type: 'Financial Planning',             location: 'Milwaukee, WI + Virtual', featured: false },
  { date: 'August 2026 · Date TBD',   title: 'Legal Protection & Know Your Rights',                    type: 'Legal Protection',               location: 'Milwaukee, WI + Virtual', featured: false },
  { date: 'September 2026 · Date TBD',title: 'Preventative Health Care for the Whole Family',          type: 'Preventative Health Care',       location: 'Milwaukee, WI + Virtual', featured: false },
  { date: 'October 2026 · Date TBD',  title: 'Long-Term Care Planning 101',                            type: 'Long-Term Care Planning',        location: 'Milwaukee, WI + Virtual', featured: false },
  { date: 'November 2026 · Date TBD', title: 'Year-End Financial Review & Insurance Check-Up',         type: 'Financial Planning',             location: 'Milwaukee, WI + Virtual', featured: false },
  { date: 'December 2026 · Date TBD', title: 'Year-End Wellness Review & 2027 Planning',               type: 'Health & Wellness',              location: 'Milwaukee, WI + Virtual', featured: false },
]



function AnthemPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', program: '', member: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  const inp = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 15, outline: 'none', boxSizing: 'border-box' as const }
  const lbl = { fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginBottom: 4, display: 'block' as const }
  const card = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '1.25rem' }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 1rem 4rem', fontFamily: '"DM Sans", sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0c2447 0%, #1a3a6b 50%, #1a5fa8 100%)', borderRadius: 20, padding: '3.5rem 2rem', textAlign: 'center', marginBottom: '2rem', marginTop: '1rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20, position: 'relative', flexWrap: 'wrap' as const }}>
          <div style={{ padding: '7px 16px', borderRadius: 99, background: '#B91C1C', color: '#fff', fontSize: 13, fontWeight: 700 }}>亚 WCCC</div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }}>×</span>
          <div style={{ padding: '7px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontWeight: 700, border: '1px solid rgba(255,255,255,0.25)' }}>Anthem</div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }}>×</span>
          <div style={{ padding: '7px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }}>Northwestern Mutual</div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }}>×</span>
          <div style={{ padding: '7px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }}>LegalShield</div>
        </div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 30, fontWeight: 700, color: '#fff', marginBottom: 12, lineHeight: 1.25, position: 'relative' }}>
          Free Health, Financial & Legal Wellness Programs for All Wisconsin Residents
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, maxWidth: 520, margin: '0 auto 8px', lineHeight: 1.7, position: 'relative' }}>
          Financial planning, legal protection, preventative care, and long-term wellness — open to <strong style={{ color: '#fff' }}>everyone</strong> in Wisconsin.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 24, position: 'relative' }}>
          No membership required · 100% free · Milwaukee, WI
        </p>
        <a href="#register" style={{ display: 'inline-block', background: '#fff', color: '#0c2447', padding: '10px 24px', borderRadius: 99, fontSize: 14, fontWeight: 600, textDecoration: 'none', position: 'relative' }}>
          Register for free →
        </a>
      </div>

      {/* ⭐ BIG EVENT CARD */}
      <div style={{ background: 'linear-gradient(135deg, #7c1d1d 0%, #B91C1C 100%)', borderRadius: 20, padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.2)', marginBottom: 14 }}>
            <span style={{ fontSize: 12 }}>⭐</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.08em' }}>FEATURED EVENT</span>
          </div>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>
            WCCC Financial & Wellness Summit
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.7, marginBottom: 20, maxWidth: 480 }}>
            Join us for an inspiring evening with leading experts from Anthem, Northwestern Mutual, LegalShield and more — covering financial planning, legal protection, preventative care, and long-term wellness.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            {[
              { icon: '📅', label: 'June 2026 · Date TBD' },
              { icon: '🕕', label: '6:00 PM – 9:00 PM' },
              { icon: '📍', label: 'Milwaukee, WI' },
              { icon: '🎟️', label: 'Free Admission' },
            ].map(d => (
              <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>{d.icon}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{d.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
            <a href="#register" style={{ padding: '10px 22px', borderRadius: 99, background: '#fff', color: '#B91C1C', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              Reserve my spot →
            </a>
            <div style={{ padding: '10px 22px', borderRadius: 99, background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontWeight: 500, border: '1px solid rgba(255,255,255,0.3)' }}>
              Updates coming soon
            </div>
          </div>
        </div>
      </div>

      {/* Partners */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Summit Partners</p>
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>Who you'll hear from</p>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
          Leading experts from multiple organizations will present at the June summit.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          {PARTNERS.map(p => (
            <div key={p.name} style={{ ...card, borderTop: `3px solid ${p.color}`, textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${p.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 18 }}>
                {p.name === 'Anthem' ? '🏥' : p.name === 'Northwestern Mutual' ? '💼' : p.name === 'LegalShield' ? '⚖️' : '➕'}
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>{p.name}</p>
              <p style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.5 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Programs */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Topics covered</p>
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>What you'll learn</p>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
          Four key areas covered at the summit and through ongoing workshops throughout the year.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {PROGRAMS.map(p => (
            <div key={p.title} style={{ ...card, borderTop: `3px solid ${p.color}` }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{p.icon}</div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>{p.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: 10 }}>{p.desc}</p>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: `${p.color}18`, color: p.color }}>{p.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Workshops */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Schedule</p>
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>7 Events · June – December 2026</p>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
          All events are hybrid — in-person in Milwaukee and available virtually statewide. Exact dates to be confirmed. Register below to be notified.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
          {WORKSHOPS.map((w, i) => (
            <div key={i} style={{ background: w.featured ? 'rgba(185,28,28,0.04)' : 'var(--color-surface)', border: w.featured ? '1px solid rgba(185,28,28,0.35)' : '1px solid var(--color-border)', borderRadius: 16, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: w.featured ? 'rgba(185,28,28,0.12)' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
                {w.featured ? '⭐' : '📅'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: w.featured ? '#B91C1C' : '#1a5fa8', fontWeight: 600, marginBottom: 3 }}>{w.type}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 5, lineHeight: 1.3 }}>{w.title}</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
                  <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>📅 {w.date}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>📍 {w.location}</span>
                  <span style={{ fontSize: 11, color: '#0F6E56', fontWeight: 500 }}>💻 Hybrid</span>
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 99, background: w.featured ? 'rgba(185,28,28,0.1)' : 'rgba(251,191,36,0.15)', color: w.featured ? '#B91C1C' : '#92400e', whiteSpace: 'nowrap' as const }}>
                  {w.featured ? '🌟 Keynote' : 'Coming soon'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Open to all banner */}
      <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>✅</div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#16a34a', marginBottom: 2 }}>Open to everyone in Wisconsin</p>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.5 }}>You don't need to be a WCCC member or an Anthem customer to participate. These programs are a community service — all are welcome.</p>
        </div>
      </div>

      {/* Registration Form */}
      <div id="register" style={{ ...card, marginBottom: '2.5rem', border: '1px solid rgba(185,28,28,0.25)' }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Register</p>
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>Reserve your spot</p>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          Sign up for the <strong style={{ color: 'var(--color-text)' }}>June Summit</strong> and ongoing workshops. Open to <strong style={{ color: 'var(--color-text)' }}>everyone in Wisconsin</strong> — free of charge.
        </p>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, color: 'var(--color-text)', marginBottom: 8 }}>You're registered!</h3>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6 }}>
              Thank you, {formData.name}! We'll send event details and workshop notifications to {formData.email}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={lbl}>Full name *</label>
                <input required style={inp} placeholder="Jane Smith"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label style={lbl}>Email *</label>
                <input required type="email" style={inp} placeholder="jane@example.com"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={lbl}>Phone</label>
                <input style={inp} placeholder="(414) 555-0000"
                  value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <label style={lbl}>I'm interested in *</label>
                <select required style={{ ...inp, cursor: 'pointer' }}
                  value={formData.program} onChange={e => setFormData({ ...formData, program: e.target.value })}>
                  <option value="">Select...</option>
                  <option>June Summit — all topics</option>
                  <option>Financial Planning</option>
                  <option>Legal Protection</option>
                  <option>Preventative Health Care</option>
                  <option>Long-Term Care Planning</option>
                  <option>All programs — notify me of everything</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Are you a WCCC member?</label>
              <select style={{ ...inp, cursor: 'pointer' }}
                value={formData.member} onChange={e => setFormData({ ...formData, member: e.target.value })}>
                <option value="">Select...</option>
                <option>Yes, I'm a WCCC member</option>
                <option>No, but I'd like to learn more about WCCC</option>
                <option>No, just interested in the programs</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Questions or comments (optional)</label>
              <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' as const }} placeholder="Any specific topics you'd like covered at the summit?"
                value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: 12, background: '#B91C1C', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>
              Reserve My Free Spot →
            </button>
            <p style={{ fontSize: 11, color: 'var(--color-muted)', textAlign: 'center', marginTop: 10 }}>
              Your information is kept private. Questions? Email us at info@wisccc.org
            </p>
          </form>
        )}
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6 }}>FAQ</p>
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>Common questions</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ ...card, cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{faq.q}</p>
                <div style={{ fontSize: 18, color: '#1a5fa8', flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</div>
              </div>
              {openFaq === i && <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Rita */}
      <div style={{ background: '#B91C1C', borderRadius: 20, padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, color: '#fff', marginBottom: 8 }}>Have questions? Contact Rita</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
          Anthem representative Rita is available to answer your questions about the summit and ongoing programs — whether you're a WCCC member or not.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' as const }}>
          <a href="mailto:info@wisccc.org" style={{ padding: '10px 20px', borderRadius: 99, background: '#fff', color: '#B91C1C', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>✉️ Contact WCCC</a>
          <a href="https://hub.wcccbusinessnetwork.org" style={{ padding: '10px 20px', borderRadius: 99, background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.4)' }}>Visit WCCC Hub</a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {['亚 WCCC', 'Anthem', 'Northwestern Mutual', 'LegalShield'].map(p => (
            <span key={p} style={{ fontSize: 11, color: 'var(--color-muted)', padding: '4px 12px', borderRadius: 99, border: '1px solid var(--color-border)' }}>{p}</span>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--color-muted)' }}>hub.wcccbusinessnetwork.org · Wisconsin Asian Hub</p>
        <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>This is a preview page shared for review — not yet published publicly.</p>
      </div>
    </div>
  )
}

export default function AnthemModule() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('anthem_unlocked') === 'true')
  function handleUnlock() { sessionStorage.setItem('anthem_unlocked', 'true'); setUnlocked(true) }
  return unlocked ? <AnthemPage /> : <PasswordGate onUnlock={handleUnlock} />
}
