import { useState, useEffect } from 'react'
import {
  collection, addDoc, onSnapshot, orderBy,
  query, serverTimestamp, updateDoc, doc, increment,
  Timestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export type PostType = 'general' | 'event'

export interface EventDetails {
  date: string
  location: string
  seats: number
  rsvpCount: number
}

export interface Post {
  id: string
  type: PostType
  title: string
  body: string
  author: string
  createdAt: Timestamp | null
  likesCount: number
  commentsCount: number
  event?: EventDetails
}

export interface Comment {
  id: string
  body: string
  author: string
  createdAt: Timestamp | null
}

// ── Posts ────────────────────────────────────────────────────────────────────
export function usePosts() {
  const [posts, setPosts]   = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)))
      setLoading(false)
    })
    return unsub
  }, [])

  return { posts, loading }
}

// ── Comments ─────────────────────────────────────────────────────────────────
export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!postId) return
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment)))
      setLoading(false)
    })
    return unsub
  }, [postId])

  return { comments, loading }
}

// ── Actions ──────────────────────────────────────────────────────────────────
export async function createPost(data: {
  type: PostType
  title: string
  body: string
  author: string
  event?: Omit<EventDetails, 'rsvpCount'>
}) {
  await addDoc(collection(db, 'posts'), {
    ...data,
    likesCount: 0,
    commentsCount: 0,
    ...(data.event ? { event: { ...data.event, rsvpCount: 0 } } : {}),
    createdAt: serverTimestamp(),
  })
}

export async function addComment(postId: string, body: string, author: string) {
  await addDoc(collection(db, 'posts', postId, 'comments'), {
    body,
    author,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'posts', postId), {
    commentsCount: increment(1),
  })
}

export async function likePost(postId: string) {
  await updateDoc(doc(db, 'posts', postId), {
    likesCount: increment(1),
  })
}

export async function rsvpEvent(postId: string) {
  await updateDoc(doc(db, 'posts', postId), {
    'event.rsvpCount': increment(1),
  })
}
