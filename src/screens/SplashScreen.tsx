import React from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface SplashScreenProps {
  onStart?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div 
      onClick={onStart}
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-between p-6 text-center select-none cursor-pointer"
    >
      <div className="flex-1 flex flex-col items-center justify-center animate-pulse-glow">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-1 shadow-2xl shadow-pink-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-amber-400" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-1.5 rounded-xl shadow-lg">
            <Zap className="w-4 h-4 fill-current" />
          </div>
        </div>

        <h1 className="text-2xl font-black bg-gradient-to-r from-white via-slate-100 to-amber-300 bg-clip-text text-transparent mb-2">
          Roxyefollow
        </h1>
        <p className="text-xs text-slate-400 font-medium max-w-xs mb-6">
          Instant Instagram Followers, Likes, Reels Views & Growth Boost
        </p>

        <button 
          onClick={onStart}
          className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-sm rounded-full shadow-lg shadow-pink-500/20 active:opacity-80 transition-colors"
        >
          Open App Now →
        </button>
      </div>

      <div className="space-y-3 w-full max-w-xs">
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Safe & Passwordless Service</span>
        </div>
        <div className="h-1.5 w-32 bg-slate-800 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-pink-500 to-amber-400 rounded-full animate-pulse w-full" />
        </div>
        <p className="text-[10px] text-slate-600 font-mono">v3.6.0 | Secure Cloud Network</p>
      </div>
    </div>
  );
};
