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
  flag?: 'wccc' | 'partner' | 'featured' | null
  partnerName?: string
  createdAt?: Timestamp | null
}

// ── Firestore events (WCCC + WEDC + manually added) ─────────────────────────
export function useFirestoreEvents() {
  const [events, setEvents] = useState<CommunityEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('startDate', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setEvents(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() } as CommunityEvent))
          .filter(e => (e.status === 'approved' || !e.status))
      )
      setLoading(false)
    })
    return unsub
  }, [])

  return { events, loading }
}

// ── Eventbrite API ───────────────────────────────────────────────────────────
// Fetches events from WCCC's own Eventbrite organization
export async function fetchEventbriteEvents(token: string): Promise<CommunityEvent[]> {
  const results: CommunityEvent[] = []

  try {
    // Get the current user's organization ID first
    const meRes = await fetch('https://www.eventbriteapi.com/v3/users/me/organizations/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!meRes.ok) return []

    const meData = await meRes.json() as { organizations: { id: string }[] }
    const orgId = meData.organizations?.[0]?.id
    if (!orgId) return []

    // Fetch events for this organization
    const url = new URL(`https://www.eventbriteapi.com/v3/organizations/${orgId}/events/`)
    url.searchParams.set('expand', 'venue,organizer,ticket_availability')
    url.searchParams.set('status', 'live')
    url.searchParams.set('order_by', 'start_asc')
    url.searchParams.set('page_size', '50')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return []

    const data = await res.json() as {
      events: {
        id: string
        name: { text: string }
        description: { text: string }
        start: { local: string }
        end: { local: string }
        url: string
        logo?: { original?: { url: string } }
        is_free: boolean
        ticket_availability?: { minimum_ticket_price?: { display: string } }
        venue?: { address?: { localized_address_display: string }; city?: string }
        organizer?: { name: string }
        online_event: boolean
      }[]
    }

    for (const e of data.events ?? []) {
      // Only show future events
      if (new Date(e.start.local) < new Date()) continue
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
        imageUrl: e.logo?.original?.url,
        isFree: e.is_free,
        price: e.ticket_availability?.minimum_ticket_price?.display,
        organizer: e.organizer?.name,
      })
    }
  } catch { return [] }

  return results
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

  const upcoming: CommunityEvent[] = []
  const thisWeek: CommunityEvent[] = []
  const past:     CommunityEvent[] = []

  for (const e of events) {
    const d = new Date(e.startDate)
    if (d < now)          past.push(e)
    else if (d <= weekEnd) thisWeek.push(e)
    else                   upcoming.push(e)
  }

  const groups: { label: string; events: CommunityEvent[] }[] = []
  if (thisWeek.length) groups.push({ label: 'This Week',   events: thisWeek })
  if (upcoming.length) groups.push({ label: 'Coming Up',   events: upcoming })
  if (past.length)     groups.push({ label: 'Past Events', events: past.reverse() })

  return groups
}
