import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const INVALID_API_KEY_PATTERN = /invalid api key|apikey|api key/i;

function getAuthEnvValidation() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

  if (!url || !key) {
    return {
      valid: false,
      message: 'Backend configuration missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  try {
    new URL(url);
  } catch {
    return {
      valid: false,
      message: 'Backend configuration invalid. VITE_SUPABASE_URL is malformed.',
    };
  }

  return { valid: true, message: '' };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const hasShownInitToastRef = useRef(false);

  const reportInitError = (message: string, error?: unknown) => {
    console.error('[Auth initialization error]', message, error);
    if (!hasShownInitToastRef.current) {
      toast.error(message);
      hasShownInitToastRef.current = true;
    }
  };

  useEffect(() => {
    const envValidation = getAuthEnvValidation();
    if (!envValidation.valid) {
      reportInitError(envValidation.message);
      setLoading(false);
      return;
    }

    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!isMounted) return;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);
      });

      unsubscribe = () => subscription.unsubscribe();
    } catch (error) {
      reportInitError('Failed to initialize authentication listener.', error);
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data: { session: nextSession }, error }) => {
        if (!isMounted) return;

        if (error) {
          const message = error.message || 'Unknown authentication error';
          if (INVALID_API_KEY_PATTERN.test(message)) {
            reportInitError('Invalid backend API key detected. Update your backend keys.', error);
          } else {
            reportInitError('Could not connect to authentication backend.', error);
          }
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        if (!isMounted) return;
        reportInitError('Unexpected authentication bootstrap failure.', error);
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error && INVALID_API_KEY_PATTERN.test(error.message)) {
      reportInitError('Invalid backend API key detected. Update your backend keys.', error);
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error && INVALID_API_KEY_PATTERN.test(error.message)) {
      reportInitError('Invalid backend API key detected. Update your backend keys.', error);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
