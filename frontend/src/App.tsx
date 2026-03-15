import { useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAppDispatch } from "./store/hooks"
import { setUser } from "./store/slices/authSlice"
import ProtectedRoute from "./components/ProtectedRoute"
import api from "./api/axios"

import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardPage from "./pages/DashboardPage"
import SessionsPage from "./pages/SessionsPage"
import GoalsPage from "./pages/GoalsPage"
import SkillsPage from "./pages/SkillsPage"

const App = () => {
  const dispatch = useAppDispatch()

  // On app load, check if user is already logged in
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const res = await api.get("/api/auth/me")
        dispatch(setUser(res.data.user))
      } catch {
        // not logged in, do nothing
      }
    }
    restoreAuth()
  }, [])

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
      <Route path="/skills" element={<ProtectedRoute><SkillsPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App