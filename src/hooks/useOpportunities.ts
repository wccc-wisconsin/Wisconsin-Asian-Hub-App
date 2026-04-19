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
  content_type: string[]
  business_type: string[]
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
    .replace(/(\d+)(st|nd|rd|th)/g, '$1')       // 10th → 10, 1st → 1
    .replace(/\s+at\s+/gi, ' ')                  // "June 27 at 4:00" → "June 27 4:00"
    .replace(/\s*@\s*/g, ' ')                    // "June 27 @ 4:00" → "June 27 4:00"
    .replace(/\b([ap])\.m\./gi, '$1m')           // p.m. → pm, a.m. → am
    .replace(/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*/i, '') // strip day name
    .replace(/\s[A-Z]{2,4}$/, '')               // CDT, CST, EST → remove
    .trim()
}

export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null
  const cleaned = cleanDateStr(dateStr)
  const d = new Date(cleaned)
  if (!isNaN(d.getTime())) return d
  return null
}

export function matchWCCCCategories(opp: Opportunity): string[] {
  const text = `${opp.title} ${opp.summary} ${(opp.categories ?? []).join(' ')} ${opp.department}`.toLowerCase()
  return Object.entries(WCCC_CATEGORIES)
    .filter(([, keywords]) => keywords.some(k => text.includes(k.toLowerCase())))
    .map(([cat]) => cat)
}

export function isClosed(opp: Opportunity): boolean {
  if (!opp.close_date) return false
  const closeDate = parseDate(opp.close_date)
  // If date can't be parsed, treat as inactive (not open) — safer than assuming active
  if (!closeDate) return false
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const close = new Date(closeDate)
  close.setHours(0, 0, 0, 0)
  return close < now
}

export function isUnparseable(opp: Opportunity): boolean {
  // close_date exists but can't be parsed — treat as inactive
  if (!opp.close_date) return false
  return parseDate(opp.close_date) === null
}

export function isDueToday(opp: Opportunity): boolean {
  if (!opp.close_date) return false
  const closeDate = parseDate(opp.close_date)
  if (!closeDate) return false
  return closeDate.toDateString() === new Date().toDateString()
}

export function isUrgent(opp: Opportunity): boolean {
  if (!opp.close_date) return false
  const closeDate = parseDate(opp.close_date)
  if (!closeDate) return false
  const daysLeft = Math.ceil((closeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return daysLeft > 0 && daysLeft <= 7
}

export function daysUntilClose(opp: Opportunity): number | null {
  if (!opp.close_date) return null
  const closeDate = parseDate(opp.close_date)
  if (!closeDate) return null
  return Math.ceil((closeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'TBD'
  const date = parseDate(dateStr)
  if (!date) return dateStr // show raw string if unparseable
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getStatus(opp: Opportunity): 'closed' | 'due_today' | 'urgent' | 'inactive' | 'open' {
  if (isClosed(opp)) return 'closed'
  if (isDueToday(opp)) return 'due_today'
  if (isUrgent(opp)) return 'urgent'
  // No close_date, unparseable date, or active=false → inactive
  if (!opp.close_date || isUnparseable(opp) || !opp.active) return 'inactive'
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
          const aDate = a.close_date ? parseDate(a.close_date) : null
          const bDate = b.close_date ? parseDate(b.close_date) : null
          if (aDate && bDate) return aDate.getTime() - bDate.getTime()
          return 0
        })
      setOpportunities(all)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  return { opportunities, loading }
}
