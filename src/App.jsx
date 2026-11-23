import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAdmin from './components/RequireAdmin'
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

export default function App() {
  usePyEngine()

  return (
    <Routes>
      <Route path="/" element={<Join />} />
      <Route path="/challenges" element={<Challenges />} />
      <Route path="/challenge/:id" element={<Challenge />} />
      <Route path="/tv/:roomCode" element={<Tv />} />
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
  )
}
