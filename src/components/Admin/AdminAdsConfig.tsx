import React, { useState } from 'react';
import { 
  Tv, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Play, 
  DollarSign,
  Smartphone,
  Info,
  RotateCcw
} from 'lucide-react';
import { AdminConfig, AdsSettings } from '../../types';

interface AdminAdsConfigProps {
  config: AdminConfig;
  onUpdateConfig: (newConfig: AdminConfig) => void;
  onTriggerTestAd: () => void;
  onResetDailyAdLimits?: () => void;
}

export const AdminAdsConfig: React.FC<AdminAdsConfigProps> = ({
  config,
  onUpdateConfig,
  onTriggerTestAd,
  onResetDailyAdLimits
}) => {
  const [adsState, setAdsState] = useState<AdsSettings>(config.ads);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [inputStrings, setInputStrings] = useState({
    autoAdIntervalMinutes: config.ads.autoAdIntervalMinutes?.toString() || '2',
    coinsPerRewardAd: config.ads.coinsPerRewardAd?.toString() || '10',
    maxDailyAdsPerUser: config.ads.maxDailyAdsPerUser?.toString() || '10',
  });

  const prevAdsRef = React.useRef<string>(JSON.stringify(config.ads));

  React.useEffect(() => {
    const currentKey = JSON.stringify(config.ads);
    if (currentKey !== prevAdsRef.current) {
      prevAdsRef.current = currentKey;
      setAdsState(config.ads);
      setInputStrings({
        autoAdIntervalMinutes: config.ads.autoAdIntervalMinutes?.toString() || '2',
        coinsPerRewardAd: config.ads.coinsPerRewardAd?.toString() || '10',
        maxDailyAdsPerUser: config.ads.maxDailyAdsPerUser?.toString() || '10',
      });
    }
  }, [config.ads]);

  const handleSave = () => {
    const finalAds: AdsSettings = {
      ...adsState,
      autoAdIntervalMinutes: parseInt(inputStrings.autoAdIntervalMinutes, 10) || 2,
      coinsPerRewardAd: parseInt(inputStrings.coinsPerRewardAd, 10) || 10,
      maxDailyAdsPerUser: parseInt(inputStrings.maxDailyAdsPerUser, 10) || 10,
    };

    const newConfig = {
      ...config,
      ads: finalAds,
      lastUpdated: Date.now()
    };

    prevAdsRef.current = JSON.stringify(finalAds);
    onUpdateConfig(newConfig);
    setAdsState(finalAds);
    setInputStrings({
      autoAdIntervalMinutes: finalAds.autoAdIntervalMinutes.toString(),
      coinsPerRewardAd: finalAds.coinsPerRewardAd.toString(),
      maxDailyAdsPerUser: finalAds.maxDailyAdsPerUser.toString(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-900/40 via-slate-900 to-purple-900/40 border border-pink-500/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-pink-500/20 text-pink-300 text-[10px] font-bold rounded uppercase tracking-wide">
              Ad Engine & Monetization
            </span>
            <span className="text-pink-400 text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" /> Google AdMob Connected
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">Ads Configuration & Active Usage Timer</h2>
          <p className="text-xs text-slate-300">
            Set real AdMob Unit IDs and configure active app usage timers (e.g., trigger ad after 2 mins of active app use).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerTestAd}
            className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Preview Test Ad Now
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-pink-500 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Save Ads Settings
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>AdMob & Timer settings saved successfully!</span>
        </div>
      )}

      {/* Master Switch & Provider Selection */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Tv className="w-4 h-4 text-pink-400" /> General Ad Controls & Provider
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Enable In-App Ads</p>
              <p className="text-[11px] text-slate-400">Master toggle for banner, interstitial, & active timer ads</p>
            </div>
            <button
              onClick={() => setAdsState({ ...adsState, enabled: !adsState.enabled })}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                adsState.enabled ? 'bg-pink-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  adsState.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <label className="block text-xs font-bold text-white mb-1.5">Ad Network Provider</label>
            <select
              value={adsState.provider}
              onChange={(e: any) => setAdsState({ ...adsState, provider: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-pink-500"
            >
              <option value="AdMob">Google AdMob (Recommended)</option>
              <option value="UnityAds">Unity Ads</option>
              <option value="AppLovin">AppLovin MAX</option>
              <option value="CustomBanners">Custom House Banners</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2-Minute Active App Usage Timer Settings */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Active Usage Auto-Ad Trigger (Interval Timer)
          </h3>
          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold rounded-lg">
            Default: 2 Minutes
          </span>
        </div>

        <p className="text-xs text-slate-400">
          When a user stays active inside the app for this number of minutes, an ad automatically plays to maximize revenue.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-white">Auto Ad Trigger Interval (Minutes)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={inputStrings.autoAdIntervalMinutes}
                onChange={(e) => setInputStrings({ ...inputStrings, autoAdIntervalMinutes: e.target.value })}
                placeholder="e.g. 2"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-amber-400 font-bold text-sm focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs text-slate-400 font-bold shrink-0">Mins</span>
            </div>
            <p className="text-[10px] text-slate-500">App will display ad modal after user is active for {inputStrings.autoAdIntervalMinutes || '0'} mins.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-white">Coins Reward per Video Ad</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={inputStrings.coinsPerRewardAd}
                onChange={(e) => setInputStrings({ ...inputStrings, coinsPerRewardAd: e.target.value })}
                placeholder="e.g. 10"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-bold text-sm focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-slate-400 font-bold shrink-0">Coins</span>
            </div>
            <p className="text-[10px] text-slate-500">Coins rewarded when user manually watches an ad video.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-white">Max Daily Ads per User</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={inputStrings.maxDailyAdsPerUser}
                onChange={(e) => setInputStrings({ ...inputStrings, maxDailyAdsPerUser: e.target.value })}
                placeholder="e.g. 10"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-purple-400 font-bold text-sm focus:outline-none focus:border-purple-500"
              />
              <span className="text-xs text-slate-400 font-bold shrink-0">Ads/day</span>
            </div>
            <p className="text-[10px] text-slate-500">Daily limit for rewarded ads per user.</p>

            <button
              type="button"
              onClick={() => {
                if (onResetDailyAdLimits) {
                  onResetDailyAdLimits();
                  setResetSuccess(true);
                  setTimeout(() => setResetSuccess(false), 3000);
                }
              }}
              className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs py-2 px-3 rounded-lg shadow flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Per Day Limit (All Users)</span>
            </button>
            {resetSuccess && (
              <p className="text-[10px] font-bold text-emerald-400 text-center animate-in fade-in">
                ✅ Daily ad limits reset to 0 for all users!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* AdMob App ID & Unit IDs Form */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Smartphone className="w-4 h-4 text-pink-400" /> Google AdMob App & Unit IDs
        </h3>
        <p className="text-xs text-slate-400">
          Input your Google AdMob official App ID and Ad Unit IDs for Android build integration:
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Google AdMob App ID</label>
            <input
              type="text"
              value={adsState.adMobAppId}
              onChange={(e) => setAdsState({ ...adsState, adMobAppId: e.target.value })}
              placeholder="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Google AdSense Publisher ID (Web Verification)</label>
            <input
              type="text"
              value={adsState.adSensePublisherId || ''}
              onChange={(e) => setAdsState({ ...adsState, adSensePublisherId: e.target.value })}
              placeholder="ca-pub-5869373074081897"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-pink-500"
            />
            <p className="text-[10px] text-emerald-400 mt-1 font-mono">
              ✅ Integrated in index.html head script for roxyefollow.app site verification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Banner Ad Unit ID</label>
              <input
                type="text"
                value={adsState.bannerAdId}
                onChange={(e) => setAdsState({ ...adsState, bannerAdId: e.target.value })}
                placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Interstitial Ad Unit ID</label>
              <input
                type="text"
                value={adsState.interstitialAdId}
                onChange={(e) => setAdsState({ ...adsState, interstitialAdId: e.target.value })}
                placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rewarded Video Ad Unit ID</label>
              <input
                type="text"
                value={adsState.rewardedAdId}
                onChange={(e) => setAdsState({ ...adsState, rewardedAdId: e.target.value })}
                placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
