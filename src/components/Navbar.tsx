import { useState } from 'react';
import { Icons } from './Icons';
import { UserMenu } from './UserMenu';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onNavigate:    (page: 'landing' | 'dashboard' | 'auth') => void;
  currentPage:   string;
  searchQuery:   string;
  onSearchChange:(q: string) => void;
  onAnalyze:     (url: string) => void;
  onMenuToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Navbar = ({
  onNavigate, currentPage, searchQuery, onSearchChange, onAnalyze, onMenuToggle,
}: NavbarProps) => {
  const { user, profile, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const avatar       = profile?.avatar_url ?? null;
  const displayName  = profile?.display_name ?? user?.email?.split('@')[0] ?? '';
  const hasYT        = !!profile?.youtube_channel_id;

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-outline/10 h-16 px-6 flex justify-between items-center">
      {/* Left: Logo + nav */}
      <div className="grow flex flex-col pt-4 pb-24">
        <button onClick={onMenuToggle} className="lg:hidden p-2 hover:bg-surface-hover rounded-lg">
          <Icons.Menu className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => onNavigate('landing')}>
          <img src="/VidMetrics_LOGO.png" alt="VidMetrics" className="w-8 h-8 object-contain group-hover:scale-105 transition-transform" />
          <span className="text-xl font-bold tracking-tighter text-primary">VidMetrics</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => onNavigate('landing')}
            className={`text-sm font-medium tracking-tight transition-colors ${currentPage === 'landing' ? 'text-primary' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Home
          </button>
          <button
            onClick={() => user ? onNavigate('dashboard') : onNavigate('auth')}
            className={`text-sm font-medium tracking-tight transition-colors ${currentPage === 'dashboard' ? 'text-primary' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Right: search + auth */}
      <div className="flex items-center gap-3">
        {/* Search — only active & shown on dashboard */}
        {currentPage === 'dashboard' && (
          <div className="relative hidden sm:block">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Filter videos..."
              className="bg-surface/50 border border-outline/10 rounded-lg pl-10 pr-8 py-1.5 text-sm focus:ring-1 focus:ring-primary/40 w-48 focus:w-64 text-slate-200 placeholder:text-slate-600 outline-none transition-all duration-300"
            />
            {searchQuery && (
              <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs">✕</button>
            )}
          </div>
        )}

        {/* Auth area */}
        {!loading && (
          user ? (
            /* Signed in: avatar button → dropdown */
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-hover transition-colors group"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-outline/20 bg-surface relative">
                  {avatar
                    ? <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-sm">{displayName[0]?.toUpperCase()}</div>
                  }
                  {/* Green dot if YouTube linked */}
                  {hasYT && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" title="YouTube linked" />}
                </div>
                <span className="hidden md:block text-xs font-medium text-slate-300 group-hover:text-white transition-colors max-w-[120px] truncate">
                  {displayName}
                </span>
                <Icons.ArrowRight className="w-3 h-3 text-slate-500 rotate-90 hidden md:block" />
              </button>

              {menuOpen && (
                <UserMenu
                  onClose={() => setMenuOpen(false)}
                  onAnalyze={onAnalyze}
                />
              )}
            </div>
          ) : (
            /* Signed out: Sign In button */
            <button
              onClick={() => onNavigate('auth')}
              className="performance-gradient text-slate-900 font-bold px-5 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          )
        )}
      </div>
    </nav>
  );
};
