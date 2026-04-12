import { useState, useEffect } from 'react'
import {
  collection, addDoc, onSnapshot, orderBy,
  query, serverTimestamp, Timestamp, where, deleteDoc, doc
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface EventComment {
  id: string
  eventId: string
  authorName: string
  body: string
  createdAt: Timestamp | null
}

export function useEventComments(eventId: string) {
  const [comments, setComments] = useState<EventComment[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!eventId) return
    const q = query(
      collection(db, 'eventComments'),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as EventComment)))
      setLoading(false)
    })
    return unsub
  }, [eventId])

  return { comments, loading }
}

export async function addEventComment(eventId: string, authorName: string, body: string) {
  await addDoc(collection(db, 'eventComments'), {
    eventId, authorName, body,
    createdAt: serverTimestamp(),
  })
}

export async function deleteEventComment(commentId: string) {
  await deleteDoc(doc(db, 'eventComments', commentId))
}
