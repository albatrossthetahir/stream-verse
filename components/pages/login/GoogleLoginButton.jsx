"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../src/context/AuthContext';

const GoogleLoginButton = () => {
  const { loginWithGoogle } = useAuth();
  const [scriptLoaded, setScriptLoaded] = useState(false);
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
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isClientIdConfigured]);

  const handleGoogleLogin = () => {
    if (!isClientIdConfigured) {
      // Fallback for development if no Client ID is provided - simple prompt
      const mockEmail = prompt(
        "Google Sign-In is running in Mock Mode. Enter a mock Google email to test the sign-in flow:",
        "user@gmail.com"
      );
      if (mockEmail) {
        const mockName = mockEmail.split('@')[0];
        setLoading(true);
        loginWithGoogle(mockEmail, mockName)
          .catch(() => setError('Mock Google login failed.'))
          .finally(() => setLoading(false));
      }
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
      setError('An unexpected error occurred. Please configure the Client ID.');
      setLoading(false);
    }
  };

  return (
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
  );
};

export default GoogleLoginButton;
