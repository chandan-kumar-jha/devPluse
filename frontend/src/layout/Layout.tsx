import { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore'; 
import { logoutApi } from '../api/auth.api';
import { SidebarContent } from '../components/SidebarContent'; // Import here

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      logout();
      navigate('/login');
    },
    onError: () => {
      logout();
      navigate('/login');
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans relative">
      <aside className="w-64 border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen overflow-hidden">
        <SidebarContent 
          user={user} 
          location={location} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          logoutMutation={logoutMutation} 
        />
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent 
          user={user} 
          location={location} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          logoutMutation={logoutMutation} 
        />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 w-full overflow-hidden bg-slate-50/50">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 md:hidden hover:bg-slate-100 rounded-lg">
               <Menu className="h-6 w-6" />
             </button>
             <h1 className="text-base md:text-lg font-semibold text-slate-800 truncate">
               Hi, {user?.name?.split(' ')[0] || 'Developer'}
             </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-full"><Bell className="h-5 w-5" /><span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white" /></button>
            <div className="h-8 w-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 shadow-sm" />
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};