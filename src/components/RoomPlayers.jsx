import { useState } from 'react'
import { X } from 'lucide-react'
import StatusGlyph from './StatusGlyph'
import { useRoomPlayers } from '../hooks/useRoomPlayers'
import { getReadableError } from '../lib/errors'
import { supabase } from '../lib/supabase'

export default function RoomPlayers({ room, onRemoved }) {
  const { players, loading, error, reload } = useRoomPlayers(room.id)
  const [busyId, setBusyId] = useState('')
  const [actionError, setActionError] = useState('')

  async function handleRemove(player) {
    const confirmed = window.confirm(
      `Remove ${player.display_name} from ${room.name}? Their scores and submissions will be deleted.`,
    )
    if (!confirmed) return

    setBusyId(player.id)
    setActionError('')

    try {
      const { error: rpcError } = await supabase.rpc('admin_remove_player', {
        p_player_id: player.id,
      })
      if (rpcError) throw rpcError

      await reload()
      onRemoved?.()
    } catch (err) {
      setActionError(getReadableError(err, `Could not remove ${player.display_name}.`))
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="mt-4 border border-line-strong bg-surface-2 p-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-fg-muted">## players</h3>

      {loading ? <StatusGlyph status="loading" label="Loading players..." className="mt-2" /> : null}
      {error ? <StatusGlyph status="error" label={error} className="mt-2" /> : null}
      {!loading && !error && players.length === 0 ? (
        <StatusGlyph status="unsolved" label="No players in this room yet." className="mt-2" />
      ) : null}

      {!loading && !error && players.length > 0 ? (
        <ul className="mt-2 divide-y divide-dashed divide-line">
          {players.map((player) => (
            <li key={player.id} className="flex items-center justify-between gap-3 py-2">
              <span className="text-sm text-fg">{player.display_name}</span>
              <button
                type="button"
                onClick={() => handleRemove(player)}
                disabled={busyId === player.id}
                aria-label={`Remove ${player.display_name}`}
                className="inline-flex h-11 items-center justify-center gap-2 border border-dashed border-line-strong px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3 disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50"
              >
                <X size={14} strokeWidth={1.75} aria-hidden="true" />
                remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {actionError ? <StatusGlyph status="error" label={actionError} className="mt-2" /> : null}
    </div>
  )
}
