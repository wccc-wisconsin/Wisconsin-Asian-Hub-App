import { useState, useEffect } from 'react'
import {
  collection, addDoc, onSnapshot, orderBy,
  query, serverTimestamp, updateDoc, doc, Timestamp, where
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export type Cuisine = 'Chinese' | 'Vietnamese' | 'Japanese' | 'Korean' | 'Thai' | 'Filipino' | 'Asian Fusion'
export type Affiliation = 'wccc' | 'wda'
export type RestaurantStatus = 'pending' | 'approved' | 'rejected'

export interface Restaurant {
  id: string
  name: string
  cuisine: Cuisine
  city: string
  address: string
  phone: string
  website?: string
  description: string
  photoUrl?: string
  hours?: string
  affiliation: Affiliation
  status: RestaurantStatus
  featured: boolean
  weeklyDeal?: string
  submittedBy?: string
  rating?: number
  createdAt: Timestamp | null
}

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'restaurants'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      setRestaurants(snap.docs.map(d => ({ id: d.id, ...d.data() } as Restaurant)))
      setLoading(false)
    })
    return unsub
  }, [])

  return { restaurants, loading }
}

export function useAllRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'restaurants'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setRestaurants(snap.docs.map(d => ({ id: d.id, ...d.data() } as Restaurant)))
      setLoading(false)
    })
    return unsub
  }, [])

  return { restaurants, loading }
}

export async function submitRestaurant(data: Omit<Restaurant, 'id' | 'createdAt' | 'status' | 'featured'>) {
  await addDoc(collection(db, 'restaurants'), {
    ...data,
    status: 'pending',
    featured: false,
    createdAt: serverTimestamp(),
  })
}

export async function updateRestaurantStatus(id: string, status: RestaurantStatus) {
  await updateDoc(doc(db, 'restaurants', id), { status })
}

export async function toggleFeatured(id: string, featured: boolean) {
  await updateDoc(doc(db, 'restaurants', id), { featured })
}

export async function updateWeeklyDeal(id: string, weeklyDeal: string) {
  await updateDoc(doc(db, 'restaurants', id), { weeklyDeal })
}
