import { useState, useEffect, useCallback } from 'react';
import { Icons } from './Icons';
import { Sparkline } from './Sparkline';
import type { Profile } from '../lib/supabase';
import { resolveChannelId, fetchChannelInfo, fetchChannelVideos, formatNumber, formatDate, type ChannelInfo, type VideoItem, type DateFilter, type SortKey } from '../api/youtube';

interface MyStatsProps {
  userChannel: Profile | null;
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="text-right">
    <span className="block font-mono text-sm text-white">{value}</span>
    <span className="block font-mono text-[9px] text-slate-500 uppercase">{label}</span>
  </div>
);

export const MyStats = ({ userChannel }: MyStatsProps) => {
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('30d');
  const [sortKey, setSortKey] = useState<SortKey>('viewsPerDay');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    if (!userChannel?.youtube_channel_id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [info, vids] = await Promise.all([
        fetchChannelInfo(userChannel.youtube_channel_id),
        fetchChannelVideos(userChannel.youtube_channel_id, dateFilter),
      ]);
      setChannelInfo(info);
      setVideos(vids);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [userChannel?.youtube_channel_id, dateFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const displayedVideos = [...videos]
    .filter(v => {
      if (searchQuery.trim()) {
        return v.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortKey) {
        case 'views': return b.views - a.views;
        case 'viewsPerDay': return b.viewsPerDay - a.viewsPerDay;
        case 'likes': return b.likes - a.likes;
        case 'date': return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
    });

  if (!userChannel?.youtube_channel_name) {
    return (
      <div className="grow flex flex-col pt-4">
        <header className="mb-8">
          <label className="text-primary font-mono text-xs uppercase tracking-[0.2em] mb-2 block">Personal</label>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white mb-2">My Stats</h1>
          <p className="text-slate-400 text-sm">Your YouTube channel analytics.</p>
        </header>
        <div className="grow flex items-center justify-center p-8">
          <div className="p-8 bg-surface border border-outline/10 rounded-2xl max-w-lg w-full text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Icons.Stats className="w-6 h-6 text-primary" />
            </div>
            <p className="font-mono text-slate-400 text-sm mb-4">No YouTube channel linked yet.</p>
            <p className="text-xs text-slate-500">Sign in with Google and link your YouTube channel to see your stats here.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grow flex flex-col items-center justify-center gap-6 text-center py-20">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/VidMetrics_LOGO.png" alt="" className="w-6 h-6 object-contain opacity-60" />
          </div>
        </div>
        <div>
          <p className="font-mono text-sm text-primary">Fetching Your Channel Data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grow flex flex-col items-center justify-center gap-5 text-center py-20">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <Icons.Video className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <p className="font-bold text-white mb-2">Could not load your channel</p>
          <p className="text-sm text-slate-400 max-w-md">{error}</p>
        </div>
        <button onClick={loadData} className="px-5 py-2.5 bg-primary text-slate-900 font-bold rounded-lg text-sm hover:opacity-90">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grow flex flex-col pt-4">
      <header className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-outline/20 shrink-0">
              <img src={channelInfo?.thumbnail || userChannel.youtube_channel_thumbnail || ''} alt={channelInfo?.title || userChannel.youtube_channel_name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{channelInfo?.title || userChannel.youtube_channel_name}</h1>
                <div className="flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-mono px-2 py-0.5 rounded-full border border-primary/20">
                  <Icons.Verified className="w-3 h-3" />
                  YOUR CHANNEL
                </div>
              </div>
              {channelInfo?.customUrl && (
                <p className="font-mono text-[11px] text-slate-500">{channelInfo.customUrl}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Subscribers', value: formatNumber(channelInfo?.subscriberCount || 0) },
              { label: 'Total Videos', value: formatNumber(channelInfo?.videoCount || 0) },
              { label: 'Total Views', value: formatNumber(channelInfo?.viewCount || 0) },
              { label: 'Fetched', value: `${videos.length} videos` },
            ].map(s => (
              <div key={s.label} className="bg-surface border border-outline/10 rounded-lg px-3 py-2">
                <div className="font-mono text-sm font-bold text-white">{s.value}</div>
                <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-surface/50 p-1.5 rounded-xl border border-outline/15 self-start shrink-0">
          {(['30d', '7d', 'all'] as DateFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider transition-colors whitespace-nowrap ${
                dateFilter === f ? 'bg-surface-hover text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f === '30d' ? '30 DAYS' : f === '7d' ? '7 DAYS' : 'ALL TIME'}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mr-1 whitespace-nowrap">Sort:</span>
          {([
            { key: 'viewsPerDay', label: 'VIEWS/DAY' },
            { key: 'views', label: 'VIEWS' },
            { key: 'likes', label: 'LIKES' },
            { key: 'date', label: 'NEWEST' },
          ] as { key: SortKey; label: string }[]).map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              className={`px-4 py-2 rounded-lg text-xs font-mono whitespace-nowrap flex items-center gap-1 transition-colors shrink-0 ${
                sortKey === opt.key
                  ? 'bg-surface border border-outline/20 text-white'
                  : 'bg-surface/50 hover:bg-surface border border-transparent text-slate-400'
              }`}
            >
              {opt.label}
              {sortKey === opt.key && <Icons.ArrowRight className="w-3 h-3 rotate-90" />}
            </button>
          ))}
        </div>
        <div className="relative hidden sm:block">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter videos..."
            className="bg-surface/50 border border-outline/10 rounded-lg pl-10 pr-8 py-1.5 text-sm focus:ring-1 focus:ring-primary/40 w-48 focus:w-64 text-slate-200 placeholder:text-slate-600 outline-none transition-all duration-300"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs">✕</button>
          )}
        </div>
      </div>

      {searchQuery && !loading && (
        <div className="mb-4 px-4 py-2 bg-primary/5 border border-primary/15 rounded-lg flex items-center justify-between">
          <span className="text-xs font-mono text-primary">
            {displayedVideos.length} result{displayedVideos.length !== 1 ? 's' : ''} for "{searchQuery}"
          </span>
        </div>
      )}

      {displayedVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <Icons.Video className="w-10 h-10 text-slate-700" />
          <div>
            <p className="text-slate-400 font-medium">No videos found</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="hidden md:grid grid-cols-12 px-6 py-3 border-b border-outline/10 items-center">
            <div className="col-span-5 font-mono text-[10px] uppercase tracking-widest text-slate-500">Video</div>
            <div className="col-span-3 font-mono text-[10px] uppercase tracking-widest text-slate-500 text-right">Metrics</div>
            <div className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-slate-500 text-right">Views/Day</div>
            <div className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-slate-500 text-right">Trend</div>
          </div>

          {displayedVideos.map((video) => (
            <div
              key={video.id}
              className="bg-surface hover:bg-surface-hover transition-all duration-200 rounded-xl p-4 md:px-6 md:py-5 border border-transparent hover:border-outline/20 group cursor-pointer"
              onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank', 'noopener')}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="col-span-1 md:col-span-5 flex gap-4">
                  <div className="relative shrink-0">
                    <img src={video.thumbnail} alt={video.title} className="w-32 h-20 md:w-36 md:h-[5.4rem] object-cover rounded-lg shadow-xl bg-surface-hover" loading="lazy" />
                    <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-[10px] font-mono px-1.5 py-0.5 rounded text-white">
                      {video.durationFmt}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center gap-1.5 min-w-0">
                    <h3 className="font-bold text-white leading-snug group-hover:text-primary transition-colors line-clamp-2 text-sm">
                      {video.title}
                    </h3>
                    <p className="font-mono text-[10px] text-slate-500 uppercase">
                      {formatDate(video.publishedAt)} · {video.daysSincePublished}d ago
                    </p>
                  </div>
                </div>
                <div className="col-span-1 md:col-span-3 grid grid-cols-3 md:flex md:flex-col md:items-end gap-2 md:gap-1">
                  <Metric label="Views" value={formatNumber(video.views)} />
                  <Metric label="Likes" value={formatNumber(video.likes)} />
                  <Metric label="Comments" value={formatNumber(video.comments)} />
                </div>
                <div className="col-span-1 md:col-span-2 flex flex-col items-end gap-0.5">
                  <span className="font-mono text-xl font-bold text-accent">{formatNumber(video.viewsPerDay)}</span>
                  <span className="font-mono text-[9px] text-slate-500 uppercase">Per Day</span>
                </div>
                <div className="col-span-1 md:col-span-2 flex items-center justify-end">
                  <Sparkline data={video.trend} color={video.isTrending ? 'var(--color-accent)' : 'var(--color-outline)'} className="w-full max-w-[100px]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto pt-8 flex items-center justify-between text-slate-600 text-xs font-mono">
        <span>{displayedVideos.length} video{displayedVideos.length !== 1 ? 's' : ''} · {dateFilter === 'all' ? 'All time' : `Last ${dateFilter}`}</span>
        <span>YouTube Data API v3</span>
      </div>
    </div>
  );
};
