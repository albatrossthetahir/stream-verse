"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../src/context/AuthContext';

const GoogleLoginButton = () => {
  const { loginWithGoogle } = useAuth();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isClientIdConfigured = clientId && clientId !== 'your_google_client_id_here';

  useEffect(() => {
    // Only load the GSI script if the Client ID is configured
    if (!isClientIdConfigured) {
      return;
    }

    if (window.google) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Google Sign-In SDK script');
    };
    document.body.appendChild(script);

    return () => {
      // Clean up if component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isClientIdConfigured]);

  const handleGoogleLogin = () => {
    if (!isClientIdConfigured) {
      // Open Mock Modal in development if no Client ID is provided
      setShowMockModal(true);
      return;
    }

    if (!scriptLoaded || !window.google) {
      setError('Google Sign-In is loading, please try again in a moment.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setError(`Google login failed: ${tokenResponse.error_description || tokenResponse.error}`);
            setLoading(false);
            return;
          }

          if (tokenResponse.access_token) {
            try {
              // Fetch user profile information using the access token
              const profileRes = await fetch(
                `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`
              );
              const profile = await profileRes.json();

              if (profile && profile.email) {
                await loginWithGoogle(profile.email, profile.name || profile.given_name || 'Google User');
              } else {
                setError('Could not retrieve email from Google profile.');
              }
            } catch (err) {
              console.error('Error fetching Google profile:', err);
              setError('Failed to fetch Google profile info.');
            }
          }
          setLoading(false);
        },
        error_callback: (err) => {
          setError('An error occurred during Google Sign-in initialization.');
          setLoading(false);
        }
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      console.error('Error initiating Google Login:', err);
      setError('An unexpected error occurred. Please try mock login.');
      setLoading(false);
    }
  };

  const handleMockSelect = async (email, name) => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle(email, name);
      setShowMockModal(false);
    } catch (err) {
      setError('Mock login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail) {
      setError('Please enter a mock email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    const name = customName.trim() || customEmail.split('@')[0];
    await handleMockSelect(customEmail, name);
  };

  return (
    <>
      <div className="w-full">
        {error && (
          <p className="text-red-500 text-xs mt-1 mb-2 text-center font-medium">
            {error}
          </p>
        )}
        
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded text-base font-semibold border border-zinc-700 bg-transparent text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {loading ? 'Connecting Google...' : 'Continue with Google'}
        </button>
      </div>

      {/* Mock Account Chooser Modal */}
      {showMockModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 text-left">
          <div className="bg-[#141414] border border-zinc-800 rounded-lg max-w-md w-full p-6 sm:p-8 relative shadow-2xl animate-fade-in select-none">
            
            {/* Close button */}
            <button
              onClick={() => {
                setShowMockModal(false);
                setError('');
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="flex flex-col items-center mb-6 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[#e50914]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Google Sign-In (Demo Mode)</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                Select a mock Google account or enter custom credentials to test the login experience.
              </p>
            </div>

            {error && (
              <div className="bg-[#e50914]/20 border border-[#e50914]/50 text-red-200 text-xs py-2 px-3 rounded mb-4 text-center">
                {error}
              </div>
            )}

            {/* Quick Select Buttons */}
            <div className="space-y-2 mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Choose a demo account:</p>
              
              <button
                type="button"
                onClick={() => handleMockSelect('kalaiwalatahir@gmail.com', 'Tahir Kalaiwala')}
                className="w-full flex items-center justify-between p-3 rounded-md bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80 transition-all text-left group"
              >
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-[#e50914] transition-colors">Tahir Kalaiwala</div>
                  <div className="text-xs text-zinc-500">kalaiwalatahir@gmail.com</div>
                </div>
                <span className="text-xs bg-red-950 text-red-400 font-bold px-2 py-0.5 rounded border border-red-900/50">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleMockSelect('guest.viewer@gmail.com', 'Guest Viewer')}
                className="w-full flex items-center justify-between p-3 rounded-md bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80 transition-all text-left group"
              >
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">Guest Viewer</div>
                  <div className="text-xs text-zinc-500">guest.viewer@gmail.com</div>
                </div>
                <span className="text-xs bg-zinc-850 text-zinc-400 font-bold px-2 py-0.5 rounded border border-zinc-700/50">User</span>
              </button>

              <button
                type="button"
                onClick={() => handleMockSelect('streamverse.demo@gmail.com', 'Demo User')}
                className="w-full flex items-center justify-between p-3 rounded-md bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80 transition-all text-left group"
              >
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">Demo User</div>
                  <div className="text-xs text-zinc-500">streamverse.demo@gmail.com</div>
                </div>
                <span className="text-xs bg-zinc-850 text-zinc-400 font-bold px-2 py-0.5 rounded border border-zinc-700/50">User</span>
              </button>
            </div>

            {/* Custom Input Form */}
            <form onSubmit={handleMockSubmit} className="border-t border-zinc-850 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Or enter any details:</p>
              <div className="space-y-3 mb-4 text-left">
                <input
                  type="text"
                  placeholder="Full Name (e.g. John Doe)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#e50914] transition-colors"
                />
                <input
                  type="email"
                  placeholder="Email Address (e.g. user@gmail.com)"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#e50914] transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#e50914] hover:bg-red-700 active:bg-red-800 text-white text-sm font-bold rounded transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In with Mock Account'}
              </button>
            </form>

            {/* Developer Notice */}
            <div className="mt-5 p-3 rounded bg-zinc-950 border border-zinc-900 text-left">
              <div className="flex gap-2 items-start">
                <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="text-xs font-bold text-zinc-300">How to configure real Google Login:</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">
                    Add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here</code> in your <code>.env.local</code> file in the project root directory, then restart the server.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default GoogleLoginButton;
