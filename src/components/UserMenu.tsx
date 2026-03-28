import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from './Icons';
import { useAuth } from '../context/AuthContext';

interface UserMenuProps {
  onClose: () => void;
  onAnalyze: (url: string) => void;
}

export const UserMenu = ({ onClose, onAnalyze }: UserMenuProps) => {
  const { user, profile, signOut, linkYouTubeWithGoogle, unlinkYouTube } = useAuth();
  const [linking, setLinking] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleSignOut = async () => { await signOut(); onClose(); };

  const handleLinkYouTube = async () => {
    setLinking(true);
    await linkYouTubeWithGoogle();
    setLinking(false);
  };

  const handleUnlinkYouTube = async () => { await unlinkYouTube(); };

  const handleOpenMyChannel = () => {
    if (profile?.youtube_channel_id) {
      onAnalyze(`https://youtube.com/channel/${profile.youtube_channel_id}`);
      onClose();
    }
  };

  const avatar = profile?.avatar_url ?? null;
  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'User';
  const email = user?.email ?? '';

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="absolute top-full right-0 mt-2 w-72 bg-surface border border-outline/20 rounded-2xl shadow-2xl overflow-hidden z-50"
      >
        {/* Profile header */}
        <div className="p-4 border-b border-outline/10 bg-surface-hover/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline/20 bg-background flex-shrink-0">
              {avatar
                ? <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">{displayName[0]?.toUpperCase()}</div>
              }
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate">{displayName}</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">{email}</p>
            </div>
          </div>
        </div>

        {/* YouTube Channel section */}
        <div className="p-3 border-b border-outline/10">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600 px-2 mb-2">YouTube Channel</p>

          {profile?.youtube_channel_id ? (
            <div className="bg-background/50 rounded-xl p-3 flex items-center gap-3">
              {profile.youtube_channel_thumbnail && (
                <img src={profile.youtube_channel_thumbnail} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{profile.youtube_channel_name}</p>
                <p className="text-[9px] text-slate-500 font-mono">Linked</p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleOpenMyChannel}
                  className="text-[9px] font-mono text-primary hover:underline whitespace-nowrap"
                >
                  Analyze ↗
                </button>
                <button
                  onClick={handleUnlinkYouTube}
                  className="text-[9px] font-mono text-slate-600 hover:text-red-400 transition-colors whitespace-nowrap"
                >
                  Unlink
                </button>
              </div>
            </div>
          ) : (
            <div className="px-2">
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Link your YouTube channel to quickly analyze your own channel performance.
              </p>
              <button
                onClick={handleLinkYouTube}
                disabled={linking}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 rounded-xl text-xs text-red-400 font-bold transition-colors disabled:opacity-50"
              >
                {linking ? (
                  <><div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> Linking...</>
                ) : (
                  <><Icons.Video className="w-4 h-4" /> Link YouTube Channel</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 flex flex-col gap-1">
          <button
            onClick={() => { onAnalyze(''); onClose(); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-surface-hover hover:text-white transition-colors text-left"
          >
            <Icons.Search className="w-4 h-4 text-slate-500" />
            Analyze New Channel
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-left"
          >
            <Icons.Logout className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
