import { motion } from "framer-motion"
import { Terminal } from "lucide-react";
import { Link } from "react-router";

export const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Terminal className="text-white h-5 w-5" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">DevTrack</span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</a>
              <a href="#methodology" className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Methodology</a>
              <a href="#pricing" className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-zinc-300 hover:text-white text-sm font-medium hidden sm:block">
              Log in
            </Link>
             <Link to="/register" className="bg-white text-zinc-950 hover:bg-zinc-200 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
