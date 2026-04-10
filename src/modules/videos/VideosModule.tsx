import { useState, useMemo, useEffect } from 'react'
import { usePlaylist } from '../../hooks/usePlaylist'
import VideoCard from './components/VideoCard'
import VideoPlayer from './components/VideoPlayer'

const PLAYLIST_ID  = import.meta.env.VITE_YOUTUBE_PLAYLIST_ID ?? ''
const API_KEY      = import.meta.env.VITE_YOUTUBE_API_KEY ?? ''
const ROTATE_MS    = 8000

function SkeletonCard() {
  return (
    <div className="flex gap-3 rounded-xl p-2" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
      <div className="rounded-lg skeleton flex-shrink-0" style={{ width: 120, height: 68 }} />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 rounded skeleton w-full" />
        <div className="h-3 rounded skeleton w-4/5" />
        <div className="h-2 rounded skeleton w-16" />
      </div>
    </div>
  )
}

export default function VideosModule() {
  const { videos, loading, error } = usePlaylist(PLAYLIST_ID, API_KEY)
  const [search, setSearch]        = useState('')
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [activeVideo, setActiveVideo]     = useState<{ videoId: string; title: string } | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return videos.filter(v =>
      !q || v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q)
    )
  }, [videos, search])

  // Auto-rotate featured every 8s, pause when player is open or searching
  useEffect(() => {
    if (filtered.length <= 1 || activeVideo || search) return
    const timer = setInterval(() => {
      setFeaturedIndex(i => (i + 1) % filtered.length)
    }, ROTATE_MS)
    return () => clearInterval(timer)
  }, [filtered.length, activeVideo, search])

  // Reset featured index when search changes
  useEffect(() => { setFeaturedIndex(0) }, [search])

  const featured = filtered[featuredIndex]
  const rest     = filtered.filter((_, i) => i !== featuredIndex)

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Inline player overlay */}
      {activeVideo && (
        <VideoPlayer
          videoId={activeVideo.videoId}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}

      {/* Search bar */}
      <div className="sticky top-14 z-40 px-4 py-3"
        style={{ background: 'rgba(12,10,9,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-6xl mx-auto relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-muted)' }}>🔍</span>
          <input
            type="text"
            placeholder="Search videos…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '16px',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--color-muted)' }}>✕</button>
          )}
        </div>
        <p className="text-xs mt-2 max-w-6xl mx-auto" style={{ color: 'var(--color-muted)' }}>
          <span style={{ color: 'var(--color-gold)' }}>{filtered.length}</span> of {videos.length} videos
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 rounded-xl p-4" style={{ background: 'rgba(185,28,28,0.1)', border: '1px solid rgba(185,28,28,0.3)' }}>
          <p className="text-sm" style={{ color: '#ef4444' }}>⚠️ {error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="px-4 mt-4 space-y-3">
          <div className="rounded-xl skeleton w-full" style={{ height: 220 }} />
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🎬</p>
          <p className="font-medium" style={{ color: 'var(--color-text)' }}>No videos found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Try a different search</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && featured && (
        <>
          {/* Featured — rotates every 8s */}
          <div className="mt-4 relative">
            <VideoCard
              key={featured.videoId}
              video={featured}
              featured
              onClick={() => setActiveVideo({ videoId: featured.videoId, title: featured.title })}
            />

            {/* Dot indicators */}
            {filtered.length > 1 && !search && (
              <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5 pb-2">
                {filtered.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFeaturedIndex(i)}
                    className="rounded-full transition-all"
                    style={{
                      width:  i === featuredIndex ? 20 : 6,
                      height: 6,
                      background: i === featuredIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Progress bar */}
            {!search && filtered.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <div
                  key={featuredIndex}
                  className="h-full"
                  style={{
                    background: 'var(--color-red)',
                    animation: `progressBar ${ROTATE_MS}ms linear forwards`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Rest of playlist */}
          {rest.length > 0 && (
            <div className="px-4 mt-4 space-y-3">
              <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--color-muted)' }}>
                MORE VIDEOS
              </h3>
              {rest.map(v => (
                <VideoCard
                  key={v.id}
                  video={v}
                  onClick={() => setActiveVideo({ videoId: v.videoId, title: v.title })}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Progress bar keyframe */}
      <style>{`
        @keyframes progressBar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  )
}
