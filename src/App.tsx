import MembersModule from './modules/members/MembersModule'

export default function App() {
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
        <MembersModule />
      </main>

      {/* Bottom nav placeholder for future modules */}
      <nav className="fixed bottom-0 left-0 right-0 border-t flex md:hidden" style={{
        background: 'rgba(12,10,9,0.95)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--color-border)'
      }}>
        <button className="flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium"
          style={{ color: 'var(--color-red)' }}>
          <span className="text-lg">👥</span>
          Members
        </button>
        {/* Future modules will be added here */}
        <button className="flex-1 py-3 flex flex-col items-center gap-0.5 text-xs"
          style={{ color: 'var(--color-muted)' }}>
          <span className="text-lg">📅</span>
          Events
        </button>
        <button className="flex-1 py-3 flex flex-col items-center gap-0.5 text-xs"
          style={{ color: 'var(--color-muted)' }}>
          <span className="text-lg">📌</span>
          Resources
        </button>
      </nav>
    </div>
  )
}
