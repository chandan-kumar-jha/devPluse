import { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './routes'
import { useAuthStore } from './store/useAuthStore'

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser)

  useEffect(() => {
    loadUser() // 🔥 hydrate auth
  }, [])

  return <RouterProvider router={router} />
}