import { useState, useEffect } from 'react'
import {
  collection, addDoc, onSnapshot,
  query, serverTimestamp, updateDoc, doc, Timestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export type Cuisine = 'Chinese' | 'Vietnamese' | 'Japanese' | 'Korean' | 'Thai' | 'Filipino' | 'Asian Fusion'
export type Affiliation = 'wccc' | 'community'
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

// Only match on category field — must contain food/restaurant keywords
const FOOD_CATEGORY_KEYWORDS = [
  'restaurant', 'dim sum', 'sushi', 'pho', 'ramen', 'bistro',
  'eatery', 'dining', 'food service', 'food & beverage',
  'catering', 'bakery', 'cafe', 'coffee shop', 'bubble tea',
  'chinese food', 'vietnamese food', 'japanese food', 'korean food',
  'thai food', 'filipino food', 'asian food',
]

function isFoodBusiness(member: any): boolean {
  const category = (member.category ?? '').toLowerCase()
  return FOOD_CATEGORY_KEYWORDS.some(k => category.includes(k))
}

function memberToRestaurant(member: any): Restaurant {
  // Use cuisine field directly from members collection
  const cuisine: Cuisine = (member.cuisine as Cuisine) ?? 'Asian Fusion'

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
    affiliation: (member.wccc === true || member.wccc === 'true' || member.wccc === 1 || member.wccc === 'yes') ? 'wccc' : 'community',
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
