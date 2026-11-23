import { useMemo, useState } from 'react'
import AdminNav from '../../components/AdminNav'
import StatusGlyph from '../../components/StatusGlyph'
import { useAdminChallenges } from '../../hooks/useAdminChallenges'
import { useAdminRooms } from '../../hooks/useAdminRooms'
import { useJudgeScore } from '../../hooks/useJudgeScore'
import { useRoomPlayers } from '../../hooks/useRoomPlayers'

function SelectorLabel({ children, value, onChange, disabled, options, placeholder }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-widest text-fg-muted">{children}</span>
      <select
        className="mt-2 h-11 w-full border border-line-strong bg-surface-2 px-3 text-sm text-fg outline-none focus:border-fg disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function Judge() {
  const { rooms, loading: roomsLoading, error: roomsError } = useAdminRooms()
  const { challenges, loading: challengesLoading, error: challengesError } = useAdminChallenges()

  const [roomId, setRoomId] = useState('')
  const [playerId, setPlayerId] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [editedScore, setEditedScore] = useState({ key: '', scores: {} })
  const [formError, setFormError] = useState('')

  const { players, loading: playersLoading, error: playersError } = useRoomPlayers(roomId)
  const score = useJudgeScore(playerId, challengeId)
  const selectionKey = playerId && challengeId ? `${playerId}:${challengeId}` : ''

  const webChallenges = useMemo(
    () => challenges.filter((challenge) => challenge.type === 'web' && challenge.published),
    [challenges],
  )
  const selectedChallenge = webChallenges.find((challenge) => challenge.id === challengeId)
  const rubric = useMemo(
    () => (Array.isArray(selectedChallenge?.rubric) ? selectedChallenge.rubric : []),
    [selectedChallenge],
  )

  const savedScores = useMemo(() => {
    const next = {}
    for (const criterion of rubric) {
      next[criterion.label] = Number(score.scores?.[criterion.label] ?? 0)
    }
    return next
  }, [rubric, score.scores])

  const values = editedScore.key === selectionKey ? editedScore.scores : savedScores

  function updateValue(label, value) {
    setEditedScore({ key: selectionKey, scores: { ...values, [label]: value } })
  }

  function handleRoomChange(value) {
    setRoomId(value)
    setPlayerId('')
    setFormError('')
  }

  function handleChallengeChange(value) {
    setChallengeId(value)
    setFormError('')
  }

  const rubricRows = rubric.map((criterion) => {
    const raw = values[criterion.label] ?? 0
    const points = raw === '' ? 0 : Number(raw)
    return { ...criterion, raw, points, max: Number(criterion.points) }
  })
  const total = rubricRows.reduce((sum, row) => sum + (Number.isFinite(row.points) ? row.points : 0), 0)
  const invalidRow = rubricRows.find(
    (row) =>
      !Number.isInteger(row.points) ||
      row.points < 0 ||
      row.points > row.max,
  )

  async function handleSave(event) {
    event.preventDefault()
    setFormError('')
    if (!selectedChallenge || rubric.length === 0) return

    const scores = {}
    for (const row of rubricRows) scores[row.label] = row.points

    if (invalidRow) {
      setFormError(`"${invalidRow.label}" must be a whole number from 0 to ${invalidRow.max}.`)
      return
    }
    if (total > Number(selectedChallenge.points)) {
      setFormError(`Total cannot exceed ${selectedChallenge.points} points.`)
      return
    }

    await score.save(scores, total, selectedChallenge.points)
  }

  const roomOptions = rooms.map((room) => ({
    value: room.id,
    label: `${room.name} (${room.code})`,
  }))
  const playerOptions = players.map((player) => ({
    value: player.id,
    label: player.display_name,
  }))
  const challengeOptions = webChallenges.map((challenge) => ({
    value: challenge.id,
    label: `${challenge.title} · ${challenge.points} pts`,
  }))

  return (
    <main className="min-h-svh bg-bg px-4 py-8 text-fg md:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <header>
          <p className="text-xs font-bold uppercase tracking-widest text-fg-muted">ITP Competition</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-fg"># Admin · Judge</h1>
          <AdminNav />
        </header>

        <section className="mt-6 border border-line-strong bg-surface-1 p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-fg-muted">## select submission</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            <SelectorLabel
              value={roomId}
              onChange={handleRoomChange}
              disabled={roomsLoading}
              options={roomOptions}
              placeholder={roomsLoading ? 'Loading rooms...' : 'Choose room'}
            >
              Room
            </SelectorLabel>
            <SelectorLabel
              value={playerId}
              onChange={(value) => {
                setPlayerId(value)
                setFormError('')
              }}
              disabled={!roomId || playersLoading}
              options={playerOptions}
              placeholder={
                !roomId ? 'Choose room first' : playersLoading ? 'Loading players...' : 'Choose player'
              }
            >
              Player
            </SelectorLabel>
            <SelectorLabel
              value={challengeId}
              onChange={handleChallengeChange}
              disabled={challengesLoading}
              options={challengeOptions}
              placeholder={challengesLoading ? 'Loading challenges...' : 'Choose challenge'}
            >
              Web challenge
            </SelectorLabel>
          </div>

          {roomsError ? <StatusGlyph status="error" label={roomsError} className="mt-4" /> : null}
          {playersError ? <StatusGlyph status="error" label={playersError} className="mt-4" /> : null}
          {challengesError ? <StatusGlyph status="error" label={challengesError} className="mt-4" /> : null}
          {roomId && players.length === 0 && !playersLoading && !playersError ? (
            <StatusGlyph status="unsolved" label="No players have joined this room yet." className="mt-4" />
          ) : null}
          {!challengesLoading && webChallenges.length === 0 && !challengesError ? (
            <StatusGlyph status="unsolved" label="No published web challenges yet." className="mt-4" />
          ) : null}
        </section>

        {playerId && selectedChallenge ? (
          <form onSubmit={handleSave} className="mt-6 space-y-6">
            <section className="border border-line-strong bg-surface-1 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-fg">{selectedChallenge.title}</h2>
                  <p className="mt-1 text-xs text-fg-muted">maximum {selectedChallenge.points} points</p>
                </div>
                {score.saved ? <StatusGlyph status="solved" inverted /> : null}
              </div>

              {score.loading ? (
                <StatusGlyph status="loading" label="Loading saved score..." className="mt-4" />
              ) : (
                <div className="mt-4 space-y-3">
                  {rubricRows.map((row, index) => (
                    <label
                      key={row.label}
                      className="flex flex-wrap items-center justify-between gap-3 border border-line-strong bg-surface-2 p-3 text-sm"
                    >
                      <span className="font-bold text-fg">
                        {String(index + 1).padStart(2, '0')}. {row.label}
                        <span className="ml-2 text-xs font-normal tabular-nums text-fg-muted">
                          max {row.max}
                        </span>
                      </span>
                      <input
                        className="h-11 w-24 border border-line-strong bg-surface-2 px-3 text-sm tabular-nums text-fg outline-none focus:border-fg"
                        type="number"
                        min="0"
                        max={row.max}
                        step="1"
                        value={row.raw}
                        onChange={(event) => updateValue(row.label, event.target.value)}
                      />
                    </label>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-dashed border-line pt-4">
                <span className="text-xs font-bold uppercase tracking-widest text-fg-muted">running total</span>
                <span className="text-lg font-bold tabular-nums text-fg">
                  {total} / {selectedChallenge.points}
                </span>
              </div>
            </section>

            {formError ? (
              <div className="border border-dashed border-line-strong p-3" role="alert">
                <StatusGlyph status="error" label={formError} />
              </div>
            ) : null}
            {score.error ? (
              <div className="border border-dashed border-line-strong p-3" role="alert">
                <StatusGlyph status="error" label={score.error} />
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!playerId || score.loading || score.saving}
                className="inline-flex h-11 items-center justify-center border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50 disabled:text-fg-muted"
              >
                {score.saving ? '[...] saving' : '> save score'}
              </button>
              <span className="text-xs text-fg-muted">Scores update the leaderboard immediately.</span>
            </div>
          </form>
        ) : (
          <div className="mt-6 bg-dots-dense p-9 text-center">
            <StatusGlyph status="unsolved" label="Choose a player and web challenge to start judging." />
          </div>
        )}
      </div>
    </main>
  )
}
