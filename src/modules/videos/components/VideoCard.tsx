import type { VideoItem } from '../../../hooks/usePlaylist'

interface VideoCardProps {
  video: VideoItem
  featured?: boolean
  onClick: () => void
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'Today'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export default function VideoCard({ video, featured = false, onClick }: VideoCardProps) {
  if (featured) {
    return (
      <div
        className="relative w-full cursor-pointer overflow-hidden"
        style={{ background: '#111' }}
        onClick={onClick}
      >
        {/* Thumbnail */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <img
            src={video.thumbnail}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)'
          }} />
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(185,28,28,0.9)', backdropFilter: 'blur(4px)' }}>
              <span className="text-2xl ml-1">▶</span>
            </div>
          </div>
          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
            <span className="chip text-xs mb-2" style={{
              background: 'var(--color-red)', color: '#fff'
            }}>
              Featured
            </span>
            <h2 className="font-display font-bold text-lg leading-tight text-white line-clamp-2">
              {video.title}
            </h2>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {timeAgo(video.publishedAt)}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="card-hover flex gap-3 cursor-pointer rounded-xl p-2"
      style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 rounded-lg overflow-hidden" style={{ width: 120, height: 68 }}>
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.3)' }}>
          <span className="text-sm">▶</span>
        </div>
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-sm font-medium leading-tight line-clamp-2" style={{ color: 'var(--color-text)' }}>
          {video.title}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
          {timeAgo(video.publishedAt)}
        </p>
      </div>
    </div>
  )
}
