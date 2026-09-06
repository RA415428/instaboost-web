import React, { useEffect, useState } from 'react';
import { registerPlugin } from '@capacitor/core';

const UnityRewarded = registerPlugin<{
  showRewarded: () => Promise<{ rewarded?: boolean }>;
}>('UnityRewarded');

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaim?: (coins: number) => void;
  rewardCoins?: number;
  adProvider?: string;
  adUnitId?: string;
  isAutoTimerAd?: boolean;
  smartlinkUrl?: string;
}

const AdModal: React.FC<AdModalProps> = ({
  isOpen,
  onClose,
  onRewardClaim,
  rewardCoins = 50,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      setMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWatchAd = async () => {
    if (loading) return;

    setLoading(true);
    setMessage('Loading rewarded ad...');

    try {
      const result = await UnityRewarded.showRewarded();

      if (result?.rewarded === true) {
        onRewardClaim?.(rewardCoins);
        setMessage(`+${rewardCoins} coins added!`);

        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setMessage('Ad was not completed.');
      }
    } catch (error) {
      console.error('Unity rewarded ad error:', error);
      setMessage('Ad is not available right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Watch Ad & Earn Coins
          </h2>

          <p className="mb-6 text-gray-600">
            Complete the rewarded video to receive your coins.
          </p>

          {message && (
            <p className="mb-4 text-sm font-medium text-gray-700">
              {message}
            </p>
          )}

          <button
            onClick={handleWatchAd}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:opacity-50"
          >
            {loading ? 'Loading Ad...' : `WATCH AD +${rewardCoins} COINS`}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="mt-3 w-full rounded-xl px-5 py-3 font-medium text-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export { AdModal };
export default AdModal;
