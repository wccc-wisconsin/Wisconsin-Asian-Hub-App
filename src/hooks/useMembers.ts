import { useState, useEffect } from 'react'

export interface Member {
  id: string
  name: string
  city: string
  category: string
  email?: string
  phone?: string
  website?: string
  photo?: string
  description?: string
  [key: string]: string | undefined
}

// Column name aliases — maps common header variations to standard field names
const COLUMN_MAP: Record<string, string> = {
  name: 'name', 'business name': 'name', organization: 'name', org: 'name', company: 'name',
  city: 'city', location: 'city', town: 'city',
  category: 'category', type: 'category', industry: 'category', sector: 'category', 'business type': 'category', category_key: 'category',
  email: 'email', 'e-mail': 'email', 'contact email': 'email',
  phone: 'phone', telephone: 'phone', cell: 'phone', mobile: 'phone',
  website: 'website', url: 'website', web: 'website', site: 'website',
  photo: 'photo', image: 'photo', logo: 'photo', 'photo url': 'photo', 'image url': 'photo',
  description: 'description', bio: 'description', about: 'description', details: 'description', desc_en: 'description',
}

function normalizeKey(raw: string): string {
  const lower = raw.trim().toLowerCase()
  return COLUMN_MAP[lower] ?? lower
}

export interface SheetConfig {
  sheetId: string
  apiKey: string
  sheetName?: string  // defaults to Sheet1
  range?: string      // defaults to A:Z
}

async function fetchSheetData(config: SheetConfig): Promise<Member[]> {
  const { sheetId, apiKey, sheetName = 'Sheet1', range = 'A:Z' } = config

  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!${range}`
  )
  url.searchParams.set('key', apiKey)
  url.searchParams.set('valueRenderOption', 'UNFORMATTED_VALUE')
  url.searchParams.set('dateTimeRenderOption', 'FORMATTED_STRING')

  const res = await fetch(url.toString())

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as {error?: {message?: string}})?.error?.message ?? `HTTP ${res.status}`)
  }

  const data = await res.json() as { values?: (string | number | boolean)[][] }
  const rows = data.values ?? []

  if (rows.length < 2) return []

  const headers = rows[0].map(h => String(h))
  const normalizedHeaders = headers.map(normalizeKey)

  return rows.slice(1).map((row, i) => {
    const member: Member = { id: `member-${i}`, name: '', city: '', category: '' }

    normalizedHeaders.forEach((key, colIdx) => {
      const val = row[colIdx] != null ? String(row[colIdx]).trim() : ''
      ;(member as Record<string, string | undefined>)[key] = val
    })

    if (!member.name)     member.name     = `Member ${i + 1}`
    if (!member.city)     member.city     = 'Wisconsin'
    if (!member.category) member.category = 'General'

    return member
  }).filter(m => m.name.trim() !== '')
}

export function useMembers(config: SheetConfig | null) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!config?.sheetId || !config?.apiKey) return

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchSheetData(config)
      .then(data => { if (!cancelled) { setMembers(data); setLoading(false) } })
      .catch(err  => { if (!cancelled) { setError((err as Error).message); setLoading(false) } })

    return () => { cancelled = true }
  }, [config?.sheetId, config?.apiKey, config?.sheetName, config?.range])

  return { members, loading, error }
}
