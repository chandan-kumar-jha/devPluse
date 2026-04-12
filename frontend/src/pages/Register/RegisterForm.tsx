import { Mail, Loader2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { EmailFormData } from "../../schema/auth.schema";
import { motion } from "motion/react";

interface Props {
  form: UseFormReturn<EmailFormData>;
  onSubmit: (data: EmailFormData) => void;
  mutation: any;
}

export const RegisterForm = ({ form, onSubmit, mutation }: Props) => {
  const { register, handleSubmit } = form;

  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-white text-xl font-semibold">
          Get started with DevPulse
        </h2>
        <p className="text-zinc-400 text-sm">
          Enter your email to receive a login code
        </p>
      </div>

      <div className="relative">
        <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
        <input
          {...register("email")}
          type="email"
          placeholder="developer@example.com"
          className="w-full pl-10 pr-3 py-3 bg-zinc-900 text-white border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={mutation.isPending}
        className="w-full py-3 bg-indigo-600 rounded-xl flex justify-center items-center text-white font-medium hover:bg-indigo-500 transition-all disabled:opacity-50"
      >
        {mutation.isPending ? (
          <Loader2 className="animate-spin h-5 w-5" />
        ) : (
          "Send OTP"
        )}
      </motion.button>
    </motion.form>
  );
};