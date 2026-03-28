import { Icons } from './Icons';
import { formatNumber } from '../api/youtube';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: 'landing' | 'dashboard' | 'compare' | 'insights' | 'reports' | 'mystats' | 'settings') => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onAnalyzeNew?: (url: string) => void;
  channelInfo?: {
    title: string;
    customUrl?: string;
    thumbnail: string;
    subscriberCount: number;
    videoCount: number;
  };
  videoCount?: number;
}

export const Sidebar = ({ currentPage, onNavigate, collapsed = false, onToggleCollapse, onAnalyzeNew, channelInfo, videoCount }: SidebarProps) => {
  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-64px)] ${collapsed ? 'w-16' : 'w-64'} bg-surface border-r border-outline/15 hidden lg:flex flex-col py-4 gap-2 z-40 transition-all duration-300`}>
      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 w-6 h-6 bg-surface border border-outline/20 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-surface-hover transition-colors"
      >
        {collapsed ? <Icons.ChevronRight className="w-3 h-3" /> : <Icons.ChevronLeft className="w-3 h-3" />}
      </button>

      <div className="px-6 py-4">
        {!collapsed && (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Performance</p>
            <h2 className="text-xs font-semibold text-slate-300">YouTube Analytics</h2>
          </>
        )}
      </div>

      <div className="flex flex-col px-3 gap-1">
        <SidebarBtn
          icon={Icons.Dashboard}
          label={collapsed ? '' : 'Overview'}
          active={currentPage === 'dashboard'}
          onClick={() => onNavigate('dashboard')}
          collapsed={collapsed}
        />
        <SidebarBtn
          icon={Icons.TrendingUp}
          label={collapsed ? '' : 'Compare'}
          active={currentPage === 'compare'}
          onClick={() => onNavigate('compare')}
          collapsed={collapsed}
        />
        <SidebarBtn
          icon={Icons.Stats}
          label={collapsed ? '' : 'Insights'}
          active={currentPage === 'insights'}
          onClick={() => onNavigate('insights')}
          collapsed={collapsed}
        />
        <SidebarBtn
          icon={Icons.Video}
          label={collapsed ? '' : 'Reports'}
          active={currentPage === 'reports'}
          onClick={() => onNavigate('reports')}
          collapsed={collapsed}
        />
        <SidebarBtn
          icon={Icons.Stats}
          label={collapsed ? '' : 'My Stats'}
          active={currentPage === 'mystats'}
          onClick={() => onNavigate('mystats')}
          collapsed={collapsed}
        />
      </div>

      {/* Channel Mini Card */}
      {channelInfo && (
        <div className={`mx-3 mt-4 p-3 bg-surface-hover rounded-xl border border-outline/10 ${collapsed ? 'px-2' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <img src={channelInfo.thumbnail} alt={channelInfo.title} className={`rounded-full object-cover shrink-0 border border-outline/20 ${collapsed ? 'w-8 h-8' : 'w-9 h-9'}`} />
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-bold text-xs text-white truncate">{channelInfo.title}</p>
                {channelInfo.customUrl && (
                  <p className="text-[9px] text-slate-500 font-mono truncate">{channelInfo.customUrl}</p>
                )}
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-background/50 rounded-lg p-2 text-center">
                <div className="font-mono text-xs font-bold text-primary">{formatNumber(channelInfo.subscriberCount)}</div>
                <div className="font-mono text-[8px] text-slate-600 uppercase">Subs</div>
              </div>
              <div className="bg-background/50 rounded-lg p-2 text-center">
                <div className="font-mono text-xs font-bold text-accent">{videoCount !== undefined ? videoCount : formatNumber(channelInfo.videoCount)}</div>
                <div className="font-mono text-[8px] text-slate-600 uppercase">Videos</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings / General */}
      <div className={`mt-auto ${collapsed ? 'px-2' : 'px-6'} py-4`}>
        {onAnalyzeNew && (
            <button
              onClick={() => onAnalyzeNew('')}
              className={`performance-gradient text-slate-900 font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-primary/10 active:scale-95 transition-transform ${collapsed ? 'p-2' : 'py-3 w-full'}`}
            >
              {collapsed ? <Icons.Search className="w-4 h-4 mx-auto" /> : 'Analyze New Channel'}
            </button>
        )}
      </div>

      <div className={`flex flex-col border-t border-outline/10 pt-4 gap-1 ${collapsed ? 'px-2' : 'px-3'}`}>
        <SidebarBtn
          icon={Icons.Settings}
          label={collapsed ? '' : 'Settings'}
          active={currentPage === 'settings'}
          onClick={() => onNavigate('settings')}
          collapsed={collapsed}
        />
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 px-4 py-2 rounded-md transition-all duration-200 text-slate-500 hover:text-slate-300 hover:bg-surface-hover/50 w-full"
        >
          <Icons.Logout className="w-4 h-4" />
          {!collapsed && <span className="font-mono text-xs uppercase tracking-widest">Back Home</span>}
        </button>
      </div>
    </aside>
  );
};

const SidebarBtn = ({
  icon: Icon, label, active = false, onClick, collapsed = false,
}: {
  icon: React.ElementType; label: string; active?: boolean; onClick?: () => void; collapsed?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all duration-200 w-full ${collapsed ? 'justify-center' : ''} ${
      active
        ? 'bg-surface-hover text-primary font-bold'
        : 'text-slate-500 hover:text-slate-300 hover:bg-surface-hover/50'
    }`}
  >
    <Icon className="w-4 h-4" />
    {!collapsed && <span className="font-mono text-xs uppercase tracking-widest">{label}</span>}
  </button>
);
