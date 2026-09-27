'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCodeForToken, getDefaultRedirectUri } from '@/lib/spotify';
import { Disc3, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('SYNCHRONIZING WITH SPOTIFY...');

  useEffect(() => {
    const code = searchParams.get('code');
    const authError = searchParams.get('error');

    if (authError) {
      setError(`Spotify Authentication Error: ${authError}`);
      return;
    }

    if (!code) {
      setError('No authorization code provided in callback.');
      return;
    }

    const codeVerifier = window.sessionStorage.getItem('spotify_code_verifier');
    const clientId = window.sessionStorage.getItem('spotify_client_id') || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = window.sessionStorage.getItem('spotify_redirect_uri') || getDefaultRedirectUri();

    if (!codeVerifier || !clientId) {
      setError('Missing PKCE code verifier or client ID. Please initiate authentication again.');
      return;
    }

    setStatus('EXCHANGING PKCE AUTHORIZATION CODE...');

    exchangeCodeForToken(code, clientId, codeVerifier, redirectUri)
      .then(() => {
        setStatus('AUTHENTICATION GRANTED // LAUNCHING ROULETTE...');
        setTimeout(() => {
          router.replace('/?auth=success');
        }, 600);
      })
      .catch((err) => {
        console.error('Token exchange failed:', err);
        setError(err.message || 'Failed to exchange token with Spotify.');
      });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08)_0%,transparent_70%)]" />

      {/* Glassmorphic Chrome Card */}
      <div className="relative max-w-md w-full bg-[#121214]/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] text-center space-y-6">
        {error ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-display font-black uppercase tracking-wider text-white">
                AUTHENTICATION HALTED
              </h2>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-xs mx-auto">
                {error}
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO LANDING</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-sky-400/30 animate-ping opacity-30" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-zinc-800 via-zinc-700 to-zinc-900 border border-white/30 flex items-center justify-center shadow-lg">
                <Disc3 className="w-8 h-8 text-sky-400 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-display font-black uppercase tracking-widest text-white">
                CHROME AUTH PROTOCOL
              </h3>
              <p className="text-xs font-mono text-sky-400 tracking-wider animate-pulse">
                {status}
              </p>
            </div>

            <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden border border-white/10">
              <div className="h-full bg-gradient-to-r from-sky-500 via-white to-sky-400 animate-pulse w-3/4 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackHandler />
    </Suspense>
  );
}
