import { useState } from 'react'
import type { CommunityEvent } from '../../../hooks/useEvents'
import AttendeeList from './AttendeeList'
import RSVPForm from './RSVPForm'
import EventComments from './EventComments'

const SOURCE_STYLES = {
  wccc:       { bg: 'rgba(185,28,28,0.12)',  color: 'var(--color-red)',  border: 'rgba(185,28,28,0.3)',  label: '🔴 WCCC'       },
  wedc:       { bg: 'rgba(29,78,216,0.12)',  color: '#1d4ed8',           border: 'rgba(29,78,216,0.3)',  label: '🏛️ WEDC'       },
  eventbrite: { bg: 'rgba(243,115,53,0.12)', color: '#f37335',           border: 'rgba(243,115,53,0.3)', label: '🎟️ Eventbrite' },
  community:  { bg: 'rgba(22,163,74,0.12)',  color: '#16a34a',           border: 'rgba(22,163,74,0.3)',  label: '🌏 Community'  },
}

const FORMAT_LABELS = {
  'in-person': '📍 In-Person',
  'virtual':   '💻 Virtual',
  'hybrid':    '🔀 Hybrid',
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    })
  } catch { return dateStr }
}

interface EventCardProps {
  event: CommunityEvent
}

function addToCalendar(event: CommunityEvent & { address?: string }) {
  const start = new Date(event.startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const end = event.endDate
    ? new Date(event.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    : new Date(new Date(event.startDate).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const location = [event.location, (event as CommunityEvent & { address?: string }).address, event.city]
    .filter(Boolean).join(', ')

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${(event.description ?? '').replace(/
/g, '\n')}`,
    `LOCATION:${location}`,
    event.url ? `URL:${event.url}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('
')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

export default function EventCard({ event }: EventCardProps) {
  const [rsvping, setRsvping] = useState(false)
  const src = SOURCE_STYLES[event.source]

  return (
    <>
      <article className="rounded-xl overflow-hidden card-hover" style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}>
        {/* Image */}
        {event.imageUrl && (
          <div className="w-full relative" style={{ paddingBottom: '45%' }}>
            <img src={event.imageUrl} alt={event.title}
              className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)'
            }} />
            <div className="absolute top-2 left-2">
              <span className="chip text-xs font-semibold" style={{
                background: src.bg, color: src.color, border: `1px solid ${src.border}`,
                backdropFilter: 'blur(4px)'
              }}>{src.label}</span>
            </div>
          </div>
        )}

        <div className="p-4">
          {!event.imageUrl && (
            <span className="chip text-xs font-semibold mb-2 inline-block" style={{
              background: src.bg, color: src.color, border: `1px solid ${src.border}`
            }}>{src.label}</span>
          )}

          {/* Flag banner */}
          {(event as CommunityEvent & { flag?: string; partnerName?: string }).flag && (
            <div className="rounded-lg px-3 py-2 mb-3 flex items-center gap-2" style={{
              background: (event as CommunityEvent & { flag?: string }).flag === 'wccc'
                ? 'rgba(185,28,28,0.1)' : (event as CommunityEvent & { flag?: string }).flag === 'featured'
                ? 'rgba(251,191,36,0.1)' : 'rgba(29,78,216,0.1)',
              border: `1px solid ${(event as CommunityEvent & { flag?: string }).flag === 'wccc'
                ? 'rgba(185,28,28,0.3)' : (event as CommunityEvent & { flag?: string }).flag === 'featured'
                ? 'rgba(251,191,36,0.3)' : 'rgba(29,78,216,0.3)'}`,
            }}>
              <span className="text-sm">
                {(event as CommunityEvent & { flag?: string }).flag === 'wccc' ? '🔴' :
                 (event as CommunityEvent & { flag?: string }).flag === 'featured' ? '⭐' : '🤝'}
              </span>
              <span className="text-xs font-semibold" style={{
                color: (event as CommunityEvent & { flag?: string }).flag === 'wccc'
                  ? 'var(--color-red)' : (event as CommunityEvent & { flag?: string }).flag === 'featured'
                  ? 'var(--color-gold)' : '#1d4ed8'
              }}>
                {(event as CommunityEvent & { flag?: string }).flag === 'wccc' ? 'Official WCCC Event' :
                 (event as CommunityEvent & { flag?: string }).flag === 'featured' ? 'Featured Event' :
                 `Partner Event${(event as CommunityEvent & { partnerName?: string }).partnerName ? ` · ${(event as CommunityEvent & { partnerName?: string }).partnerName}` : ''}`}
              </span>
            </div>
          )}

          <h3 className="font-display font-semibold text-sm leading-snug mb-2"
            style={{ color: 'var(--color-text)' }}>
            {event.title}
          </h3>

          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-gold)' }}>
              <span>📅</span><span>{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
              <span>📍</span><span className="truncate">{event.location}</span>
            </div>
            {(event as CommunityEvent & { address?: string }).address && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
                <span>🏢</span><span className="truncate">{(event as CommunityEvent & { address?: string }).address}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="chip text-xs" style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--color-muted)',
              border: '1px solid var(--color-border)'
            }}>
              {FORMAT_LABELS[event.format]}
            </span>
            <span className="chip text-xs" style={{
              background: event.isFree ? 'rgba(22,163,74,0.1)' : 'rgba(251,191,36,0.1)',
              color: event.isFree ? '#16a34a' : 'var(--color-gold)',
              border: `1px solid ${event.isFree ? 'rgba(22,163,74,0.25)' : 'rgba(251,191,36,0.25)'}`
            }}>
              {event.isFree ? '✅ Free' : `💰 ${event.price ?? 'Paid'}`}
            </span>
          </div>

          {event.description && (
            <p className="text-xs leading-relaxed line-clamp-2 mb-3"
              style={{ color: 'var(--color-muted)' }}>
              {event.description}
            </p>
          )}

          <div className="flex gap-2 mb-3">
            {event.url && (
              <a href={event.url} target="_blank" rel="noopener noreferrer"
                className="flex-1 text-center text-xs font-semibold py-2 rounded-lg"
                style={{ background: src.bg, color: src.color, border: `1px solid ${src.border}` }}>
                📋 View Event →
              </a>
            )}
            <button
              onClick={() => addToCalendar(event as CommunityEvent & { address?: string })}
              className="text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1"
              style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--color-gold)', border: '1px solid rgba(251,191,36,0.25)' }}>
              📅 Save
            </button>
          </div>
        </div>

        {/* Attendee list */}
        <div className="px-4">
          <AttendeeList eventId={event.id} onRSVP={() => setRsvping(true)} />
        </div>

        {/* Comments */}
        <div className="px-4 pb-4">
          <EventComments eventId={event.id} />
        </div>
      </article>

      {rsvping && (
        <RSVPForm
          eventId={event.id}
          eventTitle={event.title}
          onClose={() => setRsvping(false)}
        />
      )}
    </>
  )
}
