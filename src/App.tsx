import { useState } from 'react'
import MembersModule from './modules/members/MembersModule'
import VideosModule  from './modules/videos/VideosModule'
import BoardModule   from './modules/board/BoardModule'
import ChatModule    from './modules/chat/ChatModule'
import GivingModule  from './modules/giving/GivingModule'
import DineModule    from './modules/din/DineModule'
import ChatWindow    from './modules/chat/components/ChatWindow'

type Tab = 'videos' | 'dine' | 'community' | 'giving' | 'chat' | 'members' | 'board'

export default function App() {
  const [tab, setTab]               = useState<Tab>('videos')
  const [bubbleOpen, setBubbleOpen] = useState(false)
  const [moreOpen, setMoreOpen]     = useState(false)

  function navigate(t: Tab) {
    setTab(t)
    setMoreOpen(false)
    setBubbleOpen(false)
  }

  const tabLabel: Record<Tab, { icon: string; label: string }> = {
    videos:    { icon: '🎬', label: 'Videos'    },
    dine:      { icon: '🍜', label: 'Dine'      },
    community: { icon: '👥', label: 'Community' },
    giving:    { icon: '🤝', label: 'Giving'    },
    chat:      { icon: '🤖', label: 'Chat'      },
    members:   { icon: '👥', label: 'Members'   },
    board:     { icon: '📋', label: 'Board'     },
  }

  const activeLabel = tabLabel[tab]

  // Community = Members or Board
  const isCommunityTab = tab === 'members' || tab === 'board' || tab === 'community'

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{
        background: 'rgba(12,10,9,0.92)', backdropFilter: 'blur(12px)',
        borderColor: 'var(--color-border)'
      }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-sm flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--color-red)' }}>亚</div>
            <span className="font-display font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
              Wisconsin Asian Hub
            </span>
          </div>
          <span className="chip text-xs" style={{
            background: 'rgba(185,28,28,0.15)', color: 'var(--color-gold)',
            border: '1px solid rgba(185,28,28,0.3)'
          }}>
            {activeLabel.icon} {activeLabel.label}
          </span>
        </div>
      </header>

      {/* Active Module */}
      <main>
        {tab === 'videos'  && <VideosModule  />}
        {tab === 'dine'    && <DineModule    />}
        {tab === 'members' && <MembersModule />}
        {tab === 'board'   && <BoardModule   />}
        {tab === 'giving'  && <GivingModule  />}
        {tab === 'chat'    && <ChatModule    />}
        {tab === 'community' && <MembersModule />}
      </main>

      {/* Floating chat bubble */}
      {tab !== 'chat' && (
        <>
          <button
            onClick={() => { setBubbleOpen(o => !o); setMoreOpen(false) }}
            className="fixed z-50 w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg transition-transform active:scale-95"
            style={{
              bottom: '5.5rem',
              right: tab === 'board' ? 'auto' : '1.25rem',
              left: tab === 'board' ? '1.25rem' : 'auto',
              background: bubbleOpen ? 'var(--color-surface)' : 'var(--color-red)',
              boxShadow: '0 4px 20px rgba(185,28,28,0.4)',
              border: bubbleOpen ? '1px solid var(--color-border)' : 'none',
            }}>
            {bubbleOpen ? '✕' : '🤖'}
          </button>
          {bubbleOpen && <ChatWindow onClose={() => setBubbleOpen(false)} />}
        </>
      )}

      {/* More drawer backdrop */}
      {moreOpen && (
        <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMoreOpen(false)} />
      )}

      {/* More drawer */}
      <div className="fixed left-0 right-0 z-50 transition-all duration-300"
        style={{
          bottom: moreOpen ? '64px' : '-200px',
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
        }}>
        <div className="px-4 pt-3 pb-2">
          <div className="w-8 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--color-border)' }} />
          <p className="text-xs font-semibold mb-3 px-1" style={{ color: 'var(--color-muted)' }}>MORE</p>
          <div className="grid grid-cols-4 gap-2 pb-2">
            {[
              { id: 'members', icon: '👥', label: 'Members' },
              { id: 'board',   icon: '📋', label: 'Board'   },
              { id: 'chat',    icon: '🤖', label: 'Chat'    },
            ].map(t => (
              <button key={t.id}
                onClick={() => navigate(t.id as Tab)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                style={{
                  background: tab === t.id ? 'rgba(185,28,28,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tab === t.id ? 'rgba(185,28,28,0.3)' : 'var(--color-border)'}`,
                }}>
                <span className="text-2xl">{t.icon}</span>
                <span className="text-xs font-medium" style={{
                  color: tab === t.id ? 'var(--color-red)' : 'var(--color-muted)'
                }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav — 4 primary tabs + More */}
      <nav className="fixed bottom-0 left-0 right-0 border-t flex" style={{
        background: 'rgba(12,10,9,0.97)', backdropFilter: 'blur(12px)',
        borderColor: 'var(--color-border)', height: 64,
      }}>
        {[
          { id: 'videos',  icon: '🎬', label: 'Videos'  },
          { id: 'dine',    icon: '🍜', label: 'Dine'    },
          { id: 'giving',  icon: '🤝', label: 'Giving'  },
        ].map(t => (
          <button key={t.id}
            onClick={() => navigate(t.id as Tab)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
            style={{ color: tab === t.id ? 'var(--color-red)' : 'var(--color-muted)' }}>
            <span className="text-xl">{t.icon}</span>
            {t.label}
          </button>
        ))}

        {/* More button */}
        <button
          onClick={() => { setMoreOpen(o => !o); setBubbleOpen(false) }}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
          style={{ color: (isCommunityTab || tab === 'chat') ? 'var(--color-red)' : 'var(--color-muted)' }}>
          <span className="text-xl">{moreOpen ? '✕' : '⋯'}</span>
          More
        </button>
      </nav>
    </div>
  )
}
