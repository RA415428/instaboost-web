import React from 'react';

export interface AdBannerProps {
  id?: string;
  className?: string;
  rewardCoins?: number;
  smartlinkUrl?: string;
  onRewardClaim?: (coins?: any) => void;
  [key: string]: any;
}

export const AdBanner: React.FC<AdBannerProps> = () => {
  return null;
};

export default AdBanner;
