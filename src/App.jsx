import { useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import RequireAdmin from './components/RequireAdmin'
import TopBar from './components/TopBar'
import { usePresence } from './hooks/usePresence'
import { usePyEngine } from './hooks/usePyEngine'
import Challenge from './pages/Challenge'
import Challenges from './pages/Challenges'
import Join from './pages/Join'
import Tv from './pages/Tv'
import ChallengeForm from './pages/admin/ChallengeForm'
import ChallengeList from './pages/admin/ChallengeList'
import Judge from './pages/admin/Judge'
import Login from './pages/admin/Login'
import Rooms from './pages/admin/Rooms'
import { useSessionStore } from './stores/sessionStore'

function LeaderboardRoute() {
  const room = useSessionStore((s) => s.room)
  const navigate = useNavigate()
  const [code, setCode] = useState('')

  if (room?.code) {
    return <Navigate to={`/tv/${room.code}`} replace />
  }

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    navigate(`/tv/${trimmed}`)
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10 md:px-6">
      <div className="border border-line-strong bg-surface-1 p-6 font-mono">
        <h1 className="text-2xl font-bold tracking-tight text-fg"># Leaderboard</h1>
        <p className="mt-3 text-sm text-fg-muted">
          Enter a room code to view the live leaderboard and podium standings. No need to join.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-fg-muted" htmlFor="leaderboard-code">
              room code
            </label>
            <div className="mt-2 flex h-10 items-center border border-line-strong bg-surface-2 focus-within:border-fg">
              <span className="pl-3 text-fg-faint" aria-hidden="true">$</span>
              <input
                id="leaderboard-code"
                className="h-full w-full bg-transparent px-2 text-sm uppercase text-fg outline-none placeholder:text-fg-faint"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="off"
                placeholder="TEST1"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!code.trim()}
            className="h-10 w-full border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50 disabled:text-fg-muted"
          >
            $ view leaderboard
          </button>
        </form>

        <Link to="/" className="mt-4 inline-flex text-xs font-bold uppercase tracking-wider text-fg-muted hover:text-fg">
          $ join a room to compete
        </Link>
      </div>
    </main>
  )
}

export default function App() {
  usePyEngine()
  usePresence()

  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<Join />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/challenge/:id" element={<Challenge />} />
        <Route path="/tv/:roomCode" element={<Tv />} />
        <Route path="/leaderboard" element={<LeaderboardRoute />} />
        <Route path="/admin/login" element={<Login />} />
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<Rooms />} />
          <Route path="/admin/challenges" element={<ChallengeList />} />
          <Route path="/admin/challenges/new" element={<ChallengeForm />} />
          <Route path="/admin/challenges/:id" element={<ChallengeForm />} />
          <Route path="/admin/judge" element={<Judge />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
