import { useState } from 'react'
import { useAdminUsers } from '../../hooks/useAdmin'

export default function AdminUsersPanel({ currentEmail }: { currentEmail: string }) {
  const { admins, loading, addAdmin, removeAdmin } = useAdminUsers()
  const [newEmail, setNewEmail] = useState('')
  const [adding, setAdding]     = useState(false)

  async function handleAdd() {
    if (!newEmail.trim()) return
    setAdding(true)
    await addAdmin(newEmail.trim().toLowerCase())
    setNewEmail('')
    setAdding(false)
  }

  return (
    <div className="space-y-4">
      {/* Add admin */}
      <div className="rounded-xl p-4" style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)'
      }}>
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
          Add Admin
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Google email address"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '16px',
            }}
          />
          <button onClick={handleAdd} disabled={!newEmail.trim() || adding}
            className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
            style={{ background: 'var(--color-red)', color: '#fff' }}>
            Add
          </button>
        </div>
      </div>

      {/* Admin list */}
      {loading && <p className="text-sm text-center" style={{ color: 'var(--color-muted)' }}>Loading...</p>}

      <div className="space-y-2">
        {admins.map(admin => (
          <div key={admin.email} className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{admin.email}</p>
              {admin.email === currentEmail && (
                <p className="text-xs" style={{ color: 'var(--color-gold)' }}>You</p>
              )}
            </div>
            {admin.email !== currentEmail && (
              <button onClick={() => removeAdmin(admin.email)}
                className="text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
