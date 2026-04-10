import { useState, useEffect } from 'react'
import {
  collection, addDoc, onSnapshot, orderBy,
  query, serverTimestamp, updateDoc, doc, Timestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export type ItemCategory = 'Equipment & Tools' | 'Office Supplies' | 'Furniture' | 'Technology / Electronics'
export type ItemStatus = 'available' | 'requested' | 'matched'

export interface DonationItem {
  id: string
  title: string
  description: string
  category: ItemCategory
  city: string
  donorName: string
  donorEmail: string
  donorPhone: string
  status: ItemStatus
  requestedBy?: string
  requestedByBusiness?: string
  requestedByEmail?: string
  requestedByPhone?: string
  requestNote?: string
  createdAt: Timestamp | null
}

export function useDonationItems() {
  const [items, setItems]     = useState<DonationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'donations'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as DonationItem)))
      setLoading(false)
    })
    return unsub
  }, [])

  return { items, loading }
}

export async function submitDonation(data: Omit<DonationItem, 'id' | 'createdAt' | 'status'>) {
  await addDoc(collection(db, 'donations'), {
    ...data,
    status: 'available',
    createdAt: serverTimestamp(),
  })
}

export async function requestItem(itemId: string, data: {
  requestedBy: string
  requestedByBusiness: string
  requestedByEmail: string
  requestedByPhone: string
  requestNote: string
}) {
  await updateDoc(doc(db, 'donations', itemId), {
    status: 'requested',
    ...data,
  })
}
