import { registerPlugin } from '@capacitor/core';

const UnityInterstitial = registerPlugin<{
  showInterstitial: () => Promise<void>;
}>('UnityRewarded');

let lastShown = 0;

export async function showUnityInterstitial() {
  const now = Date.now();

  if (now - lastShown < 15000) return;

  lastShown = now;

  try {
    await UnityInterstitial.showInterstitial();
  } catch {}
}
