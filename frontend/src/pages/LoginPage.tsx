import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link } from "react-router-dom"
import { useLogin } from "../hooks/useAuth"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginForm = z.infer<typeof loginSchema>

const LoginPage = () => {
  const { mutate: login, isPending, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginForm) => {
    login(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-md p-8 rounded-2xl bg-gray-900 shadow-xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">DevPulse</h1>
          <p className="text-gray-400 mt-1">Sign in to your account</p>
        </div>

        {/* Server error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
           {(error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Something went wrong"}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>

        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Create one
          </Link>
        </p>

      </div>
    </div>
  )
}

export default LoginPage