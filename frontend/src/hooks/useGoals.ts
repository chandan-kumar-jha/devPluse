import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAppSelector } from "../store/hooks"
import api from "../api/axios"

interface CreateGoalData {
  title: string
  description?: string
  targetDate?: string
  milestones?: { text: string; completed?: boolean }[]
}

interface UpdateGoalData {
  title?: string
  description?: string
  targetDate?: string
  status?: "active" | "completed" | "abandoned"
  milestones?: { text: string; completed?: boolean }[]
}

const GOALS_KEY = ["goals"]

export const useGoals = () => {
  const goalStatus = useAppSelector((state) => state.filter.goalStatus)

  return useQuery({
    queryKey: [...GOALS_KEY, goalStatus],
    queryFn: () => {
      const params = goalStatus !== "all" ? `?status=${goalStatus}` : ""
      return api.get(`/api/goals${params}`).then((res) => res.data.data)
    },
  })
}

export const useCreateGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGoalData) =>
      api.post("/api/goals", data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY })
    },
  })
}

export const useUpdateGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalData }) =>
      api.patch(`/api/goals/${id}`, data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY })
    },
  })
}

export const useDeleteGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/goals/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY })
    },
  })
}