import { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { motion, AnimatePresence } from 'motion/react';
import { VideoItem } from '../api/youtube';
import { generateInsights, InsightsData } from '../api/openrouter';

interface InsightsProps {
  videos: VideoItem[];
}

export const Insights = ({ videos }: InsightsProps) => {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function load() {
      if (videos.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const result = await generateInsights(videos);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch insights');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [videos]);

  if (videos.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <p className="font-mono text-slate-500">Search for a channel with videos first to see AI insights.</p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col pt-4 pb-24">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-2xl">
          <label className="text-primary font-mono text-xs uppercase tracking-[0.2em] mb-2 block">Performance Intelligence</label>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tighter mb-4">AI-Driven Insights</h1>
          <p className="text-slate-400 leading-relaxed text-sm md:text-base">Synthesis of data points across the channel ecosystem. Strategic shifts identified for rapid growth.</p>
        </div>
      </header>

      {loading && (
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <p className="font-mono text-sm text-primary animate-pulse">Running AI Strategy Generation...</p>
          </div>
        </div>
      )}

      {!loading && error && (
         <div className="flex-grow flex flex-col items-center justify-center gap-5 text-center py-20 p-6 bg-red-500/5 rounded-xl border border-red-500/20">
           <Icons.AlertTriangle className="w-8 h-8 text-red-500" />
           <p className="text-slate-300 font-mono text-sm max-w-lg">{error}</p>
         </div>
      )}

      {/* Bento Grid */}
      {!loading && data && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Content Area */}
            <section className="lg:col-span-8 space-y-6">
              <div className="bg-surface border border-outline/10 p-8 rounded-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Top Performing Pillars</h2>
                    <p className="text-slate-400 text-sm">Content clusters driving core viewership.</p>
                  </div>
                  <Icons.TrendingUp className="text-primary w-8 h-8" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                  {data.pillars.map((topic, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      key={topic.rank} className="space-y-4"
                    >
                      <div className="h-32 bg-surface-hover rounded-xl p-5 flex flex-col justify-end border border-outline/10 hover:border-primary/40 transition-all duration-300 group-hover:bg-surface relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="flex items-center justify-between mb-auto relative z-10">
                          <span className="font-mono text-primary font-bold">{topic.rank}</span>
                          <Icons.TrendingUp className="text-primary/70 w-5 h-5" />
                        </div>
                        <p className="text-white font-bold leading-tight relative z-10">{topic.title}</p>
                      </div>
                      <div>
                        <span className="text-2xl font-mono font-bold text-white block">{topic.views}</span>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Est. Views</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-hover/30 border border-outline/5 p-8 rounded-xl">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold tracking-tight text-white">Audience Retention Trends</h2>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Subscribed</span>
                    </div>
                  </div>
                </div>
                
                {/* Visual Bar Graph */}
                <div className="h-48 w-full flex items-end gap-1 sm:gap-2 px-2 border-b border-outline/10 pb-2">
                  {data.retention.map((h, i) => (
                    <div key={i} className={`flex-1 rounded-t-sm transition-all hover:bg-primary/60 cursor-pointer ${i % 3 === 0 ? 'bg-primary/40' : 'bg-primary/10'}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between mt-4 px-2">
                  <span className="font-mono text-[10px] text-slate-600 uppercase">Start</span>
                  <span className="font-mono text-[10px] text-slate-600 uppercase">Middle</span>
                  <span className="font-mono text-[10px] text-slate-600 uppercase">End</span>
                </div>
              </div>
            </section>

            {/* Sidebar Insights */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-surface-hover p-6 rounded-xl border border-outline/10">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary mb-6">Trending Indicators</h3>
                <div className="space-y-5">
                  {data.indicators.map((tr, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-outline/5 pb-4 last:border-0 last:pb-0">
                      <span className="text-sm font-medium text-slate-300">{tr.l}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-sm font-bold ${tr.dir === 'up' ? 'text-primary' : 'text-red-400'}`}>{tr.v}</span>
                        <Icons.ArrowRight className={`w-3 h-3 ${tr.dir === 'up' ? 'text-primary -rotate-45' : 'text-red-400 rotate-45'}`} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-5 border-t border-outline/10">
                  <p className="text-[11px] leading-relaxed text-slate-400 italic font-serif">
                    "{data.summaryQuote}"
                  </p>
                </div>
              </div>

              <div className="bg-surface border border-outline/10 p-6 rounded-xl">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white mb-6">Growth Opportunities</h3>
                <div className="space-y-4">
                  {data.opportunities.map((opp, idx) => {
                    const IconComp = opp.iconBase === 'Video' ? Icons.Video : Icons.TrendingUp;
                    return (
                      <div key={idx} className="p-4 bg-surface-hover/50 rounded-lg group cursor-pointer hover:bg-surface-hover transition-colors border border-transparent hover:border-outline/10">
                        <div className="flex justify-between mb-2">
                          <span className="px-2 py-0.5 bg-primary/10 text-primary font-mono text-[9px] uppercase tracking-widest rounded">{opp.tag}</span>
                          <IconComp className="text-slate-600 group-hover:text-primary transition-colors w-4 h-4" />
                        </div>
                        <h4 className="text-white text-sm font-bold mb-1">{opp.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{opp.desc}</p>
                      </div>
                    );
                  })}
                </div>
                <button className="w-full mt-6 py-3 border border-outline/20 hover:border-primary/40 text-slate-300 hover:text-white transition-all text-[10px] uppercase tracking-widest font-mono rounded">
                  View Strategic Roadmap
                </button>
              </div>
            </aside>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

