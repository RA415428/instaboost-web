import React, { useEffect } from 'react';
import { ExternalLink, Sparkles, Gift, Lock, Coins } from 'lucide-react';
import { AdminConfig, UserWallet } from '../types';
import { saveAdSession } from '../utils/adSessionManager';
import { openExternalAdLink } from '../utils/openAdLink';

interface SocialBarAdProps {
  smartlinkUrl?: string;
  customText?: string;
  onOpenAdModal?: () => void;
  onRewardClaim?: (coins: number, isVideoAd?: boolean) => void;
  wallet?: UserWallet;
  adminConfig?: AdminConfig;
}

export const SocialBarAd: React.FC<SocialBarAdProps> = ({
  smartlinkUrl,
  customText = 'Special Offer: Free Bonus Coins & Instant Boost!',
  onOpenAdModal,
  onRewardClaim,
  wallet,
  adminConfig
}) => {
  const rawSmartlink = smartlinkUrl || adminConfig?.ads?.directSmartlinkUrl;
  const activeSmartlink = rawSmartlink && !rawSmartlink.includes('omg10') ? rawSmartlink : 'https://doubtfulimpatient.com/bhetpw4me?key=b10856b9df41e998764e3e76a118f915';
  const rewardCoins = 5; // Hardcoded to exactly 5 coins as explicitly requested by user

  const memberId = wallet?.memberId || 'guest';
  const todayStr = new Date().toISOString().split('T')[0];
  const socialBarStorageKey = `roxyefollow_socialbar_claim_${memberId}`;

  const [hasClaimedSocialBarToday, setHasClaimedSocialBarToday] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem(socialBarStorageKey) === todayStr;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      setHasClaimedSocialBarToday(localStorage.getItem(socialBarStorageKey) === todayStr);
    } catch {
      // ignore
    }
  }, [memberId, todayStr]);

  const isLimitReached = hasClaimedSocialBarToday;

  const handleClick = () => {
    if (hasClaimedSocialBarToday) {
      alert(`⚠️ Social Bar Ad Reward Din Me Sirf 1 Baar Le Sakte Hain!\n\nAapne aaj ka Social Bar reward (+${rewardCoins} Coins) claim kar liya hai. Raat 12:00 baje (midnight) par agla reward unlock hoga.`);
      return;
    }

    try {
      localStorage.setItem(socialBarStorageKey, todayStr);
      setHasClaimedSocialBarToday(true);
    } catch {
      // ignore
    }

    // Trigger Popunder Ad link immediately on click
    const popunderLink = adminConfig?.ads?.directSmartlinkUrl || 'https://doubtfulimpatient.com/bhetpw4me?key=b10856b9df41e998764e3e76a118f915';
    console.log('Opening Popunder Ad on clicking Social Bar click & earn button');
    openExternalAdLink(popunderLink);

    // Award exactly 5 bonus coins
    if (onRewardClaim) {
      onRewardClaim(rewardCoins, false);
    } else if (onOpenAdModal) {
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
                {hasClaimedSocialBarToday ? (
                  `🚫 1/1 Claimed Today`
                ) : (
                  <>
                    <Sparkles className="w-2.5 h-2.5" /> +{rewardCoins} Coins
                  </>
                )}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-100 truncate mt-0.5 group-hover:text-pink-300 transition-colors">
              {hasClaimedSocialBarToday
                ? `Daily Social Bar reward claimed (1/1). Resets at midnight!`
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
          className={`shrink-0 px-3 py-1.5 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
            isLimitReached
              ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:opacity-90 text-slate-950 shadow-amber-500/20 active:scale-95 animate-pulse'
          }`}
        >
          {isLimitReached ? (
            <span>Locked</span>
          ) : (
            <>
              <Coins className="w-3.5 h-3.5 text-slate-950 fill-current" />
              <span>Click & Earn +{rewardCoins}</span>
              <ExternalLink className="w-3 h-3" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

