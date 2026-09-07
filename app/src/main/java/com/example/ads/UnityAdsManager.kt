package com.example.ads

import android.app.Activity
import android.content.Context
import com.unity3d.ads.IUnityAdsInitializationListener
import com.unity3d.ads.IUnityAdsLoadListener
import com.unity3d.ads.IUnityAdsShowListener
import com.unity3d.ads.UnityAds
import com.unity3d.ads.UnityAdsShowOptions

object UnityAdsManager {

    private const val GAME_ID = "800368206"
    private const val REWARDED_ID = "Rewarded_Android"
    private const val INTERSTITIAL_ID = "Interstitial_Android"

    private var initialized = false
    private var rewardedLoaded = false
    private var interstitialLoaded = false

    fun initialize(context: Context) {
        if (initialized) return

        UnityAds.initialize(
            context,
            GAME_ID,
            false,
            object : IUnityAdsInitializationListener {
                override fun onInitializationComplete() {
                    initialized = true
                    loadRewarded()
                    loadInterstitial()
                }

                override fun onInitializationFailed(
                    error: UnityAds.UnityAdsInitializationError?,
                    message: String?
                ) {
                    initialized = false
                }
            }
        )
    }

    fun loadRewarded() {
        if (!initialized) return

        UnityAds.load(
            REWARDED_ID,
            object : IUnityAdsLoadListener {
                override fun onUnityAdsAdLoaded(placementId: String?) {
                    rewardedLoaded = true
                }

                override fun onUnityAdsFailedToLoad(
                    placementId: String?,
                    error: UnityAds.UnityAdsLoadError?,
                    message: String?
                ) {
                    rewardedLoaded = false
                }
            }
        )
    }

    fun showRewarded(
        activity: Activity,
        onCompleted: () -> Unit,
        onFailed: () -> Unit
    ) {
        if (!initialized || !rewardedLoaded) {
            loadRewarded()
            onFailed()
            return
        }

        rewardedLoaded = false

        UnityAds.show(
            activity,
            REWARDED_ID,
            UnityAdsShowOptions(),
            object : IUnityAdsShowListener {
                override fun onUnityAdsShowFailure(
                    placementId: String?,
                    error: UnityAds.UnityAdsShowError?,
                    message: String?
                ) {
                    loadRewarded()
                    onFailed()
                }

                override fun onUnityAdsShowStart(placementId: String?) {}

                override fun onUnityAdsShowClick(placementId: String?) {}

                override fun onUnityAdsShowComplete(
                    placementId: String?,
                    state: UnityAds.UnityAdsShowCompletionState?
                ) {
                    loadRewarded()

                    if (state == UnityAds.UnityAdsShowCompletionState.COMPLETED) {
                        onCompleted()
                    }
                }
            }
        )
    }

    fun loadInterstitial() {
        if (!initialized) return

        UnityAds.load(
            INTERSTITIAL_ID,
            object : IUnityAdsLoadListener {
                override fun onUnityAdsAdLoaded(placementId: String?) {
                    interstitialLoaded = true
                }

                override fun onUnityAdsFailedToLoad(
                    placementId: String?,
                    error: UnityAds.UnityAdsLoadError?,
                    message: String?
                ) {
                    interstitialLoaded = false
                }
            }
        )
    }

    fun showInterstitial(activity: Activity) {
        if (!initialized || !interstitialLoaded) {
            loadInterstitial()
            return
        }

        interstitialLoaded = false

        UnityAds.show(
            activity,
            INTERSTITIAL_ID,
            UnityAdsShowOptions(),
            object : IUnityAdsShowListener {
                override fun onUnityAdsShowFailure(
                    placementId: String?,
                    error: UnityAds.UnityAdsShowError?,
                    message: String?
                ) {
                    loadInterstitial()
                }

                override fun onUnityAdsShowStart(placementId: String?) {}

                override fun onUnityAdsShowClick(placementId: String?) {}

                override fun onUnityAdsShowComplete(
                    placementId: String?,
                    state: UnityAds.UnityAdsShowCompletionState?
                ) {
                    loadInterstitial()
                }
            }
        )
    }
}
