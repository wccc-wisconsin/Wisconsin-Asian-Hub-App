import { useState } from 'react'
import MembersModule from './modules/members/MembersModule'
import VideosModule  from './modules/videos/VideosModule'
import BoardModule   from './modules/board/BoardModule'
import ChatModule    from './modules/chat/ChatModule'
import ChatWindow    from './modules/chat/components/ChatWindow'

type Tab = 'members' | 'videos' | 'board' | 'chat'

const TABS = [
  { id: 'members', icon: '👥', label: 'Members' },
  { id: 'videos',  icon: '🎬', label: 'Videos'  },
  { id: 'board',   icon: '📋', label: 'Board'   },
  { id: 'chat',    icon: '🤖', label: 'Chat'    },
] as const

export default function App() {
  const [tab, setTab]             = useState<Tab>('members')
  const [bubbleOpen, setBubbleOpen] = useState(false)

  const tabLabel = TABS.find(t => t.id === tab)

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
            {tabLabel?.icon} {tabLabel?.label}
          </span>
        </div>
      </header>

      {/* Active Module */}
      <main>
        {tab === 'members' && <MembersModule />}
        {tab === 'videos'  && <VideosModule  />}
        {tab === 'board'   && <BoardModule   />}
        {tab === 'chat'    && <ChatModule    />}
      </main>

      {/* Floating chat bubble — visible on all tabs except chat */}
      {tab !== 'chat' && (
        <>
          <button
            onClick={() => setBubbleOpen(o => !o)}
            className="fixed z-50 w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg transition-transform active:scale-95"
            style={{
              bottom: '5.5rem',
              right: '1.25rem',
              background: bubbleOpen ? 'var(--color-surface)' : 'var(--color-red)',
              boxShadow: '0 4px 20px rgba(185,28,28,0.4)',
              border: bubbleOpen ? '1px solid var(--color-border)' : 'none',
            }}
          >
            {bubbleOpen ? '✕' : '🤖'}
          </button>

          {bubbleOpen && (
            <ChatWindow onClose={() => setBubbleOpen(false)} />
          )}
        </>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t flex" style={{
        background: 'rgba(12,10,9,0.95)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--color-border)'
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id as Tab); setBubbleOpen(false) }}
            className="flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors"
            style={{ color: tab === t.id ? 'var(--color-red)' : 'var(--color-muted)' }}
          >
            <span className="text-lg">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
