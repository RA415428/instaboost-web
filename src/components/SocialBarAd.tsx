import React, { useEffect } from 'react';
import { ExternalLink, Sparkles, Gift, Lock } from 'lucide-react';
import { AdminConfig, UserWallet } from '../types';

interface SocialBarAdProps {
  smartlinkUrl?: string;
  customText?: string;
  onOpenAdModal?: () => void;
  wallet?: UserWallet;
  adminConfig?: AdminConfig;
}

export const SocialBarAd: React.FC<SocialBarAdProps> = ({
  smartlinkUrl = 'https://doubtfulimpatient.com/bhetpw4me?key=b10856b9df41e998764e3e76a118f915',
  customText = 'Special Offer: Free Bonus Coins & Instant Boost!',
  onOpenAdModal,
  wallet,
  adminConfig
}) => {
  useEffect(() => {
    // Inject Adsterra Social Bar script into DOM
    const scriptId = 'adsterra-socialbar-inline-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'type/javascript';
      script.src = 'https://doubtfulimpatient.com/58/f7/b6/58f7b63d98667552028c32fefad91d54.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const maxDailyAds = adminConfig?.ads?.maxDailyAdsPerUser ?? wallet?.maxDailyAds ?? 10;
  const rewardCoins = adminConfig?.ads?.coinsPerRewardAd ?? 10;
  const dailyAdsWatched = wallet?.dailyAdsWatched ?? 0;
  const isLimitReached = dailyAdsWatched >= maxDailyAds;

  const handleClick = () => {
    if (isLimitReached) {
      alert(`⚠️ Daily Ad Limit Reached (${dailyAdsWatched}/${maxDailyAds})!\n\nAapki aaj ki ad limit poori ho chuki hai. Raat 12:00 baje limit automatically reset ho jayegi ya admin reset ka wait karein.`);
      return;
    }

    if (smartlinkUrl) {
      try {
        window.open(smartlinkUrl, '_blank', 'noopener,noreferrer');
      } catch {
        // fallback
      }
    }

    if (onOpenAdModal) {
      onOpenAdModal();
    }
  };

  return (
    <div className="my-2.5 w-full">
      <div
        onClick={handleClick}
        className={`w-full bg-gradient-to-r from-purple-950 via-slate-900 to-pink-950 border rounded-2xl p-3 shadow-lg flex items-center justify-between gap-2.5 transition-all duration-200 group cursor-pointer ${
          isLimitReached
            ? 'border-red-500/30 opacity-80'
            : 'border-pink-500/40 hover:border-pink-500/80 shadow-pink-500/10 active:opacity-80'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <div
              className={`w-9 h-9 rounded-xl p-0.5 flex items-center justify-center ${
                isLimitReached
                  ? 'bg-slate-700'
                  : 'bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-400'
              }`}
            >
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                {isLimitReached ? (
                  <Lock className="w-4 h-4 text-red-400" />
                ) : (
                  <Gift className="w-4 h-4 text-amber-400 animate-bounce" />
                )}
              </div>
            </div>
            {!isLimitReached && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                  isLimitReached
                    ? 'text-red-400 bg-red-500/20 border-red-500/30'
                    : 'text-pink-400 bg-pink-500/20 border-pink-500/30'
                }`}
              >
                SOCIAL BAR REWARD
              </span>
              <span
                className={`text-[10px] font-extrabold flex items-center gap-0.5 ${
                  isLimitReached ? 'text-red-300' : 'text-amber-300'
                }`}
              >
                {isLimitReached ? (
                  `🚫 Limit Full (${dailyAdsWatched}/${maxDailyAds})`
                ) : (
                  <>
                    <Sparkles className="w-2.5 h-2.5" /> +{rewardCoins} Coins
                  </>
                )}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-100 truncate mt-0.5 group-hover:text-pink-300 transition-colors">
              {isLimitReached
                ? `Daily limit (${dailyAdsWatched}/${maxDailyAds}) complete. Resets at midnight!`
                : customText}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          disabled={isLimitReached}
          className={`shrink-0 px-3 py-1.5 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1 transition-all ${
            isLimitReached
              ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white group-hover:shadow-pink-500/30'
          }`}
        >
          {isLimitReached ? (
            <span>Locked</span>
          ) : (
            <>
              <span>Claim</span>
              <ExternalLink className="w-3 h-3" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

