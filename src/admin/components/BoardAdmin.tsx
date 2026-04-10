import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { usePosts } from '../../hooks/useBoard'
import type { Timestamp } from 'firebase/firestore'

function timeAgo(ts: Timestamp | null): string {
  if (!ts) return 'just now'
  const diff = Date.now() - ts.toMillis()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function BoardAdmin() {
  const { posts, loading } = usePosts()

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return
    await deleteDoc(doc(db, 'posts', id))
  }

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
        {posts.length} total posts
      </p>

      {loading && <p className="text-sm text-center" style={{ color: 'var(--color-muted)' }}>Loading...</p>}

      {posts.map(post => (
        <div key={post.id} className="rounded-xl p-4" style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)'
        }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="chip text-xs" style={{
                  background: post.type === 'event' ? 'rgba(251,191,36,0.12)' : 'rgba(185,28,28,0.12)',
                  color: post.type === 'event' ? 'var(--color-gold)' : 'var(--color-red)',
                  border: `1px solid ${post.type === 'event' ? 'rgba(251,191,36,0.3)' : 'rgba(185,28,28,0.3)'}`,
                }}>
                  {post.type === 'event' ? '📅 Event' : '💬 Post'}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  {timeAgo(post.createdAt)}
                </span>
              </div>
              <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                {post.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                by {post.author} · {post.likesCount} ❤️ · {post.commentsCount} 💬
              </p>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-muted)' }}>
                {post.body}
              </p>
            </div>
            <button onClick={() => deletePost(post.id)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
