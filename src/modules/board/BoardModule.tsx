import { useState } from 'react'
import { usePosts, type Post } from '../../hooks/useBoard'
import PostCard from './components/PostCard'
import PostComposer from './components/PostComposer'
import CommentSheet from './components/CommentSheet'

type Filter = 'all' | 'general' | 'event'

export default function BoardModule() {
  const { posts, loading }       = usePosts()
  const [filter, setFilter]      = useState<Filter>('all')
  const [composing, setComposing] = useState(false)
  const [activePost, setActivePost] = useState<Post | null>(null)

  const filtered = posts.filter(p => filter === 'all' || p.type === filter)

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Overlays */}
      {composing  && <PostComposer onClose={() => setComposing(false)} />}
      {activePost && <CommentSheet post={activePost} onClose={() => setActivePost(null)} />}

      {/* Filter bar */}
      <div className="sticky top-14 z-40 px-4 py-3" style={{
        background: 'rgba(12,10,9,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div className="flex gap-2">
          {(['all', 'general', 'event'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize"
              style={{
                background: filter === f
                  ? f === 'event' ? 'rgba(251,191,36,0.2)' : 'var(--color-red)'
                  : 'var(--color-surface)',
                color: filter === f
                  ? f === 'event' ? 'var(--color-gold)' : '#fff'
                  : 'var(--color-muted)',
                border: `1px solid ${filter === f
                  ? f === 'event' ? 'rgba(251,191,36,0.4)' : 'var(--color-red)'
                  : 'var(--color-border)'}`,
              }}
            >
              {f === 'all' ? '🗂 All' : f === 'general' ? '💬 Posts' : '📅 Events'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Loading */}
        {loading && (
          <>
            {[1,2,3].map(i => (
              <div key={i} className="rounded-xl overflow-hidden" style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)'
              }}>
                <div className="h-1 skeleton" />
                <div className="p-4 space-y-3">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 rounded skeleton w-24" />
                      <div className="h-2 rounded skeleton w-16" />
                    </div>
                  </div>
                  <div className="h-4 rounded skeleton w-3/4" />
                  <div className="space-y-1">
                    <div className="h-2 rounded skeleton w-full" />
                    <div className="h-2 rounded skeleton w-5/6" />
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium" style={{ color: 'var(--color-text)' }}>
              No posts yet
            </p>
            <p className="text-sm mt-1 mb-6" style={{ color: 'var(--color-muted)' }}>
              Be the first to share something!
            </p>
            <button
              onClick={() => setComposing(true)}
              className="px-6 py-2.5 rounded-full text-sm font-semibold"
              style={{ background: 'var(--color-red)', color: '#fff' }}
            >
              + Create Post
            </button>
          </div>
        )}

        {/* Posts */}
        {filtered.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onComment={() => setActivePost(post)}
          />
        ))}
      </div>

      {/* FAB — floating compose button */}
      <button
        onClick={() => setComposing(true)}
        className="fixed right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg transition-transform active:scale-95"
        style={{
          bottom: '5.5rem',
          background: 'var(--color-red)',
          boxShadow: '0 4px 20px rgba(185,28,28,0.4)'
        }}
      >
        ✏️
      </button>
    </div>
  )
}
