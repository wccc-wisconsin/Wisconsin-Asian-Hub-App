import { useState, useRef, useEffect } from 'react'
import MembersModule       from './modules/members/MembersModule'
import VideosModule        from './modules/videos/VideosModule'
import BoardModule         from './modules/board/BoardModule'
import ChatModule          from './modules/chat/ChatModule'
import GivingModule        from './modules/giving/GivingModule'
import DineModule          from './modules/din/DineModule'
import EventsModule        from './modules/events/EventsModule'
import OpportunitiesModule from './modules/opportunities/OpportunitiesModule'
import ClubsModule         from './modules/clubs/ClubsModule'
import SponsorsModule         from './modules/sponsors/SponsorsModule'
import TrustedResourcesModule from './modules/resources/TrustedResourcesModule'
import ChatWindow          from './modules/chat/components/ChatWindow'

type Tab = 'videos' | 'dine' | 'giving' | 'members' | 'board' | 'chat' | 'events' | 'opportunities' | 'clubs' | 'sponsors' | 'resources'

const TAB_META: Record<Tab, { icon: string; label: string }> = {
  videos:        { icon: '🎬', label: 'Videos'        },
  dine:          { icon: '🍜', label: 'Dine'          },
  giving:        { icon: '🤝', label: 'Giving'        },
  members:       { icon: '👥', label: 'Asian Businesses'       },
  board:         { icon: '📋', label: 'Board'         },
  chat:          { icon: '🤖', label: 'Chat'          },
  events:        { icon: '📅', label: 'Events'        },
  opportunities: { icon: '📌', label: 'Opportunities' },
  clubs:         { icon: '⛳', label: 'Clubs'         },
  sponsors:      { icon: '🤝', label: 'Sponsors'     },
  resources:     { icon: '⭐', label: 'Resources'    },
}

const MORE_TABS: Tab[] = ['members', 'board', 'events', 'opportunities', 'clubs', 'sponsors', 'resources', 'chat']

const VALID_TABS = new Set<Tab>(['videos', 'dine', 'giving', 'members', 'board', 'chat', 'events', 'opportunities', 'clubs', 'sponsors', 'resources'])

function parseDeepLink(): { tab: Tab; id?: string } {
  try {
    const path = window.location.pathname ?? '/'
    const match = path.match(/^\/(dine|events|board)\/(.+)$/)
    if (match?.[1] && match?.[2]) {
      const t = match[1] as Tab
      if (VALID_TABS.has(t)) return { tab: t, id: match[2] }
    }
    const tabMatch = path.match(/^\/([a-z]+)$/)
    if (tabMatch?.[1]) {
      const t = tabMatch[1] as Tab
      if (VALID_TABS.has(t)) return { tab: t }
    }
  } catch {
    // ignore
  }
  return { tab: 'videos' }
}

export default function App() {
  const deepLink                    = parseDeepLink()
  const [tab, setTab]               = useState<Tab>(deepLink.tab)
  const [deepLinkId, setDeepLinkId] = useState<string | undefined>(deepLink.id)
  const [bubbleOpen, setBubbleOpen] = useState(false)
  const [moreOpen, setMoreOpen]     = useState(false)
  const moreRef                     = useRef<HTMLDivElement>(null)

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
    setDeepLinkId(undefined)
    setMoreOpen(false)
    setBubbleOpen(false)
    window.history.pushState({}, '', `/${t}`)
  }

  const isMoreTab   = MORE_TABS.includes(tab)
  const activeLabel = TAB_META[tab]

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{
        background: 'var(--color-bg)', backdropFilter: 'blur(12px)',
        borderColor: 'var(--color-border)'
      }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-sm flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'var(--color-red)' }}>亚</div>
            <span className="font-display font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
              Wisconsin Asian Hub
            </span>
          </div>
          <span className="text-xs px-2 py-1 rounded-full"
            style={{ background: 'rgba(185,28,28,0.15)', color: 'var(--color-gold)', border: '1px solid rgba(185,28,28,0.3)' }}>
            {activeLabel.icon} {activeLabel.label}
          </span>
        </div>
      </header>

      {/* Active Module */}
      <main>
        {tab === 'videos'        && <VideosModule />}
        {tab === 'dine'          && <DineModule deepLinkId={deepLinkId} />}
        {tab === 'giving'        && <GivingModule />}
        {tab === 'members'       && <MembersModule />}
        {tab === 'board'         && <BoardModule />}
        {tab === 'chat'          && <ChatModule />}
        {tab === 'events'        && <EventsModule />}
        {tab === 'opportunities' && <OpportunitiesModule />}
        {tab === 'clubs'         && <ClubsModule />}
        {tab === 'sponsors'      && <SponsorsModule />}
        {tab === 'resources'     && <TrustedResourcesModule />}
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
        background: 'var(--color-bg)', backdropFilter: 'blur(12px)',
        borderColor: 'var(--color-border)', height: 64, zIndex: 50,
      }}>
        {(['videos', 'dine', 'giving'] as Tab[]).map(t => (
          <button key={t} onClick={() => navigate(t)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
            style={{ color: tab === t ? 'var(--color-red)' : 'var(--color-muted)' }}>
            <span className="text-xl">{TAB_META[t].icon}</span>
            {TAB_META[t].label}
          </button>
        ))}

        <div ref={moreRef} className="flex-1 relative flex flex-col items-center justify-center">
          {moreOpen && (
            <div className="absolute bottom-full mb-2 right-0 rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                minWidth: 190,
                boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
              }}>
              {MORE_TABS.map((t, i) => (
                <button key={t} onClick={() => navigate(t)}
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
