import ChatWindow from './components/ChatWindow'

export default function ChatModule() {
  return (
    <div className="max-w-6xl mx-auto pb-24 h-full flex flex-col" style={{ height: 'calc(100vh - 56px - 64px)' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--color-border)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: 'var(--color-red)' }}>亚</div>
        <div>
          <p className="font-display font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
            Hub Assistant
          </p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Always online</p>
          </div>
        </div>
      </div>

      {/* Full screen chat */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow fullScreen />
      </div>
    </div>
  )
}
