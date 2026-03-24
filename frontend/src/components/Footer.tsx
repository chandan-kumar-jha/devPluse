import {  X, Terminal } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 bg-indigo-500 rounded-md flex items-center justify-center">
                <Terminal className="text-white h-4 w-4" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">DevTrack</span>
            </div>
            <p className="text-zinc-400 text-sm mb-6">
              The ultimate productivity tracker built by developers, for developers. Own your data, track your growth.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                <FaGithub className="h-5 w-5" />
              </a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Features</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Integrations</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Pricing</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Documentation</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">API Reference</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Blog</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Community</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Data Export Info</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} DevTrack Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 mt-4 md:mt-0 text-zinc-500 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
};
