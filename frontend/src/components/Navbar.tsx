import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { Link } from "react-router";

export const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* A subtle gradient overlay at the very top to ensure 
          text readability without a solid bar cutting the sphere 
      */}
      <div className="absolute inset-0 h-32 bg-linear-to-b from-black/60 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="h-10 w-10 bg-[#5e43f3] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(94,67,243,0.3)] transition-transform duration-300 group-hover:scale-110">
            <Terminal className="text-white h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-xl tracking-tight leading-none">
              DevTrack
            </span>
            <span className="text-[#5e43f3] text-[10px] font-bold tracking-[0.2em] uppercase mt-1">
              Beta
            </span>
          </div>
        </div>

        {/* Navigation - Only Login as requested */}
        <div className="flex items-center">
          <Link 
            to="/login" 
            className="group relative text-zinc-400 hover:text-white text-sm font-medium transition-colors py-2 px-4"
          >
            <span>Log in</span>
            {/* Animated underline effect */}
            <span className="absolute bottom-0 left-4 right-4 h-px bg-[#5e43f3] scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};