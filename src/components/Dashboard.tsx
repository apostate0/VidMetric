import { useState, useEffect, useCallback } from 'react';
import { Icons } from './Icons';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkline } from './Sparkline';
import {
  resolveChannelId,
  fetchChannelInfo,
  fetchChannelVideos,
  formatNumber,
  formatDate,
  exportCSV,
  type VideoItem,
  type ChannelInfo,
  type DateFilter,
  type SortKey,
} from '../api/youtube';

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="text-right">
    <span className="block font-mono text-sm text-white">{value}</span>
    <span className="block font-mono text-[9px] text-slate-500 uppercase">{label}</span>
  </div>
);

interface DashboardProps {
  channelUrl: string;
  searchQuery: string;
  onBack: () => void;
  onAnalyze: (url: string) => void;
  onDataLoaded?: (channelInfo: ChannelInfo, videoCount: number, videos: VideoItem[]) => void;
}

export const Dashboard = ({ channelUrl, searchQuery, onBack, onAnalyze, onDataLoaded }: DashboardProps) => {
  const [channelInfo, setChannelInfo]     = useState<ChannelInfo | null>(null);
  const [videos, setVideos]               = useState<VideoItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [dateFilter, setDateFilter]       = useState<DateFilter>('30d');
  const [sortKey, setSortKey]             = useState<SortKey>('viewsPerDay');
  const [minViews, setMinViews]           = useState(0);
  const [showFilters, setShowFilters]     = useState(false);
  const [newChannel, setNewChannel]       = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);

  const loadData = useCallback(async () => {
    if (!channelUrl) {
      setLoading(false);
      setError('');
      setVideos([]);
      setChannelInfo(null);
      return;
    }
    setLoading(true);
    setError('');
    setVideos([]);
    setChannelInfo(null);
    try {
      const channelId = await resolveChannelId(channelUrl);
      const [info, vids] = await Promise.all([
        fetchChannelInfo(channelId),
        fetchChannelVideos(channelId, dateFilter),
      ]);
      setChannelInfo(info);
      setVideos(vids);
      if (onDataLoaded) onDataLoaded(info, vids.length, vids);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [channelUrl, dateFilter, onDataLoaded]);

  useEffect(() => { loadData(); }, [loadData]);

  // Apply search + min views + sort
  const displayedVideos = [...videos]
    .filter(v => {
      if (v.views < minViews) return false;
      if (searchQuery.trim()) {
        return v.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortKey) {
        case 'views':       return b.views - a.views;
        case 'viewsPerDay': return b.viewsPerDay - a.viewsPerDay;
        case 'likes':       return b.likes - a.likes;
        case 'date':        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
    });

  const handleExport = () => {
    if (channelInfo && displayedVideos.length) exportCSV(displayedVideos, channelInfo.title);
  };

  const handleNewChannelSubmit = () => {
    const val = newChannel.trim();
    if (!val) return;
    setNewChannel('');
    setShowNewChannel(false);
    setMinViews(0);
    setSortKey('viewsPerDay');
    setDateFilter('30d');
    onAnalyze(val);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Main ── */}
      <main className="flex-grow flex flex-col w-full min-w-0">

        {/* Inline: Analyze new channel panel */}
        <AnimatePresence>
          {showNewChannel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-surface border border-primary/20 rounded-xl p-5 flex flex-col sm:flex-row gap-3 items-center">
                <Icons.Search className="text-primary w-5 h-5 flex-shrink-0 hidden sm:block" />
                <input
                  type="text"
                  value={newChannel}
                  onChange={e => setNewChannel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNewChannelSubmit()}
                  placeholder="Enter new channel URL or @handle..."
                  className="flex-grow bg-background border-none rounded-lg px-4 py-3 font-mono text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-primary/40 outline-none"
                  autoFocus
                />
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={handleNewChannelSubmit}
                    className="performance-gradient text-slate-900 font-bold px-5 py-3 rounded-lg text-xs whitespace-nowrap hover:opacity-90 transition-opacity"
                  >
                    Analyze
                  </button>
                  <button
                    onClick={() => { setShowNewChannel(false); setNewChannel(''); }}
                    className="px-4 py-3 bg-surface-hover border border-outline/10 text-slate-400 rounded-lg text-xs hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex-grow flex flex-col items-center justify-center gap-6 text-center py-20">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <img src="/VidMetrics_LOGO.png" alt="" className="w-6 h-6 object-contain opacity-60" />
              </div>
            </div>
            <div>
              <p className="font-mono text-sm text-primary">Fetching Channel Data</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">{channelUrl}</p>
            </div>
          </div>
        )}

        {!loading && !error && !channelInfo && !channelUrl && (
          <div className="flex-grow flex flex-col items-center justify-center gap-6 text-center py-20">
            <div className="w-full max-w-xl bg-surface border border-outline/15 rounded-2xl p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icons.TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white tracking-tight">Compare channels</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Paste a channel URL or @handle</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newChannel}
                  onChange={e => setNewChannel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNewChannelSubmit()}
                  placeholder="https://youtube.com/@channel or @channel"
                  className="flex-grow bg-background border border-outline/10 rounded-lg px-4 py-3 font-mono text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-primary/40 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleNewChannelSubmit}
                    className="performance-gradient text-slate-900 font-bold px-6 py-3 rounded-lg text-xs whitespace-nowrap hover:opacity-90 transition-opacity"
                  >
                    Compare
                  </button>
                  <button
                    onClick={onBack}
                    className="px-5 py-3 bg-surface-hover border border-outline/10 text-slate-400 rounded-lg text-xs hover:text-white transition-colors"
                  >
                    Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="flex-grow flex flex-col items-center justify-center gap-5 text-center py-20">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <Icons.Video className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="font-bold text-white mb-2">Could not load channel</p>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed">{error}</p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <button onClick={loadData} className="px-5 py-2.5 bg-primary text-slate-900 font-bold rounded-lg text-sm hover:opacity-90 transition-opacity">
                Try Again
              </button>
              <button onClick={() => setShowNewChannel(true)} className="px-5 py-2.5 bg-surface border border-outline/20 text-slate-300 font-bold rounded-lg text-sm hover:bg-surface-hover transition-colors">
                Try Different Channel
              </button>
              <button onClick={onBack} className="px-5 py-2.5 bg-surface border border-outline/20 text-slate-500 rounded-lg text-sm hover:text-white transition-colors">
                Go Home
              </button>
            </div>
          </div>
        )}

        {/* ── Dashboard ── */}
        {!loading && !error && channelInfo && (
          <>
            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-outline/20 flex-shrink-0">
                    <img src={channelInfo.thumbnail} alt={channelInfo.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{channelInfo.title}</h1>
                      <div className="flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-mono px-2 py-0.5 rounded-full border border-primary/20">
                        <Icons.Verified className="w-3 h-3" />
                        VERIFIED
                      </div>
                    </div>
                    {channelInfo.customUrl && (
                      <p className="font-mono text-[11px] text-slate-500">{channelInfo.customUrl}</p>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'Subscribers', value: formatNumber(channelInfo.subscriberCount) },
                    { label: 'Total Videos', value: formatNumber(channelInfo.videoCount) },
                    { label: 'Total Views',  value: formatNumber(channelInfo.viewCount) },
                    { label: 'Fetched',      value: `${videos.length} videos` },
                  ].map(s => (
                    <div key={s.label} className="bg-surface border border-outline/10 rounded-lg px-3 py-2">
                      <div className="font-mono text-sm font-bold text-white">{s.value}</div>
                      <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date filter */}
              <div className="flex items-center gap-2 bg-surface/50 p-1.5 rounded-xl border border-outline/15 self-start flex-shrink-0">
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

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mr-1 whitespace-nowrap">Sort:</span>
                {([
                  { key: 'viewsPerDay', label: 'VIEWS/DAY' },
                  { key: 'views',       label: 'VIEWS'     },
                  { key: 'likes',       label: 'LIKES'     },
                  { key: 'date',        label: 'NEWEST'    },
                ] as { key: SortKey; label: string }[]).map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setSortKey(opt.key)}
                    className={`px-4 py-2 rounded-lg text-xs font-mono whitespace-nowrap flex items-center gap-1 transition-colors flex-shrink-0 ${
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

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowNewChannel(s => !s)}
                  className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline/10 rounded-lg text-xs font-mono text-slate-300 hover:bg-surface-hover transition-colors"
                >
                  <Icons.Search className="w-4 h-4" />
                  NEW CHANNEL
                </button>
                <button
                  onClick={() => setShowFilters(f => !f)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-mono transition-colors ${
                    showFilters || minViews > 0
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-surface border-outline/10 text-white hover:bg-surface-hover'
                  }`}
                >
                  <Icons.Filter className="w-4 h-4" />
                  FILTER {minViews > 0 && <span className="bg-primary text-slate-900 rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-bold">1</span>}
                </button>
                <button
                  onClick={handleExport}
                  disabled={displayedVideos.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 rounded-lg text-xs font-bold tracking-tight hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Icons.Download className="w-4 h-4" />
                  EXPORT CSV
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden"
                >
                  <div className="bg-surface p-5 rounded-xl border border-outline/10 flex flex-wrap items-center gap-8">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2">Min Views Threshold</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range" min={0} max={1_000_000} step={5000}
                          value={minViews} onChange={e => setMinViews(parseInt(e.target.value))}
                          className="w-40 accent-primary cursor-pointer"
                        />
                        <span className="font-mono text-sm text-primary w-16">{formatNumber(minViews)}</span>
                        {minViews > 0 && (
                          <button onClick={() => setMinViews(0)} className="text-[10px] text-slate-500 hover:text-red-400 transition-colors font-mono underline">
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2">Result</p>
                      <span className="font-mono text-sm text-white">
                        {displayedVideos.length} / {videos.length} videos
                        {searchQuery && <span className="text-primary ml-2">matching "{searchQuery}"</span>}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search active banner */}
            {searchQuery && !showFilters && (
              <div className="mb-4 px-4 py-2 bg-primary/5 border border-primary/15 rounded-lg flex items-center justify-between">
                <span className="text-xs font-mono text-primary">
                  {displayedVideos.length} result{displayedVideos.length !== 1 ? 's' : ''} for "{searchQuery}"
                </span>
              </div>
            )}

            {/* No results */}
            {displayedVideos.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <Icons.Video className="w-10 h-10 text-slate-700" />
                <div>
                  <p className="text-slate-400 font-medium">No videos found</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {searchQuery ? `No videos match "${searchQuery}"` : 'Try changing the date range or lowering the views threshold'}
                  </p>
                </div>
                {searchQuery && (
                  <button
                    className="text-xs font-mono text-primary hover:underline"
                    onClick={() => onAnalyze(channelUrl)} // re-trigger clear via parent
                  >
                    Clear filter in navbar to see all videos
                  </button>
                )}
              </div>
            )}

            {/* Video List */}
            {displayedVideos.length > 0 && (
              <div className="flex flex-col gap-3">
                {/* Header row */}
                <div className="hidden md:grid grid-cols-12 px-6 py-3 border-b border-outline/10 items-center">
                  <div className="col-span-5 font-mono text-[10px] uppercase tracking-widest text-slate-500">Video</div>
                  <div className="col-span-3 font-mono text-[10px] uppercase tracking-widest text-slate-500 text-right">Metrics</div>
                  <div className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-slate-500 text-right">Views/Day</div>
                  <div className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-slate-500 text-right">Trend</div>
                </div>

                {displayedVideos.map((video, idx) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.6) }}
                    className="bg-surface hover:bg-surface-hover transition-all duration-200 rounded-xl p-4 md:px-6 md:py-5 border border-transparent hover:border-outline/20 group cursor-pointer"
                    onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank', 'noopener')}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                      {/* Thumbnail + title */}
                      <div className="col-span-1 md:col-span-5 flex gap-4">
                        <div className="relative flex-shrink-0">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-32 h-20 md:w-36 md:h-[5.4rem] object-cover rounded-lg shadow-xl bg-surface-hover"
                            loading="lazy"
                          />
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
                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            {video.isTrending && (
                              <span className="bg-accent/10 text-accent px-1.5 py-0.5 rounded flex items-center gap-1 text-[9px] font-bold border border-accent/20">
                                <Icons.TrendingUp className="w-2.5 h-2.5" />
                                TRENDING
                              </span>
                            )}
                            <span className="text-slate-600 text-[10px] font-mono flex items-center gap-1 group-hover:text-slate-400 transition-colors">
                              <Icons.ExternalLink className="w-3 h-3" /> Open on YouTube
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Metrics: views, likes, comments */}
                      <div className="col-span-1 md:col-span-3 grid grid-cols-3 md:flex md:flex-col md:items-end gap-2 md:gap-1">
                        <Metric label="Views"    value={formatNumber(video.views)}    />
                        <Metric label="Likes"    value={formatNumber(video.likes)}    />
                        <Metric label="Comments" value={formatNumber(video.comments)} />
                      </div>

                      {/* Views/Day */}
                      <div className="col-span-1 md:col-span-2 flex flex-col items-end gap-0.5">
                        <span className="font-mono text-xl font-bold text-accent">{formatNumber(video.viewsPerDay)}</span>
                        <span className="font-mono text-[9px] text-slate-500 uppercase">Per Day</span>
                      </div>

                      {/* Sparkline */}
                      <div className="col-span-1 md:col-span-2 flex items-center justify-end">
                        <Sparkline
                          data={video.trend}
                          color={video.isTrending ? 'var(--color-accent)' : 'var(--color-outline)'}
                          className="w-full max-w-[100px]"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Footer row */}
            <div className="mt-auto pt-8 flex items-center justify-between text-slate-600 text-xs font-mono">
              <span>
                {displayedVideos.length} video{displayedVideos.length !== 1 ? 's' : ''}
                {' · '}
                {dateFilter === 'all' ? 'All time' : `Last ${dateFilter}`}
                {searchQuery && ` · filtered by "${searchQuery}"`}
              </span>
              <span>YouTube Data API v3</span>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
