import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, type Profile } from '../lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  session:    Session | null;
  user:       User    | null;
  profile:    Profile | null;
  loading:    boolean;
  signUp:     (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn:     (email: string, password: string)               => Promise<{ error: string | null }>;
  signInWithGoogle: ()                                         => Promise<{ error: string | null }>;
  signOut:    ()                                              => Promise<void>;
  linkYouTubeWithGoogle: ()                                   => Promise<{ error: string | null }>;
  unlinkYouTube: ()                                           => Promise<void>;
  refreshProfile: ()                                          => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user,    setUser]    = useState<User    | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data ?? null);
  }, []);

  // Also try to fetch YouTube channel when user signs in with Google provider token
  const fetchAndStoreYouTubeChannel = useCallback(async (providerToken: string, userId: string) => {
    try {
      const res = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
        { headers: { Authorization: `Bearer ${providerToken}` } }
      );
      const data = await res.json();
      const ch = data.items?.[0];
      if (!ch) return;

      await supabase.from('profiles').update({
        youtube_channel_id:        ch.id,
        youtube_channel_name:      ch.snippet.title,
        youtube_channel_thumbnail: ch.snippet.thumbnails?.high?.url ?? ch.snippet.thumbnails?.default?.url ?? null,
        youtube_channel_url:       `https://youtube.com/channel/${ch.id}`,
      }).eq('id', userId);

      await loadProfile(userId);
    } catch { /* silently ignore — YouTube scope may not be granted */ }
  }, [loadProfile]);

  useEffect(() => {
    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        // If they signed in with Google and YouTube scope was granted
        if (session.provider_token && session.user.app_metadata?.provider === 'google') {
          fetchAndStoreYouTubeChannel(session.provider_token, session.user.id);
        }
      }
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        if (session.provider_token && session.user.app_metadata?.provider === 'google') {
          fetchAndStoreYouTubeChannel(session.provider_token, session.user.id);
        }
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile, fetchAndStoreYouTubeChannel]);

  // ── Auth actions ────────────────────────────────────────────────────────────

  const signUp = async (email: string, password: string, name: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        scopes: 'openid email profile',
      },
    });
    return { error: error?.message ?? null };
  };

  const linkYouTubeWithGoogle = async (): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        scopes: 'openid email profile https://www.googleapis.com/auth/youtube.readonly',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    return { error: error?.message ?? null };
  };

  const unlinkYouTube = async () => {
    if (!user) return;
    await supabase.from('profiles').update({
      youtube_channel_id:        null,
      youtube_channel_name:      null,
      youtube_channel_thumbnail: null,
      youtube_channel_url:       null,
    }).eq('id', user.id);
    await loadProfile(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{
      session, user, profile, loading,
      signUp, signIn, signInWithGoogle,
      signOut, linkYouTubeWithGoogle, unlinkYouTube, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
