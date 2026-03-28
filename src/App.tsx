import { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AuthPage } from './components/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Compare } from './components/Compare';
import { Insights } from './components/Insights';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { MyStats } from './components/MyStats';

type Page = 'landing' | 'dashboard' | 'compare' | 'insights' | 'reports' | 'mystats' | 'settings' | 'auth';

function AppContent() {
  const { user, loading, profile } = useAuth();
  const [page, setPage] = useState<Page>('landing');
  const [channelUrl, setChannelUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelInfo, setChannelInfo] = useState<any>(null);
  const [videoCount, setVideoCount] = useState<number>(0);
  const [videos, setVideos] = useState<any[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const prevUser = useRef(user);
  const initialLoad = useRef(true);

  useEffect(() => {
    if (!loading) {
      if (initialLoad.current) {
        // First load finished, if user exists, go to dashboard
        if (user && (page === 'landing' || page === 'auth')) {
          setPage('landing');
        } else if (!user && page !== 'landing' && page !== 'auth') {
          // If trying to load a protected page without auth, go to auth
          setPage('auth');
        }
        initialLoad.current = false;
      } else {
        // State change: user signed in
        if (!prevUser.current && user && (page === 'landing' || page === 'auth')) {
          setPage('landing');
        }
        // State change: user signed out (or is signed out and changes to a protected page)
        if (!user && page !== 'landing' && page !== 'auth') {
          setPage('auth');
        }
      }
      prevUser.current = user;
    }
  }, [user, loading, page]);

  const handleAnalyze = (url: string) => {
    setChannelUrl(url);
    if (user) {
      setPage('dashboard');
    } else {
      setPage('auth');
    }
  };

  const handleDataLoaded = useCallback((info: any, count: number, vids: any[]) => {
    setChannelInfo(info);
    setVideoCount(count);
    setVideos(vids);
  }, []);

  if (page === 'auth') {
    return <AuthPage onBack={() => setPage('landing')} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        onNavigate={setPage as any} 
        currentPage={page} 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        onAnalyze={handleAnalyze}
        onMenuToggle={() => setMobileMenuOpen(true)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <main className="grow flex flex-col">
        {page === 'landing' ? (
          <LandingPage onAnalyze={handleAnalyze} />
        ) : (
          <div className="flex bg-background grow">
            <Sidebar 
              currentPage={page} 
              onNavigate={(p) => { setPage(p as Page); setMobileMenuOpen(false); }} 
              onAnalyzeNew={handleAnalyze} 
              channelInfo={channelInfo} 
              videoCount={videoCount}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              mobileOpen={mobileMenuOpen}
              onMobileClose={() => setMobileMenuOpen(false)}
            />
            <div className={`flex flex-col grow min-w-0 mt-16 px-4 md:px-6 pb-6 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
              {/* Force Dashboard to always mount or at least keep it around for fetching channelInfo?
                  Actually, if we only mount Dashboard on 'dashboard', we lose channelInfo fetching.
                  Let's just render the requested page, but Dashboard can stay hidden or just re-fetch on mount?
                  Wait, if we unmount Dashboard, channelInfo is preserved in App state, but videos are not.
                  That's fine, the user requested simple static adding of pages for now. */}
              {page === 'dashboard' && (
                <Dashboard
                  channelUrl={channelUrl}
                  searchQuery={searchQuery}
                  onBack={() => setPage('landing')}
                  onAnalyze={handleAnalyze}
                  onDataLoaded={handleDataLoaded}
                />
              )}
              {page === 'compare' && <Compare channelInfo={channelInfo} videos={videos} onAnalyze={handleAnalyze} userChannel={profile} />}
              {page === 'insights' && <Insights videos={videos} />}
              {page === 'reports' && <Reports channelInfo={channelInfo} videos={videos} />}
              {page === 'mystats' && <MyStats userChannel={profile} />}
              {page === 'settings' && <Settings />}
            </div>
          </div>
        )}
      </main>

      <footer className="w-full py-8 border-t border-outline/10 bg-background">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-4">
          <div className="flex items-center gap-3">
            <img src="/VidMetrics_LOGO.png" alt="VidMetrics" className="w-6 h-6 object-contain" />
            <div className="flex flex-col">
              <div className="text-sm font-bold text-slate-400">VidMetrics</div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">© 2025 VidMetrics Precision Labs</p>
            </div>
          </div>
          <div className="flex gap-8">
            {['Privacy', 'Terms', 'API Status', 'Support'].map(item => (
              <span key={item} className="text-[10px] text-slate-600 uppercase tracking-widest">
                {item}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
