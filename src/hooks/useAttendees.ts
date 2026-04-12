import { useState, useEffect } from 'react'
import {
  collection, addDoc, onSnapshot, orderBy,
  query, serverTimestamp, Timestamp, where, getDocs
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export type Privacy = 'public' | 'city' | 'private'

export interface Attendee {
  id: string
  eventId: string
  name: string
  email: string
  phone?: string
  city?: string
  privacy: Privacy
  createdAt: Timestamp | null
}

export function useAttendees(eventId: string) {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!eventId) return
    const q = query(
      collection(db, 'attendees'),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, snap => {
      setAttendees(snap.docs.map(d => ({ id: d.id, ...d.data() } as Attendee)))
      setLoading(false)
    })
    return unsub
  }, [eventId])

  return { attendees, loading }
}

export async function rsvpEvent(data: Omit<Attendee, 'id' | 'createdAt'>) {
  // Check if already registered with same email
  const existing = await getDocs(
    query(
      collection(db, 'attendees'),
      where('eventId', '==', data.eventId),
      where('email', '==', data.email)
    )
  )
  if (!existing.empty) throw new Error('already_registered')

  await addDoc(collection(db, 'attendees'), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export function getPublicName(attendee: Attendee): string | null {
  if (attendee.privacy === 'private') return null
  if (attendee.privacy === 'city') return attendee.city ? `Someone from ${attendee.city}` : 'A community member'
  return attendee.name
}
