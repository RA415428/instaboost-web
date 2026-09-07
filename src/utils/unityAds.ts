import { registerPlugin } from '@capacitor/core';

interface UnityAdsPlugin {
  showRewarded: () => Promise<{ completed: boolean; error?: string }>;
  showInterstitial: () => Promise<void>;
}

const UnityAdsNative = registerPlugin<UnityAdsPlugin>('UnityRewarded');

let lastInterstitialShown = 0;

export async function showUnityRewardedAd(): Promise<boolean> {
  try {
    const res = await UnityAdsNative.showRewarded();
    return res && res.completed === true;
  } catch (err) {
    console.error("Unity Rewarded failed:", err);
    return false;
  }
}

export async function showUnityInterstitialAd(): Promise<boolean> {
  const now = Date.now();
  if (now - lastInterstitialShown < 15000) {
    return false;
  }
  lastInterstitialShown = now;
  try {
    await UnityAdsNative.showInterstitial();
    return true;
  } catch (err) {
    console.error("Unity Interstitial failed:", err);
    return false;
  }
}
