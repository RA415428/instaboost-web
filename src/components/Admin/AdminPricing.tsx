import React, { useState } from 'react';
import { 
  DollarSign, 
  Coins, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Package 
} from 'lucide-react';
import { AdminConfig, CoinPackage, PricingSettings } from '../../types';
import { coinPackages as defaultPackages } from '../../data/appData';
import { ServiceIcon } from '../ServiceIcon';

interface AdminPricingProps {
  config: AdminConfig;
  onUpdateConfig: (newConfig: AdminConfig) => void;
}

export const AdminPricing: React.FC<AdminPricingProps> = ({ config, onUpdateConfig }) => {
  const [pricingState, setPricingState] = useState<PricingSettings>(config.pricing);
  const [packagesState, setPackagesState] = useState<CoinPackage[]>(defaultPackages);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Raw string state for fluid typing, clearing (cutting), and decimal input
  const [inputStrings, setInputStrings] = useState({
    coinsPerFollower: config.pricing.coinsPerFollower?.toString() ?? '0.1',
    coinsPerLike: config.pricing.coinsPerLike?.toString() ?? '0.05',
    coinsPerView: config.pricing.coinsPerView?.toString() ?? '0.02',
    coinsPerComment: config.pricing.coinsPerComment?.toString() ?? '0.2',
    coinsPerShare: config.pricing.coinsPerShare?.toString() ?? '0.15',
    dailyCheckinReward: config.pricing.dailyCheckinReward?.toString() ?? '20',
  });

  const prevPricingRef = React.useRef<string>(JSON.stringify(config.pricing));

  React.useEffect(() => {
    const currentKey = JSON.stringify(config.pricing);
    if (currentKey !== prevPricingRef.current) {
      prevPricingRef.current = currentKey;
      setPricingState(config.pricing);
      setInputStrings({
        coinsPerFollower: config.pricing.coinsPerFollower?.toString() ?? '0.1',
        coinsPerLike: config.pricing.coinsPerLike?.toString() ?? '0.05',
        coinsPerView: config.pricing.coinsPerView?.toString() ?? '0.02',
        coinsPerComment: config.pricing.coinsPerComment?.toString() ?? '0.2',
        coinsPerShare: config.pricing.coinsPerShare?.toString() ?? '0.15',
        dailyCheckinReward: config.pricing.dailyCheckinReward?.toString() ?? '20',
      });
    }
  }, [config.pricing]);

  const handleSave = () => {
    const parseVal = (str: string, fallback: number) => {
      const num = parseFloat(str);
      return !isNaN(num) && num >= 0 ? num : fallback;
    };

    const finalPricing: PricingSettings = {
      coinsPerFollower: parseVal(inputStrings.coinsPerFollower, 0.1),
      coinsPerLike: parseVal(inputStrings.coinsPerLike, 0.05),
      coinsPerView: parseVal(inputStrings.coinsPerView, 0.02),
      coinsPerComment: parseVal(inputStrings.coinsPerComment, 0.2),
      coinsPerShare: parseVal(inputStrings.coinsPerShare, 0.15),
      dailyCheckinReward: parseVal(inputStrings.dailyCheckinReward, 20),
    };

    const newConfig = {
      ...config,
      pricing: finalPricing,
      lastUpdated: Date.now()
    };

    prevPricingRef.current = JSON.stringify(finalPricing);
    onUpdateConfig(newConfig);
    setPricingState(finalPricing);
    setInputStrings({
      coinsPerFollower: finalPricing.coinsPerFollower.toString(),
      coinsPerLike: finalPricing.coinsPerLike.toString(),
      coinsPerView: finalPricing.coinsPerView.toString(),
      coinsPerComment: finalPricing.coinsPerComment.toString(),
      coinsPerShare: finalPricing.coinsPerShare.toString(),
      dailyCheckinReward: finalPricing.dailyCheckinReward.toString(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const updatePackagePrice = (id: string, newPriceNum: number, newCoins: number) => {
    setPackagesState(
      packagesState.map((pkg) =>
        pkg.id === id
          ? {
              ...pkg,
              coins: newCoins,
              priceNum: newPriceNum,
              priceINR: `₹${newPriceNum.toFixed(2)}`
            }
          : pkg
      )
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/40 via-slate-900 to-yellow-900/40 border border-amber-500/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded uppercase tracking-wide">
              App Pricing & Service Rates
            </span>
            <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Live Pricing Adjuster
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">Services Coin Rates & Packages Pricing</h2>
          <p className="text-xs text-slate-300">
            Adjust how many coins are spent per Instagram follower/like/view and edit coin store purchase prices.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-pink-500 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Save Pricing Settings
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Pricing rates updated live across the entire application!</span>
        </div>
      )}

      {/* Service Coin Rates Grid */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Coins className="w-4 h-4 text-amber-400" /> Instagram Service Rates (Coins per Unit)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Follower */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
              <ServiceIcon serviceId="followers" size="sm" />
              <span>Instagram Followers</span>
            </span>
            <label className="block text-[11px] text-slate-400">Coins per 1 Follower</label>
            <input
              type="text"
              inputMode="decimal"
              value={inputStrings.coinsPerFollower}
              onChange={(e) => setInputStrings({ ...inputStrings, coinsPerFollower: e.target.value })}
              placeholder="e.g. 0.1, 0.05, 1"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-500">100 Followers = {((parseFloat(inputStrings.coinsPerFollower) || 0) * 100).toFixed(1)} Coins</p>
          </div>

          {/* Like */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-pink-400 flex items-center gap-2">
              <ServiceIcon serviceId="likes" size="sm" />
              <span>Instagram Likes</span>
            </span>
            <label className="block text-[11px] text-slate-400">Coins per 1 Like</label>
            <input
              type="text"
              inputMode="decimal"
              value={inputStrings.coinsPerLike}
              onChange={(e) => setInputStrings({ ...inputStrings, coinsPerLike: e.target.value })}
              placeholder="e.g. 0.05, 0.1"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-bold text-pink-400 focus:outline-none focus:border-pink-500"
            />
            <p className="text-[10px] text-slate-500">100 Likes = {((parseFloat(inputStrings.coinsPerLike) || 0) * 100).toFixed(1)} Coins</p>
          </div>

          {/* Views */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-purple-400 flex items-center gap-2">
              <ServiceIcon serviceId="views" size="sm" />
              <span>Reels Views</span>
            </span>
            <label className="block text-[11px] text-slate-400">Coins per 1 View</label>
            <input
              type="text"
              inputMode="decimal"
              value={inputStrings.coinsPerView}
              onChange={(e) => setInputStrings({ ...inputStrings, coinsPerView: e.target.value })}
              placeholder="e.g. 0.02, 0.01"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-bold text-purple-400 focus:outline-none focus:border-purple-500"
            />
            <p className="text-[10px] text-slate-500">500 Views = {((parseFloat(inputStrings.coinsPerView) || 0) * 500).toFixed(1)} Coins</p>
          </div>

          {/* Comments */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-2">
              <ServiceIcon serviceId="comments" size="sm" />
              <span>Custom Comments</span>
            </span>
            <label className="block text-[11px] text-slate-400">Coins per 1 Comment</label>
            <input
              type="text"
              inputMode="decimal"
              value={inputStrings.coinsPerComment}
              onChange={(e) => setInputStrings({ ...inputStrings, coinsPerComment: e.target.value })}
              placeholder="e.g. 0.2, 0.5"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-bold text-blue-400 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[10px] text-slate-500">10 Comments = {((parseFloat(inputStrings.coinsPerComment) || 0) * 10).toFixed(1)} Coins</p>
          </div>

          {/* Shares */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <ServiceIcon serviceId="shares" size="sm" />
              <span>Reels Shares</span>
            </span>
            <label className="block text-[11px] text-slate-400">Coins per 1 Share</label>
            <input
              type="text"
              inputMode="decimal"
              value={inputStrings.coinsPerShare}
              onChange={(e) => setInputStrings({ ...inputStrings, coinsPerShare: e.target.value })}
              placeholder="e.g. 0.15, 0.1"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500">20 Shares = {((parseFloat(inputStrings.coinsPerShare) || 0) * 20).toFixed(1)} Coins</p>
          </div>

          {/* Daily Checkin Bonus */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">🎁 Daily Checkin Reward</span>
            <label className="block text-[11px] text-slate-400">Free Coins Given Daily</label>
            <input
              type="text"
              inputMode="decimal"
              value={inputStrings.dailyCheckinReward}
              onChange={(e) => setInputStrings({ ...inputStrings, dailyCheckinReward: e.target.value })}
              placeholder="e.g. 20"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-bold text-yellow-400 focus:outline-none focus:border-yellow-500"
            />
            <p className="text-[10px] text-slate-500">Rewarding active daily app users</p>
          </div>
        </div>
      </div>

      {/* Coin Store Packages */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Package className="w-4 h-4 text-purple-400" /> Coin Purchase Store Packages (INR)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {packagesState.map((pkg) => (
            <div key={pkg.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">{pkg.coins} Coins</span>
                {pkg.badge && (
                  <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-[10px] font-bold rounded">
                    {pkg.badge}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Coins Amount</label>
                  <input
                    type="number"
                    value={pkg.coins || ''}
                    onChange={(e) => updatePackagePrice(pkg.id, pkg.priceNum, parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-white text-xs font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Price (INR ₹)</label>
                  <input
                    type="number"
                    value={pkg.priceNum || ''}
                    onChange={(e) => updatePackagePrice(pkg.id, parseFloat(e.target.value) || 0, pkg.coins)}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-amber-400 text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
