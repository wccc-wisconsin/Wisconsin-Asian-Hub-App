interface VideoPlayerProps {
  videoId: string
  title: string
  onClose: () => void
}

export default function VideoPlayer({ videoId, title, onClose }: VideoPlayerProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#000' }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.8)' }}>
        <button
          onClick={onClose}
          className="text-white text-xl leading-none p-1"
          aria-label="Close"
        >
          ✕
        </button>
        <p className="text-sm font-medium truncate flex-1" style={{ color: '#f5f0eb' }}>
          {title}
        </p>
      </div>

      {/* Embedded player — stays in app, no redirect */}
      <div className="flex-1 relative">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    </div>
  )
}
