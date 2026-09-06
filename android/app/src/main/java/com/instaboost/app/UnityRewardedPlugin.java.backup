package com.instaboost.app;

import android.app.Activity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.IUnityAdsLoadListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;
import com.unity3d.ads.UnityAdsShowOptions;

@CapacitorPlugin(name = "UnityRewarded")
public class UnityRewardedPlugin extends Plugin {

    private static final String GAME_ID = "800368206";
    private static final String AD_UNIT_ID = "Rewarded_Android";
    private boolean initialized = false;
    private boolean showing = false;

    @PluginMethod
    public void showRewarded(PluginCall call) {
        Activity activity = getActivity();

        if (activity == null) {
            call.reject("Activity unavailable");
            return;
        }

        if (showing) {
            call.reject("Ad already showing");
            return;
        }

        if (initialized) {
            loadAndShow(activity, call);
            return;
        }

        UnityAds.initialize(
            activity,
            GAME_ID,
            true,
            new IUnityAdsInitializationListener() {
                @Override
                public void onInitializationComplete() {
                    initialized = true;
                    loadAndShow(activity, call);
                }

                @Override
                public void onInitializationFailed(
                    UnityAds.UnityAdsInitializationError error,
                    String message
                ) {
                    call.reject("Unity initialization failed: " + message);
                }
            }
        );
    }

    private void loadAndShow(Activity activity, PluginCall call) {
        UnityAds.load(
            AD_UNIT_ID,
            new IUnityAdsLoadListener() {
                @Override
                public void onUnityAdsAdLoaded(String placementId) {
                    showing = true;

                    activity.runOnUiThread(() ->
                        UnityAds.show(
                            activity,
                            AD_UNIT_ID,
                            new UnityAdsShowOptions(),
                            new IUnityAdsShowListener() {

                                @Override
                                public void onUnityAdsShowFailure(
                                    String placementId,
                                    UnityAds.UnityAdsShowError error,
                                    String message
                                ) {
                                    showing = false;
                                    call.reject("Ad failed: " + message);
                                }

                                @Override
                                public void onUnityAdsShowStart(String placementId) {
                                }

                                @Override
                                public void onUnityAdsShowClick(String placementId) {
                                }

                                @Override
                                public void onUnityAdsShowComplete(
                                    String placementId,
                                    UnityAds.UnityAdsShowCompletionState state
                                ) {
                                    showing = false;

                                    if (state ==
                                        UnityAds.UnityAdsShowCompletionState.COMPLETED) {

                                        JSObject result = new JSObject();
                                        result.put("rewarded", true);
                                        result.put("adUnitId", AD_UNIT_ID);

                                        notifyListeners("rewarded", result);
                                        call.resolve(result);
                                    } else {
                                        call.reject("Ad not completed");
                                    }
                                }
                            }
                        )
                    );
                }

                @Override
                public void onUnityAdsFailedToLoad(
                    String placementId,
                    UnityAds.UnityAdsLoadError error,
                    String message
                ) {
                    showing = false;
                    call.reject("Ad could not load: " + message);
                }
            }
        );
    }
}
