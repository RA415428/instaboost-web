import React, { useState, useEffect } from 'react';
import { ExternalLink, X, Sparkles, Gift, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminConfig, UserWallet } from '../types';

interface SideSlidingAdProps {
  smartlinkUrl?: string;
  adminConfig?: AdminConfig;
  wallet?: UserWallet;
  onOpenAdModal?: () => void;
}

export const SideSlidingAd: React.FC<SideSlidingAdProps> = ({
  smartlinkUrl = 'https://doubtfulimpatient.com/bhetpw4me?key=b10856b9df41e998764e3e76a118f915',
  adminConfig,
  wallet,
  onOpenAdModal
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    // Inject Adsterra Social Bar / Side Ad script
    const scriptId = 'adsterra-sidebar-ad-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = 'https://doubtfulimpatient.com/58/f7/b6/58f7b63d98667552028c32fefad91d54.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isVisible) return null;

  const handleAdClick = () => {
    if (smartlinkUrl) {
      try {
        window.open(smartlinkUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        // popup fallback
      }
    }
    if (onOpenAdModal) {
      onOpenAdModal();
    }
  };

  return (
    <div className="fixed bottom-20 right-2 z-40 max-w-[270px] transition-all duration-300 pointer-events-auto">
      {isCollapsed ? (
        /* Collapsed Floating Trigger Badge on the side */
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-2.5 rounded-l-2xl shadow-2xl flex items-center gap-1.5 border-l-2 border-y border-pink-400/50 active:opacity-80 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4 text-amber-300" />
          <Gift className="w-4 h-4 text-amber-300" />
          <span className="text-[10px] font-black uppercase tracking-wider">Ad Offer</span>
        </button>
      ) : (
        /* Expanded Side Sliding Banner Card */
        <div className="bg-slate-900/95 border border-pink-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md relative overflow-hidden animate-in slide-in-from-right duration-300">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-pink-500/20 rounded-full blur-xl pointer-events-none" />

          {/* Close & Collapse Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" /> Sponsored Ad
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCollapsed(true)}
                title="Minimize side ad"
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                title="Close side ad"
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Ad Body Content */}
          <div onClick={handleAdClick} className="cursor-pointer group">
            <div className="flex items-start gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-400 p-0.5 shrink-0 shadow-md">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Gift className="w-5 h-5 text-amber-300 animate-bounce" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-white group-hover:text-pink-300 transition-colors truncate">
                  Free Bonus Coins!
                </h4>
                <p className="text-[10px] text-slate-300 leading-tight mt-0.5 line-clamp-2">
                  Tap to view sponsor offer & claim extra reward coins instantly.
                </p>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="mt-2.5 w-full bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 group-hover:from-pink-500 group-hover:to-purple-500 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all">
              <span>View Ad & Get Coins</span>
              <ExternalLink className="w-3 h-3 text-amber-200" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
