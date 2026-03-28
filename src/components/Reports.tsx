import { useState } from 'react';
import { Icons } from './Icons';
import { motion, AnimatePresence } from 'motion/react';
import { ChannelInfo, VideoItem } from '../api/youtube';
import { generateReportContent } from '../api/openrouter';

interface ReportsProps {
  channelInfo: ChannelInfo | null;
  videos: VideoItem[];
}

interface ReportJob {
  id: string;
  type: string;
  date: string;
  status: 'Generating' | 'Generated' | 'Failed';
  content?: string;
  size?: string;
}

export const Reports = ({ channelInfo, videos }: ReportsProps) => {
  const [jobs, setJobs] = useState<ReportJob[]>([]);
  const [selectedType, setSelectedType] = useState('Comprehensive Channel Audit');

  const handleGenerate = async () => {
    if (!channelInfo) return;
    const reportId = `RPT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newJob: ReportJob = {
      id: reportId,
      type: selectedType,
      date: new Date().toLocaleDateString(),
      status: 'Generating'
    };
    
    setJobs(prev => [newJob, ...prev]);

    try {
      const content = await generateReportContent(selectedType, channelInfo, videos);
      
      // Calculate rough size in KB
      const sizeKb = (new Blob([content]).size / 1024).toFixed(1);

      setJobs(prev => prev.map(job => 
        job.id === reportId 
          ? { ...job, status: 'Generated', content, size: `${sizeKb} KB` }
          : job
      ));
    } catch (e) {
      setJobs(prev => prev.map(job => 
        job.id === reportId 
          ? { ...job, status: 'Failed', size: '—' }
          : job
      ));
    }
  };

  const handleDownload = (job: ReportJob) => {
    if (!job.content) return;
    const blob = new Blob([job.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.id}_${job.type.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!channelInfo) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <p className="font-mono text-slate-500">Search for a channel first to access reporting.</p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col pt-4 pb-24">
      <header className="mb-12">
        <label className="text-primary font-mono text-xs uppercase tracking-[0.2em] mb-2 block">Data Extraction</label>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tighter mb-4">Reports & Exports</h1>
        <p className="text-slate-400 leading-relaxed text-sm md:text-base max-w-2xl">Access generated intelligence reports, raw CSV exports, and manage automated scheduled deliveries for stakeholders.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 lg:col-span-2 bg-surface border border-outline/10 p-8 rounded-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(192,193,255,0.05),transparent_50%)]" />
          <h2 className="text-xl font-bold tracking-tight text-white mb-6 relative z-10">Generate New Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2 block">Report Type</label>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-surface-hover border border-outline/10 text-sm px-4 py-3 rounded-lg focus:ring-1 focus:ring-primary/40 text-white outline-none appearance-none cursor-pointer"
                >
                  <option>Comprehensive Channel Audit</option>
                  <option>Competitor Velocity Map</option>
                  <option>Audience Retention Analysis</option>
                  <option>Viewer Sentiment Breakdown</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2 block">Data Scope</label>
                <div className="bg-surface-hover border border-outline/10 text-sm px-4 py-3 rounded-lg text-slate-300">
                  Last {videos.length} videos from {channelInfo.title}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-end">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.Search className="w-4 h-4 text-primary" />
                  <span className="font-mono text-xs font-bold text-primary uppercase tracking-widest">Est. Processing Time</span>
                </div>
                <p className="text-white font-mono text-2xl font-bold">~15 sec</p>
                <p className="text-[10px] text-slate-500 mt-1">AI synthesis requires deep analysis</p>
              </div>
              <button 
                onClick={handleGenerate}
                className="w-full performance-gradient hover:opacity-90 text-slate-900 font-bold py-3.5 rounded-lg text-xs uppercase tracking-widest shadow-lg shadow-primary/10 active:scale-95 transition-all"
              >
                Initiate Generation
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-1 bg-surface border border-outline/10 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-4">Scheduled Deliveries</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg border border-outline/5">
                <div>
                  <p className="text-sm font-bold text-white">Executive Summary</p>
                  <p className="text-[10px] font-mono text-slate-500">Every Monday @ 9:00 AM</p>
                </div>
                <div className="w-8 h-4 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-slate-900 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 w-full mt-6 py-3 border border-outline/20 hover:border-primary/40 text-slate-300 hover:text-white transition-all text-[10px] uppercase tracking-widest font-mono rounded">
            <Icons.Settings className="w-3 h-3" /> Manage Schedules
          </button>
        </div>
      </div>

      <div className="bg-surface border border-outline/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-surface w-full">
          <h3 className="font-bold relative text-white">Generated Artifacts</h3>
        </div>
        
        {jobs.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-16 text-center">
             <Icons.Search className="w-8 h-8 text-slate-700 mb-4" />
             <p className="text-slate-400 text-sm">No reports generated yet for this session.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-hover border-b border-outline/10">
                  <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 font-normal">Report ID</th>
                  <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 font-normal">Type &amp; Date</th>
                  <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 font-normal">Status</th>
                  <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 font-normal text-right">Size</th>
                  <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 font-normal text-center">Download</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {jobs.map((rpt, idx) => (
                    <motion.tr 
                      key={rpt.id}
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="border-b border-outline/5 hover:bg-surface-hover/50 transition-colors"
                    >
                      <td className="p-4 font-mono text-sm text-slate-400">{rpt.id}</td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-white mb-0.5">{rpt.type}</div>
                        <div className="font-mono text-[10px] text-slate-500">{rpt.date}</div>
                      </td>
                      <td className="p-4">
                        <span className={`font-mono text-[10px] uppercase px-2 py-1 rounded inline-block ${
                          rpt.status === 'Generating' ? 'bg-accent/10 text-accent animate-pulse' :
                          rpt.status === 'Generated' ? 'bg-primary/10 text-primary' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {rpt.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono text-sm text-slate-400">{rpt.size || '—'}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleDownload(rpt)}
                          disabled={rpt.status !== 'Generated'}
                          className={`p-2 rounded transition-colors ${
                            rpt.status !== 'Generated' ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-surface-hover'
                          }`}
                        >
                          <Icons.Download className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

