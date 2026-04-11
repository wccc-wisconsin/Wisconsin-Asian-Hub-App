import { useState } from 'react'

const PASSWORD = 'rita2026'

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput]   = useState('')
  const [error, setError]   = useState(false)
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
    <div className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: '#B91C1C' }}>亚 WCCC</div>
            <span style={{ color: 'var(--color-muted)' }}>×</span>
            <div className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: '#1a5fa8' }}>Anthem</div>
          </div>
          <h2 className="font-display text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            Partnership Preview
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            This page is password protected and shared for review only.
          </p>
        </div>

        <div className="space-y-3"
          style={{ animation: shaking ? 'shake 0.5s ease' : 'none' }}>
          <input
            type="password"
            placeholder="Enter preview password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none text-center"
            style={{
              background: 'var(--color-surface)',
              border: `1px solid ${error ? '#ef4444' : 'var(--color-border)'}`,
              color: 'var(--color-text)',
              fontSize: '16px',
            }}
          />
          {error && (
            <p className="text-xs" style={{ color: '#ef4444' }}>
              Incorrect password. Please try again.
            </p>
          )}
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl text-sm font-semibold"
            style={{ background: '#1a5fa8', color: '#fff' }}>
            View Partnership Page →
          </button>
        </div>

        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          For access, contact WCCC at hub.wcccbusinessnetwork.org
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) }
          20% { transform: translateX(-8px) }
          40% { transform: translateX(8px) }
          60% { transform: translateX(-4px) }
          80% { transform: translateX(4px) }
        }
      `}</style>
    </div>
  )
}

function AnthemPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 pb-12">
      {/* Hero */}
      <div className="rounded-2xl px-6 py-10 text-center mb-8 mt-4" style={{
        background: 'linear-gradient(135deg, #1a3a6b 0%, #0c2447 100%)'
      }}>
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#B91C1C' }}>亚 WCCC</div>
          <span className="text-white opacity-50 text-lg">×</span>
          <div className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#1a5fa8', border: '1px solid rgba(255,255,255,0.3)' }}>Anthem</div>
        </div>
        <h1 className="font-display font-bold mb-3 text-white" style={{ fontSize: 26, lineHeight: 1.3 }}>
          Health & Wellness Partnership for Wisconsin's Asian Business Community
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
          WCCC has partnered with Anthem to bring financial education, preventative care, and wellness programs directly to our members and their families.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { num: '252+', label: 'WCCC members served' },
          { num: '4',    label: 'Program areas' },
          { num: 'Free', label: 'Educational workshops' },
          { num: 'WI',   label: 'Statewide coverage' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)'
          }}>
            <p className="font-display font-bold text-xl" style={{ color: '#1a5fa8' }}>{s.num}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Programs */}
      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-muted)', letterSpacing: '0.08em' }}>
        PROGRAMS OFFERED
      </p>
      <h2 className="font-display font-bold text-xl mb-1" style={{ color: 'var(--color-text)' }}>
        What this partnership brings to you
      </h2>
      <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
        Anthem and WCCC have designed four program areas specifically for small business owners and their employees in Wisconsin's Asian community.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {[
          {
            icon: '💰', color: '#E6F1FB', iconColor: '#185FA5',
            tag: 'Financial literacy', tagBg: 'rgba(24,95,165,0.1)', tagColor: '#185FA5',
            title: 'Financial education',
            desc: 'Learn how to protect your business and family with the right insurance, retirement planning, and long-term financial strategies.'
          },
          {
            icon: '❤️', color: '#E1F5EE', iconColor: '#0F6E56',
            tag: 'Wellness', tagBg: 'rgba(15,110,86,0.1)', tagColor: '#0F6E56',
            title: 'Preventative health care',
            desc: 'Access wellness screenings, preventative checkups, and health resources designed to keep you and your employees healthy year-round.'
          },
          {
            icon: '📅', color: '#FAEEDA', iconColor: '#854F0B',
            tag: 'Free events', tagBg: 'rgba(133,79,11,0.1)', tagColor: '#854F0B',
            title: 'Educational workshops',
            desc: 'Free community workshops on health literacy, navigating insurance, Medicare, and Medicaid — available in multiple languages.'
          },
          {
            icon: '🛡️', color: '#EEEDFE', iconColor: '#534AB7',
            tag: 'Long-term care', tagBg: 'rgba(83,74,183,0.1)', tagColor: '#534AB7',
            title: 'Long-term care planning',
            desc: 'Understand long-term care insurance options and plan ahead for yourself, your family, and your employees with Anthem\'s guidance.'
          },
        ].map(p => (
          <div key={p.title} className="rounded-xl p-4" style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)'
          }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
              style={{ background: p.color }}>{p.icon}</div>
            <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--color-text)' }}>{p.title}</h3>
            <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-muted)' }}>{p.desc}</p>
            <span className="chip text-xs" style={{
              background: p.tagBg, color: p.tagColor,
              border: `1px solid ${p.tagBg}`
            }}>{p.tag}</span>
          </div>
        ))}
      </div>

      {/* How it works */}
      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-muted)', letterSpacing: '0.08em' }}>
        HOW IT WORKS
      </p>
      <h2 className="font-display font-bold text-xl mb-1" style={{ color: 'var(--color-text)' }}>
        Getting started is simple
      </h2>
      <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
        As a WCCC member, you can access all Anthem partnership programs at no cost.
      </p>

      <div className="space-y-4 mb-8">
        {[
          { n: '1', title: 'You\'re already eligible', desc: 'All current WCCC members automatically qualify for Anthem partnership programs — no additional sign-up required.' },
          { n: '2', title: 'Register for a workshop or consultation', desc: 'Browse upcoming events on the WCCC Hub app or contact WCCC directly to schedule a one-on-one session with an Anthem representative.' },
          { n: '3', title: 'Attend and learn', desc: 'Workshops are held in-person across Wisconsin and virtually. Topics rotate each quarter based on community feedback.' },
          { n: '4', title: 'Connect with an Anthem advisor', desc: 'Get personalized guidance on health plans, long-term care options, and financial protection tailored to your business needs.' },
        ].map(s => (
          <div key={s.n} className="flex gap-4">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
              style={{ background: '#1a5fa8' }}>{s.n}</div>
            <div>
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>{s.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-2xl px-6 py-8 text-center mb-6" style={{ background: '#B91C1C' }}>
        <h2 className="font-display font-bold text-lg mb-2 text-white">
          Ready to take advantage of this partnership?
        </h2>
        <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Contact WCCC or Anthem representative Rita to learn more about upcoming workshops and available programs.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="mailto:rita@anthem.com"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: '#fff', color: '#B91C1C' }}>
            Contact Rita at Anthem
          </a>
          <a href="https://hub.wcccbusinessnetwork.org"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)' }}>
            Visit WCCC Hub
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <div className="px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
          亚 Wisconsin Chinese Chamber of Commerce
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
          Anthem Blue Cross Blue Shield
        </div>
      </div>
      <p className="text-center text-xs mt-4" style={{ color: 'var(--color-muted)' }}>
        This is a preview page shared for review purposes only — not yet published publicly.
      </p>
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
