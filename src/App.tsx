import { useState, useRef, useEffect } from 'react'
import MembersModule from './modules/members/MembersModule'
import VideosModule  from './modules/videos/VideosModule'
import BoardModule   from './modules/board/BoardModule'
import ChatModule    from './modules/chat/ChatModule'
import GivingModule  from './modules/giving/GivingModule'
import DineModule    from './modules/din/DineModule'
import EventsModule  from './modules/events/EventsModule'
import ChatWindow    from './modules/chat/components/ChatWindow'

type Tab = 'videos' | 'dine' | 'giving' | 'members' | 'board' | 'chat' | 'events'

const TAB_META: Record<Tab, { icon: string; label: string }> = {
  videos:  { icon: '🎬', label: 'Videos'  },
  dine:    { icon: '🍜', label: 'Dine'    },
  giving:  { icon: '🤝', label: 'Giving'  },
  members: { icon: '👥', label: 'Members' },
  board:   { icon: '📋', label: 'Board'   },
  chat:    { icon: '🤖', label: 'Chat'    },
}

const MORE_TABS: Tab[] = ['members', 'board', 'events', 'chat']

export default function App() {
  const [tab, setTab]               = useState<Tab>('videos')
  const [bubbleOpen, setBubbleOpen] = useState(false)
  const [moreOpen, setMoreOpen]     = useState(false)
  const moreRef                     = useRef<HTMLDivElement>(null)

  // Close popup when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    if (moreOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [moreOpen])

  function navigate(t: Tab) {
    setTab(t)
    setMoreOpen(false)
    setBubbleOpen(false)
  }

  const isMoreTab   = MORE_TABS.includes(tab)
  const activeLabel = TAB_META[tab]

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
        {tab === 'giving'  && <GivingModule  />}
        {tab === 'members' && <MembersModule />}
        {tab === 'board'   && <BoardModule   />}
        {tab === 'chat'    && <ChatModule    />}
        {tab === 'events'  && <EventsModule  />}
      </main>

      {/* Floating chat bubble */}
      {tab !== 'chat' && (
        <>
          <button
            onClick={() => { setBubbleOpen(o => !o); setMoreOpen(false) }}
            className="fixed z-40 w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg transition-transform active:scale-95"
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

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t flex" style={{
        background: 'rgba(12,10,9,0.97)', backdropFilter: 'blur(12px)',
        borderColor: 'var(--color-border)', height: 64, zIndex: 50,
      }}>
        {/* Primary tabs */}
        {(['videos', 'dine', 'giving'] as Tab[]).map(t => (
          <button key={t}
            onClick={() => navigate(t)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
            style={{ color: tab === t ? 'var(--color-red)' : 'var(--color-muted)' }}>
            <span className="text-xl">{TAB_META[t].icon}</span>
            {TAB_META[t].label}
          </button>
        ))}

        {/* More button with popup */}
        <div ref={moreRef} className="flex-1 relative flex flex-col items-center justify-center">
          {/* Popup menu — appears above the button */}
          {moreOpen && (
            <div className="absolute bottom-full mb-2 right-0 rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                minWidth: 160,
                boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
              }}>
              {MORE_TABS.map((t, i) => (
                <button key={t}
                  onClick={() => navigate(t)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left"
                  style={{
                    color: tab === t ? 'var(--color-red)' : 'var(--color-text)',
                    background: tab === t ? 'rgba(185,28,28,0.1)' : 'transparent',
                    borderBottom: i < MORE_TABS.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}>
                  <span className="text-lg">{TAB_META[t].icon}</span>
                  {TAB_META[t].label}
                  {tab === t && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-red)' }} />}
                </button>
              ))}
            </div>
          )}

          {/* More button */}
          <button
            onClick={() => { setMoreOpen(o => !o); setBubbleOpen(false) }}
            className="w-full h-full flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
            style={{ color: isMoreTab || moreOpen ? 'var(--color-red)' : 'var(--color-muted)' }}>
            <span className="text-xl" style={{
              transform: moreOpen ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.2s ease',
              display: 'inline-block',
            }}>⋯</span>
            More
          </button>
        </div>
      </nav>
    </div>
  )
}
