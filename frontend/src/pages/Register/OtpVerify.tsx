import { motion } from "motion/react";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";

export const OtpVerify = ({
  email,
  otp,
  otpError,
  resendCooldown,
  inputRefs,
  onBack,
  onOtpChange,
  onOtpKeyDown,
  onOtpPaste,
  onSubmit,
  onResend,
  verifyMutation,
  resendMutation,
}: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full"
    >
      <button
        onClick={onBack}
        className="mb-4 text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft />
      </button>

      <div className="text-center mb-8 space-y-2">
        <Mail className="mx-auto h-12 w-12 text-indigo-400" />
        <h2 className="text-white text-xl font-semibold">
          Verify your email
        </h2>
        <p className="text-zinc-400 text-sm">
          We sent a code to <span className="text-white">{email}</span>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* OTP INPUT */}
        <div className="flex justify-center gap-2" onPaste={onOtpPaste}>
          {otp.map((digit: string, index: number) => (
            <input
              key={index}
              ref={(el) => {
                if (inputRefs.current) inputRefs.current[index] = el;
              }}
              className="w-12 h-14 bg-zinc-900 border border-zinc-700 text-center text-white text-xl rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
              value={digit}
              onChange={(e) => onOtpChange(index, e.target.value)}
              onKeyDown={(e) => onOtpKeyDown(index, e)}
              maxLength={1}
            />
          ))}
        </div>

        {otpError && (
          <p className="text-red-400 text-xs text-center">{otpError}</p>
        )}

        {/* BUTTON */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={verifyMutation.isPending}
          className="w-full py-3 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-medium hover:bg-indigo-500 transition-all"
        >
          {verifyMutation.isPending ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <>
              Verify <CheckCircle2 className="ml-2 h-4 w-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* RESEND */}
      <div className="text-center mt-4 text-sm text-zinc-400">
        {resendCooldown > 0 ? (
          <p>Resend in {resendCooldown}s</p>
        ) : (
          <button
            onClick={onResend}
            disabled={resendMutation.isPending}
            className="text-indigo-400 hover:text-indigo-300 transition"
          >
            {resendMutation.isPending ? "Sending..." : "Resend OTP"}
          </button>
        )}
      </div>
    </motion.div>
  );
};