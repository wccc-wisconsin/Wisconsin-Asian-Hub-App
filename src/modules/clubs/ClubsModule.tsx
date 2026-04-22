import { useState } from 'react'

interface ClubEvent {
  date: string
  title: string
  location: string
  description: string
}

interface Club {
  id: string
  name: string
  emoji: string
  tagline: string
  description: string
  founded: string
  members: number
  contact: string
  email: string
  coverColor: string
  accentColor: string
  photos: string[]
  events: ClubEvent[]
}

const CLUBS: Club[] = [
  {
    id: 'golf',
    name: 'Wisconsin Chinese Golf Club',
    emoji: '⛳',
    tagline: 'Building friendships one fairway at a time',
    description: 'The Wisconsin Chinese Golf Club brings together Chinese-American golf enthusiasts across Wisconsin for friendly rounds, tournaments, and networking on the course. Whether you\'re a seasoned golfer or just picking up the sport, everyone is welcome.',
    founded: '2018',
    members: 25,
    contact: 'Golf Club Coordinator',
    email: 'golf@wisccc.org',
    coverColor: 'linear-gradient(135deg, #166534, #15803d, #22c55e)',
    accentColor: '#16a34a',
    photos: [],
    events: [
      {
        date: 'TBD',
        title: 'Spring Kickoff Tournament',
        location: 'Brown Deer Golf Course, Milwaukee',
        description: 'Annual spring tournament open to all skill levels. Prizes for top finishers.',
      },
      {
        date: 'TBD',
        title: 'Summer Social Round',
        location: 'Dretzka Golf Course, Milwaukee',
        description: 'Casual 9-hole round followed by dinner and networking.',
      },
      {
        date: 'TBD',
        title: 'Fall Championship',
        location: 'Brown Deer Golf Course, Milwaukee',
        description: 'End-of-season championship. Full 18 holes, awards ceremony.',
      },
    ],
  },
]

// Placeholder for future clubs
const COMING_SOON = [
  { emoji: '🎣', name: 'Wisconsin Chinese Fishing Club', description: 'Coming soon — fishing trips, tournaments, and lakeside camaraderie.' },
  { emoji: '🎾', name: 'Wisconsin Chinese Tennis Club', description: 'Coming soon — courts, lessons, and friendly matches.' },
]

function PhotoGallery({ photos, clubName }: { photos: string[]; clubName: string }) {
  return (
    <div>
      <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>📸 Photo Gallery</h3>
      {photos.length === 0 ? (
        <div className="rounded-xl p-6 text-center"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-3xl mb-2">📷</p>
          <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Photos coming soon</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
            Club photos will appear here after events
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden"
              style={{ background: 'var(--color-surface)' }}>
              <img src={url} alt={`${clubName} photo ${i + 1}`}
                className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MemberSignupForm({ club, onClose }: { club: Club; onClose: () => void }) {
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [phone, setPhone]   = useState('')
  const [level, setLevel]   = useState('')
  const [submitted, setSubmitted] = useState(false)

  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid var(--color-border)', background: 'var(--color-surface)',
    color: 'var(--color-text)', fontSize: '16px', outline: 'none',
    boxSizing: 'border-box' as const,
  }

  async function handleSubmit() {
    if (!name || !email) return
    // Send email via mailto as simple implementation
    const subject = encodeURIComponent(`${club.name} Membership Interest`)
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nSkill Level: ${level}\n\nI am interested in joining the ${club.name}.`
    )
    window.open(`mailto:${club.email}?subject=${subject}&body=${body}`)
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--color-bg)' }}>
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
        Interest Submitted!
      </h2>
      <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: 'var(--color-muted)' }}>
        Your email app should have opened with a pre-filled message. Send it to complete your signup.
        The club coordinator will be in touch soon.
      </p>
      <button onClick={onClose} className="px-6 py-3 rounded-full text-sm font-semibold"
        style={{ background: 'var(--color-red)', color: '#fff' }}>
        Back to Club
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={onClose} className="text-sm" style={{ color: 'var(--color-muted)' }}>Cancel</button>
        <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
          Join {club.name}
        </h2>
        <button onClick={handleSubmit} disabled={!name || !email}
          className="text-sm font-semibold px-4 py-1.5 rounded-full disabled:opacity-40"
          style={{ background: 'var(--color-red)', color: '#fff' }}>
          Submit
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="rounded-xl p-4" style={{
          background: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.15)'
        }}>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-red)' }}>
            {club.emoji} Join {club.name}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Fill in your details and we'll connect you with the club coordinator.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-muted)' }}>Full Name *</label>
            <input type="text" placeholder="Your name" value={name}
              onChange={e => setName(e.target.value)} style={inp} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-muted)' }}>Email *</label>
            <input type="email" placeholder="your@email.com" value={email}
              onChange={e => setEmail(e.target.value)} style={inp} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-muted)' }}>Phone</label>
            <input type="tel" placeholder="(414) 555-0000" value={phone}
              onChange={e => setPhone(e.target.value)} style={inp} />
          </div>
          {club.id === 'golf' && (
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-muted)' }}>Golf Skill Level</label>
              <div className="grid grid-cols-2 gap-2">
                {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map(l => (
                  <button key={l} onClick={() => setLevel(l)}
                    className="py-2 rounded-xl text-xs font-medium"
                    style={{
                      background: level === l ? 'rgba(185,28,28,0.15)' : 'var(--color-surface)',
                      color: level === l ? 'var(--color-red)' : 'var(--color-muted)',
                      border: `1px solid ${level === l ? 'rgba(185,28,28,0.3)' : 'var(--color-border)'}`,
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ClubPage({ club, onBack }: { club: Club; onBack: () => void }) {
  const [showSignup, setShowSignup] = useState(false)

  if (showSignup) return <MemberSignupForm club={club} onClose={() => setShowSignup(false)} />

  return (
    <div className="pb-24">
      {/* Hero */}
      <div className="relative" style={{ background: club.coverColor, minHeight: 180 }}>
        <div className="px-4 pt-4">
          <button onClick={onBack} className="text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.8)' }}>
            ← Back
          </button>
        </div>
        <div className="px-4 pb-6 pt-4 text-center">
          <p className="text-5xl mb-2">{club.emoji}</p>
          <h1 className="font-display text-xl font-bold text-white leading-tight">{club.name}</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>{club.tagline}</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className="text-xs text-white opacity-80">📅 Est. {club.founded}</span>
            <span className="text-xs text-white opacity-80">👥 {club.members}+ members</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6">
        {/* Join CTA */}
        <button onClick={() => setShowSignup(true)}
          className="w-full py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--color-red)', color: '#fff' }}>
          {club.emoji} Join the Club
        </button>

        {/* About */}
        <div className="rounded-xl p-4 space-y-2"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>About</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            {club.description}
          </p>
        </div>

        {/* Upcoming Events */}
        <div>
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>
            📅 Upcoming Events
          </h3>
          <div className="space-y-3">
            {club.events.map((event, i) => (
              <div key={i} className="rounded-xl p-4 space-y-1"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{event.title}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                    {event.date}
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>📍 {event.location}</p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{event.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Gallery */}
        <PhotoGallery photos={club.photos} clubName={club.name} />

        {/* Contact */}
        <div className="rounded-xl p-4 space-y-3"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>📬 Contact</h3>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Questions about the club? Reach out to our coordinator.
          </p>
          <div className="flex gap-2">
            <a href={`mailto:${club.email}`}
              className="flex-1 py-2.5 rounded-lg text-xs font-semibold text-center"
              style={{ background: 'rgba(185,28,28,0.1)', color: 'var(--color-red)', border: '1px solid rgba(185,28,28,0.2)' }}>
              📧 Email Us
            </a>
            <button onClick={() => setShowSignup(true)}
              className="flex-1 py-2.5 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--color-red)', color: '#fff' }}>
              {club.emoji} Join Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ClubsModule() {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)

  if (selectedClub) {
    return <ClubPage club={selectedClub} onBack={() => setSelectedClub(null)} />
  }

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          WCCC Clubs
        </h1>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Social & recreational clubs for WCCC members and friends
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Active Clubs */}
        {CLUBS.map(club => (
          <button key={club.id} onClick={() => setSelectedClub(club)}
            className="w-full rounded-xl overflow-hidden text-left"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            {/* Cover */}
            <div className="h-24 flex items-center justify-center relative"
              style={{ background: club.coverColor }}>
              <p className="text-5xl">{club.emoji}</p>
            </div>
            {/* Body */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{club.name}</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{club.tagline}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(34,197,94,0.12)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }}>
                  Active
                </span>
              </div>
              <div className="flex gap-4 mt-3">
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>👥 {club.members}+ members</span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>📅 {club.events.length} events planned</span>
              </div>
              <div className="mt-3 py-2 rounded-lg text-xs font-semibold text-center"
                style={{ background: 'rgba(185,28,28,0.1)', color: 'var(--color-red)', border: '1px solid rgba(185,28,28,0.2)' }}>
                View Club →
              </div>
            </div>
          </button>
        ))}

        {/* Coming Soon */}
        <div>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-muted)' }}>🔜 Coming Soon</p>
          <div className="space-y-3">
            {COMING_SOON.map(club => (
              <div key={club.name} className="rounded-xl p-4 flex items-center gap-4"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', opacity: 0.7 }}>
                <p className="text-3xl flex-shrink-0">{club.emoji}</p>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{club.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{club.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggest a Club */}
        <div className="rounded-xl p-4 space-y-2"
          style={{ background: 'rgba(185,28,28,0.04)', border: '1px solid rgba(185,28,28,0.15)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-red)' }}>💡 Want to start a club?</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Have an idea for a new WCCC club? We'd love to hear it — cooking, hiking, mahjong, badminton, and more!
          </p>
          <a href="mailto:info@wisccc.org?subject=Club Idea"
            className="inline-block px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(185,28,28,0.1)', color: 'var(--color-red)', border: '1px solid rgba(185,28,28,0.2)' }}>
            Suggest a Club →
          </a>
        </div>
      </div>
    </div>
  )
}
