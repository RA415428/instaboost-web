import React from 'react';
import { Coins, Sun, Moon, Sparkles, WifiOff, Shield } from 'lucide-react';
import { UserWallet } from '../types';
import { formatCoins } from '../utils/format';

interface TopBarProps {
  wallet: UserWallet;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenCoins: () => void;
  onOpenAdmin: () => void;
  isOnline: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  wallet,
  isDark,
  onToggleTheme,
  onOpenCoins,
  onOpenAdmin,
  isOnline
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg transition-colors">
      {!isOnline && (
        <div className="mb-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 animate-pulse">
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>No Internet Connection. Offline Mode active.</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-0.5 shadow-md shadow-pink-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-extrabold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-none">
              Roxyefollow
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              ID: <span className="font-mono text-amber-400 font-bold">#{wallet.memberId}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Wallet Balance Badge */}
          <button
            onClick={onOpenCoins}
            id="wallet-badge-btn"
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 hover:border-amber-400 px-3 py-1.5 rounded-full transition-colors active:opacity-80 shadow-sm shadow-amber-500/10"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-amber-300 font-mono">
              {formatCoins(wallet.coins)} <span className="text-[10px] font-normal text-amber-400/80">Coins</span>
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            id="theme-toggle-btn"
            aria-label="Toggle Theme"
            className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors active:opacity-80"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

