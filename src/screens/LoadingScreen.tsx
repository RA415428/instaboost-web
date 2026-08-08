import React from 'react';
import { WifiOff, RefreshCw, Loader2, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface LoadingScreenProps {
  isOnline: boolean;
  onRetry: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isOnline, onRetry }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 w-full max-w-xs shadow-2xl space-y-5 relative backdrop-blur-md">
        {/* App Logo Header */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-0.5 shadow-xl shadow-pink-500/20 animate-pulse">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-amber-400" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-1 rounded-lg shadow-md">
              <Zap className="w-3 h-3 fill-current" />
            </div>
          </div>

          <h1 className="text-lg font-black bg-gradient-to-r from-white via-slate-100 to-amber-300 bg-clip-text text-transparent">
            Roxyefollow
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
            SMM Growth Engine
          </p>
        </div>

        <div className="h-px bg-slate-800/80 w-full" />

        {isOnline ? (
          <div className="space-y-3 pt-1">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mx-auto text-pink-400 shadow-inner">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white mb-1">Connecting to Server...</h2>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Syncing coins wallet and active order statuses...
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Secure Encrypted Cloud Connection</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
              <WifiOff className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white mb-1">Internet Connection Lost</h2>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Roxyefollow requires an active internet connection to place orders and sync coin balances.
              </p>
            </div>
            <button
              onClick={onRetry}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors active:opacity-80 shadow-lg shadow-amber-500/20 mt-2"
            >
              <RefreshCw className="w-4 h-4" />
              Check Connection Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
