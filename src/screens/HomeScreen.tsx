import React from 'react';

interface HomeScreenProps {
  wallet: any;
  adminConfig: any;
  onOpenAdModal: () => void;
  onRewardClaim?: (coins: number, isBanner?: boolean) => void;
  [key: string]: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  wallet,
  adminConfig,
  onOpenAdModal
}) => {
  return (
    <div className="space-y-4 px-3 py-2 max-w-md mx-auto">
      <div className="bg-slate-800 rounded-2xl p-4 text-white text-center shadow-lg">
        <h2 className="text-xl font-bold">Welcome to InstaBoost</h2>
        <p className="text-xs text-slate-300 mt-1">Boost your social engagement easily</p>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white text-sm">Earn Coins</h3>
          <p className="text-xs text-slate-400">Watch Unity rewarded ads to gain coins</p>
        </div>
        <button
          onClick={onOpenAdModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition"
        >
          Watch Ad
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
