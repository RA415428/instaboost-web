import React, { useState } from 'react';
import { Coins, Gift, Share2, Video, Trophy, Users, Check, Copy } from 'lucide-react';

interface CoinsScreenProps {
  wallet: any;
  adminConfig: any;
  onOpenAdModal: () => void;
  onRewardClaim?: (coins: number, isBanner?: boolean) => void;
}

export const CoinsScreen: React.FC<CoinsScreenProps> = ({
  wallet,
  adminConfig,
  onOpenAdModal
}) => {
  const [referralInput, setReferralInput] = useState('');
  const [copied, setCopied] = useState(false);

  const coinsPerAd = adminConfig?.ads?.coinsPerRewardAd ?? 10;
  const userReferralCode = wallet?.referralCode || 'INSTA123';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userReferralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 px-3 py-2 max-w-md mx-auto">
      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between">
        <div>
          <p className="text-xs text-yellow-100 font-medium">Total Balance</p>
          <h2 className="text-3xl font-extrabold flex items-center gap-2 mt-1">
            <Coins className="w-8 h-8 text-yellow-200" />
            {wallet?.coins || 0}
          </h2>
        </div>
        <button
          onClick={onOpenAdModal}
          className="bg-white text-yellow-700 font-bold px-4 py-2.5 rounded-xl shadow-md hover:bg-yellow-50 active:scale-95 transition"
        >
          + Earn Coins
        </button>
      </div>

      {/* Watch Ad Task */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Watch Video Ad</h3>
            <p className="text-xs text-slate-400">Earn +{coinsPerAd} Coins per full view</p>
          </div>
        </div>
        <button
          onClick={onOpenAdModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition"
        >
          Watch
        </button>
      </div>

      {/* Unified Refer & Earn Card */}
      <div className="bg-gradient-to-br from-purple-950/90 via-slate-900 to-indigo-950 border border-purple-500/40 rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
          <Users className="w-5 h-5 text-purple-400" />
          <span>Refer & Earn</span>
        </div>
        <p className="text-xs text-slate-300">
          Share your referral code with friends and earn bonus coins for every invite!
        </p>

        <div className="flex items-center justify-between bg-slate-900/80 border border-purple-500/30 rounded-xl p-2.5">
          <span className="font-mono text-sm font-bold text-yellow-400 tracking-wider px-2">
            {userReferralCode}
          </span>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 text-xs bg-purple-600/80 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoinsScreen;
