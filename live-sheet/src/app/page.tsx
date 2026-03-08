'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { signInWithGoogle, signInAnonymously } from '@/services/firebase/auth';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleAnonymousSignIn = useCallback(async () => {
    if (!displayName.trim()) {
      setError('Please enter a display name');
      return;
    }
    setIsSigningIn(true);
    setError('');
    try {
      await signInAnonymously(displayName.trim());
      router.push('/dashboard');
    } catch {
      setError('Failed to sign in. Please try again.');
      setIsSigningIn(false);
    }
  }, [displayName, router]);

  const handleGoogleSignIn = useCallback(async () => {
    setIsSigningIn(true);
    setError('');
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch {
      setError('Google sign-in failed. Please try again.');
      setIsSigningIn(false);
    }
  }, [router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleAnonymousSignIn();
    },
    [handleAnonymousSignIn]
  );

  if (loading) {
    return (
      <div className="landing-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="landing-container">
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
        <ThemeToggle />
      </div>

      <div className="glass-card landing-card">
        <div className="landing-logo">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <rect x="4" y="4" width="44" height="44" rx="10" fill="var(--color-primary-10)" stroke="var(--color-primary)" strokeWidth="2" />
            <line x1="4" y1="18" x2="48" y2="18" stroke="var(--color-primary-40)" strokeWidth="1.5" />
            <line x1="4" y1="30" x2="48" y2="30" stroke="var(--color-primary-20)" strokeWidth="1" />
            <line x1="20" y1="4" x2="20" y2="48" stroke="var(--color-primary-40)" strokeWidth="1.5" />
            <line x1="34" y1="4" x2="34" y2="48" stroke="var(--color-primary-20)" strokeWidth="1" />
          </svg>
        </div>

        <h1 className="landing-title">LiveSheet</h1>
        <p className="landing-subtitle">Real-time collaborative spreadsheets</p>

        <div className="landing-form">
          <input
            type="text"
            placeholder="Enter your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="landing-input"
            disabled={isSigningIn}
            maxLength={30}
            id="display-name-input"
          />

          <button
            onClick={handleAnonymousSignIn}
            disabled={isSigningIn || !displayName.trim()}
            className="btn btn-primary landing-btn"
            id="continue-btn"
          >
            {isSigningIn ? 'Signing in...' : 'Continue'}
          </button>

          <div className="landing-divider">
            <span>or</span>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="btn btn-google landing-btn"
            id="google-signin-btn"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9.003 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>

          {error && <p className="landing-error">{error}</p>}
        </div>

        <p className="landing-footer">
          Collaborate on spreadsheets in real-time with formulas, formatting, and presence.
        </p>
      </div>
    </div>
  );
}
