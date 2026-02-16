import { useState, useEffect } from 'react';

export function useUserAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding (temporary solution)
    const hasCompletedOnboarding =
      localStorage.getItem('onboarding_completed') === 'true';
    setIsAuthenticated(hasCompletedOnboarding);
    setLoading(false);
  }, []);

  const markOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('onboarding_completed');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, loading, markOnboardingComplete, logout };
}
