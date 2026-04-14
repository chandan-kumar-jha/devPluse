import { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './routes'
import { useAuthStore } from './store/useAuthStore'

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser)
  const isLoading = useAuthStore((s) => s.isLoading)

  useEffect(() => {
    loadUser()
  }, [])

  // ✅ ONLY block when actually loading
  if (isLoading) {
    return <div>Loading...</div>
  }

  return <RouterProvider router={router} />
}