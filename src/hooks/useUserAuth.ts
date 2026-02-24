import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useUserAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Check for an active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    // Listen for auth state changes (login / logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const markOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('onboarding_completed');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, loading, markOnboardingComplete, logout };
}
