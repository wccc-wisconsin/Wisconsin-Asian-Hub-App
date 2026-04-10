import { useState, useRef, useEffect } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatWindowProps {
  onClose?: () => void
  fullScreen?: boolean
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 items-end">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
        style={{ background: 'var(--color-red)' }}>亚</div>
      <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm" style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)'
      }}>
        <div className="flex gap-1 items-center h-4">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{
              background: 'var(--color-muted)',
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2 items-end ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: 'var(--color-red)' }}>亚</div>
      )}
      <div className="max-w-[75%]">
        <div className="px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
          style={{
            background: isUser ? 'var(--color-red)' : 'var(--color-surface)',
            color: isUser ? '#fff' : 'var(--color-text)',
            border: isUser ? 'none' : '1px solid var(--color-border)',
            borderBottomRightRadius: isUser ? 4 : undefined,
            borderBottomLeftRadius: !isUser ? 4 : undefined,
          }}>
          {msg.content}
        </div>
        <p className="text-xs mt-1 px-1" style={{
          color: 'var(--color-muted)',
          textAlign: isUser ? 'right' : 'left'
        }}>
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

const SUGGESTIONS = [
  'What is WCCC?',
  'Find members in Madison',
  'Any upcoming events?',
  'How do I post on the board?',
]

export default function ChatWindow({ onClose, fullScreen = false }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Hi! 👋 I\'m your Wisconsin Asian Hub assistant. I can help you find member businesses, learn about events, or navigate the app. What can I help you with today?',
      timestamp: new Date(),
    }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }))

      // Calls our secure Vercel serverless function — API key never exposed
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      const data = await res.json()
      const reply = data.reply ?? 'Sorry, I couldn\'t get a response. Please try again.'

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const containerStyle = fullScreen
    ? { display: 'flex', flexDirection: 'column' as const, height: '100%' }
    : {
        position: 'fixed' as const,
        bottom: '5.5rem',
        right: '1.25rem',
        width: 'min(380px, calc(100vw - 2.5rem))',
        height: 'min(560px, calc(100vh - 8rem))',
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column' as const,
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        border: '1px solid var(--color-border)',
      }

  return (
    <div style={{ ...containerStyle, background: 'var(--color-bg)' }}>
      {/* Header */}
      {!fullScreen && (
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'var(--color-red)' }}>亚</div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Hub Assistant</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Online</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-lg" style={{ color: 'var(--color-muted)' }}>✕</button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: 'rgba(185,28,28,0.1)',
                color: 'var(--color-red)',
                border: '1px solid rgba(185,28,28,0.2)',
              }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 px-4 py-3 border-t flex-shrink-0"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
        <input
          type="text"
          placeholder="Ask anything…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            fontSize: '16px',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 flex-shrink-0"
          style={{ background: 'var(--color-red)', color: '#fff' }}
        >
          →
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0) }
          30% { transform: translateY(-4px) }
        }
      `}</style>
    </div>
  )
}
