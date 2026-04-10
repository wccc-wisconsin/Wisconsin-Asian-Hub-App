import type { Restaurant } from '../../../hooks/useDine'

interface ShareCardProps {
  restaurant: Restaurant
  onClose: () => void
}

export default function ShareCard({ restaurant, onClose }: ShareCardProps) {
  const shareText = restaurant.affiliation === 'wccc' && restaurant.weeklyDeal
    ? `🍽️ Dine Asian Wisconsin!\n\n${restaurant.name} — ${restaurant.cuisine} in ${restaurant.city}\n\n🎟️ This week's deal: ${restaurant.weeklyDeal}\n\nDiscover more Asian restaurants at hub.wcccbusinessnetwork.org\n\n#WCCCTableOfTheWeek #DineAsianWisconsin #WisconsinAsianHub`
    : `🍽️ Dine Asian Wisconsin!\n\n${restaurant.name} — ${restaurant.cuisine} in ${restaurant.city}\n\n${restaurant.description}\n\nDiscover more Asian restaurants at hub.wcccbusinessnetwork.org\n\n#DineAsianWisconsin #WisconsinAsianHub`

  async function handleShare() {
    if ('share' in navigator) {
      await (navigator as { share: (d: object) => Promise<void> }).share({
        title: restaurant.name,
        text: shareText,
        url: 'https://hub.wcccbusinessnetwork.org'
      })
    } else {
      const el = document.createElement('textarea')
      el.value = shareText
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      alert('Copied to clipboard!')
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        onClick={e => e.stopPropagation()}>

        <div className="p-4 space-y-3" style={{
          background: 'linear-gradient(135deg, #1a0505 0%, #2d1010 100%)'
        }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'var(--color-red)' }}>亚</div>
            <span className="text-xs font-semibold text-white">Dine Asian Wisconsin</span>
            <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              WCCC × WDA
            </span>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">{restaurant.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {restaurant.cuisine} · {restaurant.city}
            </p>
          </div>
          {restaurant.weeklyDeal && (
            <div className="rounded-lg px-3 py-2" style={{
              background: 'rgba(185,28,28,0.3)', border: '1px solid rgba(185,28,28,0.4)'
            }}>
              <p className="text-xs text-white font-medium">🎟️ {restaurant.weeklyDeal}</p>
            </div>
          )}
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            hub.wcccbusinessnetwork.org
          </p>
        </div>

        <div className="p-4 space-y-3">
          <button onClick={handleShare}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: 'var(--color-red)', color: '#fff' }}>
            📤 {'share' in navigator ? 'Share' : 'Copy to Clipboard'}
          </button>
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm"
            style={{ background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
