package com.example.ads

import android.app.Activity
import android.content.Context
import com.unity3d.ads.IUnityAdsInitializationListener
import com.unity3d.ads.IUnityAdsLoadListener
import com.unity3d.ads.IUnityAdsShowListener
import com.unity3d.ads.UnityAds

object UnityAdsManager {

    private const val GAME_ID = "800368206"
    private const val TEST_MODE = false

    private const val REWARDED = "Rewarded_Android"
    private const val INTERSTITIAL = "Interstitial_Android"

    private var initialized = false
    private var initializing = false

    private var showing = false

    private var rewardedLoading = false
    private var rewardedBusy = false

    private var pendingRewarded: (() -> Unit)? = null
    private var pendingRewardedFailed: (() -> Unit)? = null
    private var pendingRewardedActivity: Activity? = null

    private var interstitialLoading = false
    private var interstitialBusy = false
    private var pendingInterstitialActivity: Activity? = null

    fun initialize(context: Context) {
        if (initialized || initializing) return

        initializing = true

        UnityAds.initialize(
            context.applicationContext,
            GAME_ID,
            TEST_MODE,
            object : IUnityAdsInitializationListener {

                override fun onInitializationComplete() {
                      initializing = false
                      initialized = true

                      if (rewardedBusy && pendingRewardedActivity != null) {
                          if (UnityAds.isReady(REWARDED)) {
                              showRewardedNow()
                          } else {
                              loadRewarded()
                          }
                      } else {
                          loadRewarded()
                      }

                      if (interstitialBusy && pendingInterstitialActivity != null) {
                          if (UnityAds.isReady(INTERSTITIAL)) {
                              showInterstitialNow()
                          } else {
                              loadInterstitial()
                          }
                      } else {
                          loadInterstitial()
                      }
                  }

                override fun onInitializationFailed(
                    error: UnityAds.UnityAdsInitializationError,
                    message: String
                ) {
                    initializing = false
                    initialized = false
                    failRewarded()
                    interstitialBusy = false
                    pendingInterstitialActivity = null
                }
            }
        )
    }

    fun isAdShowing(): Boolean = showing

    fun isRewardedBusy(): Boolean = rewardedBusy

    fun showRewarded(
        activity: Activity,
        onCompleted: () -> Unit,
        onFailed: () -> Unit
    ) {
        if (rewardedBusy) {
            onFailed()
            return
        }

        rewardedBusy = true
        pendingRewarded = onCompleted
        pendingRewardedFailed = onFailed
        pendingRewardedActivity = activity

        if (!initialized) {
            initialize(activity)
            return
        }

        if (UnityAds.isReady(REWARDED)) {
            showRewardedNow()
        } else {
            loadRewarded()
        }
    }

    private fun loadRewarded() {
        if (!initialized || rewardedLoading) return

        rewardedLoading = true

        UnityAds.load(
            REWARDED,
            object : IUnityAdsLoadListener {

                override fun onUnityAdsAdLoaded(placementId: String) {
                    rewardedLoading = false

                    if (rewardedBusy && pendingRewardedActivity != null) {
                        showRewardedNow()
                    }
                }

                override fun onUnityAdsFailedToLoad(
                    placementId: String,
                    error: UnityAds.UnityAdsLoadError,
                    message: String
                ) {
                    rewardedLoading = false
                    failRewarded()
                }
            }
        )
    }

    private fun showRewardedNow() {
        val activity = pendingRewardedActivity ?: run {
            failRewarded()
            return
        }

        val completed = pendingRewarded ?: run {
            failRewarded()
            return
        }

        val failed = pendingRewardedFailed ?: {
            failRewarded()
            return
        }

        if (activity.isFinishing || activity.isDestroyed) {
            failRewarded()
            return
        }

        showing = true

        UnityAds.show(
            activity,
            REWARDED,
            object : IUnityAdsShowListener {

                override fun onUnityAdsShowComplete(
                    placementId: String,
                    state: UnityAds.UnityAdsShowCompletionState
                ) {
                    showing = false

                    pendingRewarded = null
                    pendingRewardedFailed = null
                    pendingRewardedActivity = null
                    rewardedBusy = false

                    if (state == UnityAds.UnityAdsShowCompletionState.COMPLETED) {
                        completed()
                    } else {
                        failed()
                    }

                    loadRewarded()
                }

                override fun onUnityAdsShowFailure(
                    placementId: String,
                    error: UnityAds.UnityAdsShowError,
                    message: String
                ) {
                    showing = false
                    failRewarded()
                    loadRewarded()
                }

                override fun onUnityAdsShowStart(placementId: String) = Unit

                override fun onUnityAdsShowClick(placementId: String) = Unit
            }
        )
    }

    private fun failRewarded() {
        val failed = pendingRewardedFailed

        pendingRewarded = null
        pendingRewardedFailed = null
        pendingRewardedActivity = null
        rewardedBusy = false

        failed?.invoke()
    }

    fun showInterstitial(activity: Activity) {
        if (showing || interstitialBusy) return

        interstitialBusy = true
        pendingInterstitialActivity = activity

        if (!initialized) {
            initialize(activity)
            return
        }

        if (UnityAds.isReady(INTERSTITIAL)) {
            showInterstitialNow()
        } else {
            loadInterstitial()
        }
    }

    private fun loadInterstitial() {
        if (!initialized || interstitialLoading) return

        interstitialLoading = true

        UnityAds.load(
            INTERSTITIAL,
            object : IUnityAdsLoadListener {

                override fun onUnityAdsAdLoaded(placementId: String) {
                    interstitialLoading = false

                    if (interstitialBusy && pendingInterstitialActivity != null) {
                        showInterstitialNow()
                    }
                }

                override fun onUnityAdsFailedToLoad(
                    placementId: String,
                    error: UnityAds.UnityAdsLoadError,
                    message: String
                ) {
                    interstitialLoading = false
                    interstitialBusy = false
                    pendingInterstitialActivity = null
                }
            }
        )
    }

    private fun showInterstitialNow() {
        val activity = pendingInterstitialActivity ?: run {
            interstitialBusy = false
            return
        }

        if (activity.isFinishing || activity.isDestroyed) {
            interstitialBusy = false
            pendingInterstitialActivity = null
            return
        }

        pendingInterstitialActivity = null
        showing = true

        UnityAds.show(
            activity,
            INTERSTITIAL,
            object : IUnityAdsShowListener {

                override fun onUnityAdsShowComplete(
                    placementId: String,
                    state: UnityAds.UnityAdsShowCompletionState
                ) {
                    showing = false
                    interstitialBusy = false
                    loadInterstitial()
                }

                override fun onUnityAdsShowFailure(
                    placementId: String,
                    error: UnityAds.UnityAdsShowError,
                    message: String
                ) {
                    showing = false
                    interstitialBusy = false
                    loadInterstitial()
                }

                override fun onUnityAdsShowStart(placementId: String) = Unit

                override fun onUnityAdsShowClick(placementId: String) = Unit
            }
        )
    }
}
