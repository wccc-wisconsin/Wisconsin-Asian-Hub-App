export type ResourceCategory =
  | 'Banking & Finance'
  | 'Legal'
  | 'Real Estate'
  | 'Insurance'
  | 'Healthcare'
  | 'Marketing'
  | 'IT & Technology'
  | 'Other'

export interface TrustedResource {
  id: string
  name: string
  category: ResourceCategory
  badge?: 'banking_partner' | 'legal_partner' | 'healthcare_partner' | 'verified' | null
  tagline: string
  description: string
  logo: string
  website: string
  email: string
  phone: string
  address: string
  services: string[]
  languages: string[]
  memberOffer: string
  gallery: string[]
  contactName: string
  active: boolean
  createdAt?: string
}

export const CATEGORY_CONFIG: Record<ResourceCategory, { icon: string; color: string; bg: string }> = {
  'Banking & Finance': { icon: '🏦', color: '#0369a1', bg: 'rgba(3,105,161,0.1)'   },
  'Legal':             { icon: '⚖️', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)'  },
  'Real Estate':       { icon: '🏢', color: '#b45309', bg: 'rgba(180,83,9,0.1)'    },
  'Insurance':         { icon: '🛡️', color: '#0f766e', bg: 'rgba(15,118,110,0.1)'  },
  'Healthcare':        { icon: '🏥', color: '#dc2626', bg: 'rgba(220,38,38,0.1)'   },
  'Marketing':         { icon: '📣', color: '#d97706', bg: 'rgba(217,119,6,0.1)'   },
  'IT & Technology':   { icon: '💻', color: '#2563eb', bg: 'rgba(37,99,235,0.1)'   },
  'Other':             { icon: '🌟', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
}

export const BADGE_CONFIG = {
  banking_partner:    { label: '🏦 Trusted Banking Partner',    bg: 'rgba(3,105,161,0.15)',   color: '#0369a1', border: 'rgba(3,105,161,0.3)'   },
  legal_partner:      { label: '⚖️ Trusted Legal Partner',      bg: 'rgba(124,58,237,0.15)',  color: '#7c3aed', border: 'rgba(124,58,237,0.3)'  },
  healthcare_partner: { label: '🏥 Trusted Healthcare Partner', bg: 'rgba(220,38,38,0.15)',   color: '#dc2626', border: 'rgba(220,38,38,0.3)'   },
  verified:           { label: '✅ WCCC Verified',               bg: 'rgba(185,28,28,0.12)',   color: '#B91C1C', border: 'rgba(185,28,28,0.25)'  },
}
