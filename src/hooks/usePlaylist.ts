import { useState, useEffect } from 'react'

export interface VideoItem {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  videoId: string
}

async function fetchPlaylist(playlistId: string, apiKey: string): Promise<VideoItem[]> {
  const all: VideoItem[] = []
  let pageToken = ''

  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
    url.searchParams.set('part', 'snippet')
    url.searchParams.set('playlistId', playlistId)
    url.searchParams.set('maxResults', '50')
    url.searchParams.set('key', apiKey)
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const res = await fetch(url.toString())
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as {error?: {message?: string}})?.error?.message ?? `HTTP ${res.status}`)
    }

    const data = await res.json() as {
      items: {
        snippet: {
          title: string
          description: string
          publishedAt: string
          thumbnails: { high?: { url: string }, medium?: { url: string } }
          resourceId: { videoId: string }
        }
      }[]
      nextPageToken?: string
    }

    for (const item of data.items) {
      const s = item.snippet
      if (!s.resourceId.videoId) continue
      all.push({
        id: s.resourceId.videoId,
        videoId: s.resourceId.videoId,
        title: s.title,
        description: s.description,
        thumbnail: s.thumbnails.high?.url ?? s.thumbnails.medium?.url ?? '',
        publishedAt: s.publishedAt,
      })
    }

    pageToken = data.nextPageToken ?? ''
  } while (pageToken)

  return all
}

export function usePlaylist(playlistId: string, apiKey: string) {
  const [videos, setVideos]   = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!playlistId || !apiKey) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchPlaylist(playlistId, apiKey)
      .then(data => { if (!cancelled) { setVideos(data); setLoading(false) } })
      .catch(err  => { if (!cancelled) { setError((err as Error).message); setLoading(false) } })

    return () => { cancelled = true }
  }, [playlistId, apiKey])

  return { videos, loading, error }
}
