import React from 'react';
import { Coins, Play, CreditCard, Sparkles, Check, Zap, Gift, ShieldCheck, AlertTriangle, Lock } from 'lucide-react';
import { AdminConfig, CoinPackage, UserWallet } from '../types';
import { coinPackages, subscriptionPackage } from '../data/appData';
import { AdBanner } from '../components/AdBanner';
import { NativeAd } from '../components/NativeAd';
import { SocialBarAd } from '../components/SocialBarAd';
import { formatCoins } from '../utils/format';

interface CoinsScreenProps {
  wallet: UserWallet;
  adminConfig?: AdminConfig;
  onOpenAdModal: () => void;
  onSelectPaymentPackage: (pkg: CoinPackage) => void;
}

export const CoinsScreen: React.FC<CoinsScreenProps> = ({
  wallet,
  adminConfig,
  onOpenAdModal,
  onSelectPaymentPackage
}) => {
  const maxDailyAds = adminConfig?.ads?.maxDailyAdsPerUser ?? wallet.maxDailyAds ?? 10;
  const rewardCoins = adminConfig?.ads?.coinsPerRewardAd ?? 10;
  const isLimitReached = wallet.dailyAdsWatched >= maxDailyAds;

  return (
    <div className="space-y-4 pb-20 pt-2 px-4 max-w-md mx-auto">
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-5 text-slate-950 shadow-2xl shadow-amber-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-wider opacity-80 flex items-center gap-1">
            <Coins className="w-4 h-4" /> Current Coin Balance
          </span>
          <span className="bg-slate-950/20 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full font-mono">
            Member #{wallet.memberId}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-4xl font-black font-mono tracking-tight">{formatCoins(wallet.coins)}</span>
          <span className="text-sm font-extrabold uppercase">Coins</span>
        </div>

        <div className="bg-slate-950/10 backdrop-blur-sm rounded-xl p-2.5 flex items-center justify-between text-xs font-medium border border-slate-950/10">
          <span>Daily Video Ads Watched:</span>
          <span className="font-mono font-bold">
            {wallet.dailyAdsWatched} / {maxDailyAds}
          </span>
        </div>
      </div>

      {/* Social Bar Ad - Right below Current Coin Balance Card */}
      <SocialBarAd
        customText="Claim Free Bonus Coins - Limited Time Store Bonus!"
        wallet={wallet}
        adminConfig={adminConfig}
        onOpenAdModal={onOpenAdModal}
      />

      {/* Free Coins - Watch Video Ad Banner */}
      <div className={`bg-slate-900 border rounded-2xl p-4 shadow-xl relative overflow-hidden transition-all ${
        isLimitReached ? 'border-red-500/30' : 'border-amber-500/30'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
              isLimitReached
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {isLimitReached ? <Lock className="w-3 h-3" /> : <Gift className="w-3 h-3" />}
              {isLimitReached ? 'DAILY LIMIT FULL' : 'FREE REWARD'}
            </div>
            <h3 className="text-sm font-extrabold text-white">Watch Rewarded Video Ad</h3>
            <p className="text-xs text-slate-400">
              Earn <strong className="text-amber-400 font-mono">+{rewardCoins} Coins</strong> per video view. No money required!
            </p>
          </div>

          <button
            onClick={onOpenAdModal}
            disabled={isLimitReached}
            id="watch-rewarded-ad-store-btn"
            className={`shrink-0 font-black px-4 py-3 rounded-xl shadow-lg flex items-center gap-1.5 transition-colors text-xs active:opacity-80 ${
              isLimitReached
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
            }`}
          >
            {isLimitReached ? (
              <>
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Limit Full</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Watch Ad</span>
              </>
            )}
          </button>
        </div>

        {/* Warning message if daily limit reached */}
        {isLimitReached && (
          <div className="mt-3 p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-red-300">
                ⚠️ Daily Limit Reached ({wallet.dailyAdsWatched}/{maxDailyAds})
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Aapki aaj ki ad dekhne ki limit ({maxDailyAds}/{maxDailyAds}) poori ho chuki hai. Raat 12:00 baje limit automatically reset ho jayegi ya admin reset ka wait karein!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sponsored Native Ad */}
      <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-2.5 shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex items-center justify-between w-full px-1 mb-1">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Native Sponsored Ad
          </span>
          <span className="text-[9px] font-bold text-slate-500">Adsterra Native</span>
        </div>
        <NativeAd
          containerId="container-67905e0523b612a6391ce253e028375f"
          scriptSrc="https://doubtfulimpatient.com/67905e0523b612a6391ce253e028375f/invoke.js"
          className="my-0"
        />
      </div>

      {/* Sponsored 320x50 Banner Ad */}
      <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-2.5 shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex items-center justify-between w-full px-1 mb-1">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Sponsored Offer
          </span>
          <span className="text-[9px] font-bold text-slate-500">Adsterra Banner</span>
        </div>
        <AdBanner
          adKey="1fa862cdd8ff0403a4f4166d381d9698"
          scriptSrc="https://doubtfulimpatient.com/1fa862cdd8ff0403a4f4166d381d9698/invoke.js"
          width={320}
          height={50}
          className="my-0"
        />
      </div>

      {/* Buy Coin Packages */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-pink-400" />
            Instant Coin Top-Up Packages
          </h3>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> UPI / Cards Supported
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {coinPackages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => onSelectPaymentPackage(pkg)}
              className="bg-slate-900 border border-slate-800 hover:border-pink-500/60 rounded-2xl p-3.5 flex flex-col justify-between space-y-3 cursor-pointer transition-colors active:opacity-80 shadow-md relative group"
            >
              {pkg.badge && (
                <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                  {pkg.badge}
                </span>
              )}

              <div>
                <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                  <Coins className="w-4 h-4" />
                  <span className="font-mono text-base font-black text-white">{pkg.coins}</span>
                  <span className="text-[10px] text-slate-400 font-bold">Coins</span>
                </div>
                <p className="text-[10px] text-slate-400">Instant credit after payment</p>
              </div>

              <button
                type="button"
                className="w-full bg-slate-800 group-hover:bg-pink-500 group-hover:text-white text-slate-200 font-black py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
              >
                <span>{pkg.priceINR}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Card */}
      <div
        onClick={() => onSelectPaymentPackage(subscriptionPackage)}
        className="bg-gradient-to-r from-purple-900/60 via-slate-900 to-slate-900 border border-purple-500/40 rounded-2xl p-4 shadow-xl flex items-center justify-between cursor-pointer hover:border-purple-400 transition-colors active:opacity-80"
      >
        <div className="space-y-1">
          <span className="bg-purple-500/20 text-purple-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-purple-500/30">
            AUTO-REFILL MONTHLY
          </span>
          <h4 className="text-sm font-extrabold text-white">100 Coins / Month Plan</h4>
          <p className="text-xs text-slate-400">Cancel anytime. Priority support included.</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-black text-purple-300">₹30.00</p>
          <p className="text-[10px] text-slate-500 font-medium">/ month</p>
        </div>
      </div>
    </div>
  );
};
