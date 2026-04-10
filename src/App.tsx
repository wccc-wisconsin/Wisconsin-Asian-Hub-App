import { useState } from 'react'
import MembersModule from './modules/members/MembersModule'
import VideosModule from './modules/videos/VideosModule'

type Tab = 'members' | 'videos'

export default function App() {
  const [tab, setTab] = useState<Tab>('members')

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{
        background: 'rgba(12,10,9,0.92)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--color-border)'
      }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-sm flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--color-red)' }}>
              亚
            </div>
            <span className="font-display font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
              Wisconsin Asian Hub
            </span>
          </div>
          <span className="chip text-xs" style={{
            background: 'rgba(185,28,28,0.15)',
            color: 'var(--color-gold)',
            border: '1px solid rgba(185,28,28,0.3)'
          }}>
            WCCC Directory
          </span>
        </div>
      </header>

      {/* Active Module */}
      <main>
        {tab === 'members' && <MembersModule />}
        {tab === 'videos'  && <VideosModule />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t flex" style={{
        background: 'rgba(12,10,9,0.95)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--color-border)'
      }}>
        <button
          onClick={() => setTab('members')}
          className="flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors"
          style={{ color: tab === 'members' ? 'var(--color-red)' : 'var(--color-muted)' }}
        >
          <span className="text-lg">👥</span>
          Members
        </button>
        <button
          onClick={() => setTab('videos')}
          className="flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors"
          style={{ color: tab === 'videos' ? 'var(--color-red)' : 'var(--color-muted)' }}
        >
          <span className="text-lg">🎬</span>
          Videos
        </button>
        <button
          className="flex-1 py-3 flex flex-col items-center gap-0.5 text-xs"
          style={{ color: 'var(--color-muted)' }}
        >
          <span className="text-lg">📅</span>
          Events
        </button>
        <button
          className="flex-1 py-3 flex flex-col items-center gap-0.5 text-xs"
          style={{ color: 'var(--color-muted)' }}
        >
          <span className="text-lg">📌</span>
          Resources
        </button>
      </nav>
    </div>
  )
}
