import { useState, useEffect } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore'
import { auth, googleProvider, db } from '../lib/firebase'

export interface AdminUser {
  email: string
  addedAt: string
}

export function useAuth() {
  const [user, setUser]         = useState<User | null>(null)
  const [isAdmin, setIsAdmin]   = useState(false)
  const [loading, setLoading]   = useState(true)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u)
      if (u?.email) {
        const snap = await getDoc(doc(db, 'admins', u.email))
        setIsAdmin(snap.exists())
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
      setChecking(false)
    })
    return unsub
  }, [])

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider)
  }

  async function signOutAdmin() {
    await signOut(auth)
  }

  return { user, isAdmin, loading: loading || checking, signInWithGoogle, signOutAdmin }
}

export function useAdminUsers() {
  const [admins, setAdmins]   = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'admins'), snap => {
      setAdmins(snap.docs.map(d => ({ email: d.id, ...d.data() } as AdminUser)))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  async function addAdmin(email: string) {
    await setDoc(doc(db, 'admins', email), { addedAt: new Date().toISOString() })
  }

  async function removeAdmin(email: string) {
    await deleteDoc(doc(db, 'admins', email))
  }

  return { admins, loading, addAdmin, removeAdmin }
}
