import { useState } from 'react'
import type { SheetConfig } from '../../../hooks/useMembers'

interface SheetConfigProps {
  onSave: (config: SheetConfig) => void
}

export default function SheetConfig({ onSave }: SheetConfigProps) {
  const [sheetId, setSheetId]     = useState('')
  const [apiKey, setApiKey]       = useState('')
  const [sheetName, setSheetName] = useState('Sheet1')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const isValid = sheetId.trim() && apiKey.trim()

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            Connect Your Google Sheet
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Enter your Sheet ID and API Key to load the WCCC member directory.
          </p>
        </div>

        <div className="space-y-3 text-left">
          {/* Sheet ID */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-muted)' }}>
              Google Sheet ID <span style={{ color: 'var(--color-red)' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
              value={sheetId}
              onChange={e => setSheetId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none font-mono"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Found in the sheet URL: <code className="px-1 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>/spreadsheets/d/<strong style={{ color: 'var(--color-gold)' }}>THIS_PART</strong>/edit</code>
            </p>
          </div>

          {/* API Key */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-muted)' }}>
              Google Sheets API Key <span style={{ color: 'var(--color-red)' }}>*</span>
            </label>
            <input
              type="password"
              placeholder="AIza..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none font-mono"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className="text-xs"
            style={{ color: 'var(--color-muted)' }}
          >
            {showAdvanced ? '▲' : '▼'} Advanced options
          </button>

          {showAdvanced && (
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-muted)' }}>
                Sheet / Tab Name
              </label>
              <input
                type="text"
                placeholder="Sheet1"
                value={sheetName}
                onChange={e => setSheetName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                Exact name of the tab at the bottom of your sheet
              </p>
            </div>
          )}

          <button
            onClick={() => isValid && onSave({ sheetId: sheetId.trim(), apiKey: apiKey.trim(), sheetName: sheetName.trim() || 'Sheet1' })}
            disabled={!isValid}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: 'var(--color-red)', color: '#fff' }}
          >
            Load Members →
          </button>
        </div>

        {/* Tip */}
        <div className="rounded-lg p-4 text-left space-y-1.5" style={{
          background: 'rgba(251,191,36,0.06)',
          border: '1px solid rgba(251,191,36,0.15)'
        }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
            💡 Recommended sheet columns
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            <code className="text-xs px-1 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
              Name, City, Category, Email, Phone, Website, Description, Photo
            </code>
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Column names are flexible — common variations are auto-detected.
          </p>
        </div>
      </div>
    </div>
  )
}
