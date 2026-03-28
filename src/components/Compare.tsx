import { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { ChannelInfo, VideoItem, resolveChannelId, fetchChannelInfo, fetchChannelVideos, formatNumber } from '../api/youtube';
import type { Profile } from '../lib/supabase';

interface CompareProps {
  channelInfo: ChannelInfo | null;
  videos: VideoItem[];
  onAnalyze: (url: string) => void;
  userChannel: Profile | null;
}

export const Compare = ({ channelInfo, videos, onAnalyze, userChannel }: CompareProps) => {
  const [compareUrl, setCompareUrl] = useState('');
  const [compareInfo, setCompareInfo] = useState<ChannelInfo | null>(null);
  const [compareVideos, setCompareVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userChannelVideos, setUserChannelVideos] = useState<VideoItem[]>([]);
  const [loadingUserChannel, setLoadingUserChannel] = useState(false);

  // Load user's own channel data if available
  useEffect(() => {
    async function loadUserChannel() {
      if (userChannel?.youtube_channel_id && !userChannelVideos.length) {
        setLoadingUserChannel(true);
        try {
          const vids = await fetchChannelVideos(userChannel.youtube_channel_id, '30d');
          setUserChannelVideos(vids);
        } catch (e) {
          console.error('Failed to load user channel videos:', e);
        } finally {
          setLoadingUserChannel(false);
        }
      }
    }
    loadUserChannel();
  }, [userChannel]);

  const handleCompare = async () => {
    if (!compareUrl.trim()) return;
    setLoading(true);
    setError('');
    try {
      const channelId = await resolveChannelId(compareUrl);
      const [info, vids] = await Promise.all([
        fetchChannelInfo(channelId),
        fetchChannelVideos(channelId, '30d'),
      ]);
      setCompareInfo(info);
      setCompareVideos(vids);
    } catch (e: any) {
      setError(e.message || 'Failed to load compare channel');
    } finally {
      setLoading(false);
    }
  };

  const compareWithMyChannel = async () => {
    if (!userChannel?.youtube_channel_id) return;
    setLoading(true);
    setError('');
    try {
      const [info, vids] = await Promise.all([
        fetchChannelInfo(userChannel.youtube_channel_id),
        fetchChannelVideos(userChannel.youtube_channel_id, '30d'),
      ]);
      setCompareInfo(info);
      setCompareVideos(vids);
      setCompareUrl(userChannel.youtube_channel_url || '');
    } catch (e: any) {
      setError(e.message || 'Failed to load your channel');
    } finally {
      setLoading(false);
    }
  };

  const clearCompare = () => {
    setCompareInfo(null);
    setCompareVideos([]);
    setCompareUrl('');
    setError('');
  };

  if (!channelInfo) {
    return (
      <div className="grow flex items-center justify-center p-8">
        <div className="text-center">
          <Icons.TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="font-mono text-slate-500">Analyze a channel first to compare stats.</p>
        </div>
      </div>
    );
  }

  const myAvgViews = videos.length > 0 
    ? Math.round(videos.reduce((sum, v) => sum + v.views, 0) / videos.length) 
    : 0;
  const compareAvgViews = compareVideos.length > 0 
    ? Math.round(compareVideos.reduce((sum, v) => sum + v.views, 0) / compareVideos.length) 
    : 0;

  return (
    <div className="grow flex flex-col pt-4">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white mb-2">Compare</h1>
        <p className="text-slate-400 text-sm">Compare your channel stats with another channel.</p>
      </header>

      {!compareInfo ? (
        <div className="max-w-xl mx-auto w-full">
          {userChannel?.youtube_channel_name && (
            <div className="mb-4 p-4 bg-surface border border-outline/15 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                {userChannel.youtube_channel_thumbnail ? (
                  <img src={userChannel.youtube_channel_thumbnail} alt={userChannel.youtube_channel_name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icons.Video className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-white">{userChannel.youtube_channel_name}</div>
                  <div className="text-xs text-slate-500">Your Channel</div>
                </div>
              </div>
              <button
                onClick={compareWithMyChannel}
                disabled={loading}
                className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                Compare with this
              </button>
            </div>
          )}
          <div className="bg-surface border border-outline/15 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Icons.TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-bold text-white">Enter channel to compare</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Paste a URL or @handle</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={compareUrl}
                onChange={e => setCompareUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCompare()}
                placeholder="https://youtube.com/@channel or @channel"
                className="grow bg-background border border-outline/10 rounded-lg px-4 py-3 font-mono text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-primary/40 outline-none"
              />
              <button
                onClick={handleCompare}
                disabled={loading || !compareUrl.trim()}
                className="performance-gradient text-slate-900 font-bold px-6 py-3 rounded-lg text-xs whitespace-nowrap hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {loading ? 'Loading...' : 'Compare'}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={clearCompare}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Compare different channel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-outline/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src={channelInfo.thumbnail} alt={channelInfo.title} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-white">{channelInfo.title}</div>
                  <div className="text-xs text-slate-500">Your Channel</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="font-mono text-lg font-bold text-primary">{formatNumber(channelInfo.subscriberCount)}</div>
                  <div className="font-mono text-[8px] text-slate-500 uppercase">Subscribers</div>
                </div>
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="font-mono text-lg font-bold text-primary">{formatNumber(channelInfo.viewCount)}</div>
                  <div className="font-mono text-[8px] text-slate-500 uppercase">Total Views</div>
                </div>
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="font-mono text-lg font-bold text-primary">{formatNumber(myAvgViews)}</div>
                  <div className="font-mono text-[8px] text-slate-500 uppercase">Avg Views/Video</div>
                </div>
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="font-mono text-lg font-bold text-primary">{videos.length}</div>
                  <div className="font-mono text-[8px] text-slate-500 uppercase">Videos (30d)</div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-outline/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src={compareInfo.thumbnail} alt={compareInfo.title} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-white">{compareInfo.title}</div>
                  <div className="text-xs text-slate-500">Compared Channel</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="font-mono text-lg font-bold text-accent">{formatNumber(compareInfo.subscriberCount)}</div>
                  <div className="font-mono text-[8px] text-slate-500 uppercase">Subscribers</div>
                </div>
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="font-mono text-lg font-bold text-accent">{formatNumber(compareInfo.viewCount)}</div>
                  <div className="font-mono text-[8px] text-slate-500 uppercase">Total Views</div>
                </div>
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="font-mono text-lg font-bold text-accent">{formatNumber(compareAvgViews)}</div>
                  <div className="font-mono text-[8px] text-slate-500 uppercase">Avg Views/Video</div>
                </div>
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="font-mono text-lg font-bold text-accent">{compareVideos.length}</div>
                  <div className="font-mono text-[8px] text-slate-500 uppercase">Videos (30d)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-outline/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Comparison Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Subscribers</span>
                <span className={`font-mono font-bold ${compareInfo.subscriberCount > channelInfo.subscriberCount ? 'text-red-400' : 'text-green-400'}`}>
                  {compareInfo.subscriberCount > channelInfo.subscriberCount ? '+' : ''}{formatNumber(compareInfo.subscriberCount - channelInfo.subscriberCount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Views</span>
                <span className={`font-mono font-bold ${compareInfo.viewCount > channelInfo.viewCount ? 'text-red-400' : 'text-green-400'}`}>
                  {compareInfo.viewCount > channelInfo.viewCount ? '+' : ''}{formatNumber(compareInfo.viewCount - channelInfo.viewCount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Avg Views/Video</span>
                <span className={`font-mono font-bold ${compareAvgViews > myAvgViews ? 'text-red-400' : 'text-green-400'}`}>
                  {compareAvgViews > myAvgViews ? '+' : ''}{formatNumber(compareAvgViews - myAvgViews)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
