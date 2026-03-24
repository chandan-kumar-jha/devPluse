import { motion, AnimatePresence } from "motion/react";
import { Terminal, ArrowRight, ArrowLeft, ShieldCheck, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router";

export const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call for /auth/register
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) return;

    setIsLoading(true);
    // Simulate API call for /auth/verify-otp
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  const handleResendOtp = () => {
    // Simulate resend
    alert("New OTP sent to " + email);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center gap-2 mb-8 group">
          <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center group-hover:bg-indigo-400 transition-colors">
            <Terminal className="text-white h-6 w-6" />
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">DevTrack</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-zinc-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-zinc-800/50 overflow-hidden relative min-h-[400px]">
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-8 flex flex-col justify-center"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white">Create your account</h2>
                  <p className="mt-2 text-sm text-zinc-400">Start tracking your deep work today</p>
                </div>

                <form className="space-y-6" onSubmit={handleRegisterSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                      Email address
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-zinc-500" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="developer@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                      Password
                    </label>
                    <div className="mt-1 relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ShieldCheck className="h-5 w-5 text-zinc-500" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-400">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
                    Log in
                  </Link>
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-8 flex flex-col justify-center"
              >
                <button 
                  onClick={() => setStep(1)}
                  className="absolute top-6 left-6 text-zinc-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="text-center mb-8 mt-4">
                  <div className="mx-auto h-12 w-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 border border-indigo-500/20">
                    <Mail className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Check your email</h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    We sent a verification code to <br/>
                    <span className="font-medium text-zinc-200">{email || "your email"}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifySubmit} className="space-y-6">
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold text-white bg-zinc-900/80 border border-zinc-700 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                      />
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading || otp.join("").length < 6}
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center"
                  >
                     {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>
                        Verify Account
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-400">
                  Didn't receive the code?{' '}
                  <button onClick={handleResendOtp} className="font-medium text-indigo-400 hover:text-indigo-300">
                    Click to resend
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
