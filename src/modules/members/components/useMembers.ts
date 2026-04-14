import { useState, useEffect } from 'react'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface Member {
  id: string
  name: string
  city: string
  category: string
  email?: string
  phone?: string
  website?: string
  photo?: string
  googlePhoto?: string
  description?: string
  address?: string
  rating?: number
  placeId?: string
  wccc?: boolean
  enriched?: boolean
}

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'members'))
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Member))
        .filter(m => m.name?.trim())
        .sort((a, b) => a.name.localeCompare(b.name))
      setMembers(all)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  return { members, loading }
}
