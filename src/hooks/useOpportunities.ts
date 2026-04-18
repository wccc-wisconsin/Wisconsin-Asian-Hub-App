import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface Opportunity {
  id: string
  title: string
  summary: string
  department: string
  source: string
  source_url: string
  url: string
  categories: string[]
  content_type: string
  business_type: string
  open_date: string
  close_date: string
  questions_due_date: string
  first_seen: string
  scraped_at: string
  active: boolean
}

// WCCC member business category mapping
export const WCCC_CATEGORIES: Record<string, string[]> = {
  'Construction':          ['Construction', 'Building', 'Infrastructure', 'Facilities'],
  'Food & Beverage':       ['Food', 'Catering', 'Restaurant', 'Beverage'],
  'IT & Technology':       ['IT', 'Technology', 'Software', 'Digital', 'Cyber'],
  'Professional Services': ['Consulting', 'Legal', 'Accounting', 'Finance', 'Management'],
  'Healthcare':            ['Health', 'Medical', 'Dental', 'Mental Health'],
  'Retail & Wholesale':    ['Retail', 'Wholesale', 'Supply', 'Goods'],
  'Transportation':        ['Transportation', 'Logistics', 'Fleet', 'Transit'],
  'Real Estate':           ['Real Estate', 'Property', 'Facility'],
  'Marketing & Media':     ['Marketing', 'Media', 'Advertising', 'Design', 'Print'],
  'Education & Training':  ['Education', 'Training', 'Workforce', 'Youth'],
}

export function matchWCCCCategories(opp: Opportunity): string[] {
  const text = `${opp.title} ${opp.summary} ${opp.categories?.join(' ')} ${opp.department}`.toLowerCase()
  return Object.entries(WCCC_CATEGORIES)
    .filter(([, keywords]) => keywords.some(k => text.includes(k.toLowerCase())))
    .map(([cat]) => cat)
}

export function isUrgent(opp: Opportunity): boolean {
  if (!opp.close_date) return false
  const closeDate = new Date(opp.close_date)
  const now = new Date()
  const daysLeft = Math.ceil((closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysLeft >= 0 && daysLeft <= 7
}

export function daysUntilClose(opp: Opportunity): number | null {
  if (!opp.close_date) return null
  const closeDate = new Date(opp.close_date)
  const now = new Date()
  return Math.ceil((closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'milwaukee_bids'),
      where('active', '==', true)
    )
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Opportunity))
        .sort((a, b) => {
          // Urgent first, then by close date
          const aUrgent = isUrgent(a) ? 0 : 1
          const bUrgent = isUrgent(b) ? 0 : 1
          if (aUrgent !== bUrgent) return aUrgent - bUrgent
          if (a.close_date && b.close_date) return new Date(a.close_date).getTime() - new Date(b.close_date).getTime()
          return 0
        })
      setOpportunities(all)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  return { opportunities, loading }
}
