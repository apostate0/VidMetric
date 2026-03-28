import { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { motion, AnimatePresence } from 'motion/react';
import { ChannelInfo, VideoItem } from '../api/youtube';
import { generateCompetitors, CompetitorData } from '../api/openrouter';

interface CompetitorsProps {
  channelInfo: ChannelInfo | null;
  videos: VideoItem[];
}

export const Competitors = ({ channelInfo, videos }: CompetitorsProps) => {
  const [data, setData] = useState<CompetitorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function load() {
      if (!channelInfo || videos.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const result = await generateCompetitors(channelInfo, videos);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch competitor insights');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [channelInfo, videos]);

  if (!channelInfo) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <p className="font-mono text-slate-500">Search for a channel first to see competitor intelligence.</p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col pt-4">
      <header className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <label className="text-primary font-mono text-xs uppercase tracking-[0.2em] mb-2 block">Competitive Intel</label>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white mb-2">Market Velocity</h1>
          <p className="text-slate-400 text-sm max-w-xl">Real-time analysis of competitor signal-to-noise ratio. Identify emerging content gaps before market saturation.</p>
        </div>
      </header>

      {loading && (
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <p className="font-mono text-sm text-primary animate-pulse">Running AI Market Analysis...</p>
          </div>
        </div>
      )}

      {!loading && error && (
         <div className="flex-grow flex flex-col items-center justify-center gap-5 text-center py-20 p-6 bg-red-500/5 rounded-xl border border-red-500/20">
           <Icons.AlertTriangle className="w-8 h-8 text-red-500" />
           <p className="text-slate-300 font-mono text-sm max-w-lg">{error}</p>
         </div>
      )}

      {/* Stats row */}
      {!loading && data && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Avg Velocity (Top)', value: data.avgVelocity, highlight: true },
              { label: 'Saturation Risk', value: data.saturationRisk, highlight: false },
              { label: 'Content Gaps', value: data.contentGaps, highlight: true },
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-surface-hover rounded-xl border border-outline/10">
                <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">{stat.label}</h4>
                <div className={`text-2xl font-mono font-bold ${stat.highlight ? 'text-primary' : 'text-white'}`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface border border-outline/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-hover border-b border-outline/10">
                    <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 font-normal">Rank</th>
                    <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 font-normal">Competitor Profile</th>
                    <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 font-normal text-right">Est. Weekly Views</th>
                    <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 font-normal text-right">Saturation</th>
                    <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 font-normal text-right">Velocity</th>
                  </tr>
                </thead>
                <tbody>
                  {data.competitors.map((comp, idx) => (
                    <tr 
                      key={comp.name}
                      className="border-b border-outline/5 hover:bg-surface-hover/50 transition-colors"
                    >
                      <td className="p-4 font-mono text-sm text-slate-400">
                        {comp.rank.toString().padStart(2, '0')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Icons.Search className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{comp.name}</div>
                            <div className="font-mono text-[10px] text-slate-500">{comp.identifier}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono text-sm text-white">{comp.estViews}</td>
                      <td className="p-4 text-right">
                        <span className={`font-mono text-[10px] uppercase px-2 py-1 rounded inline-block ${
                          comp.saturation === 'High' ? 'bg-red-500/10 text-red-400' :
                          comp.saturation === 'Med' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-green-500/10 text-green-400'
                        }`}>
                          {comp.saturation}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className={`font-mono text-sm font-bold flex items-center justify-end gap-1 ${
                          comp.velocity.startsWith('-') ? 'text-red-400' : 'text-primary'
                        }`}>
                          {comp.velocity}
                          {comp.velocity.startsWith('-') ? <Icons.ArrowRight className="w-3 h-3 rotate-45" /> : <Icons.TrendingUp className="w-3 h-3" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
