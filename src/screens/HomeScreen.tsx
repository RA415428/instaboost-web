import React, { useState, useMemo } from 'react';
import { ShoppingBag, Link as LinkIcon, Coins, ArrowRight, Sparkles, CheckCircle2, Info, Plus } from 'lucide-react';
import { ServiceOption, UserWallet, Order, PricingSettings, AdminConfig } from '../types';
import { ServiceIcon } from '../components/ServiceIcon';
import { AdBanner } from '../components/AdBanner';
import { NativeAd } from '../components/NativeAd';
import { SocialBarAd } from '../components/SocialBarAd';
import { formatCoins } from '../utils/format';

interface HomeScreenProps {
  wallet: UserWallet;
  pricing?: PricingSettings;
  adminConfig?: AdminConfig;
  onOpenAdModal?: () => void;
  onPlaceOrder: (order: Order) => void;
  onOpenCoins: () => void;
  onShowToast: (msg: string) => void;
}

const getDynamicServices = (pricing?: PricingSettings): ServiceOption[] => {
  const p = pricing || {
    coinsPerFollower: 0.1,
    coinsPerLike: 0.05,
    coinsPerView: 0.02,
    coinsPerComment: 0.2,
    coinsPerShare: 0.15,
    dailyCheckinReward: 20
  };

  return [
    {
      id: 'followers',
      name: 'Instagram Followers',
      icon: 'followers',
      coinsPerUnit: p.coinsPerFollower ?? 0.1,
      minQuantity: 50,
      maxQuantity: 10000,
      description: 'High quality real-looking Instagram profiles with profile photos.'
    },
    {
      id: 'likes',
      name: 'Instagram Likes',
      icon: 'likes',
      coinsPerUnit: p.coinsPerLike ?? 0.05,
      minQuantity: 100,
      maxQuantity: 50000,
      description: 'Instant engagement boost for your posts and reels.'
    },
    {
      id: 'views',
      name: 'Reels Views',
      icon: 'views',
      coinsPerUnit: p.coinsPerView ?? 0.02,
      minQuantity: 500,
      maxQuantity: 100000,
      description: 'Help your Reels reach the Explore Page algorithm.'
    },
    {
      id: 'comments',
      name: 'Custom Comments',
      icon: 'comments',
      coinsPerUnit: p.coinsPerComment ?? 0.2,
      minQuantity: 10,
      maxQuantity: 500,
      description: 'Relevant custom comments from targeted accounts.'
    },
    {
      id: 'shares',
      name: 'Reels Shares & Boost',
      icon: 'shares',
      coinsPerUnit: p.coinsPerShare ?? 0.15,
      minQuantity: 20,
      maxQuantity: 5000,
      description: 'Virality trigger shares and direct save boosts.'
    }
  ];
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  wallet,
  pricing,
  adminConfig,
  onOpenAdModal,
  onPlaceOrder,
  onOpenCoins,
  onShowToast
}) => {
  const services = useMemo(() => getDynamicServices(pricing), [pricing]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('followers');
  const [targetUrl, setTargetUrl] = useState('');
  const [quantity, setQuantity] = useState(100);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  // Calculate required coins dynamically with exact decimal precision
  const requiredCoins = Math.round(quantity * selectedService.coinsPerUnit * 100) / 100;
  const hasEnoughCoins = wallet.coins >= requiredCoins;

  const handlePresetQuantity = (preset: number) => {
    setQuantity(preset);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setTargetUrl(text);
        onShowToast('Link pasted from clipboard!');
      }
    } catch (err) {
      onShowToast('Enter your Instagram post or profile link manually');
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedUrl = targetUrl.trim();
    if (!cleanedUrl) {
      onShowToast('Please enter valid URL');
      return;
    }

    // Check if valid Instagram URL (Posts, Reels, Stories, IGTV, Profile) or Username
    const lowerUrl = cleanedUrl.toLowerCase();
    const isValidInstagram =
      cleanedUrl.startsWith('@') ||
      lowerUrl.includes('instagram.com') ||
      lowerUrl.includes('instagr.am') ||
      /^(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\/(p|reel|reels|tv|stories|[a-zA-Z0-9_.-]+)/i.test(cleanedUrl);

    if (!isValidInstagram) {
      onShowToast('Please enter valid URL');
      return;
    }

    if (!hasEnoughCoins) {
      onShowToast(`You need ${formatCoins(requiredCoins)} coins. You have ${formatCoins(wallet.coins)} coins.`);
      onOpenCoins();
      return;
    }

    let finalUrl = cleanedUrl;
    if (cleanedUrl.startsWith('@')) {
      finalUrl = `https://instagram.com/${cleanedUrl.slice(1)}`;
    } else if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
      finalUrl = `https://${cleanedUrl}`;
    }

    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 899)}`,
      userMemberId: wallet.memberId,
      serviceType: selectedService.name,
      targetUrl: finalUrl,
      quantity,
      coinsSpent: requiredCoins,
      status: 'IN_PROGRESS',
      dateFormatted: new Date().toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    onPlaceOrder(newOrder);
    setTargetUrl('');
  };

  return (
    <div className="space-y-4 pb-20 pt-2 px-4 max-w-md mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 rounded-2xl p-4 text-white shadow-xl shadow-pink-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-200">Instant Engagement Engine</span>
        </div>
        <h2 className="text-lg font-black leading-tight">
          Boost Instagram Reach & Virality
        </h2>
        <p className="text-xs text-white/80 mt-1 font-medium">
          Select service, enter link & convert virtual coins to real interactions!
        </p>
      </div>

      {/* Social Bar Ad - Right below Boost Instagram Reach & Virality */}
      <SocialBarAd
        customText="Claim Free Bonus Coins & Instant Boost!"
        wallet={wallet}
        adminConfig={adminConfig}
        onOpenAdModal={onOpenAdModal}
      />

      {/* Service Option Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />
          1. Select Engagement Service
        </label>

        <div className="grid grid-cols-2 gap-2">
          {services.map((svc) => {
            const isSelected = selectedService.id === svc.id;
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => {
                  setSelectedServiceId(svc.id);
                  setQuantity(svc.minQuantity);
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 ${
                  isSelected
                    ? 'border-pink-500 bg-pink-500/10 text-white shadow-md shadow-pink-500/10'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <ServiceIcon serviceId={svc.id} size="md" />
                  <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {svc.coinsPerUnit} Coin/ea
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-100">{svc.name}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{svc.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Native Sponsored Banner Ad */}
      <div className="rounded-xl border border-purple-500/20 bg-slate-900/80 p-2 shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
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

      {/* Clean Sponsored Horizontal Banner Ad */}
      <div className="rounded-xl border border-purple-500/20 bg-slate-900/80 p-2 shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex items-center justify-between w-full px-1 mb-1">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Sponsored Ad
          </span>
          <span className="text-[9px] font-bold text-slate-500">Adsterra Banner</span>
        </div>
        <AdBanner className="my-0" />
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmitOrder} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        {/* URL Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
              2. Target Instagram Link / Username
            </label>
            <button
              type="button"
              onClick={handlePaste}
              className="text-[10px] font-bold text-pink-400 hover:text-pink-300 underline"
            >
              Paste Link
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://instagram.com/reel/... or @username"
              className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 text-slate-100 text-xs rounded-xl px-3.5 py-3 pr-10 focus:outline-none transition-colors"
            />
            {targetUrl && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-3.5" />
            )}
          </div>
          <p className="text-[10px] text-slate-500">
            Paste Post link, Reels URL or Profile link. Password is NEVER required.
          </p>
        </div>

        {/* Quantity Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">
              3. Quantity: <span className="text-pink-400 font-extrabold text-sm font-mono">{quantity.toLocaleString()}</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              Min: {selectedService.minQuantity} | Max: {selectedService.maxQuantity.toLocaleString()}
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[50, 100, 250, 500, 1000, 2500, 5000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetQuantity(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 font-mono ${
                  quantity === preset
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Slider */}
          <input
            type="range"
            min={selectedService.minQuantity}
            max={Math.min(selectedService.maxQuantity, 5000)}
            step={10}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>

        {/* Cost Summary Box */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Coins Required:</span>
            <span className="font-mono font-extrabold text-amber-300 text-sm flex items-center gap-1">
              <Coins className="w-4 h-4 text-amber-400" />
              {formatCoins(requiredCoins)} Coins
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Your Wallet Balance:</span>
            <span className={`font-mono font-bold text-xs ${hasEnoughCoins ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCoins(wallet.coins)} Coins
            </span>
          </div>

          {!hasEnoughCoins && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Need {formatCoins(Math.round((requiredCoins - wallet.coins) * 100) / 100)} more coins</span>
              </div>
              <button
                type="button"
                onClick={onOpenCoins}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3" /> Get Coins Free
              </button>
            </div>
          )}
        </div>

        {/* Submit Order Button */}
        <button
          type="submit"
          id="place-order-submit-btn"
          className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-opacity duration-200 active:opacity-80 ${
            hasEnoughCoins
              ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-90 text-white shadow-pink-500/20'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          {hasEnoughCoins ? `Confirm Order (${formatCoins(requiredCoins)} Coins)` : 'Get Coins to Order'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
