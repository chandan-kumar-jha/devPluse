import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { useAppDispatch } from "../store/hooks"
import { setUser, clearUser } from "../store/slices/authSlice"
import api from "../api/axios"

interface AuthCredentials {
  email: string
  password: string
  name?: string
}

export const useRegister = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: AuthCredentials) =>
      api.post("/api/auth/register", data).then((res) => res.data),
    onSuccess: (data) => {
      dispatch(setUser(data.user))
      navigate("/dashboard")
    },
  })
}

export const useLogin = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: AuthCredentials) =>
      api.post("/api/auth/login", data).then((res) => res.data),
    onSuccess: (data) => {
      dispatch(setUser(data.user))
      navigate("/dashboard")
    },
  })
}

export const useLogout = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => api.post("/api/auth/logout").then((res) => res.data),
    onSuccess: () => {
      dispatch(clearUser())
      navigate("/login")
    },
  })
}