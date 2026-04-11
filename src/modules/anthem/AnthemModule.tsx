import { useState } from 'react'

const PASSWORD = 'rita2026'

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [shaking, setShake] = useState(false)

  function handleSubmit() {
    if (input === PASSWORD) {
      onUnlock()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
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
          <button onClick={handleSubmit}
            style={{ width: '100%', padding: '12px', borderRadius: 12, background: '#1a5fa8', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            View Partnership Page →
          </button>
        </div>
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }`}</style>
    </div>
  )
}

const FAQS = [
  { q: 'Who is eligible for these programs?', a: 'All WCCC members and their employees are eligible. Some programs are also open to the wider Wisconsin Asian community — no membership required.' },
  { q: 'Are the workshops free?', a: 'Yes! All educational workshops offered through the WCCC × Anthem partnership are completely free of charge.' },
  { q: 'What languages are workshops offered in?', a: 'Workshops are currently offered in English. Chinese and Vietnamese language sessions are being planned — stay tuned for announcements.' },
  { q: 'Do I need health insurance through Anthem to participate?', a: 'No. The educational programs and workshops are open to all WCCC members regardless of your current health insurance provider.' },
  { q: 'How do I find out about upcoming workshops?', a: 'Register below and you\'ll receive email notifications about upcoming workshops. You can also follow WCCC on social media for announcements.' },
  { q: 'Can I bring my employees to workshops?', a: 'Absolutely! Business owners are encouraged to bring their team members. Group bookings are welcome — contact Rita at Anthem for group arrangements.' },
]

const PROGRAMS = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="10" fill="#dbeafe"/>
        <path d="M8 22l4-4 3 3 5-6 4 4" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 12h12M10 16h8" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Financial Education',
    desc: 'Insurance planning, retirement strategies, and long-term financial protection designed for small business owners.',
    color: '#1d4ed8', bg: '#eff6ff', tag: 'Financial literacy'
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="10" fill="#dcfce7"/>
        <path d="M16 8c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z" stroke="#16a34a" strokeWidth="1.5"/>
        <path d="M16 12v4l3 3" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 10l-2-2M20 10l2-2" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Preventative Health Care',
    desc: 'Wellness screenings, annual checkups, and preventative health resources to keep you and your team healthy year-round.',
    color: '#16a34a', bg: '#f0fdf4', tag: 'Wellness'
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="10" fill="#fef3c7"/>
        <rect x="8" y="10" width="16" height="12" rx="2" stroke="#d97706" strokeWidth="1.5"/>
        <path d="M12 10V8M20 10V8" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 14h16" stroke="#d97706" strokeWidth="1.5"/>
        <path d="M12 18h2M18 18h2" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Educational Workshops',
    desc: 'Free community workshops on health literacy, navigating insurance, Medicare, and Medicaid. Multilingual sessions coming soon.',
    color: '#d97706', bg: '#fffbeb', tag: 'Free events'
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="10" fill="#ede9fe"/>
        <path d="M16 9l2 5h5l-4 3 1.5 5L16 19l-4.5 3 1.5-5-4-3h5z" stroke="#7c3aed" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Long-Term Care Planning',
    desc: 'Understand long-term care insurance options and plan ahead for yourself, your family, and your employees.',
    color: '#7c3aed', bg: '#f5f3ff', tag: 'Long-term care'
  },
]

const WORKSHOPS = [
  { date: 'TBD', title: 'Understanding Your Health Insurance Options', type: 'Financial Education', location: 'Milwaukee, WI + Virtual' },
  { date: 'TBD', title: 'Preventative Care for Small Business Owners', type: 'Preventative Health', location: 'Madison, WI' },
  { date: 'TBD', title: 'Long-Term Care Planning 101', type: 'Long-Term Care', location: 'Virtual' },
]

function AnthemPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', program: '', date: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  const s = {
    page: { maxWidth: 800, margin: '0 auto', padding: '0 1rem 4rem', fontFamily: '"DM Sans", sans-serif' },
    hero: { background: 'linear-gradient(135deg, #0c2447 0%, #1a3a6b 50%, #1a5fa8 100%)', borderRadius: 20, padding: '3.5rem 2rem', textAlign: 'center' as const, marginBottom: '2.5rem', marginTop: '1rem', position: 'relative' as const, overflow: 'hidden' as const },
    heroTitle: { fontFamily: '"Playfair Display", serif', fontSize: 30, fontWeight: 700, color: '#fff', marginBottom: 12, lineHeight: 1.25 },
    heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 15, maxWidth: 520, margin: '0 auto 1.75rem', lineHeight: 1.7 },
    heroCta: { display: 'inline-block', background: '#fff', color: '#0c2447', padding: '10px 24px', borderRadius: 99, fontSize: 14, fontWeight: 600, textDecoration: 'none', cursor: 'pointer' },
    sectionLabel: { fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-muted)', textTransform: 'uppercase' as const, marginBottom: 6 },
    sectionTitle: { fontFamily: '"Playfair Display", serif', fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 },
    sectionSub: { fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.7, marginBottom: '1.5rem' },
    card: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '1.25rem' },
    input: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 15, outline: 'none', boxSizing: 'border-box' as const },
    label: { fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginBottom: 4, display: 'block' as const },
    submitBtn: { width: '100%', padding: '14px', borderRadius: 12, background: '#B91C1C', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  }

  return (
    <div style={s.page}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={s.hero}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20, position: 'relative' }}>
          <div style={{ padding: '7px 16px', borderRadius: 99, background: '#B91C1C', color: '#fff', fontSize: 13, fontWeight: 700 }}>亚 WCCC</div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }}>×</span>
          <div style={{ padding: '7px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontWeight: 700, border: '1px solid rgba(255,255,255,0.25)' }}>Anthem</div>
        </div>
        <h1 style={{ ...s.heroTitle, position: 'relative' }}>
          Health & Wellness Programs for Wisconsin's Asian Community
        </h1>
        <p style={{ ...s.heroSub, position: 'relative' }}>
          Free financial education, preventative care, and wellness workshops — brought to you by WCCC and Anthem Blue Cross Blue Shield.
        </p>
        <a href="#register" style={{ ...s.heroCta, position: 'relative' }}>
          Register for a free workshop ↓
        </a>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '2.5rem' }}>
        {[
          { n: '252+', l: 'Members served' },
          { n: '4', l: 'Program areas' },
          { n: '100%', l: 'Free workshops' },
          { n: 'WI', l: 'Statewide' },
        ].map(s => (
          <div key={s.l} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 24, fontWeight: 700, color: '#1a5fa8' }}>{s.n}</div>
            <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 3 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Programs */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={s.sectionLabel}>Programs offered</div>
        <div style={s.sectionTitle}>What we offer</div>
        <p style={s.sectionSub}>Four program areas designed specifically for small business owners and their employees.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {PROGRAMS.map(p => (
            <div key={p.title} style={{ ...s.card, borderTop: `3px solid ${p.color}` }}>
              <div style={{ marginBottom: 12 }}>{p.icon}</div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>{p.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: 12 }}>{p.desc}</p>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: p.bg, color: p.color }}>{p.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Workshops */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={s.sectionLabel}>Upcoming workshops</div>
        <div style={s.sectionTitle}>Join us at a free event</div>
        <p style={s.sectionSub}>Dates and locations will be announced soon. Register below to be notified.</p>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
          {WORKSHOPS.map((w, i) => (
            <div key={i} style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#1a5fa8', fontWeight: 600, marginBottom: 3 }}>{w.type} · {w.date}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 3 }}>{w.title}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>📍 {w.location}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 99, background: 'rgba(251,191,36,0.15)', color: '#92400e', flexShrink: 0 }}>Coming soon</span>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Form */}
      <div id="register" style={{ ...s.card, marginBottom: '2.5rem', border: '1px solid rgba(185,28,28,0.25)' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={s.sectionLabel}>Register</div>
          <div style={{ ...s.sectionTitle, fontSize: 20 }}>Sign up for a free workshop</div>
          <p style={{ ...s.sectionSub, marginBottom: 0 }}>Fill out the form below and we'll notify you when workshops are scheduled.</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, color: 'var(--color-text)', marginBottom: 8 }}>You're registered!</h3>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6 }}>
              Thank you! We'll send you details about upcoming workshops at {formData.email}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={s.label}>Full name *</label>
                <input required style={s.input} placeholder="Jane Smith"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label style={s.label}>Email *</label>
                <input required type="email" style={s.input} placeholder="jane@example.com"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={s.label}>Phone</label>
                <input style={s.input} placeholder="(414) 555-0000"
                  value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <label style={s.label}>Program of interest *</label>
                <select required style={{ ...s.input, cursor: 'pointer' }}
                  value={formData.program} onChange={e => setFormData({ ...formData, program: e.target.value })}>
                  <option value="">Select a program...</option>
                  <option>Financial Education</option>
                  <option>Preventative Health Care</option>
                  <option>Educational Workshops</option>
                  <option>Long-Term Care Planning</option>
                  <option>All programs</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={s.label}>Message or questions (optional)</label>
              <textarea style={{ ...s.input, minHeight: 80, resize: 'vertical' as const }} placeholder="Any specific topics you'd like covered?"
                value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
            </div>
            <button type="submit" style={s.submitBtn}>Register for Free Workshops →</button>
            <p style={{ fontSize: 11, color: 'var(--color-muted)', textAlign: 'center', marginTop: 10 }}>
              Your information is kept private and only shared with WCCC and Anthem.
            </p>
          </form>
        )}
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={s.sectionLabel}>FAQ</div>
        <div style={s.sectionTitle}>Common questions</div>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ ...s.card, cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{faq.q}</p>
                <div style={{ fontSize: 18, color: '#1a5fa8', flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</div>
              </div>
              {openFaq === i && (
                <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Rita */}
      <div style={{ background: '#B91C1C', borderRadius: 20, padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, color: '#fff', marginBottom: 8 }}>Have questions? Contact Rita</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
          Anthem representative Rita is available to answer your questions and help you find the right program for your business.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' as const }}>
          <a href="mailto:rita@anthem.com" style={{ padding: '10px 20px', borderRadius: 99, background: '#fff', color: '#B91C1C', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            ✉️ Email Rita
          </a>
          <a href="https://hub.wcccbusinessnetwork.org" style={{ padding: '10px 20px', borderRadius: 99, background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.4)' }}>
            Visit WCCC Hub
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' as const, marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--color-muted)', padding: '5px 14px', borderRadius: 99, border: '1px solid var(--color-border)' }}>亚 Wisconsin Chinese Chamber of Commerce</span>
          <span style={{ fontSize: 12, color: 'var(--color-muted)', padding: '5px 14px', borderRadius: 99, border: '1px solid var(--color-border)' }}>Anthem Blue Cross Blue Shield</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--color-muted)' }}>hub.wcccbusinessnetwork.org · Wisconsin Asian Hub</p>
      </div>
    </div>
  )
}

export default function AnthemModule() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem('anthem_unlocked') === 'true'
  )

  function handleUnlock() {
    sessionStorage.setItem('anthem_unlocked', 'true')
    setUnlocked(true)
  }

  return unlocked ? <AnthemPage /> : <PasswordGate onUnlock={handleUnlock} />
}
