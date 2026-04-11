import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type EventSource = 'wccc' | 'wedc' | 'eventbrite' | 'community'
export type EventFormat = 'in-person' | 'virtual' | 'hybrid'

export interface CommunityEvent {
  id: string
  title: string
  description: string
  source: EventSource
  format: EventFormat
  startDate: string       // ISO string
  endDate?: string
  location: string
  city: string
  url?: string
  imageUrl?: string
  isFree: boolean
  price?: string
  organizer?: string
  contactEmail?: string
  contactPhone?: string
  status?: 'pending' | 'approved'
  createdAt?: Timestamp | null
}

// ── Firestore events (WCCC + WEDC + manually added) ─────────────────────────
export function useFirestoreEvents() {
  const [events, setEvents] = useState<CommunityEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('startDate', 'asc'))
    const unsub = onSnapshot(q, snap => {
      const now = new Date().toISOString()
      setEvents(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() } as CommunityEvent))
          .filter(e => e.startDate >= now.slice(0, 10) && (e.status === 'approved' || !e.status))
      )
      setLoading(false)
    })
    return unsub
  }, [])

  return { events, loading }
}

// ── Eventbrite API ───────────────────────────────────────────────────────────
export async function fetchEventbriteEvents(token: string): Promise<CommunityEvent[]> {
  const keywords = ['Wisconsin Asian', 'Milwaukee Asian', 'WCCC Wisconsin', 'Asian Wisconsin']
  const results: CommunityEvent[] = []
  const seen = new Set<string>()

  for (const q of keywords) {
    try {
      const url = new URL('https://www.eventbriteapi.com/v3/events/search/')
      url.searchParams.set('q', q)
      url.searchParams.set('location.address', 'Wisconsin')
      url.searchParams.set('location.within', '100mi')
      url.searchParams.set('expand', 'venue,organizer')
      url.searchParams.set('start_date.range_start', new Date().toISOString().slice(0, 19) + 'Z')
      url.searchParams.set('sort_by', 'date')
      url.searchParams.set('page_size', '20')

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) continue

      const data = await res.json() as {
        events: {
          id: string
          name: { text: string }
          description: { text: string }
          start: { local: string }
          end: { local: string }
          url: string
          logo?: { url: string }
          is_free: boolean
          ticket_availability?: { minimum_ticket_price?: { display: string } }
          venue?: { address?: { localized_address_display: string }; city?: string }
          organizer?: { name: string }
          online_event: boolean
        }[]
      }

      for (const e of data.events ?? []) {
        if (seen.has(e.id)) continue
        seen.add(e.id)
        results.push({
          id: `eb-${e.id}`,
          title: e.name.text,
          description: e.description?.text?.slice(0, 300) ?? '',
          source: 'eventbrite',
          format: e.online_event ? 'virtual' : 'in-person',
          startDate: e.start.local,
          endDate: e.end.local,
          location: e.venue?.address?.localized_address_display ?? 'Wisconsin',
          city: e.venue?.city ?? 'Wisconsin',
          url: e.url,
          imageUrl: e.logo?.url,
          isFree: e.is_free,
          price: e.ticket_availability?.minimum_ticket_price?.display,
          organizer: e.organizer?.name,
        })
      }
    } catch { continue }
  }

  return results.sort((a, b) => a.startDate.localeCompare(b.startDate))
}

// ── Add event (admin) ────────────────────────────────────────────────────────
export async function addEvent(data: Omit<CommunityEvent, 'id' | 'createdAt'>) {
  const clean: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && v !== '') clean[k] = v
  }
  await addDoc(collection(db, 'events'), { ...clean, createdAt: serverTimestamp() })
}

// ── Group events by time period ──────────────────────────────────────────────
export function groupEventsByPeriod(events: CommunityEvent[]) {
  const now = new Date()
  const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7)
  const monthEnd = new Date(now); monthEnd.setDate(now.getDate() + 30)

  const groups: { label: string; events: CommunityEvent[] }[] = [
    { label: 'This Week', events: [] },
    { label: 'This Month', events: [] },
    { label: 'Coming Up', events: [] },
  ]

  for (const e of events) {
    const d = new Date(e.startDate)
    if (d <= weekEnd) groups[0].events.push(e)
    else if (d <= monthEnd) groups[1].events.push(e)
    else groups[2].events.push(e)
  }

  return groups.filter(g => g.events.length > 0)
}
