import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../api/axios"

interface CreateSessionData {
  title: string
  date: string
  durationMinutes: number
  tags?: string[]
  notes?: string
  mood?: "great" | "good" | "okay" | "bad"
}

const SESSIONS_KEY = ["sessions"]

export const useSessions = () => {
  return useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: () => api.get("/api/sessions").then((res) => res.data.data),
  })
}

export const useCreateSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSessionData) =>
      api.post("/api/sessions", data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY })
    },
  })
}

export const useDeleteSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/sessions/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY })
    },
  })
}