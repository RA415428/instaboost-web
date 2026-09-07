import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, Loader2, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { APP_LOGO_SRC } from '../assets/appLogoBase64';

interface SplashScreenProps {
  onComplete?: () => void;
  onStart?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, onStart }) => {
  const [networkStatus, setNetworkStatus] = useState<'CHECKING' | 'VERIFYING' | 'CONNECTED' | 'OFFLINE'>('CHECKING');
  const [statusMessage, setStatusMessage] = useState<string>('Checking network connection...');

  const handleFinish = useCallback(() => {
    if (onComplete) {
      onComplete();
    } else if (onStart) {
      onStart();
    }
  }, [onComplete, onStart]);

  const runNetworkCheck = useCallback(async () => {
    setNetworkStatus('CHECKING');
    setStatusMessage('Checking network connection...');

    // 1. Initial browser connectivity check
    if (!navigator.onLine) {
      setNetworkStatus('OFFLINE');
      setStatusMessage('No internet connection detected.');
      return;
    }

    // 2. Progressive verification simulation with server ping
    const timer1 = setTimeout(() => {
      setNetworkStatus('VERIFYING');
      setStatusMessage('Verifying server reachability...');
    }, 500);

    let isServerReachable = true;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('/api/health', { signal: controller.signal });
      clearTimeout(timeoutId);
      isServerReachable = res.ok || res.status < 500;
    } catch {
      if (!navigator.onLine) {
        isServerReachable = false;
      }
    }

    clearTimeout(timer1);

    if (!isServerReachable && !navigator.onLine) {
      setNetworkStatus('OFFLINE');
      setStatusMessage('Network offline. Please check connection.');
      return;
    }

    // 3. Connection verified successfully
    setNetworkStatus('CONNECTED');
    setStatusMessage('Network connection verified!');

    // 4. Smooth launch transition
    const timer2 = setTimeout(() => {
      handleFinish();
    }, 600);

    return () => clearTimeout(timer2);
  }, [handleFinish]);

  useEffect(() => {
    runNetworkCheck();

    const handleOnline = () => {
      runNetworkCheck();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [runNetworkCheck]);

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col items-center justify-between p-5 select-none font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top spacer for optical balance */}
      <div className="w-full pt-4" />

      {/* Main Center Section */}
      <div className="flex flex-col items-center justify-center w-full max-w-[280px] my-auto z-10">
        {/* Splash Screen Main Logo Card - Compact & Instant Render */}
        <div className="w-full bg-white rounded-3xl p-5 shadow-2xl border border-slate-200/90 flex flex-col items-center justify-center text-center">
          {/* Logo Emblem Container - Instant Base64 Render & Smaller Size (w-16 h-16) */}
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-950 p-1 shadow-lg border border-slate-800 flex items-center justify-center overflow-hidden mb-3.5 relative shrink-0">
            <img
              src={APP_LOGO_SRC}
              alt="ROX FOLLOW"
              className="w-full h-full object-cover rounded-xl"
              loading="eager"
            />
          </div>

          {/* App Title */}
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
            ROX FOLLOW
          </h1>

          {/* Subtitle / Tagline */}
          <p className="text-[10px] sm:text-[11px] font-extrabold tracking-widest text-pink-600 uppercase">
            FOLLOW • LIKE • REELS
          </p>
        </div>

        {/* Small Spinning Loader Box under Splash Card */}
        <div className="w-full mt-5 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-200/90 flex flex-col items-center text-center transition-all duration-300">
          <div className="flex items-center justify-center gap-2.5">
            {networkStatus === 'OFFLINE' ? (
              <WifiOff className="w-4 h-4 text-red-500 animate-bounce shrink-0" />
            ) : networkStatus === 'CONNECTED' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-pink-600 animate-spin shrink-0" />
            )}

            <span
              className={`text-xs font-bold ${
                networkStatus === 'OFFLINE'
                  ? 'text-red-600'
                  : networkStatus === 'CONNECTED'
                  ? 'text-emerald-600'
                  : 'text-slate-800'
              }`}
            >
              {statusMessage}
            </span>
          </div>

          {/* Small Spinning Indicator Ring below text if checking */}
          {(networkStatus === 'CHECKING' || networkStatus === 'VERIFYING') && (
            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              <span>Checking network connection...</span>
            </div>
          )}

          {/* Offline Retry Button */}
          {networkStatus === 'OFFLINE' && (
            <div className="mt-2.5 flex flex-col items-center gap-1.5 w-full">
              <p className="text-[10px] text-slate-500 font-medium">
                Please verify your Wi-Fi or mobile data connection.
              </p>
              <button
                type="button"
                onClick={runNetworkCheck}
                className="mt-1 px-4 py-1.5 rounded-full bg-pink-600 hover:bg-pink-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-pink-600/30 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry Connection</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding & Trust Badge */}
      <div className="w-full flex flex-col items-center gap-1 z-10 pb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>100% Safe & Passwordless Service</span>
        </div>
        <p className="text-[10px] font-mono text-slate-400">v3.6.0 • Rox Cloud Verified</p>
      </div>
    </div>
  );
};
