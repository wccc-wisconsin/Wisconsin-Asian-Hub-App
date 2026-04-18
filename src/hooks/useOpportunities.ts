import { useState, useEffect } from 'react'
import { collection, query, onSnapshot } from 'firebase/firestore'
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

export const WCCC_CATEGORIES: Record<string, string[]> = {
  'Construction':          ['Construction', 'Building', 'Infrastructure', 'Facilities', 'Renovation', 'Roofing', 'Plumbing', 'Electrical'],
  'Food & Beverage':       ['Food', 'Catering', 'Restaurant', 'Beverage', 'Dining', 'Kitchen'],
  'IT & Technology':       ['IT', 'Technology', 'Software', 'Digital', 'Cyber', 'Network', 'Computer', 'Data'],
  'Professional Services': ['Consulting', 'Legal', 'Accounting', 'Finance', 'Management', 'Audit', 'Advisory'],
  'Healthcare':            ['Health', 'Medical', 'Dental', 'Mental Health', 'Nursing', 'Clinical'],
  'Retail & Wholesale':    ['Retail', 'Wholesale', 'Supply', 'Goods', 'Product', 'Equipment'],
  'Transportation':        ['Transportation', 'Logistics', 'Fleet', 'Transit', 'Delivery', 'Vehicle'],
  'Real Estate':           ['Real Estate', 'Property', 'Facility', 'Leasing', 'Space'],
  'Marketing & Media':     ['Marketing', 'Media', 'Advertising', 'Design', 'Print', 'Communications'],
  'Education & Training':  ['Education', 'Training', 'Workforce', 'Youth', 'Learning'],
}

export function cleanDateStr(dateStr: string): string {
  return dateStr
    .replace(/(\d+)(st|nd|rd|th)/g, '$1') // 10th → 10, 1st → 1, 2nd → 2, 3rd → 3
    .replace(/\s[A-Z]{2,4}$/, '')          // remove timezone: CDT, CST, EST, PDT
    .trim()
}

export function matchWCCCCategories(opp: Opportunity): string[] {
  const text = `${opp.title} ${opp.summary} ${opp.categories?.join(' ')} ${opp.department}`.toLowerCase()
  return Object.entries(WCCC_CATEGORIES)
    .filter(([, keywords]) => keywords.some(k => text.includes(k.toLowerCase())))
    .map(([cat]) => cat)
}

export function isClosed(opp: Opportunity): boolean {
  if (!opp.close_date) return false
  const closeDate = new Date(cleanDateStr(opp.close_date))
  if (isNaN(closeDate.getTime())) return false
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const close = new Date(closeDate)
  close.setHours(0, 0, 0, 0)
  return close < now
}

export function isDueToday(opp: Opportunity): boolean {
  if (!opp.close_date) return false
  const closeDate = new Date(cleanDateStr(opp.close_date))
  if (isNaN(closeDate.getTime())) return false
  const now = new Date()
  return closeDate.toDateString() === now.toDateString()
}

export function isUrgent(opp: Opportunity): boolean {
  if (!opp.close_date) return false
  const closeDate = new Date(cleanDateStr(opp.close_date))
  if (isNaN(closeDate.getTime())) return false
  const now = new Date()
  const daysLeft = Math.ceil((closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysLeft > 0 && daysLeft <= 7
}

export function daysUntilClose(opp: Opportunity): number | null {
  if (!opp.close_date) return null
  const closeDate = new Date(cleanDateStr(opp.close_date))
  if (isNaN(closeDate.getTime())) return null
  const now = new Date()
  return Math.ceil((closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'TBD'
  const date = new Date(cleanDateStr(dateStr))
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getStatus(opp: Opportunity): 'closed' | 'due_today' | 'urgent' | 'inactive' | 'open' {
  if (isClosed(opp)) return 'closed'
  if (isDueToday(opp)) return 'due_today'
  if (isUrgent(opp)) return 'urgent'
  if (!opp.active) return 'inactive'
  return 'open'
}

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'milwaukee_bids'))
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Opportunity))
        .sort((a, b) => {
          const order = { due_today: 0, urgent: 1, open: 2, inactive: 3, closed: 4 }
          const aScore = order[getStatus(a)]
          const bScore = order[getStatus(b)]
          if (aScore !== bScore) return aScore - bScore
          if (a.close_date && b.close_date) {
            return new Date(cleanDateStr(a.close_date)).getTime() - new Date(cleanDateStr(b.close_date)).getTime()
          }
          return 0
        })
      setOpportunities(all)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  return { opportunities, loading }
}
