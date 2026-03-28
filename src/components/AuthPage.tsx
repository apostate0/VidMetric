import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Icons } from './Icons';

interface AuthPageProps {
  onBack: () => void;
}

export const AuthPage = ({ onBack }: AuthPageProps) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState('');

  const resetForm = () => { setEmail(''); setPassword(''); setName(''); setError(''); setSuccess(''); };
  const switchMode = (signup: boolean) => { setIsSignUp(signup); resetForm(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email.includes('@')) {
      setError('Please provide a valid email address.');
      setLoading(false);
      return;
    }

    let result: { error: string | null };
    if (!isSignUp) {
      result = await signIn(email, password);
      // If success, App.tsx useEffect will catch the user change and redirect to 'dashboard'
    } else {
      if (!name.trim()) { setError('Please enter your name'); setLoading(false); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
      result = await signUp(email, password, name);
      if (!result.error) {
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setLoading(false);
        return;
      }
    }

    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    const { error } = await signInWithGoogle();
    if (error) { setError(error); setLoading(false); }
  };

  return (
    <div className="bg-background text-white font-body min-h-screen flex flex-col selection:bg-primary/30 relative">
      {/* Visual Polish: Noise Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0" 
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }} 
      />

      <header className="fixed top-0 w-full z-50 bg-[#121315] border-b border-[#464554]/15">
        <div className="flex justify-between items-center px-8 h-16 max-w-7xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 group cursor-pointer transition-transform hover:scale-105 active:scale-95">
            <img src="/VidMetrics_LOGO.png" alt="VidMetrics" className="w-8 h-8 object-contain" />
            <div className="text-xl font-bold tracking-tighter text-slate-100 font-headline">
              VidMetrics
            </div>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => switchMode(false)} className={`${!isSignUp ? 'text-[#c0c1ff]' : 'text-slate-400 hover:text-white'} font-semibold font-['Inter'] tracking-tight text-sm transition-opacity active:opacity-80`}>Log In</button>
            <button onClick={() => switchMode(true)} className={`${isSignUp ? 'bg-primary text-slate-900 border-none' : 'text-primary border border-primary/20 hover:bg-primary/10'} px-4 py-1.5 rounded-lg font-semibold font-['Inter'] tracking-tight text-sm transition-all`}>Sign Up</button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6 relative z-10 w-full">
        {/* Main Login Layout: Asymmetric Editorial Feel */}
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Branding/Marketing Column */}
          <div className="hidden lg:block lg:col-span-6 pr-12">
            <div className="space-y-6">
              <span className="font-mono text-[#c3d000] uppercase tracking-[0.2em] text-xs">Precision Intelligence</span>
              <h1 className="text-5xl xl:text-7xl font-extrabold tracking-tighter leading-none text-white font-headline">
                ANALYZE <br/>
                <span className="text-primary">BEYOND</span> <br/>
                THE VIEW.
              </h1>
              <p className="text-[#c7c4d7] text-lg leading-relaxed max-w-md">
                The ultimate terminal for high-performance YouTube creators. Access technical insights that common dashboards ignore.
              </p>
              
              {/* Decorative Element: Editorial Grid/Data Point */}
              <div className="pt-8 flex items-center gap-4">
                <div className="h-[1px] w-12 bg-white/10" />
                <div className="flex flex-col">
                  <span className="font-mono text-xl text-white font-bold tracking-tight">0.02ms</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Data Latency</span>
                </div>
                <div className="h-8 w-[1px] bg-white/10 mx-4" />
                <div className="flex flex-col">
                  <span className="font-mono text-xl text-white font-bold tracking-tight">99.9%</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Uptime Accuracy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-[#292a2b]/70 backdrop-blur-xl p-10 rounded-xl shadow-2xl relative overflow-hidden group border border-[#464554]/30">
              {/* Subtle Ambient Light Catch */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSignUp ? 'signup' : 'signin'}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-10">
                      <h2 className="text-2xl font-headline font-bold tracking-tight text-white mb-2">{isSignUp ? 'Create Account' : 'Sign In'}</h2>
                      <p className="text-[#c7c4d7] text-sm">Enter your credentials to access the terminal.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      {isSignUp && (
                        <div className="space-y-2">
                          <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest text-[#908fa0]" htmlFor="name">Full Name</label>
                          <div className="relative">
                            <Icons.Audience className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                              type="text" id="name" value={name} onChange={e => setName(e.target.value)}
                              placeholder="Your Name" required
                              className="w-full bg-[#0d0e0f] border-none text-white text-sm rounded-lg pl-11 pr-4 py-3.5 focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-slate-600 outline-none"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest text-[#908fa0]" htmlFor="email">Email Address</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</div>
                          <input
                            type="text" id="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="name@agency.com" required
                            className="w-full bg-[#0d0e0f] border-none text-white text-sm rounded-lg pl-11 pr-4 py-3.5 focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-slate-600 outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest text-[#908fa0]" htmlFor="password">Password</label>
                          {!isSignUp && (
                            <button type="button" className="text-[10px] uppercase tracking-widest text-primary font-bold hover:text-primary/80 transition-colors">Forgot Password?</button>
                          )}
                        </div>
                        <div className="relative">
                          <Icons.Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                          <input
                            type="password" id="password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••••••" required
                            className="w-full bg-[#0d0e0f] border-none text-white text-sm rounded-lg pl-11 pr-4 py-3.5 focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-slate-600 outline-none"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 font-mono">
                          {error}
                        </div>
                      )}

                      {success && (
                        <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg text-xs text-accent font-mono">
                          {success}
                        </div>
                      )}

                      <button
                        type="submit" disabled={loading}
                        className="w-full performance-gradient text-slate-900 py-3.5 rounded-lg font-bold text-sm tracking-tight shadow-lg shadow-primary/10 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? 'Authenticating...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                        <Icons.ArrowRight className="w-4 h-4" />
                      </button>
                    </form>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-outline/15" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-mono">
                        <span className="bg-[#292a2b] px-4 text-[#908fa0] rounded font-bold">Or protocol via</span>
                      </div>
                    </div>

                    {/* Social Auth */}
                    <button
                      onClick={handleGoogle} disabled={loading}
                      className="w-full bg-[#0d0e0f] border border-[#464554]/30 text-white py-3.5 rounded-lg text-sm hover:bg-[#1b1c1d] transition-colors flex items-center justify-center gap-3"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Sign {isSignUp ? 'up' : 'in'} with Google
                    </button>

                    <div className="mt-8 text-center">
                      <p className="text-[#908fa0] text-sm">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button onClick={() => switchMode(!isSignUp)} className="text-primary font-bold hover:underline transition-all underline-offset-4 ml-1.5">
                          {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
