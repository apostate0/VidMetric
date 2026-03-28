import React, { useState } from 'react';
import { Icons } from './Icons';
import { motion } from 'motion/react';
import { Sparkline } from './Sparkline';

interface LandingPageProps {
  onAnalyze: (url: string) => void;
}

const FEATURES = [
  { icon: Icons.Stats,    label: 'Views/Day Score',    desc: 'Ranks videos by daily velocity, not just total views' },
  { icon: Icons.TrendingUp, label: 'Trending Detector', desc: 'Flags videos outperforming the channel average by 1.5×' },
  { icon: Icons.Download,  label: 'CSV Export',         desc: 'Export full video data for further analysis in any tool' },
  { icon: Icons.Filter,    label: 'Smart Filters',      desc: 'Filter by date range and minimum view threshold' },
];

export const LandingPage = ({ onAnalyze }: LandingPageProps) => {
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const val = inputVal.trim();
    if (!val) {
      setError('Please enter a YouTube channel URL or @handle');
      return;
    }
    setError('');
    onAnalyze(val);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="relative min-h-screen pt-16 overflow-hidden">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(192,193,255,0.025) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(192,193,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-16 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-outline/10"
        >
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Powered by YouTube Data API v3</span>
          <span className="w-1 h-1 rounded-full bg-accent" />
          <span className="text-xs text-slate-400">Real data, zero friction</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent"
        >
          Analyze Any YouTube<br />Channel Instantly
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="max-w-2xl text-lg text-slate-400 leading-relaxed mb-10"
        >
          Paste any channel URL or @handle to instantly see their top-performing videos, ranked by daily velocity. Identify what's working — for any channel, in seconds.
        </motion.p>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="w-full max-w-2xl glass p-2 rounded-xl border border-outline/15 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-grow">
              <Icons.Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                value={inputVal}
                onChange={e => { setInputVal(e.target.value); setError(''); }}
                onKeyDown={handleKey}
                placeholder="youtube.com/@mkbhd  or  @channel"
                className="w-full bg-background border-none rounded-lg pl-12 pr-4 py-4 font-mono text-sm focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-slate-600 text-white outline-none"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="performance-gradient text-slate-900 font-bold px-8 py-4 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] whitespace-nowrap hover:opacity-90"
            >
              Analyze Channel
              <Icons.ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {error && <p className="text-red-400 text-xs font-mono px-2 pt-2 pb-1">{error}</p>}
        </motion.div>

        {/* Quick examples */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="mt-4 flex flex-wrap justify-center gap-2 items-center"
        >
          <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Try:</span>
          {['@mkbhd', '@veritasium', '@fireship', '@mrbeast'].map(ex => (
            <button
              key={ex}
              onClick={() => { setInputVal(ex); setError(''); }}
              className="text-[10px] font-mono text-slate-500 hover:text-primary border border-outline/10 hover:border-primary/30 rounded px-2.5 py-1 transition-colors"
            >
              {ex}
            </button>
          ))}
        </motion.div>
      </section>

      {/* ── Features Grid ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary text-center mb-3"
        >
          What you get
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-12"
        >
          Everything you need to understand<br className="hidden md:block" /> competitor performance
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="bg-surface rounded-xl p-6 border border-outline/5 flex flex-col gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/10">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-white text-sm">{f.label}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Bento Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Sparkline preview */}
          <motion.div
            whileHover={{ y: -5 }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="md:col-span-8 bg-surface rounded-xl p-8 border border-outline/5"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2 block">Views / Day</span>
                <h3 className="text-2xl font-bold tracking-tight">Performance Velocity</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">Each video ranked by how fast it's gaining views — not just how many it has.</p>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-slate-500 uppercase tracking-widest">Sample trend</div>
              </div>
            </div>
            <Sparkline data={[12, 28, 22, 45, 38, 62, 55, 80, 100]} height={140} />
          </motion.div>

          {/* Metrics breakdown */}
          <motion.div
            whileHover={{ y: -5 }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="md:col-span-4 bg-surface p-8 rounded-xl border border-outline/5"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2 block">Per Video</span>
            <h3 className="text-2xl font-bold tracking-tight mb-6">Metrics Shown</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Views',         color: 'text-white' },
                { label: 'Likes',         color: 'text-white' },
                { label: 'Comments',      color: 'text-white' },
                { label: 'Views / Day',   color: 'text-accent' },
                { label: 'Days Since Published', color: 'text-slate-400' },
                { label: 'Trending Badge',color: 'text-accent' },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                  <span className={`font-mono text-xs ${m.color}`}>{m.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Audit engine CTA */}
          <motion.div
            whileHover={{ y: -5 }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="md:col-span-12 bg-surface p-8 rounded-xl border border-outline/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="relative z-10 max-w-xl">
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2 block">Ready to start?</span>
              <h3 className="text-3xl font-bold tracking-tighter mb-3">Know what's working for competitors in seconds.</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Paste any YouTube channel — get instant data on their top-performing videos, sorted by daily view velocity.</p>
            </div>
            <div className="relative z-10 flex-shrink-0">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="performance-gradient text-slate-900 font-bold px-10 py-4 rounded-xl text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                Analyze a Channel
                <Icons.ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-0 top-0 w-60 h-60 bg-accent/3 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      </section>
    </div>
  );
};
