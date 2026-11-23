import { useMemo, useState } from 'react'
import AdminNav from '../../components/AdminNav'
import { useAdminChallenges } from '../../hooks/useAdminChallenges'
import { useAdminRooms } from '../../hooks/useAdminRooms'
import { useJudgeScore } from '../../hooks/useJudgeScore'
import { useRoomPlayers } from '../../hooks/useRoomPlayers'

function SelectorLabel({ children, value, onChange, disabled, options, placeholder }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {children}
      <select
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-50"
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
    <main className="min-h-svh bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header>
          <p className="text-sm font-medium text-slate-500">ITP Competition</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Admin · Judge</h1>
          <AdminNav />
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Select submission</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
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

          {roomsError ? <p className="mt-3 text-sm text-red-600">{roomsError}</p> : null}
          {playersError ? <p className="mt-3 text-sm text-red-600">{playersError}</p> : null}
          {challengesError ? <p className="mt-3 text-sm text-red-600">{challengesError}</p> : null}
          {roomId && players.length === 0 && !playersLoading && !playersError ? (
            <p className="mt-3 text-sm text-slate-600">No players have joined this room yet.</p>
          ) : null}
          {!challengesLoading && webChallenges.length === 0 && !challengesError ? (
            <p className="mt-3 text-sm text-slate-600">No published web challenges yet.</p>
          ) : null}
        </section>

        {playerId && selectedChallenge ? (
          <form onSubmit={handleSave} className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{selectedChallenge.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Maximum {selectedChallenge.points} points
                  </p>
                </div>
                {score.saved ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Score saved
                  </span>
                ) : null}
              </div>

              {score.loading ? (
                <p className="mt-4 text-sm text-slate-600">Loading saved score...</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {rubricRows.map((row, index) => (
                    <label
                      key={row.label}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
                    >
                      <span className="font-medium text-slate-700">
                        {index + 1}. {row.label}
                        <span className="ml-2 text-xs font-normal text-slate-500">
                          max {row.max}
                        </span>
                      </span>
                      <input
                        className="w-24 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
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

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-sm font-medium text-slate-600">Running total</span>
                <span className="font-mono text-lg font-semibold tabular-nums">
                  {total} / {selectedChallenge.points}
                </span>
              </div>
            </section>

            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
            {score.error ? <p className="text-sm text-red-600">{score.error}</p> : null}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!playerId || score.loading || score.saving}
                className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {score.saving ? 'Saving...' : score.saved ? 'Update score' : 'Save score'}
              </button>
              <span className="text-sm text-slate-600">
                Scores update the leaderboard immediately.
              </span>
            </div>
          </form>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Choose a player and web challenge to start judging.
          </p>
        )}
      </div>
    </main>
  )
}
