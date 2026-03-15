import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../api/axios"

interface UpsertSkillData {
  name: string
  category?: "language" | "framework" | "tool" | "concept" | "other"
  currentLevel?: number
  targetLevel?: number
  notes?: string
}

const SKILLS_KEY = ["skills"]

export const useSkills = () => {
  return useQuery({
    queryKey: SKILLS_KEY,
    queryFn: () => api.get("/api/skills").then((res) => res.data.data),
  })
}

export const useUpsertSkill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpsertSkillData) =>
      api.post("/api/skills", data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_KEY })
    },
  })
}

export const useLevelUpSkill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, increment }: { id: string; increment: number }) =>
      api.patch(`/api/skills/${id}/levelup`, { increment }).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_KEY })
    },
  })
}