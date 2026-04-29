import { useState } from 'react'
import { useAttendees, getPublicName } from '../../../hooks/useAttendees'

interface AttendeeListProps {
  eventId: string
  onRSVP: () => void
  isPast?: boolean
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function getColor(name: string): string {
  const colors = ['#B91C1C','#C2410C','#B45309','#15803D','#0F766E','#0369A1','#6D28D9','#9D174D']
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return colors[Math.abs(hash) % colors.length]
}

export default function AttendeeList({ eventId, onRSVP, isPast = false }: AttendeeListProps) {
  const { attendees, loading } = useAttendees(eventId)
  const [showAll, setShowAll]  = useState(false)

  const publicAttendees = attendees
    .map(a => ({ ...a, displayName: getPublicName(a) }))
    .filter(a => a.displayName !== null)

  const total      = attendees.length
  const shown      = showAll ? publicAttendees : publicAttendees.slice(0, 5)
  const remaining  = publicAttendees.length - 5
  const privateCount = attendees.filter(a => a.privacy === 'private').length

  if (loading) return (
    <div className="pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
      {!isPast && (
        <button onClick={onRSVP}
          className="w-full py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--color-red)', color: '#fff' }}>
          🎟️ RSVP for this event
        </button>
      )}
    </div>
  )
  if (total === 0) return (
    <div className="pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
      {!isPast && (
        <button onClick={onRSVP}
          className="w-full py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--color-red)', color: '#fff' }}>
          🎟️ RSVP — Be the first!
        </button>
      )}
      {isPast && total === 0 && (
        <p className="text-xs text-center py-1" style={{ color: 'var(--color-muted)' }}>No RSVPs recorded</p>
      )}
    </div>
  )

  return (
    <div className="pt-3 border-t space-y-3" style={{ borderColor: 'var(--color-border)' }}>
      {/* Attendee count + avatars */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Stacked avatars */}
          <div className="flex -space-x-2">
            {publicAttendees.slice(0, 4).map((a, i) => (
              <div key={i}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white border-2"
                style={{
                  background: getColor(a.displayName!),
                  borderColor: 'var(--color-surface)',
                  zIndex: 4 - i
                }}>
                {getInitials(a.displayName!)}
              </div>
            ))}
            {privateCount > 0 && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-muted)'
                }}>
                +{privateCount}
              </div>
            )}
          </div>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
            {total} {total === 1 ? 'person' : 'people'} going
          </p>
        </div>
        {!isPast && (
          <button onClick={onRSVP}
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: 'var(--color-red)', color: '#fff' }}>
            + Join them
          </button>
        )}
      </div>

      {/* Attendee name list */}
      <div className="space-y-1.5">
        {shown.map((a, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: getColor(a.displayName!) }}>
              {getInitials(a.displayName!)}
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text)' }}>
              {a.displayName}
            </p>
          </div>
        ))}

        {/* Show more */}
        {!showAll && remaining > 0 && (
          <button onClick={() => setShowAll(true)}
            className="text-xs flex items-center gap-1.5 mt-1"
            style={{ color: 'var(--color-muted)' }}>
            <span>+{remaining} more attending</span>
            <span>↓</span>
          </button>
        )}

        {/* Private count note */}
        {privateCount > 0 && (
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            +{privateCount} attending privately
          </p>
        )}
      </div>
    </div>
  )
}
