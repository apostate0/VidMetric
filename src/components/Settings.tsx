import { Icons } from './Icons';
import { useAuth } from '../context/AuthContext';

const YOUTUBE_QUOTA_LIMIT = 10000;

export const Settings = () => {
  const { user, profile } = useAuth();
  
  const displayName = profile?.display_name || user?.user_metadata?.full_name || 'Guest User';
  const email = user?.email || 'guest@example.com';
  const avatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=c0c1ff&color=1000a9`;

  const channelName = profile?.youtube_channel_name || 'Not linked';
  const channelUrl = profile?.youtube_channel_url || '#';

  return (
    <div className="grow flex flex-col pt-4 pb-24">
      <div className="flex flex-col gap-1 mb-12">
        <span className="font-mono text-[10px] uppercase tracking-widest text-primary/70">Workspace / Configuration</span>
        <h3 className="text-3xl font-extrabold tracking-tighter text-white">Settings</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-surface border border-outline/10 p-8 rounded-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group shrink-0">
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover border border-outline/20 shadow-2xl bg-surface-hover"
                />
              </div>
              <div className="flex-1 w-full space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Name</label>
                    <input 
                      type="text" 
                      defaultValue={displayName}
                      className="w-full bg-surface-hover border border-outline/10 text-sm px-4 py-3 rounded focus:ring-1 focus:ring-primary/40 text-white outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Email</label>
                    <input 
                      type="email" 
                      defaultValue={email}
                      disabled
                      className="w-full bg-surface-hover/50 border border-outline/5 text-sm px-4 py-3 rounded text-slate-400 outline-none cursor-not-allowed" 
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button className="px-6 py-2.5 bg-surface-hover text-white text-xs font-bold tracking-widest uppercase rounded border border-outline/20 hover:bg-surface-hover/80 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-outline/10 p-8 rounded-xl space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-accent rounded" />
                <h4 className="font-bold text-lg text-white">YouTube Data API</h4>
              </div>
              <span className="font-mono text-[10px] bg-accent/20 text-accent px-2 py-1 rounded border border-accent/20">ACTIVE</span>
            </div>
            
            <div className="bg-surface-hover/50 p-4 rounded-lg border border-outline/10">
              <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block mb-1">API Key</label>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm tracking-tighter text-slate-300">••••••••••••••••••••••••</span>
                <span className="text-[10px] text-slate-500">From .env</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-hover p-4 rounded-lg border border-outline/5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">Daily Quota</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-xl font-bold text-white">10,000</span>
                  <span className="text-[10px] text-slate-500">units/day</span>
                </div>
                <p className="text-[9px] text-slate-600 mt-1">YouTube Data API v3 default</p>
              </div>
              <div className="bg-surface-hover p-4 rounded-lg border border-outline/5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">Cost per Request</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-xl font-bold text-white">1-100</span>
                  <span className="text-[10px] text-slate-500">units</span>
                </div>
                <p className="text-[9px] text-slate-600 mt-1">Search: 100, Channel: 5, Videos: 5</p>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-outline/10 p-8 rounded-xl space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary rounded" />
                <h4 className="font-bold text-lg text-white">Linked YouTube Channel</h4>
              </div>
              {profile?.youtube_channel_id ? (
                <span className="font-mono text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/20">CONNECTED</span>
              ) : (
                <span className="font-mono text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded border border-yellow-500/20">NOT LINKED</span>
              )}
            </div>
            
            {profile?.youtube_channel_id ? (
              <div className="bg-surface-hover/50 p-4 rounded-lg border border-outline/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {profile.youtube_channel_thumbnail ? (
                    <img src={profile.youtube_channel_thumbnail} alt={channelName} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icons.Video className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-white">{channelName}</p>
                    <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-primary transition-colors">
                      {channelUrl}
                    </a>
                  </div>
                </div>
                <button className="text-xs text-slate-400 hover:text-white transition-colors">
                  Unlink
                </button>
              </div>
            ) : (
              <div className="bg-surface-hover/50 p-4 rounded-lg border border-outline/10 text-center">
                <p className="text-sm text-slate-400 mb-3">Sign in with Google to link your YouTube channel</p>
                <button className="px-4 py-2 bg-primary text-slate-900 text-xs font-bold rounded hover:opacity-90 transition-opacity">
                  Link Channel
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-4 space-y-6">
          <div className="bg-surface border border-outline/10 p-6 rounded-xl space-y-4">
            <h4 className="font-bold text-base border-b border-outline/10 pb-4 text-white">Account</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Plan</span>
                <span className="text-sm font-bold text-white">Free</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">AI Credits</span>
                <span className="text-sm font-bold text-white">Unlimited</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Channel Analyses</span>
                <span className="text-sm font-bold text-white">Unlimited</span>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-outline/10 p-6 rounded-xl space-y-4">
            <h4 className="font-bold text-base border-b border-outline/10 pb-4 text-white">Preferences</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-200">Dark Mode</p>
                  <p className="text-[11px] text-slate-500">Always on</p>
                </div>
                <div className="w-10 h-5 bg-primary rounded-full relative cursor-not-allowed opacity-50">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-slate-900 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-outline/10">
            <button className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors">
              <Icons.Logout className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
