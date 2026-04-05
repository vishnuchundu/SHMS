import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TopNavbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b-[3px] border-b-accent/50 h-[4.5rem] flex items-center justify-between px-4 lg:px-8 z-20 sticky top-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-primary hover:bg-primary/5 focus:bg-primary/5 lg:hidden transition-colors"
        >
          <Menu size={26} />
        </button>
        <span className="text-2xl font-black text-primary tracking-tight hidden sm:block">
          SHMS <span className="text-gray-400 font-bold">P O R T A L</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3 bg-gray-50/80 px-4 py-2 rounded-2xl border border-gray-200 shadow-inner">
          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
             <UserIcon size={14} className="text-accent" />
          </div>
          <span className="text-sm font-bold text-primary tracking-wide">
            {user?.sub || 'Authenticated User'}
          </span>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-danger-500 hover:bg-danger-600 hover:shadow-lg hover:shadow-danger-500/20 transition-all duration-200 hover:-translate-y-0.5"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Terminate Session</span>
        </button>
      </div>
    </header>
  );
};
