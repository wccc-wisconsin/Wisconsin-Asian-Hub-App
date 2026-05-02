import { useState, useEffect } from 'react'
import {
  collection, addDoc, onSnapshot,
  query, serverTimestamp, updateDoc, doc, Timestamp
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
  isLogo?: boolean
  hours?: string
  affiliation: Affiliation
  status: RestaurantStatus
  featured: boolean
  weeklyDeal?: string
  submittedBy?: string
  rating?: number
  createdAt: Timestamp | null
}

// Cuisine keywords to match against members collection category field
const CUISINE_KEYWORDS = [
  'restaurant', 'chinese', 'vietnamese', 'japanese', 'korean', 'thai',
  'filipino', 'asian', 'fusion', 'dim sum', 'sushi', 'pho', 'ramen',
  'food', 'dining', 'catering', 'bistro', 'cafe', 'kitchen', 'eatery',
]

function isFoodBusiness(member: any): boolean {
  const text = `${member.category ?? ''} ${member.name ?? ''}`.toLowerCase()
  return CUISINE_KEYWORDS.some(k => text.includes(k))
}

function memberToRestaurant(member: any): Restaurant {
  // Map cuisine from category field
  const categoryLower = (member.category ?? '').toLowerCase()
  let cuisine: Cuisine = 'Asian Fusion'
  if (categoryLower.includes('chinese'))    cuisine = 'Chinese'
  else if (categoryLower.includes('vietnamese')) cuisine = 'Vietnamese'
  else if (categoryLower.includes('japanese') || categoryLower.includes('sushi')) cuisine = 'Japanese'
  else if (categoryLower.includes('korean')) cuisine = 'Korean'
  else if (categoryLower.includes('thai'))  cuisine = 'Thai'
  else if (categoryLower.includes('filipino')) cuisine = 'Filipino'

  return {
    id:          member.id,
    name:        member.name ?? '',
    cuisine,
    city:        member.city ?? '',
    address:     member.address ?? '',
    phone:       member.phone ?? '',
    website:     member.googleWebsite || member.website || '',
    description: member.description ?? '',
    photoUrl:    '',  // photos disabled to avoid API costs
    affiliation: member.wccc ? 'wccc' : 'wda',
    status:      'approved',
    featured:    member.featured ?? false,
    weeklyDeal:  member.weeklyDeal,
    rating:      member.rating ?? undefined,
    createdAt:   member.createdAt ?? null,
  }
}

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    // Read from members collection — filter food businesses in JS
    const q = query(collection(db, 'members'))
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(isFoodBusiness)
        .map(memberToRestaurant)
        .sort((a, b) => {
          // WCCC members first, then alphabetical
          if (a.affiliation === 'wccc' && b.affiliation !== 'wccc') return -1
          if (a.affiliation !== 'wccc' && b.affiliation === 'wccc') return 1
          return a.name.localeCompare(b.name)
        })
      setRestaurants(all)
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
    const q = query(collection(db, 'restaurants'))
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Restaurant))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      setRestaurants(all)
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
