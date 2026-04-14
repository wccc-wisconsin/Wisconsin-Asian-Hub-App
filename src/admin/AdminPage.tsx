import { useState } from 'react'
import { useAuth } from '../hooks/useAdmin'
import AdminLogin from './components/AdminLogin'
import GivingAdmin from './components/GivingAdmin'
import BoardAdmin from './components/BoardAdmin'
import AdminUsersPanel from './components/AdminUsersPanel'
import DineAdmin from './components/DineAdmin'
import EventsAdmin from './components/EventsAdmin'
import MembersEnrichmentAdmin from './components/MembersEnrichmentAdmin'

type AdminTab = 'dine' | 'giving' | 'board' | 'events' | 'members' | 'admins'

const ADMIN_TABS = [
  { id: 'dine',    icon: '🍜', label: 'Dine'    },
  { id: 'giving',  icon: '🤝', label: 'Giving'  },
  { id: 'board',   icon: '📋', label: 'Board'   },
  { id: 'events',  icon: '📅', label: 'Events'  },
  { id: 'members', icon: '👥', label: 'Members' },
  { id: 'admins',  icon: '👤', label: 'Admins'  },
] as const

export default function AdminPage() {
  const { user, isAdmin, loading, signInWithGoogle, signOutAdmin } = useAuth()
  const [tab, setTab]           = useState<AdminTab>('dine')
  const [signingIn, setSigningIn] = useState(false)

  async function handleLogin() {
    setSigningIn(true)
    try { await signInWithGoogle() }
    finally { setSigningIn(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading...</p>
      </div>
    )
  }

  if (!user) return <AdminLogin onLogin={handleLogin} loading={signingIn} />

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center"
        style={{ background: 'var(--color-bg)' }}>
        <div className="space-y-4">
          <p className="text-4xl">🚫</p>
          <h2 className="font-display text-xl font-bold" style={{ color: 'var(--color-text)' }}>Access Denied</h2>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{user.email} is not an authorized admin.</p>
          <button onClick={signOutAdmin}
            className="px-6 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <header className="sticky top-0 z-50 border-b" style={{
        background: 'var(--color-bg)', backdropFilter: 'blur(12px)',
        borderColor: 'var(--color-border)'
      }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-sm flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'var(--color-red)' }}>亚</div>
            <span className="font-display font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              WCCC Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user.photoURL && <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />}
            <span className="text-xs hidden sm:block" style={{ color: 'var(--color-muted)' }}>{user.email}</span>
            <button onClick={signOutAdmin}
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'var(--color-surface)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-4xl mx-auto px-4 flex gap-1 py-2 overflow-x-auto">
          {ADMIN_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as AdminTab)}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={{
                background: tab === t.id ? 'var(--color-red)' : 'transparent',
                color: tab === t.id ? '#fff' : 'var(--color-muted)',
              }}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {tab === 'dine'    && <DineAdmin />}
        {tab === 'giving'  && <GivingAdmin />}
        {tab === 'board'   && <BoardAdmin />}
        {tab === 'events'  && <EventsAdmin />}
        {tab === 'members' && <MembersEnrichmentAdmin />}
        {tab === 'admins'  && <AdminUsersPanel currentEmail={user.email ?? ''} />}
      </div>
    </div>
  )
}
