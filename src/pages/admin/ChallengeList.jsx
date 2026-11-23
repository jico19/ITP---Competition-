import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import AdminNav from '../../components/AdminNav'
import ConfirmModal from '../../components/ConfirmModal'
import DifficultyBlocks from '../../components/DifficultyBlocks'
import StatusGlyph from '../../components/StatusGlyph'
import { useAdminChallenges } from '../../hooks/useAdminChallenges'
import { getReadableError } from '../../lib/errors'
import { supabase } from '../../lib/supabase'

export default function ChallengeList() {
  const { challenges, loading, error, reload } = useAdminChallenges()
  const [busyId, setBusyId] = useState('')
  const [actionError, setActionError] = useState('')
  const [challengeToDelete, setChallengeToDelete] = useState(null)

  async function handleToggle(challenge) {
    setBusyId(challenge.id)
    setActionError('')
    try {
      const { error: updateError } = await supabase
        .from('challenges')
        .update({ published: !challenge.published })
        .eq('id', challenge.id)
      if (updateError) throw updateError
      await reload()
    } catch (err) {
      setActionError(getReadableError(err, 'Could not update challenge.'))
    } finally {
      setBusyId('')
    }
  }

  async function handleConfirmDelete() {
    if (!challengeToDelete) return

    setBusyId(challengeToDelete.id)
    setActionError('')
    try {
      const { error: deleteError } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeToDelete.id)
      if (deleteError) throw deleteError
      setChallengeToDelete(null)
      await reload()
    } catch (err) {
      setActionError(getReadableError(err, 'Could not delete challenge.'))
    } finally {
      setBusyId('')
    }
  }

  return (
    <main className="min-h-svh bg-bg px-4 py-8 text-fg md:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <header>
          <p className="text-xs font-bold uppercase tracking-widest text-fg-muted">ITP Competition</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-fg"># Admin · Challenges</h1>
          <AdminNav />
        </header>

        <div className="mt-6 flex justify-end">
          <Link
            to="/admin/challenges/new"
            className="inline-flex h-11 items-center justify-center gap-2 border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
            new challenge
          </Link>
        </div>

        {actionError ? (
          <div className="mt-6 border border-dashed border-line-strong p-3" role="alert">
            <StatusGlyph status="error" label={actionError} />
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 bg-dots-dense p-6">
            <StatusGlyph status="loading" label="Loading challenges..." />
          </div>
        ) : null}

        {!loading && error ? (
          <div className="mt-6 border border-dashed border-line-strong p-4" role="alert">
            <StatusGlyph status="error" label={error} />
            <button
              type="button"
              onClick={reload}
              className="mt-3 inline-flex h-11 items-center justify-center border border-line-strong px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3"
            >
              retry
            </button>
          </div>
        ) : null}

        {!loading && !error && challenges.length === 0 ? (
          <div className="mt-6 bg-dots-dense p-9 text-center">
            <StatusGlyph status="unsolved" label="No challenges yet. Create one above." />
          </div>
        ) : null}

        {!loading && !error && challenges.length > 0 ? (
          <section className="mt-6 border border-line-strong bg-surface-1">
            <div className="hidden grid-cols-[minmax(0,1fr)_120px_90px_90px_130px_320px] gap-4 border-b border-line-strong px-4 py-3 text-xs font-bold uppercase tracking-widest text-fg-muted lg:grid">
              <span>title</span>
              <span>difficulty</span>
              <span>type</span>
              <span className="text-right">points</span>
              <span>status</span>
              <span className="text-right">actions</span>
            </div>

            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="grid gap-3 border-b border-dashed border-line p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_120px_90px_90px_130px_320px] lg:items-center lg:gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-fg">{challenge.title}</p>
                  <p className="mt-1 text-xs tabular-nums text-fg-muted">order {challenge.sort_order}</p>
                </div>
                <DifficultyBlocks tier={challenge.tier} />
                <span className="inline-flex h-6 w-fit items-center border border-line-strong px-2 text-[11px] uppercase tracking-widest text-fg-muted">
                  [{challenge.type === 'web' ? 'WEB' : 'PY'}]
                </span>
                <span className="text-sm font-bold tabular-nums text-fg lg:text-right">{challenge.points}</span>
                <StatusGlyph
                  status={challenge.published ? 'solved' : 'locked'}
                  label={challenge.published ? 'published' : 'draft'}
                  inverted={challenge.published}
                />
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Link
                    to={`/admin/challenges/${challenge.id}`}
                    className="inline-flex h-11 items-center justify-center border border-line-strong px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3"
                  >
                    edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleToggle(challenge)}
                    disabled={busyId === challenge.id}
                    className="inline-flex h-11 items-center justify-center border border-line-strong px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3 disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50"
                  >
                    {challenge.published ? 'unpublish' : 'publish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChallengeToDelete(challenge)}
                    disabled={busyId === challenge.id}
                    aria-label={`Delete ${challenge.title}`}
                    className="inline-flex h-11 items-center justify-center gap-2 border border-dashed border-line-strong px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3 disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50"
                  >
                    <X size={14} strokeWidth={1.75} aria-hidden="true" />
                    delete
                  </button>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        <ConfirmModal
          isOpen={Boolean(challengeToDelete)}
          onClose={() => setChallengeToDelete(null)}
          onConfirm={handleConfirmDelete}
          loading={busyId === challengeToDelete?.id}
          title="# Delete Challenge"
          message={`Delete "${challengeToDelete?.title}"? This also removes its scores, submissions, and judge scores.`}
          confirmLabel="[×] delete"
          cancelLabel="cancel"
          isDestructive
        />
      </div>
    </main>
  )
}
