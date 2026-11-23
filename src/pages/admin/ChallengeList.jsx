import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminNav from '../../components/AdminNav'
import { useAdminChallenges } from '../../hooks/useAdminChallenges'
import { getReadableError } from '../../lib/errors'
import { supabase } from '../../lib/supabase'

const tierStyles = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-rose-100 text-rose-700',
}

export default function ChallengeList() {
  const { challenges, loading, error, reload } = useAdminChallenges()
  const [busyId, setBusyId] = useState('')
  const [actionError, setActionError] = useState('')

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

  async function handleDelete(challenge) {
    const confirmed = window.confirm(
      `Delete "${challenge.title}"? This also removes its scores, submissions, and judge scores.`,
    )
    if (!confirmed) return

    setBusyId(challenge.id)
    setActionError('')
    try {
      const { error: deleteError } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challenge.id)
      if (deleteError) throw deleteError
      await reload()
    } catch (err) {
      setActionError(getReadableError(err, 'Could not delete challenge.'))
    } finally {
      setBusyId('')
    }
  }

  return (
    <main className="min-h-svh bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header>
          <p className="text-sm font-medium text-slate-500">ITP Competition</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Admin · Challenges</h1>
          <AdminNav />
        </header>

        <div className="flex justify-end">
          <Link
            to="/admin/challenges/new"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            New challenge
          </Link>
        </div>

        {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}

        {loading ? (
          <p className="text-sm text-slate-600">Loading challenges...</p>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p>{error}</p>
            <button type="button" onClick={reload} className="mt-3 underline">
              Try again
            </button>
          </div>
        ) : challenges.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            No challenges yet. Create one above.
          </p>
        ) : (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden grid-cols-[1fr_90px_80px_80px_110px_230px] gap-3 border-b border-slate-200 px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 md:grid">
              <span>Title</span>
              <span>Tier</span>
              <span>Type</span>
              <span>Points</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 md:grid-cols-[1fr_90px_80px_80px_110px_230px] md:items-center"
              >
                <div>
                  <p className="font-medium">{challenge.title}</p>
                  <p className="text-xs text-slate-500">Order {challenge.sort_order}</p>
                </div>
                <span
                  className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium capitalize ${tierStyles[challenge.tier] ?? 'bg-slate-100 text-slate-600'}`}
                >
                  {challenge.tier}
                </span>
                <span className="text-sm capitalize text-slate-600">{challenge.type}</span>
                <span className="text-sm text-slate-700">{challenge.points}</span>
                <span
                  className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
                    challenge.published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {challenge.published ? 'Published' : 'Draft'}
                </span>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Link
                    to={`/admin/challenges/${challenge.id}`}
                    className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleToggle(challenge)}
                    disabled={busyId === challenge.id}
                    className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {challenge.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(challenge)}
                    disabled={busyId === challenge.id}
                    className="rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
