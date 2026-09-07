package com.instaboost.app;

import android.app.Activity;
import com.capacitor.Plugin;
import com.capacitor.PluginCall;
import com.capacitor.JSObject;
import com.capacitor.annotation.CapacitorPlugin;
import com.capacitor.annotation.PluginMethod;

import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.IUnityAdsLoadListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;
import com.unity3d.ads.UnityAdsShowOptions;

@CapacitorPlugin(name = "UnityRewarded")
public class UnityRewardedPlugin extends Plugin {

    private static final String GAME_ID = "800368206";
    private static final String REWARDED_ID = "Rewarded_Android";
    private static final String INTERSTITIAL_ID = "Interstitial_android";

    @Override
    public void load() {
        Activity activity = getActivity();

        UnityAds.initialize(
            activity,
            GAME_ID,
            false,
            new IUnityAdsInitializationListener() {
                @Override
                public void onInitializationComplete() {}

                @Override
                public void onInitializationFailed(
                        UnityAds.UnityAdsInitializationError error,
                        String message) {}
            }
        );
    }

    @PluginMethod
    public void showRewarded(PluginCall call) {
        Activity activity = getActivity();

        UnityAds.load(REWARDED_ID, new IUnityAdsLoadListener() {
            @Override
            public void onUnityAdsAdLoaded(String placementId) {
                activity.runOnUiThread(() ->
                    UnityAds.show(
                        activity,
                        REWARDED_ID,
                        new UnityAdsShowOptions(),
                        new IUnityAdsShowListener() {
                            @Override
                            public void onUnityAdsShowFailure(
                                    String placementId,
                                    UnityAds.UnityAdsShowError error,
                                    String message) {
                                call.resolve();
                            }

                            @Override
                            public void onUnityAdsShowStart(String placementId) {}

                            @Override
                            public void onUnityAdsShowClick(String placementId) {}

                            @Override
                            public void onUnityAdsShowComplete(
                                    String placementId,
                                    UnityAds.UnityAdsShowCompletionState state) {

                                JSObject result = new JSObject();
                                result.put(
                                    "rewarded",
                                    state == UnityAds.UnityAdsShowCompletionState.COMPLETED
                                );
                                call.resolve(result);
                            }
                        }
                    )
                );
            }

            @Override
            public void onUnityAdsFailedToLoad(
                    String placementId,
                    UnityAds.UnityAdsLoadError error,
                    String message) {
                call.resolve();
            }
        });
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        Activity activity = getActivity();

        UnityAds.load(INTERSTITIAL_ID, new IUnityAdsLoadListener() {
            @Override
            public void onUnityAdsAdLoaded(String placementId) {
                activity.runOnUiThread(() ->
                    UnityAds.show(
                        activity,
                        INTERSTITIAL_ID,
                        new UnityAdsShowOptions(),
                        new IUnityAdsShowListener() {
                            @Override
                            public void onUnityAdsShowFailure(
                                    String placementId,
                                    UnityAds.UnityAdsShowError error,
                                    String message) {
                                call.resolve();
                            }

                            @Override
                            public void onUnityAdsShowStart(String placementId) {}

                            @Override
                            public void onUnityAdsShowClick(String placementId) {}

                            @Override
                            public void onUnityAdsShowComplete(
                                    String placementId,
                                    UnityAds.UnityAdsShowCompletionState state) {
                                call.resolve();
                            }
                        }
                    )
                );
            }

            @Override
            public void onUnityAdsFailedToLoad(
                    String placementId,
                    UnityAds.UnityAdsLoadError error,
                    String message) {
                call.resolve();
            }
        });
    }
}
