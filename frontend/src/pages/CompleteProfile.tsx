import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { completeProfileApi } from "../api/auth.api"
import { useAuthStore } from "../store/useAuthStore"
import { motion } from "motion/react"
import { Loader2, User, AtSign } from "lucide-react"

type FormData = {
  name: string
  username: string
}

export const CompleteProfile = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const { register, handleSubmit } = useForm<FormData>()

  const mutation = useMutation({
    mutationFn: completeProfileApi,
    onSuccess: (res) => {
      const user = res.data.data.user
      setUser(user)
      navigate("/dashboard")
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center px-4">
      
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-auto bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6"
      >
        {/* Heading */}
        <div className="text-center space-y-2">
          <h2 className="text-white text-2xl font-semibold">
            Complete your profile
          </h2>
          <p className="text-zinc-400 text-sm">
            Just a few details to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* NAME */}
          <div className="space-y-1">
            <label className="text-sm text-zinc-400">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <input
                {...register("name")}
                placeholder="John Doe"
                className="w-full pl-10 pr-3 py-3 bg-zinc-900 border border-zinc-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* USERNAME */}
          <div className="space-y-1">
            <label className="text-sm text-zinc-400">Username</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <input
                {...register("username")}
                placeholder="john_dev"
                className="w-full pl-10 pr-3 py-3 bg-zinc-900 border border-zinc-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <p className="text-xs text-zinc-500">
              This will be your unique identity on DevPulse
            </p>
          </div>

          {/* BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={mutation.isPending}
            className="w-full py-3 bg-indigo-600 rounded-xl text-white font-medium hover:bg-indigo-500 transition-all flex items-center justify-center"
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Continue"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}