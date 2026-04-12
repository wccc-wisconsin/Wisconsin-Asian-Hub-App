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

const FORMAT_LABELS: Record<string, string> = {
  'in-person': '📍 In-Person',
  'virtual':   '💻 Virtual',
  'hybrid':    '🔀 Hybrid',
}

type EventWithExtras = CommunityEvent & { address?: string; flag?: string; partnerName?: string }

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    })
  } catch { return dateStr }
}

function toICSDate(dateStr: string): string {
  return new Date(dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function addToCalendar(event: EventWithExtras) {
  const start = toICSDate(event.startDate)
  const end = event.endDate
    ? toICSDate(event.endDate)
    : toICSDate(new Date(new Date(event.startDate).getTime() + 2 * 60 * 60 * 1000).toISOString())

  const location = [event.location, event.address, event.city].filter(Boolean).join(', ')
  const desc = (event.description ?? '').replace(/\n/g, '\\n')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wisconsin Asian Hub//EN',
    'BEGIN:VEVENT',
    'DTSTART:' + start,
    'DTEND:' + end,
    'SUMMARY:' + event.title,
    'DESCRIPTION:' + desc,
    'LOCATION:' + location,
  ]
  if (event.url) lines.push('URL:' + event.url)
  lines.push('END:VEVENT', 'END:VCALENDAR')

  const ics  = lines.join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.ics'
  a.click()
  URL.revokeObjectURL(url)
}

interface EventCardProps { event: CommunityEvent }

export default function EventCard({ event }: EventCardProps) {
  const [rsvping, setRsvping] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const e = event as EventWithExtras
  const src = SOURCE_STYLES[event.source] ?? SOURCE_STYLES.community

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
          </div>
        )}

        <div className="p-4">
          {/* Flag banners */}
          {e.flag && (
            <div className="flex flex-col gap-1.5 mb-3">
              {(Array.isArray(e.flag) ? e.flag : [e.flag]).map((f: string) => (
                <div key={f} className="rounded-lg px-3 py-2 flex items-center gap-2" style={{
                  background: f === 'wccc' ? 'rgba(185,28,28,0.1)' : f === 'featured' ? 'rgba(251,191,36,0.1)' : 'rgba(29,78,216,0.1)',
                  border: '1px solid ' + (f === 'wccc' ? 'rgba(185,28,28,0.3)' : f === 'featured' ? 'rgba(251,191,36,0.3)' : 'rgba(29,78,216,0.3)'),
                }}>
                  <span className="text-sm">
                    {f === 'wccc' ? '🔴' : f === 'featured' ? '⭐' : '🤝'}
                  </span>
                  <span className="text-xs font-semibold" style={{
                    color: f === 'wccc' ? 'var(--color-red)' : f === 'featured' ? 'var(--color-gold)' : '#1d4ed8'
                  }}>
                    {f === 'wccc' ? 'Official WCCC Event' :
                     f === 'featured' ? 'Featured Event' :
                     'Partner Event' + (e.partnerName ? ' · ' + e.partnerName : '')}
                  </span>
                </div>
              ))}
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
            {e.address && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
                <span>🏢</span><span className="truncate">{e.address}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="chip text-xs" style={{
              background: 'rgba(255,255,255,0.05)', color: 'var(--color-muted)',
              border: '1px solid var(--color-border)'
            }}>
              {FORMAT_LABELS[event.format] ?? event.format}
            </span>
            <span className="chip text-xs" style={{
              background: event.isFree ? 'rgba(22,163,74,0.1)' : 'rgba(251,191,36,0.1)',
              color: event.isFree ? '#16a34a' : 'var(--color-gold)',
              border: '1px solid ' + (event.isFree ? 'rgba(22,163,74,0.25)' : 'rgba(251,191,36,0.25)')
            }}>
              {event.isFree ? '✅ Free' : '💰 ' + (event.price ?? 'Paid')}
            </span>
          </div>

          {event.description && (
            <div className="mb-3">
              <p className="text-xs leading-relaxed" style={{
                color: 'var(--color-muted)',
                display: '-webkit-box',
                WebkitLineClamp: expanded ? 'unset' : 3,
                WebkitBoxOrient: 'vertical' as const,
                overflow: expanded ? 'visible' : 'hidden'
              }}>
                {event.description}
              </p>
              {event.description.length > 120 && (
                <button onClick={() => setExpanded(e => !e)}
                  className="text-xs mt-1"
                  style={{ color: 'var(--color-red)' }}>
                  {expanded ? 'Show less ↑' : 'Read more ↓'}
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mb-3">
            {event.url && (
              <a href={event.url} target="_blank" rel="noopener noreferrer"
                className="flex-1 text-center text-xs font-semibold py-2 rounded-lg"
                style={{ background: 'rgba(185,28,28,0.08)', color: 'var(--color-red)', border: '1px solid rgba(185,28,28,0.2)' }}>
                📋 View Event →
              </a>
            )}
            <button
              onClick={() => addToCalendar(e)}
              className="text-xs font-semibold py-2 px-3 rounded-lg"
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
