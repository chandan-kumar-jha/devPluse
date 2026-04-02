import { useState, useEffect } from 'react';
import {  Menu } from 'lucide-react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore'; 
import { useProfileStore } from '../store/useProfilestore'; // Import Profile Store
import { logoutApi } from '../api/auth.api';
import { SidebarContent } from '../components/SidebarContent'; 
import { Toaster } from 'react-hot-toast';

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get Auth state for logout logic
  const logout = useAuthStore((state) => state.logout);
  
  // Get Profile state for the Header UI
  const { profile, loadProfile } = useProfileStore();

  // Load profile data when the layout mounts
  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

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
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen overflow-hidden">
        <SidebarContent 
          user={profile} // Use profile data here too for consistency
          location={location} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          logoutMutation={logoutMutation} 
        />
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent 
          user={profile} 
          location={location} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          logoutMutation={logoutMutation} 
        />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 w-full overflow-hidden bg-slate-50/50">
      <Toaster position="top-right" reverseOrder={false} />
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 md:hidden hover:bg-slate-100 rounded-lg">
               <Menu className="h-6 w-6" />
             </button>
             <h1 className="text-base md:text-lg font-semibold text-slate-800 truncate">
               Hi, {profile?.name?.split(' ')[0] || 'Developer'}
             </h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
           

            {/* Dynamic Avatar Link */}
            <Link 
              to="/profile" 
              className="h-8 w-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shadow-sm hover:ring-2 hover:ring-indigo-200 transition-all cursor-pointer"
            >
              {profile?.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt="User Avatar" 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + (profile?.name || 'User');
                  }}
                />
              ) : (
                <div className="h-full w-full bg-linear-to-tr from-indigo-500 to-purple-500" />
              )}
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
